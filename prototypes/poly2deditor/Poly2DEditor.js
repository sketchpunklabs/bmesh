
/*
- Modes
--- Point selection & ops
--- Edge selection & ops

- Pools, Pnts + Edges


*/

import SvgPolygon    from './data/SvgPolygon.js';
import Transform2D  from './maths/Transform2D.js';
import GridLayer    from './layers/GridLayer.js';
import ImageLayer   from './layers/ImageLayer.js';
import SvgLayer     from './layers/SvgLayer.js';

import PointPool    from './PointPool.js';
import LinePool     from './LinePool.js';
import ManagePolyOp from './ops/ManagePolyOp.js';
import EditPointsOp from './ops/EditPointsOp.js';
import EditLinesOp  from './ops/EditLinesOp.js';
import AddPointOp   from './ops/AddPointOp.js';

export default class Poly2DEditor{
    // #region MAIN
    polygons        = {};                   // Active polygons for editing
    layers          = {};                   // Various layers used by the editor
    transform       = new Transform2D();    // Viewport transform
    itransform      = new Transform2D();    // Inverted for XY coord conversion
    elmContainer    = null;                 // Dom Container
    contentSize     = [0,0];                // Size of content area

    polyGroup       = null;
    pointPool       = null;
    linePool        = null;

    selectedPolygon = null;                 // Which polygon to edit.
    dragPointer     = -1;                   // Drag Pointer ID, also an indicator dragging is active
    eventTimeout    = null;                 // Tell the difference between MouseDown + Double Click Events

    stateMachines   = {};
    smStack         = [];

    constructor( id ){
        this.elmContainer   = document.getElementById( id );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Layers
        this.layers.grid    = new GridLayer( this.elmContainer );
        this.layers.image   = new ImageLayer( this.elmContainer );
        this.layers.svg     = new SvgLayer( this.elmContainer );

        this.layers.svg.on( 'pointerdown', this.onPointerDown );
        this.layers.svg.on( 'pointerup', this.onPointerUp );
        this.layers.svg.on( 'pointermove', this.onPointerMove );
        this.layers.svg.on( 'dblclick', this.onDBLClick );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Misc
        this.polyGroup      = this.layers.svg.newGroup( 'grpPoly' );
        this.linePool       = new LinePool( this );
        this.pointPool      = new PointPool( this );
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // State Machines
        this.stateMachines.managePolygon    = new ManagePolyOp( this );
        this.stateMachines.editPoints       = new EditPointsOp( this );
        this.stateMachines.editLines        = new EditLinesOp( this );
        this.stateMachines.addPoint         = new AddPointOp( this );

        this.editOp = 'editPoints';
        
        this.smStack.push( this.stateMachines.managePolygon );
    }
    // #endregion

    // #region VIEWPORT
    setViewportSize( w, h ){
        this.elmContainer.style.width  = w + 'px';
        this.elmContainer.style.height = h + 'px';
        return this;
    }

    setContentSize( w, h ){
        this.contentSize[ 0 ] = w;
        this.contentSize[ 1 ] = h;

        for( const l of Object.values( this.layers ) ){
            l.setContentSize( w, h );
        }

        return this;
    }

    setContentScale(){
        const t = this.transform;
        t.scl = ( t.scl == 1 )? 2 : 1;
        this.updateContentTransform();
    }
    
    setContentRotation(){
        const t = this.transform;
        const s = this.contentSize;

        t.rot   = ( t.rot + 90 ) % 360;

        switch( t.rot ){
            case 0:     
                t.pos[0] = 0;
                t.pos[1] = 0;
                break;
            case 90:    
                t.pos[0] = s[1];
                t.pos[1] = 0;
                break;
            case 180:   
                t.pos[0] = s[0];
                t.pos[1] = s[1];
                break;
            case 270:
                t.pos[0] = 0;
                t.pos[1] = s[0];
                break;
        }

        this.updateContentTransform();
    }

    resetTransform(){
        this.transform.pos[0] = 0;
        this.transform.pos[1] = 0;
        this.transform.scl    = 1;
        this.transform.rot    = 0;
        this.updateContentTransform();
    }

    updateContentTransform(){
        // Invert transform for coordinate transformation
        this.itransform.fromInvert( this.transform );
        
        // Apply transform on all layers
        for( const l of Object.values( this.layers ) ){
            l.setTransform( this.transform );
        }

        // Set content size for each layer
        const size = this.layers.image.getSize();
        for( const k in this.layers ){
            this.layers[ k ].setContentSize( size[0], size[1] );
        }
    }

    transformCoordinates( x, y ){
        const p = [x, y];

        // Extra HACK for how Translate is being used by the layers
        // If Scaling, subtract translation to offset the origin being moved.
        // Then inverse transform should work
        if( this.transform.scl != 1 ){
            p[0] -= this.transform.pos[0];
            p[1] -= this.transform.pos[1];
        }

        // Apply Inverse Transform 
        return this.itransform.applyTo( p );
    }
    // #endregion

    // #region OPS
    addPolygon( pnts ){
        const poly = new SvgPolygon( pnts );
        poly.render();

        this.polygons[ poly.id ] = poly;
        this.polyGroup.appendChild( poly.element );
    }

    selectPolygon( id=null ){
        // Cut short when selecting the selected polygon
        if( this.selectedPolygon && this.selectedPolygon.id === id ) return;

        // Deselect the current polygon
        if( this.selectedPolygon ) this.selectedPolygon.isSelected = false;

        if( id && this.polygons[ id ] ) this.selectedPolygon = this.polygons[ id ];
        else                            this.selectedPolygon = null;

        // Visually select the polygon
        if( this.selectedPolygon ) this.selectedPolygon.isSelected = true;
    }

    addPoint(){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( !this.selectedPolygon ){
            console.log( 'Need to select a polygon to add a point' );
            return;
        }

        if( this.isMachineActive( 'addPoint' ) ){
            console.log( 'Add point operation is currently on the stack' );
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.machinePush( 'addPoint' );
    }

    setEditMode( name ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let altOp;
        switch( name ){
            case 'point':
                this.editOp = 'editPoints';
                altOp       = 'editLines';
                break;

            case 'line':
                this.editOp = 'editLines';
                altOp       = 'editPoints';
                break;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.selectedPolygon ){
            if( this.smStack.length === 1 ){
                this.machinePush ( this.editOp );
            }else if( this.getActiveMachine().name === altOp ){
                this.machineSwitch( this.editOp );
            }
        }
    }

    fetchImage( url, allowPxPicker=false ){
        return new Promise( ( resolve, reject )=>{
            const img        = new Image();
            img.crossOrigin	 = 'anonymous';
            img.onload       = ()=>{ resolve( img ); };
            img.onerror      = ()=>{ reject( 'Error loading object url into image' ); };
            img.src          = url;
        })
        .then( img=>this.loadImage( img, allowPxPicker ) )
        .catch( err=>console.error( err ) );
    }

    loadImage( img, allowPxPicker=false ){
        this.layers.image.loadImage( img, allowPxPicker );
        this.setContentSize( img.width, img.height );
    }

    removeSelected(){
        if( this.smStack.length === 1 ){
            if( !this.selectedPolygon ){
                console.log( 'No polygon selected to delete' );
                return;
            }

            const id = this.selectedPolygon.id;
            if( !this.polygons[ id ] ){
                console.log( 'Polygon ID not found', id );
                return;
            }

            // Remove Element from SVG Document
            const elm    = this.selectedPolygon.element;
            const parent = elm.parentNode;
            parent.removeChild( elm );

            // Remove polygon fronm collection
            delete this.polygons[ id ];
        }else{
            this.getActiveMachine().removeSelected( this );
        }
    }
    // #endregion

    // #region STATE MACHINE
    getActiveMachine(){ return this.smStack[ this.smStack.length - 1 ]; }
    isMachineActive( name ){
        for( let m of this.smStack ){
            if( m.name === name ) return true;
        }

        return false;
    }

    // Push a new machine to the stack
    machinePush( name ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const sm = this.stateMachines[ name ];
        if( !sm ){
            console.error( 'State machine not found: ', name );
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const prev = this.getActiveMachine();
        prev.onSuspend( this );                 // Pause active machine
        sm.onInit( this );                      // Initialize new machine
        this.smStack.push( sm );                // New machine is now the active one
    }

    // Swop top most machine
    machineSwitch( name ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const sm = this.stateMachines[ name ];
        if( !sm ){
            console.error( 'State machine not found: ', name );
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const idx = this.smStack.length - 1;
        this.smStack[ idx ].onRelease( this );   // End existing machine
        sm.onInit( this );                       // Start new machine
        this.smStack[ idx ] = sm;                // Make it the most active
    }

    // Remove top most machine, switch one
    machinePop(){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const idx = this.smStack.length - 1;
        if( idx === 0 ) return;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const sm = this.smStack.pop();
        sm.onRelease( this );                    // End existing machine
        this.smStack[ idx - 1 ].onWakeup( this); // Reactivate previous machine
    }

    // Exit all machines & activate root machine
    machineClear(){
        if( this.smStack.length <= 1 ) return;

        while( this.smStack.length > 1 ){
            this.smStack.pop().onRelease( this );
        }

        this.smStack[0].onWakeup( this );
    }
    // #endregion

    // #region SVG EVENTS
    onPointerUp = (e)=>{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Cancel delayed pointer down if still active
        if( this.eventTimeout ){
            clearTimeout( this.eventTimeout );
            this.eventTimeout = null;
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.getActiveMachine().onPointerUp( e, this );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.dragPointer !== -1 ){
            this.layers.svg.releasePointer( this.dragPointer );
            this.dragPointer = -1;
        }
    };
    
    onPointerDown = (e)=>{    
        // Delay down event to make dblClick event work.
        this.eventTimeout = setTimeout( ()=>this.onPointerDownDelay(e), 120 );
    };

    onPointerDownDelay = (e)=>{
        // console.log( e.layerX, e.layerY, e.target.nodeName, e.detail );
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Pointer down is valid, clear timeout so pointer up will execute
        this.eventTimeout = null;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const coord = this.transformCoordinates( e.layerX, e.layerY );
        const sm    = this.getActiveMachine()

        if( sm.onPointerDown( coord[0], coord[1], e, this ) ){
            // Down will initiate a drag operation
            this.dragPointer = e.pointerId;
        }
    };

    onPointerMove = e=>{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Is a Drag operation in progress?
        if( this.dragPointer !== -1 ){
            this.layers.svg.capturePointer( this.dragPointer );
            e.preventDefault();
            e.stopPropagation();
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const coord = this.transformCoordinates( e.layerX, e.layerY );
        this.getActiveMachine()
            .onPointerMove( coord[0], coord[1], e, this );
    };

    onDBLClick = e=>{        
        switch( e.target.nodeName ){
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'polygon':{
                const id = e.target.getAttributeNS( null, 'id' );

                if( this.selectedPolygon && this.selectedPolygon.id === id ){
                    if( this.smStack.length === 1 ){
                        this.machinePush( this.editOp );
                    }else{
                        this.selectPolygon( null );
                        this.machineClear();
                    }
                }else{ 
                    this.selectPolygon( id );
                    this.machinePush( this.editOp );
                }

                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'svg':
                if( this.selectedPolygon ){
                    this.selectPolygon( null );
                    this.machineClear();
                }
                break;
        }
    };
    // #endregion
}



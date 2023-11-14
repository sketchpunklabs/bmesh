
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
import PolygonMode  from './modes/PolygonMode.js';
import PointMode    from './modes/PointMode.js';

export default class Poly2DEditor{
    // #region MAIN
    polygons        = {};                   // Active polygons for editing
    layers          = {};                   // Various layers used by the editor
    modes           = {};
    transform       = new Transform2D();    // Viewport transform
    itransform      = new Transform2D();    // Inverted for XY coord conversion
    elmContainer    = null;                 // Dom Container
    contentSize     = [0,0];                // Size of content area

    activeMode      = null;
    selectedPolygon = null;                 // Which polygon to edit.
    dragPointer     = -1;                   // Drag Pointer ID, also an indicator dragging is active
    eventTimeout    = null;                 // Tell the difference between MouseDown + Double Click Events

    constructor( id ){
        this.elmContainer   = document.getElementById( id );

        this.layers.grid    = new GridLayer( this.elmContainer );
        this.layers.image   = new ImageLayer( this.elmContainer );
        this.layers.svg     = new SvgLayer( this.elmContainer );

        this.layers.svg.on( 'pointerdown', this.onPointerDown );
        this.layers.svg.on( 'pointerup', this.onPointerUp );
        this.layers.svg.on( 'dblclick', this.onDBLClick );

        this.modes.polygon  = new PolygonMode( this );
        this.modes.point    = new PointMode( this );
        this.activeMode     = this.modes.polygon;
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

    updateContentTransform(){
        this.itransform.fromInvert( this.transform );
    
        // const box = this.layers.image.children[0].getBoundingClientRect();

        for( const l of Object.values( this.layers ) ){
            l.setTransform( this.transform );
            // l.setContentSize( box.width, box.height );
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
        // this.svgGroups.poly.appendChild( poly.element );

        this.modes.polygon.add( poly.element );
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
        if( this.activeMode.name === 'polygon' ){
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
            this.activeMode.removeSelected();
        }
    }
    // #endregion

    // #region MODES
    switchMode( name ){
        const m = this.modes[ name ];
        if( !m ){
            console.error( 'Mode name unknown', name );
            return;
        }

        if( m.initMode( this ) ){
            if( this.activeMode && this.activeMode !== m ) this.activeMode.releaseMode( this );
            this.activeMode = m;

            console.log( 'switch mode to ', name );
        }

        return this;
    }
    // #endregion

    // #region SVG EVENTS
    onPointerUp = e=>{
        if( this.eventTimeout ){
            clearTimeout( this.eventTimeout );
            this.eventTimeout = null;
            return;
        }

        this.activeMode.onPointerUp( e, this );

        if( this.dragPointer !== -1 ){
            this.layers.svg
                .off( 'pointermove', this.onPointerMove )
                .releasePointer( this.dragPointer );

            this.dragPointer = -1;
        }
    };
    
    onPointerDown = e=>{        
        // Delay down event to make dblClick event work.
        this.eventTimeout = setTimeout( ()=>this.onDragDown(e), 100 )
    };

    onDragDown = e=>{
        // console.log( e.layerX, e.layerY, e.target.nodeName, e.detail );
        this.eventTimeout = null;

        const coord = this.transformCoordinates( e.layerX, e.layerY );

        if( this.activeMode.onPointerDown( coord[0], coord[1], e, this ) ){
            this.layers.svg.on( 'pointermove', this.onPointerMove );
            this.dragPointer = e.pointerId;
        }
    };

    onPointerMove = e=>{
        this.layers.svg.capturePointer( this.dragPointer );
        e.preventDefault();
        e.stopPropagation();

        const coord = this.transformCoordinates( e.layerX, e.layerY );
        this.activeMode.onPointerMove( coord[0], coord[1], e, this );

        /*
        // this.dragItem.setAttribute( 'cx',  );
        // this.dragItem.setAttribute( 'cy', e.layerY );

        const p = this.polygon[ this.dragItem.dataset.idx ];
        p[ 0 ] = e.layerX;
        p[ 1 ] = e.layerY;

        // Extra HACK for how Translate is being used by the layers
        // If Scaling, subtract translation to offset the origin being moved.
        // Then inverse transform should work
        if( this.transform.scl != 1 ){
            p[0] -= this.transform.pos[0];
            p[1] -= this.transform.pos[1];
        }

        // applyTransform( this.invtransform, p ); // Apply Inverse Transform 
        this.invtransform.apply( p );

        console.log( JSON.stringify( this.polygon ) );
        this.renderPolygon();
        */
    };

    onDBLClick = e=>{
        switch( e.target.nodeName ){
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'polygon':{
                const id = e.target.getAttributeNS( null, 'id' );

                if( this.selectedPolygon && this.selectedPolygon.id === id ){
                    if( this.activeMode.name === 'polygon' ){
                        this.switchMode( 'point' );
                    }else{
                        this.selectPolygon( null );
                        this.switchMode( 'polygon' )
                    }
                }else{ 
                    this.selectPolygon( id );
                    this.switchMode( 'point' );
                }

                break;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'svg':
                if( this.selectedPolygon ){
                    this.selectPolygon( null );
                    if( this.activeMode.name !== 'polygon' ) this.switchMode( 'polygon' )
                }
                break;
        }

    };
    // #endregion

    // #region TRANSFORM
    // #endregion
}



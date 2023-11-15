
export default class EditPointsOp{
    // #region MAIN
    constructor( editor ){
        this.name           = 'editPoints';
        this.polygon        = null;

        this.isDown         = false;    // Is mouse down, allow drag to work if true
        this.selected       = [];       // List of selected elements
        this.selPos         = [];       // Localspace position for selected elements
        this.offset         = [0,0];    // Mouse offset
    }
    // #endregion

    // #region STATE MACHINE EVENTS
    onInit( editor ){ console.log( 'onInit', this.name );
        this.polygon = editor.selectedPolygon;
        
        editor.pointPool.releaseAll();
        this.drawPolygon( editor.pointPool );
    }

    onRelease( editor ){ console.log( 'onRelease', this.name );
        editor.pointPool.releaseAll();
        this.polygon         = null;
        this.isDown          = false;
        this.selected.length = 0;
        this.selPos.length   = 0;
    }

    onSuspend( editor ){ 
        console.log( 'onSuspend', this.name );
        this.deselectAll();
        this.isDown          = false;
        this.selPos.length   = 0;
    }

    onWakeup( editor ){ console.log( 'onWakeup', this.name );
        editor.pointPool.releaseAll();
        this.drawPolygon( editor.pointPool );
    }
    // #endregion

    // #region MISC
    removeSelected( editor ){
        if( this.selected.length === 0 ){
            console.log( 'No point selected' );
            return;
        }

        if( this.polygon.points.length - this.selected.length < 3 ){
            console.log( 'Can not delete point, polygon needs a min of 3 points' );
            return;
        }

        // Sort points in descendng order
        if( this.selected.length > 1 ){
            this.selected.sort( ( a, b )=>{
                return ( a.dataset.idx === b.dataset.idx )? 0 :
                       ( a.dataset.idx < b.dataset.idx )? 1 : -1;
            });
        }

        for( const elm of this.selected ){
            this.polygon.points.splice( elm.dataset.idx, 1 );
        }

        this.polygon.render();                  // Refresh polygon
        this.deselectAll();                     // Items have been deleted, deselect.
        editor.pointPool.releaseAll();          // Clear all points
        this.drawPolygon( editor.pointPool );   // Redraw points
    }
    // #endregion

    // #region HELPERS
    drawPolygon( pool ){
        let i = 0;
        for( const p of this.polygon.points ){
            pool.getElement( i++, p[0], p[1] );
        }
    }

    savePoints(){
        let p;
        for( const elm of this.selected ){
            p    = this.polygon.points[ elm.dataset.idx ];
            p[0] = parseFloat( elm.getAttributeNS( null, 'cx' ) );
            p[1] = parseFloat( elm.getAttributeNS( null, 'cy' ) );
        }

        this.polygon.render();
    }

    prepareDrag( x, y ){
        if( this.selected.length === 1 ){
            this.selPos.length = 0;
            this.selPos.push( [0,0] );
            this.offset[0] = 0;
            this.offset[1] = 0;
        }else{
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Compute centroid
            const cp = [0,0];
            let p;

            for( const elm of this.selected ){
                p = this.polygon.points[ elm.dataset.idx ];
                cp[0] += p[0];
                cp[1] += p[1];
            }

            cp[0] = Math.round( cp[0] / this.selected.length );
            cp[1] = Math.round( cp[1] / this.selected.length );

            this.offset[0] = cp[0] - x;
            this.offset[1] = cp[1] - y;

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            this.selPos.length = 0;
            for( const elm of this.selected ){
                p = this.polygon.points[ elm.dataset.idx ];
                this.selPos.push([
                    p[0] - cp[0],
                    p[1] - cp[1],
                ]);
            }
        }
    }
    // #endregion

    // #region SELECTION
    selectPoint( elm ){
        if( this.selected.indexOf( elm ) === -1 ){
            elm.classList.add( 'sel' );
            this.selected.push( elm );
        }
    }

    deselectPoint( elm ){
        const idx = this.selected.indexOf( elm );
        if( idx !== -1 ){
            elm.classList.remove( 'sel' );
            this.selected.splice( idx, 1 );
            return true;
        }

        return false;
    }

    deselectAll(){
        while( this.selected.length > 0 ){
            this.selected.pop().classList.remove( 'sel' );
        }
    }
    // #endregion

    // #region EVENT HANDLERS
    onPointerDown = ( x, y, e, editor )=>{
        if( e.target.nodeName !== 'circle' ) return false;

        const elm = e.target;

        if( e.shiftKey ){
            // Multi-selection
            if( !this.deselectPoint( elm ) ) this.selectPoint( elm );
        }else{
            // Only handle things if no multiple things selected
            if( this.selected.length <= 1 ){
                this.deselectAll();
                this.selectPoint( elm );
            }else{
                this.selectPoint( elm );
            }
        }
        
        this.prepareDrag( x, y );
        this.isDown = true;
        return true;
    };

    onPointerMove = ( x, y, e, editor )=>{
        if( !this.isDown ) return;

        let elm;
        let p;
        for( let i=0; i < this.selected.length; i++ ){
            elm = this.selected[i];
            p   = this.selPos[i];
            elm.setAttributeNS( null, 'cx', p[0] + this.offset[0] + x );
            elm.setAttributeNS( null, 'cy', p[1] + this.offset[1] + y );
        }
    };

    onPointerUp = ( e, editor )=>{
        this.isDown = false;
        this.savePoints();
    };

    onDblClick = ( e, editor )=>{
        if( e.target.nodeName !== 'circle' ) return;
        this.deselectAll();
        this.selectPoint( e.target );
    }
    // #endregion
}
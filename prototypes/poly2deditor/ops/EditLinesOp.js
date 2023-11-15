
export default class EditLinesOp{
    // #region MAIN
    constructor( editor ){
        this.name           = 'editLines';
        this.polygon        = null;
        this.dragElm        = null;
        this.dragOffset     = [0,0];
        this.selElm         = null;

        this.idx1           = -1;
        this.idx2           = -1;
        this.pos1           = [0,0];
        this.pos2           = [0,0];
    }
    // #endregion

    // #region STATE MACHINE EVENTS
    onInit( editor ){ console.log( 'onInit', this.name );
        this.polygon = editor.selectedPolygon;
        this.drawPolygon( editor.linePool );
    }

    onRelease( editor ){ console.log( 'onRelease', this.name );
        editor.linePool.releaseAll();
    }

    onSuspend( editor ){ console.log( 'onSuspend', this.name ); }

    onWakeup( editor ){ console.log( 'onWakeup', this.name );
        editor.linePool.releaseAll();
        this.drawPolygon( editor.linePool );
    }
    // #endregion

    // #region MISC
    removeSelected( editor ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( !this.selElm ){
            console.log( 'No point selected' );
            return;
        }

        if( this.polygon.points.length - 2 < 3 ){
            console.log( 'Can not delete point, polygon needs a min of 3 points' );
            return;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let iMin = Math.min( this.selElm.dataset.idx1, this.selElm.dataset.idx2 );
        let iMax = Math.max( this.selElm.dataset.idx1, this.selElm.dataset.idx2 )

        this.polygon.points.splice( iMax, 1 );
        this.polygon.points.splice( iMin, 1 );
        this.polygon.render();

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        editor.linePool.releaseAll();
        this.drawPolygon( editor.linePool );
    }
    // #endregion

    // #region HELPERS
    drawPolygon( pool ){
        const pnts = this.polygon.points; 
        const len  = pnts.length;
        let ii;
        for( let i=0; i < len; i++ ){
            ii = ( i+1 ) % len;

            pool.getElement( i, ii, 
                pnts[i][0], pnts[i][1],
                pnts[ii][0], pnts[ii][1],
            );
        }
    }

    savePoints(){
        let a;

        a    = this.polygon.points[ this.idx1 ];
        a[0] = parseFloat( this.dragElm.getAttributeNS( null, 'x1' ) );
        a[1] = parseFloat( this.dragElm.getAttributeNS( null, 'y1' ) );
        
        a    = this.polygon.points[ this.idx2 ];
        a[0] = parseFloat( this.dragElm.getAttributeNS( null, 'x2' ) );
        a[1] = parseFloat( this.dragElm.getAttributeNS( null, 'y2' ) );

        this.polygon.render();
    }

    refreshLines( pool ){
        const pnts = this.polygon.points;

        let p;
        for( const l of pool.active ){
            p = pnts[ l.dataset.idx1 ];
            l.setAttributeNS( null, 'x1', p[ 0 ] );
            l.setAttributeNS( null, 'y1', p[ 1 ] );

            p = pnts[ l.dataset.idx2 ];
            l.setAttributeNS( null, 'x2', p[ 0 ] );
            l.setAttributeNS( null, 'y2', p[ 1 ] );
        }
    }

    dragPrepare( x, y ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.idx1 = this.dragElm.dataset.idx1;
        this.idx2 = this.dragElm.dataset.idx2;

        // Line Points
        const p1 = this.polygon.points[ this.idx1 ];
        const p2 = this.polygon.points[ this.idx2 ];

        // Center Point
        const cx = Math.round( p1[0] * 0.5 + p2[0] * 0.5 );
        const cy = Math.round( p1[1] * 0.5 + p2[1] * 0.5 );

        // Local space line position
        this.pos1[0] = p1[0] - cx;
        this.pos1[1] = p1[1] - cy;
        this.pos2[0] = p2[0] - cx;
        this.pos2[1] = p2[1] - cy;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Drag Offset
        this.dragOffset[0] = cx - x;
        this.dragOffset[1] = cy - y;
    }
    // #endregion

    // #region EVENT HANDLERS
    onPointerDown = ( x, y, e, editor )=>{
        if( e.target.nodeName !== 'line' ) return false;
        
        if( this.selElm ) this.selElm.classList.remove( 'sel' );

        this.dragElm = e.target;
        this.selElm  = e.target;
        this.selElm.classList.add( 'sel' );

        this.dragPrepare( x, y );
        
        return true;
    };

    onPointerMove = ( x, y, e, editor )=>{
        if( !this.dragElm ) return;

        this.dragElm.setAttributeNS( null, 'x1', this.pos1[ 0 ] + x + this.dragOffset[ 0 ] );
        this.dragElm.setAttributeNS( null, 'y1', this.pos1[ 1 ] + y + this.dragOffset[ 1 ] );
        this.dragElm.setAttributeNS( null, 'x2', this.pos2[ 0 ] + x + this.dragOffset[ 0 ] );
        this.dragElm.setAttributeNS( null, 'y2', this.pos2[ 1 ] + y + this.dragOffset[ 1 ] );
    };

    onPointerUp = (e, editor)=>{
        if( this.dragElm ){
            this.savePoints();
            this.refreshLines( editor.linePool );
            this.dragElm = null;
        }
    };
    // #endregion
}
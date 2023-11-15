
export default class EditPointsOp{
    // #region MAIN
    constructor( editor ){
        this.name           = 'editPoints';
        this.polygon        = null;
        this.dragElm        = null;
        this.selElm         = null;
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
    }

    onSuspend( editor ){ console.log( 'onSuspend', this.name ); }

    onWakeup( editor ){ console.log( 'onWakeup', this.name );
        editor.pointPool.releaseAll();
        this.drawPolygon( editor.pointPool );
    }
    // #endregion

    // #region MISC
    removeSelected( editor ){
        if( !this.selElm ){
            console.log( 'No point selected' );
            return;
        }

        if( this.polygon.points.length <= 3 ){
            console.log( 'Can not delete point, polygon needs a min of 3 points' );
            return;
        }

        const idx = this.selElm.dataset.idx;
        this.polygon.points.splice( idx, 1 );
        this.polygon.render();

        editor.pointPool.releaseAll();
        this.drawPolygon( editor.pointPool );
    }
    // #endregion

    // #region HELPERS
    drawPolygon( pool ){
        let i = 0;
        for( const p of this.polygon.points ){
            pool.getElement( i++, p[0], p[1] );
        }
    }

    savePoints( pool ){
        for( const elm of pool.active ){
            const p = this.polygon.points[ elm.dataset.idx ];
            p[0] = parseFloat( elm.getAttributeNS( null, 'cx' ) );
            p[1] = parseFloat( elm.getAttributeNS( null, 'cy' ) );
        }

        this.polygon.render();
    }
    // #endregion

    // #region EVENT HANDLERS
    onPointerDown = ( x, y, e, editor )=>{
        if( e.target.nodeName !== 'circle' ) return false;
        
        if( this.selElm ) this.selElm.classList.remove( 'sel' );

        this.dragElm = e.target;
        this.selElm  = e.target;
        this.selElm.classList.add( 'sel' );
        
        return true;
    };

    onPointerMove = ( x, y, e, editor )=>{
        if( !this.dragElm ) return;
        this.dragElm.setAttributeNS( null, 'cx', x );
        this.dragElm.setAttributeNS( null, 'cy', y );
    };

    onPointerUp = (e, editor)=>{
        this.dragElm = null;
        this.savePoints( editor.pointPool );
    };
    // #endregion
}
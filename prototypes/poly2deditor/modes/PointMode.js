
export default class PointMode{
    // #region MAIN
    cache  = [];    // Collection of reusable elements
    active = [];    // Collection of currently used elements

    constructor( editor ){
        this.name           = 'point';
        this.group          = editor.layers.svg.newGroup( 'grpPnts' );
        this.polygon        = null;     // Polygon Object
        this.dragElm        = null;     // Circle SVG Element
    }
    // #endregion

    // #region MODE FUNCTIONS
    initMode( editor ){
        if( !editor.selectedPolygon ) return false;

        this.polygon = editor.selectedPolygon;
        this.releaseAll();
        this.initPoints();

        return true;
    }

    releaseMode( editor ){
        this.polygon = null;
        this.dragElm = null;
        this.releaseAll();
        return this;
    }

    removeSelected(){
        if( !this.dragElm ){
            console.log( 'No point selected' );
            return;
        }

        if( this.polygon.points.length <= 3 ){
            console.log( 'Can not delete point, polygon needs a min of 3 points' );
            return;
        }

        const idx = this.dragElm.dataset.idx;
        this.polygon.points.splice( idx, 1 );
        this.polygon.render();

        this.releaseAll();
        this.initPoints();
    }
    // #endregion

    // #region OBJECT POOL
    getElement( idx, x, y ){
        let elm;

        if( this.cache.length > 0 ){
            // Recycle item
            elm = this.cache.pop();
        }else{
            // Create new item
            elm = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
            elm.setAttributeNS( null, 'r', 1 );        
            elm.classList.add( 'pnt' );
            this.group.appendChild( elm );
        }

        // Setup element
        elm.dataset.idx = idx;
        elm.setAttributeNS( null, 'cx', x );
        elm.setAttributeNS( null, 'cy', y );
        elm.setAttributeNS( null, 'visibility', 'visible' );

        // Save
        this.active.push( elm );
        return elm;
    }

    releaseElement( elm ){
        elm.setAttributeNS( null, 'visibility', 'collapse' );
        elm.classList.remove( 'sel' );
        this.cache.push( elm );

        if( this.active.length > 1 ){
            const max = this.active.length - 1;         // Max Index
            const idx = this.active.indexOf( elm );     // Find index of item to release

            this.active[ idx ] = this.active[ max ];    // Move last item to deleted item
            this.active.length = max;                   // Shrink Array
        }else{
            this.active.length = 0;
        }
    }

    releaseAll(){
        let elm;
        while( this.active.length > 0 ){
            elm = this.active.pop();
            elm.setAttributeNS( null, 'visibility', 'collapse' );
            elm.classList.remove( 'sel' );
            this.cache.push( elm );
        }

        return this;
    }
    // #endregion

    // #region HELPERS
    initPoints(){
        let i = 0;
        for( const p of this.polygon.points ){
            this.getElement( i++, p[0], p[1] );
        }
    }

    savePoints(){
        for( const elm of this.active ){
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
        
        if( this.dragElm ) this.dragElm.classList.remove( 'sel' );

        this.dragElm = e.target;
        this.dragElm.classList.add( 'sel' );

        return true;
    };

    onPointerMove = ( x, y, e, editor )=>{
        this.dragElm.setAttributeNS( null, 'cx', x );
        this.dragElm.setAttributeNS( null, 'cy', y );
    };

    onPointerUp = (e, editor)=>{
        this.savePoints();
    };
    // #endregion
}
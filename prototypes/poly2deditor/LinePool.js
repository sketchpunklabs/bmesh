
export default class LinePool{
    // #region MAIN
    cache  = [];    // Collection of reusable elements
    active = [];    // Collection of currently used elements

    constructor( editor ){
        this.group = editor.layers.svg.newGroup( 'grpLines' );
    }
    // #endregion

    // #region OBJECT POOL
    getElement( idx1, idx2, x1, y1, x2, y2 ){
        let elm;

        if( this.cache.length > 0 ){
            // Recycle item
            elm = this.cache.pop();
        }else{
            // Create new item
            elm = document.createElementNS( 'http://www.w3.org/2000/svg', 'line' );   
            elm.classList.add( 'line' );
            this.group.appendChild( elm );
        }

        // Setup element
        elm.dataset.idx1 = idx1;
        elm.dataset.idx2 = idx2;
        elm.setAttributeNS( null, 'x1', x1 );
        elm.setAttributeNS( null, 'y1', y1 );
        elm.setAttributeNS( null, 'x2', x2 );
        elm.setAttributeNS( null, 'y2', y2 );
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
}
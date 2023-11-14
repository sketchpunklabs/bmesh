export default class GridLayer{
    // #region MAIN
    elmContainer = document.createElement( 'div' );
    constructor( elmParent ){
        this.elmContainer.classList.add( 'gridLayer' );
        this.elmContainer.classList.add( 'dark' );

        this.elmContainer.style.transformOrigin = 'top left';
        elmParent.appendChild( this.elmContainer );
    }
    // #endregion

    // #region INTERFACE
    setContentSize( w, h ){
        this.elmContainer.style.width   = w + 'px';
        this.elmContainer.style.height  = h + 'px';
    }

    setTransform( t ){
        this.elmContainer.style.transform = `scale(${t.scl})`;
    }
    // #endregion
}
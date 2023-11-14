export default class ImageLayer{
    // #region MAIN
    elmContainer = document.createElement( 'div' );
    elmView      = null;

    constructor( elmParent ){
        this.elmContainer.classList.add( 'imgLayer' );
        
        elmParent.appendChild( this.elmContainer );
        // <div class="imgLayer"><img src="./depth2.png"></div>
        // this.layers.image.children[0].style.transformOrigin = 'top left';  
    }
    // #endregion

    // #region METHODS
    loadImage( img, forPicking=false ){
        if( !forPicking ){
            this.elmView = img;
            this.elmView.style.transformOrigin = 'top left';
            this.elmContainer.appendChild( this.elmView );
        }else{
            console.error( 'UNIMPLMENTED: Canvas Image Loader' );
        }
    }
    // #endregion

    // #region INTERFACE
    setContentSize( w, h ){
        this.elmContainer.style.width   = w + 'px';
        this.elmContainer.style.height  = h + 'px';
    }

    setTransform( t ){
        this.elmView.style.transform = `scale(${t.scl}) translate( ${t.pos[0]}px, ${t.pos[1]}px ) rotate(${t.rot}deg)`;
    }
    // #endregion
}
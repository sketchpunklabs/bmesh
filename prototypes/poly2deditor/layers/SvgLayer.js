const NS = 'http://www.w3.org/2000/svg';
function Elm( name ){ return document.createElementNS( NS, name ); }
function Atr( elm, name, val ){ elm.setAttributeNS( null, name, val ); }

export default class SvgLayer{
    // #region MAIN
    elmContainer = Elm( 'svg' );
    constructor( elmParent ){
        this.elmContainer.style.transformOrigin = 'top left';
        this.elmContainer.classList.add( 'svgLayer' );
        elmParent.appendChild( this.elmContainer );
    }
    // #endregion

    // #region ELEMENTS
    newGroup( id=null ){
        const elm = Elm( 'g' );
        if( id != null ) Atr( elm, 'id', id );
        this.elmContainer.appendChild( elm );
        return elm;
    }
    // #endregion

    // #region INTERFACE
    setContentSize( w, h ){
        this.elmContainer.style.width   = w + 'px';
        this.elmContainer.style.height  = h + 'px';
    }

    setTransform( t ){
        this.elmContainer.style.transform = `scale(${t.scl}) translate( ${t.pos[0]}px, ${t.pos[1]}px ) rotate(${t.rot}deg)`;
    }
    // #endregion

    // #region EVENTS
    once( evtName, fn ){ this.elmContainer.addEventListener( evtName, fn, {once:true} ); return this; }
    on( evtName, fn ){ this.elmContainer.addEventListener( evtName, fn ); return this; }
    off( evtName, fn ){ this.elmContainer.removeEventListener( evtName, fn ); return this; }
    releasePointer( id ){ this.elmContainer.releasePointerCapture( id ); return this; }
    capturePointer( id ){ this.elmContainer.setPointerCapture( id ); return this; }
    // #endregion
}

export default class SvgPolygon{
    // #region MAIN
    id      = window.crypto.randomUUID();
    points  = [];
    color   = '#00ff00';
    element = document.createElementNS( 'http://www.w3.org/2000/svg', 'polygon' );

    constructor( pnts ){
        if( pnts ) this.points = pnts;
        this.element.classList.add( 'poly' );
        this.element.setAttributeNS( null, 'id', this.id );
    }
    // #endregion

    set isSelected( b ){
        if( b ) this.element.classList.add( 'sel' );
        else    this.element.classList.remove( 'sel' );
    }

    getCenter( out=[0,0] ){
        out[0] = 0;
        out[1] = 0;

        for( const p of this.points ){
            out[0] += p[0];
            out[1] += p[1];
        }

        out[0] /= this.points.length;
        out[1] /= this.points.length;

        return out;
    }

    // #region MISC
    // points='0,0 100,100, 100,50'
    render(){
        let pStr = '';
        for( const p of this.points ) pStr += p[0] + ',' + p[1] + ' ';

        this.element.setAttributeNS( null, 'points', pStr );
        this.element.setAttributeNS( null, 'fill', this.color );
    }
    // #endregion
}
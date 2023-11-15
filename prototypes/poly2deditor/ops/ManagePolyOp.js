
export default class ManagePolyOp{
    // #region MAIN
    constructor( editor ){
        this.name           = 'managePolygon';
        // this.group          = editor.layers.svg.newGroup( 'grpPoly' );
        this.polygon        = null;     // Polygon Object
        this.dragElm        = null;     // Polygon SVG Element 
        this.dragOffset     = [0,0];    // Drag offset, for realistic dragging effect
        this.dragPoints     = null;     // Localspace coordinates of polygon with centroid as origin
    }
    // #endregion

    // #region STATE MACHINE EVENTS
    onInit( editor ){ console.log( 'onInit', this.name ); }
    onRelease( editor ){ console.log( 'onRelease', this.name ); }
    onSuspend( editor ){ console.log( 'onSuspend', this.name ); }
    onWakeup( editor ){ console.log( 'onWakeup', this.name ); }
    // #endregion

    // #region METHODS
    // #endregion

    // #region HELPERS
    dragPrepare( x, y ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute the polygon centroid
        let cx = 0;
        let cy = 0;

        for( const p of this.polygon.points ){
            cx += p[0];
            cy += p[1];
        }

        cx /= this.polygon.points.length;
        cy /= this.polygon.points.length;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Drag Offset
        this.dragOffset[0] = cx - x;
        this.dragOffset[1] = cy - y;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Point coordinates with centroid as origin
        this.dragPoints = [];
        for( const p of this.polygon.points ){
            this.dragPoints.push( [ p[0]-cx,  p[1]-cy ] );
        }
    }
    // #endregion

    // #region EVENT HANDLERS
    onPointerDown = ( x, y, e, editor )=>{
        if( e.target.nodeName !== 'polygon' ) return false;

        const id        = e.target.getAttributeNS( null, 'id' );
        this.dragElm    = e.target;
        this.polygon    = editor.polygons[ id ];

        editor.selectPolygon( id );
        this.dragPrepare( x, y );

        return true;
    };

    onPointerMove = ( x, y, e, editor )=>{
        if( !this.dragElm ) return;
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute new worldspace position for polygon
        let pp; // Polygon Point
        let dp; // Drag Point
        for( let i=0; i < this.dragPoints.length; i++ ){
            pp    = this.polygon.points[i];
            dp    = this.dragPoints[ i ];

            pp[0] = dp[ 0 ] + x + this.dragOffset[ 0 ];
            pp[1] = dp[ 1 ] + y + this.dragOffset[ 1 ];
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Show results of dragged polygon
        this.polygon.render();
    };

    onPointerUp = (e, editor)=>{
        this.dragElm = null;
    };

    onDblClick = ( e, editor )=>{
        console.log( 'DblClick', this.name );
    }
    // #endregion
}
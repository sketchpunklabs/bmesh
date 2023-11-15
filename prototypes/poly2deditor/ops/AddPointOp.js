

function nearPoint( seg0, seg1, p, out=[0,0] ){
    /* closest_point_to_line3D
    let dx	= bx - ax,
        dy	= by - ay,
        dz	= bz - az,
        t	= ( (px-ax)*dx + (py-ay)*dy + (pz-az)*dz ) / ( dx*dx + dy*dy + dz*dz ) ; */
    // const v = vec3.sub( p, ray.posStart, [0,0,0] );
    // vec3.mul( v, ray.vecLength );

    const vLen = [
        seg1[0] - seg0[0],
        seg1[1] - seg0[1],
    ];

    const v = [
        ( p[0] - seg0[0] ) * vLen[0],
        ( p[1] - seg0[1] ) * vLen[1],
    ];

    const t = ( v[0] + v[1] ) / ( vLen[0]**2 + vLen[1]**2 );

    if( t < 0 || t > 1 ) return false;                   // Over / Under shoots the Ray Segment
    // const lenSqr = vec3.lenSq( ray.posAt( t, v ), p );  // Distance from point to nearest point on ray.
    // return ( lenSqr <= (distLimit*distLimit) )? t : null;

    out[ 0 ] = seg0[ 0 ] + vLen[ 0 ] * t;
    out[ 1 ] = seg0[ 1 ] + vLen[ 1 ] * t;

    return true;
}

function distSq( a, b ){ return ( a[0] - b[0] )**2 + ( a[1] - b[1] )**2; }



export default class AddPointOp{
    // #region MAIN
    constructor( editor ){
        this.name           = 'addPoint';
        this.polygon        = null;
        this.pnt            = null;
        this.savePos        = [0,0];
        this.saveIdx        = -1
    }
    // #endregion

    // #region STATE MACHINE EVENTS
    onInit( editor ){ console.log( 'onInit', this.name );
        this.polygon = editor.selectedPolygon;
        this.pnt     = editor.pointPool.getElement( -1, 0, 0 );
    }

    onRelease( editor ){ console.log( 'onRelease', this.name );
        editor.pointPool.releaseElement( this.pnt );
        this.pnt        = null;
        this.polygon    = null;
        this.saveIdx    = -1;
    }

    onSuspend( editor ){ console.log( 'onSuspend', this.name ); }

    onWakeup( editor ){ console.log( 'onWakeup', this.name ); }
    // #endregion

    // #region HELPERS
    // drawPolygon( pool ){
    //     let i = 0;
    //     for( const p of this.polygon.points ){
    //         pool.getElement( i++, p[0], p[1] );
    //     }
    // }

    // savePoints( pool ){
    //     for( const elm of pool.active ){
    //         const p = this.polygon.points[ elm.dataset.idx ];
    //         p[0] = parseFloat( elm.getAttributeNS( null, 'cx' ) );
    //         p[1] = parseFloat( elm.getAttributeNS( null, 'cy' ) );
    //     }

    //     this.polygon.render();
    // }
    // #endregion

    // #region EVENT HANDLERS
    onPointerDown = ( x, y, e, editor )=>{

        console.log( 'AddPoint down' );
        
        if( e.target.nodeName === 'circle' ){
            if( this.saveIdx !== -1 ){
                const p = this.savePos.slice();
                this.polygon.points.splice( this.saveIdx, 0, p );
                this.polygon.render();
                editor.machinePop();
            }
        }else{
            editor.machinePop();
        }
        
        // if( this.selElm ) this.selElm.classList.remove( 'sel' );

        // this.dragElm = e.target;
        // this.selElm  = e.target;
        // this.selElm.classList.add( 'sel' );
        
        return false;
    };

    onPointerMove = ( x, y, e, editor )=>{
        // if( !this.dragElm ) return;
        // this.pnt.setAttributeNS( null, 'cx', x );
        // this.pnt.setAttributeNS( null, 'cy', y );
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const mpos  = [x,y];
        const pnts  = this.polygon.points;
        const len   = pnts.length;
        let minDist = Infinity;
        let minPos  = [0,0];
        let minIdx  = -1;
        let hit     = [0,0];
        let dist    = 0;
        let ii;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( let i=0; i < len; i++ ){
            ii = ( i+1 ) % len;

            if( nearPoint( pnts[i], pnts[ii], mpos, hit ) ){
                dist = distSq( mpos, hit );
                if( dist < minDist ){
                    minIdx    = i+1;
                    minDist   = dist;
                    minPos[0] = hit[0];
                    minPos[1] = hit[1];
                }
            }
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( minDist !== Infinity ){
            this.saveIdx    = minIdx;
            this.savePos[0] = minPos[0];
            this.savePos[1] = minPos[1];
            this.pnt.setAttributeNS( null, 'cx', minPos[0] );
            this.pnt.setAttributeNS( null, 'cy', minPos[1] );
        }
    };

    onPointerUp = (e, editor)=>{
        console.log( 'AddPoint up' );
        // this.dragElm = null;
        // this.savePoints( editor.pointPool );
    };
    // #endregion
}
type TVec3 = Array< number >;

export default class vec3{

    // #region GETTERS

    static len( a: TVec3 ): number{ return Math.sqrt( a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]** 2 ); }

    static dot( a: TVec3, b: TVec3 ): number { return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ]; }
    
    // #endregion

    // #region OPS

    static add( a: TVec3, b: TVec3, out: TVec3 = [0,0,0] ): TVec3{
        out[ 0 ] = a[ 0 ] + b[ 0 ];
        out[ 1 ] = a[ 1 ] + b[ 1 ];
        out[ 2 ] = a[ 2 ] + b[ 2 ];
        return out;
    }

    static sub( a: TVec3, b: TVec3, out: TVec3 = [0,0,0] ): TVec3{
        out[ 0 ] = a[ 0 ] - b[ 0 ];
        out[ 1 ] = a[ 1 ] - b[ 1 ];
        out[ 2 ] = a[ 2 ] - b[ 2 ];
        return out;
    }

    static scale( a: TVec3, s: number, out: TVec3 = [0,0,0] ): TVec3{
        out[ 0 ] = a[ 0 ] * s;
        out[ 1 ] = a[ 1 ] * s;
        out[ 2 ] = a[ 2 ] * s;
        return out;
    }

    static scaleThenAdd( v: TVec3, s: number, add: TVec3, out: TVec3 = [0,0,0] ): TVec3{
        out[ 0 ] = v[ 0 ] * s + add[ 0 ];
        out[ 1 ] = v[ 1 ] * s + add[ 1 ];
        out[ 2 ] = v[ 2 ] * s + add[ 2 ];
        return out;
    }

    static norm( a: TVec3, out: TVec3 = [0,0,0] ): TVec3{
        let mag = Math.sqrt( a[ 0 ]**2 + a[ 1 ]**2 + a[ 2 ]**2 );
        if( mag != 0 ){
            mag      = 1 / mag;
            out[ 0 ] = a[ 0 ] * mag;
            out[ 1 ] = a[ 1 ] * mag;
            out[ 2 ] = a[ 2 ] * mag;
        }
        return out;
    }

    static cross( a: TVec3, b: TVec3, out: TVec3 = [0,0,0] ): TVec3{
        const ax = a[0], ay = a[1], az = a[2],
              bx = b[0], by = b[1], bz = b[2];

        out[ 0 ] = ay * bz - az * by;
        out[ 1 ] = az * bx - ax * bz;
        out[ 2 ] = ax * by - ay * bx;
        return out;
    }

    // #endregion

}
import * as THREE from 'three';

export default class RayCasting{
    // #region MAIN
    caster       = new THREE.Raycaster();
    pos          = new THREE.Vector2();
    ndc          = new THREE.Vector2();
    viewSize     = new THREE.Vector2();
    camera       = null;
    renderer     = null;
    canvas       = null;
    isMouseDown  = false;
    onMouseDown  = null;  // ( e, RayCasting )
    onMouseHover = null;
    onMouseUp    = null;
    enabled      = true;
    pointerId    = -1;

    constructor( camera, renderer ){
        this.camera   = camera;
        this.renderer = renderer;
        this.canvas   = renderer.domElement;
    }
    // #endregion

    // #region EVENTS HANDLERS
    _onPointerDown = ( e )=>{
        if( !this.enabled ) return;
        this.pointerId = e.pointerId;

        if( this.onMouseDown ){
            this.updateCoord( e );
            this.updateRay();

            if( this.onMouseDown( e, this ) ){
                this.isMouseDown = true;
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };

    _onPointerMove = ( e )=>{
        if( !this.enabled ) return;

        if( this.pointerId !== -1 ) this.canvas.setPointerCapture( this.pointerId ); // Keep receiving events

        if( !this.isMouseDown && this.onMouseHover ){
            e.preventDefault();
            e.stopPropagation();

            this.updateCoord( e );
            this.updateRay();
            this.onMouseHover( e, this );
        }

        if( this.isMouseDown && this.onMouseMove ){
            e.preventDefault();
            e.stopPropagation();

            this.updateCoord( e );
            this.updateRay();
            this.onMouseMove( e, this );
        }
    };

    _onPointerUp  = ( e )=>{ 
        this.isMouseDown = false;
        this.canvas.releasePointerCapture( this.pointerId );
        this._pointerId = -1;

        if( this.onMouseUp ) this.onMouseUp( e, this );
    };
    // #endregion

    // #region PUBLIC METHODS
    active(){
        const can = this.renderer.domElement;
        can.addEventListener( 'pointerdown', this._onPointerDown );
        can.addEventListener( 'pointermove', this._onPointerMove );
        can.addEventListener( 'pointerup',   this._onPointerUp );
        return this;
    }

    deactive(){
        const can = this.renderer.domElement;
        can.removeEventListener( 'pointerdown', this._onPointerDown );
        can.removeEventListener( 'pointermove', this._onPointerMove );
        can.removeEventListener( 'pointerup',   this._onPointerUp );
        return this;
    }

    inObjects( ary, checkChildren=false ){
        return this.caster.intersectObjects( ary, checkChildren );
    }

    getRaySegment(){
        const org = this.caster.ray.origin;
        const dir = this.caster.ray.direction;
        const far = this.camera.far;
        return [
            [ org.x, org.y, org.z ],
            [
                org.x + dir.x * far,
                org.y + dir.y * far,
                org.z + dir.z * far,
            ]
        ];
    }
    // #endregion

    // #region PRIVATE METHODS
    updateCoord( e ){
        // Compute position over the canvas with its top/left corner as origin
        const box  = this.renderer.domElement.getBoundingClientRect();
        this.pos.x = e.clientX - box.x;
        this.pos.y = e.clientY - box.y;

        // Compute NDC screen coordinate of mouse over canvas
        this.renderer.getSize( this.viewSize );
        this.ndc.x =  ( this.pos.x / this.viewSize.x ) * 2 - 1;
        this.ndc.y = -( this.pos.y / this.viewSize.y ) * 2 + 1;
    }

    updateRay(){
        this.caster.setFromCamera( this.ndc, this.camera );
        return this;
    }
    // #endregion
}


export function nearPoint( rayStart, rayEnd, p ){
    /* closest_point_to_line3D
    let dx	= bx - ax,
        dy	= by - ay,
        dz	= bz - az,
        t	= ( (px-ax)*dx + (py-ay)*dy + (pz-az)*dz ) / ( dx*dx + dy*dy + dz*dz ) ; */
    // const v = vec3.sub( p, ray.posStart, [0,0,0] );
    // vec3.mul( v, ray.vecLength );

    const vLen = [
        rayEnd[0] - rayStart[0],
        rayEnd[1] - rayStart[1],
        rayEnd[2] - rayStart[2],
    ];

    const v = [
        ( p[0] - rayStart[0] ) * vLen[0],
        ( p[1] - rayStart[1] ) * vLen[1],
        ( p[2] - rayStart[2] ) * vLen[2],
    ];

    const t = ( v[0] + v[1] + v[2] ) / ( vLen[0]**2 + vLen[1]**2 + vLen[2]**2 );

    if( t < 0 || t > 1 ) return null;                   // Over / Under shoots the Ray Segment
    // const lenSqr = vec3.lenSq( ray.posAt( t, v ), p );  // Distance from point to nearest point on ray.
    // return ( lenSqr <= (distLimit*distLimit) )? t : null;
    
    return [
        rayStart[ 0 ] + vLen[ 0 ] * t,
        rayStart[ 1 ] + vLen[ 1 ] * t,
        rayStart[ 2 ] + vLen[ 2 ] * t,
    ];
}


export function intersectPlane( rayStart, rayEnd, planePos, planeNorm ){
    // t   = ((planePos - rayOrigin) dot planeNorm) / ( rayVecLen dot planeNorm )
    // pos = t * rayVecLen + rayOrigin;
    const vecLen = [
        rayEnd[0] - rayStart[0],
        rayEnd[1] - rayStart[1],
        rayEnd[2] - rayStart[2],
    ];

    const denom = vecLen[0]*planeNorm[0] + vecLen[1]*planeNorm[1] + vecLen[2]*planeNorm[2]; // Dot( vecLen, planeNorm )
    if( denom <= 0.000001 && denom >= -0.000001 ) return null;  // abs(denom) < epsilon, using && instead to not perform absolute.

    const offset = [
        planePos[0] - rayStart[0],
        planePos[1] - rayStart[1],
        planePos[2] - rayStart[2],
    ];
    
    // dot(offset,planeNorm) / denom
    const t = ( offset[0]*planeNorm[0] + offset[1]*planeNorm[1] + offset[2]*planeNorm[2] ) / denom;
    if( t < 0 ) return null;    // No intersection

    // Hit position
    return [
        vecLen[ 0 ] * t + rayStart[0],
        vecLen[ 1 ] * t + rayStart[1],
        vecLen[ 2 ] * t + rayStart[2],
    ];
}


function dot( a, b ){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
export function nearSegment( rayStart, rayEnd, p0, p1 ){
    // http://geomalgorithms.com/a07-_distance.html
    // const u = new Vec3( p1 ).sub( p0 );
    const u = [
        p1[0] - p0[0],
        p1[1] - p0[1],
        p1[2] - p0[2],
    ];

    // const v = ray.vecLength;
    const v = [
        rayEnd[0] - rayStart[0],
        rayEnd[1] - rayStart[1],
        rayEnd[2] - rayStart[2],
    ];

    // const w = new Vec3( p0 ).sub( ray.posStart );
    const w = [
        p0[0] - rayStart[0],
        p0[1] - rayStart[1],
        p0[2] - rayStart[2],
    ]

    const a = dot( u, u ); // always >= 0
    const b = dot( u, v );
    const c = dot( v, v ); // always >= 0
    const d = dot( u, w );
    const e = dot( v, w );
    const D = a * c - b * b;    // always >= 0

    let tU = 0; // T Of Segment 
    let tV = 0; // T Of Ray

    // Compute the line parameters of the two closest points
    if( D < 0.000001 ){	            // the lines are almost parallel
        tU = 0.0;
        tV = ( b > c ? d/b : e/c ); // use the largest denominator
    }else{
        tU = ( b*e - c*d ) / D;
        tV = ( a*e - b*d ) / D;
    }

    if( tU < 0 || tU > 1 || tV < 0 || tV > 1 ) return null;
    
    // Segment Position : u.scale( tU ).add( p0 )
    // Ray Position :     v.scale( tV ).add( this.origin ) ];
    // if( results ){
        const ti     = 1 - tU;
        const segPos = [
            p0[0] * ti + p1[0] * tU,
            p0[1] * ti + p1[1] * tU,
            p0[2] * ti + p1[2] * tU,
        ];

        // results.segPosition[ 0 ] = p0[0] * ti + p1[0] * tU;
        // results.segPosition[ 1 ] = p0[1] * ti + p1[1] * tU;
        // results.segPosition[ 2 ] = p0[2] * ti + p1[2] * tU;
        
        // ray.posAt( tV, results.rayPosition );
        const rayPos = [
            v[ 0 ] * tV + rayStart[ 0 ],
            v[ 1 ] * tV + rayStart[ 1 ],
            v[ 2 ] * tV + rayStart[ 2 ],
        ];

        const dist = Math.sqrt(
            ( segPos[0] - rayPos[0] )**2 + 
            ( segPos[1] - rayPos[1] )**2 + 
            ( segPos[2] - rayPos[2] )**2
        );

        // results.distanceSq = Vec3.distSqr( results.segPosition, results.rayPosition );
        // results.distance   = Math.sqrt( results.distanceSq );
    // }

    return [ dist, segPos ];
}



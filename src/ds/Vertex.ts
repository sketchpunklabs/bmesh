/*
https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/bmesh_class.h#L90
typedef struct BMVert {
    BMHeader head;
    float co[3]; // vertex coordinates
    float no[3]; // vertex normal

    * Pointer to (any) edge using this vertex (for disk cycles).
    *
    * \note Some higher level functions set this to different edges that use this vertex,
    * which is a bit of an abuse of internal #BMesh data but also works OK for now
    * (use with care!).
    struct BMEdge *e;
} BMVert;
*/

import type Edge from './Edge';

export default class Vertex{
    // #region MAIN
    id   : string           = window.crypto.randomUUID();
    pos  : Array< number >  = [0,0,0];
    edge : Edge | null      = null;     // Reference to first edge using this vert as an origin.

    constructor( v ?: Array<number> ){
        if( v ) this.setPos( v );
    }
    // #endregion

    // #region SETTERS
    setPos( v: Array<number> ){
        this.pos[ 0 ] = v[ 0 ];
        this.pos[ 1 ] = v[ 1 ];
        this.pos[ 2 ] = v[ 2 ];
        return this;
    }
    // #endregion
}
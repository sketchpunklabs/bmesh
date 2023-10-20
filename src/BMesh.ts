// #region IMPORTS
import Vertex   from './ds/Vertex';
import Edge     from './ds/Edge';
import Loop     from './ds/Loop';
import Face     from './ds/Face';

import CoreOps  from './ops/CoreOps';
import QueryOps from './ops/QueryOps';
// #endregion

export default class BMesh{

    // #region MAIN
    eIDs     : number        = 1;
    vertices : Array<Vertex> = [];
    edges    : Array<Edge>   = [];
    loops    : Array<Loop>   = [];
    faces    : Array<Face>   = [];
    // #endregion

    // #region CREATION
    
    // BM_vert_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L45
    addVertex( pos: Array<number> ): Vertex{
        const v = new Vertex( pos );
        this.vertices.push( v );
        return v;
    }

    addEdge( v1: Vertex, v2: Vertex ): Edge | null{
        let edge = QueryOps.edgeExists( v1, v2 );
        if( edge ) return edge;

        edge = CoreOps.edgeCreate( v1, v2 );
        if( edge ) this.edges.push( edge );
        return edge;
    }

    addLoop( v: Vertex, e: Edge, f: Face ): Loop{
        const loop = CoreOps.loopCreate( v, e, f );
        this.loops.push( loop );
        return loop;
    }

    addFace( ary: Array<Vertex> ){
        const face = CoreOps.faceCreateVerts( this, ary );        
        this.faces.push( face );
        return face;
    }

    // #endregion

}
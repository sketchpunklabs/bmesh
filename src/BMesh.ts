// #region IMPORTS
import Vertex   from './ds/Vertex';
import Edge     from './ds/Edge';
import Loop     from './ds/Loop';
import Face     from './ds/Face';

import CoreOps  from './ops/CoreOps';
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
        const edge = CoreOps.edgeCreate( v1, v2 );
        if( edge ) this.edges.push( edge );
        return edge;
    }

    // This filters out any edges that already exist in the list
    _pushEdge( e: Edge ): void{
        if( !e.id ){ e.id = this.eIDs++; this.edges.push( e ); }
    }

    addFace( ary: Array<Vertex> ){
        const rtn = CoreOps.faceCreateVerts( ary );
        
        this.faces.push( rtn.face );
        if( rtn.loops ) for( const i of rtn.loops ) this.loops.push( i );
        if( rtn.edges ) for( const i of rtn.edges ) this._pushEdge( i );

        return rtn.face;
    }

    // #endregion

}
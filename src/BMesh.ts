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

    addFace( ary?: Array<Vertex> ): Face{
        const face = ( ary )
            ? CoreOps.faceCreateVerts( this, ary )
            : new Face();

        this.faces.push( face );
        return face;
    }

    // #endregion

    // #region REMOVING

    removeFace( f: Face ): void{ CoreOps.faceKill( this, f ); }
    removeEdge( e: Edge ): void{ CoreOps.edgeKill( this, e ); }
    removeVertex( v: Vertex ): void{ CoreOps.vertKill( this, v ); }

    cleanVert( v: Vertex ): void{ if( !this.cleanArray( v, this.vertices ) ) console.log( 'Vertex not found for cleanup' ); }
    cleanEdge( e: Edge ): void{ if( !this.cleanArray( e, this.edges ) ) console.log( 'Edge not found for cleanup' ); }
    cleanLoop( l: Loop ): void{ if( !this.cleanArray( l, this.loops ) ) console.log( 'Loop not found for cleanup' ); }
    cleanFace( f: Face ): void{ if( !this.cleanArray( f, this.faces ) ) console.log( 'Face not found for cleanup' ); }
    cleanArray( itm: any, ary: Array< any > ): boolean{
        const a = ary.indexOf( itm );
        if( a === -1 ) return false;

        const z = ary.length - 1;
        if( a !== z ) ary[ a ] = ary[ z ];

        ary.length = z;
        return true;
    }

    // #endregion
}
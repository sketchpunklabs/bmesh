// #region IMPORTS
import type BMesh   from '../BMesh';
import type Vertex  from '../ds/Vertex';
import Edge         from '../ds/Edge';
import Loop         from '../ds/Loop';
import Face         from '../ds/Face';

import QueryOps     from '../ops/QueryOps';
import ConstructOps from '../ops/ConstructOps';
import StructOps    from '../ops/StructOps';
// #endregion

export default class CoreOps{
    
    // #region FACES

    // BM_face_create_verts : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L471C9-L471C29
    static faceCreateVerts( bm: BMesh, verts: Array< Vertex >, createEdges=true ): Face {
        let edges: Array< Edge >;
        if( createEdges ){
            edges = ConstructOps.edgesFromVertsEnsure( bm, verts );
        }else{
            edges = [];
            console.log( "TODO - faceCreateVerts dont createEdges" );
            // if (BM_edges_from_verts(edge_arr, vert_arr, len) == false) {
            //     return nullptr;
            //   }
        }   

        return this.faceCreate( bm, verts, edges );
    }

    // BM_face_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L402
    static faceCreate( bm: BMesh, verts: Array< Vertex >, edges: Array< Edge > ): Face {
        let face : Face | null = QueryOps.faceExists( verts );
        if( face ) return face;

        face         = new Face();
        face.len     = verts.length;

        const lStart : Loop = this.faceBoundaryAdd( bm, face, verts[0], edges[0] );
        let   lLast  : Loop = lStart;
        let   l      : Loop;

        const loops  : Array<Loop> = [ lStart ];

        // Create a closed linked list
        for( let i=1; i < verts.length; i++ ){
            l = bm.addLoop( verts[i], edges[i], face ); // this.loopCreate( verts[i], edges[i], face );
            StructOps.radialLoopAppend( edges[i], l );
            loops.push( l );

            l.prev      = lLast;
            lLast.next  = l;
            lLast       = l;
        }

        lStart.prev = lLast;
        lLast.next  = lStart;

        // CUSTOM: This op wasn't part of blender's fn, added here to make faces more
        // usable as soon as its created in certain visualization debugging.
        if( face.loop ) QueryOps.loopCalcFaceNormal( face.loop, face.norm );

        return face;
    }

    // bm_face_boundary_add : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L265
    static faceBoundaryAdd( bm: BMesh, f: Face, v: Vertex, e: Edge ): Loop{
        const l = bm.addLoop( v, e, f ); // this.loopCreate( v, e, f );
        StructOps.radialLoopAppend( e, l );

        f.loop = l;
        return l;
    }

    // https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L840
    static faceKill( bm: BMesh, f: Face ): void{
        if( f.loop ){
            const origin : Loop = f.loop;
            let iter     : Loop = origin;
            let nIter    : Loop;

            do{
                nIter = iter.next;
                StructOps.radialLoopRemove( iter.edge, iter );
                bm.cleanLoop( iter );

            } while( ( iter = nIter ) != origin );
        }
        
        bm.cleanFace( f );
    }

    // #endregion

    // #region LOOPS

    // bm_loop_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L199
    static loopCreate( v: Vertex, e: Edge, f: Face ){
        const l = new Loop();
        l.vert  = v;
        l.edge  = e;
        l.face  = f;
        
        return l;
    }

    // bmesh_kernel_loop_reverse : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L977
    static loopReverse( f: Face ){
        const initLoop: Loop = f.loop;

        // track previous cycles radial state
        let e_prev: Edge              = initLoop.prev.edge;
        let l_prev_radial_next: Loop  = initLoop.prev.radial_next;
        let l_prev_radial_prev: Loop  = initLoop.prev.radial_prev;
        let is_prev_boundary: boolean = ( l_prev_radial_next == l_prev_radial_next.radial_next );

        let l_iter: Loop = initLoop;
        let e_iter: Edge;
        let tmp   : Loop;

        let l_iter_radial_next: Loop;
        let l_iter_radial_prev: Loop;
        let is_iter_boundary  : boolean;

        do{
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            e_iter             = l_iter.edge;
            l_iter_radial_next = l_iter.radial_next;
            l_iter_radial_prev = l_iter.radial_prev;
            is_iter_boundary   = ( l_iter_radial_next == l_iter_radial_next.radial_next )

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // inline loop reversal
            if( is_prev_boundary ){
                // boundary
                l_iter.radial_next = l_iter;
                l_iter.radial_prev = l_iter;
            }else{
                // non-boundary, replace radial links
                l_iter.radial_next              = l_prev_radial_next;
                l_iter.radial_prev              = l_prev_radial_prev;
                l_prev_radial_next.radial_prev  = l_iter;
                l_prev_radial_prev.radial_next  = l_iter;
            }

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            if( e_iter.loop == l_iter ) e_iter.loop = l_iter.next;
            
            l_iter.edge = e_prev;

            // SWAP(BMLoop *, l_iter->next, l_iter->prev);
            tmp         = l_iter.prev;
            l_iter.prev = l_iter.next;
            l_iter.next = tmp;

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            e_prev              = e_iter;
            l_prev_radial_next  = l_iter_radial_next;
            l_prev_radial_prev  = l_iter_radial_prev;
            is_prev_boundary    = is_iter_boundary;

            // step to next ( now swapped )
        } while ( (l_iter = l_iter.prev) != initLoop );

        // CUSTOM: This op wasn't part of blender's fn, added here to make faces more
        // usable as soon as its created in certain visualization debugging.
        if( f.loop ) QueryOps.loopCalcFaceNormal( f.loop, f.norm );
    }

    // #endregion

    // #region EDGES

    // Create new edge from two vertices
    // BM_edge_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L128
    static edgeCreate( v1: Vertex, v2: Vertex ): Edge | null {
        if( v1 === v2 ){ console.log( 'edge create : vertices the same' ); return null; }

        // Note: Taking this part out. Opting to using edgeExists in BMesh.addEdge
        // instead as it will be the main entry point to creating new edges int he object
        // let edge = QueryOps.edgeExists( v1, v2 );
        // if( edge ) return edge;

        const edge = new Edge( v1, v2 );    // Create edge
        StructOps.diskEdgeAppend( edge, v1 );    // Attach edge to circular lists
        StructOps.diskEdgeAppend( edge, v2 );

        return edge;
    }

    // BM_edge_kill : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L939
    static edgeKill( bm: BMesh, e: Edge ){
        while( e.loop ){
            this.faceKill( bm, e.loop.face ); // Will replace e.loop with next available one till its null
        }

        StructOps.diskEdgeRemove( e, e.v1 );
        StructOps.diskEdgeRemove( e, e.v2 );

        bm.cleanEdge( e );
    }

    // #endregion

    // #region VERTEX

    // BM_vert_kill : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L951
    static vertKill( bm: BMesh, v: Vertex ){
        while( v.edge ) this.edgeKill( bm, v.edge );
        bm.cleanVert( v );
    }

    // #endregion

}
// #region IMPORTS
import type BMesh   from '../BMesh';
import type Vertex  from '../ds/Vertex';
import type Edge    from '../ds/Edge';
import type Face    from '../ds/Face';

import CoreOps      from './CoreOps';
// #endregion

export default class ConstructOps{

    // #region EDGES

    // BM_edges_from_verts_ensure : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_construct.cc#L52
    static edgesFromVertsEnsure( bm: BMesh, verts: Array< Vertex > ): Array< Edge >{
        const rtn   : Array< Edge > = [];
        let edge    : Edge | null;
        let ii      : number;

        for( let i=0; i < verts.length; i++ ){
            ii   = ( i + 1 ) % verts.length;
            // edge = CoreOps.edgeCreate( verts[ i ], verts[ ii ] );
            edge = bm.addEdge( verts[ i ], verts[ ii ] ); // Switch to using BM as main entry to create edges
            if( edge ) rtn.push( edge );
        }

        return rtn;
    }

    // BM_edges_from_verts : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_construct.cc#L39
    // static edgesFromVerts( verts: Array< Vertex > ): boolean { //Array< Edge >
        // const rtn   : Array< Edge > = [];

        // for( let i=0; i < verts.length; i++ ){
        //     QueryOps.edgeExists( verts[i], verts[i+1] );

        //     edge_arr[i_prev] = BM_edge_exists(vert_arr[i_prev], vert_arr[i]);

        //     if( edge_arr[ i_prev ] == nullptr ) return false;

        //     i_prev = i;
        // }

    //     return true;
    // }
    // bool BM_edges_from_verts(BMEdge **edge_arr, BMVert **vert_arr, const int len)
    // {
    // int i, i_prev = len - 1;
    // for (i = 0; i < len; i++) {
    //     edge_arr[i_prev] = BM_edge_exists(vert_arr[i_prev], vert_arr[i]);
    //     if (edge_arr[i_prev] == nullptr) {
    //     return false;
    //     }
    //     i_prev = i;
    // }
    // return true;
    // }


    // bm_edges_sort_winding : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_construct.cc#L136
    static edgesSortWinding( v1: Vertex, v2: Vertex, edges: Array<Edge>, len: number, edges_sort: Array<Edge>, verts_sort: Array<Vertex> ): boolean{
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Find first Edge that share V1 and V2
        // This section was also rewritten to work correctly with the second step
        let v_iter = v1;
        let e_iter : Edge | undefined = undefined;

        for( let j=0; j< edges.length; j++ ){
            if( edges[j].getOtherVert(v_iter) == v2 ){
                e_iter = edges[j];
                edges.splice( j, 1 );
                break;
            }
        }
        
        if( !e_iter ) return false;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // This whole section was rewritten as the original didn't work
        // Since I'm not porting flags & such, some things just dont work correctly
        // In this rewrite, I use the edge array passed in & widdle it down till
        // all the edges are sorted from head to tail

        let isFound   = false;
        let i         = 0;
        edges_sort[0] = e_iter;
        verts_sort[0] = v_iter;
        
        do{
            v_iter  = e_iter.getOtherVert( v_iter ) as Vertex; // Find edge with the other vert
            isFound = false

            for( let j=0; j< edges.length; j++ ){
                if( edges[j].vertExists( v_iter ) ){
                    e_iter = edges[j];
                    edges.splice( j, 1 );

                    i            += 1;
                    edges_sort[i] = e_iter;
                    verts_sort[i] = v_iter;
                    isFound       = true;
                    break;
                }
            }

            if( !isFound ) return false;
            
        } while( edges.length > 0 );

        if( edges.length == 0 ) return true;

        return false;
    }

    // #endregion

    // #region FACES
    
    // BM_face_create_ngon : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_construct.cc#L212C1-L230C2
    static faceCreateNgon( bm: BMesh, v1: Vertex, v2: Vertex, edges: Array<Edge>, len: number ): Face | null {
        const edges_sort : Array< Edge >   = new Array( len );
        const verts_sort : Array< Vertex > = new Array( len );

        if( this.edgesSortWinding( v1, v2, edges, len, edges_sort, verts_sort ) ){
            return CoreOps.faceCreate( bm, verts_sort, edges_sort );
        }

        return null;
    }

    // #endregion

}
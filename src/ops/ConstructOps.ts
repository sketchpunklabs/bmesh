// #region IMPORTS
import type BMesh   from '../BMesh';
import type Vertex  from '../ds/Vertex';
import type Edge    from '../ds/Edge';
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


    // #endregion

}
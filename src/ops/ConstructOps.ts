// #region IMPORTS
import type Vertex  from '../ds/Vertex';
import type Edge    from '../ds/Edge';

import CoreOps      from '../ops/CoreOps';
// #endregion

export default class ConstructOps{

    // #region EDGES

    // BM_edges_from_verts_ensure : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_construct.cc#L52
    static edgesFromVertsEnsure( verts: Array< Vertex > ): Array< Edge >{
        const rtn   : Array< Edge > = [];
        let edge    : Edge | null;
        let ii      : number;

        for( let i=0; i < verts.length; i++ ){
            ii   = ( i + 1 ) % verts.length;
            edge = CoreOps.edgeCreate( verts[ i ], verts[ ii ] );
            if( edge ) rtn.push( edge );
        }

        return rtn;
    }

    // #endregion

}
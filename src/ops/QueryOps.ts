// #region IMPORT
import type Vertex       from '../ds/Vertex';
import type Edge         from '../ds/Edge';
import type Loop         from '../ds/Loop';
import type Face         from '../ds/Face';

import vec3              from '../maths/vec3';
// #endregion

export default class QueryOps{

    // #region EDGES

    // BM_edge_exists : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_query.cc#L1562
    static edgeExists( v1: Vertex, v2: Vertex ): Edge | null{
        if( v1.edge !== null && v2.edge !== null ){
            let iter1: any = v1.edge;
            let iter2: any = v2.edge;

            do{
                if( iter1.vertExists( v2 )  ) return iter1;
                if( iter2.vertExists( v1 )  ) return iter2;

                iter1 = iter1.diskEdgeNext( v1 );
                iter2 = iter2.diskEdgeNext( v2 );
            } while( 
                iter1 !== null && iter1 !== v1.edge &&
                iter2 !== null && iter2 !== v2.edge
            )
        }
        return null;
    }
    
    // #endregion

    // #region FACES / LOOPS

    // BM_face_exists : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_query.cc#L1621
    static faceExists( verts: Array< Vertex > ): Face | null{
        const v = verts[ 0 ];
        if( !v.edge ) return null;

        const len        : number = verts.length;
        const origin     : Edge   = v.edge;
        let iter         : Edge   = origin;

        let first_radial : Loop;
        let iter_radial  : Loop;
        
        do{
            if( iter.loop ){
                first_radial = iter.loop;
                iter_radial  = first_radial;
                
                do {
                    if( iter_radial.vert == v && iter_radial.face.len == len ){

                        // the fist 2 verts match, now check the remaining (len - 2) faces do too
                        // winding isn't known, so check in both directions
                        let i_walk = 2;
                        let l_walk : Loop;
            
                        if( iter_radial.next.vert == verts[1] ){
                            
                            l_walk = iter_radial.next.next;
                            do{
                                if( l_walk.vert != verts[ i_walk ]) break;
                            } while( (l_walk = l_walk.next), ++i_walk != len );

                        }else if( iter_radial.prev.vert == verts[1] ){
                            
                            l_walk = iter_radial.prev.prev;
                            do {
                                if( l_walk.vert != verts[ i_walk ] ) break;
                            } while( (l_walk = l_walk.prev), ++i_walk != len );

                        }
            
                        if( i_walk == len ) return iter_radial.face;
                    }
                
                    iter_radial = iter_radial.radial_next;

                } while( iter_radial && iter_radial !== first_radial );
            }
        } while( (iter = iter.diskEdgeNext( v )) != origin );

        return null
    }

    // BM_loop_calc_face_normal : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_query.cc#L1278
    static loopCalcFaceNormal( l: Loop, n: Array<number> ){
        if( l.next == l.prev ){
            console.log( 'loopCalcFaceNormal : Next & Prev Match' );
            return;
        }

        const a = vec3.sub( l.prev.vert.pos, l.vert.pos );
        const b = vec3.sub( l.next.vert.pos, l.vert.pos );
        const c = vec3.cross( b, a ); // Flip vectors for normals to point in CCW direction
        vec3.norm( c, n );
    }
    // #endregion

}
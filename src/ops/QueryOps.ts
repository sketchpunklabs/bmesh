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

    // BM_edge_is_manifold : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query_inline.h#L75
    static edgeIsManifold( e: Edge ): boolean{
      const l = e.loop;
      return !!( l && ( l.radial_next != l ) &&     // not 0 or 1 face users
              ( l.radial_next.radial_next == l ) ); // 2 face users
    }

    // BM_edge_in_face : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L426
    static edgeInFace( e: Edge, f: Face ): boolean{
        if( e.loop ){
            let l_iter = e.loop;
            do {
                if (l_iter.face == f ) return true;
            } while( (l_iter = l_iter.radial_next) != e.loop );
        }
        
        return false;
    }

    // BM_edge_is_boundary : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query_inline.h#L107
    static edgeIsBoundary( e: Edge ): boolean{
        const l = e.loop;
        return !!( l && ( l.radial_next == l ) );
    }
    
    // BM_edge_face_count_is_over : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.h#L253C9-L253C93
    static edgeFaceCountIsOver( e: Edge, n: number ){ return !!( this.edgeFaceCountAtMost( e, n+1 ) === n+1 ); }
    
    // BM_edge_face_count_at_most : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L651C1-L668C2
    static edgeFaceCountAtMost( e: Edge, count_max: number ){
      let count = 0;
    
      if( e.loop ){
        let l_iter = e.loop;

        do {
          count++;
          if( count == count_max ) break;
        } while ( (l_iter = l_iter.radial_next) !=  e.loop );
      }
    
      return count;
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

    // BM_face_find_double : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L1669
    static faceFindDouble( f: Face ): Face | null{
        const l_first: Loop = f.loop;
        for( let l_iter = l_first.radial_next; l_first != l_iter; l_iter = l_iter.radial_next ){
            if( l_iter.face.len == l_first.face.len ){
                const l_b_init : Loop = l_iter;
                let l_a        : Loop = l_first;
                let l_b        : Loop = l_iter;

                if( l_iter.vert == l_first.vert ){
                    do{
                        if( l_a.edge != l_b.edge ) break;
                        l_a = l_a.next;
                        l_b = l_b.next;
                    } while( l_a != l_b_init && l_b != l_b_init  );
                    
                    if( l_b == l_b_init ) return l_iter.face;
                }else{              
                    do{
                        if( l_a.edge != l_b.edge ) break;
                        l_a = l_a.prev;
                        l_b = l_b.next;
                    } while ( l_a != l_b_init &&  l_b != l_b_init );

                    if( l_b == l_b_init ) return l_iter.face;
                }
            }
        }
        return null;
    }

    // BM_face_edge_share_loop : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L1123
    static faceEdgeShareLoop( f: Face, e: Edge ): Loop | null{
        if( e.loop ){
            let l_iter = e.loop;
            do{
                
                if( l_iter.face == f ) return l_iter;

            } while( (l_iter = l_iter.radial_next) != e.loop );
        }

        return null;
    }

    // BM_face_share_edge_count : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L976
    static faceShareEdgeCount( f_a: Face, f_b: Face ){
      let l_iter  = f_a.loop;
      let count   = 0;

      do {
        if( this.edgeInFace(l_iter.edge, f_b) ) count++;
      } while( (l_iter = l_iter.next) != f_a.loop );
    
      return count;
    }

    // CUSTOM: Get the size of the radial linked list of a loop
    static loopRadialCount( l: Loop ): number{
        let cnt   = 0;
        let iter = l;
        
        do{ cnt++ }
        while( (iter = iter.radial_next) !== l );
        return cnt;
    }

    // #endregion

    // #region VERTICES

    // BM_verts_in_edge : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query_inline.h#L39
    static vertsInEdge( v1: Vertex, v2: Vertex, e: Edge ): boolean{
        return ((e.v1 == v1 && e.v2 == v2) || (e.v1 == v2 && e.v2 == v1));
    }

    // BM_vert_in_face : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L312
    static vertInFace( v: Vertex, f: Face ): boolean{
        let l_iter = f.loop;

        do{
            if( l_iter.vert == v ) return true;
        } while( (l_iter = l_iter.next) != f.loop );

        return false;
    }

    // BM_vert_pair_share_face_check : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query.cc#L105
    static vertPairShareFaceCheck( v_a: Vertex, v_b: Vertex ): boolean{
        if( v_a.edge && v_b.edge ){

            let lIter : Loop;
            let eIter = v_a.edge;
            do{
                
                if( eIter.loop ){
                    lIter = eIter.loop;
                    do{
                        
                        if( this.vertInFace( v_b, lIter.face ) ) return true;

                    } while( (lIter = lIter.radial_next) !== eIter.loop );
                }

            } while( (eIter = eIter.diskEdgeNext( v_a )) !== v_a.edge );
        }
    
      return false;
    }

    // #endregion

}
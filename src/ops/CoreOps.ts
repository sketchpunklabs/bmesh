/* eslint-disable @typescript-eslint/ban-ts-comment */
// #region IMPORTS
import type BMesh   from '../BMesh';
import type Vertex  from '../ds/Vertex';
import Edge         from '../ds/Edge';
import Loop         from '../ds/Loop';
import Face         from '../ds/Face';

import QueryOps     from '../ops/QueryOps';
import ConstructOps from '../ops/ConstructOps';
import StructOps    from '../ops/StructOps';

import { NULLY }    from '../constants';
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

    // BM_face_kill : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L840
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

    // bmesh_kernel_split_face_make_edge: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1342
    static splitFaceMakeEdge( bm: BMesh, f: Face, l_v1: Loop, l_v2: Loop ){
        let first_loop_f1 : number;

        let l_iter  : Loop;
        let l_first : Loop;
        let l_f1    : Loop = NULLY;
        let l_f2    : Loop = NULLY;
        
        let f1len   : number;
        let f2len   : number;

        // allocate new edge between v1 and v2
        const v1   = l_v1.vert;
        const v2   = l_v2.vert;
        const e    = bm.addEdge( v1, v2 ) as Edge;
        const f2   = bm.addFace();
        l_f1 = bm.addLoop( v2, e, f ); 
        l_f2 = bm.addLoop( v1, e, f2 );

        l_f1.prev       = l_v2.prev;
        l_f2.prev       = l_v1.prev;
        l_v2.prev.next  = l_f1;
        l_v1.prev.next  = l_f2;

        l_f1.next = l_v1;
        l_f2.next = l_v2;
        l_v1.prev = l_f1;
        l_v2.prev = l_f2;

        // find which of the faces the original first loop is in
        l_first       = l_f1;
        l_iter        = l_f1;
        first_loop_f1 = 0;

        do{
            if( l_iter == f.loop ) first_loop_f1 = 1;
        } while( (l_iter = l_iter.next) != l_first );

        if( first_loop_f1 ){
            // Original first loop was in f1, find a suitable first loop for f2
            // which is as similar as possible to f1. the order matters for tools
            // such as dupli-faces.
            if( f.loop.prev == l_f1 )       f2.loop = l_f2.prev;
            else if( f.loop.next == l_f1 )  f2.loop = l_f2.next;
            else                            f2.loop = l_f2;
        }else{
            // original first loop was in f2, further do same as above
            f2.loop = f.loop;

            if( f.loop.prev == l_f2 )       f.loop = l_f1.prev;
            else if( f.loop.next == l_f2 )  f.loop = l_f1.next;
            else                            f.loop = l_f1;
        }

        // validate both loop 
        // I don't know how many loops are supposed to be in each face at this point! FIXME

        // go through all of f2's loops and make sure they point to it properly
        l_first = f2.loop;
        l_iter  = f2.loop;
        f2len   = 0;
        do{
            l_iter.face = f2;
            f2len++;
        } while( (l_iter = l_iter.next) != l_first );

        /* link up the new loops into the new edges radial */
        StructOps.radialLoopAppend( e, l_f1 ); // bmesh_radial_loop_append(e, l_f1);
        StructOps.radialLoopAppend( e, l_f2 ); // bmesh_radial_loop_append(e, l_f2);

        f2.len  = f2len;
        f1len   = 0;
        l_first = f.loop;
        l_iter  = f.loop;
        do{
            f1len++;
        } while( (l_iter = l_iter.next) != l_first );

        f.len = f1len;

        // CUSTOM: This op wasn't part of blender's fn, added here to make faces more
        // usable as soon as its created in certain visualization debugging.
        if( f2.loop ) QueryOps.loopCalcFaceNormal( f2.loop, f2.norm );

        return f2;
    }
    
    // bmesh_kernel_join_face_kill_edge: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1884
    static joinFaceKillEdge( bm: BMesh, f1: Face, f2: Face, e: Edge ): Face | null{
        let l_f1: Loop | null = null;
        let l_f2: Loop | null = null;
        let newlen = 0;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // can't join a face to itself
        if( f1 == f2 ) return null;
        
        // validate that edge is 2-manifold edge
        if( !QueryOps.edgeIsManifold( e ) ){
            console.log( 'Error: Edge is not a 2-manifold edge' );
            return null;
        }

        if( !(
            (l_f1 = QueryOps.faceEdgeShareLoop(f1, e)) && 
            (l_f2 = QueryOps.faceEdgeShareLoop(f2, e))
        )) return null;
        
        // validate direction of f2's loop cycle is compatible
        if( l_f1.vert == l_f2.vert ){
            console.log( 'Error: Face windings are not compatible' );
            return null;
        }
        
        // validate that for each face, each vertex has another edge in its disk cycle that is not e, and not shared.
        if( QueryOps.edgeInFace( l_f1.next.edge, f2 ) || QueryOps.edgeInFace( l_f1.prev.edge, f2 ) ||
            QueryOps.edgeInFace( l_f2.next.edge, f1 ) || QueryOps.edgeInFace( l_f2.prev.edge, f1 ) ){

            console.log( 'Error: Faces share to many vertices?' );
            return null;
        }
        
        // validate only one shared edge
        if( QueryOps.faceShareEdgeCount( f1, f2 ) > 1 ){
            console.log( 'Error: Faces share more then 1 edge' );
            return null;
        }
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /* join the two loop */
        l_f1.prev.next = l_f2.next;
        l_f2.next.prev = l_f1.prev;
        
        l_f1.next.prev = l_f2.prev;
        l_f2.prev.next = l_f1.next;
        
        // If `l_f1` was base-loop, make `l_f1.next` the base.
        if( f1.loop == l_f1 ) f1.loop = l_f1.next;
        
        // increase length of f1
        f1.len += (f2.len - 2);
        
        // make sure each loop points to the proper face
        newlen = f1.len;
        for( let i=0, l_iter=f1.loop; i < newlen; i++, l_iter = l_iter.next ){
            l_iter.face = f1;
        }
        
        // remove edge from the disk cycle of its two vertices
        StructOps.diskEdgeRemove(l_f1.edge, l_f1.edge.v1);
        StructOps.diskEdgeRemove(l_f1.edge, l_f1.edge.v2);
        
        // deallocate edge and its two loops as well as f2
        bm.cleanEdge( l_f1.edge );
        bm.cleanLoop( l_f1 );
        bm.cleanLoop( l_f2 );
        bm.cleanFace( f2 );
        
        // validate the new loop cycle
        if( !StructOps.loopValidate( f1 ) ){
            console.log( 'Error: New Face loop didnt pass validation' );
        }

        // CUSTOM : Compute normal for modified face
        if( f1.loop ) QueryOps.loopCalcFaceNormal( f1.loop, f1.norm );
        
        return f1;
    }

    // BM_face_verts_kill: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L823
    static faceVertsKill( bm: BMesh, f: Face ): void{
        const verts: Array< Vertex > = [];        
        let l_iter = f.loop;

        do{
            verts.push( l_iter.vert );
        } while( (l_iter = l_iter.next) != f.loop );
        
        for( let i=0; i < f.len; i++ ){
            this.vertKill( bm, verts[i] );
        }
    }

    // BM_face_edges_kill : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L806
    static faceEdgesKill( bm: BMesh, f: Face ): void{    
        const edges: Array< Edge > = []; 
        let l_iter = f.loop;
        
        do{
            edges.push( l_iter.edge );
        } while( (l_iter = l_iter.next) != f.loop );
        
        for( let i=0; i < f.len; i++ ){
            this.edgeKill( bm, edges[i] );
        }
    }

    // BM_faces_join : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1135    

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

            // SWAP(BMLoop *, l_iter.next, l_iter.prev);
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

    // bmesh_kernel_split_edge_make_vert: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1481
    static splitEdgeMakeVert( bm: BMesh, tv: Vertex, e: Edge ): Vertex{
        const v_old  = e.getOtherVert( tv ) as Vertex;
        
        // EXTRA, Nice to be able to see point right away
        const midPos = [ 
            tv.pos[0] * 0.5 + v_old.pos[0] * 0.5,
            tv.pos[1] * 0.5 + v_old.pos[1] * 0.5,
            tv.pos[2] * 0.5 + v_old.pos[2] * 0.5, 
        ];

        // order of 'e_new' verts should match 'e' (so extruded faces don't flip)
        const v_new: Vertex = bm.addVertex( midPos );
        const e_new: Edge   = bm.addEdge( tv, v_new ) as Edge; // Very unlikely to return null, only if the Two verts are the same

        StructOps.diskEdgeRemove( e_new, tv );
        StructOps.diskEdgeRemove( e_new, v_new );
        StructOps.diskVertReplace( e, v_new, tv );
    
        // add e_new to v_new's disk cycle
        StructOps.diskEdgeAppend( e_new, v_new );
    
        // add e_new to tv's disk cycle
        StructOps.diskEdgeAppend( e_new, tv );

        // Split the radial cycle if present
        let l_next = e.loop;
        e.loop     = null;

        if( l_next ){
            let l_new    : Loop;
            let l        : Loop;
            let is_first : boolean = true;

            // Take the next loop. Remove it from radial. Split it. Append to appropriate radials
            while( l_next ){
                l = l_next;
                l.face.len++;

                l_next = ( l_next != l_next.radial_next )? l_next.radial_next : null;
                StructOps.radialLoopInlink( l );
                
                l_new = bm.addLoop( v_new, NULLY, l.face );
                l_new.prev      = l;
                l_new.next      = l.next;
                l_new.prev.next = l_new;
                l_new.next.prev = l_new;
        
                // assign the correct edge to the correct loop
                if( QueryOps.vertsInEdge( l_new.vert, l_new.next.vert, e ) ){
                    l_new.edge = e;
                    l.edge     = e_new;
            
                    // append l into e_new's rad cycle
                    if( is_first ){
                        is_first      = false;
                        l.radial_next = NULLY;
                        l.radial_prev = NULLY;
                    }

                    StructOps.radialLoopAppend( l_new.edge, l_new );
                    StructOps.radialLoopAppend( l.edge, l );

                }else if( QueryOps.vertsInEdge( l_new.vert, l_new.next.vert, e_new ) ){
                    l_new.edge = e_new;
                    l.edge     = e;
            
                    // append l into e_new's rad cycle
                    if (is_first) {
                        is_first      = false;
                        l.radial_next = NULLY;
                        l.radial_prev = NULLY;
                    }
            
                    StructOps.radialLoopAppend( l_new.edge, l_new );
                    StructOps.radialLoopAppend( l.edge, l );
                }
            }
        }
            
        return v_new;
    }

    // bmesh_kernel_join_edge_kill_vert: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1634
    // do_del : Delete Vert, 
    static joinEdgeKillVert( bm: BMesh, e_kill: Edge, v_kill: Vertex, do_del=true, check_edge_exists=true, kill_degenerate_faces=true, kill_duplicate_faces=true ){
        // Make sure vert is part of edge
        if( !e_kill.vertExists( v_kill ) ) return null;

        if( StructOps.diskCountAtMost( v_kill, 3 ) != 2 ){
            console.log( 'can only join edge on vert that only has two edges' );
            return null;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const e_old    = e_kill.diskEdgeNext( v_kill ) as Edge;
        const v_target = e_kill.getOtherVert( v_kill) as Vertex;
        const v_old    = e_old.getOtherVert( v_kill ) as Vertex;

        /* check for double edges */
        if( QueryOps.vertsInEdge( v_kill, v_target, e_old ) ) return null;

        let e_splice    : Edge | null = null;
        let l_kill_next : Loop;

        if( check_edge_exists ) e_splice = QueryOps.edgeExists( v_target, v_old );

        StructOps.diskVertReplace( e_old, v_target, v_kill );

        // remove e_kill from 'v_target's disk cycle
        StructOps.diskEdgeRemove( e_kill, v_target );

        const faces_degenerate          : Array< Face > = [];
        const faces_duplicate_candidate : Array< Face > = [];

        if( e_kill.loop ){

            // fix the neighboring loops of all loops in e_kill's radial cycle
            let l_kill = e_kill.loop;
            
            do {
                /* relink loops and fix vertex pointer */
                if( l_kill.next.vert == v_kill ) l_kill.next.vert = v_target;

                l_kill.next.prev = l_kill.prev;
                l_kill.prev.next = l_kill.next;

                if( l_kill.face.loop == l_kill ) l_kill.face.loop = l_kill.next;

                // fix len attribute of face
                l_kill.face.len--;
                
                if( kill_degenerate_faces && ( l_kill.face.len < 3 ) ) {
                    faces_degenerate.push( l_kill.face );
                }else {
                    // The duplicate test isn't reliable at this point as `e_splice` might be set,
                    // so the duplicate test needs to run once the edge has been spliced.
                    if( kill_duplicate_faces ){
                        faces_duplicate_candidate.push( l_kill.face );
                    }
                }

                l_kill_next = l_kill.radial_next;

                
                bm.cleanLoop( l_kill );

            } while( ( l_kill = l_kill_next ) != e_kill.loop );
        }

        // deallocate edge
        bm.cleanEdge( e_kill );

        // deallocate vertex
        if( do_del ) bm.cleanVert( v_kill );
        else         v_kill.edge = null;

        if( check_edge_exists && e_splice ){
            this.edgeSplice( bm, e_old, e_splice );
        }

        if( kill_degenerate_faces ){
            let f_kill: Face | undefined;
            while( (f_kill = faces_degenerate.pop()) ){
                this.faceKill( bm, f_kill );
            }
        }

        if (kill_duplicate_faces) {
            let f_kill: Face | undefined;
            while( (f_kill = faces_duplicate_candidate.pop()) ){
                if( QueryOps.faceFindDouble( f_kill ) ){
                    this.faceKill( bm, f_kill );
                }
            }
        }

        return e_old;
    }

    // BM_edge_splice: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L2333
    static edgeSplice( bm: BMesh, e_dst: Edge, e_src: Edge ): boolean{
        let l: Loop;
          
        if( !e_src.vertExists( e_dst.v1 ) || !e_src.vertExists( e_dst.v2 ) ){
            // not the same vertices can't splice 
            // the caller should really make sure this doesn't happen ever
            // so assert on release builds     
            return false;
        }
        
        while( e_src.loop ){
            l = e_src.loop;
            StructOps.radialLoopRemove( e_src, l ); // bmesh_radial_loop_remove(e_src, l);
            StructOps.radialLoopAppend( e_dst, l ); // bmesh_radial_loop_append(e_dst, l);
        }
    
        // removes from disks too
        this.edgeKill( bm, e_src ); // BM_edge_kill(bm, e_src);
        
        return true;
    }

    // bmesh_kernel_edge_separate: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L2366
    // static edgeSeparate( bm: BMesh, e: Edge, l_sep: Loop ){{
    //     // BLI_assert(l_sep.e == e);
    //     // BLI_assert(e.l);

    //     if( QueryOps.edgeIsBoundary( e ) ) return; // no cut required

    //     if( l_sep == e.loop ) e.loop = l_sep.radial_next;

    //     let e_new = bm.addEdge( e.v1, e.v2 ); // BM_edge_create(bm, e.v1, e.v2, e, BM_CREATE_NOP );

    //     if( e_new ){
    //         StructOps.radialLoopRemove( e, l_sep ); // bmesh_radial_loop_remove(e, l_sep);
    //         StructOps.radialLoopAppend( e_new, l_sep ); // bmesh_radial_loop_append(e_new, l_sep);
    //         l_sep.edge = e_new;
    //     }

    //     // if (copy_select) { BM_elem_select_copy(bm, e_new, e); }

    //     // BLI_assert(bmesh_radial_length(e.l) == radlen - 1);
    //     // BLI_assert(bmesh_radial_length(e_new.l) == 1);

    //     // BM_CHECK_ELEMENT(e_new);
    //     // BM_CHECK_ELEMENT(e);
    // }

    // #endregion

    // #region VERTEX

    // BM_vert_kill : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L951
    static vertKill( bm: BMesh, v: Vertex ){
        while( v.edge ) this.edgeKill( bm, v.edge );
        bm.cleanVert( v );
    }

    // bmesh_kernel_join_vert_kill_edge: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L1801
    static joinVertKillEdge( bm: BMesh, e_kill: Edge, v_kill: Vertex, do_del=true, check_edge_exists=true, kill_degenerate_faces=true ): Vertex{
        const faces_degenerate : Array< Face > = [];
        const v_target = e_kill.getOtherVert( v_kill ) as Vertex;

        if( e_kill.loop ){
            let l_kill_next : Loop;
            let l_kill      : Loop = e_kill.loop;
            const l_first   = e_kill.loop;
            
            do{
                // relink loops and fix vertex pointer
                if( l_kill.next.vert == v_kill ) l_kill.next.vert = v_target;

                l_kill.next.prev = l_kill.prev;
                l_kill.prev.next = l_kill.next;
                if( l_kill.face.loop == l_kill ) l_kill.face.loop = l_kill.next;

                // fix len attribute of face
                l_kill.face.len--;
                if( kill_degenerate_faces ){
                    if( l_kill.face.len < 3 ) faces_degenerate.push( l_kill.face );
                }

                l_kill_next = l_kill.radial_next;
                bm.cleanLoop( l_kill );

            } while( (l_kill = l_kill_next) != l_first );

            e_kill.loop = null;
        }

        this.edgeKill( bm, e_kill );

        if( v_target.edge && v_kill.edge ){
            let e        : Edge;
            let e_target : Edge | null = null;
            while( (e = v_kill.edge) ){
                
                if( check_edge_exists ){
                    e_target = QueryOps.edgeExists( v_target, e.getOtherVert( v_kill ) as Vertex );
                }

                StructOps.edgeVertSwap( e, v_target, v_kill );

                if( check_edge_exists && e_target ) this.edgeSplice( bm, e_target, e );
            }
        }

        if( kill_degenerate_faces ){
            let f_kill: Face | undefined;
            while( (f_kill = faces_degenerate.pop()) ){
                this.faceKill( bm, f_kill );
            }
        }

        if( do_del ) bm.cleanVert( v_kill );

        return v_target;
    }

    // BM_vert_splice : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L2050
    // Merges two verts into one, warning This doesn't work for collapsing edges,
    // where v and vtarget are connected by an edge
    // NOTE: Not sure if this works correctly, In my test, it does not clean up
    // the faces & edges affected by v_src. This Op may need to be executed
    // with another to work properly.
    static vertSplice( bm: BMesh, v_dst: Vertex, v_src: Vertex ): boolean{
        let e: Edge | null;
        
        // verts already spliced 
        if( v_src == v_dst )  return false;
        
        // CUSTOM: Assuming that vert splices should not be used on points that share faces
        // So exit out the function if they do share.
        // BLI_assert(BM_vert_pair_share_face_check(v_src, v_dst) == false);
        if( QueryOps.vertPairShareFaceCheck( v_src, v_dst ) ) return false;
        
        
        // move all the edges from 'v_src' disk to 'v_dst' 
        // bmesh_disk_edge_remove will modify v_src.edge if the edge passed to it is the same
        // Thats how this loop will continue & end
        while( (e = v_src.edge) ) {
            StructOps.edgeVertSwap( e, v_dst, v_src );  // bmesh_edge_vert_swap(e, v_dst, v_src);
            // BLI_assert(e.v1 != e.v2);
        }
            
        // 'v_src' is unused now, and can be killed
        bm.cleanVert( v_src ); //BM_vert_kill(bm, v_src);

        return true;
    }

    // bmesh_kernel_vert_separate: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L2086
    // static vertSeparate( bm: BMesh, v: Vertex ): Array< Vertex >{ // , r_vout: Array<Vertex>, r_vout_len,  copy_select = false
    //     let v_edges_num = 0;
        
    //     /* Detailed notes on array use since this is stack memory, we have to be careful */
        
    //     /* newly created vertices, only use when 'r_vout' is set
    //     * (total size will be number of fans) */
    //     //   BLI_SMALLSTACK_DECLARE(verts_new, BMVert *);
    //     const verts_new : Array<Vertex> = [];
    //     /* fill with edges from the face-fan, clearing on completion
    //     * (total size will be max fan edge count) */
    //     //   BLI_SMALLSTACK_DECLARE(edges, BMEdge *);
    //     const edges : Array<Edge> = [];
    //     /* temp store edges to walk over when filling 'edges',
    //     * (total size will be max radial edges of any edge) */
    //     //   BLI_SMALLSTACK_DECLARE(edges_search, BMEdge *);
    //     const edges_search : Array<Edge> = [];
        
    //     // number of resulting verts, include self
    //     let verts_num = 1;
    //     // track the total number of edges handled, so we know when we've found the last fan
    //     let edges_found = 0;
        
    //     // #define EDGE_VISIT _FLAG_WALK
    
    //     // count and flag at once 
    //     if( v.edge ){
            
    //         // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //         let e_iter = v.edge;
    //         // let e_first = v.edge;

    //         do{
    //             v_edges_num += 1;
    //         //   BLI_assert(!BM_ELEM_API_FLAG_TEST(e_iter, EDGE_VISIT));
    //         //   BM_ELEM_API_FLAG_ENABLE(e_iter, EDGE_VISIT);
    //         } while( (e_iter = e_iter.diskEdgeNext( v )) != v.edge );
            
    //         // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //         while (true) {
    //             /* Considering only edges and faces incident on vertex v, walk
    //             * the edges & collect in the 'edges' list for splitting */
            
    //             let e : Edge | undefined = v.edge;
    //                 //   BM_ELEM_API_FLAG_DISABLE(e, EDGE_VISIT);
            
    //             do{
    //                 // BLI_assert(!BM_ELEM_API_FLAG_TEST(e, EDGE_VISIT));
    //                 edges.push( e ); // BLI_SMALLSTACK_PUSH(edges, e);
    //                 edges_found += 1;
            
    //                 // if( e.loop ){
    //                 //     let l_iter =  e.loop;
    //                 //     let l_first = e.loop;

    //                 //     do{
    //                 //         let l_adjacent = ( l_iter.vert == v ) ? l_iter.prev : l_iter.next;
                            
    //                 //         // BLI_assert(BM_vert_in_edge(l_adjacent.e, v));
    //                 //         // if (BM_ELEM_API_FLAG_TEST(l_adjacent.e, EDGE_VISIT)) {
    //                 //         //   BM_ELEM_API_FLAG_DISABLE(l_adjacent.e, EDGE_VISIT);
    //                 //         //   BLI_SMALLSTACK_PUSH(edges_search, l_adjacent.e);
    //                 //         // }

    //                 //     } while( (l_iter = l_iter.radial_next) != l_first );
    //                 // }
    //             } while( (e = edges_search.pop()) );
        
    //             /* now we have all edges connected to 'v.e' */
            
            
    //             if (edges_found == v_edges_num) {
    //                 /* We're done! The remaining edges in 'edges' form the last fan,
    //                 * which can be left as is.
    //                 * if 'edges' were alloc'd it'd be freed here. */
    //                 break;
    //             }
        
    //             let v_new : Vertex;
        
    //             //   v_new = BM_vert_create(bm, v.co, v, BM_CREATE_NOP);
    //             v_new = bm.addVertex( v.pos );
    //             //   if (copy_select) {BM_elem_select_copy(bm, v_new, v);
        
    //             while( (e = edges.pop()) ){
    //                 StructOps.edgeVertSwap( e, v_new, v ); //e, v_new, v
    //             }
        
    //             if (r_vout) {
    //                 // BLI_SMALLSTACK_PUSH(verts_new, v_new);
    //                 verts_new.push( v_new );
    //             }
                
    //             verts_num += 1;
    //         }
    //     }
    
    //     // #undef EDGE_VISIT
    
    //     /* flags are clean now, handle return values */
    //     if( r_vout_len != null ) r_vout_len = verts_num;
    
    //     if( r_vout != nullptr ){
    //         BMVert **verts;
        
    //         verts = static_cast<BMVert **>(MEM_mallocN(sizeof(BMVert *) * verts_num, __func__));
    //         *r_vout = verts;
        
    //         verts[0] = v;
    //         BLI_SMALLSTACK_AS_TABLE(verts_new, &verts[1]);
    //     }
    // }


    // BM_vert_separate: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L2238
    // static vertSeparateBM( bm: BMesh, v: Vertex, e_in: Edge, e_in_len: number, copy_select=false ): void{
    //     LinkNode *edges_separate = null;

    //     for ( let i=0; i < e_in_len; i++) {
    //         let e: Edge = e_in[i];
    //         if( bm_edge_supports_separate( e ) ){
    //             LinkNode *edges_orig = null;
                
    //             do {
    //                 let l_sep = e.loop;
    //                 bmesh_kernel_edge_separate( bm, e, l_sep, copy_select);
    //                 BLI_linklist_prepend_alloca( &edges_orig, l_sep.e);
    //                // BLI_assert(e != l_sep.e);
    //             } while( bm_edge_supports_separate( e ) );

    //             BLI_linklist_prepend_alloca( &edges_orig, e );
    //             BLI_linklist_prepend_alloca( &edges_separate, edges_orig );
    //         }
    //     }

    //     bmesh_kernel_vert_separate( bm, v, r_vout, r_vout_len, copy_select );

    //     if( edges_separate ){
    //         bmesh_kernel_vert_separate__cleanup( bm, edges_separate );
    //     }
    // }

    // #endregion

}
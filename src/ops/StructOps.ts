/* eslint-disable @typescript-eslint/ban-ts-comment */

// #region IMPORTS
import type Vertex      from '../ds/Vertex';
import type Edge        from '../ds/Edge';
import type {DiskLink}  from '../ds/Edge';
import type Loop        from '../ds/Loop';

import { NULLY }        from '../constants';
// #endregion

export default class StructOps{

    // #region EDGES

    // Append Edge to the vertex radial list
    // bmesh_disk_edge_append: https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_structure.cc#L137
    static diskEdgeAppend( e: Edge, v: Vertex ): void{
        // Initial use of a vertex with an edge
        if( !v.edge ){
            const disk = e.getDiskFromVert( v );
            if( disk ){
                v.edge    = e;
                disk.prev = e;
                disk.next = e;
            }
        }else{
            // White boarding the process, it looks like it tries to insert this new edge
            // as the next of the starter edge. In the case of single edge to having two
            // it goes from E0 < E0 > E0 becomes E1 < E0 > E1
            const d1 = e.getDiskFromVert( v );          // This edge's cycle for vertex
            const d2 = v.edge.getDiskFromVert( v );     // Vert's Starter Edge Cycle  
            const d3 = ( d2?.prev )? d2?.prev.getDiskFromVert( v ) : null; // Vert's Starter Edge prevoous

            if( d1 && d2 ){
                d1.next = v.edge;
                d1.prev = d2.prev; 
                d2.prev = e;
            }

            if( d3 ) d3.next = e;
        }
    }

    // Remove an edge from the radial list
    // bmesh_disk_edge_remove : https://github.com/blender/blender/blob/1d9519004a0f13c47ebbe82f6e6a813dc8186e7c/source/blender/bmesh/intern/bmesh_structure.cc#L162
    static diskEdgeRemove( e: Edge, v: Vertex ): void{
        const d1 : DiskLink = e.getDiskFromVert( v );
        let   d2 : DiskLink;

        if( d1.prev ){
            d2      = d1.prev.getDiskFromVert( v );
            d2.next = d1.next;
        }

        if( d1.next ){
            d2 = d1.next.getDiskFromVert( v );
            d2.prev = d1.prev;
        }

        if( v.edge == e ){
            v.edge = ( e != d1.next )? d1.next : null;
        }

        // For GC
        d1.next = NULLY;
        d1.prev = NULLY;
    }

    // #endregion

    // #region VERTEX

    // bmesh_disk_vert_replace : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_structure.cc#L58
    static diskVertReplace( e: Edge, v_dst: Vertex, v_src: Vertex ){
        this.diskEdgeRemove( e, v_src );        // remove e from tv's disk cycle
        this.diskVertSwap( e, v_dst, v_src );   // swap out tv for v_new in e
        this.diskEdgeAppend( e, v_dst );        // add e to v_dst's disk cycle
    }

    // bmesh_disk_vert_swap : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_structure.cc#L20
    static diskVertSwap( e: Edge, v_dst: Vertex, v_src: Vertex ): void{
        if( e.v1 == v_src ){
            e.v1 = v_dst;
            e.v1_disk.next = NULLY;
            e.v1_disk.prev = NULLY;
        
        }else if( e.v2 == v_src ){
            e.v2 = v_dst;
            e.v2_disk.next = NULLY;
            e.v2_disk.prev = NULLY;
        }
    }

    // https://github.com/blender/blender/blob/1d9519004a0f13c47ebbe82f6e6a813dc8186e7c/source/blender/bmesh/intern/bmesh_structure.cc#L200
    // int bmesh_disk_count(const BMVert *v)
    // {
    //   int count = 0;
    //   if (v->e) {
    //     BMEdge *e_first, *e_iter;
    //     e_iter = e_first = v->e;
    //     do {
    //       count++;
    //     } while ((e_iter = bmesh_disk_edge_next(e_iter, v)) != e_first);
    //   }
    //   return count;
    // }

    // Count how many edges that share a vertex, but count till a max value
    // bmesh_disk_count_at_most : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_structure.cc#L213
    static diskCountAtMost( v: Vertex,  count_max: number ): number {
      let count = 0;

      if( v.edge ){
        let e_iter: Edge = v.edge;
        do {
            count++;
            if( count == count_max ) break;
        } while( ( e_iter = e_iter.diskEdgeNext(v) ) != v.edge );
      }

      return count;
    }

    // #endregion

    // #region LOOPS

    // Append to the Radial Link List
    // bmesh_radial_loop_append : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_structure.cc#L375
    static radialLoopAppend( e: Edge, l: Loop ): void{
        if( !e.loop ){
            // First loop for the edge
            e.loop        = l;
            l.radial_next = l
            l.radial_prev = l;
        }else{
            // Append loop to circular list
            l.radial_prev = e.loop;
            l.radial_next = e.loop.radial_next;
            
            e.loop.radial_next.radial_prev = l;
            e.loop.radial_next             = l;
            e.loop                         = l;
        }
        
        if( l.edge && l.edge != e ){
            /* l is already in a radial cycle for a different edge */
            console.log( 'UNLIKELY - Loop is already a cycle for a different edge' );
        }
        
        l.edge = e;
    }

    // bmesh_radial_loop_remove : https://github.com/blender/blender/blob/1d9519004a0f13c47ebbe82f6e6a813dc8186e7c/source/blender/bmesh/intern/bmesh_structure.cc#L399
    static radialLoopRemove( e: Edge, l: Loop ): void{
        if( e != l.edge ){
            console.log( 'Unlikely: if e is non-nullptr, l must be in the radial cycle of e' );
            return;
        }
    
        if( l.radial_next !== l ){
            if( l == e.loop ) e.loop = l.radial_next;
    
            l.radial_next.radial_prev = l.radial_prev;
            l.radial_prev.radial_next = l.radial_next;
        }else{
            if( l == e.loop ) e.loop = null;
        }
    
        // l is no longer in a radial cycle; empty the links
        // to the cycle and the link back to an edge 

        // For GC
        l.radial_next = NULLY;
        l.radial_prev = NULLY;
        l.edge        = NULLY;
    }

    // bmesh_radial_loop_unlink : https://github.com/blender/blender/blob/1d9519004a0f13c47ebbe82f6e6a813dc8186e7c/source/blender/bmesh/intern/bmesh_structure.cc#L429
    static radialLoopInlink( l: Loop ): void{
        if( l.radial_next != l ){
            l.radial_next.radial_prev = l.radial_prev;
            l.radial_prev.radial_next = l.radial_next;
        }
        // l is no longer in a radial cycle; empty the links to the cycle and the link back to an edge 
        l.radial_next = NULLY;
        l.radial_prev = NULLY;
        l.edge        = NULLY;
    }

    // #endregion

}
/*
https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/bmesh_class.h#L112
* disk link structure, only used by edges
typedef struct BMDiskLink {
    struct BMEdge *next, *prev;
  } BMDiskLink;
  
typedef struct BMEdge {
    BMHeader head;

    * Vertices (unordered),
    *
    * Although the order can be used at times,
    * when extruding a face from a wire-edge for example.
    *
    * Operations that create/subdivide edges shouldn't flip the order
    * unless there is a good reason to do so.

    BMVert *v1, *v2;


    * The list of loops around the edge, see doc-string for #BMLoop.radial_next
    * for an example of using this to loop over all faces used by an edge.
    struct BMLoop *l;

    * Disk Cycle Pointers
    *
    * relative data: d1 indicates the next/prev
    * edge around vertex v1 and d2 does the same for v2.
    BMDiskLink v1_disk_link, v2_disk_link;
} BMEdge;
*/

import type Vertex from './Vertex';
import type Loop   from './Loop';

// Circular linked List of edges
export class DiskLink{
    next !: Edge;  // Use any to make it null without the requirement to have null checks
    prev !: Edge;  // Will only be set to null when deleting to help with garbage collection
}

export default class Edge{

    // #region MAIN
    id      !: number;
    v1      !: Vertex;
    v2      !: Vertex;
    loop     : Loop | null = null; // First loop, use to loop over all faces this edge is part of

    v1_disk  : DiskLink = new DiskLink; // Circular linked List of edges using V1 as origin
    v2_disk  : DiskLink = new DiskLink; // Circular linked List of edges using v2 as origin
    
    constructor( v1?: Vertex, v2?: Vertex ){
        if( v1 && v2 ){
            this.v1 = v1;
            this.v2 = v2;
        }
    }
    // #endregion

    // #region BMESH OPS / QUERIES

    // bmesh_disk_edge_link_from_vert : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_structure_inline.h#L17
    getDiskFromVert( v: Vertex ): DiskLink{
        return ( v === this.v1 )? this.v1_disk : this.v2_disk; 
    }

    // bmesh_disk_edge_next : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/bmesh_class.h#L643
    diskEdgeNext( v: Vertex ): Edge{
        return ( v === this.v1 )? this.v1_disk.next : this.v2_disk.next; 
    }

    // BM_vert_in_edge : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_query_inline.h#L19
    vertExists( v: Vertex ): boolean{ return ( this.v1 === v || this.v2 === v ); }

    // BM_edge_other_vert : https://github.com/blender/blender/blob/2864c20302513dae0443af461d225b5a1987267a/source/blender/bmesh/intern/bmesh_query_inline.h#L48
    getOtherVert( v: Vertex ): Vertex | null{ 
        if( v == this.v1 ) return this.v2;
        if( v == this.v2 ) return this.v1;
        return null
    }
 
    // #endregion

}
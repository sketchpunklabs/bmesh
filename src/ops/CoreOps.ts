// #region IMPORTS
// import type BMesh   from '../BMesh';
import Vertex       from '../ds/Vertex';
import Edge         from '../ds/Edge';
import Loop         from '../ds/Loop';
import Face         from '../ds/Face';

import QueryOps     from '../ops/QueryOps';
import ConstructOps from '../ops/ConstructOps';
// #endregion

export default class CoreOps{
    
    // #region FACES

    // BM_face_create_verts : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L471C9-L471C29
    static faceCreateVerts( verts: Array< Vertex >, createEdges=true ): { face: Face, loops?:Array<Loop>, edges?:Array<Edge> }{
        let edges: Array< Edge >;
        if( createEdges ){
            edges = ConstructOps.edgesFromVertsEnsure( verts );
        }else{
            edges = [];
            console.log( "TODO - faceCreateVerts dont createEdges" );
            // if (BM_edges_from_verts(edge_arr, vert_arr, len) == false) {
            //     return nullptr;
            //   }
        }   

        const result = this.faceCreate( verts, edges );

        return {
            face  : result.face,
            loops : result.loops,
            edges : ( createEdges )? edges : undefined,
        };
    }

    // BM_face_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L402
    static faceCreate( verts: Array< Vertex >, edges: Array< Edge > ): { face: Face, loops ?: Array<Loop> }{
        let face : Face | null = QueryOps.faceExists( verts );
        if( face ) return { face };

        face         = new Face();
        face.len     = verts.length;

        const lStart : Loop = this.faceBoundaryAdd( face, verts[0], edges[0] );
        let   lLast  : Loop = lStart;
        let   l      : Loop;

        const loops  : Array<Loop> = [ lStart ];

        // Create a closed linked list
        for( let i=1; i < verts.length; i++ ){
            l = this.loopCreate( verts[i], edges[i], face );
            this.radialLoopAppend( edges[i], l );
            loops.push( l );

            l.prev      = lLast;
            lLast.next  = l;
            lLast       = l;
        }

        lStart.prev = lLast;
        lLast.next  = lStart;

        return { face, loops };
    }

    // bm_face_boundary_add : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L265
    static faceBoundaryAdd( f: Face, v: Vertex, e: Edge ): Loop{
        const l = this.loopCreate( v, e, f );
        this.radialLoopAppend( e, l )

        f.l_first = l;
        return l;
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

    // #endregion

    // #region EDGES

    // Create new edge from two vertices
    // BM_edge_create : https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/intern/bmesh_core.cc#L128
    static edgeCreate( v1: Vertex, v2: Vertex ): Edge | null {
        if( v1 === v2 ){ console.log( 'edge create : vertices the same' ); return null; }

        let edge = QueryOps.edgeExists( v1, v2 );
        if( edge ) return edge;

        edge = new Edge( v1, v2 );    // Create edge
        this.diskEdgeAppend( edge, v1 );    // Attach edge to circular lists
        this.diskEdgeAppend( edge, v2 );

        return edge;
    }

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

    // #endregion

}
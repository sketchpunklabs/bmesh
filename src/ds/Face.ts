/*
https://github.com/blender/blender/blob/48e60dcbffd86f3778ce75ab67f95461ffbe319c/source/blender/bmesh/bmesh_class.h#L260
typedef struct BMFace {
    BMHeader head;
  
  #ifdef USE_BMESH_HOLES
    int totbounds;  // Total boundaries, is one plus the number of holes in the face.
    ListBase loops;
  #else
    BMLoop *l_first;
  #endif
    
     * Number of vertices in the face
     * (the length of #BMFace.l_first circular linked list).

    int len;

     * Face normal, see #BM_face_calc_normal.

    float no[3];
    
     * Material index, typically >= 0 and < #Mesh.totcol although this isn't enforced
     * Python for e.g. can set this to any positive value since scripts may create
     * mesh data first and setup material slots later.
     *
     * When using to index into a material array it's range should be checked first,
     * values exceeding the range should be ignored or treated as zero
     * (if a material slot needs to be used - when drawing for e.g.)
     
    short mat_nr;
    //  short _pad[3];
  } BMFace;
*/

import type Loop from './Loop';

export default class Face {
    loop    : Loop | null       = null;     // First loop that forms this face.
    len     : number            = 0;        // Length of circular linked list
    norm    : Array< number >   = [0,0,0];  // Face Normal
}
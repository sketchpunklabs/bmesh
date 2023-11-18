export default class Transform2D{
    constructor(){
        this.scl = 1;       // All axis scale
        this.rot = 0;       // Rotation in Degrees
        this.pos = [0,0];   // Pixel Position
    }

    // Apply transform to a Vector 2
    applyTo( out=[0,0] ){
        // GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;

        // Scale
        let x = out[0] * this.scl;
        let y = out[1] * this.scl;

        // Rotate
        const rad = this.rot * Math.PI / 180;
        const cos = Math.cos( rad );
        const sin = Math.sin( rad );
        out[0] = x * cos - y * sin;
        out[1] = x * sin + y * cos;

        // Translate
        out[0] += this.pos[0];
        out[1] += this.pos[1];
        return out;
    }

    applyRotationTo( out=[0,0] ){
        const rad = this.rot * Math.PI / 180;
        const cos = Math.cos( rad );
        const sin = Math.sin( rad );
        const x   = out[0];
        const y   = out[1];
        out[0] = x * cos - y * sin;
        out[1] = x * sin + y * cos;
        return out;
    }

    // Create an inverted transform
    fromInvert( t ){
        // Invert rotation
        this.rot = -t.rot;

        // Invert Scale
        this.scl = 1 / t.scl;
        
        // Invert Position : rotInv * ( invScl * -Pos )
        const x   = -t.pos[0] * this.scl;
        const y   = -t.pos[1] * this.scl;

        const rad = this.rot * Math.PI / 180;
        const cos = Math.cos( rad );
        const sin = Math.sin( rad );

        this.pos[0] = x * cos - y * sin;
        this.pos[1] = x * sin + y * cos;
        return this;
    }
}
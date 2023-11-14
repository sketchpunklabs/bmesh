class Vec3 extends Array {
    static UP = [0, 1, 0];
    static DOWN = [0, -1, 0];
    static LEFT = [-1, 0, 0];
    static RIGHT = [1, 0, 0];
    static FORWARD = [0, 0, 1];
    static BACK = [0, 0, -1];
    constructor(v, y, z) {
      super(3);
      if (v instanceof Vec3 || v instanceof Float32Array || v instanceof Array && v.length == 3) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
      } else if (typeof v === "number" && typeof y === "number" && typeof z === "number") {
        this[0] = v;
        this[1] = y;
        this[2] = z;
      } else if (typeof v === "number") {
        this[0] = v;
        this[1] = v;
        this[2] = v;
      } else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
      }
    }
    get len() {
      return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
    }
    get lenSqr() {
      return this[0] ** 2 + this[1] ** 2 + this[2] ** 2;
    }
    get isZero() {
      return this[0] === 0 && this[1] === 0 && this[2] === 0;
    }
    clone() {
      return new Vec3(this);
    }
    minAxis() {
      if (this[0] < this[1] && this[0] < this[2])
        return 0;
      if (this[1] < this[2])
        return 1;
      return 2;
    }
    maxAxis() {
      if (this[0] > this[1] && this[0] > this[2])
        return 0;
      if (this[1] > this[2])
        return 1;
      return 2;
    }
    xyz(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this;
    }
    copy(a) {
      this[0] = a[0];
      this[1] = a[1];
      this[2] = a[2];
      return this;
    }
    copyTo(a) {
      a[0] = this[0];
      a[1] = this[1];
      a[2] = this[2];
      return this;
    }
    setInfinite(sign = 1) {
      this[0] = Infinity * sign;
      this[1] = Infinity * sign;
      this[2] = Infinity * sign;
      return this;
    }
    rnd(x0 = 0, x1 = 1, y0 = 0, y1 = 1, z0 = 0, z1 = 1) {
      let t;
      t = Math.random();
      this[0] = x0 * (1 - t) + x1 * t;
      t = Math.random();
      this[1] = y0 * (1 - t) + y1 * t;
      t = Math.random();
      this[2] = z0 * (1 - t) + z1 * t;
      return this;
    }
    fromAdd(a, b) {
      this[0] = a[0] + b[0];
      this[1] = a[1] + b[1];
      this[2] = a[2] + b[2];
      return this;
    }
    fromSub(a, b) {
      this[0] = a[0] - b[0];
      this[1] = a[1] - b[1];
      this[2] = a[2] - b[2];
      return this;
    }
    fromMul(a, b) {
      this[0] = a[0] * b[0];
      this[1] = a[1] * b[1];
      this[2] = a[2] * b[2];
      return this;
    }
    fromScale(a, s) {
      this[0] = a[0] * s;
      this[1] = a[1] * s;
      this[2] = a[2] * s;
      return this;
    }
    fromScaleThenAdd(scale, a, b) {
      this[0] = a[0] * scale + b[0];
      this[1] = a[1] * scale + b[1];
      this[2] = a[2] * scale + b[2];
      return this;
    }
    fromCross(a, b) {
      const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
      this[0] = ay * bz - az * by;
      this[1] = az * bx - ax * bz;
      this[2] = ax * by - ay * bx;
      return this;
    }
    fromNegate(a) {
      this[0] = -a[0];
      this[1] = -a[1];
      this[2] = -a[2];
      return this;
    }
    fromInvert(a) {
      this[0] = 1 / a[0];
      this[1] = 1 / a[1];
      this[2] = 1 / a[2];
      return this;
    }
    fromPerpendicular(a) {
      this[0] = -a[1];
      this[1] = a[0];
      this[2] = a[2];
      return this;
    }
    fromQuat(q, v) {
      const qx = q[0], qy = q[1], qz = q[2], qw = q[3], vx = v[0], vy = v[1], vz = v[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
      this[0] = vx + 2 * x2;
      this[1] = vy + 2 * y2;
      this[2] = vz + 2 * z2;
      return this;
    }
    fromPolar(lon, lat) {
      const phi = (90 - lat) * 0.01745329251, theta = lon * 0.01745329251, sp = Math.sin(phi);
      this[0] = -sp * Math.sin(theta);
      this[1] = Math.cos(phi);
      this[2] = sp * Math.cos(theta);
      return this;
    }
    fromStruct(v) {
      this[0] = v.x;
      this[1] = v.y;
      this[2] = v.z;
      return this;
    }
    toStruct(v) {
      v.x = this[0];
      v.y = this[1];
      v.z = this[2];
      return this;
    }
    fromVec2(v, isYUp = false) {
      this[0] = v[0];
      if (isYUp) {
        this[1] = 0;
        this[2] = v[1];
      } else {
        this[1] = v[1];
        this[2] = 0;
      }
      return this;
    }
    fromNorm(v) {
      let mag = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      if (mag == 0)
        return this;
      mag = 1 / mag;
      this[0] = v[0] * mag;
      this[1] = v[1] * mag;
      this[2] = v[2] * mag;
      return this;
    }
    fromTriNorm(a, b, c) {
      const ab = new Vec3().fromSub(b, a);
      const ac = new Vec3().fromSub(c, a);
      return this.fromCross(ab, ac).norm();
    }
    fromAxisAngle(axis, rad, v = Vec3.FORWARD) {
      const cp = new Vec3().fromCross(axis, v), dot = Vec3.dot(axis, v), s = Math.sin(rad), c = Math.cos(rad), ci = 1 - c;
      this[0] = v[0] * c + cp[0] * s + axis[0] * dot * ci;
      this[1] = v[1] * c + cp[1] * s + axis[1] * dot * ci;
      this[2] = v[2] * c + cp[2] * s + axis[2] * dot * ci;
      return this;
    }
    fromOrthogonal(v) {
      if (v[0] >= 0.57735026919) {
        this[0] = v[1];
        this[1] = -v[0];
        this[2] = 0;
      } else {
        this[0] = 0;
        this[1] = v[2];
        this[2] = -v[1];
      }
      return this;
    }
    fromReflect(dir, norm) {
      const factor = -2 * Vec3.dot(norm, dir);
      this[0] = factor * norm[0] + dir[0];
      this[1] = factor * norm[1] + dir[1];
      this[2] = factor * norm[2] + dir[2];
      return this;
    }
    fromPlaneProj(v, planePos, planeNorm) {
      const planeConst = -Vec3.dot(planePos, planeNorm);
      const scl = -(Vec3.dot(planeNorm, v) + planeConst);
      this[0] = v[0] + planeNorm[0] * scl;
      this[1] = v[1] + planeNorm[1] * scl;
      this[2] = v[2] + planeNorm[2] * scl;
      return this;
    }
    fromProject(from, to) {
      const denom = Vec3.dot(to, to);
      if (denom < 1e-6) {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
      } else {
        const scl = Vec3.dot(from, to) / denom;
        this[0] = to[0] * scl;
        this[1] = to[1] * scl;
        this[2] = to[2] * scl;
      }
      return this;
    }
    fromBuf(ary, idx) {
      this[0] = ary[idx];
      this[1] = ary[idx + 1];
      this[2] = ary[idx + 2];
      return this;
    }
    toBuf(ary, idx) {
      ary[idx] = this[0];
      ary[idx + 1] = this[1];
      ary[idx + 2] = this[2];
      return this;
    }
    pushTo(ary) {
      ary.push(this[0], this[1], this[2]);
      return this;
    }
    fromLerp(a, b, t) {
      const ti = 1 - t;
      this[0] = a[0] * ti + b[0] * t;
      this[1] = a[1] * ti + b[1] * t;
      this[2] = a[2] * ti + b[2] * t;
      return this;
    }
    fromNLerp(a, b, t) {
      const ti = 1 - t;
      this[0] = a[0] * ti + b[0] * t;
      this[1] = a[1] * ti + b[1] * t;
      this[2] = a[2] * ti + b[2] * t;
      this.norm();
      return this;
    }
    fromSlerp(a, b, t) {
      const angle = Math.acos(Math.min(Math.max(Vec3.dot(a, b), -1), 1));
      const sin = Math.sin(angle);
      const ta = Math.sin((1 - t) * angle) / sin;
      const tb = Math.sin(t * angle) / sin;
      this[0] = ta * a[0] + tb * b[0];
      this[1] = ta * a[1] + tb * b[1];
      this[2] = ta * a[2] + tb * b[2];
      return this;
    }
    fromHermite(a, b, c, d, t) {
      const tt = t * t;
      const f1 = tt * (2 * t - 3) + 1;
      const f2 = tt * (t - 2) + t;
      const f3 = tt * (t - 1);
      const f4 = tt * (3 - 2 * t);
      this[0] = a[0] * f1 + b[0] * f2 + c[0] * f3 + d[0] * f4;
      this[1] = a[1] * f1 + b[1] * f2 + c[1] * f3 + d[1] * f4;
      this[2] = a[2] * f1 + b[2] * f2 + c[2] * f3 + d[2] * f4;
      return this;
    }
    fromBezier(a, b, c, d, t) {
      const it = 1 - t;
      const it2 = it * it;
      const tt = t * t;
      const f1 = it2 * it;
      const f2 = 3 * t * it2;
      const f3 = 3 * tt * it;
      const f4 = tt * t;
      this[0] = a[0] * f1 + b[0] * f2 + c[0] * f3 + d[0] * f4;
      this[1] = a[1] * f1 + b[1] * f2 + c[1] * f3 + d[1] * f4;
      this[2] = a[2] * f1 + b[2] * f2 + c[2] * f3 + d[2] * f4;
      return this;
    }
    fromCubic(a, b, c, d, t) {
      const t2 = t * t, t3 = t * t2, a0 = d[0] - c[0] - a[0] + b[0], a1 = d[1] - c[1] - a[1] + b[1], a2 = d[2] - c[2] - a[2] + b[2];
      this[0] = a0 * t3 + (a[0] - b[0] - a0) * t2 + (c[0] - a[0]) * t + b[0];
      this[1] = a1 * t3 + (a[1] - b[1] - a1) * t2 + (c[1] - a[1]) * t + b[1];
      this[2] = a2 * t3 + (a[2] - b[2] - a2) * t2 + (c[2] - a[2]) * t + b[2];
      return this;
    }
    add(a) {
      this[0] += a[0];
      this[1] += a[1];
      this[2] += a[2];
      return this;
    }
    sub(v) {
      this[0] -= v[0];
      this[1] -= v[1];
      this[2] -= v[2];
      return this;
    }
    mul(v) {
      this[0] *= v[0];
      this[1] *= v[1];
      this[2] *= v[2];
      return this;
    }
    div(v) {
      this[0] /= v[0];
      this[1] /= v[1];
      this[2] /= v[2];
      return this;
    }
    scale(v) {
      this[0] *= v;
      this[1] *= v;
      this[2] *= v;
      return this;
    }
    divScale(v) {
      this[0] /= v;
      this[1] /= v;
      this[2] /= v;
      return this;
    }
    addScaled(a, s) {
      this[0] += a[0] * s;
      this[1] += a[1] * s;
      this[2] += a[2] * s;
      return this;
    }
    invert() {
      this[0] = 1 / this[0];
      this[1] = 1 / this[1];
      this[2] = 1 / this[2];
      return this;
    }
    norm() {
      let mag = Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
      if (mag != 0) {
        mag = 1 / mag;
        this[0] *= mag;
        this[1] *= mag;
        this[2] *= mag;
      }
      return this;
    }
    cross(b) {
      const ax = this[0], ay = this[1], az = this[2], bx = b[0], by = b[1], bz = b[2];
      this[0] = ay * bz - az * by;
      this[1] = az * bx - ax * bz;
      this[2] = ax * by - ay * bx;
      return this;
    }
    abs() {
      this[0] = Math.abs(this[0]);
      this[1] = Math.abs(this[1]);
      this[2] = Math.abs(this[2]);
      return this;
    }
    floor() {
      this[0] = Math.floor(this[0]);
      this[1] = Math.floor(this[1]);
      this[2] = Math.floor(this[2]);
      return this;
    }
    ceil() {
      this[0] = Math.ceil(this[0]);
      this[1] = Math.ceil(this[1]);
      this[2] = Math.ceil(this[2]);
      return this;
    }
    min(a) {
      this[0] = Math.min(this[0], a[0]);
      this[1] = Math.min(this[1], a[1]);
      this[2] = Math.min(this[2], a[2]);
      return this;
    }
    max(a) {
      this[0] = Math.max(this[0], a[0]);
      this[1] = Math.max(this[1], a[1]);
      this[2] = Math.max(this[2], a[2]);
      return this;
    }
    nearZero() {
      if (Math.abs(this[0]) <= 1e-6)
        this[0] = 0;
      if (Math.abs(this[1]) <= 1e-6)
        this[1] = 0;
      if (Math.abs(this[2]) <= 1e-6)
        this[2] = 0;
      return this;
    }
    negate() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      return this;
    }
    snap(v) {
      this[0] = v[0] != 0 ? Math.floor(this[0] / v[0]) * v[0] : 0;
      this[1] = v[1] != 0 ? Math.floor(this[1] / v[1]) * v[1] : 0;
      this[2] = v[2] != 0 ? Math.floor(this[2] / v[2]) * v[2] : 0;
      return this;
    }
    clamp(min, max) {
      this[0] = Math.min(Math.max(this[0], min[0]), max[0]);
      this[1] = Math.min(Math.max(this[1], min[1]), max[1]);
      this[2] = Math.min(Math.max(this[2], min[2]), max[2]);
      return this;
    }
    damp(v, lambda, dt) {
      const t = Math.exp(-lambda * dt);
      const ti = 1 - t;
      this[0] = this[0] * t + v[0] * ti;
      this[1] = this[1] * t + v[1] * ti;
      this[2] = this[2] * t + v[2] * ti;
      return this;
    }
    dot(b) {
      return this[0] * b[0] + this[1] * b[1] + this[2] * b[2];
    }
    axisAngle(axis, rad) {
      const cp = new Vec3().fromCross(axis, this), dot = Vec3.dot(axis, this), s = Math.sin(rad), c = Math.cos(rad), ci = 1 - c;
      this[0] = this[0] * c + cp[0] * s + axis[0] * dot * ci;
      this[1] = this[1] * c + cp[1] * s + axis[1] * dot * ci;
      this[2] = this[2] * c + cp[2] * s + axis[2] * dot * ci;
      return this;
    }
    rotate(rad, axis = "x") {
      const sin = Math.sin(rad), cos = Math.cos(rad), x = this[0], y = this[1], z = this[2];
      switch (axis) {
        case "y":
          this[0] = z * sin + x * cos;
          this[2] = z * cos - x * sin;
          break;
        case "x":
          this[1] = y * cos - z * sin;
          this[2] = y * sin + z * cos;
          break;
        case "z":
          this[0] = x * cos - y * sin;
          this[1] = x * sin + y * cos;
          break;
      }
      return this;
    }
    transformQuat(q) {
      const qx = q[0], qy = q[1], qz = q[2], qw = q[3], vx = this[0], vy = this[1], vz = this[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
      this[0] = vx + 2 * x2;
      this[1] = vy + 2 * y2;
      this[2] = vz + 2 * z2;
      return this;
    }
    transformMat3(m) {
      const x = this[0], y = this[1], z = this[2];
      this[0] = x * m[0] + y * m[3] + z * m[6];
      this[1] = x * m[1] + y * m[4] + z * m[7];
      this[2] = x * m[2] + y * m[5] + z * m[8];
      return this;
    }
    transformMat4(m) {
      const x = this[0], y = this[1], z = this[2], w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
      this[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
      this[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
      this[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
      return this;
    }
    static len(a) {
      return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
    }
    static lenSqr(a) {
      return a[0] ** 2 + a[1] ** 2 + a[2] ** 2;
    }
    static dist(a, b) {
      return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
    }
    static distSqr(a, b) {
      return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    }
    static dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    static cross(a, b, out = new Vec3()) {
      const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    }
    static norm(a) {
      let mag = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
      if (mag != 0) {
        mag = 1 / mag;
        a[0] = a[0] * mag;
        a[1] = a[1] * mag;
        a[2] = a[2] * mag;
      }
      return a;
    }
    static angle(a, b) {
      const d = this.dot(a, b), c = new Vec3().fromCross(a, b);
      return Math.atan2(Vec3.len(c), d);
    }
    static scaleThenAdd(scale, a, b, out = new Vec3()) {
      out[0] = a[0] * scale + b[0];
      out[1] = a[1] * scale + b[1];
      out[2] = a[2] * scale + b[2];
      return out;
    }
    static fromQuat(q, v = [0, 0, 1]) {
      return new Vec3(v).transformQuat(q);
    }
    static iterBuf(buf) {
      let i = 0;
      const result = { value: new Vec3(), done: false }, len = buf.length, next = () => {
        if (i >= len)
          result.done = true;
        else {
          result.value.fromBuf(buf, i);
          i += 3;
        }
        return result;
      };
      return { [Symbol.iterator]() {
        return { next };
      } };
    }
  }class Quat extends Array {
    static LOOKXP = [0, -0.7071067811865475, 0, 0.7071067811865475];
    static LOOKXN = [0, 0.7071067811865475, 0, 0.7071067811865475];
    static LOOKYP = [0.7071067811865475, 0, 0, 0.7071067811865475];
    static LOOKYN = [-0.7071067811865475, 0, 0, 0.7071067811865475];
    static LOOKZP = [0, -1, 0, 0];
    static LOOKZN = [0, 0, 0, 1];
    constructor(v) {
      super(4);
      if (v instanceof Quat || v instanceof Float32Array || v instanceof Array && v.length == 4) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this[3] = v[3];
      } else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 1;
      }
    }
    get x() {
      return this[0];
    }
    set x(v) {
      this[0] = v;
    }
    get y() {
      return this[1];
    }
    set y(v) {
      this[1] = v;
    }
    get z() {
      return this[2];
    }
    set z(v) {
      this[2] = v;
    }
    get w() {
      return this[3];
    }
    set w(v) {
      this[3] = v;
    }
    xyzw(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this;
    }
    identity() {
      this[0] = 0;
      this[1] = 0;
      this[2] = 0;
      this[3] = 1;
      return this;
    }
    copy(a) {
      this[0] = a[0];
      this[1] = a[1];
      this[2] = a[2];
      this[3] = a[3];
      return this;
    }
    copyTo(a) {
      a[0] = this[0];
      a[1] = this[1];
      a[2] = this[2];
      a[3] = this[3];
      return this;
    }
    clone() {
      return new Quat(this);
    }
    toString(rnd = 0) {
      if (rnd == 0)
        return "[" + this.join(",") + "]";
      else {
        let s = "[";
        for (let i = 0; i < 4; i++) {
          switch (this[i]) {
            case 0:
              s += "0,";
              break;
            case 1:
              s += "1,";
              break;
            default:
              s += this[i].toFixed(rnd) + ",";
              break;
          }
        }
        return s.slice(0, -1) + "]";
      }
    }
    isZero() {
      return this[0] == 0 && this[1] == 0 && this[2] == 0 && this[3] == 0;
    }
    lenSqr() {
      return this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2;
    }
    len() {
      return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2);
    }
    getAxisAngle() {
      if (this[3] > 1)
        this.norm();
      const angle = 2 * Math.acos(this[3]), s = Math.sqrt(1 - this[3] * this[3]);
      if (s < 1e-3)
        return [1, 0, 0, 0];
      return [this[0] / s, this[1] / s, this[2] / s, angle];
    }
    getAngle() {
      if (this[3] > 1)
        this.norm();
      return 2 * Math.acos(this[3]);
    }
    getAxis(out) {
      if (this[3] > 1)
        this.norm();
      const s = Math.sqrt(1 - this[3] ** 2);
      out = out || [0, 0, 0];
      if (s < 1e-3) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
      } else {
        out[0] = this[0] / s;
        out[1] = this[1] / s;
        out[2] = this[2] / s;
      }
      return out;
    }
    fromPolar(lon, lat, up) {
      lat = Math.max(Math.min(lat, 89.999999), -89.999999);
      const phi = (90 - lat) * 0.01745329251, theta = lon * 0.01745329251, phi_s = Math.sin(phi), v = [
        -(phi_s * Math.sin(theta)),
        Math.cos(phi),
        phi_s * Math.cos(theta)
      ];
      this.fromLook(v, up || Vec3.UP);
      return this;
    }
    toPolar() {
      const fwd = new Vec3().fromQuat(this, Vec3.FORWARD);
      const flat = new Vec3(fwd[0], 0, fwd[2]).norm();
      let lon = Vec3.angle(Vec3.FORWARD, flat);
      let lat = Vec3.angle(flat, fwd);
      const d_side = Vec3.dot(fwd, Vec3.RIGHT);
      const d_up = Vec3.dot(fwd, Vec3.UP);
      if (d_side < 0)
        lon = -lon;
      if (d_up < 0)
        lat = -lat;
      if (d_up > 0.999 || d_up <= -0.999)
        lon = 0;
      const to_deg = 180 / Math.PI;
      return [lon * to_deg, lat * to_deg];
    }
    fromBuf(ary, idx) {
      this[0] = ary[idx];
      this[1] = ary[idx + 1];
      this[2] = ary[idx + 2];
      this[3] = ary[idx + 3];
      return this;
    }
    toBuf(ary, idx) {
      ary[idx] = this[0];
      ary[idx + 1] = this[1];
      ary[idx + 2] = this[2];
      ary[idx + 3] = this[3];
      return this;
    }
    pushTo(ary) {
      ary.push(this[0], this[1], this[2], this[3]);
      return this;
    }
    fromMul(a, b) {
      const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    fromAxisAngle(axis, rad) {
      const half = rad * 0.5;
      const s = Math.sin(half);
      this[0] = axis[0] * s;
      this[1] = axis[1] * s;
      this[2] = axis[2] * s;
      this[3] = Math.cos(half);
      return this;
    }
    fromSwing(a, b) {
      const dot = Vec3.dot(a, b);
      if (dot < -0.999999) {
        const tmp = new Vec3().fromCross(Vec3.LEFT, a);
        if (tmp.len < 1e-6)
          tmp.fromCross(Vec3.UP, a);
        this.fromAxisAngle(tmp.norm(), Math.PI);
      } else if (dot > 0.999999) {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 1;
      } else {
        const v = Vec3.cross(a, b, [0, 0, 0]);
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this[3] = 1 + dot;
        this.norm();
      }
      return this;
    }
    fromInvert(q) {
      const a0 = q[0], a1 = q[1], a2 = q[2], a3 = q[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
      if (dot == 0) {
        this[0] = this[1] = this[2] = this[3] = 0;
        return this;
      }
      const invDot = 1 / dot;
      this[0] = -a0 * invDot;
      this[1] = -a1 * invDot;
      this[2] = -a2 * invDot;
      this[3] = a3 * invDot;
      return this;
    }
    fromNegate(q) {
      this[0] = -q[0];
      this[1] = -q[1];
      this[2] = -q[2];
      this[3] = -q[3];
      return this;
    }
    fromLook(dir, up = [0, 1, 0]) {
      const zAxis = new Vec3(dir).norm();
      const xAxis = new Vec3().fromCross(up, zAxis).norm();
      const yAxis = new Vec3().fromCross(zAxis, xAxis).norm();
      const m00 = xAxis[0], m01 = xAxis[1], m02 = xAxis[2], m10 = yAxis[0], m11 = yAxis[1], m12 = yAxis[2], m20 = zAxis[0], m21 = zAxis[1], m22 = zAxis[2], t = m00 + m11 + m22;
      let x, y, z, w, s;
      if (t > 0) {
        s = Math.sqrt(t + 1);
        w = s * 0.5;
        s = 0.5 / s;
        x = (m12 - m21) * s;
        y = (m20 - m02) * s;
        z = (m01 - m10) * s;
      } else if (m00 >= m11 && m00 >= m22) {
        s = Math.sqrt(1 + m00 - m11 - m22);
        x = 0.5 * s;
        s = 0.5 / s;
        y = (m01 + m10) * s;
        z = (m02 + m20) * s;
        w = (m12 - m21) * s;
      } else if (m11 > m22) {
        s = Math.sqrt(1 + m11 - m00 - m22);
        y = 0.5 * s;
        s = 0.5 / s;
        x = (m10 + m01) * s;
        z = (m21 + m12) * s;
        w = (m20 - m02) * s;
      } else {
        s = Math.sqrt(1 + m22 - m00 - m11);
        z = 0.5 * s;
        s = 0.5 / s;
        x = (m20 + m02) * s;
        y = (m21 + m12) * s;
        w = (m01 - m10) * s;
      }
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this;
    }
    fromNBlend(a, b, t) {
      const a_x = a[0];
      const a_y = a[1];
      const a_z = a[2];
      const a_w = a[3];
      const b_x = b[0];
      const b_y = b[1];
      const b_z = b[2];
      const b_w = b[3];
      const dot = a_x * b_x + a_y * b_y + a_z * b_z + a_w * b_w;
      const ti = 1 - t;
      const s = dot < 0 ? -1 : 1;
      this[0] = ti * a_x + t * b_x * s;
      this[1] = ti * a_y + t * b_y * s;
      this[2] = ti * a_z + t * b_z * s;
      this[3] = ti * a_w + t * b_w * s;
      return this.norm();
    }
    fromLerp(a, b, t) {
      const ti = 1 - t;
      this[0] = a[0] * ti + b[0] * t;
      this[1] = a[1] * ti + b[1] * t;
      this[2] = a[2] * ti + b[2] * t;
      this[3] = a[3] * ti + b[3] * t;
      return this;
    }
    fromNLerp(a, b, t) {
      const ti = 1 - t;
      this[0] = a[0] * ti + b[0] * t;
      this[1] = a[1] * ti + b[1] * t;
      this[2] = a[2] * ti + b[2] * t;
      this[3] = a[3] * ti + b[3] * t;
      return this.norm();
    }
    fromSlerp(a, b, t) {
      const ax = a[0], ay = a[1], az = a[2], aw = a[3];
      let bx = b[0], by = b[1], bz = b[2], bw = b[3];
      let omega, cosom, sinom, scale0, scale1;
      cosom = ax * bx + ay * by + az * bz + aw * bw;
      if (cosom < 0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      if (1 - cosom > 1e-6) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        scale0 = 1 - t;
        scale1 = t;
      }
      this[0] = scale0 * ax + scale1 * bx;
      this[1] = scale0 * ay + scale1 * by;
      this[2] = scale0 * az + scale1 * bz;
      this[3] = scale0 * aw + scale1 * bw;
      return this;
    }
    fromAxes(xAxis, yAxis, zAxis) {
      const m00 = xAxis[0], m01 = xAxis[1], m02 = xAxis[2], m10 = yAxis[0], m11 = yAxis[1], m12 = yAxis[2], m20 = zAxis[0], m21 = zAxis[1], m22 = zAxis[2], t = m00 + m11 + m22;
      let x, y, z, w, s;
      if (t > 0) {
        s = Math.sqrt(t + 1);
        w = s * 0.5;
        s = 0.5 / s;
        x = (m12 - m21) * s;
        y = (m20 - m02) * s;
        z = (m01 - m10) * s;
      } else if (m00 >= m11 && m00 >= m22) {
        s = Math.sqrt(1 + m00 - m11 - m22);
        x = 0.5 * s;
        s = 0.5 / s;
        y = (m01 + m10) * s;
        z = (m02 + m20) * s;
        w = (m12 - m21) * s;
      } else if (m11 > m22) {
        s = Math.sqrt(1 + m11 - m00 - m22);
        y = 0.5 * s;
        s = 0.5 / s;
        x = (m10 + m01) * s;
        z = (m21 + m12) * s;
        w = (m20 - m02) * s;
      } else {
        s = Math.sqrt(1 + m22 - m00 - m11);
        z = 0.5 * s;
        s = 0.5 / s;
        x = (m20 + m02) * s;
        y = (m21 + m12) * s;
        w = (m01 - m10) * s;
      }
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this;
    }
    fromMat3(m) {
      let fRoot;
      const fTrace = m[0] + m[4] + m[8];
      if (fTrace > 0) {
        fRoot = Math.sqrt(fTrace + 1);
        this[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        this[0] = (m[5] - m[7]) * fRoot;
        this[1] = (m[6] - m[2]) * fRoot;
        this[2] = (m[1] - m[3]) * fRoot;
      } else {
        let i = 0;
        if (m[4] > m[0])
          i = 1;
        if (m[8] > m[i * 3 + i])
          i = 2;
        const j = (i + 1) % 3;
        const k = (i + 2) % 3;
        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
        this[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        this[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        this[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        this[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
      }
      return this;
    }
    fromMat4(mat) {
      const trace = mat[0] + mat[5] + mat[10];
      let S = 0;
      if (trace > 0) {
        S = Math.sqrt(trace + 1) * 2;
        this[3] = 0.25 * S;
        this[0] = (mat[6] - mat[9]) / S;
        this[1] = (mat[8] - mat[2]) / S;
        this[2] = (mat[1] - mat[4]) / S;
      } else if (mat[0] > mat[5] && mat[0] > mat[10]) {
        S = Math.sqrt(1 + mat[0] - mat[5] - mat[10]) * 2;
        this[3] = (mat[6] - mat[9]) / S;
        this[0] = 0.25 * S;
        this[1] = (mat[1] + mat[4]) / S;
        this[2] = (mat[8] + mat[2]) / S;
      } else if (mat[5] > mat[10]) {
        S = Math.sqrt(1 + mat[5] - mat[0] - mat[10]) * 2;
        this[3] = (mat[8] - mat[2]) / S;
        this[0] = (mat[1] + mat[4]) / S;
        this[1] = 0.25 * S;
        this[2] = (mat[6] + mat[9]) / S;
      } else {
        S = Math.sqrt(1 + mat[10] - mat[0] - mat[5]) * 2;
        this[3] = (mat[1] - mat[4]) / S;
        this[0] = (mat[8] + mat[2]) / S;
        this[1] = (mat[6] + mat[9]) / S;
        this[2] = 0.25 * S;
      }
      return this;
    }
    fromAngularVec(v) {
      let len = Vec3.len(v);
      if (len < 1e-6) {
        this.identity();
        return this;
      }
      const h = 0.5 * len;
      const s = Math.sin(h);
      const c = Math.cos(h);
      len = 1 / len;
      this[0] = s * (v[0] * len);
      this[1] = s * (v[1] * len);
      this[2] = s * (v[2] * len);
      this[3] = c;
      return this;
    }
    toAngularVec(out) {
      const v = this.getAxisAngle();
      out = out || new Vec3();
      return out.fromScale(v, v[3]);
    }
    fromEuler(x, y, z) {
      let xx = 0, yy = 0, zz = 0;
      if (x instanceof Vec3 || x instanceof Float32Array || x instanceof Array && x.length == 3) {
        xx = x[0] * 0.01745329251 * 0.5;
        yy = x[1] * 0.01745329251 * 0.5;
        zz = x[2] * 0.01745329251 * 0.5;
      } else if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
        xx = x * 0.01745329251 * 0.5;
        yy = y * 0.01745329251 * 0.5;
        zz = z * 0.01745329251 * 0.5;
      }
      const c1 = Math.cos(xx), c2 = Math.cos(yy), c3 = Math.cos(zz), s1 = Math.sin(xx), s2 = Math.sin(yy), s3 = Math.sin(zz);
      this[0] = s1 * c2 * c3 + c1 * s2 * s3;
      this[1] = c1 * s2 * c3 - s1 * c2 * s3;
      this[2] = c1 * c2 * s3 - s1 * s2 * c3;
      this[3] = c1 * c2 * c3 + s1 * s2 * s3;
      return this.norm();
    }
    fromEulerXY(x, y) {
      const xx = x * 0.01745329251 * 0.5, yy = y * 0.01745329251 * 0.5, c1 = Math.cos(xx), c2 = Math.cos(yy), s1 = Math.sin(xx), s2 = Math.sin(yy);
      this[0] = s1 * c2;
      this[1] = c1 * s2;
      this[2] = -s1 * s2;
      this[3] = c1 * c2;
      return this.norm();
    }
    fromEulerOrder(x, y, z, order = "YXZ") {
      const c1 = Math.cos(x * 0.5), c2 = Math.cos(y * 0.5), c3 = Math.cos(z * 0.5), s1 = Math.sin(x * 0.5), s2 = Math.sin(y * 0.5), s3 = Math.sin(z * 0.5);
      switch (order) {
        case "XYZ":
          this[0] = s1 * c2 * c3 + c1 * s2 * s3;
          this[1] = c1 * s2 * c3 - s1 * c2 * s3;
          this[2] = c1 * c2 * s3 + s1 * s2 * c3;
          this[3] = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "YXZ":
          this[0] = s1 * c2 * c3 + c1 * s2 * s3;
          this[1] = c1 * s2 * c3 - s1 * c2 * s3;
          this[2] = c1 * c2 * s3 - s1 * s2 * c3;
          this[3] = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "ZXY":
          this[0] = s1 * c2 * c3 - c1 * s2 * s3;
          this[1] = c1 * s2 * c3 + s1 * c2 * s3;
          this[2] = c1 * c2 * s3 + s1 * s2 * c3;
          this[3] = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "ZYX":
          this[0] = s1 * c2 * c3 - c1 * s2 * s3;
          this[1] = c1 * s2 * c3 + s1 * c2 * s3;
          this[2] = c1 * c2 * s3 - s1 * s2 * c3;
          this[3] = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "YZX":
          this[0] = s1 * c2 * c3 + c1 * s2 * s3;
          this[1] = c1 * s2 * c3 + s1 * c2 * s3;
          this[2] = c1 * c2 * s3 - s1 * s2 * c3;
          this[3] = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "XZY":
          this[0] = s1 * c2 * c3 - c1 * s2 * s3;
          this[1] = c1 * s2 * c3 - s1 * c2 * s3;
          this[2] = c1 * c2 * s3 + s1 * s2 * c3;
          this[3] = c1 * c2 * c3 + s1 * s2 * s3;
          break;
      }
      return this.norm();
    }
    mul(q) {
      const ax = this[0], ay = this[1], az = this[2], aw = this[3], bx = q[0], by = q[1], bz = q[2], bw = q[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    pmul(q) {
      const ax = q[0], ay = q[1], az = q[2], aw = q[3], bx = this[0], by = this[1], bz = this[2], bw = this[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    norm() {
      let len = this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        this[0] *= len;
        this[1] *= len;
        this[2] *= len;
        this[3] *= len;
      }
      return this;
    }
    invert() {
      const a0 = this[0], a1 = this[1], a2 = this[2], a3 = this[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
      if (dot == 0) {
        this[0] = this[1] = this[2] = this[3] = 0;
        return this;
      }
      const invDot = 1 / dot;
      this[0] = -a0 * invDot;
      this[1] = -a1 * invDot;
      this[2] = -a2 * invDot;
      this[3] = a3 * invDot;
      return this;
    }
    negate() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      this[3] = -this[3];
      return this;
    }
    conjugate() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      return this;
    }
    scaleAngle(scl) {
      if (this[3] > 1)
        this.norm();
      const angle = 2 * Math.acos(this[3]), len = 1 / Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2), half = angle * scl * 0.5, s = Math.sin(half);
      this[0] = this[0] * len * s;
      this[1] = this[1] * len * s;
      this[2] = this[2] * len * s;
      this[3] = Math.cos(half);
      return this;
    }
    transformVec3(v) {
      const qx = this[0], qy = this[1], qz = this[2], qw = this[3], vx = v[0], vy = v[1], vz = v[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
      v[0] = vx + 2 * x2;
      v[1] = vy + 2 * y2;
      v[2] = vz + 2 * z2;
      return this;
    }
    rotX(rad) {
      rad *= 0.5;
      const ax = this[0], ay = this[1], az = this[2], aw = this[3], bx = Math.sin(rad), bw = Math.cos(rad);
      this[0] = ax * bw + aw * bx;
      this[1] = ay * bw + az * bx;
      this[2] = az * bw - ay * bx;
      this[3] = aw * bw - ax * bx;
      return this;
    }
    rotY(rad) {
      rad *= 0.5;
      const ax = this[0], ay = this[1], az = this[2], aw = this[3], by = Math.sin(rad), bw = Math.cos(rad);
      this[0] = ax * bw - az * by;
      this[1] = ay * bw + aw * by;
      this[2] = az * bw + ax * by;
      this[3] = aw * bw - ay * by;
      return this;
    }
    rotZ(rad) {
      rad *= 0.5;
      const ax = this[0], ay = this[1], az = this[2], aw = this[3], bz = Math.sin(rad), bw = Math.cos(rad);
      this[0] = ax * bw + ay * bz;
      this[1] = ay * bw - ax * bz;
      this[2] = az * bw + aw * bz;
      this[3] = aw * bw - az * bz;
      return this;
    }
    rotDeg(deg, axis = 0) {
      const rad = deg * Math.PI / 180;
      switch (axis) {
        case 0:
          this.rotX(rad);
          break;
        case 1:
          this.rotY(rad);
          break;
        case 2:
          this.rotZ(rad);
          break;
      }
      return this;
    }
    pmulInvert(q) {
      let ax = q[0], ay = q[1], az = q[2], aw = q[3];
      const dot = ax * ax + ay * ay + az * az + aw * aw;
      if (dot === 0) {
        ax = ay = az = aw = 0;
      } else {
        const dot_inv = 1 / dot;
        ax = -ax * dot_inv;
        ay = -ay * dot_inv;
        az = -az * dot_inv;
        aw = aw * dot_inv;
      }
      const bx = this[0], by = this[1], bz = this[2], bw = this[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    pmulAxisAngle(axis, rad) {
      const half = rad * 0.5;
      const s = Math.sin(half);
      const ax = axis[0] * s;
      const ay = axis[1] * s;
      const az = axis[2] * s;
      const aw = Math.cos(half);
      const bx = this[0], by = this[1], bz = this[2], bw = this[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    mulAxisAngle(axis, angle) {
      const half = angle * 0.5, s = Math.sin(half), bx = axis[0] * s, by = axis[1] * s, bz = axis[2] * s, bw = Math.cos(half), ax = this[0], ay = this[1], az = this[2], aw = this[3];
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    dotNegate(q, chk) {
      if (Quat.dot(q, chk) < 0)
        this.fromNegate(q);
      else
        this.copy(q);
      return this;
    }
    mirrorX() {
      this[1] = -this[1];
      this[2] = -this[2];
      return this;
    }
    random() {
      const u1 = Math.random(), u2 = Math.random(), u3 = Math.random(), r1 = Math.sqrt(1 - u1), r2 = Math.sqrt(u1);
      this[0] = r1 * Math.sin(6.283185307179586 * u2);
      this[1] = r1 * Math.cos(6.283185307179586 * u2);
      this[2] = r2 * Math.sin(6.283185307179586 * u3);
      this[3] = r2 * Math.cos(6.283185307179586 * u3);
      return this;
    }
    mulUnitVecs(a, b) {
      const dot = Vec3.dot(a, b);
      const ax = this[0], ay = this[1], az = this[2], aw = this[3];
      let bx, by, bz, bw;
      if (dot < -0.999999) {
        const axis = Vec3.cross(Vec3.LEFT, a);
        if (Vec3.len(axis) < 1e-6)
          Vec3.cross(Vec3.UP, a, axis);
        Vec3.norm(axis);
        const half = Math.PI * 0.5, s = Math.sin(half);
        bx = axis[0] * s;
        by = axis[1] * s;
        bz = axis[2] * s;
        bw = Math.cos(half);
      } else if (dot > 0.999999) {
        bx = 0;
        by = 0;
        bz = 0;
        bw = 1;
      } else {
        const v = Vec3.cross(a, b);
        bx = v[0];
        by = v[1];
        bz = v[2];
        bw = 1 + dot;
        let len = bx ** 2 + by ** 2 + bz ** 2 + bw ** 2;
        if (len > 0) {
          len = 1 / Math.sqrt(len);
          bx *= len;
          by *= len;
          bz *= len;
          bw *= len;
        }
      }
      this[0] = ax * bw + aw * bx + ay * bz - az * by;
      this[1] = ay * bw + aw * by + az * bx - ax * bz;
      this[2] = az * bw + aw * bz + ax * by - ay * bx;
      this[3] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    static dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    static lenSqr(a, b) {
      return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 + (a[3] - b[3]) ** 2;
    }
    static nblend(a, b, t, out) {
      const a_x = a[0];
      const a_y = a[1];
      const a_z = a[2];
      const a_w = a[3];
      const b_x = b[0];
      const b_y = b[1];
      const b_z = b[2];
      const b_w = b[3];
      const dot = a_x * b_x + a_y * b_y + a_z * b_z + a_w * b_w;
      const ti = 1 - t;
      const s = dot < 0 ? -1 : 1;
      out[0] = ti * a_x + t * b_x * s;
      out[1] = ti * a_y + t * b_y * s;
      out[2] = ti * a_z + t * b_z * s;
      out[3] = ti * a_w + t * b_w * s;
      return out.norm();
    }
    static slerp(a, b, t, out) {
      const ax = a[0], ay = a[1], az = a[2], aw = a[3];
      let bx = b[0], by = b[1], bz = b[2], bw = b[3];
      let omega, cosom, sinom, scale0, scale1;
      cosom = ax * bx + ay * by + az * bz + aw * bw;
      if (cosom < 0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      if (1 - cosom > 1e-6) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        scale0 = 1 - t;
        scale1 = t;
      }
      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;
      return out;
    }
    static shortest(from, to, out) {
      const ax = from[0], ay = from[1], az = from[2], aw = from[3];
      let bx = to[0], by = to[1], bz = to[2], bw = to[3];
      const dot = ax * bx + ay * by + az * bz + aw * bw;
      if (dot < 0) {
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      const d = bx * bx + by * by + bz * bz + bw * bw;
      if (d === 0) {
        bx = 0;
        by = 0;
        bz = 0;
        bw = 0;
      } else {
        const di = 1 / d;
        bx = -bx * di;
        by = -by * di;
        bz = -bz * di;
        bw = bw * di;
      }
      out[0] = ax * bw + aw * bx + ay * bz - az * by;
      out[1] = ay * bw + aw * by + az * bx - ax * bz;
      out[2] = az * bw + aw * bz + ax * by - ay * bx;
      out[3] = aw * bw - ax * bx - ay * by - az * bz;
      return out;
    }
    static swing(a, b) {
      return new Quat().fromSwing(a, b);
    }
    static axisAngle(axis, rad) {
      return new Quat().fromAxisAngle(axis, rad);
    }
  }class Vec2 extends Array {
    constructor(v, y) {
      super(2);
      if (v instanceof Vec2 || v instanceof Float32Array || v instanceof Array && v.length == 2) {
        this[0] = v[0];
        this[1] = v[1];
      } else if (typeof v === "number" && typeof y === "number") {
        this[0] = v;
        this[1] = y;
      } else if (typeof v === "number") {
        this[0] = v;
        this[1] = v;
      } else {
        this[0] = 0;
        this[1] = 0;
      }
    }
    xy(x, y) {
      if (y != void 0) {
        this[0] = x;
        this[1] = y;
      } else
        this[0] = this[1] = x;
      return this;
    }
    get x() {
      return this[0];
    }
    set x(v) {
      this[0] = v;
    }
    get y() {
      return this[1];
    }
    set y(v) {
      this[1] = v;
    }
    clone() {
      return new Vec2(this);
    }
    copy(v) {
      this[0] = v[0];
      this[1] = v[1];
      return this;
    }
    reset() {
      this[0] = 0;
      this[1] = 0;
      return this;
    }
    toString(rnd = 0) {
      if (rnd == 0)
        return "[" + this.join(",") + "]";
      else {
        let s = "[";
        for (let i = 0; i < 2; i++) {
          switch (this[i]) {
            case 0:
              s += "0,";
              break;
            case 1:
              s += "1,";
              break;
            default:
              s += this[i].toFixed(rnd) + ",";
              break;
          }
        }
        return s.slice(0, -1) + "]";
      }
    }
    isZero() {
      return this[0] == 0 && this[1] == 0;
    }
    nearZero(x = 1e-6, y = 1e-6) {
      if (Math.abs(this[0]) <= x)
        this[0] = 0;
      if (Math.abs(this[1]) <= y)
        this[1] = 0;
      return this;
    }
    rnd(x0 = 0, x1 = 1, y0 = 0, y1 = 1) {
      let t;
      t = Math.random();
      this[0] = x0 * (1 - t) + x1 * t;
      t = Math.random();
      this[1] = y0 * (1 - t) + y1 * t;
      return this;
    }
    angle(v) {
      return v ? Math.atan2(v[1] * this[0] - v[0] * this[1], v[0] * this[0] + v[1] * this[1]) : Math.atan2(this[1], this[0]);
    }
    setLen(len) {
      return this.norm().scale(len);
    }
    len() {
      return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    }
    lenSqr() {
      return this[0] * this[0] + this[1] * this[1];
    }
    toVec3(isYUp = true, n = 0) {
      const v = [this[0], 0, 0];
      if (isYUp) {
        v[1] = n;
        v[2] = this[1];
      } else {
        v[1] = this[1];
        v[2] = n;
      }
      return v;
    }
    fromAngleLen(ang, len) {
      this[0] = len * Math.cos(ang);
      this[1] = len * Math.sin(ang);
      return this;
    }
    fromAdd(a, b) {
      this[0] = a[0] + b[0];
      this[1] = a[1] + b[1];
      return this;
    }
    fromSub(a, b) {
      this[0] = a[0] - b[0];
      this[1] = a[1] - b[1];
      return this;
    }
    fromMul(a, b) {
      this[0] = a[0] * b[0];
      this[1] = a[1] * b[1];
      return this;
    }
    fromScale(a, s) {
      this[0] = a[0] * s;
      this[1] = a[1] * s;
      return this;
    }
    fromLerp(a, b, t = 0.5) {
      const tt = 1 - t;
      this[0] = a[0] * tt + b[0] * t;
      this[1] = a[1] * tt + b[1] * t;
      return this;
    }
    fromMax(a, b) {
      this[0] = Math.max(a[0], b[0]);
      this[1] = Math.max(a[1], b[1]);
      return this;
    }
    fromMin(a, b) {
      this[0] = Math.min(a[0], b[0]);
      this[1] = Math.min(a[1], b[1]);
      return this;
    }
    fromFloor(v) {
      this[0] = Math.floor(v[0]);
      this[1] = Math.floor(v[1]);
      return this;
    }
    fromFract(v) {
      this[0] = v[0] - Math.floor(v[0]);
      this[1] = v[1] - Math.floor(v[1]);
      return this;
    }
    fromNegate(a) {
      this[0] = -a[0];
      this[1] = -a[1];
      return this;
    }
    fromNorm(a) {
      const mag = Math.sqrt(a[0] ** 2 + a[1] ** 2);
      if (mag == 0)
        return this;
      this[0] = a[0] / mag;
      this[1] = a[1] / mag;
      return this;
    }
    fromInvert(a) {
      this[0] = a[0] != 0 ? 1 / a[0] : 0;
      this[1] = a[1] != 0 ? 1 / a[1] : 0;
      return this;
    }
    fromLineProjecton(from, to) {
      const denom = Vec2.dot(to, to);
      if (denom < 1e-6)
        return this;
      const scl = Vec2.dot(from, to) / denom;
      this.fromScale(to, scl);
      return this;
    }
    fromBuf(ary, idx) {
      this[0] = ary[idx];
      this[1] = ary[idx + 1];
      return this;
    }
    toBuf(ary, idx) {
      ary[idx] = this[0];
      ary[idx + 1] = this[1];
      return this;
    }
    pushTo(ary) {
      ary.push(this[0], this[1]);
      return this;
    }
    add(v) {
      this[0] += v[0];
      this[1] += v[1];
      return this;
    }
    sub(v) {
      this[0] -= v[0];
      this[1] -= v[1];
      return this;
    }
    mul(v) {
      this[0] *= v[0];
      this[1] *= v[1];
      return this;
    }
    div(v) {
      this[0] = v[0] != 0 ? this[0] / v[0] : 0;
      this[1] = v[1] != 0 ? this[1] / v[1] : 0;
      return this;
    }
    scale(v) {
      this[0] *= v;
      this[1] *= v;
      return this;
    }
    divScale(v) {
      this[0] /= v;
      this[1] /= v;
      return this;
    }
    scaleThenAdd(scale, a, b) {
      this[0] = a[0] * scale + b[0];
      this[1] = a[1] * scale + b[1];
      return this;
    }
    floor() {
      this[0] = Math.floor(this[0]);
      this[1] = Math.floor(this[1]);
      return this;
    }
    negate() {
      this[0] = -this[0];
      this[1] = -this[1];
      return this;
    }
    min(a) {
      this[0] = Math.min(this[0], a[0]);
      this[1] = Math.min(this[1], a[1]);
      return this;
    }
    max(a) {
      this[0] = Math.max(this[0], a[0]);
      this[1] = Math.max(this[1], a[1]);
      return this;
    }
    norm() {
      const mag = Math.sqrt(this[0] ** 2 + this[1] ** 2);
      if (mag == 0)
        return this;
      this[0] = this[0] / mag;
      this[1] = this[1] / mag;
      return this;
    }
    lerp(v, t) {
      const ti = 1 - t;
      this[0] = this[0] * ti + v[0] * t;
      this[1] = this[1] * ti + v[1] * t;
      return this;
    }
    rotate(rad) {
      const cos = Math.cos(rad), sin = Math.sin(rad), x = this[0], y = this[1];
      this[0] = x * cos - y * sin;
      this[1] = x * sin + y * cos;
      return this;
    }
    rotateDeg(deg) {
      const rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad), x = this[0], y = this[1];
      this[0] = x * cos - y * sin;
      this[1] = x * sin + y * cos;
      return this;
    }
    invert() {
      this[0] = 1 / this[0];
      this[1] = 1 / this[1];
      return this;
    }
    rotP90() {
      const x = this[0];
      this[0] = this[1];
      this[1] = -x;
      return this;
    }
    rotN90() {
      const x = this[0];
      this[0] = -this[1];
      this[1] = x;
      return this;
    }
    static add(a, b) {
      return new Vec2().fromAdd(a, b);
    }
    static sub(a, b) {
      return new Vec2().fromSub(a, b);
    }
    static scale(v, s) {
      return new Vec2().fromScale(v, s);
    }
    static floor(v) {
      return new Vec2().fromFloor(v);
    }
    static fract(v) {
      return new Vec2().fromFract(v);
    }
    static lerp(v0, v1, t) {
      return new Vec2().fromLerp(v0, v1, t);
    }
    static len(v0) {
      return Math.sqrt(v0[0] ** 2 + v0[1] ** 2);
    }
    static lenSqr(v0) {
      return v0[0] ** 2 + v0[1] ** 2;
    }
    static dist(a, b) {
      return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
    }
    static distSqr(a, b) {
      return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    static dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    }
    static det(a, b) {
      return a[0] * b[1] - a[1] * b[0];
    }
    static project(from, to) {
      const out = new Vec2();
      const denom = Vec2.dot(to, to);
      if (denom < 1e-6)
        return out;
      const scl = Vec2.dot(from, to) / denom;
      return out.fromScale(to, scl);
    }
    static scaleThenAdd(scale, a, b) {
      return new Vec2().scaleThenAdd(scale, a, b);
    }
    static projectPlane(from, to, planeNorm) {
      const out = new Vec2();
      const denom = Vec2.dot(to, planeNorm);
      if (denom < 1e-6 && denom > -1e-6)
        return out;
      const t = Vec2.dot(from, planeNorm) / denom;
      return out.fromScale(to, t);
    }
    static rotateDeg(v, deg) {
      const out = new Vec2();
      const rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad), x = v[0], y = v[1];
      out[0] = x * cos - y * sin;
      out[1] = x * sin + y * cos;
      return out;
    }
    static rotP90(v) {
      const out = new Vec2();
      out[0] = v[1];
      out[1] = -v[0];
      return out;
    }
    static rotN90(v) {
      const out = new Vec2();
      out[0] = -v[1];
      out[1] = v[0];
      return out;
    }
    static angleTo(a, b) {
      return Math.atan2(b[1] * a[0] - b[0] * a[1], b[0] * a[0] + b[1] * a[1]);
    }
    static bufIter(buf) {
      let i = 0;
      const result = { value: new Vec2(), done: false }, len = buf.length, next = () => {
        if (i >= len)
          result.done = true;
        else {
          result.value.fromBuf(buf, i);
          i += 2;
        }
        return result;
      };
      return { [Symbol.iterator]() {
        return { next };
      } };
    }
  }class Mat4 extends Array {
    constructor() {
      super(16);
      this[0] = 1;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = 1;
      this[6] = 0;
      this[7] = 0;
      this[8] = 0;
      this[9] = 0;
      this[10] = 1;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
    }
    identity() {
      this[0] = 1;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = 1;
      this[6] = 0;
      this[7] = 0;
      this[8] = 0;
      this[9] = 0;
      this[10] = 1;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    clearTranslation() {
      this[12] = this[13] = this[14] = 0;
      this[15] = 1;
      return this;
    }
    copy(mat, offset = 0) {
      let i;
      for (i = 0; i < 16; i++)
        this[i] = mat[offset + i];
      return this;
    }
    copyTo(out) {
      for (let i = 0; i < 16; i++)
        out[i] = this[i];
      return this;
    }
    determinant() {
      const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11], a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15], b0 = a00 * a11 - a01 * a10, b1 = a00 * a12 - a02 * a10, b2 = a01 * a12 - a02 * a11, b3 = a20 * a31 - a21 * a30, b4 = a20 * a32 - a22 * a30, b5 = a21 * a32 - a22 * a31, b6 = a00 * b5 - a01 * b4 + a02 * b3, b7 = a10 * b5 - a11 * b4 + a12 * b3, b8 = a20 * b2 - a21 * b1 + a22 * b0, b9 = a30 * b2 - a31 * b1 + a32 * b0;
      return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
    }
    frob() {
      return Math.hypot(
        this[0],
        this[1],
        this[2],
        this[3],
        this[4],
        this[5],
        this[6],
        this[7],
        this[8],
        this[9],
        this[10],
        this[11],
        this[12],
        this[13],
        this[14],
        this[15]
      );
    }
    getTranslation(out = [0, 0, 0]) {
      out[0] = this[12];
      out[1] = this[13];
      out[2] = this[14];
      return out;
    }
    getScale(out = [0, 0, 0]) {
      const m11 = this[0], m12 = this[1], m13 = this[2], m21 = this[4], m22 = this[5], m23 = this[6], m31 = this[8], m32 = this[9], m33 = this[10];
      out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
      out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
      out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
      return out;
    }
    getRotation(out = [0, 0, 0, 1]) {
      const trace = this[0] + this[5] + this[10];
      let S = 0;
      if (trace > 0) {
        S = Math.sqrt(trace + 1) * 2;
        out[3] = 0.25 * S;
        out[0] = (this[6] - this[9]) / S;
        out[1] = (this[8] - this[2]) / S;
        out[2] = (this[1] - this[4]) / S;
      } else if (this[0] > this[5] && this[0] > this[10]) {
        S = Math.sqrt(1 + this[0] - this[5] - this[10]) * 2;
        out[3] = (this[6] - this[9]) / S;
        out[0] = 0.25 * S;
        out[1] = (this[1] + this[4]) / S;
        out[2] = (this[8] + this[2]) / S;
      } else if (this[5] > this[10]) {
        S = Math.sqrt(1 + this[5] - this[0] - this[10]) * 2;
        out[3] = (this[8] - this[2]) / S;
        out[0] = (this[1] + this[4]) / S;
        out[1] = 0.25 * S;
        out[2] = (this[6] + this[9]) / S;
      } else {
        S = Math.sqrt(1 + this[10] - this[0] - this[5]) * 2;
        out[3] = (this[1] - this[4]) / S;
        out[0] = (this[8] + this[2]) / S;
        out[1] = (this[6] + this[9]) / S;
        out[2] = 0.25 * S;
      }
      return out;
    }
    toNormalMat3(out) {
      const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11], a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      out = out || [0, 0, 0, 0, 0, 0, 0, 0, 0];
      if (!det)
        return out;
      det = 1 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      return out;
    }
    fromPerspective(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy * 0.5), nf = 1 / (near - far);
      this[0] = f / aspect;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = f;
      this[6] = 0;
      this[7] = 0;
      this[8] = 0;
      this[9] = 0;
      this[10] = (far + near) * nf;
      this[11] = -1;
      this[12] = 0;
      this[13] = 0;
      this[14] = 2 * far * near * nf;
      this[15] = 0;
      return this;
    }
    fromOrtho(left, right, bottom, top, near, far) {
      const lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
      this[0] = -2 * lr;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = -2 * bt;
      this[6] = 0;
      this[7] = 0;
      this[8] = 0;
      this[9] = 0;
      this[10] = 2 * nf;
      this[11] = 0;
      this[12] = (left + right) * lr;
      this[13] = (top + bottom) * bt;
      this[14] = (far + near) * nf;
      this[15] = 1;
      return this;
    }
    fromMul(a, b) {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
      this[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      this[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      this[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      this[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return this;
    }
    fromInvert(mat) {
      const a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det)
        return this;
      det = 1 / det;
      this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return this;
    }
    fromAdjugate(a) {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      this[0] = a11 * b11 - a12 * b10 + a13 * b09;
      this[1] = a02 * b10 - a01 * b11 - a03 * b09;
      this[2] = a31 * b05 - a32 * b04 + a33 * b03;
      this[3] = a22 * b04 - a21 * b05 - a23 * b03;
      this[4] = a12 * b08 - a10 * b11 - a13 * b07;
      this[5] = a00 * b11 - a02 * b08 + a03 * b07;
      this[6] = a32 * b02 - a30 * b05 - a33 * b01;
      this[7] = a20 * b05 - a22 * b02 + a23 * b01;
      this[8] = a10 * b10 - a11 * b08 + a13 * b06;
      this[9] = a01 * b08 - a00 * b10 - a03 * b06;
      this[10] = a30 * b04 - a31 * b02 + a33 * b00;
      this[11] = a21 * b02 - a20 * b04 - a23 * b00;
      this[12] = a11 * b07 - a10 * b09 - a12 * b06;
      this[13] = a00 * b09 - a01 * b07 + a02 * b06;
      this[14] = a31 * b01 - a30 * b03 - a32 * b00;
      this[15] = a20 * b03 - a21 * b01 + a22 * b00;
      return this;
    }
    fromFrustum(left, right, bottom, top, near, far) {
      const rl = 1 / (right - left);
      const tb = 1 / (top - bottom);
      const nf = 1 / (near - far);
      this[0] = near * 2 * rl;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = near * 2 * tb;
      this[6] = 0;
      this[7] = 0;
      this[8] = (right + left) * rl;
      this[9] = (top + bottom) * tb;
      this[10] = (far + near) * nf;
      this[11] = -1;
      this[12] = 0;
      this[13] = 0;
      this[14] = far * near * 2 * nf;
      this[15] = 0;
      return this;
    }
    fromQuatTranScale(q, v, s) {
      const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2];
      this[0] = (1 - (yy + zz)) * sx;
      this[1] = (xy + wz) * sx;
      this[2] = (xz - wy) * sx;
      this[3] = 0;
      this[4] = (xy - wz) * sy;
      this[5] = (1 - (xx + zz)) * sy;
      this[6] = (yz + wx) * sy;
      this[7] = 0;
      this[8] = (xz + wy) * sz;
      this[9] = (yz - wx) * sz;
      this[10] = (1 - (xx + yy)) * sz;
      this[11] = 0;
      this[12] = v[0];
      this[13] = v[1];
      this[14] = v[2];
      this[15] = 1;
      return this;
    }
    fromQuatTran(q, v) {
      const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
      this[0] = 1 - (yy + zz);
      this[1] = xy + wz;
      this[2] = xz - wy;
      this[3] = 0;
      this[4] = xy - wz;
      this[5] = 1 - (xx + zz);
      this[6] = yz + wx;
      this[7] = 0;
      this[8] = xz + wy;
      this[9] = yz - wx;
      this[10] = 1 - (xx + yy);
      this[11] = 0;
      this[12] = v[0];
      this[13] = v[1];
      this[14] = v[2];
      this[15] = 1;
      return this;
    }
    fromQuat(q) {
      const x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
      this[0] = 1 - (yy + zz);
      this[1] = xy + wz;
      this[2] = xz - wy;
      this[3] = 0;
      this[4] = xy - wz;
      this[5] = 1 - (xx + zz);
      this[6] = yz + wx;
      this[7] = 0;
      this[8] = xz + wy;
      this[9] = yz - wx;
      this[10] = 1 - (xx + yy);
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    fromQuatTranScaleOrigin(q, v, s, o) {
      const x = q[0], y = q[1], z = q[2], w = q[3];
      const x2 = x + x;
      const y2 = y + y;
      const z2 = z + z;
      const xx = x * x2;
      const xy = x * y2;
      const xz = x * z2;
      const yy = y * y2;
      const yz = y * z2;
      const zz = z * z2;
      const wx = w * x2;
      const wy = w * y2;
      const wz = w * z2;
      const sx = s[0];
      const sy = s[1];
      const sz = s[2];
      const ox = o[0];
      const oy = o[1];
      const oz = o[2];
      const out0 = (1 - (yy + zz)) * sx;
      const out1 = (xy + wz) * sx;
      const out2 = (xz - wy) * sx;
      const out4 = (xy - wz) * sy;
      const out5 = (1 - (xx + zz)) * sy;
      const out6 = (yz + wx) * sy;
      const out8 = (xz + wy) * sz;
      const out9 = (yz - wx) * sz;
      const out10 = (1 - (xx + yy)) * sz;
      this[0] = out0;
      this[1] = out1;
      this[2] = out2;
      this[3] = 0;
      this[4] = out4;
      this[5] = out5;
      this[6] = out6;
      this[7] = 0;
      this[8] = out8;
      this[9] = out9;
      this[10] = out10;
      this[11] = 0;
      this[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
      this[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
      this[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
      this[15] = 1;
      return this;
    }
    fromDualQuat(a) {
      const bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
      const translation = [0, 0, 0];
      let magnitude = bx * bx + by * by + bz * bz + bw * bw;
      if (magnitude > 0) {
        magnitude = 1 / magnitude;
        translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 * magnitude;
        translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 * magnitude;
        translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 * magnitude;
      } else {
        translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
        translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
        translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
      }
      this.fromQuatTran(a, translation);
      return this;
    }
    fromAxisAngle(axis, rad) {
      let x = axis[0], y = axis[1], z = axis[2], len = Math.hypot(x, y, z);
      if (len < 1e-6)
        return this;
      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      const t = 1 - c;
      this[0] = x * x * t + c;
      this[1] = y * x * t + z * s;
      this[2] = z * x * t - y * s;
      this[3] = 0;
      this[4] = x * y * t - z * s;
      this[5] = y * y * t + c;
      this[6] = z * y * t + x * s;
      this[7] = 0;
      this[8] = x * z * t + y * s;
      this[9] = y * z * t - x * s;
      this[10] = z * z * t + c;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    fromRotX(rad) {
      const s = Math.sin(rad), c = Math.cos(rad);
      this[0] = 1;
      this[1] = 0;
      this[2] = 0;
      this[3] = 0;
      this[4] = 0;
      this[5] = c;
      this[6] = s;
      this[7] = 0;
      this[8] = 0;
      this[9] = -s;
      this[10] = c;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    fromRotY(rad) {
      const s = Math.sin(rad), c = Math.cos(rad);
      this[0] = c;
      this[1] = 0;
      this[2] = -s;
      this[3] = 0;
      this[4] = 0;
      this[5] = 1;
      this[6] = 0;
      this[7] = 0;
      this[8] = s;
      this[9] = 0;
      this[10] = c;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    fromRotZ(rad) {
      const s = Math.sin(rad), c = Math.cos(rad);
      this[0] = c;
      this[1] = s;
      this[2] = 0;
      this[3] = 0;
      this[4] = -s;
      this[5] = c;
      this[6] = 0;
      this[7] = 0;
      this[8] = 0;
      this[9] = 0;
      this[10] = 1;
      this[11] = 0;
      this[12] = 0;
      this[13] = 0;
      this[14] = 0;
      this[15] = 1;
      return this;
    }
    fromLook(eye, center, up) {
      let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      const eyex = eye[0];
      const eyey = eye[1];
      const eyez = eye[2];
      const upx = up[0];
      const upy = up[1];
      const upz = up[2];
      const centerx = center[0];
      const centery = center[1];
      const centerz = center[2];
      if (Math.abs(eyex - centerx) < 1e-6 && Math.abs(eyey - centery) < 1e-6 && Math.abs(eyez - centerz) < 1e-6) {
        this.identity();
        return this;
      }
      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }
      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }
      this[0] = x0;
      this[1] = y0;
      this[2] = z0;
      this[3] = 0;
      this[4] = x1;
      this[5] = y1;
      this[6] = z1;
      this[7] = 0;
      this[8] = x2;
      this[9] = y2;
      this[10] = z2;
      this[11] = 0;
      this[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      this[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      this[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      this[15] = 1;
      return this;
    }
    fromTarget(eye, target, up) {
      const eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
      let z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2], len = z0 * z0 + z1 * z1 + z2 * z2;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
      }
      let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
      len = x0 * x0 + x1 * x1 + x2 * x2;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }
      this[0] = x0;
      this[1] = x1;
      this[2] = x2;
      this[3] = 0;
      this[4] = z1 * x2 - z2 * x1;
      this[5] = z2 * x0 - z0 * x2;
      this[6] = z0 * x1 - z1 * x0;
      this[7] = 0;
      this[8] = z0;
      this[9] = z1;
      this[10] = z2;
      this[11] = 0;
      this[12] = eyex;
      this[13] = eyey;
      this[14] = eyez;
      this[15] = 1;
      return this;
    }
    fromBuf(ary, idx) {
      this[0] = ary[idx];
      this[1] = ary[idx + 1];
      this[2] = ary[idx + 2];
      this[3] = ary[idx + 3];
      this[4] = ary[idx + 4];
      this[5] = ary[idx + 5];
      this[6] = ary[idx + 6];
      this[7] = ary[idx + 7];
      this[8] = ary[idx + 8];
      this[9] = ary[idx + 9];
      this[10] = ary[idx + 10];
      this[11] = ary[idx + 11];
      this[12] = ary[idx + 12];
      this[13] = ary[idx + 13];
      this[14] = ary[idx + 14];
      this[15] = ary[idx + 15];
      return this;
    }
    toBuf(ary, idx) {
      ary[idx] = this[0];
      ary[idx + 1] = this[1];
      ary[idx + 2] = this[2];
      ary[idx + 3] = this[3];
      ary[idx + 4] = this[4];
      ary[idx + 5] = this[5];
      ary[idx + 6] = this[6];
      ary[idx + 7] = this[7];
      ary[idx + 8] = this[8];
      ary[idx + 9] = this[9];
      ary[idx + 10] = this[10];
      ary[idx + 11] = this[11];
      ary[idx + 12] = this[12];
      ary[idx + 13] = this[13];
      ary[idx + 14] = this[14];
      ary[idx + 15] = this[15];
      return this;
    }
    add(b) {
      this[0] = this[0] + b[0];
      this[1] = this[1] + b[1];
      this[2] = this[2] + b[2];
      this[3] = this[3] + b[3];
      this[4] = this[4] + b[4];
      this[5] = this[5] + b[5];
      this[6] = this[6] + b[6];
      this[7] = this[7] + b[7];
      this[8] = this[8] + b[8];
      this[9] = this[9] + b[9];
      this[10] = this[10] + b[10];
      this[11] = this[11] + b[11];
      this[12] = this[12] + b[12];
      this[13] = this[13] + b[13];
      this[14] = this[14] + b[14];
      this[15] = this[15] + b[15];
      return this;
    }
    sub(b) {
      this[0] = this[0] - b[0];
      this[1] = this[1] - b[1];
      this[2] = this[2] - b[2];
      this[3] = this[3] - b[3];
      this[4] = this[4] - b[4];
      this[5] = this[5] - b[5];
      this[6] = this[6] - b[6];
      this[7] = this[7] - b[7];
      this[8] = this[8] - b[8];
      this[9] = this[9] - b[9];
      this[10] = this[10] - b[10];
      this[11] = this[11] - b[11];
      this[12] = this[12] - b[12];
      this[13] = this[13] - b[13];
      this[14] = this[14] - b[14];
      this[15] = this[15] - b[15];
      return this;
    }
    mul(b) {
      const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11], a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15];
      let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
      this[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      this[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      this[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      this[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return this;
    }
    pmul(b) {
      const a00 = b[0], a01 = b[1], a02 = b[2], a03 = b[3], a10 = b[4], a11 = b[5], a12 = b[6], a13 = b[7], a20 = b[8], a21 = b[9], a22 = b[10], a23 = b[11], a30 = b[12], a31 = b[13], a32 = b[14], a33 = b[15];
      let b0 = this[0], b1 = this[1], b2 = this[2], b3 = this[3];
      this[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = this[4];
      b1 = this[5];
      b2 = this[6];
      b3 = this[7];
      this[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = this[8];
      b1 = this[9];
      b2 = this[10];
      b3 = this[11];
      this[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = this[12];
      b1 = this[13];
      b2 = this[14];
      b3 = this[15];
      this[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      this[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      this[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      this[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return this;
    }
    invert() {
      const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11], a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det)
        return this;
      det = 1 / det;
      this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return this;
    }
    translate(v, y, z) {
      let xx, yy, zz;
      if (v instanceof Float32Array || v instanceof Array && v.length == 3) {
        xx = v[0];
        yy = v[1];
        zz = v[2];
      } else if (typeof v === "number" && typeof y === "number" && typeof z === "number") {
        xx = v;
        yy = y;
        zz = z;
      } else
        return this;
      this[12] = this[0] * xx + this[4] * yy + this[8] * zz + this[12];
      this[13] = this[1] * xx + this[5] * yy + this[9] * zz + this[13];
      this[14] = this[2] * xx + this[6] * yy + this[10] * zz + this[14];
      this[15] = this[3] * xx + this[7] * yy + this[11] * zz + this[15];
      return this;
    }
    scale(x, y, z) {
      if (y == void 0)
        y = x;
      if (z == void 0)
        z = x;
      this[0] *= x;
      this[1] *= x;
      this[2] *= x;
      this[3] *= x;
      this[4] *= y;
      this[5] *= y;
      this[6] *= y;
      this[7] *= y;
      this[8] *= z;
      this[9] *= z;
      this[10] *= z;
      this[11] *= z;
      return this;
    }
    transpose() {
      const a01 = this[1], a02 = this[2], a03 = this[3], a12 = this[6], a13 = this[7], a23 = this[11];
      this[1] = this[4];
      this[2] = this[8];
      this[3] = this[12];
      this[4] = a01;
      this[6] = this[9];
      this[7] = this[13];
      this[8] = a02;
      this[9] = a12;
      this[11] = this[14];
      this[12] = a03;
      this[13] = a13;
      this[14] = a23;
      return this;
    }
    decompose(out_r, out_t, out_s) {
      out_t[0] = this[12];
      out_t[1] = this[13];
      out_t[2] = this[14];
      const m11 = this[0];
      const m12 = this[1];
      const m13 = this[2];
      const m21 = this[4];
      const m22 = this[5];
      const m23 = this[6];
      const m31 = this[8];
      const m32 = this[9];
      const m33 = this[10];
      out_s[0] = Math.hypot(m11, m12, m13);
      out_s[1] = Math.hypot(m21, m22, m23);
      out_s[2] = Math.hypot(m31, m32, m33);
      const is1 = 1 / out_s[0];
      const is2 = 1 / out_s[1];
      const is3 = 1 / out_s[2];
      const sm11 = m11 * is1;
      const sm12 = m12 * is2;
      const sm13 = m13 * is3;
      const sm21 = m21 * is1;
      const sm22 = m22 * is2;
      const sm23 = m23 * is3;
      const sm31 = m31 * is1;
      const sm32 = m32 * is2;
      const sm33 = m33 * is3;
      const trace = sm11 + sm22 + sm33;
      let S = 0;
      if (trace > 0) {
        S = Math.sqrt(trace + 1) * 2;
        out_r[3] = 0.25 * S;
        out_r[0] = (sm23 - sm32) / S;
        out_r[1] = (sm31 - sm13) / S;
        out_r[2] = (sm12 - sm21) / S;
      } else if (sm11 > sm22 && sm11 > sm33) {
        S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
        out_r[3] = (sm23 - sm32) / S;
        out_r[0] = 0.25 * S;
        out_r[1] = (sm12 + sm21) / S;
        out_r[2] = (sm31 + sm13) / S;
      } else if (sm22 > sm33) {
        S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
        out_r[3] = (sm31 - sm13) / S;
        out_r[0] = (sm12 + sm21) / S;
        out_r[1] = 0.25 * S;
        out_r[2] = (sm23 + sm32) / S;
      } else {
        S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
        out_r[3] = (sm12 - sm21) / S;
        out_r[0] = (sm31 + sm13) / S;
        out_r[1] = (sm23 + sm32) / S;
        out_r[2] = 0.25 * S;
      }
      return this;
    }
    rotX(rad) {
      const s = Math.sin(rad), c = Math.cos(rad), a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11];
      this[4] = a10 * c + a20 * s;
      this[5] = a11 * c + a21 * s;
      this[6] = a12 * c + a22 * s;
      this[7] = a13 * c + a23 * s;
      this[8] = a20 * c - a10 * s;
      this[9] = a21 * c - a11 * s;
      this[10] = a22 * c - a12 * s;
      this[11] = a23 * c - a13 * s;
      return this;
    }
    rotY(rad) {
      const s = Math.sin(rad), c = Math.cos(rad), a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11];
      this[0] = a00 * c - a20 * s;
      this[1] = a01 * c - a21 * s;
      this[2] = a02 * c - a22 * s;
      this[3] = a03 * c - a23 * s;
      this[8] = a00 * s + a20 * c;
      this[9] = a01 * s + a21 * c;
      this[10] = a02 * s + a22 * c;
      this[11] = a03 * s + a23 * c;
      return this;
    }
    rotZ(rad) {
      const s = Math.sin(rad), c = Math.cos(rad), a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3], a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7];
      this[0] = a00 * c + a10 * s;
      this[1] = a01 * c + a11 * s;
      this[2] = a02 * c + a12 * s;
      this[3] = a03 * c + a13 * s;
      this[4] = a10 * c - a00 * s;
      this[5] = a11 * c - a01 * s;
      this[6] = a12 * c - a02 * s;
      this[7] = a13 * c - a03 * s;
      return this;
    }
    rotAxisAngle(axis, rad) {
      let x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z);
      if (Math.abs(len) < 1e-6)
        return this;
      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      const t = 1 - c;
      const a00 = this[0];
      const a01 = this[1];
      const a02 = this[2];
      const a03 = this[3];
      const a10 = this[4];
      const a11 = this[5];
      const a12 = this[6];
      const a13 = this[7];
      const a20 = this[8];
      const a21 = this[9];
      const a22 = this[10];
      const a23 = this[11];
      const b00 = x * x * t + c;
      const b01 = y * x * t + z * s;
      const b02 = z * x * t - y * s;
      const b10 = x * y * t - z * s;
      const b11 = y * y * t + c;
      const b12 = z * y * t + x * s;
      const b20 = x * z * t + y * s;
      const b21 = y * z * t - x * s;
      const b22 = z * z * t + c;
      this[0] = a00 * b00 + a10 * b01 + a20 * b02;
      this[1] = a01 * b00 + a11 * b01 + a21 * b02;
      this[2] = a02 * b00 + a12 * b01 + a22 * b02;
      this[3] = a03 * b00 + a13 * b01 + a23 * b02;
      this[4] = a00 * b10 + a10 * b11 + a20 * b12;
      this[5] = a01 * b10 + a11 * b11 + a21 * b12;
      this[6] = a02 * b10 + a12 * b11 + a22 * b12;
      this[7] = a03 * b10 + a13 * b11 + a23 * b12;
      this[8] = a00 * b20 + a10 * b21 + a20 * b22;
      this[9] = a01 * b20 + a11 * b21 + a21 * b22;
      this[10] = a02 * b20 + a12 * b21 + a22 * b22;
      this[11] = a03 * b20 + a13 * b21 + a23 * b22;
      return this;
    }
    transformVec3(v, out) {
      const x = v[0], y = v[1], z = v[2];
      out = out || v;
      out[0] = this[0] * x + this[4] * y + this[8] * z + this[12];
      out[1] = this[1] * x + this[5] * y + this[9] * z + this[13];
      out[2] = this[2] * x + this[6] * y + this[10] * z + this[14];
      return out;
    }
    transformVec4(v, out) {
      const x = v[0], y = v[1], z = v[2], w = v[3];
      out = out || v;
      out[0] = this[0] * x + this[4] * y + this[8] * z + this[12] * w;
      out[1] = this[1] * x + this[5] * y + this[9] * z + this[13] * w;
      out[2] = this[2] * x + this[6] * y + this[10] * z + this[14] * w;
      out[3] = this[3] * x + this[7] * y + this[11] * z + this[15] * w;
      return out;
    }
    static mul(a, b) {
      return new Mat4().fromMul(a, b);
    }
    static invert(a) {
      return new Mat4().fromInvert(a);
    }
  }class Transform {
    rot = new Quat();
    pos = new Vec3(0);
    scl = new Vec3(1);
    constructor(rot, pos, scl) {
      if (rot instanceof Transform)
        this.copy(rot);
      else if (rot && pos && scl)
        this.set(rot, pos, scl);
    }
    reset() {
      this.rot.identity();
      this.pos.xyz(0, 0, 0);
      this.scl.xyz(1, 1, 1);
      return this;
    }
    copy(t) {
      this.rot.copy(t.rot);
      this.pos.copy(t.pos);
      this.scl.copy(t.scl);
      return this;
    }
    set(r, p, s) {
      if (r)
        this.rot.copy(r);
      if (p)
        this.pos.copy(p);
      if (s)
        this.scl.copy(s);
      return this;
    }
    clone() {
      return new Transform(this);
    }
    mul(cr, cp, cs) {
      if (cr instanceof Transform) {
        cp = cr.pos;
        cs = cr.scl;
        cr = cr.rot;
      }
      if (cr && cp) {
        this.pos.add(new Vec3(this.scl).mul(cp).transformQuat(this.rot));
        if (cs)
          this.scl.mul(cs);
        this.rot.mul(cr);
      }
      return this;
    }
    pmul(pr, pp, ps) {
      if (pr instanceof Transform) {
        pp = pr.pos;
        ps = pr.scl;
        pr = pr.rot;
      }
      if (!pr || !pp || !ps)
        return this;
      this.pos.mul(ps).transformQuat(pr).add(pp);
      if (ps)
        this.scl.mul(ps);
      this.rot.pmul(pr);
      return this;
    }
    addPos(cp, ignoreScl = false) {
      if (ignoreScl)
        this.pos.add(new Vec3().fromQuat(this.rot, cp));
      else
        this.pos.add(new Vec3().fromMul(cp, this.scl).transformQuat(this.rot));
      return this;
    }
    pivotRot(pivot, q) {
      this.rot.pmul(q);
      const offset = new Vec3().fromSub(this.pos, pivot).transformQuat(q);
      this.pos[0] = pivot[0] + offset[0];
      this.pos[1] = pivot[1] + offset[1];
      this.pos[2] = pivot[2] + offset[2];
      return this;
    }
    fromMul(tp, tc) {
      const v = new Vec3().fromMul(tp.scl, tc.pos).transformQuat(tp.rot);
      this.pos.fromAdd(tp.pos, v);
      this.scl.fromMul(tp.scl, tc.scl);
      this.rot.fromMul(tp.rot, tc.rot);
      return this;
    }
    fromInvert(t) {
      this.rot.fromInvert(t.rot);
      this.scl.fromInvert(t.scl);
      this.pos.fromNegate(t.pos).mul(this.scl).transformQuat(this.rot);
      return this;
    }
    transformVec3(v, out) {
      const vx = v[0] * this.scl[0];
      const vy = v[1] * this.scl[1];
      const vz = v[2] * this.scl[2];
      const qx = this.rot[0];
      const qy = this.rot[1];
      const qz = this.rot[2];
      const qw = this.rot[3];
      const x1 = qy * vz - qz * vy;
      const y1 = qz * vx - qx * vz;
      const z1 = qx * vy - qy * vx;
      const x2 = qw * x1 + qy * z1 - qz * y1;
      const y2 = qw * y1 + qz * x1 - qx * z1;
      const z2 = qw * z1 + qx * y1 - qy * x1;
      const rtn = out || v;
      rtn[0] = vx + 2 * x2 + this.pos[0];
      rtn[1] = vy + 2 * y2 + this.pos[1];
      rtn[2] = vz + 2 * z2 + this.pos[2];
      return rtn;
    }
  }class DualQuat extends Array {
    constructor(q, t) {
      super(8);
      if (q && t)
        this.fromQuatTran(q, t);
      else if (q) {
        this[0] = q[0];
        this[1] = q[1];
        this[2] = q[2];
        this[3] = q[3];
      } else
        this[3] = 1;
    }
    reset() {
      this[0] = 0;
      this[1] = 0;
      this[2] = 0;
      this[3] = 1;
      this[4] = 0;
      this[5] = 0;
      this[6] = 0;
      this[7] = 0;
      return this;
    }
    clone() {
      const out = new DualQuat();
      out[0] = this[0];
      out[1] = this[1];
      out[2] = this[2];
      out[3] = this[3];
      out[4] = this[4];
      out[5] = this[5];
      out[6] = this[6];
      out[7] = this[7];
      return out;
    }
    copy(a) {
      this[0] = a[0];
      this[1] = a[1];
      this[2] = a[2];
      this[3] = a[3];
      this[4] = a[4];
      this[5] = a[5];
      this[6] = a[6];
      this[7] = a[7];
      return this;
    }
    lenSqr() {
      return this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3];
    }
    getTranslation(out = [0, 0, 0]) {
      const ax = this[4], ay = this[5], az = this[6], aw = this[7], bx = -this[0], by = -this[1], bz = -this[2], bw = this[3];
      out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
      out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
      out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
      return out;
    }
    getQuat(out = [0, 0, 0, 0]) {
      out[0] = this[0];
      out[1] = this[1];
      out[2] = this[2];
      out[3] = this[3];
      return out;
    }
    fromBuf(ary, idx) {
      this[0] = ary[idx];
      this[1] = ary[idx + 1];
      this[2] = ary[idx + 2];
      this[3] = ary[idx + 3];
      this[4] = ary[idx + 4];
      this[5] = ary[idx + 5];
      this[6] = ary[idx + 6];
      this[7] = ary[idx + 7];
      return this;
    }
    toBuf(ary, idx) {
      ary[idx] = this[0];
      ary[idx + 1] = this[1];
      ary[idx + 2] = this[2];
      ary[idx + 3] = this[3];
      ary[idx + 4] = this[4];
      ary[idx + 5] = this[5];
      ary[idx + 6] = this[6];
      ary[idx + 7] = this[7];
      return this;
    }
    fromQuatTran(q, t) {
      const ax = t[0] * 0.5;
      const ay = t[1] * 0.5;
      const az = t[2] * 0.5;
      const bx = q[0];
      const by = q[1];
      const bz = q[2];
      const bw = q[3];
      this[0] = bx;
      this[1] = by;
      this[2] = bz;
      this[3] = bw;
      this[4] = ax * bw + ay * bz - az * by;
      this[5] = ay * bw + az * bx - ax * bz;
      this[6] = az * bw + ax * by - ay * bx;
      this[7] = -ax * bx - ay * by - az * bz;
      return this;
    }
    fromTranslation(t) {
      this[0] = 0;
      this[1] = 0;
      this[2] = 0;
      this[3] = 1;
      this[4] = t[0] * 0.5;
      this[5] = t[1] * 0.5;
      this[6] = t[2] * 0.5;
      this[7] = 0;
      return this;
    }
    fromQuat(q) {
      this[0] = q[0];
      this[1] = q[1];
      this[2] = q[2];
      this[3] = q[3];
      this[4] = 0;
      this[5] = 0;
      this[6] = 0;
      this[7] = 0;
      return this;
    }
    fromMul(a, b) {
      const ax0 = a[0], ay0 = a[1], az0 = a[2], aw0 = a[3];
      const ax1 = a[4], ay1 = a[5], az1 = a[6], aw1 = a[7];
      const bx0 = b[0], by0 = b[1], bz0 = b[2], bw0 = b[3];
      const bx1 = b[4], by1 = b[5], bz1 = b[6], bw1 = b[7];
      this[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
      this[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
      this[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
      this[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
      this[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
      this[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
      this[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
      this[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
      return this;
    }
    fromNorm(a) {
      let magnitude = a[0] ** 2 + a[1] ** 2 + a[2] ** 2 + a[3] ** 2;
      if (magnitude == 0)
        return this;
      magnitude = 1 / Math.sqrt(magnitude);
      const a0 = a[0] * magnitude;
      const a1 = a[1] * magnitude;
      const a2 = a[2] * magnitude;
      const a3 = a[3] * magnitude;
      const b0 = a[4];
      const b1 = a[5];
      const b2 = a[6];
      const b3 = a[7];
      const a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
      this[0] = a0;
      this[1] = a1;
      this[2] = a2;
      this[3] = a3;
      this[4] = (b0 - a0 * a_dot_b) * magnitude;
      this[5] = (b1 - a1 * a_dot_b) * magnitude;
      this[6] = (b2 - a2 * a_dot_b) * magnitude;
      this[7] = (b3 - a3 * a_dot_b) * magnitude;
      return this;
    }
    fromInvert(a) {
      const sqlen = 1 / (a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
      this[0] = -a[0] * sqlen;
      this[1] = -a[1] * sqlen;
      this[2] = -a[2] * sqlen;
      this[3] = a[3] * sqlen;
      this[4] = -a[4] * sqlen;
      this[5] = -a[5] * sqlen;
      this[6] = -a[6] * sqlen;
      this[7] = a[7] * sqlen;
      return this;
    }
    fromConjugate(a) {
      this[0] = -a[0];
      this[1] = -a[1];
      this[2] = -a[2];
      this[3] = a[3];
      this[4] = -a[4];
      this[5] = -a[5];
      this[6] = -a[6];
      this[7] = a[7];
      return this;
    }
    add(q) {
      this[0] = this[0] + q[0];
      this[1] = this[1] + q[1];
      this[2] = this[2] + q[2];
      this[3] = this[3] + q[3];
      this[4] = this[4] + q[4];
      this[5] = this[5] + q[5];
      this[6] = this[6] + q[6];
      this[7] = this[7] + q[7];
      return this;
    }
    mul(q) {
      const ax0 = this[0], ay0 = this[1], az0 = this[2], aw0 = this[3];
      const ax1 = this[4], ay1 = this[5], az1 = this[6], aw1 = this[7];
      const bx0 = q[0], by0 = q[1], bz0 = q[2], bw0 = q[3];
      const bx1 = q[4], by1 = q[5], bz1 = q[6], bw1 = q[7];
      this[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
      this[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
      this[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
      this[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
      this[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
      this[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
      this[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
      this[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
      return this;
    }
    pmul(q) {
      const ax0 = q[0], ay0 = q[1], az0 = q[2], aw0 = q[3];
      const ax1 = q[4], ay1 = q[5], az1 = q[6], aw1 = q[7];
      const bx0 = this[0], by0 = this[1], bz0 = this[2], bw0 = this[3];
      const bx1 = this[4], by1 = this[5], bz1 = this[6], bw1 = this[7];
      this[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
      this[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
      this[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
      this[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
      this[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
      this[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
      this[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
      this[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
      return this;
    }
    scale(s) {
      this[0] = this[0] * s;
      this[1] = this[1] * s;
      this[2] = this[2] * s;
      this[3] = this[3] * s;
      this[4] = this[4] * s;
      this[5] = this[5] * s;
      this[6] = this[6] * s;
      this[7] = this[7] * s;
      return this;
    }
    norm() {
      let magnitude = this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2;
      if (magnitude == 0)
        return this;
      magnitude = 1 / Math.sqrt(magnitude);
      const a0 = this[0] * magnitude;
      const a1 = this[1] * magnitude;
      const a2 = this[2] * magnitude;
      const a3 = this[3] * magnitude;
      const b0 = this[4];
      const b1 = this[5];
      const b2 = this[6];
      const b3 = this[7];
      const a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
      this[0] = a0;
      this[1] = a1;
      this[2] = a2;
      this[3] = a3;
      this[4] = (b0 - a0 * a_dot_b) * magnitude;
      this[5] = (b1 - a1 * a_dot_b) * magnitude;
      this[6] = (b2 - a2 * a_dot_b) * magnitude;
      this[7] = (b3 - a3 * a_dot_b) * magnitude;
      return this;
    }
    invert() {
      const sqlen = 1 / (this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2);
      this[0] = -this[0] * sqlen;
      this[1] = -this[1] * sqlen;
      this[2] = -this[2] * sqlen;
      this[3] = this[3] * sqlen;
      this[4] = -this[4] * sqlen;
      this[5] = -this[5] * sqlen;
      this[6] = -this[6] * sqlen;
      this[7] = this[7] * sqlen;
      return this;
    }
    conjugate() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      this[4] = -this[4];
      this[5] = -this[5];
      this[6] = -this[6];
      return this;
    }
    translate(v) {
      const ax1 = this[0], ay1 = this[1], az1 = this[2], aw1 = this[3];
      const ax2 = this[4], ay2 = this[5], az2 = this[6], aw2 = this[7];
      const bx1 = v[0] * 0.5, by1 = v[1] * 0.5, bz1 = v[2] * 0.5;
      this[0] = ax1;
      this[1] = ay1;
      this[2] = az1;
      this[3] = aw1;
      this[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
      this[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
      this[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
      this[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
      return this;
    }
    mulQuat(q) {
      const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
      let ax = this[0], ay = this[1], az = this[2], aw = this[3];
      this[0] = ax * qw + aw * qx + ay * qz - az * qy;
      this[1] = ay * qw + aw * qy + az * qx - ax * qz;
      this[2] = az * qw + aw * qz + ax * qy - ay * qx;
      this[3] = aw * qw - ax * qx - ay * qy - az * qz;
      ax = this[4];
      ay = this[5];
      az = this[6];
      aw = this[7];
      this[4] = ax * qw + aw * qx + ay * qz - az * qy;
      this[5] = ay * qw + aw * qy + az * qx - ax * qz;
      this[6] = az * qw + aw * qz + ax * qy - ay * qx;
      this[7] = aw * qw - ax * qx - ay * qy - az * qz;
      return this;
    }
    pmulQuat(q) {
      const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
      let bx = this[0], by = this[1], bz = this[2], bw = this[3];
      this[0] = qx * bw + qw * bx + qy * bz - qz * by;
      this[1] = qy * bw + qw * by + qz * bx - qx * bz;
      this[2] = qz * bw + qw * bz + qx * by - qy * bx;
      this[3] = qw * bw - qx * bx - qy * by - qz * bz;
      bx = this[4];
      by = this[5];
      bz = this[6];
      bw = this[7];
      this[4] = qx * bw + qw * bx + qy * bz - qz * by;
      this[5] = qy * bw + qw * by + qz * bx - qx * bz;
      this[6] = qz * bw + qw * bz + qx * by - qy * bx;
      this[7] = qw * bw - qx * bx - qy * by - qz * bz;
      return this;
    }
    rotX(rad) {
      const bbx = this[0], bby = this[1], bbz = this[2], bbw = this[3];
      let bx = -this[0], by = -this[1], bz = -this[2], bw = this[3];
      const ax = this[4], ay = this[5], az = this[6], aw = this[7];
      const ax1 = ax * bw + aw * bx + ay * bz - az * by;
      const ay1 = ay * bw + aw * by + az * bx - ax * bz;
      const az1 = az * bw + aw * bz + ax * by - ay * bx;
      const aw1 = aw * bw - ax * bx - ay * by - az * bz;
      rad *= 0.5;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      bx = this[0] = bbx * cos + bbw * sin;
      by = this[1] = bby * cos + bbz * sin;
      bz = this[2] = bbz * cos - bby * sin;
      bw = this[3] = bbw * cos - bbx * sin;
      this[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
      this[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
      this[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
      this[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
      return this;
    }
    rotY(rad) {
      const bbx = this[0], bby = this[1], bbz = this[2], bbw = this[3];
      let bx = -this[0], by = -this[1], bz = -this[2], bw = this[3];
      const ax = this[4], ay = this[5], az = this[6], aw = this[7];
      const ax1 = ax * bw + aw * bx + ay * bz - az * by;
      const ay1 = ay * bw + aw * by + az * bx - ax * bz;
      const az1 = az * bw + aw * bz + ax * by - ay * bx;
      const aw1 = aw * bw - ax * bx - ay * by - az * bz;
      rad *= 0.5;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      bx = this[0] = bbx * cos - bbz * sin;
      by = this[1] = bby * cos + bbw * sin;
      bz = this[2] = bbz * cos + bbx * sin;
      bw = this[3] = bbw * cos - bby * sin;
      this[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
      this[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
      this[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
      this[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
      return this;
    }
    rotZ(rad) {
      const bbx = this[0], bby = this[1], bbz = this[2], bbw = this[3];
      let bx = -this[0], by = -this[1], bz = -this[2], bw = this[3];
      const ax = this[4], ay = this[5], az = this[6], aw = this[7];
      const ax1 = ax * bw + aw * bx + ay * bz - az * by;
      const ay1 = ay * bw + aw * by + az * bx - ax * bz;
      const az1 = az * bw + aw * bz + ax * by - ay * bx;
      const aw1 = aw * bw - ax * bx - ay * by - az * bz;
      rad *= 0.5;
      const sin = Math.sin(rad), cos = Math.cos(rad);
      bx = this[0] = bbx * cos + bby * sin;
      by = this[1] = bby * cos - bbx * sin;
      bz = this[2] = bbz * cos + bbw * sin;
      bw = this[3] = bbw * cos - bbz * sin;
      this[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
      this[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
      this[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
      this[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
      return this;
    }
    rotAxisAngle(axis, rad) {
      if (Math.abs(rad) < 1e-6)
        return this;
      const axisLength = 1 / Math.sqrt(axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2);
      rad = rad * 0.5;
      const s = Math.sin(rad);
      const bx = s * axis[0] * axisLength;
      const by = s * axis[1] * axisLength;
      const bz = s * axis[2] * axisLength;
      const bw = Math.cos(rad);
      const ax1 = this[0], ay1 = this[1], az1 = this[2], aw1 = this[3];
      const ax = this[4], ay = this[5], az = this[6], aw = this[7];
      this[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
      this[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
      this[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
      this[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
      this[4] = ax * bw + aw * bx + ay * bz - az * by;
      this[5] = ay * bw + aw * by + az * bx - ax * bz;
      this[6] = az * bw + aw * bz + ax * by - ay * bx;
      this[7] = aw * bw - ax * bx - ay * by - az * bz;
      return this;
    }
    transformVec3(v, out) {
      const pos = this.getTranslation();
      const qx = this[0], qy = this[1], qz = this[2], qw = this[3];
      const vx = v[0], vy = v[1], vz = v[2];
      const x1 = qy * vz - qz * vy;
      const y1 = qz * vx - qx * vz;
      const z1 = qx * vy - qy * vx;
      const x2 = qw * x1 + qy * z1 - qz * y1;
      const y2 = qw * y1 + qz * x1 - qx * z1;
      const z2 = qw * z1 + qx * y1 - qy * x1;
      out = out || v;
      out[0] = vx + 2 * x2 + pos[0];
      out[1] = vy + 2 * y2 + pos[1];
      out[2] = vz + 2 * z2 + pos[2];
      return out;
    }
  }class Vec3Wizzy {
    static xp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = x;
      o[1] = -z;
      o[2] = y;
      return o;
    }
    static xn(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = x;
      o[1] = z;
      o[2] = -y;
      return o;
    }
    static yp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = -z;
      o[1] = y;
      o[2] = x;
      return o;
    }
    static yn(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = z;
      o[1] = y;
      o[2] = -x;
      return o;
    }
    static zp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = y;
      o[1] = -x;
      o[2] = z;
      return o;
    }
    static zn(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = -y;
      o[1] = x;
      o[2] = z;
      return o;
    }
    static xp_yn(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = -y;
      o[1] = -z;
      o[2] = x;
      return o;
    }
    static xp_yp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = y;
      o[1] = -z;
      o[2] = -x;
      return o;
    }
    static xp_yp_yp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = -x;
      o[1] = -z;
      o[2] = -y;
      return o;
    }
    static xp_xp(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = x;
      o[1] = -y;
      o[2] = -z;
      return o;
    }
    static yn_yn(v, o) {
      const x = v[0], y = v[1], z = v[2];
      o[0] = -x;
      o[1] = y;
      o[2] = -z;
      return o;
    }
  }export{DualQuat,Mat4,Quat,Transform,Vec2,Vec3,Vec3Wizzy};
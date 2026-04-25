// 名称: 简易3D
// ID: xeltallivSimple3D
// 描述: 轻松制作GPU加速的3D项目。
// 作者: Vadik1 <https://scratch.mit.edu/users/Vadik1/>
//汉化：Starfall Twilight <https://starfallstudio.cn>
// 许可证: MPL-2.0 AND BSD-3-Clause
// 版本: 1.2.2

(function (Scratch) {
  "use strict";

  /*
   * 基于webglfundamentals.org早期教程修改的m4库版本
   * 所有教程可在 https://github.com/gfxfundamentals/webgl-fundamentals/tree/master 找到
   * 采用BSD 3-Clause许可证授权。
   * 仅代码的此部分采用BSD 3-Clause许可证，拓展其余部分采用MPL-2.0许可证。
   */

  /*
   * Copyright 2021 GFXFundamentals.
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are
   * met:
   *
   *     * Redistributions of source code must retain the above copyright
   * notice, this list of conditions and the following disclaimer.
   *     * Redistributions in binary form must reproduce the above
   * copyright notice, this list of conditions and the following disclaimer
   * in the documentation and/or other materials provided with the
   * distribution.
   *     * Neither the name of GFXFundamentals. nor the names of his
   * contributors may be used to endorse or promote products derived from
   * this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
   * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
   * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
   * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
   * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
   * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */
  // prettier-ignore
  const m4 = {
    perspective(fieldOfViewInRadians, aspect, near, far) {
      const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
      const rangeInv = 1.0 / (near - far);
      return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
      ];
    },
    orthographic(aspect, near, far) {
      const a = 2 / (near - far);
      const b = -1 + near * a;
      return [
        1 / aspect, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, a, 0,
        0, 0, b, 1
      ];
    },
    translate(m, tx, ty, tz) {
      return [
        m[0],
        m[1],
        m[2],
        m[3],
        m[4],
        m[5],
        m[6],
        m[7],
        m[8],
        m[9],
        m[10],
        m[11],
        tx * m[0] + ty * m[4] + tz * m[8] + m[12],
        tx * m[1] + ty * m[5] + tz * m[9] + m[13],
        tx * m[2] + ty * m[6] + tz * m[10] + m[14],
        tx * m[3] + ty * m[7] + tz * m[11] + m[15],
      ];
    },
    xRotate(m, angleInRadians) {
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      return [
        m[0],
        m[1],
        m[2],
        m[3],
        c * m[4] + s * m[8],
        c * m[5] + s * m[9],
        c * m[6] + s * m[10],
        c * m[7] + s * m[11],
        c * m[8]  - s * m[4],
        c * m[9]  - s * m[5],
        c * m[10] - s * m[6],
        c * m[11] - s * m[7],
        m[12],
        m[13],
        m[14],
        m[15],
      ];
    },
    yRotate(m, angleInRadians) {
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      return [
        c * m[0] - s * m[8],
        c * m[1] - s * m[9],
        c * m[2] - s * m[10],
        c * m[3] - s * m[11],
        m[4],
        m[5],
        m[6],
        m[7],
        s * m[0] + c * m[8],
        s * m[1] + c * m[9],
        s * m[2] + c * m[10],
        s * m[3] + c * m[11],
        m[12],
        m[13],
        m[14],
        m[15],
      ];
    },
    zRotate(m, angleInRadians) {
      const c = Math.cos(angleInRadians);
      const s = Math.sin(angleInRadians);
      return [
        c * m[0] + s * m[4],
        c * m[1] + s * m[5],
        c * m[2] + s * m[6],
        c * m[3] + s * m[7],
        c * m[4] - s * m[0],
        c * m[5] - s * m[1],
        c * m[6] - s * m[2],
        c * m[7] - s * m[3],
        m[8],
        m[9],
        m[10],
        m[11],
        m[12],
        m[13],
        m[14],
        m[15],
      ];
    },
    scale(m, sx, sy, sz) {
      return [
        sx * m[0],
        sx * m[1],
        sx * m[2],
        sx * m[3],
        sy * m[4],
        sy * m[5],
        sy * m[6],
        sy * m[7],
        sz * m[8],
        sz * m[9],
        sz * m[10],
        sz * m[11],
        m[12],
        m[13],
        m[14],
        m[15],
      ];
    },
    multiply(a, b) {
      const a00 = a[0 * 4 + 0];
      const a01 = a[0 * 4 + 1];
      const a02 = a[0 * 4 + 2];
      const a03 = a[0 * 4 + 3];
      const a10 = a[1 * 4 + 0];
      const a11 = a[1 * 4 + 1];
      const a12 = a[1 * 4 + 2];
      const a13 = a[1 * 4 + 3];
      const a20 = a[2 * 4 + 0];
      const a21 = a[2 * 4 + 1];
      const a22 = a[2 * 4 + 2];
      const a23 = a[2 * 4 + 3];
      const a30 = a[3 * 4 + 0];
      const a31 = a[3 * 4 + 1];
      const a32 = a[3 * 4 + 2];
      const a33 = a[3 * 4 + 3];
      const b00 = b[0 * 4 + 0];
      const b01 = b[0 * 4 + 1];
      const b02 = b[0 * 4 + 2];
      const b03 = b[0 * 4 + 3];
      const b10 = b[1 * 4 + 0];
      const b11 = b[1 * 4 + 1];
      const b12 = b[1 * 4 + 2];
      const b13 = b[1 * 4 + 3];
      const b20 = b[2 * 4 + 0];
      const b21 = b[2 * 4 + 1];
      const b22 = b[2 * 4 + 2];
      const b23 = b[2 * 4 + 3];
      const b30 = b[3 * 4 + 0];
      const b31 = b[3 * 4 + 1];
      const b32 = b[3 * 4 + 2];
      const b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
    multiplyVec: function(a, b) {
      const a00 = a[0 * 4 + 0];
      const a01 = a[0 * 4 + 1];
      const a02 = a[0 * 4 + 2];
      const a03 = a[0 * 4 + 3];
      const a10 = a[1 * 4 + 0];
      const a11 = a[1 * 4 + 1];
      const a12 = a[1 * 4 + 2];
      const a13 = a[1 * 4 + 3];
      const a20 = a[2 * 4 + 0];
      const a21 = a[2 * 4 + 1];
      const a22 = a[2 * 4 + 2];
      const a23 = a[2 * 4 + 3];
      const a30 = a[3 * 4 + 0];
      const a31 = a[3 * 4 + 1];
      const a32 = a[3 * 4 + 2];
      const a33 = a[3 * 4 + 3];
      const b00 = b[0];
      const b01 = b[1];
      const b02 = b[2];
      const b03 = b[3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      ];
    },
    identity() {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
    },
    zero: function() {
      return [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ];
    },
    inverse: function(m) {
      const inv = [
         m[5] * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10],
        -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10],
         m[1] * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6],
        -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6],
        -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10],
         m[0] * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10],
        -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6],
         m[0] * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6],
         m[4] * m[9]  * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9],
        -m[0] * m[9]  * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9],
         m[0] * m[5]  * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5],
        -m[0] * m[5]  * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5],
        -m[4] * m[9]  * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9],
         m[0] * m[9]  * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9],
        -m[0] * m[5]  * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5],
         m[0] * m[5]  * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5]
      ];
      const det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
      if (det == 0) return m4.zero();
      const invDet = 1 / det;
      for(let i=0; i<16; i++) {
        inv[i] *= invDet;
      }
      return inv;
    },
  };
  /* m4库结束 */

  /**
   * 检测对象是否有自有属性（兼容旧浏览器）
   * @param {object} obj 目标对象
   * @param {string} name 属性名
   * @returns {boolean} 是否包含该自有属性
   */
  const hasOwn = (obj, name) => Object.prototype.hasOwnProperty.call(obj, name);

  class Buffer {
    constructor(type) {
      this.buffer = gl.createBuffer();
      this.bytesPerEl = 1;
      this.size = 1;
      this.length = 0;
      this.type = type;
    }
    destroy() {
      gl.deleteBuffer(this.buffer);
    }
  }
  class RenderTarget {
    constructor() {
      this.destroyed = false;
      this.viewport = null;
      this.scissors = null;
      this.readarea = null;
    }
    setAsRenderTarget() {
      currentRenderTarget = this;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFramebuffer());
      this.updateViewport();
      this.updateDepth();
      this.updateScissorsEnabled();
    }
    updateScissorsEnabled() {
      if (this.scissors) {
        gl.enable(gl.SCISSOR_TEST);
      } else {
        gl.disable(gl.SCISSOR_TEST);
      }
    }
    updateViewport() {
      const a = this.viewport;
      const b = this.scissors;
      if (a) {
        gl.viewport(a.x, a.y, a.w, a.h);
      } else {
        gl.viewport(0, 0, this.width, this.height);
      }
      if (b) {
        gl.scissor(b.x, b.y, b.w, b.h);
      }
    }
    getReadarea() {
      if (this.readarea) return this.readarea;
      return {
        x: 0,
        y: 0,
        w: this.width,
        h: this.height,
      };
    }
    updateDepth() {
      if (this.depthTest == "everything" && !this.depthWrite) {
        gl.disable(gl.DEPTH_TEST);
      } else {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(DepthTests[this.depthTest]);
        gl.depthMask(this.depthWrite);
      }
    }
    getAspectRatio() {
      if (this.width == 0) return 1;
      return this.width / this.height;
    }
    destroy() {
      this.destroyed = true;
    }
  }
  class CanvasRenderTarget extends RenderTarget {
    constructor() {
      super();
      this.reset();
    }
    get width() {
      return canvas.width;
    }
    get height() {
      return canvas.height;
    }
    getFramebuffer() {
      return null;
    }
    getMesh() {
      return null;
    }
    setDepth(test, write) {
      this.depthTest = test;
      this.depthWrite = write;
    }
    get hasDepthBuffer() {
      return true;
    }
    isLoading() {
      return false;
    }
    checkIfValid() {
      return true;
    }
    reset() {
      this.depthTest = "closer";
      this.depthWrite = true;
    }
  }
  class Texture {
    constructor(target, mesh) {
      this.mesh = mesh;
      this.target = target;
      this.texture = gl.createTexture();
      this.width = 0;
      this.height = 0;
      this.depthTest = "everything";
      this.depthWrite = false;
      this.wrap = gl.CLAMP_TO_EDGE;
      this.filter = gl.NEAREST;
      this.mipFilter = gl.NEAREST;
      this.mipEnabled = false;
      this.anisotropy = 1;
      this.hasDepthBuffer = false;
      this.update();
    }
    bindTexture() {
      gl.bindTexture(this.target, this.texture);
    }
    update() {
      let minFilter = this.filter;
      if (this.mipEnabled) {
        const lookup = [
          [gl.NEAREST_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR],
          [gl.LINEAR_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_LINEAR],
        ];
        minFilter =
          lookup[+(this.filter == gl.LINEAR)][+(this.mipFilter == gl.LINEAR)];
      }
      gl.bindTexture(this.target, this.texture);
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, this.wrap);
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, this.wrap);
      gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, this.filter);
    }
    setTextureProps(side, width, height, wrap, filter) {
      const resize = this.width !== width || this.height !== height;
      this.width = width;
      this.height = height;
      this.wrap = wrap;
      this.filter = filter;
      if (resize) {
        for (const otherSide of this.sides) {
          if (otherSide !== side) otherSide.resetTexture(width, height);
        }
      }
      this.update();
      this.maybeRegenMipmap();
      if (ext_af)
        gl.texParameterf(
          this.target,
          ext_af.TEXTURE_MAX_ANISOTROPY_EXT,
          this.anisotropy
        );
    }
    setMipmapState(enabled, filter) {
      this.mipEnabled = enabled;
      this.mipFilter = filter;
      this.update();
      this.maybeRegenMipmap();
    }
    setAnisotropy(value) {
      if (!ext_af) return;
      this.anisotropy = value;
      gl.bindTexture(this.target, this.texture);
      this.maybeRegenMipmap();
      gl.texParameterf(this.target, ext_af.TEXTURE_MAX_ANISOTROPY_EXT, value);
    }
    maybeRegenMipmap() {
      if (
        (this.mipEnabled || this.anisotropy > 1) &&
        !this.isLoading() &&
        !this.hasFailedToLoad()
      ) {
        gl.generateMipmap(this.target);
      }
    }
    setDepth(test, write) {
      this.depthTest = test;
      this.depthWrite = write;
      if (!this.hasDepthBuffer && write) {
        this.hasDepthBuffer = true;
        for (let side of this.sides) {
          side.createDepthBuffer();
        }
      }
    }
    isLoading() {
      // TODO: 优化：让各个纹理面主动上报状态变化，而非每次查询
      for (const side of this.sides) {
        if (side.loading) return true;
      }
      return false;
    }
    hasFailedToLoad() {
      for (const side of this.sides) {
        if (side.failedToLoad) return true;
      }
      return false;
    }
    destroy() {
      gl.deleteTexture(this.texture);
      for (const side of this.sides) side.destroy();
    }
  }
  class Texture2D extends Texture {
    constructor(mesh) {
      super(gl.TEXTURE_2D, mesh);
      this.main = new TextureSide(this, gl.TEXTURE_2D);
      this.sides = [this.main];
    }
  }
  class TextureCube extends Texture {
    constructor(mesh) {
      super(gl.TEXTURE_CUBE_MAP, mesh);
      this.xpos = new TextureSide(this, gl.TEXTURE_CUBE_MAP_POSITIVE_X);
      this.xneg = new TextureSide(this, gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
      this.ypos = new TextureSide(this, gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
      this.yneg = new TextureSide(this, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
      this.zpos = new TextureSide(this, gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
      this.zneg = new TextureSide(this, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
      this.sides = [
        this.xpos,
        this.xneg,
        this.ypos,
        this.yneg,
        this.zpos,
        this.zneg,
      ];
    }
  }
  class TextureSide extends RenderTarget {
    constructor(shared, target) {
      super();
      this.shared = shared;
      this.target = target;
      this.depthTexture = null;
      this.framebuffer = null;
      this.loading = false;
      this.failedToLoad = false;
      this.uninitialized = true;
    }
    resetTexture(width, height) {
      this.uninitialized = false;
      gl.texImage2D(
        this.target,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      if (this.depthTexture) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthTexture);
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          gl.DEPTH_COMPONENT24,
          width,
          height
        );
      }
      if (currentRenderTarget == this) this.updateViewport();
    }
    setTexture(data, width, height, wrap, filter) {
      this.uninitialized = false;
      this.loading = false;
      this.failedToLoad = false;
      this.shared.bindTexture();
      if (
        data instanceof HTMLImageElement ||
        data instanceof HTMLCanvasElement
      ) {
        gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
      } else {
        gl.texImage2D(
          this.target,
          0,
          gl.RGBA,
          width,
          height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          data
        );
      }
      this.shared.setTextureProps(this, width, height, wrap, filter);
      if (this.depthTexture) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthTexture);
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          gl.DEPTH_COMPONENT24,
          width,
          height
        );
      }
      if (currentRenderTarget == this) this.updateViewport();
    }
    getFramebuffer() {
      if (this.framebuffer) return this.framebuffer;
      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        this.target,
        this.shared.texture,
        0
      );
      return this.framebuffer;
    }
    createDepthBuffer() {
      const framebuffer = this.getFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      this.depthTexture = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthTexture);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT24,
        this.width,
        this.height
      );
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        this.depthTexture
      );
    }
    get depthTest() {
      return this.shared.depthTest;
    }
    get depthWrite() {
      return this.shared.depthWrite;
    }
    get width() {
      return this.shared.width;
    }
    get height() {
      return this.shared.height;
    }
    get hasDepthBuffer() {
      return this.shared.hasDepthBuffer;
    }
    setDepth(test, write) {
      this.shared.setDepth(test, write);
    }
    getMesh() {
      return this.shared.mesh;
    }
    checkIfValid() {
      return !(this.uninitialized || this.destroyed);
    }
    destroy() {
      if (this.depthTexture) gl.deleteRenderbuffer(this.depthTexture);
      if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
      super.destroy();
    }
  }
  class Mesh {
    constructor(name) {
      this.name = name;
      this.buffers = {};
      this.myBuffers = {};
      this.data = {};
      this.myData = {};
      this.uploadOffset = -1;
      this.uploadUsage = gl.STATIC_DRAW;
      this.dependants = new Set();
      this.dependencies = new Set();
    }
    update() {
      const buffers = {};
      const data = {};
      for (const otherMesh of this.dependencies) {
        Object.assign(buffers, otherMesh.buffers);
        Object.assign(data, otherMesh.data);
      }
      this.buffers = Object.assign(buffers, this.myBuffers);
      this.data = Object.assign(data, this.myData);
      for (const otherMesh of this.dependants) {
        otherMesh.update();
      }
    }
    dependsOn(mesh) {
      if (mesh == this) return true;
      for (const otherMesh of this.dependencies) {
        if (otherMesh.dependsOn(mesh)) return true;
      }
      return false;
    }
    checkIfValid() {
      if (currentRenderTarget.getMesh() == this) return false;
      if (!this.buffers.position) return false;
      let length = -1;
      let lengthIns = -1;
      for (const name in this.buffers) {
        const buffer = this.buffers[name];
        if (buffer.type == 0) {
          if (length == -1) length = buffer.length;
          else if (length !== buffer.length) return false;
        } else if (buffer.type == 1) {
          if (lengthIns == -1) lengthIns = buffer.length;
          else if (lengthIns !== buffer.length) return false;
        }
      }
      if (length == -1) return false;
      return true;
    }
    estimateListVRAM() {
      let sum = 0;
      for (const name in this.myBuffers) {
        const buffer = this.myBuffers[name];
        sum += buffer.length * buffer.size * buffer.bytesPerEl;
      }
      return sum;
    }
    estimateTextureVRAM() {
      const texture = this.myData.texture;
      if (!texture) return 0;
      let pixelsVRAM = texture.width * texture.height * 4;
      if (texture.hasDepthBuffer) pixelsVRAM *= 2;
      if (texture instanceof TextureCube) pixelsVRAM *= 6;
      return pixelsVRAM;
    }
    estimateVRAM() {
      return this.estimateListVRAM() + this.estimateTextureVRAM();
    }
    destroy() {
      for (let name in this.myBuffers) {
        this.myBuffers[name].destroy();
      }
      this.myData.texture?.destroy();
      for (const otherMesh of this.dependants) {
        otherMesh.dependencies.delete(this);
      }
      for (const otherMesh of this.dependencies) {
        otherMesh.dependants.delete(this);
      }
      for (const otherMesh of this.dependants) {
        otherMesh.update();
      }
      //TODO: 后续逻辑补充
    }
  }
  const MeshPropFns = {
    "继承自": (mesh) =>
      Array.from(mesh.dependencies)
        .map((m) => m.name)
        .join(","),
    "被继承自": (mesh) =>
      Array.from(mesh.dependants)
        .map((m) => m.name)
        .join(","),
    "可用于绘制": (mesh) => mesh.checkIfValid(),
    "有顶点索引": (mesh) => !!mesh.buffers.indices,
    "有位置信息": (mesh) => !!mesh.buffers.position,
    "有颜色信息": (mesh) => !!mesh.buffers.colors,
    "有纹理坐标": (mesh) => !!mesh.buffers.texCoords,
    "有骨骼索引/权重": (mesh) => !!mesh.buffers.boneIndices,
    "有骨骼": (mesh) => !!mesh.data.bonesDiff,
    "有实例化位置": (mesh) => !!mesh.buffers.instanceTransforms,
    "有实例化颜色": (mesh) => !!mesh.buffers.instanceColors,
    "有实例化UV偏移": (mesh) => !!mesh.buffers.instanceUVOffsets,

    "有纹理": (mesh) => !!mesh.data.texture,
    "纹理宽度": (mesh) => mesh.data.texture?.width,
    "纹理高度": (mesh) => mesh.data.texture?.height,
    "纹理存储深度信息": (mesh) => mesh.data.texture?.hasDepthBuffer,
    "纹理深度写入": (mesh) => mesh.data.texture?.depthWrite,
    "纹理深度测试": (mesh) => mesh.data.texture?.depthTest,
    "纹理是2D纹理": (mesh) => mesh.data.texture instanceof Texture2D,
    "纹理是立方体贴图": (mesh) => mesh.data.texture instanceof TextureCube,
    "纹理正在加载": (mesh) => mesh.data.texture?.isLoading?.(),
    "纹理加载失败": (mesh) => mesh.data.texture?.hasFailedToLoad?.(),

    "图元类型": (mesh) => mesh.data.primitivesName ?? "三角形",
    "混合模式": (mesh) => mesh.data.blending ?? "默认",
    "剔除模式": (mesh) => mesh.data.culling ?? "无",
    "Alpha阈值": (mesh) => mesh.data.alphaTest ?? 0,
    "强制不透明": (mesh) => !!mesh.data.makeOpaque,
    "有公告板效果": (mesh) => !!mesh.data.billboarding,
    "有顶点绘制范围": (mesh) => !!mesh.data.drawRange,
    "顶点绘制范围起始": (mesh) =>
      mesh.data.drawRange && mesh.data.drawRange[0] + 1,
    "顶点绘制范围结束": (mesh) =>
      mesh.data.drawRange && mesh.data.drawRange[0] + mesh.data.drawRange[1],
    "顶点绘制范围长度": (mesh) =>
      mesh.data.drawRange && mesh.data.drawRange[1],
    "实例绘制上限": (mesh) => mesh.data.maxInstances ?? Infinity,

    "启用部分列表更新": (mesh) => mesh.uploadOffset >= 0,
    "预估自身VRAM占用": (mesh) => mesh.estimateVRAM(),
    "预估自身列表VRAM占用": (mesh) => mesh.estimateListVRAM(),
    "预估自身纹理VRAM占用": (mesh) => mesh.estimateTextureVRAM(),
  };
  let workerSrc = `
  class OffModelImporter {
    constructor(dataRaw) {
      const dataStr = dataRaw.map(str => str.split("#")[0].replaceAll("\t", " ").trim()).filter(str => str.length);
      const dataArr = dataStr.map(str => str.split(" ").filter(e => e));
      let i = 0;
      if (dataStr[i].endsWith("OFF")) i++;
      if (dataArr[i].length !== 3) return false;
      const [vertexCount, faceCount, edgeCount] = dataArr[i].map(n => +n); i++;
      const vertices = dataArr.slice(i, i+vertexCount); i += vertexCount;
      const faces = dataArr.slice(i, i+faceCount); i += faceCount;
      this.vertices = vertices;
      this.output = {
        xyz: [],
        rgba: []
      }
      for(const face of faces) {
        const nVerts = +face[0];
        this.addPoly(face.slice(1, 1+nVerts), face.slice(1+nVerts));
      }
      let hasColor = false;
      const rgba = this.output.rgba;
      for(let i=0; i<rgba.length; i++) {
        if (rgba[i] < 1) {
          hasColor = true;
          break;
        }
      }
      if (!hasColor) delete this.output.rgba;
    }
    addPoly(vs, fallback) {
      fallback = fallback.map(this.parseColor);
      if (fallback.length == 3) fallback.push(1);
      for(let i=2; i<vs.length; i++) {
        this.addVertex(vs[  0], fallback);
        this.addVertex(vs[i-1], fallback);
        this.addVertex(vs[  i], fallback);
      }
    }
    addVertex(idx, fallback) {
      const v = this.vertices[idx];
      this.output.xyz.push(+v[0], +v[1], +v[2]);
      this.output.rgba.push(this.parseColor(v[3]) ?? fallback[0] ?? 1, this.parseColor(v[4]) ?? fallback[1] ?? 1, this.parseColor(v[5]) ?? fallback[2] ?? 1, this.parseColor(v[6]) ?? fallback[3] ?? 1);
    }
    parseColor(string) {
      const number = +string;
      if (!Number.isFinite(number)) return undefined;
      if (string.indexOf(".") == -1) return number / 255;
      return number;
    }
  }
  class ObjModelImporter {
    constructor(dataRaw) {
      const dataStr = dataRaw.map(str => str.replaceAll("\t", " ").trim()).filter(str => str.length && str[0] !== "#");
      const dataArr = dataStr.map(str => str.split(" ").filter(e => e));
      const materials = {" ": [1,1,1,1]};
      let materialLast = " ";
      let materialUsed = " ";
      const vertPos = this.vertPos = [null];
      const vertUV = this.vertUV = [null];
      this.output = {
        xyz: [],
        rgba: [],
        uv: []
      }
      for(let i=0; i<dataArr.length; i++) {
        const arr = dataArr[i];
        if (arr[0] == "v") {
          vertPos.push(arr.slice(1).map(Number));
        }
        if (arr[0] == "vt") {
          vertUV.push([+arr[1], +arr[2]]);
        }
        if (arr[0] == "f") {
          this.addPoly(arr.slice(1).map(e => e.split("/").map(Number)), materials[materialUsed]);
        }
        if (arr[0] == "usemtl") {
          materialUsed = materials[arr[1]] ? arr[1] : " ";
        }
        if (arr[0] == "newmtl") {
          materialLast = arr[1];
          materials[materialLast] = [1,1,1,1];
        }
        if (arr[0] == "Kd") {
          const color = materials[materialLast];
          color[0] = +arr[1];
          color[1] = +arr[2];
          color[2] = +arr[3];
        }
        if (arr[0] == "d") {
          const color = materials[materialLast];
          color[3] = +arr[1];
        }
        if (arr[0] == "Tr") {
          const color = materials[materialLast];
          color[3] = 1 - arr[1];
        }
      }
      if (this.output.uv.length/2 !== this.output.rgba.length/4) {
        this.output.uv = null;
      }
    }
    addPoly(vs, fallback) {
      for(let i=2; i<vs.length; i++) {
        this.addVertex(vs[  0][0], vs[  0][1], fallback);
        this.addVertex(vs[i-1][0], vs[i-1][1], fallback);
        this.addVertex(vs[  i][0], vs[  i][1], fallback);
      }
    }
    addVertex(idx, idxUV, fallback) {
      const v = this.vertPos[idx>0 ? idx : this.vertPos.length+idx];
      this.output.xyz.push(v[0], v[1], v[2]);
      this.output.rgba.push(v[3] ?? fallback[0] ?? 1, v[4] ?? fallback[1] ?? 1, v[5] ?? fallback[2] ?? 1, v[6] ?? fallback[3] ?? 1);
      if (idxUV !== undefined) {
        const u = this.vertUV[idxUV>0 ? idxUV : this.vertUV.length+idxUV];
        this.output.uv.push(u[0], 1-u[1]);
      }
    }
  }
  onmessage = (evt) => {
    const {type, array, importMatrix} = evt.data;
    let output = null;
    try {
      let model = null;
      if (type == "obj mtl") model = new ObjModelImporter(array);
      if (type == "off") model = new OffModelImporter(array);
      if (!model) return;
      output = model.output;
      if (output.xyz) {
        const xyz = output.xyz;
        let needsScaling = false;
        for(let i=0; i<16; i++) {
          if (importMatrix[i] !== +(i%5 == 0)) {
            needsScaling = true;
          }
        }
        const a = importMatrix;
        if (needsScaling) {
          for(let i=0; i<xyz.length; i+=3) {
            const x = xyz[i];
            const y = xyz[i+1];
            const z = xyz[i+2];
            xyz[i  ] = x * a[0] + y * a[4] + z * a[8] + a[12];
            xyz[i+1] = x * a[1] + y * a[5] + z * a[9] + a[13];
            xyz[i+2] = x * a[2] + y * a[6] + z * a[10] + a[14];
          }
        }
      }
      if (output.rgba) {
        const rgba = output.rgba;
        for(let i=0; i<rgba.length; i++) {
          rgba[i] *= 255;
        }
      }
    } catch(e) {
      output = null;
      console.error(e);
    }
    postMessage(output);
  }
  `;
  class ModelDecoder {
    constructor() {
      this.worker = null;
      this.timeout = -1;
      this.resolveFn = null;
      this.queue = [];
      this.timeLimit = 90000;
      this.boundHandle = this.handle.bind(this);
    }
    decode(type, array, importMatrix) {
      return new Promise((resolve) => {
        this.queue.push({ data: { type, array, importMatrix }, resolve });
        this.tryMoveQueue();
      });
    }
    tryMoveQueue() {
      if (this.busy) return;
      if (this.queue.length == 0) return;
      if (!this.worker) {
        this.worker = new Worker(
          `data:text/javascript;base64,${btoa(workerSrc)}`
        );
        this.worker.addEventListener("message", this.boundHandle);
      }
      const { data, resolve } = this.queue.shift();
      this.resolveFn = resolve;
      this.busy = true;
      this.worker.postMessage(data);
      this.timeout = setTimeout(this.restartWorker.bind(this), this.timeLimit);
    }
    handle(output) {
      if (this.timeout !== -1) {
        clearTimeout(this.timeout);
        this.timeout = -1;
      }
      this.resolveFn(output.data);
      this.resolveFn = null;
      this.busy = false;
      this.tryMoveQueue();
    }
    clear() {
      for (const { resolve } of this.queue) {
        resolve(null);
      }
      this.queue = [];
    }
    destroy() {
      this.clear();
      this.destroyWorker();
    }
    destroyWorker() {
      if (this.resolveFn) {
        this.resolveFn(null);
        this.resolveFn = null;
      }
      if (this.worker) {
        this.worker.removeEventListener("message", this.boundHandle);
        this.worker.terminate();
        this.worker = null;
        this.busy = false;
      }
    }
    restartWorker() {
      console.warn(
        "简易3D：模型解码工作线程耗时过长，已终止"
      );
      this.destroyWorker();
      this.tryMoveQueue();
    }
  }
  class SimpleSkin extends Scratch.vm.renderer.exports.Skin {
    constructor(id, renderer) {
      super(id, renderer);
      const gl = renderer.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      this._texture = texture;
      this._nativeSize = renderer.getNativeSize();
      this._boundOnNativeSizeChanged = this.onNativeSizeChanged.bind(this);
      this._rotationCenter = [this._nativeSize[0] / 2, this._nativeSize[1] / 2];
      renderer.on("NativeSizeChanged", this._boundOnNativeSizeChanged);
      this.resizeCanvas();
    }
    dispose() {
      renderer.removeListener(
        "NativeSizeChanged",
        this._boundOnNativeSizeChanged
      );
      if (this._texture) {
        this._renderer.gl.deleteTexture(this._texture);
        this._texture = null;
      }
      super.dispose();
    }
    get size() {
      return this._nativeSize;
    }
    getTexture(scale) {
      return this._texture || super.getTexture();
    }
    updateContent() {
      const gl = this._renderer.gl;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas
      );
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      this._silhouette.update(canvas);
      this.emitWasAltered();
    }
    resizeCanvas() {
      if (renderer.useHighQualityRender) {
        canvas.width = renderer.canvas.width;
        canvas.height = renderer.canvas.height;
      } else {
        canvas.width = this._nativeSize[0];
        canvas.height = this._nativeSize[1];
      }
      if (currentRenderTarget == canvasRenderTarget)
        currentRenderTarget.updateViewport();
      runtime.startHats(`${extensionId}_当画布尺寸改变时`);
      this.updateContent();
    }
    onNativeSizeChanged(event) {
      this._nativeSize = event.newSize;
      this._rotationCenter = [this._nativeSize[0] / 2, this._nativeSize[1] / 2];
      this.resizeCanvas();
    }
  }
  function addSimple3DLayer(publicApi) {
    // 注册新的可绘制分组 "simple3D"
    // 要理解此补丁的工作原理，首先需理解以下内容的关联关系：
    // renderer._groupOrdering => renderer._layerGroups => renderer._drawList => renderer._allDrawables
    let index = renderer._groupOrdering.indexOf("video");
    renderer._groupOrdering.splice(index + 1, 0, "simple3D");
    renderer._layerGroups["simple3D"] = {
      groupIndex: 0,
      drawListOffset: renderer._layerGroups["video"].drawListOffset,
    };
    for (let i = 0; i < renderer._groupOrdering.length; i++) {
      renderer._layerGroups[renderer._groupOrdering[i]].groupIndex = i;
    }
        // Create drawable and skin
    skinId = renderer._nextSkinId++;
    const skin = new SimpleSkin(skinId, renderer);
    renderer._allSkins[skinId] = skin;
    drawableId = renderer.createDrawable("simple3D");
    const drawable = renderer._allDrawables[drawableId];
    renderer.updateDrawableSkinId(drawableId, skinId);

    // Prevent pick() from trying to read all the pixels from the 3D skin as this drawable does not
    // correspond to a target, so it can't be dragged or anything like that. Fixes pick() doing an
    // unnecessary GPU -> CPU transfer (very slow) for a collision test whose result doesn't matter.
    if (renderer.markDrawableAsNoninteractive) {
      renderer.markDrawableAsNoninteractive(drawableId);
    }

    // Detect resizing
    drawable.setHighQuality = function (...args) {
      Object.getPrototypeOf(this).setHighQuality(...args);
      this.skin.resizeCanvas();
    };

    // Support for SharkPool's Layer Control extension
    drawable.customDrawableName = "Simple3D 图层";

    if (!publicApi.redraw) {
      const drawOriginal = renderer.draw;
      renderer.draw = function () {
        if (this.dirty && publicApi.redraw) publicApi.redraw();
        drawOriginal.call(this);
      };
    }

    publicApi.redraw = function () {
      if (canvasDirty) {
        skin.updateContent(canvas);
        canvasDirty = false;
      }
    };
    publicApi.redraw();
  }
  function removeSimple3DLayer() {
    renderer.destroyDrawable(drawableId, "simple3D");
    renderer.destroySkin(skinId);

    const index = renderer._groupOrdering.indexOf("simple3D");
    if (index == -1) return;
    const start = renderer._layerGroups["simple3D"].drawListOffset;
    const end =
      renderer._layerGroups[renderer._groupOrdering[index + 1]].drawListOffset;
    if (start !== end) return;
    renderer._groupOrdering.splice(index, 1);
    delete renderer._layerGroups["simple3D"];
    for (let i = 0; i < renderer._groupOrdering.length; i++) {
      renderer._layerGroups[renderer._groupOrdering[i]].groupIndex = i;
    }
    publicApi.redraw = null;
  }
  let vshSrc = `
#ifdef MSAA_CENTROID
#define INTERPOLATION centroid
#endif
#ifdef MSAA_SAMPLE
#extension GL_OES_shader_multisample_interpolation : require
#define INTERPOLATION sample
#endif
#ifndef INTERPOLATION
#define INTERPOLATION
#endif

precision highp float;

in vec4 a_position;
#ifdef COLORS
in vec4 a_color;
#endif
#ifdef TEXTURES
#if TEXTURES == 2
in vec2 a_uv;
#elif TEXTURES == 3
in vec3 a_uv;
#endif
#endif
#ifdef SKINNING
#if SKINNING == 1
in float a_index;
#elif SKINNING == 2
in vec2 a_index;
in vec2 a_weight;
#elif SKINNING == 3
in vec3 a_index;
in vec3 a_weight;
#elif SKINNING == 4
in vec4 a_index;
in vec4 a_weight;
#endif
#endif
#ifdef INSTANCE_POS
in vec3 a_instanceTransform;
#endif
#ifdef INSTANCE_POS_SCALE
in vec4 a_instanceTransform;
#endif
#ifdef INSTANCE_MATRIX
in mat4 a_instanceTransform;
#endif
#ifdef INSTANCE_COLOR
in vec4 a_instanceColor;
#endif
#ifdef INSTANCE_UV
in vec2 a_instanceUV;
#endif
#ifdef INSTANCE_UVS
in vec4 a_instanceUV;
#endif

INTERPOLATION out vec4 v_color;
#ifdef TEXTURES
#if TEXTURES == 2
INTERPOLATION out vec2 v_uv;
#elif TEXTURES == 3
INTERPOLATION out vec3 v_uv;
#endif
#endif
INTERPOLATION out vec3 v_viewpos;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
#ifdef BONE_COUNT
uniform mat4 u_bones[BONE_COUNT];
#endif
uniform vec2 u_uvOffset;
uniform vec3 u_fog_position;

void main() {
  vec4 pos = a_position;
#ifdef SKINNING
#if SKINNING == 1
  pos = u_bones[int(a_index)] * a_position;
#elif SKINNING == 2
  pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
        u_bones[int(a_index.y)] * a_position * a_weight.y;
#elif SKINNING == 3
  pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
        u_bones[int(a_index.y)] * a_position * a_weight.y +
        u_bones[int(a_index.z)] * a_position * a_weight.z;
#elif SKINNING == 4
  pos = u_bones[int(a_index.x)] * a_position * a_weight.x +
        u_bones[int(a_index.y)] * a_position * a_weight.y +
        u_bones[int(a_index.z)] * a_position * a_weight.z +
        u_bones[int(a_index.w)] * a_position * a_weight.w;
#endif
#endif
#ifdef FOG_IN_MODEL_SPACE
  v_viewpos = pos.xyz;
#endif
#ifdef INSTANCING
  pos = u_model * pos;
#endif
#ifdef INSTANCE_POS_SCALE
  pos.xyz *= a_instanceTransform.w;
#endif
#ifdef BILLBOARD
  vec4 pos2 = pos;
  pos = vec4(0,0,0,1);
#endif
#if defined(INSTANCE_POS) || defined(INSTANCE_POS_SCALE)
  pos.xyz += a_instanceTransform.xyz;
#endif
#ifdef INSTANCE_MATRIX
  pos = a_instanceTransform * pos;
#endif
#ifndef INSTANCING
  pos = u_model * pos;
#endif
  vec4 view = u_view * pos;
#ifdef BILLBOARD
#ifdef INSTANCE_MATRIX
  pos2 = a_instanceTransform * vec4(pos2.xyz, 0);
#endif
#ifndef INSTANCING
  pos2 = u_model * vec4(pos2.xyz, 0);
#endif
  view += pos2;
#ifdef FOG_IN_WORLD_SPACE
  v_viewpos = vec4(inverse(u_view) * view).xyz;
#endif
#else
#ifdef FOG_IN_WORLD_SPACE
  v_viewpos = pos.xyz;
#endif
#endif
#ifdef TEXTURES
#if TEXTURES == 2
  vec2 uv = a_uv;
#ifdef INSTANCE_UVS
  uv *= a_instanceUV.zw;
  uv += a_instanceUV.xy;
#endif
#ifdef INSTANCE_UV
  uv += a_instanceUV.xy;
#endif
#ifdef UV_OFFSET
  uv += u_uvOffset;
#endif
#elif TEXTURES == 3
  vec3 uv = a_uv;
#endif
#endif
  gl_Position = u_projection * view;
#ifdef COLORS
  vec4 color = a_color;
#else
  vec4 color = vec4(1);
#endif
#ifdef INSTANCE_COLOR
  color *= a_instanceColor;
#endif
  v_color = color;
#ifdef TEXTURES
  v_uv = uv;
#endif
#ifdef FOG_IN_VIEW_SPACE
  v_viewpos = view.xyz;
#endif
#ifdef FOG_POS
  v_viewpos -= u_fog_position;
#endif
}
`;
  let fshSrc = `
#ifdef MSAA_CENTROID
#define INTERPOLATION centroid
#endif
#ifdef MSAA_SAMPLE
#extension GL_OES_shader_multisample_interpolation : require
#define INTERPOLATION sample
#endif
#ifndef INTERPOLATION
#define INTERPOLATION
#endif

precision mediump float;

INTERPOLATION in vec4 v_color;
#ifdef TEXTURES
#if TEXTURES == 2
INTERPOLATION in vec2 v_uv;
#elif TEXTURES == 3
INTERPOLATION in vec3 v_uv;
#endif
#endif
INTERPOLATION in vec3 v_viewpos;

out vec4 outColor;

#ifdef TEXTURES
#if TEXTURES == 2
uniform sampler2D u_texture;
#elif TEXTURES == 3
uniform samplerCube u_texture;
#endif
#endif
uniform vec4 u_color_mul;
uniform vec4 u_color_add;
uniform vec3 u_fog_color;
uniform vec2 u_fog_dist;
uniform float u_alpha_threshold;

void main() {
#ifdef TEXTURES
  vec4 color = texture(u_texture, v_uv);
  color.rgb /= color.a;
#else
  vec4 color = vec4(1);
#endif
#if defined(COLORS) || defined(INSTANCE_COLOR)
  color = color * v_color;
#endif
#ifdef ALPHATEST
  if (color.a <= u_alpha_threshold) discard;
#endif
#ifdef MAKE_OPAQUE
  color.a = 1.0;
#endif
  color = color * u_color_mul + u_color_add;
#ifdef FOG
  float fog = (length(v_viewpos) - u_fog_dist.x) / u_fog_dist.y;
  color.rgb = mix(color.rgb, u_fog_color, clamp(fog, 0.0, 1.0));
#endif
  color.a = clamp(color.a, 0.0, 1.0);
  color.rgb *= color.a;
  outColor = color;
}
`;
  function compileProgram(flags) {
    console.log("Compiling program with flags:", flags);
    const defines =
      "#version 300 es\n" + flags.map((flag) => `#define ${flag}\n`).join("");
    const vsh = gl.createShader(gl.VERTEX_SHADER);
    const fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vsh, defines + vshSrc);
    gl.shaderSource(fsh, defines + fshSrc);
    gl.compileShader(vsh);
    gl.compileShader(fsh);
    const program = gl.createProgram();
    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.log("Shader error:");
      console.log(gl.getShaderInfoLog(vsh));
      console.log(gl.getShaderInfoLog(fsh));
      console.log(gl.getProgramInfoLog(program));
    }
    gl.deleteShader(vsh);
    gl.deleteShader(fsh);
    if (!success) {
      gl.deleteProgram(program);
      return {};
    }
    gl.useProgram(program);
    const aloc = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
      const info = gl.getActiveAttrib(program, i);
      aloc[info.name.split("[")[0]] = gl.getAttribLocation(program, info.name);
    }
    const uloc = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      uloc[info.name.split("[")[0]] = gl.getUniformLocation(program, info.name);
    }
    return { program, aloc, uloc };
  }
  class ProgramManager {
    constructor() {
      this.programs = {};
    }
    get(flags) {
      const key = flags.join("-");
      let program = this.programs[key];
      if (program) return program;
      program = compileProgram(flags);
      this.programs[key] = program;
      return program;
    }
    clear() {
      for (const key in this.programs) {
        if (this.programs[key].program) {
          gl.deleteProgram(this.programs[key].program);
        }
      }
      this.programs = {};
    }
  }
  function getDefaultTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // eslint-disable-next-line extension/check-can-fetch
    const image = new Image();
    image.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TpUUqDnYQcchQneyiIo61FYpQIdQKrTqYvPQPmjQkKS6OgmvBwZ/FqoOLs64OroIg+APi7OCk6CIl3pcUWsT44PI+znvncN99gNCqMc3qSwCabpvZdFLMF1bF0CsEhAGqmMwsY16SMvBdX/cI8P0uzrP87/25BtWixYCASJxghmkTbxDPbtoG533iKKvIKvE58aRJDRI/cl3x+I1z2WWBZ0bNXDZFHCUWyz2s9DCrmBrxDHFM1XTKF/Ieq5y3OGu1Buv0yV8YKeory1ynGkMai1iCBBEKGqiiBhtx2nVSLGTpPOnjH3X9ErkUclXByLGAOjTIrh/8D37P1ipNT3lJkSTQ/+I4H+NAaBdoNx3n+9hx2idA8Bm40rv+eguY+yS92dViR8DQNnBx3dWUPeByBxh5MmRTdqUglVAqAe9n9E0FYPgWGFjz5tY5x+kDkKNZZW6Ag0NgokzZ6z7vDvfO7d87nfn9ACRZcoedT/mXAAAAGFBMVEVtbW11dXVtbf+EhIT/bW2goKBt/21t//8Qh6V7AAAACXBIWXMAABhMAAAYdAGfqEAgAAAAB3RJTUUH6AIIAA4YBFj9GAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABjSURBVAjXPctBDkAwFIThqdey91ygnIAoa9EzcIBGLyDS69MW/26+ZIAvZYwhZkbpNy/saKGOyUjmFeQ2J5Z+SUJNFi+TfK+/uKJCtENbhT2gYO7UNT+ie03nfoLqV4os4X/dFf0TKILDS0AAAAAASUVORK5CYII=";
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
    };
    return texture;
  }
  // requireNonPackagedRuntime by LilyMakesThings
  function requireNonPackagedRuntime(blockName) {
    if (runtime.isPackaged) {
      alert(
        `要使用Simple3D的${blockName}积木，打包项目的创作者必须在打包器的高级设置中取消勾选"加载后移除原始资源数据以节省内存"。`
      );
      return false;
    }
    return true;
  }
  /*
   * Profiler has shown that this was the main bottleneck, so:
   * - loops were unrolled
   * - Cast.toNumber was replaced with unary plus
   */
  function compact(target, names, typedArray, scale = 1) {
    const lists = names.map((name) =>
      target.lookupVariableByNameAndType(name, "list")
    );
    if (lists.includes(null)) return null;
    const targetLength = lists[0].value.length;
    const listCount = lists.length;
    if (lists.find((list) => list.value.length !== targetLength)) return null;
    const value = new typedArray(targetLength * listCount);
    if (scale !== 1) {
      if (listCount == 1) {
        const list0 = lists[0].value;
        for (let i = 0; i < targetLength; i++) {
          value[i] = list0[i] * scale;
        }
      } else if (listCount == 2) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 2) {
          value[j] = list0[i] * scale;
          value[j + 1] = list1[i] * scale;
        }
      } else if (listCount == 3) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        const list2 = lists[2].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 3) {
          value[j] = list0[i] * scale;
          value[j + 1] = list1[i] * scale;
          value[j + 2] = list2[i] * scale;
        }
      } else if (listCount == 4) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        const list2 = lists[2].value;
        const list3 = lists[3].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 4) {
          value[j] = list0[i] * scale;
          value[j + 1] = list1[i] * scale;
          value[j + 2] = list2[i] * scale;
          value[j + 3] = list3[i] * scale;
        }
      } else {
        // Unused
        for (let i = 0, j = 0; i < targetLength; i++) {
          for (let k = 0; k < listCount; k++) {
            value[j++] = lists[k].value[i] * scale;
          }
        }
      }
    } else {
      if (listCount == 1) {
        const list0 = lists[0].value;
        for (let i = 0; i < targetLength; i++) {
          value[i] = +list0[i];
        }
      } else if (listCount == 2) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 2) {
          value[j] = +list0[i];
          value[j + 1] = +list1[i];
        }
      } else if (listCount == 3) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        const list2 = lists[2].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 3) {
          value[j] = +list0[i];
          value[j + 1] = +list1[i];
          value[j + 2] = +list2[i];
        }
      } else if (listCount == 4) {
        const list0 = lists[0].value;
        const list1 = lists[1].value;
        const list2 = lists[2].value;
        const list3 = lists[3].value;
        for (let i = 0, j = 0; i < targetLength; i++, j += 4) {
          value[j] = +list0[i];
          value[j + 1] = +list1[i];
          value[j + 2] = +list2[i];
          value[j + 3] = +list3[i];
        }
      } else {
        // Unused
        for (let i = 0, j = 0; i < targetLength; i++) {
          for (let k = 0; k < listCount; k++) {
            value[j++] = +lists[k].value[i];
          }
        }
      }
    }
    return value;
  }
  function compactIndices(target, name) {
    const list = target.lookupVariableByNameAndType(name, "list");
    if (!list) return null;
    let maxNum = 0;
    let value = [];
    let restarts = [];
    for (let i = 0; i < list.value.length; i++) {
      let num = Math.floor(Cast.toNumber(list.value[i]) - 1);
      if (num < 0) {
        restarts.push(i);
      } else if (num > maxNum) {
        maxNum = num;
      }
      value.push(num);
    }
    let restartIndex, typedArray;
    if (maxNum > 4294967294) {
      alert(
        `Simple3D错误：发现顶点索引${maxNum}。支持的最大值为4294967295。`
      );
    }
    if (maxNum > 65534) {
      typedArray = Uint32Array;
      restartIndex = 4294967295;
    } else if (maxNum > 254) {
      typedArray = Uint16Array;
      restartIndex = 65535;
    } else {
      typedArray = Uint8Array;
      restartIndex = 255;
    }
    for (let i of restarts) {
      value[i] = restartIndex;
    }
    return new typedArray(value);
  }
  function uploadBuffer(
    mesh,
    name,
    value,
    size,
    type,
    target = gl.ARRAY_BUFFER
  ) {
    if (!mesh || !value) return;
    if (value.length % size !== 0) return;
    if (mesh.uploadOffset < 0) {
      const buffer =
        mesh.myBuffers[name] ?? (mesh.myBuffers[name] = new Buffer(type));
      gl.bindBuffer(target, buffer.buffer);
      gl.bufferData(target, value, mesh.uploadUsage);
      buffer.size = size;
      buffer.length = value.length / size;
      buffer.bytesPerEl = value.BYTES_PER_ELEMENT;
      mesh.update();
    } else {
      const buffer = mesh.myBuffers[name];
      if (
        !buffer ||
        buffer.size !== size ||
        mesh.uploadOffset * size + value.length > buffer.length * size
      )
        return;
      gl.bindBuffer(target, buffer.buffer);
      gl.bufferSubData(
        target,
        mesh.uploadOffset * size * value.BYTES_PER_ELEMENT,
        value
      );
    }
  }
  function chunkArray(array, size) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
  }

  if (!Scratch.extensions.unsandboxed)
    throw new Error("Simple 3D拓展必须在非沙箱模式下运行");

  const ArgumentType = Scratch.ArgumentType;
  const BlockType = Scratch.BlockType;
  const Cast = Scratch.Cast;
  const vm = Scratch.vm;
  const renderer = vm.renderer;
  const runtime = vm.runtime;

  const extensionId = "xeltallivSimple3D";
  let canvasDirty = true;
  let canvas = document.createElement("canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl)
    alert(
      "Simple 3D拓展获取WebGL2上下文失败。如果之前能正常工作，请尝试重启浏览器或设备。如果仍不行，你的GPU可能不支持WebGL2"
    );
  const ext_af =
    gl.getExtension("EXT_texture_filter_anisotropic") ||
    gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
    gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
  const ext_smi = gl.getExtension("OES_shader_multisample_interpolation");
  gl.enable(gl.DEPTH_TEST);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  // prettier-ignore
  const Blendings = {
    "覆盖颜色（不透明时最快）": [false],
    "默认": [true, gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.FUNC_ADD],
    "默认（后置）": [true, gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.FUNC_ADD],
    "加法混合": [true, gl.ONE, gl.ONE, gl.ZERO, gl.ONE, gl.FUNC_ADD],
    "减法混合": [true, gl.ONE, gl.ONE, gl.ZERO, gl.ONE, gl.FUNC_REVERSE_SUBTRACT],
    "乘法混合": [true, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.FUNC_ADD],
    "反相": [true, gl.ONE_MINUS_DST_COLOR, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE, gl.FUNC_ADD],
    "不可见": [true, gl.ZERO, gl.ONE, gl.ZERO, gl.ONE, gl.FUNC_ADD],
    "蒙版": [true, gl.ZERO, gl.SRC_ALPHA, gl.ZERO, gl.SRC_ALPHA, gl.FUNC_ADD],
    "擦除": [true, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.FUNC_ADD],
  };
  // prettier-ignore
  const Cullings = {
    "无": [false],
    "背面": [true, gl.BACK],
    "正面": [true, gl.FRONT],
  };
  // prettier-ignore
  const DepthTests = {
    "无": gl.NEVER,
    "更近": gl.LESS,
    "相同": gl.EQUAL,
    "更远": gl.GREATER,
    "更近或相同": gl.LEQUAL,
    "更远或相同": gl.GEQUAL,
    "不相同": gl.NOTEQUAL,
    "全部": gl.ALWAYS,
  };
  // prettier-ignore
  const Primitives = {
    "点": gl.POINTS,
    "线": gl.LINES,
    "线环": gl.LINE_LOOP,
    "线条带": gl.LINE_STRIP,
    "三角形": gl.TRIANGLES,
    "三角形带": gl.TRIANGLE_STRIP,
    "三角形扇": gl.TRIANGLE_FAN,
  };
  // prettier-ignore
  const ClearLayers = {
    "颜色": gl.COLOR_BUFFER_BIT,
    "深度": gl.DEPTH_BUFFER_BIT,
    "颜色和深度": gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
  };
  const texture = getDefaultTexture();
  const meshes = new Map();
  const programs = new ProgramManager();
  const modelDecoder = new ModelDecoder();
  const publicApi =
    runtime.ext_xeltallivSimple3Dapi ?? (runtime.ext_xeltallivSimple3Dapi = {});
  const externalTransforms =
    publicApi.externalTransforms ?? (publicApi.externalTransforms = {});
  const canvasRenderTarget = new CanvasRenderTarget();

  let drawableId = null;
  let skinId = null;

  let currentRenderTarget;
  let transforms;
  let transformed;
  let selectedTransform;
  let colorMultiplier;
  let colorAdder;
  let fogColor;
  let fogDistance;
  let fogEnabled;
  let fogPosition;
  let fogSpace;
  let imageSource;
  let imageSourceSync;
  let currentBlending;
  let currentBlendingProps;
  let currentCulling;
  let currentCullingProps;
  let lastTextMeasurement;
  let transformCache;

  function resetEverything() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    canvasRenderTarget.reset();
    canvasRenderTarget.setAsRenderTarget();
    transforms = {
      modelToWorld: m4.identity(),
      worldToView: m4.identity(),
      viewToProjected: m4.identity(),
      import: m4.identity(),
      custom: m4.identity(),
    };
    transformed = [0, 0, 0, 0];
    selectedTransform = "viewToProjected";
    colorMultiplier = [1, 1, 1, 1];
    colorAdder = [0, 0, 0, 0];
    fogColor = [1, 1, 1];
    fogDistance = [10, 90];
    fogEnabled = false;
    fogPosition = null;
    fogSpace = "view space";
    imageSource = null;
    imageSourceSync = null;
    currentBlending = "未设置";
    currentBlendingProps = [null, null, null, null, null, null];
    currentCulling = 0;
    currentCullingProps = [null, null];
    lastTextMeasurement = null;
    transformCache = {
      from: m4.identity(),
      to: m4.identity(),
      matrix: m4.identity(),
    };
    for (const mesh of meshes.values()) {
      mesh.destroy();
    }
    meshes.clear();
    programs.clear();
    modelDecoder.clear();
    canvasDirty = true;
    renderer.dirty = true;
    runtime.requestRedraw();
  }
  resetEverything();
  addSimple3DLayer(publicApi);
  runtime.on("PROJECT_LOADED", resetEverything);

  const definitions = [
    {
      blockType: BlockType.BUTTON,
      text: "打开额外资源",
      func: "openSite",
      def: function () {
        // Exempted from Scratch.openWindow as initiated by user gesture.
        // docsURI won't ask for permission so it doesn't make sense for this to either.
        // eslint-disable-next-line extension/use-scratch-open-window
        window.open("https://xeltalliv.github.io/simple3d-extension/");
      },
    },
    {
      blockType: BlockType.BUTTON,
      text: "打开示例项目",
      func: "getSampleProject",
      def: function () {
        const url = new URL(location.href);
        url.searchParams.set(
          "project_url",
          "https://extensions.turbowarp.org/samples/Simple3D%20template.sb3"
        );
        // Exempted from Scratch.openWindow as it is in response to a user gesture and it does not
        // bring in third-party websites at all.
        // eslint-disable-next-line extension/use-scratch-open-window
        window.open(url.href);
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "清除相关",
    },
    {
      opcode: "resetEverything",
      blockType: BlockType.COMMAND,
      text: "重置所有内容",
      def: function () {
        resetEverything();
      },
    },
    "---",
    {
      opcode: "clear",
      blockType: BlockType.COMMAND,
      text: "清除 [LAYERS]",
      arguments: {
        LAYERS: {
          type: ArgumentType.STRING,
          menu: "clearLayers",
          defaultValue: "颜色和深度",
        },
      },
      def: function ({ LAYERS }) {
        if (!hasOwn(ClearLayers, LAYERS)) return;
        if (gl.getParameter(gl.DEPTH_WRITEMASK)) {
          gl.clear(ClearLayers[LAYERS]);
        } else {
          gl.depthMask(true);
          gl.clear(ClearLayers[LAYERS]);
          gl.depthMask(false);
        }
        if (currentRenderTarget === canvasRenderTarget) {
          canvasDirty = true; // Telling extension to update texture
          renderer.dirty = true; // Telling renderer to redraw the screen
          runtime.requestRedraw(); // Telling sequencer to yield in loops
        }
      },
    },
    {
      opcode: "clearColor",
      blockType: BlockType.COMMAND,
      text: "设置清除颜色 红: [RED] 绿: [GREEN] 蓝: [BLUE] 透明度: [ALPHA]",
      arguments: {
        RED: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.5,
        },
        GREEN: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.5,
        },
        BLUE: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.5,
        },
        ALPHA: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ RED, GREEN, BLUE, ALPHA }) {
        const alpha = Cast.toNumber(ALPHA);
        gl.clearColor(
          Cast.toNumber(RED) * alpha,
          Cast.toNumber(GREEN) * alpha,
          Cast.toNumber(BLUE) * alpha,
          alpha
        );
      },
    },
    {
      opcode: "depth",
      blockType: BlockType.COMMAND,
      text: "深度测试 [TEST] 写入 [WRITE]",
      arguments: {
        TEST: {
          type: ArgumentType.STRING,
          defaultValue: "更近",
          menu: "depthTest",
        },
        WRITE: {
          type: ArgumentType.STRING,
          defaultValue: "开启",
          menu: "onOff",
        },
      },
      def: function ({ TEST, WRITE }) {
        let test = Cast.toString(TEST);
        if (!hasOwn(DepthTests, test)) return;
        currentRenderTarget.setDepth(test, Cast.toBoolean(WRITE === "开启"));
        currentRenderTarget.updateDepth();
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "网格相关",
    },
    {
      opcode: "allMeshes",
      blockType: BlockType.REPORTER,
      text: "所有网格",
      disableMonitor: true,
      def: function () {
        return Array.from(meshes.keys()).join(",");
      },
    },
    {
      opcode: "createMesh",
      blockType: BlockType.COMMAND,
      text: "创建网格 [NAME]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ NAME }) {
        NAME = Cast.toString(NAME).replace(/,/g, "").trim();
        if (NAME.length == 0) return;
        meshes.get(NAME)?.destroy();
        meshes.set(NAME, new Mesh(NAME));
      },
    },
    {
      opcode: "deleteMesh",
      blockType: BlockType.COMMAND,
      text: "删除网格 [NAME]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ NAME }) {
        NAME = Cast.toString(NAME);
        meshes.get(NAME)?.destroy();
        meshes.delete(NAME);
      },
    },
    {
      opcode: "inheritMeshes",
      blockType: BlockType.COMMAND,
      text: "让 [NAME] 继承自网格 [NAMES]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格 3",
        },
        NAMES: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格 1,我的网格 2",
        },
      },
      def: function ({ NAME, NAMES }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        const parentMeshes = Cast.toString(NAMES)
          .split(",")
          .map((s) => meshes.get(s.trim()))
          .filter((m) => m);
        for (let otherMesh of parentMeshes) {
          if (otherMesh.dependsOn(mesh)) return;
        }
        for (let otherMesh of mesh.dependencies) {
          otherMesh.dependants.delete(mesh);
        }
        mesh.dependencies = new Set(parentMeshes);
        for (let otherMesh of parentMeshes) {
          otherMesh.dependants.add(mesh);
        }
        mesh.update();
      },
    },
    {
      opcode: "meshInfo",
      blockType: BlockType.REPORTER,
      text: "网格 [NAME] 的 [PROP] 属性",
      allowDropAnywhere: true,
      arguments: {
        PROP: {
          type: ArgumentType.STRING,
          menu: "meshProperties",
          defaultValue: "继承自",
        },
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ NAME, PROP }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (PROP == "exists") return !!mesh;
        if (!mesh || !hasOwn(MeshPropFns, PROP)) return "";
        return MeshPropFns[PROP](mesh) ?? "";
      },
    },
    "---",
    {
      opcode: "setMeshIndices",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的顶点索引为 [INDICES]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        INDICES: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, INDICES }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compactIndices(target, INDICES);
        if (!mesh || !value) return;
        uploadBuffer(mesh, "indices", value, 1, -1, gl.ELEMENT_ARRAY_BUFFER);
      },
    },
    {
      opcode: "setMeshPositionsXY",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的位置 XY 为 [X] [Y]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        X: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        Y: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        Z: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, X, Y }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [X, Y], Float32Array);
        uploadBuffer(mesh, "position", value, 2, 0);
      },
    },
    {
      opcode: "setMeshPositionsXYZ",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的位置 XYZ 为 [X] [Y] [Z]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        X: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        Y: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        Z: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, X, Y, Z }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [X, Y, Z], Float32Array);
        uploadBuffer(mesh, "position", value, 3, 0);
      },
    },
    {
      opcode: "setMeshColorsRGB",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的颜色 RGB 为 [R] [G] [B]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        R: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        G: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        B: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, R, G, B }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [R, G, B], Uint8Array);
        uploadBuffer(mesh, "colors", value, 3, 0);
      },
    },
    {
      opcode: "setMeshColorsRGBA",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的颜色 RGBA 为 [R] [G] [B] [A]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        R: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        G: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        B: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        A: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, R, G, B, A }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [R, G, B, A], Uint8Array);
        uploadBuffer(mesh, "colors", value, 4, 0);
      },
    },
    {
      opcode: "setMeshTexCoordUV",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的纹理坐标 UV 为 [U] [V]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        U: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        V: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, U, V }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [U, V], Float32Array);
        if (!mesh || !value) return;
        uploadBuffer(mesh, "texCoords", value, 2, 0);
      },
    },
    {
      opcode: "setMeshTexture",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的纹理为 [TEXTURE]，环绕方式 [WRAP]，过滤方式 [FILTER]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        TEXTURE: {
          type: null,
        },
        WRAP: {
          type: ArgumentType.STRING,
          menu: "textureWrap",
        },
        FILTER: {
          type: ArgumentType.STRING,
          menu: "textureFilter",
        },
      },
      def: function ({ NAME, TEXTURE, WRAP, FILTER }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        const texture = Cast.toString(TEXTURE);
        if (texture !== "[texture data]") return;
        const wrap =
          Cast.toString(WRAP) == "repeat" ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        const filter =
          Cast.toString(FILTER) == "blurred" ? gl.LINEAR : gl.NEAREST;
        let textureObj =
          mesh.myData.texture ?? (mesh.myData.texture = new Texture2D(mesh));
        if (!(textureObj instanceof Texture2D)) return;
        textureObj.main.loading = true;
        textureObj.main.failedToLoad = false;
        mesh.update();
        const onData = function (data) {
          if (data == null || mesh.destroyed) {
            textureObj.main.loading = false;
            textureObj.main.failedToLoad = true;
            return;
          }
          textureObj.main.setTexture(
            data.data,
            data.width,
            data.height,
            wrap,
            filter
          );
        };
        if (imageSourceSync) {
          onData(imageSourceSync);
        } else {
          imageSource.then(onData);
        }
      },
    },
    {
      opcode: "setMeshTexCoordUVW",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的立方体贴图纹理坐标 UVW 为 [U] [V] [W]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        U: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        V: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        W: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, U, V, W }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [U, V, W], Float32Array);
        uploadBuffer(mesh, "texCoords", value, 3, 0);
      },
    },
    {
      opcode: "setMeshCubeTexture",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的立方体贴图 [SIDE] 面纹理为 [TEXTURE]，环绕方式 [WRAP]，过滤方式 [FILTER]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        SIDE: {
          type: ArgumentType.STRING,
          menu: "cubeSide",
        },
        TEXTURE: {
          type: null,
        },
        WRAP: {
          type: ArgumentType.STRING,
          menu: "textureWrap",
        },
        FILTER: {
          type: ArgumentType.STRING,
          menu: "textureFilter",
        },
      },
      def: function ({ NAME, SIDE, TEXTURE, WRAP, FILTER }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        const texture = Cast.toString(TEXTURE);
        if (texture !== "[texture data]") return;
        const wrap =
          Cast.toString(WRAP) == "repeat" ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        const filter =
          Cast.toString(FILTER) == "blurred" ? gl.LINEAR : gl.NEAREST;
        let textureObj =
          mesh.myData.texture ?? (mesh.myData.texture = new TextureCube(mesh));
        if (!(textureObj instanceof TextureCube)) return;
        const lookup = {
          "X+": "xpos",
          "X-": "xneg",
          "Y+": "ypos",
          "Y-": "yneg",
          "Z+": "zpos",
          "Z-": "zneg",
        };
        if (!hasOwn(lookup, SIDE)) return;
        textureObj[lookup[SIDE]].loading = true;
        textureObj[lookup[SIDE]].failedToLoad = false;
        mesh.update();
        const onData = function (data) {
          if (data == null || mesh.destroyed) {
            textureObj[lookup[SIDE]].loading = false;
            textureObj[lookup[SIDE]].failedToLoad = true;
            return;
          }
          textureObj[lookup[SIDE]].setTexture(
            data.data,
            data.width,
            data.height,
            wrap,
            filter
          );
        };
        if (imageSourceSync) {
          onData(imageSourceSync);
        } else {
          imageSource.then(onData);
        }
      },
    },
    {
      opcode: "setMeshTextureMipmap",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的纹理多级渐远纹理（Mipmap）为 [MIPMAPPING]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        MIPMAPPING: {
          type: ArgumentType.STRING,
          menu: "textureMipmapping",
        },
      },
      def: function ({ NAME, MIPMAPPING }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        const textureObj = mesh.myData.texture;
        if (!textureObj) return;
        if (MIPMAPPING == "off") textureObj.setMipmapState(false, gl.NEAREST);
        if (MIPMAPPING == "sharp transitions")
          textureObj.setMipmapState(true, gl.NEAREST);
        if (MIPMAPPING == "smooth transitions")
          textureObj.setMipmapState(true, gl.LINEAR);
      },
    },
    {
      opcode: "setMeshTextureAnisotropy",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的纹理各向异性过滤为 [ANISOTROPY]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        ANISOTROPY: {
          type: ArgumentType.STRING,
          menu: "powersOfTwo",
          defaultValue: 16,
        },
      },
      def: function ({ NAME, ANISOTROPY }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        const textureObj = mesh.myData.texture;
        if (!textureObj) return;
        textureObj.setAnisotropy(
          Math.max(1, Math.round(Cast.toNumber(ANISOTROPY)))
        );
      },
    },
    {
      opcode: "setMeshWeights",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的骨骼索引为 [INDICES]，权重为 [WEIGHTS]，每个顶点的数量为 [COUNT]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        INDICES: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        WEIGHTS: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        COUNT: {
          type: ArgumentType.NUMBER,
          defaultValue: 3,
        },
      },
      def: function ({ NAME, INDICES, WEIGHTS, COUNT }, { target }) {
        COUNT = Math.floor(Cast.toNumber(COUNT));
        if (COUNT < 1 || COUNT > 4) return;
        const mesh = meshes.get(Cast.toString(NAME));
        let valueI = compact(target, [INDICES], Uint8Array),
          valueW;
        if (!mesh || !valueI || valueI.length % COUNT > 0) return;
        if (COUNT > 1) {
          valueW = compact(target, [WEIGHTS], Uint16Array, 65535);
          if (
            !valueW ||
            valueW.length % COUNT > 0 ||
            valueW.length !== valueI.length
          )
            return;
        }
        uploadBuffer(mesh, "boneIndices", valueI, COUNT, 0);
        if (COUNT > 1) {
          uploadBuffer(mesh, "boneWeights", valueW, COUNT, 0);
        }
      },
    },
    {
      opcode: "setMeshTransforms",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的 [TRANSFORMS] 变换矩阵为 [MATRIXES]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        TRANSFORMS: {
          type: ArgumentType.STRING,
          menu: "skinningTransforms",
        },
        MATRIXES: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, TRANSFORMS, MATRIXES }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const myData = mesh.myData;
        const list = target.lookupVariableByNameAndType(
          Cast.toString(MATRIXES),
          "list"
        );
        if (!mesh || !list) return;
        const value = list.value.map(Cast.toNumber);

        if (TRANSFORMS == "original") {
          myData.bonesOrig = chunkArray(value, 16).map(m4.inverse);
          if (!myData.bonesCurr) {
            if (myData.bonesCurrRaw) {
              myData.bonesCurr = chunkArray(myData.bonesCurrRaw, 16);
              myData.bonesCurrRaw = null;
            } else {
              myData.bonesCurr = chunkArray(value, 16);
            }
          }
        }
        if (TRANSFORMS == "current") {
          if (myData.bonesOrig) {
            myData.bonesCurr = chunkArray(value, 16);
            myData.bonesCurrRaw = null;
          } else {
            myData.bonesCurrRaw = value;
          }
        }
        if (myData.bonesOrig) {
          const diff = [];
          const end = Math.min(
            myData.bonesCurr.length,
            myData.bonesOrig.length
          );
          let i = 0;
          for (; i < end; i++) {
            diff.push(m4.multiply(myData.bonesCurr[i], myData.bonesOrig[i]));
          }
          for (; i < myData.bonesCurr.length; i++) {
            diff.push(myData.bonesCurr[i]);
          }
          myData.bonesDiff = diff.flat();
        } else {
          myData.bonesDiff = myData.bonesCurrRaw;
        }
        mesh.update();
      },
    },
    {
      opcode: "setMeshInterleaved",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的交错数据 [PROPERTY] 为 [SRCLIST]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        PROPERTY: {
          type: ArgumentType.STRING,
          menu: "interleavedProperty",
        },
        SRCLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, PROPERTY, SRCLIST }, { target }) {
        let bufferName, size, type;
        if (PROPERTY == "XY positions") {
          bufferName = "position";
          size = 2;
          type = Float32Array;
        }
        if (PROPERTY == "XYZ positions") {
          bufferName = "position";
          size = 3;
          type = Float32Array;
        }
        if (PROPERTY == "RGB colors") {
          bufferName = "colors";
          size = 3;
          type = Uint8Array;
        }
        if (PROPERTY == "RGBA colors") {
          bufferName = "colors";
          size = 4;
          type = Uint8Array;
        }
        if (PROPERTY == "UV texture coordinates") {
          bufferName = "texCoords";
          size = 2;
          type = Float32Array;
        }
        if (PROPERTY == "UVW texture coordinates") {
          bufferName = "texCoords";
          size = 3;
          type = Float32Array;
        }
        if (!bufferName) return;
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [SRCLIST], type);
        uploadBuffer(mesh, bufferName, value, size, 0);
      },
    },
    {
      opcode: "setMeshInstances",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的实例化属性 [PROPERTY] 为 [SRCLIST]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        PROPERTY: {
          type: ArgumentType.STRING,
          menu: "instanceProperty",
        },
        SRCLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, PROPERTY, SRCLIST }, { target }) {
        let bufferName, size, type;
        if (PROPERTY == "transforms") {
          bufferName = "instanceTransforms";
          size = 16;
          type = Float32Array;
        }
        if (PROPERTY == "XY positions") {
          bufferName = "instanceTransforms";
          size = 2;
          type = Float32Array;
        }
        if (PROPERTY == "XYZ positions") {
          bufferName = "instanceTransforms";
          size = 3;
          type = Float32Array;
        }
        if (PROPERTY == "XYZ positions and sizes") {
          bufferName = "instanceTransforms";
          size = 4;
          type = Float32Array;
        }
        if (PROPERTY == "RGB colors") {
          bufferName = "instanceColors";
          size = 3;
          type = Float32Array;
        }
        if (PROPERTY == "RGBA colors") {
          bufferName = "instanceColors";
          size = 4;
          type = Float32Array;
        }
        if (PROPERTY == "UV offsets") {
          bufferName = "instanceUVOffsets";
          size = 2;
          type = Float32Array;
        }
        if (PROPERTY == "UV offsets and sizes") {
          bufferName = "instanceUVOffsets";
          size = 4;
          type = Float32Array;
        }
        if (!bufferName) return;
        const mesh = meshes.get(Cast.toString(NAME));
        const value = compact(target, [SRCLIST], type);
        uploadBuffer(mesh, bufferName, value, size, 1);
      },
    },
    {
      opcode: "setMeshUploadOffset",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的列表更新偏移量为 [OFFSET]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        OFFSET: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ NAME, OFFSET }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        mesh.uploadOffset = Cast.toNumber(OFFSET) - 1;
      },
    },
    {
      opcode: "setBufferUsageHint",
      text: "设置 [NAME] 优化下次上传的列表，适配 [USAGE] 更新频率",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        USAGE: {
          type: ArgumentType.STRING,
          menu: "bufferUsage",
          defaultValue: "很少",
        },
      },
      def: function ({ NAME, USAGE }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        if (USAGE == "rarely") mesh.uploadUsage = gl.STATIC_DRAW;
        if (USAGE == "frequently fully") mesh.uploadUsage = gl.STREAM_DRAW;
        if (USAGE == "frequently partially") mesh.uploadUsage = gl.DYNAMIC_DRAW;
      },
    },
    {
      opcode: "setMeshFromFile",
      blockType: BlockType.COMMAND,
      text: "从 [FILETYPE] 格式的 [SRCLIST] 列表设置 [NAME]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        FILETYPE: {
          type: ArgumentType.STRING,
          menu: "filetype",
        },
        SRCLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ NAME, FILETYPE, SRCLIST }, { target }) {
        (async function () {
          const mesh = meshes.get(Cast.toString(NAME));
          const list = target.lookupVariableByNameAndType(SRCLIST, "list");
          if (!mesh || !list) return;
          let output = await modelDecoder.decode(
            FILETYPE,
            list.value.slice(),
            transforms.import
          );
          if (!output) return;
          if (output.xyz) {
            const value = new Float32Array(output.xyz);
            uploadBuffer(mesh, "position", value, 3, 0);
          }
          if (output.rgba) {
            const value = new Uint8Array(output.rgba);
            uploadBuffer(mesh, "colors", value, 4, 0);
          }
          if (output.uv) {
            const value = new Float32Array(output.uv);
            uploadBuffer(mesh, "texCoords", value, 2, 0);
          }
        })();
      },
    },
    {
      opcode: "setMeshPrimitives",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的图元类型为 [PRIMITIVES]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        PRIMITIVES: {
          type: ArgumentType.STRING,
          menu: "primitives",
        },
      },
      def: function ({ NAME, PRIMITIVES }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const primitivesName = Cast.toString(PRIMITIVES);
        if (!mesh) return;
        if (!hasOwn(Primitives, primitivesName)) return;
        mesh.myData.primitives = Primitives[primitivesName];
        mesh.myData.primitivesName = primitivesName;
        mesh.update();
      },
    },
    {
      opcode: "setMeshBlending",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的混合模式为 [BLENDING]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        BLENDING: {
          type: ArgumentType.STRING,
          menu: "blending",
          defaultValue: "默认",
        },
      },
      def: function ({ NAME, BLENDING }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const blending = Cast.toString(BLENDING);
        if (!mesh) return;
        if (!hasOwn(Blendings, blending)) return;
        mesh.myData.blending = blending;
        mesh.update();
      },
    },
    {
      opcode: "setMeshCulling",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的剔除模式为 [CULLING]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        CULLING: {
          type: ArgumentType.STRING,
          menu: "culling",
        },
      },
      def: function ({ NAME, CULLING }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const culling = Cast.toString(CULLING);
        if (!mesh) return;
        if (!hasOwn(Cullings, culling)) return;
        mesh.myData.culling = culling;
        mesh.update();
      },
    },
    {
      opcode: "setMeshAlphaTest",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 剔除不透明度低于 [ALPHATEST] 的像素，对于通过的像素 [MAKEOPAQUE]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        ALPHATEST: {
          type: ArgumentType.STRING,
          defaultValue: 0.5,
        },
        MAKEOPAQUE: {
          type: ArgumentType.STRING,
          menu: "alphaTestMode",
          defaultValue: "设为不透明",
        },
      },
      def: function ({ NAME, ALPHATEST, MAKEOPAQUE }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const alphaTest = Cast.toNumber(ALPHATEST);
        const makeOpaque = Cast.toBoolean(MAKEOPAQUE);
        if (!mesh) return;
        mesh.myData.alphaTest = alphaTest;
        mesh.myData.makeOpaque = makeOpaque;
        mesh.update();
      },
    },
    {
      opcode: "setMeshBillboarding",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的公告板效果为 [BILLBOARDING]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        BILLBOARDING: {
          type: ArgumentType.STRING,
          menu: "onOff",
        },
      },
      def: function ({ NAME, BILLBOARDING }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const billboarding = Cast.toBoolean(BILLBOARDING);
        if (!mesh) return;
        mesh.myData.billboarding = billboarding;
        mesh.update();
      },
    },
    {
      opcode: "setMeshCentroidInterpolation",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 使用精确插值 [USECENTROID]",
      hideFromPalette: true,
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        USECENTROID: {
          type: ArgumentType.STRING,
          menu: "onOff",
        },
      },
      def: function ({ NAME, USECENTROID }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const useCentroid = Cast.toBoolean(USECENTROID);
        if (!mesh) return;
        mesh.myData.interpolation = useCentroid ? "MSAA_CENTROID" : "";
        mesh.update();
      },
    },
    {
      opcode: "setMeshMultiSampleInterpolation",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的颜色计算模式为 [MODE]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        MODE: {
          type: ArgumentType.STRING,
          menu: "multiSampleInterpolation",
        },
      },
      def: function ({ NAME, MODE }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        if (MODE === "once at pixel center") mesh.myData.interpolation = "";
        if (MODE === "once at midpoint of covered samples")
          mesh.myData.interpolation = "MSAA_CENTROID";
        if (MODE === "separately for each sample" && ext_smi)
          mesh.myData.interpolation = "MSAA_SAMPLE";
        mesh.update();
      },
    },
    {
      opcode: "setMeshDrawRange",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的顶点绘制范围从 [START] 到 [END]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        START: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        END: {
          type: ArgumentType.NUMBER,
          defaultValue: 6,
        },
      },
      def: function ({ NAME, START, END }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        const start = Math.max(1, Math.floor(Cast.toNumber(START))) - 1;
        const end = Math.max(0, Math.floor(Cast.toNumber(END)));
        if (!mesh) return;
        mesh.myData.drawRange = [start, Math.max(0, end - start)];
        mesh.update();
      },
    },
    {
      opcode: "setMeshInstanceLimit",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的实例绘制上限为 [END]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        END: {
          type: ArgumentType.NUMBER,
          defaultValue: 10,
        },
      },
      def: function ({ NAME, END }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        let end = Math.floor(Cast.toNumber(END));
        if (end < 1) end = Infinity;
        if (!mesh) return;
        mesh.myData.maxInstances = end;
        mesh.update();
      },
    },
    {
      opcode: "setMeshTexCoordOffsetUV",
      blockType: BlockType.COMMAND,
      text: "设置 [NAME] 的纹理坐标偏移 UV 为 [U] [V]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
        U: {
          type: ArgumentType.NUMBER,
        },
        V: {
          type: ArgumentType.NUMBER,
        },
      },
      def: function ({ NAME, U, V }, { target }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        mesh.myData.uvOffset = [Cast.toNumber(U), Cast.toNumber(V)];
        mesh.update();
      },
    },
    {
      opcode: "drawMesh",
      blockType: BlockType.COMMAND,
      text: "绘制网格 [NAME]",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ NAME }, util) {
        NAME = Cast.toString(NAME);
        const mesh = meshes.get(NAME);
        if (!mesh) return;
        if (!currentRenderTarget.checkIfValid()) return;
        if (currentRenderTarget.getMesh() == mesh) return;
        if (!mesh.buffers.position) return;

        // TODO: only recompute this after one or more buffers were changed
        let length = -1;
        let lengthIns = -1;
        for (const name in mesh.buffers) {
          const buffer = mesh.buffers[name];
          if (buffer.type == 0) {
            if (length == -1) length = buffer.length;
            else if (length !== buffer.length) return;
          } else if (buffer.type == 1) {
            if (lengthIns == -1) lengthIns = buffer.length;
            else if (lengthIns !== buffer.length) return;
          }
        }
        if (length == -1) return;
                // TODO: keep list of per mesh flags, list of global flags, and simply concatenate them here
        let flags = [];
        if (mesh.buffers.colors) flags.push("COLORS");
        if (mesh.buffers.texCoords)
          flags.push(`TEXTURES ${mesh.buffers.texCoords.size}`);
        if (fogEnabled) {
          flags.push("FOG");
          if (fogSpace == "view space") flags.push("FOG_IN_VIEW_SPACE");
          if (fogSpace == "world space") flags.push("FOG_IN_WORLD_SPACE");
          if (fogSpace == "model space") flags.push("FOG_IN_MODEL_SPACE");
          if (fogPosition) flags.push("FOG_POS");
        }
        if (mesh.buffers.boneIndices && mesh.data.bonesDiff) {
          flags.push(`SKINNING ${mesh.buffers.boneIndices.size}`);
          flags.push(`BONE_COUNT ${mesh.data.bonesDiff.length / 16}`);
        }
        if (mesh.data.interpolation) flags.push(mesh.data.interpolation);
        if (mesh.data.alphaTest > 0) flags.push("ALPHATEST");
        if (mesh.data.makeOpaque) flags.push("MAKE_OPAQUE");
        if (mesh.data.billboarding) flags.push("BILLBOARD");
        if (mesh.data.uvOffset) flags.push("UV_OFFSET");
        if (mesh.buffers.instanceTransforms) {
          flags.push("INSTANCING");
          if (mesh.buffers.instanceTransforms.size <= 3)
            flags.push("INSTANCE_POS");
          if (mesh.buffers.instanceTransforms.size == 4)
            flags.push("INSTANCE_POS_SCALE");
          if (mesh.buffers.instanceTransforms.size == 16)
            flags.push("INSTANCE_MATRIX");
        }
        if (mesh.buffers.instanceColors) flags.push("INSTANCE_COLOR");
        if (mesh.buffers.instanceUVOffsets)
          flags.push(
            mesh.buffers.instanceUVOffsets.size == 4
              ? "INSTANCE_UVS"
              : "INSTANCE_UV"
          );
        const program = programs.get(flags);
        if (!program.program) return;
        gl.useProgram(program.program);

        // TODO: replace the following slow monstrosity with fast VAOs
        if (mesh.buffers.indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.indices.buffer);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.position.buffer);
        gl.enableVertexAttribArray(program.aloc.a_position);
        gl.vertexAttribPointer(
          program.aloc.a_position,
          mesh.buffers.position.size,
          gl.FLOAT,
          false,
          0,
          0
        );

        if (mesh.buffers.colors) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.colors.buffer);
          gl.enableVertexAttribArray(program.aloc.a_color);
          gl.vertexAttribPointer(
            program.aloc.a_color,
            mesh.buffers.colors.size,
            gl.UNSIGNED_BYTE,
            true,
            0,
            0
          );
        }
        if (mesh.buffers.texCoords) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.texCoords.buffer);
          gl.enableVertexAttribArray(program.aloc.a_uv);
          gl.vertexAttribPointer(
            program.aloc.a_uv,
            mesh.buffers.texCoords.size,
            gl.FLOAT,
            false,
            0,
            0
          );
        }
        if (mesh.buffers.boneIndices) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.boneIndices.buffer);
          gl.enableVertexAttribArray(program.aloc.a_index);
          gl.vertexAttribPointer(
            program.aloc.a_index,
            mesh.buffers.boneIndices.size,
            gl.BYTE,
            false,
            0,
            0
          );
        }
        if (mesh.buffers.boneWeights) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.boneWeights.buffer);
          gl.enableVertexAttribArray(program.aloc.a_weight);
          gl.vertexAttribPointer(
            program.aloc.a_weight,
            mesh.buffers.boneWeights.size,
            gl.UNSIGNED_SHORT,
            true,
            0,
            0
          );
        }
        if (mesh.buffers.instanceTransforms) {
          gl.bindBuffer(
            gl.ARRAY_BUFFER,
            mesh.buffers.instanceTransforms.buffer
          );
          if (mesh.buffers.instanceTransforms.size == 16) {
            gl.enableVertexAttribArray(program.aloc.a_instanceTransform);
            gl.enableVertexAttribArray(program.aloc.a_instanceTransform + 1);
            gl.enableVertexAttribArray(program.aloc.a_instanceTransform + 2);
            gl.enableVertexAttribArray(program.aloc.a_instanceTransform + 3);
            gl.vertexAttribPointer(
              program.aloc.a_instanceTransform,
              4,
              gl.FLOAT,
              false,
              64,
              0
            );
            gl.vertexAttribPointer(
              program.aloc.a_instanceTransform + 1,
              4,
              gl.FLOAT,
              false,
              64,
              16
            );
            gl.vertexAttribPointer(
              program.aloc.a_instanceTransform + 2,
              4,
              gl.FLOAT,
              false,
              64,
              32
            );
            gl.vertexAttribPointer(
              program.aloc.a_instanceTransform + 3,
              4,
              gl.FLOAT,
              false,
              64,
              48
            );
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform, 1);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 1, 1);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 2, 1);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 3, 1);
          } else {
            gl.enableVertexAttribArray(program.aloc.a_instanceTransform);
            gl.vertexAttribPointer(
              program.aloc.a_instanceTransform,
              mesh.buffers.instanceTransforms.size,
              gl.FLOAT,
              false,
              0,
              0
            );
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform, 1);
          }
        }
        if (mesh.buffers.instanceColors) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.instanceColors.buffer);
          gl.enableVertexAttribArray(program.aloc.a_instanceColor);
          gl.vertexAttribPointer(
            program.aloc.a_instanceColor,
            mesh.buffers.instanceColors.size,
            gl.FLOAT,
            false,
            0,
            0
          );
          gl.vertexAttribDivisor(program.aloc.a_instanceColor, 1);
        }
        if (mesh.buffers.instanceUVOffsets) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffers.instanceUVOffsets.buffer);
          gl.enableVertexAttribArray(program.aloc.a_instanceUV);
          gl.vertexAttribPointer(
            program.aloc.a_instanceUV,
            mesh.buffers.instanceUVOffsets.size,
            gl.FLOAT,
            false,
            0,
            0
          );
          gl.vertexAttribDivisor(program.aloc.a_instanceUV, 1);
        }

        const blending = mesh.data.blending ?? "default";
        if (blending !== currentBlending) {
          currentBlending = blending;
          const props = Blendings[blending];
          if (props[0] !== currentBlendingProps[0]) {
            if (props[0]) gl.enable(gl.BLEND);
            else gl.disable(gl.BLEND);
            currentBlendingProps[0] = props[0];
          }
          if (props[0]) {
            gl.blendFuncSeparate(props[1], props[2], props[3], props[4]);
            if (props[5] !== currentBlendingProps[5]) {
              gl.blendEquation(props[5]);
              currentBlendingProps[5] = props[5];
            }
          }
        }
        const culling = mesh.data.culling ?? "nothing";
        if (culling !== currentCulling) {
          currentCulling = culling;
          const props = Cullings[culling];
          if (props[0] !== currentCullingProps[0]) {
            if (props[0]) gl.enable(gl.CULL_FACE);
            else gl.disable(gl.CULL_FACE);
            currentCullingProps[0] = props[0];
          }
          if (props[0]) {
            if (props[1] !== currentCullingProps[1]) {
              gl.cullFace(props[1]);
              currentCullingProps[1] = props[1];
            }
          }
        }

        if (mesh.buffers.texCoords) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(
            mesh.data.texture?.target ?? gl.TEXTURE_2D,
            mesh.data.texture?.texture ?? texture
          );
          gl.uniform1i(program.uloc.u_texture, 0);
        }

        gl.uniform4fv(program.uloc.u_color_mul, colorMultiplier);
        gl.uniform4fv(program.uloc.u_color_add, colorAdder);
        if (fogEnabled) {
          gl.uniform3fv(program.uloc.u_fog_color, fogColor);
          gl.uniform2fv(program.uloc.u_fog_dist, fogDistance);
          if (fogPosition)
            gl.uniform3fv(program.uloc.u_fog_position, fogPosition);
        }
        if (mesh.data.alphaTest > 0) {
          gl.uniform1f(program.uloc.u_alpha_threshold, mesh.data.alphaTest);
        }

        if (mesh.data.bonesDiff) {
          gl.uniformMatrix4fv(program.uloc.u_bones, false, mesh.data.bonesDiff);
        }
        if (mesh.data.uvOffset) {
          gl.uniform2fv(program.uloc.u_uvOffset, mesh.data.uvOffset);
        }

        gl.uniformMatrix4fv(
          program.uloc.u_projection,
          false,
          transforms.viewToProjected
        );
        gl.uniformMatrix4fv(program.uloc.u_view, false, transforms.worldToView);
        gl.uniformMatrix4fv(
          program.uloc.u_model,
          false,
          transforms.modelToWorld
        );

        let start = 0;
        let amount = mesh.buffers.indices
          ? mesh.buffers.indices.length
          : length;
        if (mesh.data.drawRange) {
          const size = mesh.buffers.indices
            ? mesh.buffers.indices.bytesPerEl
            : 1;
          start = mesh.data.drawRange[0] * size;
          const end = Math.min(
            mesh.data.drawRange[0] + mesh.data.drawRange[1],
            amount
          );
          amount = end - mesh.data.drawRange[0];
        }
        if (mesh.buffers.instanceTransforms) {
          let instanceCount = mesh.buffers.instanceTransforms.length;
          if (
            mesh.data.maxInstances &&
            mesh.data.maxInstances < instanceCount
          ) {
            instanceCount = mesh.data.maxInstances;
          }
          if (mesh.buffers.indices) {
            const indexTypes = [
              null,
              gl.UNSIGNED_BYTE,
              gl.UNSIGNED_SHORT,
              null,
              gl.UNSIGNED_INT,
            ];
            gl.drawElementsInstanced(
              mesh.data.primitives ?? gl.TRIANGLES,
              amount,
              indexTypes[mesh.buffers.indices.bytesPerEl],
              start,
              instanceCount
            );
          } else {
            gl.drawArraysInstanced(
              mesh.data.primitives ?? gl.TRIANGLES,
              start,
              amount,
              instanceCount
            );
          }
        } else {
          if (mesh.buffers.indices) {
            const indexTypes = [
              null,
              gl.UNSIGNED_BYTE,
              gl.UNSIGNED_SHORT,
              null,
              gl.UNSIGNED_INT,
            ];
            gl.drawElements(
              mesh.data.primitives ?? gl.TRIANGLES,
              amount,
              indexTypes[mesh.buffers.indices.bytesPerEl],
              start
            );
          } else {
            gl.drawArrays(mesh.data.primitives ?? gl.TRIANGLES, start, amount);
          }
        }
        if (currentRenderTarget === canvasRenderTarget) {
          canvasDirty = true; // Telling extension to update texture
          renderer.dirty = true; // Telling renderer to redraw the screen
          runtime.requestRedraw(); // Telling sequencer to yield in loops
        }

        if (mesh.buffers.colors) {
          gl.disableVertexAttribArray(program.aloc.a_color);
        }
        if (mesh.buffers.texCoords) {
          gl.disableVertexAttribArray(program.aloc.a_uv);
        }
        if (mesh.buffers.boneIndices) {
          gl.disableVertexAttribArray(program.aloc.a_index);
        }
        if (mesh.buffers.boneWeights) {
          gl.disableVertexAttribArray(program.aloc.a_weight);
        }
        if (mesh.buffers.instanceTransforms) {
          if (mesh.buffers.instanceTransforms.size == 16) {
            gl.disableVertexAttribArray(program.aloc.a_instanceTransform);
            gl.disableVertexAttribArray(program.aloc.a_instanceTransform + 1);
            gl.disableVertexAttribArray(program.aloc.a_instanceTransform + 2);
            gl.disableVertexAttribArray(program.aloc.a_instanceTransform + 3);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform, 0);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 1, 0);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 2, 0);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform + 3, 0);
          } else {
            gl.disableVertexAttribArray(program.aloc.a_instanceTransform);
            gl.vertexAttribDivisor(program.aloc.a_instanceTransform, 0);
          }
        }
        if (mesh.buffers.instanceColors) {
          gl.disableVertexAttribArray(program.aloc.a_instanceColor);
          gl.vertexAttribDivisor(program.aloc.a_instanceColor, 0);
        }
        if (mesh.buffers.instanceUVOffsets) {
          gl.disableVertexAttribArray(program.aloc.a_instanceUV);
          gl.vertexAttribDivisor(program.aloc.a_instanceUV, 0);
        }
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "纹理",
    },
    {
      opcode: "textureFromUrl",
      blockType: BlockType.REPORTER,
      text: "从URL创建纹理 [纹理URL]",
      arguments: {
        纹理URL: {
          type: ArgumentType.STRING,
          defaultValue: "https://extensions.turbowarp.org/dango.png",
        },
      },
      def: function ({ 纹理URL }, { target }) {
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          Scratch.canFetch(纹理URL)
            .then((result) => {
              if (!result) {
                resolve(null);
                return;
              }
              // eslint-disable-next-line extension/check-can-fetch
              const img = new Image();
              if (
                new URL(纹理URL, window.location.href).origin !==
                window.location.origin
              ) {
                img.crossOrigin = "";
              }
              img.src = 纹理URL;
              img.onload = function () {
                // This takes time, so no imageSourceSync
                resolve({
                  width: img.width,
                  height: img.height,
                  data: img,
                });
              };
              img.onerror = function () {
                resolve(null);
              };
            })
            .catch(() => {
              resolve(null);
            });
        });
        return "[纹理数据]";
      },
    },
    {
      opcode: "textureFromCostume",
      blockType: BlockType.REPORTER,
      text: "从造型创建纹理 [造型名称]",
      arguments: {
        造型名称: {
          type: ArgumentType.COSTUME,
        },
      },
      def: function ({ 造型名称 }, { target }) {
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          if (!requireNonPackagedRuntime("texture from costume")) {
            resolve(null);
            return;
          }
          const costumeIndex = target.getCostumeIndexByName(造型名称);
          if (costumeIndex == -1) return;
          const costume = target.sprite.costumes[costumeIndex];
          // eslint-disable-next-line extension/check-can-fetch
          const img = new Image();
          img.src = costume.asset.encodeDataURI();
          img.onload = function () {
            // This takes time, so no imageSourceSync
            resolve({
              width: img.width,
              height: img.height,
              data: img,
            });
          };
          img.onerror = function () {
            resolve(null);
          };
        });
        return "[纹理数据]";
      },
    },
    {
      opcode: "textureFromText",
      blockType: BlockType.REPORTER,
      text: "从文本创建纹理 [文本内容] 字体 [字体样式] 颜色 [颜色]",
      arguments: {
        文本内容: {
          type: ArgumentType.STRING,
          defaultValue: "你好，世界！",
        },
        字体样式: {
          type: ArgumentType.STRING,
          defaultValue: "斜体 粗体 32px 无衬线字体",
        },
        颜色: {
          type: ArgumentType.COLOR,
          defaultValue: "#ffff00",
        },
      },
      def: function ({ 文本内容, 字体样式, 颜色 }) {
        文本内容 = Cast.toString(文本内容);
        字体样式 = Cast.toString(字体样式);
        颜色 = Cast.toRgbColorObject(颜色);
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          const canv = document.createElement("canvas");
          const ctx = canv.getContext("2d");
          ctx.font = 字体样式;
          const m = ctx.measureText(文本内容);
          canv.width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
          canv.height = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
          ctx.clearRect(0, 0, canv.width, canv.height);
          ctx.font = 字体样式;
          ctx.fillStyle = `rgba(${颜色.r},${颜色.g},${颜色.b},${(颜色.a ?? 255) / 255})`;
          ctx.fillText(文本内容, m.actualBoundingBoxLeft, m.fontBoundingBoxAscent);
          imageSourceSync = {
            width: canv.width,
            height: canv.height,
            data: canv,
          };
          resolve(imageSourceSync);
        });
        return "[纹理数据]";
      },
    },
    {
      opcode: "textureFromTextWithBorder",
      blockType: BlockType.REPORTER,
      text: "从带边框文本创建纹理 [文本内容] 字体 [字体样式] 颜色 [颜色] 边框大小 [边框尺寸] 边框颜色 [边框颜色]",
      arguments: {
        文本内容: {
          type: ArgumentType.STRING,
          defaultValue: "你好，世界！",
        },
        字体样式: {
          type: ArgumentType.STRING,
          defaultValue: "斜体 粗体 32px 无衬线字体",
        },
        颜色: {
          type: ArgumentType.COLOR,
          defaultValue: "#ffff00",
        },
        边框尺寸: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        边框颜色: {
          type: ArgumentType.COLOR,
          defaultValue: "#000000",
        },
      },
      def: function ({ 文本内容, 字体样式, 颜色, 边框尺寸, 边框颜色 }) {
        文本内容 = Cast.toString(文本内容);
        字体样式 = Cast.toString(字体样式);
        颜色 = Cast.toRgbColorObject(颜色);
        边框尺寸 = Cast.toNumber(边框尺寸);
        边框颜色 = Cast.toRgbColorObject(边框颜色);
        const BORDERSIZECEIL = Math.ceil(边框尺寸);
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          const canv = document.createElement("canvas");
          const ctx = canv.getContext("2d");
          ctx.font = 字体样式;
          const m = ctx.measureText(文本内容);
          canv.width =
            m.actualBoundingBoxLeft +
            m.actualBoundingBoxRight +
            2 * BORDERSIZECEIL;
          canv.height =
            m.fontBoundingBoxAscent +
            m.fontBoundingBoxDescent +
            2 * BORDERSIZECEIL;
          ctx.clearRect(0, 0, canv.width, canv.height);
          ctx.font = 字体样式;
          ctx.lineWidth = 边框尺寸;
          ctx.fillStyle = `rgba(${颜色.r},${颜色.g},${颜色.b},${(颜色.a ?? 255) / 255})`;
          ctx.strokeStyle = `rgba(${边框颜色.r},${边框颜色.g},${边框颜色.b},${(边框颜色.a ?? 255) / 255})`;
          ctx.fillText(
            文本内容,
            m.actualBoundingBoxLeft + BORDERSIZECEIL,
            m.fontBoundingBoxAscent + BORDERSIZECEIL
          );
          ctx.strokeText(
            文本内容,
            m.actualBoundingBoxLeft + BORDERSIZECEIL,
            m.fontBoundingBoxAscent + BORDERSIZECEIL
          );
          imageSourceSync = {
            width: canv.width,
            height: canv.height,
            data: canv,
          };
          resolve(imageSourceSync);
        });
        return "[纹理数据]";
      },
    },
    {
      opcode: "textureFromList",
      blockType: BlockType.REPORTER,
      text: "从列表创建纹理 [列表名称] 起始位置 [位置] 尺寸为 [宽度] [高度]",
      arguments: {
        列表名称: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        位置: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        宽度: {
          type: ArgumentType.NUMBER,
          defaultValue: 16,
        },
        高度: {
          type: ArgumentType.NUMBER,
          defaultValue: 16,
        },
      },
      def: function ({ 列表名称, 位置, 宽度, 高度 }, { target }) {
        let retStatus = "[纹理数据]";
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          const width = Cast.toNumber(宽度);
          const height = Cast.toNumber(高度);
          const listName = Cast.toString(列表名称);
          const lengthRequired = width * height * 4;
          if (
            width < 1 ||
            height < 1 ||
            !Number.isFinite(width) ||
            !Number.isFinite(height)
          ) {
            retStatus = "无效的纹理尺寸";
            resolve(null);
            return;
          }
          const list = target.lookupVariableByNameAndType(listName, "list");
          if (!list) {
            retStatus = "列表未找到";
            resolve(null);
            return;
          }
          const pos = Cast.toNumber(位置) - 1;
          if (!Number.isFinite(pos) || pos < 0) {
            retStatus = "无效的起始位置";
            resolve(null);
            return;
          }
          if (list.value.length < pos + lengthRequired) {
            retStatus = "列表长度不足";
            resolve(null);
            return;
          }
          const data = new Uint8Array(lengthRequired);
          const values = list.value;
          for (let i = 0; i < lengthRequired; i++) {
            data[i] = values[pos + i];
          }
          imageSourceSync = {
            width: width,
            height: height,
            data: data,
          };
          resolve(imageSourceSync);
        });
        return retStatus;
      },
    },
    {
      opcode: "textureFromSize",
      blockType: BlockType.REPORTER,
      text: "创建指定尺寸的纹理 [宽度] [高度]",
      arguments: {
        宽度: {
          type: ArgumentType.NUMBER,
          defaultValue: 16,
        },
        高度: {
          type: ArgumentType.NUMBER,
          defaultValue: 16,
        },
      },
      def: function ({ 宽度, 高度 }, { target }) {
        let retStatus = "[纹理数据]";
        imageSourceSync = null;
        imageSource = new Promise((resolve, reject) => {
          const width = Cast.toNumber(宽度);
          const height = Cast.toNumber(高度);
          if (
            width < 1 ||
            height < 1 ||
            !Number.isFinite(width) ||
            !Number.isFinite(height)
          ) {
            retStatus = "无效的纹理尺寸";
            resolve(null);
            return;
          }
          imageSourceSync = {
            width: width,
            height: height,
            data: null,
          };
          resolve(imageSourceSync);
        });
        return retStatus;
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "文本测量",
    },
    {
      opcode: "measureText",
      blockType: BlockType.COMMAND,
      text: "测量文本 [文本内容] 字体 [字体样式]",
      arguments: {
        方向: {
          type: ArgumentType.STRING,
          defaultValue: "上",
        },
        文本内容: {
          type: ArgumentType.STRING,
          defaultValue: "你好，世界！",
        },
        字体样式: {
          type: ArgumentType.STRING,
          defaultValue: "斜体 粗体 32px 无衬线字体",
        },
      },
      def: function ({ 方向, 文本内容, 字体样式 }) {
        方向 = Cast.toString(方向);
        文本内容 = Cast.toString(文本内容);
        字体样式 = Cast.toString(字体样式);
        const canv = document.createElement("canvas");
        const ctx = canv.getContext("2d");
        ctx.font = 字体样式;
        lastTextMeasurement = ctx.measureText(文本内容);
      },
    },
    {
      opcode: "readMeasuredText",
      blockType: BlockType.REPORTER,
      text: "测量的 [方向] 尺寸",
      arguments: {
        方向: {
          type: ArgumentType.STRING,
          menu: "directions",
          defaultValue: "上",
        },
      },
      def: function ({ 方向 }) {
        if (!lastTextMeasurement) return 0;
        方向 = Cast.toString(方向);
        if (方向 == "上") return lastTextMeasurement.fontBoundingBoxAscent;
        if (方向 == "下") return lastTextMeasurement.fontBoundingBoxDescent;
        if (方向 == "左") return lastTextMeasurement.actualBoundingBoxLeft;
        if (方向 == "右") return lastTextMeasurement.actualBoundingBoxRight;
        if (方向 == "X轴长度") return lastTextMeasurement.width;
        return 0;
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "字体",
    },
    {
      opcode: "getFont",
      blockType: BlockType.REPORTER,
      text: "创建字体 [字体名称] 字号 [字号大小]",
      arguments: {
        字体名称: {
          type: ArgumentType.STRING,
          menu: "fonts",
          defaultValue: "无衬线字体",
        },
        字号大小: {
          type: ArgumentType.NUMBER,
          defaultValue: 32,
        },
      },
      def: function ({ 字体名称, 字号大小 }) {
        字体名称 = Cast.toString(字体名称);
        字号大小 = Math.min(Math.max(Cast.toNumber(字号大小), 1), 1000);
        return `${字号大小}px ${字体名称}`;
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "视图变换",
    },
    {
      opcode: "matSelect",
      blockType: BlockType.COMMAND,
      text: "配置 [变换类型] 变换矩阵",
      arguments: {
        变换类型: {
          type: ArgumentType.STRING,
          menu: "renderTransforms",
        },
      },
      def: function ({ 变换类型 }, { target }) {
        if (hasOwn(transforms, 变换类型)) {
          selectedTransform = 变换类型;
        }
      },
    },
    {
      opcode: "matStartWithPerspective",
      blockType: BlockType.COMMAND,
      text: "初始化为透视投影 视场角：[视场角] 近裁剪面：[近裁剪面] 远裁剪面：[远裁剪面]",
      arguments: {
        视场角: {
          type: ArgumentType.NUMBER,
          defaultValue: 90,
        },
        近裁剪面: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        远裁剪面: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
      },
      def: function ({ 视场角, 近裁剪面, 远裁剪面 }) {
        transforms[selectedTransform] = m4.perspective(
          (Cast.toNumber(视场角) / 180) * Math.PI,
          currentRenderTarget.getAspectRatio(),
          Cast.toNumber(近裁剪面),
          Cast.toNumber(远裁剪面)
        );
      },
    },
    {
      opcode: "matStartWithOrthographic",
      blockType: BlockType.COMMAND,
      text: "初始化为正交投影 近裁剪面：[近裁剪面] 远裁剪面：[远裁剪面]",
      arguments: {
        近裁剪面: {
          type: ArgumentType.NUMBER,
          defaultValue: 0.1,
        },
        远裁剪面: {
          type: ArgumentType.NUMBER,
          defaultValue: 1000,
        },
      },
      def: function ({ 近裁剪面, 远裁剪面 }) {
        transforms[selectedTransform] = m4.orthographic(
          currentRenderTarget.getAspectRatio(),
          Cast.toNumber(近裁剪面),
          Cast.toNumber(远裁剪面)
        );
      },
    },
    {
      opcode: "matStartWithIdentity",
      blockType: BlockType.COMMAND,
      text: "初始化为单位矩阵（无变换）",
      def: function () {
        transforms[selectedTransform] = m4.identity();
      },
    },
    {
      opcode: "matStartWithExternal",
      blockType: BlockType.COMMAND,
      text: "初始化为 [外部变换源]",
      arguments: {
        外部变换源: {
          type: ArgumentType.STRING,
          menu: "externalTransforms",
        },
      },
      def: function ({ 外部变换源 }, util) {
        if (!hasOwn(externalTransforms, 外部变换源)) return;
        const src = externalTransforms[外部变换源];
        transforms[selectedTransform] = src.get() ?? m4.identity();
      },
    },
    {
      opcode: "matStartWithSavedIn",
      blockType: BlockType.COMMAND,
      text: "初始化为保存在 [源列表] 中第 [位置] 项的矩阵",
      arguments: {
        源列表: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        位置: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ 源列表, 位置 }, { target }) {
        const pos = Math.floor(Cast.toNumber(位置));
        const list = target.lookupVariableByNameAndType(
          Cast.toString(源列表),
          "list"
        );
        if (!list) return;
        if (!Number.isFinite(pos) || pos < 1 || pos + 15 > list.value.length)
          return;

        transforms[selectedTransform] = list.value
          .slice(pos - 1, pos + 15)
          .map(Cast.toNumber);
      },
    },
    {
      opcode: "matMove",
      blockType: BlockType.COMMAND,
      text: "平移 X：[X轴偏移] Y：[Y轴偏移] Z：[Z轴偏移]",
      arguments: {
        X轴偏移: {
          type: ArgumentType.NUMBER,
        },
        Y轴偏移: {
          type: ArgumentType.NUMBER,
        },
        Z轴偏移: {
          type: ArgumentType.NUMBER,
        },
      },
      def: function ({ X轴偏移, Y轴偏移, Z轴偏移 }) {
        transforms[selectedTransform] = m4.translate(
          transforms[selectedTransform],
          Cast.toNumber(X轴偏移),
          Cast.toNumber(Y轴偏移),
          Cast.toNumber(Z轴偏移)
        );
      },
    },
    {
      opcode: "matRotate",
      blockType: BlockType.COMMAND,
      text: "绕 [坐标轴] 旋转 [角度] 度",
      arguments: {
        坐标轴: {
          type: ArgumentType.STRING,
          menu: "axis",
        },
        角度: {
          type: ArgumentType.ANGLE,
        },
      },
      def: function ({ 坐标轴, 角度 }) {
        let fn;
        if (坐标轴 == "X轴") fn = m4.xRotate;
        if (坐标轴 == "Y轴") fn = m4.yRotate;
        if (坐标轴 == "Z轴") fn = m4.zRotate;
        if (!fn) return;
        transforms[selectedTransform] = fn(
          transforms[selectedTransform],
          (Cast.toNumber(角度) / 180) * Math.PI
        );
      },
    },
    {
      opcode: "matScale",
      blockType: BlockType.COMMAND,
      text: "缩放 X：[X轴缩放] Y：[Y轴缩放] Z：[Z轴缩放]",
      arguments: {
        X轴缩放: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        Y轴缩放: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        Z轴缩放: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ X轴缩放, Y轴缩放, Z轴缩放 }) {
        transforms[selectedTransform] = m4.scale(
          transforms[selectedTransform],
          Cast.toNumber(X轴缩放),
          Cast.toNumber(Y轴缩放),
          Cast.toNumber(Z轴缩放)
        );
      },
    },
    {
      opcode: "matWrapper",
      blockType: BlockType.CONDITIONAL,
      text: "矩阵包装器（作用域）",
      def: function (_, util) {
        if (util.stackFrame.undoWrapper) {
          util.stackFrame.undoWrapper = false;
          transforms = util.stackFrame.mat3Dstack.pop();
        } else {
          util.stackFrame.undoWrapper = true;
          if (!util.stackFrame.mat3Dstack) util.stackFrame.mat3Dstack = [];
          util.stackFrame.mat3Dstack.push(Object.assign({}, transforms));
          util.startBranch(1, true);
        }
      },
    },
    {
      opcode: "matSaveInto",
      blockType: BlockType.COMMAND,
      text: "保存到 [目标列表] 中第 [位置] 项",
      arguments: {
        目标列表: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
        位置: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ 目标列表, 位置 }, { target }) {
        const pos = Math.floor(Cast.toNumber(位置)) - 1;
        const list = target.lookupVariableByNameAndType(
          Cast.toString(目标列表),
          "list"
        );
        if (!list) return;
        if (pos < 0 || !Number.isFinite(pos)) return;

        const value = list.value;
        const mat = transforms[selectedTransform];
        while (value.length < pos + 15) {
          value.push(0);
        }
        for (let i = 0; i < 16; i++) {
          value[pos + i] = mat[i];
        }
        list._monitorUpToDate = false;
      },
    },
    {
      opcode: "matReset",
      blockType: BlockType.COMMAND,
      text: "重置变换矩阵的 [组件]",
      arguments: {
        组件: {
          type: ArgumentType.STRING,
          menu: "matComponent",
        },
      },
      def: function ({ 组件 }) {
        const a = transforms[selectedTransform];
        if (组件 == "旋转部分") {
          // prettier-ignore
          transforms[selectedTransform] = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            a[12], a[13], a[14], 1,
          ];
        }
        if (组件 == "偏移部分") {
          // prettier-ignore
          transforms[selectedTransform] = [
            a[0], a[1], a[2], 0,
            a[4], a[5], a[6], 0,
            a[8], a[9], a[10], 0,
            0, 0, 0, 1,
          ];
        }
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "手动变换",
    },
    {
      opcode: "matTransform",
      blockType: BlockType.COMMAND,
      text: "变换 X: [X] Y: [Y] Z: [Z]",
      arguments: {
        X: {
          type: ArgumentType.NUMBER,
        },
        Y: {
          type: ArgumentType.NUMBER,
        },
        Z: {
          type: ArgumentType.NUMBER,
        },
      },
      def: function ({ X, Y, Z }) {
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 1];
        transformed = m4.multiplyVec(transforms[selectedTransform], vec);
      },
    },

    {
      opcode: "matTransformFromTo",
      blockType: BlockType.COMMAND,
      text: "变换 X: [X] Y: [Y] Z: [Z] 从 [FROM] 到 [TO]",
      arguments: {
        X: {
          type: ArgumentType.NUMBER,
        },
        Y: {
          type: ArgumentType.NUMBER,
        },
        Z: {
          type: ArgumentType.NUMBER,
        },
        FROM: {
          type: ArgumentType.STRING,
          menu: "vectorTransformsMin2",
          defaultValue: "世界空间",
        },
        TO: {
          type: ArgumentType.STRING,
          menu: "vectorTransforms",
          defaultValue: "模型空间",
        },
      },
      def: function ({ X, Y, Z, FROM, TO }) {
        const lookup = {
          projected: 4,
          "投影（Scratch单位）": 4,
          "视图空间": 3,
          "世界空间": 2,
          "模型空间": 1,
        };
        const lookup2 = [
          null,
          transforms.modelToWorld,
          transforms.worldToView,
          transforms.viewToProjected,
        ];
        let from = lookup[FROM];
        let to = lookup[TO];
        if (!from || !to) return;
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 1];
        if (from == to) {
          transformed = vec;
          return;
        }
        if (
          lookup2[from] === transformCache.from &&
          lookup2[to] === transformCache.to
        ) {
          transformed = m4.multiplyVec(transformCache.matrix, vec);
          return;
        }
        transformCache.from = lookup2[from];
        transformCache.to = lookup2[to];
        let swapped = false;
        if (from > to) {
          [from, to] = [to, from];
          swapped = true;
        }
        let totalMat = lookup2[from];
        for (let i = from + 1; i < to; i++) {
          totalMat = m4.multiply(lookup2[i], totalMat);
        }
        if (swapped) totalMat = m4.inverse(totalMat);
        transformCache.matrix = totalMat;
        transformed = m4.multiplyVec(totalMat, vec);
        if (TO == "投影（Scratch单位）") {
          transformed[0] =
            ((transformed[0] / transformed[3]) * runtime.stageWidth) / 2;
          transformed[1] =
            ((transformed[1] / transformed[3]) * runtime.stageHeight) / 2;
          transformed[2] = transformed[3];
        }
      },
    },
    {
      opcode: "matTransformFromToDir",
      blockType: BlockType.COMMAND,
      text: "变换方向 X: [X] Y: [Y] Z: [Z] 从 [FROM] 到 [TO]",
      arguments: {
        X: {
          type: ArgumentType.NUMBER,
        },
        Y: {
          type: ArgumentType.NUMBER,
        },
        Z: {
          type: ArgumentType.NUMBER,
        },
        FROM: {
          type: ArgumentType.STRING,
          menu: "vectorTransformsMin2",
          defaultValue: "世界空间",
        },
        TO: {
          type: ArgumentType.STRING,
          menu: "vectorTransformsMin1",
          defaultValue: "模型空间",
        },
      },
      def: function ({ X, Y, Z, FROM, TO }) {
        const lookup = {
          projected: 4,
          "投影（Scratch单位）": 4,
          "视图空间": 3,
          "世界空间": 2,
          "模型空间": 1,
        };
        const lookup2 = [
          null,
          transforms.modelToWorld,
          transforms.worldToView,
          transforms.viewToProjected,
        ];
        let from = lookup[FROM];
        let to = lookup[TO];
        if (!from || !to) return;
        const vec = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z), 0];
        if (from == to) {
          transformed = vec;
          return;
        }
        if (
          lookup2[from] === transformCache.from &&
          lookup2[to] === transformCache.to
        ) {
          transformed = m4.multiplyVec(transformCache.matrix, vec);
          return;
        }
        transformCache.from = lookup2[from];
        transformCache.to = lookup2[to];
        let swapped = false;
        if (from > to) {
          [from, to] = [to, from];
          swapped = true;
        }
        let totalMat = lookup2[from];
        for (let i = from + 1; i < to; i++) {
          totalMat = m4.multiply(lookup2[i], totalMat);
        }
        if (swapped) totalMat = m4.inverse(totalMat);
        transformCache.matrix = totalMat;
        transformed = m4.multiplyVec(totalMat, vec);
      },
    },
    {
      opcode: "matTransformResult",
      blockType: BlockType.REPORTER,
      text: "变换后的 [AXIS]",
      disableMonitor: true,
      arguments: {
        AXIS: {
          type: ArgumentType.STRING,
          menu: "axis",
        },
      },
      def: function ({ AXIS }) {
        const lookup = { X轴: 1, Y轴: 2, Z轴: 3 };
        const index = lookup[AXIS];
        return index ? transformed[index - 1] : "";
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "渲染到纹理",
    },
    {
      opcode: "renderToStage",
      blockType: BlockType.COMMAND,
      text: "渲染到舞台",
      def: function () {
        canvasRenderTarget.setAsRenderTarget();
      },
    },
    {
      opcode: "renderToTexture",
      blockType: BlockType.COMMAND,
      text: "渲染到 [NAME] 的纹理",
      arguments: {
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ NAME }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        if (!mesh.data.texture) return;
        if (!(mesh.data.texture instanceof Texture2D)) return;
        mesh.data.texture.main.setAsRenderTarget();
      },
    },
    {
      opcode: "renderToCubeTexture",
      blockType: BlockType.COMMAND,
      text: "渲染到 [NAME] 的立方体贴图 [SIDE] 面",
      arguments: {
        SIDE: {
          type: ArgumentType.STRING,
          menu: "cubeSide",
        },
        NAME: {
          type: ArgumentType.STRING,
          defaultValue: "我的网格",
        },
      },
      def: function ({ SIDE, NAME }) {
        const mesh = meshes.get(Cast.toString(NAME));
        if (!mesh) return;
        if (!mesh.data.texture) return;
        if (!(mesh.data.texture instanceof TextureCube)) return;
        const lookup = {
          "X+轴": "xpos",
          "X-轴": "xneg",
          "Y+轴": "ypos",
          "Y-轴": "yneg",
          "Z+轴": "zpos",
          "Z-轴": "zneg",
        };
        if (!hasOwn(lookup, SIDE)) return;
        mesh.data.texture[lookup[SIDE]].setAsRenderTarget();
      },
    },
    {
      opcode: "readRenderTarget",
      blockType: BlockType.COMMAND,
      text: "将当前渲染目标读取到列表 [DSTLIST]",
      arguments: {
        DSTLIST: {
          type: ArgumentType.STRING,
          menu: "lists",
        },
      },
      def: function ({ DSTLIST }, { target }) {
        const list = target.lookupVariableByNameAndType(
          Cast.toString(DSTLIST),
          "list"
        );
        if (!list) return;
        if (!currentRenderTarget.checkIfValid()) return;
        const { x, y, w, h } = currentRenderTarget.getReadarea();
        if (w == 0 || h == 0) return;
        const pixels = new Uint8ClampedArray(w * h * 4);
        gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        list.value = Array.from(pixels);
        list._monitorUpToDate = false;
      },
    },
    {
      opcode: "renderTargetInfo",
      blockType: BlockType.REPORTER,
      text: "渲染目标属性 [PROPERTY]",
      allowDropAnywhere: true,
      disableMonitor: true,
      arguments: {
        PROPERTY: {
          type: ArgumentType.STRING,
          menu: "renderTargetProperty",
          defaultValue: "宽度",
        },
      },
      def: function ({ PROPERTY }) {
        if (PROPERTY == "网格名称")
          return currentRenderTarget.getMesh()?.name ?? "";
        if (PROPERTY == "宽度") return currentRenderTarget.width;
        if (PROPERTY == "高度") return currentRenderTarget.height;
        if (PROPERTY == "宽高比")
          return currentRenderTarget.getAspectRatio();
        if (PROPERTY == "深度测试") return currentRenderTarget.depthTest;
        if (PROPERTY == "深度写入") return currentRenderTarget.depthWrite;
        if (PROPERTY == "有深度缓冲区")
          return currentRenderTarget.hasDepthBuffer;
        if (PROPERTY == "图像（Data URI格式）") {
          if (!currentRenderTarget.checkIfValid()) return "";
          const { x, y, w, h } = currentRenderTarget.getReadarea();
          if (w == 0 || h == 0) return "";
          const pixels = new Uint8ClampedArray(w * h * 4);
          gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          for (let i = 0; i < pixels.length; i += 4) {
            // Internally we store everything with permultiplied alpha. Undoing it
            const alpha = pixels[i + 3] / 255;
            pixels[i + 0] /= alpha;
            pixels[i + 1] /= alpha;
            pixels[i + 2] /= alpha;
          }
          const canv = document.createElement("canvas");
          canv.width = w;
          canv.height = h;
          const ctx = canv.getContext("2d");
          const imgData = new ImageData(pixels, w, h);
          ctx.putImageData(imgData, 0, 0);
          return canv.toDataURL();
        }
        if (PROPERTY == "可绘制有效状态")
          return currentRenderTarget.checkIfValid();
        if (PROPERTY == "有视口框")
          return currentRenderTarget.viewport !== null;
        if (PROPERTY == "有裁剪框")
          return currentRenderTarget.scissors !== null;
        if (PROPERTY == "有回读框")
          return currentRenderTarget.readarea !== null;
        return "";
      },
    },
    {
      opcode: "setRenderTargetBox",
      blockType: BlockType.COMMAND,
      text: "设置 [BOXTYPE] 为 X1:[X1] Y1:[Y1] X2:[X2] Y2:[Y2]",
      arguments: {
        BOXTYPE: {
          type: ArgumentType.STRING,
          menu: "boxType",
        },
        X1: {
          type: ArgumentType.NUMBER,
          defaultValue: 0,
        },
        Y1: {
          type: ArgumentType.NUMBER,
          defaultValue: 0,
        },
        X2: {
          type: ArgumentType.NUMBER,
          defaultValue: 100,
        },
        Y2: {
          type: ArgumentType.NUMBER,
          defaultValue: 100,
        },
      },
      def: function ({ BOXTYPE, X1, Y1, X2, Y2 }) {
        X1 = Cast.toNumber(X1);
        Y1 = Cast.toNumber(Y1);
        X2 = Cast.toNumber(X2);
        Y2 = Cast.toNumber(Y2);
        const x = Math.min(X1, X2);
        const y = Math.min(Y1, Y2);
        const w = Math.max(X1, X2) - x;
        const h = Math.max(Y1, Y2) - y;
        if (BOXTYPE == "视口框") {
          currentRenderTarget.viewport = { x, y, w, h };
        }
        if (BOXTYPE == "裁剪框") {
          currentRenderTarget.scissors = { x, y, w, h };
          currentRenderTarget.updateScissorsEnabled();
        }
        if (BOXTYPE == "回读框") {
          currentRenderTarget.readarea = { x, y, w, h };
        }
        currentRenderTarget.updateViewport();
      },
    },
    {
      opcode: "clearRenderTargetBox",
      blockType: BlockType.COMMAND,
      text: "清除 [BOXTYPE]",
      arguments: {
        BOXTYPE: {
          type: ArgumentType.STRING,
          menu: "boxType",
        },
      },
      def: function ({ BOXTYPE }) {
        if (BOXTYPE == "视口框") {
          currentRenderTarget.viewport = null;
        }
        if (BOXTYPE == "裁剪框") {
          currentRenderTarget.scissors = null;
          currentRenderTarget.updateScissorsEnabled();
        }
        if (BOXTYPE == "回读框") {
          currentRenderTarget.readarea = null;
        }
        currentRenderTarget.updateViewport();
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "着色与雾效",
    },
    {
      opcode: "setGlobalColor",
      blockType: BlockType.COMMAND,
      text: "设置全局颜色 [OPERATION] 红: [RED] 绿: [GREEN] 蓝: [BLUE] 透明度: [ALPHA]",
      arguments: {
        OPERATION: {
          type: ArgumentType.STRING,
          menu: "globalColor",
        },
        RED: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        GREEN: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        BLUE: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        ALPHA: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ OPERATION, RED, GREEN, BLUE, ALPHA }) {
        const color = [
          Cast.toNumber(RED),
          Cast.toNumber(GREEN),
          Cast.toNumber(BLUE),
          Cast.toNumber(ALPHA),
        ];
        if (OPERATION == "乘法器") colorMultiplier = color;
        if (OPERATION == "加法器") colorAdder = color;
      },
    },
    {
      opcode: "setFogEnabled",
      blockType: BlockType.COMMAND,
      text: "开启/关闭雾效 [STATE]",
      arguments: {
        STATE: {
          type: ArgumentType.STRING,
          menu: "onOff",
        },
      },
      def: function ({ STATE }) {
        fogEnabled = Cast.toBoolean(STATE);
      },
    },
    {
      opcode: "setFogColor",
      blockType: BlockType.COMMAND,
      text: "设置雾效颜色 红: [RED] 绿: [GREEN] 蓝: [BLUE]",
      arguments: {
        RED: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        GREEN: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
        BLUE: {
          type: ArgumentType.NUMBER,
          defaultValue: 1,
        },
      },
      def: function ({ RED, GREEN, BLUE }) {
        fogColor = [
          Cast.toNumber(RED),
          Cast.toNumber(GREEN),
          Cast.toNumber(BLUE),
        ];
      },
    },
    {
      opcode: "setFogDistance",
      blockType: BlockType.COMMAND,
      text: "设置雾效距离 近: [NEAR] 远: [FAR]",
      arguments: {
        NEAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 10,
        },
        FAR: {
          type: ArgumentType.NUMBER,
          defaultValue: 100,
        },
      },
      def: function ({ NEAR, FAR }) {
        NEAR = Cast.toNumber(NEAR);
        FAR = Cast.toNumber(FAR);
        fogDistance = [NEAR, FAR - NEAR];
      },
    },
    {
      opcode: "setFogPosition",
      blockType: BlockType.COMMAND,
      text: "设置 [SPACE] 空间下雾效原点为 X: [X] Y: [Y] Z: [Z]",
      arguments: {
        SPACE: {
          type: ArgumentType.STRING,
          defaultValue: "视图空间",
          menu: "fogSpace",
        },
        X: {
          type: ArgumentType.NUMBER,
          defaultValue: 0,
        },
        Y: {
          type: ArgumentType.NUMBER,
          defaultValue: 0,
        },
        Z: {
          type: ArgumentType.NUMBER,
          defaultValue: 0,
        },
      },
      def: function ({ SPACE, X, Y, Z }) {
        fogSpace = Cast.toString(SPACE);
        fogPosition = [Cast.toNumber(X), Cast.toNumber(Y), Cast.toNumber(Z)];
        if (fogPosition[0] == 0 && fogPosition[1] == 0 && fogPosition[2] == 0)
          fogPosition = null;
      },
    },
    {
      blockType: BlockType.LABEL,
      text: "分辨率更改",
    },
    {
      opcode: "whenCanvasResized",
      blockType: BlockType.EVENT,
      text: "当分辨率更改时",
      isEdgeActivated: false,
    },
    {
      opcode: "canvasWidth",
      blockType: BlockType.REPORTER,
      text: "舞台宽度",
      def: function () {
        return canvas.width;
      },
    },
    {
      opcode: "canvasHeight",
      blockType: BlockType.REPORTER,
      text: "舞台高度",
      def: function () {
        return canvas.height;
      },
    },
  ];

  const extInfo = {
    id: extensionId,
    name: "简易3D",
    color1: "#5CB1D6",
    color2: "#47A8D1",
    color3: "#2E8EB8",
    docsURI: "https://extensions.turbowarp.org/Xeltalliv/simple3D",
    blocks: definitions,
    menus: {
      fonts: {
        acceptReporters: false,
        items: "fontsMenu",
      },
      lists: {
        acceptReporters: false,
        items: "listsMenu",
      },
      costumes: {
        acceptReporters: true,
        items: "costumesMenu",
      },
      externalTransforms: {
        acceptReporters: true,
        items: "externalTransformsMenu",
      },
      clearLayers: {
        acceptReporters: true,
        items: Object.keys(ClearLayers),
      },
      primitives: {
        acceptReporters: true,
        items: Object.keys(Primitives),
      },
      onOff: {
        acceptReporters: true,
        items: [
          { text: "开启", value: "true" },
          { text: "关闭", value: "false" },
        ],
      },
      meshProperties: {
        acceptReporters: false,
        items: ["存在", ...Object.keys(MeshPropFns)],
      },
      axis: {
        acceptReporters: false,
        items: ["X轴", "Y轴", "Z轴"],
      },
      textureWrap: {
        acceptReporters: false,
        items: ["钳制到边缘", "重复"],
      },
      textureFilter: {
        acceptReporters: false,
        items: ["像素化", "模糊"],
      },
      textureMipmapping: {
        acceptReporters: false,
        items: ["关闭", "锐利过渡", "平滑过渡"],
      },
      cubeSide: {
        acceptReporters: true,
        items: ["X+轴", "X-轴", "Y+轴", "Y-轴", "Z+轴", "Z-轴"],
      },
      blending: {
        acceptReporters: true,
        items: Object.keys(Blendings),
      },
      culling: {
        acceptReporters: true,
        items: Object.keys(Cullings),
      },
      skinningTransforms: {
        acceptReporters: true,
        items: ["原始", "当前"],
      },
      renderTransforms: {
        acceptReporters: false,
        items: [
          {
            text: "从视图空间到投影空间",
            value: "viewToProjected",
          },
          {
            text: "从世界空间到视图空间",
            value: "worldToView",
          },
          {
            text: "从模型空间到世界空间",
            value: "modelToWorld",
          },
          {
            text: "从文件导入",
            value: "import",
          },
          {
            text: "自定义",
            value: "custom",
          },
        ],
      },
      matComponent: {
        acceptReporters: true,
        items: ["偏移", "旋转"],
      },
      vectorTransforms: {
        acceptReporters: false,
        items: [
          "投影（Scratch单位）",
          "投影",
          "视图空间",
          "世界空间",
          "模型空间",
        ],
      },
      vectorTransformsMin1: {
        acceptReporters: false,
        items: ["投影", "视图空间", "世界空间", "模型空间"],
      },
      vectorTransformsMin2: {
        acceptReporters: false,
        items: ["视图空间", "世界空间", "模型空间"],
      },
      fogSpace: {
        acceptReporters: false,
        items: ["视图空间", "世界空间", "模型空间"],
      },
      renderTargetProp: {
        acceptReporters: false,
        items: ["宽度", "高度"],
      },
      filetype: {
        acceptReporters: false,
        items: ["obj mtl", "off"],
      },
      globalColor: {
        acceptReporters: false,
        items: ["乘法器", "加法器"],
      },
      alphaTestMode: {
        acceptReporters: false,
        items: [
          { text: "保留透明度", value: "false" },
          { text: "设为不透明", value: "true" },
        ],
      },
      instanceProperty: {
        acceptReporters: false,
        items: [
          "变换",
          "XY坐标",
          "XYZ坐标",
          "XYZ坐标与尺寸",
          "RGB颜色",
          "RGBA颜色",
          "UV偏移",
          "UV偏移与尺寸",
        ],
      },
      interleavedProperty: {
        acceptReporters: false,
        items: [
          "XY坐标",
          "XYZ坐标",
          "RGB颜色",
          "RGBA颜色",
          "UV纹理坐标",
          "UVW纹理坐标",
        ],
      },
      renderTargetProperty: {
        acceptReporters: false,
        items: [
          "网格名称",
          "宽度",
          "高度",
          "宽高比",
          "深度测试",
          "深度写入",
          "有深度缓冲区",
          "图像（Data URI格式）",
          "可绘制有效状态",
          "有视口框",
          "有裁剪框",
          "有回读框",
        ],
      },
      powersOfTwo: {
        acceptReporters: true,
        items: ["1", "2", "4", "8", "16"],
      },
      depthTest: {
        acceptReporters: true,
        items: Object.keys(DepthTests),
      },
      directions: {
        acceptReporters: true,
        items: ["上", "下", "左", "右", "x步长"],
      },
      bufferUsage: {
        acceptReporters: true,
        items: ["极少更新", "频繁全量更新", "频繁部分更新"],
      },
      multiSampleInterpolation: {
        acceptReporters: true,
        items: [
          "在像素中心采样一次",
          "在覆盖样本中点采样一次",
          "对每个样本分别采样",
        ],
      },
      boxType: {
        acceptReporters: false,
        items: ["视口框", "裁剪框", "回读框"],
      },
    },
  };

  class Extension {
    getInfo() {
      definitions.find(
        (b) => b.opcode == "matStartWithExternal"
      ).hideFromPalette = Object.keys(externalTransforms).length == 0;
      return extInfo;
    }
    dispose() {
      resetEverything();
      removeSimple3DLayer();
      modelDecoder.destroy();
      runtime.removeListener("PROJECT_LOADED", resetEverything);
      canvas = null;
      gl = null;
      const noop = () => {};
      for (let block of definitions) {
        if (block == "---") continue;
        Extension.prototype[block.opcode ?? block.func] = noop;
      }
    }
    fontsMenu() {
      const defaultFonts = [
        "无衬线字体",
        "衬线字体",
        "手写体",
        "标记体",
        "卷曲体",
        "像素体",
        "Scratch默认字体",
      ];
      // Based on https://github.com/TurboWarp/extensions/blob/a6f5944f52163792780ae550fbf2822ce425714d/extensions/lab/text.js#L1198-L1205
      const customFonts = runtime.fontManager
        ? runtime.fontManager.getFonts().map((i) => ({
            text: i.name,
            value: i.family,
          }))
        : [];
      return [...defaultFonts, ...customFonts];
    }
    listsMenu() {
      const stage = vm.runtime.getTargetForStage();
      const editingTarget =
        vm.editingTarget !== stage ? vm.editingTarget : null;
      const local = editingTarget
        ? Object.values(editingTarget.variables)
            .filter((v) => v.type == "list")
            .map((v) => v.name)
        : [];
      const global = stage
        ? Object.values(stage.variables)
            .filter((v) => v.type == "list")
            .map((v) => v.name)
        : [];
      const all = [...local, ...global];
      all.sort();
      if (all.length == 0) return ["列表"];
      return all;
    }
    costumesMenu() {
      let editingTarget = vm.editingTarget;
      if (editingTarget) return editingTarget.getCostumes().map((e) => e.name);
      return ["造型1"];
    }
    externalTransformsMenu() {
      const out = [];
      for (let key in externalTransforms) {
        out.push({
          value: key,
          text: externalTransforms[key].name,
        });
      }
      if (out.length == 0)
        out.push({ value: "", text: "- 无外部源 -" });
      return out;
    }
  }

  for (let block of definitions) {
    if (block == "---") continue;
    Extension.prototype[block.opcode ?? block.func] = block.def;
  }

  // WebGL call logger for debugging.
  // Add 1 extra slash to the line below to enable
  /*
  const ogl = gl;
  gl = {}
  for(let i in ogl) {
    if(typeof ogl[i] == "function") {
      gl[i] = function(...args) {
        let res = ogl[i](...args);
        if(res === undefined) {
          console.log("gl."+i+"(",...args,")");
        } else {
          console.log("gl."+i+"(",...args,") =>",res);
        }
        return res;
      }
    }
    if(typeof ogl[i] == "number") {
      gl[i] = ogl[i];
    }
  }
  gl.__proto__ = ogl; //*/

  publicApi.i_will_not_ask_for_help_when_these_break = () => {
    console.warn(
      "警告：你正在访问简易3D的内部接口。这些接口可能会频繁变更，且不保证向后兼容性。当你的代码因此失效时，请勿寻求帮助。\n\n稳定的正式API将在后续添加。"
    );
    return {
      canvas,
      gl,
      definitions,
      meshes,
      programs,
      modelDecoder,
      uploadBuffer,
      getFshSrc: () => fshSrc,
      setFshSrc: (src) => {
        fshSrc = src;
      },
      getVshSrc: () => vshSrc,
      setVshSrc: (src) => {
        vshSrc = src;
      },
      canvasRenderTarget,
      resetEverything,
      getTransforms: () => transforms,
      setTransforms: (t) => {
        transforms = t;
      },
      getSelectedTransform: () => selectedTransform,
      setSelectedTransform: (t) => {
        selectedTransform = t;
      },
      getWorkerSrc: () => workerSrc,
      setWorkerSrc: (src) => {
        workerSrc = src;
      },
      extInfo,
      Extension,
      Blendings,
    };
  };

  Scratch.extensions.register(new Extension());
})(Scratch);
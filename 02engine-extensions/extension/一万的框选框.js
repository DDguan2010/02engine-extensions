//B站10000why制作，禁止声称自己是这个扩展的原创，可以二创。
(function (Scratch) {
  'use strict';
  if (!(Scratch && Scratch.extensions && Scratch.extensions.register)) {
    throw new Error('请在 TurboWarp 扩展环境中加载。');
  }

  const A = Scratch.ArgumentType;
  const B = Scratch.BlockType;

  // 舞台逻辑尺寸（Scratch 坐标）
  const STAGE_W = 480;
  const STAGE_H = 360;

  // ====== VM/Renderer 获取 ======
  const getVM = () => Scratch.vm || (Scratch.runtime && Scratch.runtime.vm);
  const getRuntime = () => (getVM() && getVM().runtime) || null;
  const getRenderer = () => (getRuntime() && getRuntime().renderer) || null;
  const getStageCanvas = () => (getRenderer() && getRenderer().canvas) || null;
  function getStageHost() {
    const c = getStageCanvas();
    if (!c) return null;
    const host = c.parentElement || c;
    host.style.position ||= 'relative';
    return host;
  }

  // ====== 舞台缩放因子 ======
  // 返回：每“舞台像素”对应的屏幕像素（x 方向），4:3 保证 x≈y
  function getStageScale() {
    const c = getStageCanvas();
    if (!c) return 1;
    const r = c.getBoundingClientRect();
    return r.width / STAGE_W; // 同时也适用于 dash / stroke 等像素量
  }

  // ====== 坐标换算 ======
  function screenToStage(clientX, clientY) {
    const c = getStageCanvas();
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return { x: nx * STAGE_W - STAGE_W / 2, y: STAGE_H / 2 - ny * STAGE_H };
  }
  function stageToPagePixels(x, y) {
    const c = getStageCanvas();
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    return {
      x: (x + STAGE_W / 2) / STAGE_W * rect.width + rect.left,
      y: (STAGE_H / 2 - y) / STAGE_H * rect.height + rect.top
    };
  }
  function normRect(x1, y1, x2, y2) {
    const left = Math.min(x1, x2), right = Math.max(x1, x2);
    const bottom = Math.min(y1, y2), top = Math.max(y1, y2);
    return { left, right, top, bottom, width: right - left, height: top - bottom };
  }

  // ====== 颜色工具 ======
  function hexToRGB(hex) {
    let h = String(hex || '').trim();
    if (h.startsWith('#')) h = h.slice(1);
    if (h.length === 3) return {
      r: parseInt(h[0]+h[0], 16), g: parseInt(h[1]+h[1], 16), b: parseInt(h[2]+h[2], 16)
    };
    if (h.length >= 6) return {
      r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16)
    };
    return { r: 0, g: 170, b: 255 };
  }

  // ====== 覆盖层（SVG 渲染） ======
  let overlay, svgEl, rectEl;
  let overlayActive = false;
  let isDragging = false;
  let dragStart = null, dragEnd = null;
  let lastRect = null;
  const selection = new Set();

  // 样式“基值”单位解释：
  // - strokeWidthBase：以“舞台像素”为单位（与坐标同标度），渲染时乘以 getStageScale()
  // - dashLenBase / dashGapBase：同上，以“舞台像素”为单位
  // 这样当舞台缩放时，线宽/虚线分段会同比例缩放，视觉效果稳定
  const styleState = {
    strokeColor: '#00aaff',
    fillColor: '#00aaff',
    strokeAlpha: 0.1, // 0=不透明，1=完全透明（越高越透明）
    fillAlpha: 0.8,   // 同上
    strokeWidthBase: 2, // 舞台像素
    dashLenBase: 0,     // 0=实线（单位：舞台像素）
    dashGapBase: 0,
    cornerBase: 4       // 圆角（舞台像素）
  };

  function ensureOverlay() {
    const host = getStageHost();
    if (!host) return;
    if (!overlay) {
      overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none'
      });
      host.appendChild(overlay);

      svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');
      Object.assign(svgEl.style, {
        position: 'absolute', left: 0, top: 0, display: 'block', pointerEvents: 'none'
      });
      overlay.appendChild(svgEl);

      rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectEl.style.display = 'none';
      svgEl.appendChild(rectEl);

      const ro = new ResizeObserver(() => redraw());
      ro.observe(host);
      window.addEventListener('resize', redraw);
      document.addEventListener('fullscreenchange', redraw);
    }
  }

  function applyStyleToRect() {
    if (!rectEl) return;
    const scale = getStageScale();
    const sRGB = hexToRGB(styleState.strokeColor);
    const fRGB = hexToRGB(styleState.fillColor);

    rectEl.setAttribute('stroke', `rgb(${sRGB.r},${sRGB.g},${sRGB.b})`);
    rectEl.setAttribute('fill', `rgb(${fRGB.r},${fRGB.g},${fRGB.b})`);
    rectEl.setAttribute('stroke-opacity', String(1 - Math.max(0, Math.min(1, styleState.strokeAlpha))));
    rectEl.setAttribute('fill-opacity', String(1 - Math.max(0, Math.min(1, styleState.fillAlpha))));
    rectEl.setAttribute('stroke-width', String(Math.max(0, styleState.strokeWidthBase * scale)));
    rectEl.setAttribute('rx', String(Math.max(0, styleState.cornerBase * scale)));
    rectEl.setAttribute('ry', String(Math.max(0, styleState.cornerBase * scale)));

    const dashLenPx = Math.max(0, styleState.dashLenBase * scale);
    const dashGapPx = Math.max(0, styleState.dashGapBase * scale);
    if (dashLenPx > 0 || dashGapPx > 0) {
      rectEl.setAttribute('stroke-dasharray', `${dashLenPx} ${dashGapPx}`);
    } else {
      rectEl.removeAttribute('stroke-dasharray');
    }
  }

  function drawBox(rect) {
    ensureOverlay();
    if (!overlay || !svgEl || !rectEl || !rect) return;
    const host = getStageHost();
    const canvas = getStageCanvas();
    if (!host || !canvas) return;

    const hostRect = host.getBoundingClientRect();
    const p1 = stageToPagePixels(rect.left, rect.top);
    const p2 = stageToPagePixels(rect.right, rect.bottom);

    const left = Math.min(p1.x, p2.x) - hostRect.left;
    const top = Math.min(p1.y, p2.y) - hostRect.top;
    const width = Math.abs(p2.x - p1.x);
    const height = Math.abs(p2.y - p1.y);

    rectEl.setAttribute('x', String(left));
    rectEl.setAttribute('y', String(top));
    rectEl.setAttribute('width', String(width));
    rectEl.setAttribute('height', String(height));
    applyStyleToRect();
    rectEl.style.display = (width > 1 && height > 1) ? 'block' : 'none';
  }
  function hideBox() { if (rectEl) rectEl.style.display = 'none'; }
  function redraw() { if (lastRect) drawBox(lastRect); }

  function refreshSelection(rect) {
    selection.clear();
    if (!rect) return;
    const rt = getRuntime();
    if (!rt) return;
    for (const tgt of rt.targets) {
      if (!tgt || tgt.isStage) continue;
      const b = tgt.getBounds && tgt.getBounds();
      if (!b) continue;
      const hit = !(b.right < rect.left || b.left > rect.right || b.top < rect.bottom || b.bottom > rect.top);
      if (hit) selection.add(tgt.getName ? tgt.getName() : (tgt.sprite && tgt.sprite.name));
    }
  }
  function allSpriteNames() {
    const rt = getRuntime();
    if (!rt) return ['无角色'];
    const arr = [];
    for (const t of rt.targets) if (t && !t.isStage) arr.push(t.getName ? t.getName() : (t.sprite && t.sprite.name));
    return arr.length ? arr : ['无角色'];
  }

  function attachMouseHandlers() {
    const host = getStageHost();
    const canvas = getStageCanvas();
    if (!host || !canvas || host._marquee_bound) return;

    const onDown = e => {
      if (!overlayActive || e.button !== 0) return;
      const { x, y } = screenToStage(e.clientX, e.clientY);
      isDragging = true;
      dragStart = { x, y };
      dragEnd = { x, y };
      lastRect = normRect(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
      drawBox(lastRect);
      e.preventDefault();
    };
    const onMove = e => {
      if (!overlayActive || !isDragging) return;
      const { x, y } = screenToStage(e.clientX, e.clientY);
      dragEnd = { x, y };
      lastRect = normRect(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
      drawBox(lastRect);
      refreshSelection(lastRect);
      e.preventDefault();
    };
    const onUp = () => { if (overlayActive) isDragging = false; };

    host.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    host._marquee_bound = true;
  }

  const LABEL = B.LABEL || 'label';

  class MarqueeSelectExtension {
    getInfo() {
      return {
        id: 'marqueeSelectCN',
        name: '一万的框选框',
        color1: '#1f7aff',
        color2: '#0d5ad8',
        blocks: [

          { blockType: LABEL, text: '创建框选框' },
          { opcode: 'enableMouseMarquee', blockType: B.COMMAND, text: '启用鼠标框选 [ONOFF]', arguments: { ONOFF: { type: A.STRING, menu: 'onoff', defaultValue: '开' } } },
          { opcode: 'createBoxAt', blockType: B.COMMAND, text: '创建框选框 x [X] y [Y] 宽 [W] 高 [H]', arguments: { X: { type: A.NUMBER, defaultValue: -100 }, Y: { type: A.NUMBER, defaultValue: 80 }, W: { type: A.NUMBER, defaultValue: 200 }, H: { type: A.NUMBER, defaultValue: 160 } } },
          { opcode: 'clearSelection', blockType: B.COMMAND, text: '清除框选' },

          { blockType: LABEL, text: '框选判断' },
          { opcode: 'isSelecting', blockType: B.BOOLEAN, text: '正在框选？' },
          { opcode: 'isSelected', blockType: B.BOOLEAN, text: '框选到 [TARGET] ？', arguments: { TARGET: { type: A.STRING, menu: 'sprites' } } },
          { opcode: 'selectedList', blockType: B.REPORTER, text: '框选到的角色' },

          { blockType: LABEL, text: '样式调整' },
          { opcode: 'setStrokeColor', blockType: B.COMMAND, text: '设置边线颜色为 [C]', arguments: { C: { type: A.COLOR, defaultValue: '#00aaff' } } },
          { opcode: 'setFillColor', blockType: B.COMMAND, text: '设置内部颜色为 [C]', arguments: { C: { type: A.COLOR, defaultValue: '#00aaff' } } },
          { opcode: 'setStrokeAlpha', blockType: B.COMMAND, text: '设置边线透明度 [A]%', arguments: { A: { type: A.NUMBER, defaultValue: 10 } } },
          { opcode: 'setFillAlpha', blockType: B.COMMAND, text: '设置内部透明度 [A]%', arguments: { A: { type: A.NUMBER, defaultValue: 80 } } },
          { opcode: 'setStrokeWidth', blockType: B.COMMAND, text: '设置边框宽度 [W]', arguments: { W: { type: A.NUMBER, defaultValue: 2 } } },
          { opcode: 'setStrokeDash', blockType: B.COMMAND, text: '设置虚线 段长 [LEN] 间隔 [GAP]', arguments: { LEN: { type: A.NUMBER, defaultValue: 0 }, GAP: { type: A.NUMBER, defaultValue: 0 } } },
          { opcode: 'setCorner', blockType: B.COMMAND, text: '设置圆角半径 [R]', arguments: { R: { type: A.NUMBER, defaultValue: 4 } } },
        ],
        menus: {
          sprites: { acceptReporters: true, items: 'menuSprites' },
          onoff: { acceptReporters: false, items: [{ text: '开', value: '开' }, { text: '关', value: '关' }] }
        }
      };
    }

    // 菜单
    menuSprites() { return allSpriteNames().map(n => ({ text: n, value: n })); }

    // 启用/创建
    enableMouseMarquee(a) {
      ensureOverlay(); attachMouseHandlers();
      overlayActive = String(a.ONOFF || '开') === '开';
      if (!overlayActive) { isDragging = false; dragStart = dragEnd = null; hideBox(); }
      else redraw();
    }
    createBoxAt(a) {
      ensureOverlay(); attachMouseHandlers();
      const X = Number(a.X || 0), Y = Number(a.Y || 0);
      const W = Number(a.W || 0), H = Number(a.H || 0);
      lastRect = normRect(X, Y, X + W, Y + H);
      drawBox(lastRect);
      refreshSelection(lastRect);
    }
    clearSelection() { selection.clear(); lastRect = null; hideBox(); }

    // 查询
    isSelecting() { ensureOverlay(); return isDragging; }
    isSelected(a) { ensureOverlay(); if (lastRect) refreshSelection(lastRect); return selection.has(String(a.TARGET || '')); }
    selectedList() { ensureOverlay(); if (lastRect) refreshSelection(lastRect); return Array.from(selection); }

    setStrokeColor(a){ ensureOverlay(); styleState.strokeColor = a.C || '#00aaff'; applyStyleToRect(); redraw(); }
    setFillColor(a){ ensureOverlay(); styleState.fillColor = a.C || '#00aaff'; applyStyleToRect(); redraw(); }
    setStrokeAlpha(a){ ensureOverlay(); styleState.strokeAlpha = Math.max(0, Math.min(1, Number(a.A||0)/100)); applyStyleToRect(); redraw(); }
    setFillAlpha(a){ ensureOverlay(); styleState.fillAlpha = Math.max(0, Math.min(1, Number(a.A||0)/100)); applyStyleToRect(); redraw(); }
    setStrokeWidth(a){ ensureOverlay(); styleState.strokeWidthBase = Math.max(0, Number(a.W||0)); applyStyleToRect(); redraw(); }
    setStrokeDash(a){
      ensureOverlay();
      styleState.dashLenBase = Math.max(0, Number(a.LEN||0));
      styleState.dashGapBase = Math.max(0, Number(a.GAP||0));
      applyStyleToRect(); redraw();
    }
    setCorner(a){ ensureOverlay(); styleState.cornerBase = Math.max(0, Number(a.R||0)); applyStyleToRect(); redraw(); }
  }

  ensureOverlay();
  attachMouseHandlers();
  Scratch.extensions.register(new MarqueeSelectExtension());
})(Scratch);
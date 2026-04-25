(function (Scratch) {
  "use strict";

  const EXT_ID = "astarPathfindingTW";

  const clampInt = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? (n | 0) : def;
  };
  const toKey = (x, y) => `${x},${y}`;
  const manhattan = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);

  // --- 高效优先队列 (基于 TypedArray 的 SoA 结构优化) ---
  class FastMinHeap {
    constructor(capacity = 1024) {
      this.capacity = capacity;
      this.size = 0;
      this.f = new Float64Array(capacity);
      this.i = new Int32Array(capacity);
      this.x = new Int16Array(capacity);
      this.y = new Int16Array(capacity);
    }

    clear() {
      this.size = 0;
    }

    _resize() {
      const newCap = this.capacity * 2;
      const nf = new Float64Array(newCap);
      const ni = new Int32Array(newCap);
      const nx = new Int16Array(newCap);
      const ny = new Int16Array(newCap);

      nf.set(this.f);
      ni.set(this.i);
      nx.set(this.x);
      ny.set(this.y);

      this.f = nf;
      this.i = ni;
      this.x = nx;
      this.y = ny;
      this.capacity = newCap;
    }

    push(cost, idx, tx, ty) {
      if (this.size >= this.capacity) {
        this._resize();
      }

      let i = this.size;
      this.size++;

      const fArr = this.f;
      const iArr = this.i;
      const xArr = this.x;
      const yArr = this.y;

      while (i > 0) {
        const p = (i - 1) >> 1;
        if (fArr[p] <= cost) break;

        fArr[i] = fArr[p];
        iArr[i] = iArr[p];
        xArr[i] = xArr[p];
        yArr[i] = yArr[p];

        i = p;
      }

      fArr[i] = cost;
      iArr[i] = idx;
      xArr[i] = tx;
      yArr[i] = ty;
    }

    pop() {
      if (this.size === 0) return null;

      const fArr = this.f;
      const iArr = this.i;
      const xArr = this.x;
      const yArr = this.y;

      const ret = { f: fArr[0], i: iArr[0], x: xArr[0], y: yArr[0] };

      this.size--;
      const lastF = fArr[this.size];
      const lastI = iArr[this.size];
      const lastX = xArr[this.size];
      const lastY = yArr[this.size];

      if (this.size > 0) {
        let i = 0;
        const len = this.size;

        while (true) {
          const l = (i << 1) + 1;
          const r = l + 1;
          let m = i;

          if (l < len && fArr[l] < fArr[m]) m = l;
          if (r < len && fArr[r] < fArr[m]) m = r;

          if (m === i) break;

          fArr[i] = fArr[m];
          iArr[i] = iArr[m];
          xArr[i] = xArr[m];
          yArr[i] = yArr[m];

          i = m;
        }

        fArr[i] = lastF;
        iArr[i] = lastI;
        xArr[i] = lastX;
        yArr[i] = lastY;
      }

      return ret;
    }

    length() {
      return this.size;
    }
  }

  // --- 寻路核心引擎 ---
  class PathEngine {
    constructor(grid, W, H) {
      this.grid = grid;
      this.W = W;
      this.H = H;
      this.size = W * H;

      this.g = new Int32Array(this.size);
      this.parent = new Int32Array(this.size);

      this.gB = new Int32Array(this.size);
      this.parentB = new Int32Array(this.size);

      this.visitedStamp = new Int32Array(this.size);
      this.currStamp = 0;

      this.open = new FastMinHeap();
      this.openB = new FastMinHeap();

      this.active = false;
      this.done = false;
      this.found = false;
      this.pathRes = "";
      this.expanded = 0;
      this.progressText = "0%";

      this.mode = "astar";
      this.weight = 1.0;
    }

    _idx(x, y) {
      return y * this.W + x;
    }

    _isWalk(x, y) {
      return x >= 0 && y >= 0 && x < this.W && y < this.H && this.grid[y * this.W + x] === 0;
    }

    _inBounds(x, y) {
      return x >= 0 && y >= 0 && x < this.W && y < this.H;
    }

    _newRun(mode, weight) {
      this.mode = mode;
      this.weight = weight;

      this.currStamp++;
      if (this.currStamp >= 0x3FFFFFFF) {
        this.currStamp = 1;
        this.visitedStamp.fill(0);
      }

      this.open.clear();
      this.openB.clear();
      this.active = true;
      this.done = false;
      this.found = false;
      this.pathRes = "";
      this.expanded = 0;
    }

    // 修复：支持真正根据 pathAlgo 切换路径算法
    initSearch(sx, sy, tx, ty, algoStr, pathAlgo) {
      let mode = "astar";
      let w = 1.0;

      const pAlgo = String(pathAlgo || "astar").toLowerCase();

      switch (String(algoStr || "balanced")) {
        case "fast":
          mode = "astar";
          w = 1.5;
          break;
        case "greedy_fast":
          mode = "astar";
          w = 5.0;
          break;
        case "bidirectional_fast":
          mode = "bidir";
          w = 1.5;
          break;
        case "accurate":
          mode = "astar";
          w = 1.0;
          break;
        default:
          mode = "astar";
          w = 1.0;
          break;
      }

      // 若路径算法指定为 jps，则优先切换到 jps
      if (pAlgo === "jps") {
        mode = "jps";
        w = 1.0;
      } else if (pAlgo === "astar") {
        // 保持上面由 algoStr 决定的 astar / bidir / weighted astar
      }

      this._newRun(mode, w);

      if (!this._isWalk(sx, sy) || !this._isWalk(tx, ty)) {
        this.done = true;
        return;
      }
      if (sx === tx && sy === ty) {
        this.done = true;
        this.found = true;
        return;
      }

      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;

      const sIdx = this._idx(sx, sy);

      const vVal = this.currStamp * 4;
      this.visitedBase = vVal;

      this.visitedStamp[sIdx] = vVal + 1;
      this.g[sIdx] = 0;
      this.parent[sIdx] = -1;

      this.open.push(manhattan(sx, sy, tx, ty) * w, sIdx, sx, sy);

      if (mode === "bidir") {
        const tIdx = this._idx(tx, ty);
        this.visitedStamp[tIdx] = vVal + 2;
        this.gB[tIdx] = 0;
        this.parentB[tIdx] = -1;
        this.openB.push(manhattan(tx, ty, sx, sy) * w, tIdx, tx, ty);
      }
    }

    runBFSOnlyDist(sx, sy, targetIndicesSet) {
      this.currStamp++;
      if (this.currStamp >= 0x3FFFFFFF) {
        this.currStamp = 1;
        this.visitedStamp.fill(0);
      }
      const vVal = this.currStamp * 4;

      const q = [this._idx(sx, sy)];
      const dists = new Map();
      const sIdx = this._idx(sx, sy);

      this.visitedStamp[sIdx] = vVal + 1;
      this.g[sIdx] = 0;

      if (targetIndicesSet.has(sIdx)) dists.set(sIdx, 0);

      let head = 0;
      let targetsFound = 0;
      const targetCount = targetIndicesSet.size;
      const W = this.W;
      const H = this.H;
      const grid = this.grid;
      const visited = this.visitedStamp;
      const g = this.g;

      while (head < q.length) {
        const u = q[head++];
        const d = g[u];

        const cx = u % W;
        const cy = (u / W) | 0;

        if (cy > 0) {
          const v = u - W;
          if (visited[v] < vVal && grid[v] === 0) {
            visited[v] = vVal + 1;
            g[v] = d + 1;
            q.push(v);
            if (targetIndicesSet.has(v)) {
              dists.set(v, d + 1);
              targetsFound++;
            }
          }
        }
        if (cy < H - 1) {
          const v = u + W;
          if (visited[v] < vVal && grid[v] === 0) {
            visited[v] = vVal + 1;
            g[v] = d + 1;
            q.push(v);
            if (targetIndicesSet.has(v)) {
              dists.set(v, d + 1);
              targetsFound++;
            }
          }
        }
        if (cx > 0) {
          const v = u - 1;
          if (visited[v] < vVal && grid[v] === 0) {
            visited[v] = vVal + 1;
            g[v] = d + 1;
            q.push(v);
            if (targetIndicesSet.has(v)) {
              dists.set(v, d + 1);
              targetsFound++;
            }
          }
        }
        if (cx < W - 1) {
          const v = u + 1;
          if (visited[v] < vVal && grid[v] === 0) {
            visited[v] = vVal + 1;
            g[v] = d + 1;
            q.push(v);
            if (targetIndicesSet.has(v)) {
              dists.set(v, d + 1);
              targetsFound++;
            }
          }
        }

        if (targetsFound === targetCount) break;
      }
      return dists;
    }

    step(iterBudget) {
      if (this.mode === "bidir") this._stepBiDir(iterBudget);
      else if (this.mode === "jps") this._stepJPS(iterBudget);
      else this._stepAStar(iterBudget);
    }

    _stepAStar(iterBudget) {
      let iters = iterBudget;
      const W = this.W,
        H = this.H;
      const tx = this.tx,
        ty = this.ty;
      const weight = this.weight;
      const vVal = this.visitedBase;
      const grid = this.grid;
      const visited = this.visitedStamp;
      const g = this.g;
      const parent = this.parent;
      const open = this.open;

      const dxs = [0, 0, -1, 1];
      const dys = [-1, 1, 0, 0];

      while (iters-- > 0) {
        const node = open.pop();
        if (!node) {
          this.done = true;
          this.found = false;
          this.progressText = "100%";
          return;
        }

        const u = node.i;
        const ux = node.x;
        const uy = node.y;

        if (g[u] < node.f - manhattan(ux, uy, tx, ty) * weight - 0.0001) {
          continue;
        }

        if (ux === tx && uy === ty) {
          this.done = true;
          this.found = true;
          this.progressText = "100%";
          this.pathRes = this._reconstruct(u);
          return;
        }

        this.expanded++;
        const baseG = g[u];

        for (let k = 0; k < 4; k++) {
          const nx = ux + dxs[k];
          const ny = uy + dys[k];

          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const v = ny * W + nx;
          if (grid[v] !== 0) continue;

          const newG = baseG + 1;

          if (visited[v] < vVal || newG < g[v]) {
            visited[v] = vVal + 1;
            g[v] = newG;
            parent[v] = u;
            const h = Math.abs(nx - tx) + Math.abs(ny - ty);
            open.push(newG + h * weight, v, nx, ny);
          }
        }
      }
      this._updateProgress();
    }

    _stepBiDir(iterBudget) {
      let iters = iterBudget;
      const weight = this.weight;
      const vVal = this.visitedBase;
      const W = this.W,
        H = this.H;
      const grid = this.grid;

      const dxs = [0, 0, -1, 1];
      const dys = [-1, 1, 0, 0];

      while (iters-- > 0) {
        let expandFwd = true;

        if (this.open.length() === 0 && this.openB.length() === 0) {
          this.done = true;
          this.found = false;
          return;
        }

        if (this.openB.length() > 0) {
          if (this.open.length() === 0) expandFwd = false;
          else if (this.open.length() > this.openB.length()) expandFwd = false;
        }

        let currentOpen, currentG, currentParent, currentFlag, targetFlag;
        let targetX, targetY;

        if (expandFwd) {
          currentOpen = this.open;
          currentG = this.g;
          currentParent = this.parent;
          currentFlag = 1;
          targetFlag = 2;
          targetX = this.tx;
          targetY = this.ty;
        } else {
          currentOpen = this.openB;
          currentG = this.gB;
          currentParent = this.parentB;
          currentFlag = 2;
          targetFlag = 1;
          targetX = this.sx;
          targetY = this.sy;
        }

        const node = currentOpen.pop();
        if (!node) continue;
        const u = node.i;
        const ux = node.x;
        const uy = node.y;

        const status = this.visitedStamp[u];
        if (status >= vVal && ((status - vVal) & targetFlag)) {
          this.done = true;
          this.found = true;
          this.progressText = "100%";
          this.pathRes = this._reconstructBiDir(u);
          return;
        }

        this.visitedStamp[u] = vVal + ((status >= vVal) ? ((status - vVal) | currentFlag) : currentFlag);
        this.expanded++;

        const baseG = currentG[u];

        for (let k = 0; k < 4; k++) {
          const nx = ux + dxs[k];
          const ny = uy + dys[k];

          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const v = ny * W + nx;
          if (grid[v] !== 0) continue;

          const newG = baseG + 1;
          const vStatus = this.visitedStamp[v];
          const visitedByMe = vStatus >= vVal && ((vStatus - vVal) & currentFlag);

          if (!visitedByMe || newG < currentG[v]) {
            const newFlag = vStatus >= vVal ? ((vStatus - vVal) | currentFlag) : currentFlag;
            this.visitedStamp[v] = vVal + newFlag;

            currentG[v] = newG;
            currentParent[v] = u;

            const h = Math.abs(nx - targetX) + Math.abs(ny - targetY);

            currentOpen.push(newG + h * weight, v, nx, ny);

            if (vStatus >= vVal && ((vStatus - vVal) & targetFlag)) {
              this.done = true;
              this.found = true;
              this.progressText = "100%";
              this.pathRes = this._reconstructBiDir(v);
              return;
            }
          }
        }
      }
      this._updateProgress();
    }

    _stepJPS(iterBudget) {
      let iters = iterBudget;
      const W = this.W;
      const tx = this.tx,
        ty = this.ty;
      const vVal = this.visitedBase;
      const visited = this.visitedStamp;
      const g = this.g;
      const parent = this.parent;
      const open = this.open;

      while (iters-- > 0) {
        const node = open.pop();
        if (!node) {
          this.done = true;
          this.found = false;
          return;
        }
        const u = node.i;
        const ux = node.x;
        const uy = node.y;

        if (ux === tx && uy === ty) {
          this.done = true;
          this.found = true;
          this.progressText = "100%";
          this.pathRes = this._reconstruct(u);
          return;
        }

        const dirs = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 }
        ];
        this.expanded++;

        for (let i = 0; i < 4; i++) {
          const dir = dirs[i];
          const jumpPoint = this._jump(ux, uy, dir.x, dir.y);

          if (jumpPoint) {
            const jx = jumpPoint.x;
            const jy = jumpPoint.y;
            const v = jy * W + jx;
            const dist = Math.abs(jx - ux) + Math.abs(jy - uy);
            const newG = g[u] + dist;

            if (visited[v] < vVal || newG < g[v]) {
              visited[v] = vVal + 1;
              g[v] = newG;
              parent[v] = u;
              const h = Math.abs(jx - tx) + Math.abs(jy - ty);
              open.push(newG + h, v, jx, jy);
            }
          }
        }
        this._updateProgress();
      }
    }

    _jump(cx, cy, dx, dy) {
      const tx = this.tx,
        ty = this.ty;
      const W = this.W,
        H = this.H;
      const grid = this.grid;

      let nx = cx;
      let ny = cy;

      while (true) {
        nx += dx;
        ny += dy;

        if (nx < 0 || ny < 0 || nx >= W || ny >= H) return null;
        if (grid[ny * W + nx] !== 0) return null;

        if (nx === tx && ny === ty) return { x: nx, y: ny };

        if (dx !== 0) {
          if (
            (ny > 0 &&
              grid[(ny - 1) * W + nx] !== 0 &&
              nx - dx >= 0 &&
              nx - dx < W &&
              grid[(ny - 1) * W + (nx - dx)] === 0) ||
            (ny < H - 1 &&
              grid[(ny + 1) * W + nx] !== 0 &&
              nx - dx >= 0 &&
              nx - dx < W &&
              grid[(ny + 1) * W + (nx - dx)] === 0)
          ) {
            return { x: nx, y: ny };
          }
        } else {
          if (
            (nx > 0 &&
              grid[ny * W + (nx - 1)] !== 0 &&
              ny - dy >= 0 &&
              ny - dy < H &&
              grid[(ny - dy) * W + (nx - 1)] === 0) ||
            (nx < W - 1 &&
              grid[ny * W + (nx + 1)] !== 0 &&
              ny - dy >= 0 &&
              ny - dy < H &&
              grid[(ny - dy) * W + (nx + 1)] === 0)
          ) {
            return { x: nx, y: ny };
          }
        }
      }
    }

    _updateProgress() {
      const ratio = this.expanded / (this.expanded + this.open.length() + this.openB.length() + 1);
      this.progressText = `${(ratio * 100).toFixed(0)}%`;
    }

    _reconstruct(endIdx) {
      let cur = endIdx;
      const res = [];
      const W = this.W;
      const parent = this.parent;

      while (true) {
        const p = parent[cur];
        if (p === -1) break;

        const cx = cur % W;
        const cy = (cur / W) | 0;
        const px = p % W;
        const py = (p / W) | 0;

        const dx = Math.sign(cx - px);
        const dy = Math.sign(cy - py);

        let dist = Math.abs(cx - px) + Math.abs(cy - py);
        let ix = cx,
          iy = cy;

        for (let k = 0; k < dist; k++) {
          if (ix === px && iy === py) break;
          if (ix !== px) {
            res.push(dx > 0 ? "d" : "a");
            ix -= dx;
          } else {
            res.push(dy > 0 ? "s" : "w");
            iy -= dy;
          }
        }
        cur = p;
      }
      return res.reverse().join("");
    }

    _reconstructBiDir(meetIdx) {
      const path1 = this._reconstruct(meetIdx);

      let cur = meetIdx;
      const res2 = [];
      const W = this.W;
      const parentB = this.parentB;

      while (true) {
        const p = parentB[cur];
        if (p === -1) break;

        const cx = cur % W;
        const cy = (cur / W) | 0;
        const px = p % W;
        const py = (p / W) | 0;

        if (px === cx && py === cy - 1) res2.push("w");
        else if (px === cx && py === cy + 1) res2.push("s");
        else if (px === cx - 1 && py === cy) res2.push("a");
        else if (px === cx + 1 && py === cy) res2.push("d");

        cur = p;
      }
      return path1 + res2.join("");
    }
  }

  // --- 扩展主逻辑 ---
  class Extension {
    constructor() {
      this.maps = new Map();
      this._activeMapName = "";
    }

    _getOrCreateMap(nameRaw) {
      const name = String(nameRaw ?? "").trim() || "default";
      let st = this.maps.get(name);
      if (!st) {
        st = {
          name,
          W: 0,
          H: 0,
          grid: null,
          sx: 0,
          sy: 0,
          tx: 0,
          ty: 0,
          waypoints: new Map(),

          kThreshold: 12,
          _sliceMs: 500,
          algo: "balanced",
          pathAlgo: "astar",

          _progress: "0%",
          _cachedKey: "",
          _cachedRoute: "",
          _cachedRoutePos: 0,

          _engine: null,
          _plan: null,
          _planKey: "",

          twoOptEnabled: true,
          twoOptMaxPasses: 4,
          twoOptNeighborhood: 0,

          _zoomScale: 1.0,
          _panX: 0,
          _panY: 0,
          _winX: 0,
          _winY: 0,

          list: [],

          _debugEl: null,
          _debugCanvas: null,
          _debugMode: "view",
          _debugTool: "wall",
          _debugPalette: null
        };
        this.maps.set(name, st);
      }
      return st;
    }

    _useMap(name) {
      const st = this._getOrCreateMap(name);
      this._activeMapName = st.name;
      return st;
    }

    _getActiveMap() {
      return this._getOrCreateMap(this._activeMapName || "default");
    }

    _getWalkable(st, x, y) {
      if (!st.grid) return false;
      const i = y * st.W + x;
      return st.grid[i] === 0;
    }

    _invalidateCache(st) {
      st._cachedKey = "";
      st._cachedRoute = "";
      st._cachedRoutePos = 0;
      st._plan = null;
      st._progress = "0%";
      st._planKey = "";
    }

    _buildKey(st) {
      const wps = Array.from(st.waypoints.values())
        .sort((a, b) => (a.y - b.y) || (a.x - b.x))
        .map((p) => `${p.x},${p.y}`)
        .join(";");
      return `${st.W}x${st.H}|S${st.sx},${st.sy}|T${st.tx},${st.ty}|K${st.kThreshold}|P${wps}|SL${st._sliceMs}|ALG${st.algo}|PATH${st.pathAlgo}|2OPT${st.twoOptEnabled ? 1 : 0}`;
    }

    _ensureEngine(st) {
      if (!st._engine || st._engine.W !== st.W || st._engine.H !== st.H) {
        st._engine = new PathEngine(st.grid, st.W, st.H);
      }
      if (st._engine.grid !== st.grid) {
        st._engine.grid = st.grid;
      }
      return st._engine;
    }

    _validateMap(st) {
      return st.W > 0 && st.H > 0 && st.grid && st.grid.length === st.W * st.H;
    }

    _twoOptImproveOrder(order, distFn, maxPasses = 4, neighborhood = 0) {
      if (!order || order.length < 4) return order;

      const n = order.length;
      const edgeCost = (a, b) => distFn(a, b);

      const trySwap = (i, k) => {
        const A = order[i - 1],
          B = order[i],
          C = order[k],
          D = order[k + 1];
        const ab = edgeCost(A, B);
        const cd = edgeCost(C, D);
        const ac = edgeCost(A, C);
        const bd = edgeCost(B, D);

        if (ab === -1 || cd === -1 || ac === -1 || bd === -1) return false;

        if (ac + bd < ab + cd) {
          for (let l = i, r = k; l < r; l++, r--) {
            const t = order[l];
            order[l] = order[r];
            order[r] = t;
          }
          return true;
        }
        return false;
      };

      for (let pass = 0; pass < maxPasses; pass++) {
        let improved = false;
        for (let i = 1; i <= n - 3; i++) {
          const kStart = i + 1;
          const kEnd = n - 2;

          if (neighborhood > 0) {
            const kkEnd = Math.min(kEnd, i + neighborhood);
            for (let k = kStart; k <= kkEnd; k++) {
              if (trySwap(i, k)) improved = true;
            }
          } else {
            for (let k = kStart; k <= kEnd; k++) {
              if (trySwap(i, k)) improved = true;
            }
          }
        }
        if (!improved) break;
      }
      return order;
    }

    _initPlanIfNeeded(st) {
      if (st._plan) return;
      if (!this._validateMap(st)) {
        st._plan = { done: true, ok: false, route: "" };
        return;
      }

      const wps = Array.from(st.waypoints.values());
      const k = wps.length;

      let mode = "greedy";
      if (st.algo === "accurate") {
        mode = "exact";
      } else if (st.algo === "balanced") {
        mode = k <= st.kThreshold ? "exact" : "greedy";
      } else {
        mode = "greedy";
      }

      const nodes = [{ x: st.sx, y: st.sy }, ...wps, { x: st.tx, y: st.ty }];
      const nNodes = nodes.length;

      st._plan = {
        mode,
        done: false,
        ok: false,
        route: "",
        nodes,
        nNodes,

        gPhase: "toWP",
        gCurIdx: 0,
        gRemaining: wps.map((_, i) => i + 1),
        gBuiltRoute: [],
        gSegActive: false,

        eStage: "bfs",
        eBfsIdx: 0,
        eDist: new Int32Array(nNodes * nNodes).fill(-1),
        eDp: null,
        ePrev: null,
        eOrder: null,
        eBuildIdx: 0
      };
    }

    _planStep(st, iterBudget) {
      this._initPlanIfNeeded(st);
      const ps = st._plan;
      if (ps.done) return;

      const eng = this._ensureEngine(st);
      const algoConfig = st.algo;
      const pathAlgo = st.pathAlgo;

      if (ps.mode === "greedy") {
        if (!ps.gSegActive) {
          let targetNodeIdx = -1;

          if (ps.gPhase === "toWP") {
            if (ps.gRemaining.length === 0) {
              ps.gPhase = "toTarget";
              targetNodeIdx = ps.nNodes - 1;
            } else {
              const cur = ps.nodes[ps.gCurIdx];
              let bestDist = Infinity;
              let bestArrIdx = -1;

              for (let i = 0; i < ps.gRemaining.length; i++) {
                const nodeIdx = ps.gRemaining[i];
                const node = ps.nodes[nodeIdx];
                const d = manhattan(cur.x, cur.y, node.x, node.y);
                if (d < bestDist) {
                  bestDist = d;
                  bestArrIdx = i;
                }
              }

              targetNodeIdx = ps.gRemaining[bestArrIdx];
              ps.gRemaining.splice(bestArrIdx, 1);
            }
          } else {
            ps.done = true;
            ps.ok = true;
            ps.route = ps.gBuiltRoute.join("");
            st._progress = "100%";
            return;
          }

          const fromNode = ps.nodes[ps.gCurIdx];
          const toNode = ps.nodes[targetNodeIdx];

          eng.initSearch(fromNode.x, fromNode.y, toNode.x, toNode.y, algoConfig, pathAlgo);
          ps.gSegActive = true;
          ps.gCurTargetIdx = targetNodeIdx;
        }

        eng.step(iterBudget);
        st._progress = `搜索 ${eng.progressText}`;

        if (eng.done) {
          ps.gSegActive = false;
          if (!eng.found) {
            ps.done = true;
            ps.ok = false;
            ps.route = "";
            st._progress = "100%";
            return;
          }
          ps.gBuiltRoute.push(eng.pathRes);
          ps.gCurIdx = ps.gCurTargetIdx;
        }
        return;
      }

      if (ps.mode === "exact") {
        if (ps.eStage === "bfs") {
          const i = ps.eBfsIdx;
          if (i >= ps.nNodes) {
            ps.eStage = "dp";
            return;
          }

          const targets = new Set();
          for (let j = 0; j < ps.nNodes; j++) {
            if (i !== j) targets.add(eng._idx(ps.nodes[j].x, ps.nodes[j].y));
          }

          const startNode = ps.nodes[i];
          const distMap = eng.runBFSOnlyDist(startNode.x, startNode.y, targets);

          for (let j = 0; j < ps.nNodes; j++) {
            if (i === j) {
              ps.eDist[i * ps.nNodes + j] = 0;
            } else {
              const tidx = eng._idx(ps.nodes[j].x, ps.nodes[j].y);
              const d = distMap.get(tidx);
              ps.eDist[i * ps.nNodes + j] = d !== undefined ? d : -1;
            }
          }

          ps.eBfsIdx++;
          const pct = (ps.eBfsIdx / ps.nNodes) * 40;
          st._progress = `预处理 ${pct.toFixed(0)}%`;
          return;
        }

        if (ps.eStage === "dp") {
          const k = ps.nNodes - 2;

          if (k === 0) {
            if (ps.eDist[0 * ps.nNodes + 1] === -1) {
              ps.done = true;
              ps.ok = false;
            } else {
              ps.eOrder = [0, 1];
              ps.eStage = "build";
            }
            return;
          }

          const fullMask = (1 << k) - 1;
          const numStates = 1 << k;

          if (!ps.eDp) {
            ps.eDp = new Int32Array(numStates * k).fill(1e9);
            ps.ePrev = new Int32Array(numStates * k).fill(-1);

            for (let i = 0; i < k; i++) {
              const dist = ps.eDist[0 * ps.nNodes + (i + 1)];
              if (dist !== -1) {
                ps.eDp[(1 << i) * k + i] = dist;
              }
            }
            ps.dpMask = 1;
          }

          const INF = 1e9;
          let transitions = iterBudget * 10;

          while (transitions-- > 0 && ps.dpMask <= fullMask) {
            const mask = ps.dpMask;

            for (let last = 0; last < k; last++) {
              if (!((mask >> last) & 1)) continue;

              const currentCost = ps.eDp[mask * k + last];
              if (currentCost >= INF) continue;

              for (let next = 0; next < k; next++) {
                if ((mask >> next) & 1) continue;

                const d = ps.eDist[(last + 1) * ps.nNodes + (next + 1)];
                if (d === -1) continue;

                const nextMask = mask | (1 << next);
                const nextCost = currentCost + d;
                const idx = nextMask * k + next;

                if (nextCost < ps.eDp[idx]) {
                  ps.eDp[idx] = nextCost;
                  ps.ePrev[idx] = last;
                }
              }
            }
            ps.dpMask++;
          }

          const dpPct = 40 + (ps.dpMask / fullMask) * 20;
          st._progress = `规划 ${dpPct.toFixed(0)}%`;

          if (ps.dpMask > fullMask) {
            let bestCost = INF;
            let bestLast = -1;

            for (let last = 0; last < k; last++) {
              const c = ps.eDp[fullMask * k + last];
              if (c >= INF) continue;
              const dToT = ps.eDist[(last + 1) * ps.nNodes + (k + 1)];
              if (dToT === -1) continue;

              if (c + dToT < bestCost) {
                bestCost = c + dToT;
                bestLast = last;
              }
            }

            if (bestLast === -1) {
              ps.done = true;
              ps.ok = false;
              return;
            }

            const order = [];
            let curr = bestLast;
            let mask = fullMask;
            while (curr !== -1) {
              order.push(curr + 1);
              const prev = ps.ePrev[mask * k + curr];
              mask = mask ^ (1 << curr);
              curr = prev;
            }
            order.reverse();
            ps.eOrder = [0, ...order, k + 1];

            if (st.twoOptEnabled && ps.eDist) {
              const nNodes = ps.nNodes;
              const distFn = (a, b) => {
                return ps.eDist[a * nNodes + b];
              };
              ps.eOrder = this._twoOptImproveOrder(
                ps.eOrder,
                distFn,
                Math.max(0, clampInt(st.twoOptMaxPasses, 4)),
                Math.max(0, clampInt(st.twoOptNeighborhood, 0))
              );
            }

            ps.eDp = null;
            ps.ePrev = null;
            ps.eDist = null;

            ps.eStage = "build";
            ps.gBuiltRoute = [];
          }
          return;
        }

        if (ps.eStage === "build") {
          if (!ps.gSegActive) {
            if (ps.eBuildIdx >= ps.eOrder.length - 1) {
              ps.done = true;
              ps.ok = true;
              ps.route = ps.gBuiltRoute.join("");
              st._progress = "100%";
              return;
            }

            const uIdx = ps.eOrder[ps.eBuildIdx];
            const vIdx = ps.eOrder[ps.eBuildIdx + 1];
            const u = ps.nodes[uIdx];
            const v = ps.nodes[vIdx];

            eng.initSearch(u.x, u.y, v.x, v.y, algoConfig, pathAlgo);
            ps.gSegActive = true;
          }

          eng.step(iterBudget);
          const segPct = 60 + (ps.eBuildIdx / (ps.eOrder.length - 1)) * 40;
          st._progress = `构建 ${segPct.toFixed(0)}%`;

          if (eng.done) {
            if (!eng.found) {
              ps.done = true;
              ps.ok = false;
              return;
            }
            ps.gBuiltRoute.push(eng.pathRes);
            ps.gSegActive = false;
            ps.eBuildIdx++;
          }
          return;
        }
      }
    }

    setMap(args) {
      const st = this._useMap(args.name);
      st.H = clampInt(args.L, 0);
      st.W = clampInt(args.W, 0);

      const rawC = String(args.C ?? "");
      const len = st.H * st.W;
      if (st.grid && st.grid.length === len) {
      } else {
        st.grid = new Uint8Array(len);
      }

      for (let i = 0; i < len; i++) {
        st.grid[i] = i < rawC.length && rawC.charCodeAt(i) === 48 ? 0 : 1;
      }

      st.waypoints.clear();
      st.list = [];
      st._zoomScale = 1.0;
      st._panX = 0;
      st._panY = 0;
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setStart(args) {
      const st = this._useMap(args.name);
      st.sx = clampInt(args.X, 0);
      st.sy = clampInt(args.Y, 0);
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setTarget(args) {
      const st = this._useMap(args.name);
      st.tx = clampInt(args.X, 0);
      st.ty = clampInt(args.Y, 0);
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    addWaypoint(args) {
      const st = this._useMap(args.name);
      const x = clampInt(args.X, 0);
      const y = clampInt(args.Y, 0);
      const key = toKey(x, y);

      if (!st.waypoints.has(key) && st.waypoints.size >= 5) return;

      st.waypoints.set(key, { x, y });
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    delWaypoint(args) {
      const st = this._useMap(args.name);
      const x = clampInt(args.X, 0);
      const y = clampInt(args.Y, 0);
      st.waypoints.delete(toKey(x, y));
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setK(args) {
      const st = this._getActiveMap();
      st.kThreshold = Math.max(0, clampInt(args.K, 12));
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setSliceMs(args) {
      const st = this._getActiveMap();
      st._sliceMs = Math.max(1, clampInt(args.MS, 500));
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setAlgo(args) {
      const st = this._useMap(args.name);
      st.algo = String(args.ALG || "balanced");
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    setPathAlgo(args) {
      const st = this._useMap(args.name);
      st.pathAlgo = String(args.PATH_ALG || "astar");
      this._invalidateCache(st);
      if (st._debugEl) this._updateDebugView(st);
    }

    calcPath() {
      const st = this._getActiveMap();
      const key = this._buildKey(st);

      if (st._cachedKey === key && st._cachedRoute) {
        st._progress = "100%";
        return st._cachedRoute;
      }

      st._plan = null;
      this._initPlanIfNeeded(st);

      const start = Date.now();
      const maxMs = 2500;

      while (!st._plan.done) {
        if (Date.now() - start > maxMs) break;
        this._planStep(st, 5000);
      }

      if (!st._plan.done) return "-1";
      if (!st._plan.ok) return "-1";

      st._cachedKey = key;
      st._cachedRoute = st._plan.route;
      st._cachedRoutePos = 0;
      return st._cachedRoute;
    }

    calcOneStep() {
      const st = this._getActiveMap();
      const key = this._buildKey(st);

      if (st._cachedKey === key && st._cachedRoute) {
        if (st._cachedRoutePos >= st._cachedRoute.length) return "-1";
        return st._cachedRoute.charAt(st._cachedRoutePos++);
      }

      if (!st._plan || st._planKey !== key) {
        st._planKey = key;
        st._plan = null;
        this._initPlanIfNeeded(st);
      }

      if (st._plan.done) {
        if (st._plan.ok) {
          st._cachedKey = key;
          st._cachedRoute = st._plan.route;
          st._cachedRoutePos = 0;
          return st._cachedRoute.length > 0 ? st._cachedRoute.charAt(st._cachedRoutePos++) : "-1";
        } else {
          return "-1";
        }
      }

      const deadline = Date.now() + st._sliceMs;
      while (Date.now() < deadline && !st._plan.done) {
        this._planStep(st, 2000);
      }

      if (!st._plan.done) return "none";
      if (!st._plan.ok) return "-1";

      st._cachedKey = key;
      st._cachedRoute = st._plan.route;
      st._cachedRoutePos = 0;
      return st._cachedRoute.length > 0 ? st._cachedRoute.charAt(st._cachedRoutePos++) : "-1";
    }

    mapModel() {
      const st = this._getActiveMap();
      if (!this._validateMap(st)) return "-1";

      const a = new Array(st.W * st.H);
      for (let i = 0; i < a.length; i++) {
        a[i] = st.grid[i] === 0 ? "0" : "1";
      }

      const put = (x, y, ch) => {
        if (x < 0 || y < 0 || x >= st.W || y >= st.H) return;
        a[y * st.W + x] = ch;
      };
      for (const p of st.waypoints.values()) put(p.x, p.y, "5");
      put(st.sx, st.sy, "3");
      put(st.tx, st.ty, "4");

      let out = "";
      for (let y = 0; y < st.H; y++) {
        out += a.slice(y * st.W, (y + 1) * st.W).join("");
        if (y !== st.H - 1) out += "\n";
      }
      return out;
    }

    progress() {
      const st = this._getActiveMap();
      return String(st._progress ?? "0%");
    }

    findMap(args) {
      const st = this._useMap(args.name);
      this.calcPath();
      st._progress = "100%";
    }

    findMapFillList(args) {
      const st = this._useMap(args.name);
      const route = this.calcPath();
      st.list = [];
      if (route === "-1") {
        st.list.push("-1");
      } else {
        for (let i = 0; i < route.length; i++) st.list.push(route.charAt(i));
        if (st.list.length === 0) st.list.push("-1");
      }
    }

    listCount() {
      const st = this._getActiveMap();
      return st.list.length;
    }

    listItem(args) {
      const st = this._getActiveMap();
      const i = clampInt(args.I, 1) - 1;
      if (i < 0 || i >= st.list.length) return "";
      return String(st.list[i]);
    }

    _updateDebugView(st) {
      if (!st._debugEl) return;

      st._debugTitle.textContent = `地图: ${st.name} [${st._debugMode === "edit" ? "编辑" : "查看"}]`;
      st._debugInfo.textContent = `缩放: ${(st._zoomScale * 100).toFixed(0)}% | 规划: ${st.algo} | 路径: ${st.pathAlgo}`;

      if (st._debugPalette) {
        st._debugPalette.style.display = st._debugMode === "edit" ? "flex" : "none";
      }

      const canvas = st._debugCanvas;
      canvas.style.cursor = st._debugMode === "view" || st._debugTool === "move" ? "grab" : "crosshair";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!this._validateMap(st)) {
        ctx.fillStyle = "#fff";
        ctx.fillText("无效地图", 10, 20);
        return;
      }

      const pad = 10;
      const gw = canvas.width - pad * 2;
      const gh = canvas.height - pad * 2;

      const baseCell = Math.min(gw / st.W, gh / st.H);
      const cell = Math.max(2, Math.floor(baseCell * st._zoomScale));

      const totalW = cell * st.W;
      const totalH = cell * st.H;
      const ox = pad + Math.floor((gw - totalW) / 2) + st._panX;
      const oy = pad + Math.floor((gh - totalH) / 2) + st._panY;

      ctx.save();
      ctx.beginPath();
      ctx.rect(pad, pad, gw, gh);
      ctx.clip();

      const startX = Math.max(0, Math.floor(-ox / cell));
      const endX = Math.min(st.W, Math.ceil((canvas.width - ox) / cell));
      const startY = Math.max(0, Math.floor(-oy / cell));
      const endY = Math.min(st.H, Math.ceil((canvas.height - oy) / cell));

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const dx = ox + x * cell;
          const dy = oy + y * cell;

          ctx.fillStyle = this._getWalkable(st, x, y) ? "#1c7c3a" : "#7c1c1c";
          ctx.fillRect(dx, dy, cell - (cell > 4 ? 1 : 0), cell - (cell > 4 ? 1 : 0));
        }
      }

      ctx.fillStyle = "#ff9f1a";
      for (const p of st.waypoints.values()) {
        const cx = ox + p.x * cell + cell / 2;
        const cy = oy + p.y * cell + cell / 2;
        if (cx < -cell || cy < -cell || cx > canvas.width + cell || cy > canvas.height + cell) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, cell * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#2dd4ff";
      if (ox + st.sx * cell < canvas.width && oy + st.sy * cell < canvas.height) {
        ctx.fillRect(ox + st.sx * cell + cell * 0.2, oy + st.sy * cell + cell * 0.2, cell * 0.6, cell * 0.6);
      }
      ctx.fillStyle = "#a78bfa";
      if (ox + st.tx * cell < canvas.width && oy + st.ty * cell < canvas.height) {
        ctx.fillRect(ox + st.tx * cell + cell * 0.2, oy + st.ty * cell + cell * 0.2, cell * 0.6, cell * 0.6);
      }

      let route = st._cachedRoute;
      if (!route && st._plan && st._plan.done && st._plan.ok) route = st._plan.route;

      if (route && route !== "-1") {
        ctx.strokeStyle = "#1e90ff";
        ctx.lineWidth = Math.max(1, cell * 0.2);
        ctx.lineCap = "round";
        ctx.beginPath();
        let cx = st.sx,
          cy = st.sy;
        ctx.moveTo(ox + cx * cell + cell / 2, oy + cy * cell + cell / 2);
        for (let i = 0; i < route.length; i++) {
          const c = route.charAt(i);
          if (c === "w") cy--;
          else if (c === "s") cy++;
          else if (c === "a") cx--;
          else if (c === "d") cx++;
          ctx.lineTo(ox + cx * cell + cell / 2, oy + cy * cell + cell / 2);
        }
        ctx.stroke();
      }

      ctx.restore();

      st._debugGeo = { cell, ox, oy };

      if (st._toolBtns) {
        for (const id in st._toolBtns) {
          const btn = st._toolBtns[id];
          if (st._debugTool === id) {
            btn.style.border = "2px solid #fff";
            btn.style.opacity = "1";
          } else {
            btn.style.border = "1px solid #555";
            btn.style.opacity = "0.7";
          }
        }
      }
    }

    drawMap(args) {
      const st = this._useMap(args.name);
      const mode = args.MODE;
      st._debugMode = mode;

      if (!st._debugTool) st._debugTool = "wall";

      const root = document.body || document.documentElement;
      if (!root) return;

      if (!st._debugEl) {
        const wrap = document.createElement("div");
        Object.assign(wrap.style, {
          position: "fixed",
          right: "12px",
          bottom: "12px",
          width: "380px",
          height: "500px",
          background: "rgba(20,20,20,0.96)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          zIndex: "999999",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
          fontFamily: "monospace",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          touchAction: "none"
        });

        const header = document.createElement("div");
        Object.assign(header.style, {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          cursor: "move"
        });

        const title = document.createElement("div");
        title.style.fontSize = "12px";

        const close = document.createElement("button");
        close.textContent = "x";
        Object.assign(close.style, {
          cursor: "pointer",
          border: "0",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          borderRadius: "6px",
          width: "28px",
          height: "24px"
        });
        close.onclick = () => {
          wrap.style.display = "none";
        };

        header.appendChild(title);
        header.appendChild(close);

        const toolbar = document.createElement("div");
        Object.assign(toolbar.style, {
          padding: "6px",
          display: "flex",
          gap: "6px",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        });

        const createBtn = (lbl, fn) => {
          const b = document.createElement("button");
          b.innerText = lbl;
          Object.assign(b.style, {
            flex: "1",
            fontSize: "11px",
            padding: "4px",
            background: "#333",
            color: "#eee",
            border: "1px solid #555",
            borderRadius: "4px",
            cursor: "pointer"
          });
          b.onclick = fn;
          return b;
        };

        toolbar.appendChild(
          createBtn("运行", () => {
            this._invalidateCache(st);
            this.calcPath();
            this._updateDebugView(st);
          })
        );

        toolbar.appendChild(
          createBtn("+", () => {
            st._zoomScale = Math.min(10, st._zoomScale + 0.25);
            this._updateDebugView(st);
          })
        );

        toolbar.appendChild(
          createBtn("-", () => {
            st._zoomScale = Math.max(0.2, st._zoomScale - 0.25);
            this._updateDebugView(st);
          })
        );

        toolbar.appendChild(
          createBtn("重置视图", () => {
            st._zoomScale = 1.0;
            st._panX = 0;
            st._panY = 0;
            this._updateDebugView(st);
          })
        );

        toolbar.appendChild(
          createBtn("清除路径", () => {
            this._invalidateCache(st);
            this._updateDebugView(st);
          })
        );

        const palette = document.createElement("div");
        st._debugPalette = palette;
        Object.assign(palette.style, {
          padding: "6px",
          display: "none",
          gap: "4px",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        });

        st._toolBtns = {};
        const tools = [
          { id: "move", label: "移动", color: "#607d8b" },
          { id: "empty", label: "空地", color: "#1c7c3a" },
          { id: "wall", label: "障碍", color: "#7c1c1c" },
          { id: "start", label: "起点", color: "#2dd4ff" },
          { id: "target", label: "终点", color: "#a78bfa" },
          { id: "waypoint", label: "必经", color: "#ff9f1a" }
        ];

        tools.forEach((t) => {
          const b = document.createElement("button");
          b.innerText = t.label;
          Object.assign(b.style, {
            flex: "1",
            fontSize: "10px",
            padding: "3px 0",
            background: t.color,
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "3px",
            cursor: "pointer"
          });
          b.onclick = () => {
            st._debugTool = t.id;
            canvas.style.cursor = t.id === "move" ? "grab" : "crosshair";
            this._updateDebugView(st);
          };
          st._toolBtns[t.id] = b;
          palette.appendChild(b);
        });

        const info = document.createElement("div");
        Object.assign(info.style, { padding: "6px 10px", fontSize: "11px", opacity: "0.9" });

        const canvas = document.createElement("canvas");
        canvas.width = 360;
        canvas.height = 340;
        Object.assign(canvas.style, {
          display: "block",
          margin: "0 auto 10px auto",
          background: "#111",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.10)",
          cursor: "crosshair",
          touchAction: "none"
        });

        let wDrag = false;
        let wLx = 0,
          wLy = 0;
        const startWinDrag = (cx, cy) => {
          wDrag = true;
          wLx = cx;
          wLy = cy;
        };
        const doWinDrag = (cx, cy) => {
          if (!wDrag) return;
          st._winX = (st._winX || 0) + (cx - wLx);
          st._winY = (st._winY || 0) + (cy - wLy);
          wrap.style.transform = `translate(${st._winX}px, ${st._winY}px)`;
          wLx = cx;
          wLy = cy;
        };

        header.addEventListener("mousedown", (e) => startWinDrag(e.clientX, e.clientY));
        header.addEventListener(
          "touchstart",
          (e) => {
            startWinDrag(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
          },
          { passive: false }
        );

        const getCanvasPos = (clientX, clientY) => {
          const rect = canvas.getBoundingClientRect();
          return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const paintCell = (cx, cy) => {
          if (st._debugMode !== "edit") return;
          if (!st._debugGeo) return;

          const { cell, ox, oy } = st._debugGeo;
          const gx = Math.floor((cx - ox) / cell);
          const gy = Math.floor((cy - oy) / cell);

          if (gx >= 0 && gx < st.W && gy >= 0 && gy < st.H) {
            const idx = gy * st.W + gx;
            const tool = st._debugTool;

            const setVal = (v) => {
              st.grid[idx] = v;
            };

            if (tool === "empty") {
              setVal(0);
              st.waypoints.delete(toKey(gx, gy));
            } else if (tool === "wall") {
              setVal(1);
              st.waypoints.delete(toKey(gx, gy));
            } else if (tool === "start") {
              st.sx = gx;
              st.sy = gy;
              setVal(0);
              st.waypoints.delete(toKey(gx, gy));
            } else if (tool === "target") {
              st.tx = gx;
              st.ty = gy;
              setVal(0);
              st.waypoints.delete(toKey(gx, gy));
            } else if (tool === "waypoint") {
              const k = toKey(gx, gy);
              if (st.waypoints.has(k) || st.waypoints.size < 5) {
                setVal(0);
                st.waypoints.set(k, { x: gx, y: gy });
              }
            }

            this._invalidateCache(st);
            this._updateDebugView(st);
          }
        };

        canvas.addEventListener(
          "wheel",
          (e) => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            const oldScale = st._zoomScale;
            let newScale = oldScale + delta;
            newScale = Math.max(0.2, Math.min(10, newScale));
            st._zoomScale = newScale;
            this._updateDebugView(st);
          },
          { passive: false }
        );

        let isDragging = false;
        let lastX = 0,
          lastY = 0;
        let startDist = 0;
        let startScale = 1;

        canvas.addEventListener("mousedown", (e) => {
          isDragging = true;
          lastX = e.clientX;
          lastY = e.clientY;

          if (st._debugTool === "move") {
            canvas.style.cursor = "grabbing";
            return;
          }

          if (st._debugMode === "edit") {
            const p = getCanvasPos(e.clientX, e.clientY);
            paintCell(p.x, p.y);
          }
        });

        window.addEventListener("mousemove", (e) => {
          if (wDrag) {
            doWinDrag(e.clientX, e.clientY);
            return;
          }

          if (!isDragging) return;
          if (!st._debugEl || st._debugEl.style.display === "none") return;

          if (st._debugMode === "view" || st._debugTool === "move") {
            st._panX += e.clientX - lastX;
            st._panY += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            this._updateDebugView(st);
          } else {
            const rect = canvas.getBoundingClientRect();
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              const p = getCanvasPos(e.clientX, e.clientY);
              paintCell(p.x, p.y);
            }
            lastX = e.clientX;
            lastY = e.clientY;
          }
        });

        window.addEventListener("mouseup", () => {
          isDragging = false;
          wDrag = false;
          if (st._debugTool === "move") canvas.style.cursor = "grab";
        });

        canvas.addEventListener(
          "touchstart",
          (e) => {
            if (e.touches.length === 2) {
              startDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              startScale = st._zoomScale;
              e.preventDefault();
            } else if (e.touches.length === 1) {
              isDragging = true;
              lastX = e.touches[0].clientX;
              lastY = e.touches[0].clientY;

              if (st._debugTool === "move") return;

              if (st._debugMode === "edit") {
                const p = getCanvasPos(lastX, lastY);
                paintCell(p.x, p.y);
              }
            }
          },
          { passive: false }
        );

        canvas.addEventListener(
          "touchmove",
          (e) => {
            if (wDrag) {
              doWinDrag(e.touches[0].clientX, e.touches[0].clientY);
              return;
            }

            if (e.touches.length === 2) {
              const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              if (startDist > 0) {
                const ratio = dist / startDist;
                let newScale = startScale * ratio;
                newScale = Math.max(0.2, Math.min(10, newScale));
                st._zoomScale = newScale;
                this._updateDebugView(st);
              }
              e.preventDefault();
            } else if (e.touches.length === 1 && isDragging) {
              const cx = e.touches[0].clientX;
              const cy = e.touches[0].clientY;

              if (st._debugMode === "view" || st._debugTool === "move") {
                st._panX += cx - lastX;
                st._panY += cy - lastY;
                this._updateDebugView(st);
              } else {
                const p = getCanvasPos(cx, cy);
                paintCell(p.x, p.y);
              }
              lastX = cx;
              lastY = cy;
              e.preventDefault();
            }
          },
          { passive: false }
        );

        window.addEventListener("touchend", () => {
          wDrag = false;
          startDist = 0;
          if (startDist === 0) isDragging = false;
        });

        wrap.appendChild(header);
        wrap.appendChild(toolbar);
        wrap.appendChild(palette);
        wrap.appendChild(info);
        wrap.appendChild(canvas);
        root.appendChild(wrap);

        st._debugEl = wrap;
        st._debugCanvas = canvas;
        st._debugTitle = title;
        st._debugInfo = info;
      }

      st._debugEl.style.display = "block";
      if (st._winX || st._winY) {
        st._debugEl.style.transform = `translate(${st._winX || 0}px, ${st._winY || 0}px)`;
      }
      this._updateDebugView(st);
    }

    getInfo() {
      return {
        id: EXT_ID,
        name: "A*寻路",
        color1: "#4B8BBE",
        color2: "#306998",
        menus: {
          ALG_MENU: {
            acceptReporters: true,
            items: [
              { text: "平衡", value: "balanced" },
              { text: "准确", value: "accurate" },
              { text: "迅速", value: "fast" },
              { text: "贪婪迅速", value: "greedy_fast" },
              { text: "双向贪婪迅速", value: "bidirectional_fast" }
            ]
          },
          PATH_ALG_MENU: {
            acceptReporters: true,
            items: [
              { text: "A*算法", value: "astar" },
              { text: "JPS算法", value: "jps" }
            ]
          },
          EDIT_MENU: {
            acceptReporters: true,
            items: [
              { text: "可编辑", value: "edit" },
              { text: "仅查看", value: "view" }
            ]
          }
        },
        blocks: [
          {
            opcode: "setMap",
            blockType: Scratch.BlockType.COMMAND,
            text: "建图 地图名为[name]长 [L] 宽 [W] 内容 [C]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              L: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              C: { type: Scratch.ArgumentType.STRING, defaultValue: "0000000000".repeat(10) }
            }
          },
          {
            opcode: "setStart",
            blockType: Scratch.BlockType.COMMAND,
            text: "起始 地图名为[name]的x [X] y [Y]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: "setTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: "终止 地图名为[name]的x [X] y [Y]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 9 }
            }
          },
          {
            opcode: "addWaypoint",
            blockType: Scratch.BlockType.COMMAND,
            text: "添加必经点地图名为[name]的 x [X] y [Y]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          {
            opcode: "delWaypoint",
            blockType: Scratch.BlockType.COMMAND,
            text: "删去必经点地图名为[name] x [X] y [Y]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
            }
          },
          {
            opcode: "drawMap",
            blockType: Scratch.BlockType.COMMAND,
            text: "画出地图地图名为[name]的示意图 [MODE]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              MODE: { type: Scratch.ArgumentType.STRING, menu: "EDIT_MENU", defaultValue: "edit" }
            }
          },
          {
            opcode: "setAlgo",
            blockType: Scratch.BlockType.COMMAND,
            text: "寻路地图名为[name]规划算法[ALG]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              ALG: { type: Scratch.ArgumentType.STRING, menu: "ALG_MENU", defaultValue: "balanced" }
            }
          },
          {
            opcode: "setPathAlgo",
            blockType: Scratch.BlockType.COMMAND,
            text: "寻路地图名为[name]路径算法[PATH_ALG]",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" },
              PATH_ALG: { type: Scratch.ArgumentType.STRING, menu: "PATH_ALG_MENU", defaultValue: "astar" }
            }
          },
          {
            opcode: "findMap",
            blockType: Scratch.BlockType.COMMAND,
            text: "*寻路地图名为[name]*",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" }
            }
          },
          {
            opcode: "findMapFillList",
            blockType: Scratch.BlockType.COMMAND,
            text: "寻路地图名为[name]并且把结果填充到内置列表中",
            arguments: {
              name: { type: Scratch.ArgumentType.STRING, defaultValue: "map1" }
            }
          },
          {
            opcode: "listCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "内置列表的项目数"
          },
          {
            opcode: "listItem",
            blockType: Scratch.BlockType.REPORTER,
            text: "内置列表的([I])项",
            arguments: {
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          "---",
          {
            opcode: "setK",
            blockType: Scratch.BlockType.COMMAND,
            text: "设定精确k值为 [K]",
            arguments: { K: { type: Scratch.ArgumentType.NUMBER, defaultValue: 12 } }
          },
          {
            opcode: "setSliceMs",
            blockType: Scratch.BlockType.COMMAND,
            text: "设定一步计算时间片ms为 [MS]",
            arguments: { MS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 } }
          },
          "---",
          { opcode: "calcPath", blockType: Scratch.BlockType.REPORTER, text: "计算路程" },
          { opcode: "calcOneStep", blockType: Scratch.BlockType.REPORTER, text: "计算一步最优解" },
          { opcode: "mapModel", blockType: Scratch.BlockType.REPORTER, text: "建图模型" },
          { opcode: "progress", blockType: Scratch.BlockType.REPORTER, text: "估计进度" }
        ]
      };
    }
  }

  Scratch.extensions.register(new Extension());
})(Scratch);

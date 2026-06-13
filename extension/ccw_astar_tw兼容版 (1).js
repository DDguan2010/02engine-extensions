/* eslint-disable max-classes-per-file */
/* eslint-disable camelcase */
// import interact from 'interactjs';
// eslint-disable-next-line max-classes-per-file
// import icon from './assets/icon.svg';
(function (Scratch) {
  class AssetsHelper {
    constructor() {
      this.decodeImageCache = {};
      this.imageCache = {};
    }

    clearCache() {
      // console.log('clearCache');
      this.decodeImageCache = null;
      this.decodeImageCache = {};
      if (Object.values(this.imageCache).length > 99) {
        this.imageCache = null;
        this.imageCache = {};
      }
    }

    decodeImage(asset) {
      // this.triggerDecodeCacheRelease();
      if (this.decodeImageCache[asset.assetId]) {
        return Promise.resolve(true);
      }
      if (asset.assetType.runtimeFormat === 'svg') {
        const svgString = asset.decodeText();
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            img.onload = null;
            this.decodeImageCache[asset.assetId] = { bmp: img };
            return resolve(true);
          };
          img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
        });
      }
      return createImageBitmap(new Blob([asset.data], { type: asset.assetType.contentType })).then((bmp) => {
        this.decodeImageCache[asset.assetId] = { bmp };
        return true;
      });
    }
  }
  const assetsHelper = new AssetsHelper();

  const trace = console.log;
  const warn = console.warn;

  const localizationWithNamespace = (localization, namespace) => {
    const rt = {};
    Object.entries(localization).forEach(([key, value]) => {
      rt[`${namespace}.${key}`] = value;
    });
    return rt;
  };
  const { translate } = Scratch;

  class GandiExtension {
    getHats() {
      return {
        ...this.hats,
      };
    }

    constructor(runtime, config = { NS: 'Gandi', cn: {}, en: {} }) {
      this.runtime = runtime;
      this.hats = {};
      this.NS = config.NS;
      /**
       * Preprocess formatMessage func with namespace
       */
      translate.setup({
        'zh-cn': localizationWithNamespace(config.cn, config.NS),
        en: localizationWithNamespace(config.en, config.NS),
      });

      /**
       * Get the format message function for the current locale.
       * @param {Object} obj , key for id, value for default
       * @returns formatted message
       */
      this.fm = (obj) => {
        if (typeof obj === 'string') {
          return translate({ id: `${config.NS}.${obj}`, default: obj });
        }
        const [key, value] = Object.entries(obj)[0];
        const objWithNS = { id: `${config.NS}.${key}`, default: value };
        return translate(objWithNS);
      };
    }

    // ========================================================================== //
    //   Utils

    __hideBlocks(blocks) {
      blocks.forEach((block) => {
        block.hideFromPalette = true;
      });
    }

    __processEvent(event) {
      this[event] = () => true; // by default return true to keep event running
      this.hats[`${this.NS}_${event}`] = {};
    }

    __dispatchCCWEvent(event, fields, parameters, util) {
      util.startHatsWithParams(`${this.NS}_${event}`, {
        parameters,
        fields,
      });
    }

    /**
     * Get a sprite list
     * @returns Array of sprites in this project
     */
    __spriteList() {
      const sprites = [];
      this.runtime.targets.forEach((item) => {
        if (item.isOriginal && !item.isStage) {
          sprites.push({
            text: item.sprite.name,
            value: item.sprite.name,
          });
        }
      });
      if (sprites.length === 0) {
        sprites.push({
          text: '-',
          value: '',
        });
      }
      return sprites;
    }

    /**
     * return a list of list in this project
     * @returns Array of list in this project
     */
    __listList() {
      const list = [];
      let temp = this.runtime._stageTarget.variables;
      Object.keys(temp).forEach((obj) => {
        if (temp[obj].type === 'list') {
          // console.log(temp[obj].type)
          list.push({
            text: `${temp[obj].name}`,
            value: temp[obj].id,
          });
        }
      });
      try {
        temp = this.runtime._editingTarget.variables;
      } catch (e) {
        temp = 'e';
      }
      if (temp !== 'e' && this.runtime._editingTarget !== this.runtime._stageTarget) {
        Object.keys(temp).forEach((obj) => {
          if (temp[obj].type === 'list') {
            list.push({
              text: `[PRIVATE]${temp[obj].name}`,
              value: temp[obj].id,
            });
          }
        });
      }
      if (list.length === 0) {
        list.push({
          text: `-`,
          value: 'empty',
        });
      }
      return list;
    }

    /**
     * Get a variable list
     * @returns Array of variables in this project
     */
    __variableList() {
      const list = [];
      let temp = this.runtime._stageTarget.variables;
      Object.keys(temp).forEach((obj) => {
        // console.log(temp[obj].type);
        if (temp[obj].type === '') {
          list.push({
            text: `${temp[obj].name}`,
            value: temp[obj].id,
          });
        }
      });
      try {
        temp = this.runtime._editingTarget.variables;
      } catch (e) {
        temp = 'e';
      }
      if (temp !== 'e' && this.runtime._editingTarget !== this.runtime._stageTarget) {
        Object.keys(temp).forEach((obj) => {
          if (temp[obj].type === '') {
            list.push({
              text: `[PRIVATE]${temp[obj].name}`,
              value: temp[obj].id,
            });
          }
        });
      }
      if (list.length === 0) {
        list.push({
          text: `-`,
          value: 'empty',
        });
      }
      return list;
    }

    /**
     * Find a list in Scratch by id or name
     * @param {String} listName the name or id of the list
     * @returns null or the list
     */
    __findList(listName = 'empty', target) {
      if (listName === 'empty') {
        return null;
      }
      return this.__findVariable(listName, true, target);
    }

    /**
     * Find a variable in Scratch by id or name
     * @param {String} varName the name or id of the variable
     * @returns null or the variable
     */
    __findVariable(varName, list = false, target) {
      // debugger;
      let rt = null;
      if (target) {
        // find the variable in the target first
        rt = target.lookupVariableById(varName);
        if (!rt) {
          rt = target.lookupVariableByNameAndType(varName, list);
        }
        if (rt) {
          return rt;
        }
      }
      // find the variable in the stage
      const stage = this.runtime.targets[0];
      rt = stage.lookupVariableById(varName);
      if (!rt) {
        rt = stage.lookupVariableByNameAndType(varName, list);
      }
      if (rt) {
        return rt;
      }
      // Not found, try the rest of the targets
      this.runtime.targets.every((target) => {
        rt = target.lookupVariableById(varName);
        if (!rt) {
          rt = target.lookupVariableByNameAndType(varName, list);
        }
        if (rt) {
          return false; // stop every loop
        }
        return true; // continue every loop
      });
      return rt;
    }

    /**
     * Fill an array to a list in Scratch
     * @param {Array} array An array will be append or overwrite list
     * @param {String} listName the list name
     * @param {Object} options ['overwrite'] true/false, default true
     * @returns success or not
     */
    __fillArrayToList(array, listName = 'empty', options = { overwrite: true }, target) {
      const list = this.__findList(listName, target);
      if (!list) {
        return false;
      }
      const safeArray = array.map((item) => JSON.stringify(item));
      if (options.overwrite) {
        list.value = safeArray;
      } else {
        list.value = [list.value, ...safeArray];
      }
      return true;
    }

    /**
     * Find target by sprite name or Id
     * @param {string} nameOrId name for sprite, or id for any target
     * @returns target or null if not found
     */
    __getTargetByNameOrId(nameOrId) {
      // get sprite target by name
      let target = this.runtime.getSpriteTargetByName(nameOrId);
      if (!target) {
        // if sprite not found, assume it as an Id for sprite or clone
        target = this.runtime.getTargetById(nameOrId);
        if (!target) return null;
      }
      return target;
    }

    __getSpriteTargetByNameOrId(spriteNameOrId) {
      let spriteTarget = this.runtime.getTargetById(spriteNameOrId);
      if (!spriteTarget) {
        // try find it by name
        spriteTarget = this.runtime.getSpriteTargetByName(spriteNameOrId);
      }
      return spriteTarget;
    }

    __getSpriteByNameOrId(spriteNameOrId) {
      const spriteTarget = this.__getSpriteTargetByNameOrId(spriteNameOrId);
      if (spriteTarget) {
        return spriteTarget.sprite;
      }
      return null;
    }
  }


  // WorkerQueue.js
  const WorkerQueue = function (url, count) {
    this.url = url;
    this.count = count || navigator.hardwareConcurrency || 4;
    this.queue = [];
    this.callbacks = {};
    this.pool = [];
    this.idx = 0;
  };

  // submit 提交任务
  // usage example:
  //   let wq = new WorkerQueue("./test.worker.js", 4);
  //   wq.submit(msg).then(function(data) {
  //     console.log("recv msg", data);
  //   });
  //
  // ⚠️ Worker 的 onmessage 实现接受的 msg 第一个参数是 id，并且需要原样返回
  // onmessage = async function (e) {
  //   let [id, data] = e.data;
  //   self.postMessage([id, data + 1]);
  // }
  WorkerQueue.prototype.submit = function (msg, event_cb = undefined) {
    return new Promise((resolve, reject) => {
      this.queue.push([msg, resolve, reject, event_cb]);
      this._nextJob();
    });
  };

  WorkerQueue.prototype.clear = function () {
    this.pool.map((w) => w[0].terminate());
    this.pool = [];
  };

  WorkerQueue.prototype._nextJob = function () {
    let i;
    for (i = 0; i < this.pool.length; i++) {
      if (!this.pool[i][1]) {
        break;
      }
    }
    if (i < this.pool.length) {
      this._startJob(i);
    } else if (this.pool.length < this.count) {
      const w = this._newWorker();
      this.pool.push([w, false]);
      this._startJob(this.pool.length - 1);
    }
  };

  WorkerQueue.prototype._newWorker = function () {
    const w = new Worker(this.url);
    w.onmessage = (e) => {
      const [id, data] = e.data;
      const [resolve, event_cb] = this.callbacks[id];
      if (e.data.length > 2 && event_cb) {
        event_cb(e.data[2]);
      } else {
        resolve(data);
        delete this.callbacks[id];
      }
    };
    const wp = (message, event_cb) => {
      return new Promise((resolve, reject) => {
        const id = this.idx++;
        this.callbacks[id] = [resolve, event_cb];
        w.onerror = function (e) {
          reject(`ERROR: Line ${e.lineno} in ${e.url}: ${e.message}`);
        };
        w.postMessage([id, message]);
      });
    };
    wp.terminate = function () {
      w.terminate();
    };
    return wp;
  };

  WorkerQueue.prototype._startJob = function (i) {
    const w = this.pool[i];
    w[1] = true;
    if (this.queue.length === 0) {
      w[1] = false;
      return;
    }
    const [msg, resolve, reject, event_cb] = this.queue.shift();
    const self = this;
    w[0](msg, event_cb)
      .then(resolve, reject)
      .then(() => {
        self._startJob(i);
      });
  };

  // css
  (() => {
    const s = document.createElement('style');
    s.textContent = `#containerDebugForAStar{
    position: fixed;
    left: 350px;
    bottom: 100px;
    z-index: 100;
    touch-action: none;
    user-select: none;
    width: 326px;
    height: 208px;
    transition: background 0.5s ease-in-out, border 0.5s ease-in-out;
    border: 3px rgba(255,255,255,0) solid;
    border-radius: 3px;
  }
  #canvasDebugForAStar{
    background-color: #cecece;
    transform: scale(0.5) translate(-320px, -180px);
    opacity: 0.6;
    cursor: move;
    transition: all 0.5s ease-in-out;

  }
  #containerDebugForAStar:hover #canvasDebugForAStar{
    opacity: 1;
  }

  #containerDebugForAStar:hover{
    background-color: aquamarine;
    border: 3px aquamarine solid;
  }
  #containerDebugForAStar::before{
    content: "A* Odyssey Debug Window @ Gandi IDE";
    height: 16px;
    font-size: 12px;
    line-height: 16px;
    color: rgba(0,0,0,0);
    transition: all 0.5s ease-in-out;
  }
  #containerDebugForAStar:hover::before{
    color: rgba(0,0,0,.6);
  }`;
    document.head.appendChild(s);
  })();
  // ============= 内联 jps_wasm.worker 代码 =============
  const jpsWorker = "let wasm_bindgen;\r\n(function() {\r\n  const __exports = {};\r\n  let wasm;\r\n\r\n  let cachedUint8Memory0 = new Uint8Array();\r\n\r\n  function getUint8Memory0() {\r\n    if (cachedUint8Memory0.byteLength === 0) {\r\n      cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);\r\n    }\r\n    return cachedUint8Memory0;\r\n  }\r\n\r\n  let WASM_VECTOR_LEN = 0;\r\n\r\n  function passArray8ToWasm0(arg, malloc) {\r\n    const ptr = malloc(arg.length * 1);\r\n    getUint8Memory0().set(arg, ptr \/ 1);\r\n    WASM_VECTOR_LEN = arg.length;\r\n    return ptr;\r\n  }\r\n\r\n  let cachedInt32Memory0 = new Int32Array();\r\n\r\n  function getInt32Memory0() {\r\n    if (cachedInt32Memory0.byteLength === 0) {\r\n      cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);\r\n    }\r\n    return cachedInt32Memory0;\r\n  }\r\n\r\n  function getArrayI32FromWasm0(ptr, len) {\r\n    return getInt32Memory0().subarray(ptr \/ 4, ptr \/ 4 + len);\r\n  }\r\n\r\n  \/**\r\n   * @param {Uint8Array} map\r\n   * @param {number} map_x\r\n   * @param {number} map_y\r\n   * @param {number} begin_x\r\n   * @param {number} begin_y\r\n   * @param {number} end_x\r\n   * @param {number} end_y\r\n   * @returns {Int32Array}\r\n   *\/\r\n  __exports.a_star_jps = function(map, map_x, map_y, begin_x, begin_y, end_x, end_y) {\r\n    try {\r\n      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\r\n      var ptr0 = passArray8ToWasm0(map, wasm.__wbindgen_malloc);\r\n      var len0 = WASM_VECTOR_LEN;\r\n      wasm.a_star_jps(retptr, ptr0, len0, map_x, map_y, begin_x, begin_y, end_x, end_y);\r\n      var r0 = getInt32Memory0()[retptr \/ 4 + 0];\r\n      var r1 = getInt32Memory0()[retptr \/ 4 + 1];\r\n      var v1 = getArrayI32FromWasm0(r0, r1).slice();\r\n      wasm.__wbindgen_free(r0, r1 * 4);\r\n      return v1;\r\n    } finally {\r\n      wasm.__wbindgen_add_to_stack_pointer(16);\r\n      map.set(getUint8Memory0().subarray(ptr0 \/ 1, ptr0 \/ 1 + len0));\r\n      wasm.__wbindgen_free(ptr0, len0 * 1);\r\n    }\r\n  };\r\n\r\n  async function load(module, imports) {\r\n    if (typeof Response === \"function\" && module instanceof Response) {\r\n      if (typeof WebAssembly.instantiateStreaming === \"function\") {\r\n        try {\r\n          return await WebAssembly.instantiateStreaming(module, imports);\r\n\r\n        } catch (e) {\r\n          if (module.headers.get(\"Content-Type\") != \"application\/wasm\") {\r\n            console.warn(\"`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application\/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\\n\", e);\r\n\r\n          } else {\r\n            throw e;\r\n          }\r\n        }\r\n      }\r\n\r\n      const bytes = await module.arrayBuffer();\r\n      return await WebAssembly.instantiate(bytes, imports);\r\n\r\n    } else {\r\n      const instance = await WebAssembly.instantiate(module, imports);\r\n\r\n      if (instance instanceof WebAssembly.Instance) {\r\n        return { instance, module };\r\n\r\n      } else {\r\n        return instance;\r\n      }\r\n    }\r\n  }\r\n\r\n  function getImports() {\r\n    const imports = {};\r\n    imports.wbg = {};\r\n\r\n    return imports;\r\n  }\r\n\r\n  function initMemory(imports, maybe_memory) {\r\n\r\n  }\r\n\r\n  function finalizeInit(instance, module) {\r\n    wasm = instance.exports;\r\n    init.__wbindgen_wasm_module = module;\r\n    cachedInt32Memory0 = new Int32Array();\r\n    cachedUint8Memory0 = new Uint8Array();\r\n\r\n\r\n    return wasm;\r\n  }\r\n\r\n  function initSync(module) {\r\n    const imports = getImports();\r\n\r\n    initMemory(imports);\r\n\r\n    if (!(module instanceof WebAssembly.Module)) {\r\n      module = new WebAssembly.Module(module);\r\n    }\r\n\r\n    const instance = new WebAssembly.Instance(module, imports);\r\n\r\n    return finalizeInit(instance, module);\r\n  }\r\n\r\n  async function init(input) {\r\n    if (typeof input === \"undefined\") {\r\n      let src;\r\n      if (typeof document === \"undefined\") {\r\n        src = location.href;\r\n      } else {\r\n        src = document.currentScript.src;\r\n      }\r\n      input = src.replace(\/\\.js$\/, \"_bg.wasm\");\r\n    }\r\n    const imports = getImports();\r\n\r\n    if (typeof input === \"string\" || (typeof Request === \"function\" && input instanceof Request) || (typeof URL === \"function\" && input instanceof URL)) {\r\n      input = fetch(input);\r\n    }\r\n\r\n    initMemory(imports);\r\n\r\n    const { instance, module } = await load(await input, imports);\r\n\r\n    return finalizeInit(instance, module);\r\n  }\r\n\r\n  wasm_bindgen = Object.assign(init, { initSync }, __exports);\r\n\r\n})();\r\n\r\nonmessage = async (e) => {\r\n  \/\/ let sst = performance.now();\r\n  let [uuid, data] = e.data;\r\n  const {\r\n    points, grid, targetId, weight, wasmUrl\r\n  } = data;\r\n  const [sx, sy, ex, ey] = points;\r\n  \/\/ points \u6570\u636e\u7ed3\u679c\u4e3a\uff1a [sx,sy,ex,ey]\uff0c\u5206\u522b\u662f startX, startY, endX, endY\r\n  \/\/ grid \u7684\u6570\u636e\u4e3a\u4e8c\u7ef4\u6570\u7ec4 [y][x]\uff0c\u5750\u6807\u4f7f\u7528\u7684\u662f\u5de6\u4e0a\u89d2\u4e3a 0,0\r\n  \/\/ targetId \u4e0d\u7528\u7ba1\uff0c\u4f20\u5165\u8fdb\u6765\u662f\u4ec0\u4e48\uff0c\u4f20\u51fa\u53bb\u662f\u4ec0\u4e48\u5c31\u884c\u4e86\r\n  \/\/ weight \u4e5f\u4e0d\u7528\u7ba1\uff0c\u4f46\u662f 0 \u4ee3\u8868\u7684\u662f\u4f7f\u7528\u9ad8\u7cbe\u5ea6\u7b97\u6cd5\uff0c 60 \u4ee3\u8868\u7684\u662f\u4f7f\u7528\u5feb\u901f\u7b97\u6cd5\r\n\r\n  await wasm_bindgen(wasmUrl);\r\n\r\n  \/\/ \u9700\u8981\u8fd4\u56de\u7684\u6570\u636e\r\n  let path = [];\r\n  \/\/ \u5bfb\u5230\u7684\u8def [[x,y],[x,y]....]\r\n  let smoothPath = [];\r\n  \/\/ \u5e73\u6ed1\u5904\u7406\u540e\u7684\u8def [[x,y],[x,y]...]\r\n  \/\/ \u82e5\u6ca1\u6709\u8def\u5f84\u5bfb\u5230 \u4fdd\u6301\u9ed8\u8ba4\u503c\u4e3a []\r\n\r\n  \/\/ let map = [];\r\n  \/\/ grid.forEach(v => {\r\n  \/\/   map = map.concat(v);\r\n  \/\/ });\r\n  let map = [].concat(...grid);\r\n\r\n  \/\/ let st = performance.now();\r\n  let retn = wasm_bindgen.a_star_jps(new Uint8Array(map), grid[0].length, grid.length, sx, sy, ex, ey);\r\n  \/\/ console.log(`wasm calc cost: ${performance.now() - st}ms`);\r\n\r\n  let sp = retn[0];\r\n  let path_ = retn.slice(1, sp * 2 + 1);\r\n  let smoothPath_ = retn.slice(sp * 2 + 1);\r\n  for (let i = 0; i < path_.length; i += 2) {\r\n    path.push([path_[i], path_[i + 1]]);\r\n  }\r\n  for (let i = 0; i < smoothPath_.length; i += 2) {\r\n    smoothPath.push([smoothPath_[i], smoothPath_[i + 1]]);\r\n  }\r\n\r\n  postMessage([\r\n    uuid,\r\n    { path, smoothPath, targetId }\r\n  ]);\r\n  \/\/ console.trace(`wasm worker cost: ${performance.now() - sst}ms`);\r\n};";
  
  // ============= 内联 astar.worker 代码 =============
  const astarWorker = "\/* eslint-disable  *\/\r\n\r\n    function Q_rsqrt(number)\r\n    {\r\n      \/\/ return Math.sqrt(number);\r\n        var i;\r\n        var x2, y;\r\n        const threehalfs = 1.5;\r\n\r\n        x2 = number * 0.5;\r\n        y = number;\r\n        \/\/evil floating bit level hacking\r\n        var buf = new ArrayBuffer(4);\r\n        (new Float32Array(buf))[0] = number;\r\n        i =  (new Uint32Array(buf))[0];\r\n        i = (0x5f3759df - (i >> 1)); \/\/ Ref Q\r\n        (new Uint32Array(buf))[0] = i;\r\n        y = (new Float32Array(buf))[0];\r\n        y  = y * ( threehalfs - ( x2 * y * y ) );   \/\/ 1st iteration\r\n    \/\/  y  = y * ( threehalfs - ( x2 * y * y ) );   \/\/ 2nd iteration, this can be removed\r\n\r\n        return y;\r\n    }\r\n    function Q_sqrt(number){\r\n      return Q_rsqrt(number) * number;\r\n    }\r\n\r\n    var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;\r\n\r\n    floor = Math.floor, min = Math.min;\r\n    \/*\r\n    Default comparison function to be used\r\n     *\/\r\n\r\n    defaultCmp = function (x, y) {\r\n      if (x < y) {\r\n        return -1;\r\n      }\r\n\r\n      if (x > y) {\r\n        return 1;\r\n      }\r\n\r\n      return 0;\r\n    };\r\n    \/*\r\n    Insert item x in list a, and keep it sorted assuming a is sorted.\r\n\r\n    If x is already in a, insert it to the right of the rightmost x.\r\n\r\n    Optional args lo (default 0) and hi (default a.length) bound the slice\r\n    of a to be searched.\r\n     *\/\r\n\r\n\r\n    insort = function (a, x, lo, hi, cmp) {\r\n      var mid;\r\n\r\n      if (lo == null) {\r\n        lo = 0;\r\n      }\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      if (lo < 0) {\r\n        throw new Error('lo must be non-negative');\r\n      }\r\n\r\n      if (hi == null) {\r\n        hi = a.length;\r\n      }\r\n\r\n      while (lo < hi) {\r\n        mid = floor((lo + hi) \/ 2);\r\n\r\n        if (cmp(x, a[mid]) < 0) {\r\n          hi = mid;\r\n        } else {\r\n          lo = mid + 1;\r\n        }\r\n      }\r\n\r\n      return [].splice.apply(a, [lo, lo - lo].concat(x)), x;\r\n    };\r\n    \/*\r\n    Push item onto heap, maintaining the heap invariant.\r\n     *\/\r\n\r\n\r\n    heappush = function (array, item, cmp) {\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      array.push(item);\r\n      return _siftdown(array, 0, array.length - 1, cmp);\r\n    };\r\n    \/*\r\n    Pop the smallest item off the heap, maintaining the heap invariant.\r\n     *\/\r\n\r\n\r\n    heappop = function (array, cmp) {\r\n      var lastelt, returnitem;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      lastelt = array.pop();\r\n\r\n      if (array.length) {\r\n        returnitem = array[0];\r\n        array[0] = lastelt;\r\n\r\n        _siftup(array, 0, cmp);\r\n      } else {\r\n        returnitem = lastelt;\r\n      }\r\n\r\n      return returnitem;\r\n    };\r\n    \/*\r\n    Pop and return the current smallest value, and add the new item.\r\n\r\n    This is more efficient than heappop() followed by heappush(), and can be\r\n    more appropriate when using a fixed size heap. Note that the value\r\n    returned may be larger than item! That constrains reasonable use of\r\n    this routine unless written as part of a conditional replacement:\r\n        if item > array[0]\r\n          item = heapreplace(array, item)\r\n     *\/\r\n\r\n\r\n    heapreplace = function (array, item, cmp) {\r\n      var returnitem;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      returnitem = array[0];\r\n      array[0] = item;\r\n\r\n      _siftup(array, 0, cmp);\r\n\r\n      return returnitem;\r\n    };\r\n    \/*\r\n    Fast version of a heappush followed by a heappop.\r\n     *\/\r\n\r\n\r\n    heappushpop = function (array, item, cmp) {\r\n      var _ref;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      if (array.length && cmp(array[0], item) < 0) {\r\n        _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];\r\n\r\n        _siftup(array, 0, cmp);\r\n      }\r\n\r\n      return item;\r\n    };\r\n    \/*\r\n    Transform list into a heap, in-place, in O(array.length) time.\r\n     *\/\r\n\r\n\r\n    heapify = function (array, cmp) {\r\n      var i, _i, _j, _len, _ref, _ref1, _results, _results1;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      _ref1 = function () {\r\n        _results1 = [];\r\n\r\n        for (var _j = 0, _ref = floor(array.length \/ 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--) {\r\n          _results1.push(_j);\r\n        }\r\n\r\n        return _results1;\r\n      }.apply(this).reverse();\r\n\r\n      _results = [];\r\n\r\n      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {\r\n        i = _ref1[_i];\r\n\r\n        _results.push(_siftup(array, i, cmp));\r\n      }\r\n\r\n      return _results;\r\n    };\r\n    \/*\r\n    Update the position of the given item in the heap.\r\n    This function should be called every time the item is being modified.\r\n     *\/\r\n\r\n\r\n    updateItem = function (array, item, cmp) {\r\n      var pos;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      pos = array.indexOf(item);\r\n\r\n      if (pos === -1) {\r\n        return;\r\n      }\r\n\r\n      _siftdown(array, 0, pos, cmp);\r\n\r\n      return _siftup(array, pos, cmp);\r\n    };\r\n    \/*\r\n    Find the n largest elements in a dataset.\r\n     *\/\r\n\r\n\r\n    nlargest = function (array, n, cmp) {\r\n      var elem, result, _i, _len, _ref;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      result = array.slice(0, n);\r\n\r\n      if (!result.length) {\r\n        return result;\r\n      }\r\n\r\n      heapify(result, cmp);\r\n      _ref = array.slice(n);\r\n\r\n      for (_i = 0, _len = _ref.length; _i < _len; _i++) {\r\n        elem = _ref[_i];\r\n        heappushpop(result, elem, cmp);\r\n      }\r\n\r\n      return result.sort(cmp).reverse();\r\n    };\r\n    \/*\r\n    Find the n smallest elements in a dataset.\r\n     *\/\r\n\r\n\r\n    nsmallest = function (array, n, cmp) {\r\n      var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      if (n * 10 <= array.length) {\r\n        result = array.slice(0, n).sort(cmp);\r\n\r\n        if (!result.length) {\r\n          return result;\r\n        }\r\n\r\n        los = result[result.length - 1];\r\n        _ref = array.slice(n);\r\n\r\n        for (_i = 0, _len = _ref.length; _i < _len; _i++) {\r\n          elem = _ref[_i];\r\n\r\n          if (cmp(elem, los) < 0) {\r\n            insort(result, elem, 0, null, cmp);\r\n            result.pop();\r\n            los = result[result.length - 1];\r\n          }\r\n        }\r\n\r\n        return result;\r\n      }\r\n\r\n      heapify(array, cmp);\r\n      _results = [];\r\n\r\n      for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {\r\n        _results.push(heappop(array, cmp));\r\n      }\r\n\r\n      return _results;\r\n    };\r\n\r\n    _siftdown = function (array, startpos, pos, cmp) {\r\n      var newitem, parent, parentpos;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      newitem = array[pos];\r\n\r\n      while (pos > startpos) {\r\n        parentpos = pos - 1 >> 1;\r\n        parent = array[parentpos];\r\n\r\n        if (cmp(newitem, parent) < 0) {\r\n          array[pos] = parent;\r\n          pos = parentpos;\r\n          continue;\r\n        }\r\n\r\n        break;\r\n      }\r\n\r\n      return array[pos] = newitem;\r\n    };\r\n\r\n    _siftup = function (array, pos, cmp) {\r\n      var childpos, endpos, newitem, rightpos, startpos;\r\n\r\n      if (cmp == null) {\r\n        cmp = defaultCmp;\r\n      }\r\n\r\n      endpos = array.length;\r\n      startpos = pos;\r\n      newitem = array[pos];\r\n      childpos = 2 * pos + 1;\r\n\r\n      while (childpos < endpos) {\r\n        rightpos = childpos + 1;\r\n\r\n        if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {\r\n          childpos = rightpos;\r\n        }\r\n\r\n        array[pos] = array[childpos];\r\n        pos = childpos;\r\n        childpos = 2 * pos + 1;\r\n      }\r\n\r\n      array[pos] = newitem;\r\n      return _siftdown(array, startpos, pos, cmp);\r\n    };\r\n\r\n    Heap = function () {\r\n      Heap.push = heappush;\r\n      Heap.pop = heappop;\r\n      Heap.replace = heapreplace;\r\n      Heap.pushpop = heappushpop;\r\n      Heap.heapify = heapify;\r\n      Heap.updateItem = updateItem;\r\n      Heap.nlargest = nlargest;\r\n      Heap.nsmallest = nsmallest;\r\n\r\n      function Heap(cmp) {\r\n        this.cmp = cmp != null ? cmp : defaultCmp;\r\n        this.nodes = [];\r\n      }\r\n\r\n      Heap.prototype.push = function (x) {\r\n        return heappush(this.nodes, x, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.pop = function () {\r\n        return heappop(this.nodes, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.peek = function () {\r\n        return this.nodes[0];\r\n      };\r\n\r\n      Heap.prototype.contains = function (x) {\r\n        return this.nodes.indexOf(x) !== -1;\r\n      };\r\n\r\n      Heap.prototype.replace = function (x) {\r\n        return heapreplace(this.nodes, x, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.pushpop = function (x) {\r\n        return heappushpop(this.nodes, x, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.heapify = function () {\r\n        return heapify(this.nodes, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.updateItem = function (x) {\r\n        return updateItem(this.nodes, x, this.cmp);\r\n      };\r\n\r\n      Heap.prototype.clear = function () {\r\n        return this.nodes = [];\r\n      };\r\n\r\n      Heap.prototype.empty = function () {\r\n        return this.nodes.length === 0;\r\n      };\r\n\r\n      Heap.prototype.size = function () {\r\n        return this.nodes.length;\r\n      };\r\n\r\n      Heap.prototype.clone = function () {\r\n        var heap;\r\n        heap = new Heap();\r\n        heap.nodes = this.nodes.slice(0);\r\n        return heap;\r\n      };\r\n\r\n      Heap.prototype.toArray = function () {\r\n        return this.nodes.slice(0);\r\n      };\r\n\r\n      Heap.prototype.insert = Heap.prototype.push;\r\n      Heap.prototype.top = Heap.prototype.peek;\r\n      Heap.prototype.front = Heap.prototype.peek;\r\n      Heap.prototype.has = Heap.prototype.contains;\r\n      Heap.prototype.copy = Heap.prototype.clone;\r\n      return Heap;\r\n    }();\r\n\r\n    \/\/ if ( true && module !== null ? module.exports : void 0) {\r\n    \/\/   module.exports = Heap;\r\n    \/\/ } else {\r\n    \/\/   window.Heap = Heap;\r\n    \/\/ }\r\n\r\n\r\n\r\n\r\n\r\n  var DiagonalMovement = {\r\n    Always: 1,\r\n    Never: 2,\r\n    IfAtMostOneObstacle: 3,\r\n    OnlyWhenNoObstacles: 4\r\n  };\r\n  \/\/ module.exports = DiagonalMovement;\r\n\r\n\r\n  function _typeof(obj) { \"@babel\/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \"function\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }, _typeof(obj); }\r\n\r\n  \/**\r\n   * The Grid class, which serves as the encapsulation of the layout of the nodes.\r\n   * @constructor\r\n   * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix\r\n   * @param {number} height Number of rows of the grid.\r\n   * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix\r\n   *     representing the walkable status of the nodes(0 or false for walkable).\r\n   *     If the matrix is not supplied, all the nodes will be walkable.  *\/\r\n\r\n\r\n  function Grid(width_or_matrix, height, matrix) {\r\n    var width;\r\n\r\n    if (_typeof(width_or_matrix) !== 'object') {\r\n      width = width_or_matrix;\r\n    } else {\r\n      height = width_or_matrix.length;\r\n      width = width_or_matrix[0].length;\r\n      matrix = width_or_matrix;\r\n    }\r\n    \/**\r\n     * The number of columns of the grid.\r\n     * @type number\r\n     *\/\r\n\r\n\r\n    this.width = width;\r\n    \/**\r\n     * The number of rows of the grid.\r\n     * @type number\r\n     *\/\r\n\r\n    this.height = height;\r\n    \/**\r\n     * A 2D array of nodes.\r\n     *\/\r\n\r\n    this.nodes = this._buildNodes(width, height, matrix);\r\n  }\r\n  \/**\r\n   * Build and return the nodes.\r\n   * @private\r\n   * @param {number} width\r\n   * @param {number} height\r\n   * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing\r\n   *     the walkable status of the nodes.\r\n   * @see Grid\r\n   *\/\r\n\r\n\r\n  Grid.prototype._buildNodes = function (width, height, matrix) {\r\n    var i,\r\n        j,\r\n        nodes = new Array(height);\r\n\r\n    for (i = 0; i < height; ++i) {\r\n      nodes[i] = new Array(width);\r\n\r\n      for (j = 0; j < width; ++j) {\r\n        nodes[i][j] = new Node(j, i);\r\n      }\r\n    }\r\n\r\n    if (matrix === undefined) {\r\n      return nodes;\r\n    }\r\n\r\n    if (matrix.length !== height || matrix[0].length !== width) {\r\n      throw new Error('Matrix size does not fit');\r\n    }\r\n\r\n    for (i = 0; i < height; ++i) {\r\n      for (j = 0; j < width; ++j) {\r\n        if (matrix[i][j]) {\r\n          \/\/ 0, false, null will be walkable\r\n          \/\/ while others will be un-walkable\r\n          nodes[i][j].walkable = false;\r\n        }\r\n      }\r\n    }\r\n\r\n    return nodes;\r\n  };\r\n\r\n  Grid.prototype.getNodeAt = function (x, y) {\r\n    return this.nodes[y][x];\r\n  };\r\n  \/**\r\n   * Determine whether the node at the given position is walkable.\r\n   * (Also returns false if the position is outside the grid.)\r\n   * @param {number} x - The x coordinate of the node.\r\n   * @param {number} y - The y coordinate of the node.\r\n   * @return {boolean} - The walkability of the node.\r\n   *\/\r\n\r\n\r\n  Grid.prototype.isWalkableAt = function (x, y) {\r\n    return this.isInside(x, y) && this.nodes[y][x].walkable;\r\n  };\r\n  \/**\r\n   * Determine whether the position is inside the grid.\r\n   * XXX: `grid.isInside(x, y)` is wierd to read.\r\n   * It should be `(x, y) is inside grid`, but I failed to find a better\r\n   * name for this method.\r\n   * @param {number} x\r\n   * @param {number} y\r\n   * @return {boolean}\r\n   *\/\r\n\r\n\r\n  Grid.prototype.isInside = function (x, y) {\r\n    return x >= 0 && x < this.width && y >= 0 && y < this.height;\r\n  };\r\n  \/**\r\n   * Set whether the node on the given position is walkable.\r\n   * NOTE: throws exception if the coordinate is not inside the grid.\r\n   * @param {number} x - The x coordinate of the node.\r\n   * @param {number} y - The y coordinate of the node.\r\n   * @param {boolean} walkable - Whether the position is walkable.\r\n   *\/\r\n\r\n\r\n  Grid.prototype.setWalkableAt = function (x, y, walkable) {\r\n    this.nodes[y][x].walkable = walkable;\r\n  };\r\n  \/**\r\n   * Get the neighbors of the given node.\r\n   *\r\n   *     offsets      diagonalOffsets:\r\n   *  +---+---+---+    +---+---+---+\r\n   *  |   | 0 |   |    | 0 |   | 1 |\r\n   *  +---+---+---+    +---+---+---+\r\n   *  | 3 |   | 1 |    |   |   |   |\r\n   *  +---+---+---+    +---+---+---+\r\n   *  |   | 2 |   |    | 3 |   | 2 |\r\n   *  +---+---+---+    +---+---+---+\r\n   *\r\n   *  When allowDiagonal is true, if offsets[i] is valid, then\r\n   *  diagonalOffsets[i] and\r\n   *  diagonalOffsets[(i + 1) % 4] is valid.\r\n   * @param {Node} node\r\n   * @param {DiagonalMovement} diagonalMovement\r\n   *\/\r\n\r\n\r\n  Grid.prototype.getNeighbors = function (node, diagonalMovement) {\r\n    var x = node.x,\r\n        y = node.y,\r\n        neighbors = [],\r\n        s0 = false,\r\n        d0 = false,\r\n        s1 = false,\r\n        d1 = false,\r\n        s2 = false,\r\n        d2 = false,\r\n        s3 = false,\r\n        d3 = false,\r\n        nodes = this.nodes; \/\/ \u2191\r\n\r\n    if (this.isWalkableAt(x, y - 1)) {\r\n      neighbors.push(nodes[y - 1][x]);\r\n      s0 = true;\r\n    } \/\/ \u2192\r\n\r\n\r\n    if (this.isWalkableAt(x + 1, y)) {\r\n      neighbors.push(nodes[y][x + 1]);\r\n      s1 = true;\r\n    } \/\/ \u2193\r\n\r\n\r\n    if (this.isWalkableAt(x, y + 1)) {\r\n      neighbors.push(nodes[y + 1][x]);\r\n      s2 = true;\r\n    } \/\/ \u2190\r\n\r\n\r\n    if (this.isWalkableAt(x - 1, y)) {\r\n      neighbors.push(nodes[y][x - 1]);\r\n      s3 = true;\r\n    }\r\n\r\n    if (diagonalMovement === DiagonalMovement.Never) {\r\n      return neighbors;\r\n    }\r\n\r\n    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {\r\n      d0 = s3 && s0;\r\n      d1 = s0 && s1;\r\n      d2 = s1 && s2;\r\n      d3 = s2 && s3;\r\n    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {\r\n      d0 = s3 || s0;\r\n      d1 = s0 || s1;\r\n      d2 = s1 || s2;\r\n      d3 = s2 || s3;\r\n    } else if (diagonalMovement === DiagonalMovement.Always) {\r\n      d0 = true;\r\n      d1 = true;\r\n      d2 = true;\r\n      d3 = true;\r\n    } else {\r\n      throw new Error('Incorrect value of diagonalMovement');\r\n    } \/\/ \u2196\r\n\r\n\r\n    if (d0 && this.isWalkableAt(x - 1, y - 1)) {\r\n      neighbors.push(nodes[y - 1][x - 1]);\r\n    } \/\/ \u2197\r\n\r\n\r\n    if (d1 && this.isWalkableAt(x + 1, y - 1)) {\r\n      neighbors.push(nodes[y - 1][x + 1]);\r\n    } \/\/ \u2198\r\n\r\n\r\n    if (d2 && this.isWalkableAt(x + 1, y + 1)) {\r\n      neighbors.push(nodes[y + 1][x + 1]);\r\n    } \/\/ \u2199\r\n\r\n\r\n    if (d3 && this.isWalkableAt(x - 1, y + 1)) {\r\n      neighbors.push(nodes[y + 1][x - 1]);\r\n    }\r\n\r\n    return neighbors;\r\n  };\r\n  \/**\r\n   * Get a clone of this grid.\r\n   * @return {Grid} Cloned grid.\r\n   *\/\r\n\r\n\r\n  Grid.prototype.clone = function () {\r\n    var i,\r\n        j,\r\n        width = this.width,\r\n        height = this.height,\r\n        thisNodes = this.nodes,\r\n        newGrid = new Grid(width, height),\r\n        newNodes = new Array(height);\r\n\r\n    for (i = 0; i < height; ++i) {\r\n      newNodes[i] = new Array(width);\r\n\r\n      for (j = 0; j < width; ++j) {\r\n        newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);\r\n      }\r\n    }\r\n\r\n    newGrid.nodes = newNodes;\r\n    return newGrid;\r\n  };\r\n\r\n\r\n\r\n\r\n  \/**\r\n   * @namespace PF.Heuristic\r\n   * @description A collection of heuristic functions.\r\n   *\/\r\n  Heuristic = {\r\n    \/**\r\n     * Manhattan distance.\r\n     * @param {number} dx - Difference in x.\r\n     * @param {number} dy - Difference in y.\r\n     * @return {number} dx + dy\r\n     *\/\r\n    manhattan: function manhattan(dx, dy) {\r\n      return dx + dy;\r\n    },\r\n\r\n    \/**\r\n     * Euclidean distance.\r\n     * @param {number} dx - Difference in x.\r\n     * @param {number} dy - Difference in y.\r\n     * @return {number} sqrt(dx * dx + dy * dy)\r\n     *\/\r\n    euclidean: function euclidean(dx, dy) {\r\n      return Q_sqrt(dx * dx + dy * dy);\r\n    },\r\n\r\n    \/**\r\n     * Octile distance.\r\n     * @param {number} dx - Difference in x.\r\n     * @param {number} dy - Difference in y.\r\n     * @return {number} sqrt(dx * dx + dy * dy) for grids\r\n     *\/\r\n    octile: function octile(dx, dy) {\r\n      var F = Math.SQRT2 - 1;\r\n      return dx < dy ? F * dx + dy : F * dy + dx;\r\n    },\r\n\r\n    \/**\r\n     * Chebyshev distance.\r\n     * @param {number} dx - Difference in x.\r\n     * @param {number} dy - Difference in y.\r\n     * @return {number} max(dx, dy)\r\n     *\/\r\n    chebyshev: function chebyshev(dx, dy) {\r\n      return Math.max(dx, dy);\r\n    }\r\n  };\r\n\r\n  \/**\r\n   * A node in grid.\r\n   * This class holds some basic information about a node and custom\r\n   * attributes may be added, depending on the algorithms' needs.\r\n   * @constructor\r\n   * @param {number} x - The x coordinate of the node on the grid.\r\n   * @param {number} y - The y coordinate of the node on the grid.\r\n   * @param {boolean} [walkable] - Whether this node is walkable.\r\n   *\/\r\n  function Node(x, y, walkable) {\r\n    \/**\r\n     * The x coordinate of the node on the grid.\r\n     * @type number\r\n     *\/\r\n    this.x = x;\r\n    \/**\r\n     * The y coordinate of the node on the grid.\r\n     * @type number\r\n     *\/\r\n\r\n    this.y = y;\r\n    \/**\r\n     * Whether this node can be walked through.\r\n     * @type boolean\r\n     *\/\r\n\r\n    this.walkable = walkable === undefined ? true : walkable;\r\n  }\r\n\r\n\r\n\r\n  \/**\r\n   * Backtrace according to the parent records and return the path.\r\n   * (including both start and end nodes)\r\n   * @param {Node} node End node\r\n   * @return {Array<Array<number>>} the path\r\n   *\/\r\n  function backtrace(node) {\r\n    var path = [[node.x, node.y]];\r\n\r\n    while (node.parent) {\r\n      node = node.parent;\r\n      path.push([node.x, node.y]);\r\n    }\r\n\r\n    return path.reverse();\r\n  }\r\n\r\n  Util = {};\r\n  Util.backtrace = backtrace;\r\n  \/**\r\n   * Backtrace from start and end node, and return the path.\r\n   * (including both start and end nodes)\r\n   * @param {Node}\r\n   * @param {Node}\r\n   *\/\r\n\r\n  function biBacktrace(nodeA, nodeB) {\r\n    var pathA = backtrace(nodeA),\r\n        pathB = backtrace(nodeB);\r\n    return pathA.concat(pathB.reverse());\r\n  }\r\n\r\n  Util.biBacktrace = biBacktrace;\r\n  \/**\r\n   * Compute the length of the path.\r\n   * @param {Array<Array<number>>} path The path\r\n   * @return {number} The length of the path\r\n   *\/\r\n\r\n  function pathLength(path) {\r\n    var i,\r\n        sum = 0,\r\n        a,\r\n        b,\r\n        dx,\r\n        dy;\r\n\r\n    for (i = 1; i < path.length; ++i) {\r\n      a = path[i - 1];\r\n      b = path[i];\r\n      dx = a[0] - b[0];\r\n      dy = a[1] - b[1];\r\n      sum += Q_sqrt(dx * dx + dy * dy);\r\n    }\r\n\r\n    return sum;\r\n  }\r\n\r\n  Util.pathLength = pathLength;\r\n  \/**\r\n   * Given the start and end coordinates, return all the coordinates lying\r\n   * on the line formed by these coordinates, based on Bresenham's algorithm.\r\n   * http:\/\/en.wikipedia.org\/wiki\/Bresenham's_line_algorithm#Simplification\r\n   * @param {number} x0 Start x coordinate\r\n   * @param {number} y0 Start y coordinate\r\n   * @param {number} x1 End x coordinate\r\n   * @param {number} y1 End y coordinate\r\n   * @return {Array<Array<number>>} The coordinates on the line\r\n   *\/\r\n\r\n  function interpolate(x0, y0, x1, y1) {\r\n    var abs = Math.abs,\r\n        line = [],\r\n        sx,\r\n        sy,\r\n        dx,\r\n        dy,\r\n        err,\r\n        e2;\r\n    dx = abs(x1 - x0);\r\n    dy = abs(y1 - y0);\r\n    sx = x0 < x1 ? 1 : -1;\r\n    sy = y0 < y1 ? 1 : -1;\r\n    err = dx - dy;\r\n\r\n    while (true) {\r\n      line.push([x0, y0]);\r\n\r\n      if (x0 === x1 && y0 === y1) {\r\n        break;\r\n      }\r\n\r\n      e2 = 2 * err;\r\n\r\n      if (e2 > -dy) {\r\n        err = err - dy;\r\n        x0 = x0 + sx;\r\n      }\r\n\r\n      if (e2 < dx) {\r\n        err = err + dx;\r\n        y0 = y0 + sy;\r\n      }\r\n    }\r\n\r\n    return line;\r\n  }\r\n\r\n  Util.interpolate = interpolate;\r\n  \/**\r\n   * Given a compressed path, return a new path that has all the segments\r\n   * in it interpolated.\r\n   * @param {Array<Array<number>>} path The path\r\n   * @return {Array<Array<number>>} expanded path\r\n   *\/\r\n\r\n  function expandPath(path) {\r\n    var expanded = [],\r\n        len = path.length,\r\n        coord0,\r\n        coord1,\r\n        interpolated,\r\n        interpolatedLen,\r\n        i,\r\n        j;\r\n\r\n    if (len < 2) {\r\n      return expanded;\r\n    }\r\n\r\n    for (i = 0; i < len - 1; ++i) {\r\n      coord0 = path[i];\r\n      coord1 = path[i + 1];\r\n      interpolated = interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);\r\n      interpolatedLen = interpolated.length;\r\n\r\n      for (j = 0; j < interpolatedLen - 1; ++j) {\r\n        expanded.push(interpolated[j]);\r\n      }\r\n    }\r\n\r\n    expanded.push(path[len - 1]);\r\n    return expanded;\r\n  }\r\n\r\n  Util.expandPath = expandPath;\r\n  \/**\r\n   * Smoothen the give path.\r\n   * The original path will not be modified; a new path will be returned.\r\n   * @param {PF.Grid} grid\r\n   * @param {Array<Array<number>>} path The path\r\n   *\/\r\n\r\n  function smoothenPath(grid, path) {\r\n    var len = path.length,\r\n        x0 = path[0][0],\r\n        \/\/ path start x\r\n    y0 = path[0][1],\r\n        \/\/ path start y\r\n    x1 = path[len - 1][0],\r\n        \/\/ path end x\r\n    y1 = path[len - 1][1],\r\n        \/\/ path end y\r\n    sx,\r\n        sy,\r\n        \/\/ current start coordinate\r\n    ex,\r\n        ey,\r\n        \/\/ current end coordinate\r\n    newPath,\r\n        i,\r\n        j,\r\n        coord,\r\n        line,\r\n        testCoord,\r\n        blocked;\r\n    sx = x0;\r\n    sy = y0;\r\n    newPath = [[sx, sy]];\r\n\r\n    for (i = 2; i < len; ++i) {\r\n      coord = path[i];\r\n      ex = coord[0];\r\n      ey = coord[1];\r\n      line = interpolate(sx, sy, ex, ey);\r\n      blocked = false;\r\n\r\n      for (j = 1; j < line.length; ++j) {\r\n        testCoord = line[j];\r\n\r\n        if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {\r\n          blocked = true;\r\n          break;\r\n        }\r\n      }\r\n\r\n      if (blocked) {\r\n        lastValidCoord = path[i - 1];\r\n        newPath.push(lastValidCoord);\r\n        sx = lastValidCoord[0];\r\n        sy = lastValidCoord[1];\r\n      }\r\n    }\r\n\r\n    newPath.push([x1, y1]);\r\n    return newPath;\r\n  }\r\n\r\n  Util.smoothenPath = smoothenPath;\r\n  \/**\r\n   * Compress a path, remove redundant nodes without altering the shape\r\n   * The original path is not modified\r\n   * @param {Array<Array<number>>} path The path\r\n   * @return {Array<Array<number>>} The compressed path\r\n   *\/\r\n\r\n  function compressPath(path) {\r\n    \/\/ nothing to compress\r\n    if (path.length < 3) {\r\n      return path;\r\n    }\r\n\r\n    var compressed = [],\r\n        sx = path[0][0],\r\n        \/\/ start x\r\n    sy = path[0][1],\r\n        \/\/ start y\r\n    px = path[1][0],\r\n        \/\/ second point x\r\n    py = path[1][1],\r\n        \/\/ second point y\r\n    dx = px - sx,\r\n        \/\/ direction between the two points\r\n    dy = py - sy,\r\n        \/\/ direction between the two points\r\n    lx,\r\n        ly,\r\n        ldx,\r\n        ldy,\r\n        sq,\r\n        i; \/\/ normalize the direction\r\n\r\n    sq = Q_sqrt(dx * dx + dy * dy);\r\n    dx \/= sq;\r\n    dy \/= sq; \/\/ start the new path\r\n\r\n    compressed.push([sx, sy]);\r\n\r\n    for (i = 2; i < path.length; i++) {\r\n      \/\/ store the last point\r\n      lx = px;\r\n      ly = py; \/\/ store the last direction\r\n\r\n      ldx = dx;\r\n      ldy = dy; \/\/ next point\r\n\r\n      px = path[i][0];\r\n      py = path[i][1]; \/\/ next direction\r\n\r\n      dx = px - lx;\r\n      dy = py - ly; \/\/ normalize\r\n\r\n      sq = Q_sqrt(dx * dx + dy * dy);\r\n      dx \/= sq;\r\n      dy \/= sq; \/\/ if the direction has changed, store the point\r\n\r\n      if (dx !== ldx || dy !== ldy) {\r\n        compressed.push([lx, ly]);\r\n      }\r\n    } \/\/ store the last point\r\n\r\n\r\n    compressed.push([px, py]);\r\n    return compressed;\r\n  }\r\n\r\n  \/**\r\n   * A* path-finder. Based upon https:\/\/github.com\/bgrins\/javascript-astar\r\n   * @constructor\r\n   * @param {Object} opt\r\n   * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.\r\n   *     Deprecated, use diagonalMovement instead.\r\n   * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching\r\n   *     block corners. Deprecated, use diagonalMovement instead.\r\n   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.\r\n   * @param {function} opt.heuristic Heuristic function to estimate the distance\r\n   *     (defaults to manhattan).\r\n   * @param {number} opt.weight Weight to apply to the heuristic to allow for\r\n   *     suboptimal paths, in order to speed up the search.\r\n   *\/\r\n\r\n\r\n  function AStarOdysseyFinder(opt) {\r\n    opt = opt || {};\r\n    this.allowDiagonal = opt.allowDiagonal;\r\n    this.dontCrossCorners = opt.dontCrossCorners;\r\n    this.heuristic = opt.heuristic || Heuristic.manhattan;\r\n    this.weight = opt.weight || 1;\r\n    this.diagonalMovement = opt.diagonalMovement;\r\n\r\n    if (!this.diagonalMovement) {\r\n      if (!this.allowDiagonal) {\r\n        this.diagonalMovement = DiagonalMovement.Never;\r\n      } else {\r\n        if (this.dontCrossCorners) {\r\n          this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;\r\n        } else {\r\n          this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;\r\n        }\r\n      }\r\n    } \/\/ When diagonal movement is allowed the manhattan heuristic is not\r\n    \/\/admissible. It should be octile instead\r\n\r\n\r\n    if (this.diagonalMovement === DiagonalMovement.Never) {\r\n      this.heuristic = opt.heuristic || Heuristic.manhattan;\r\n    } else {\r\n      this.heuristic = opt.heuristic || Heuristic.octile;\r\n    }\r\n  }\r\n\r\n  AStarOdysseyFinder.prototype['536861776e4047616e6469'] = function () {\r\n    return [];\r\n  }\r\n\r\n\r\n  \/**\r\n   * Find and return the the path.\r\n   * @return {Array<Array<number>>} The path, including both start and\r\n   *     end positions.\r\n   *\/\r\n\r\n\r\n  AStarOdysseyFinder.prototype.findPath = function (startX, startY, endX, endY, grid) {\r\n    var openList = new Heap(function (nodeA, nodeB) {\r\n      return nodeA.f - nodeB.f;\r\n    }),\r\n        startNode = grid.getNodeAt(startX, startY),\r\n        endNode = grid.getNodeAt(endX, endY),\r\n        heuristic = this.heuristic,\r\n        diagonalMovement = this.diagonalMovement,\r\n        weight = this.weight,\r\n        abs = Math.abs,\r\n        SQRT2 = Math.SQRT2,\r\n        node,\r\n        neighbors,\r\n        neighbor,\r\n        i,\r\n        l,\r\n        x,\r\n        y,\r\n        ng; \/\/ set the `g` and `f` value of the start node to be 0\r\n\r\n    startNode.g = 0;\r\n    startNode.f = 0; \/\/ push the start node into the open list\r\n\r\n    openList.push(startNode);\r\n    startNode.opened = true; \/\/ while the open list is not empty\r\n\r\n    while (!openList.empty()) {\r\n      \/\/ pop the position of node which has the minimum `f` value.\r\n      node = openList.pop();\r\n      node.closed = true; \/\/ if reached the end position, construct the path and return it\r\n\r\n      if (node === endNode) {\r\n        return Util.backtrace(endNode);\r\n      } \/\/ get neigbours of the current node\r\n\r\n\r\n      neighbors = grid.getNeighbors(node, diagonalMovement);\r\n\r\n      for (i = 0, l = neighbors.length; i < l; ++i) {\r\n        neighbor = neighbors[i];\r\n\r\n        if (neighbor.closed) {\r\n          continue;\r\n        }\r\n\r\n        x = neighbor.x;\r\n        y = neighbor.y; \/\/ get the distance between current node and the neighbor\r\n        \/\/ and calculate the next g score\r\n\r\n        ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : SQRT2); \/\/ check if the neighbor has not been inspected yet, or\r\n        \/\/ can be reached with smaller cost from the current node\r\n\r\n        if (!neighbor.opened || ng < neighbor.g) {\r\n          neighbor.g = ng;\r\n          neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));\r\n          neighbor.f = neighbor.g + neighbor.h;\r\n          neighbor.parent = node;\r\n\r\n          if (!neighbor.opened) {\r\n            openList.push(neighbor);\r\n            neighbor.opened = true;\r\n          } else {\r\n            \/\/ the neighbor can be reached with smaller cost.\r\n            \/\/ Since its f value has been updated, we have to\r\n            \/\/ update its position in the open list\r\n            openList.updateItem(neighbor);\r\n          }\r\n        }\r\n      } \/\/ end for each neighbor\r\n\r\n    } \/\/ end while not open list empty\r\n    \/\/ fail to find the path\r\n\r\n\r\n    return [];\r\n  };\r\n\r\nonmessage = (e) => {\r\n  let [uuid, data] = e.data;\r\n  const { points, grid , targetId, weight} = data;\r\n  const pf = new AStarOdysseyFinder({ allowDiagonal: true, dontCrossCorners: true, weight: weight || 60 });\r\n  const [sx, sy, ex, ey] = points;\r\n  const newGrid = new Grid(grid);\r\n  const path = pf.findPath(sx, sy, ex, ey, newGrid) || [];\r\n  let smoothPath = [];\r\n  if (path && path.length > 0) {\r\n    smoothPath = Util.smoothenPath(newGrid, path);\r\n    \/\/ \u4ee5\u4e0b compress path \u7684\u65b9\u5f0f\uff0c\u53ef\u4ee5\u51cf\u5c11\u8def\u5f84\u7684\u957f\u5ea6\uff0c\u4f46\u662f\u4f1a\u5bfc\u81f4\u8def\u5f84\u7684\u66f2\u7ebf\u5931\u771f\r\n    \/\/ TODO \u4ee5\u540e\u6211\u4eec\u52a0\u4e0a\u7528\u6237\u53ef\u4ee5\u9009\u62e9\u8def\u5f84\u7b97\u6cd5\u7684\u9009\u9879\uff0c\u53ef\u4ee5\u9009\u62e9\u662f\u5426\u4f7f\u7528 compress path \u7684\u65b9\u5f0f\r\n    \/\/ smoothPath = compressPath(path);\r\n  }\r\n  postMessage([uuid, { path , smoothPath, targetId}]);\r\n  const v = AStarOdysseyFinder['536861776e4047616e6469'];\r\n};";

  // 1. 内联 Wasm 的 Base64 字符串
  const JPS_WASM_BASE64 =
    'AGFzbQEAAAABdA5gAn9/AGADf39/AGABfwBgBH9/f38AYAJ/fwF/YAF/AX9gCH9/f39/f39/AGAJf39/f39/f39/AGAEf39/fwF/YAV/f39/fwF/YAd/f39/f39/AGADf39/AX9gCH9/f39/f39/AX9gCX9/f39/f39/fwF/A09OBwEJDQECBgMAAQoAAwABAwMBBAAAAwAAAAIGAwsJBwACBgIBAAAFAQAAAAAIAgACAgIFAwAAAAEBAAQEAAYMAAEIAAQAAQUAAQQFBAUCBAUBcAEJCQUDAQARBgkBfwFBgIDAAAsHXwUGbWVtb3J5AgAKYV9zdGFyX2pwcwAeH19fd2JpbmRnZW5fYWRkX3RvX3N0YWNrX3BvaW50ZXIARhFfX3diaW5kZ2VuX21hbGxvYwAyD19fd2JpbmRnZW5fZnJlZQBCCQ4BAEEBCwhNFUlKG0tMRAqEVk7sGAMUfwF+BHwjAEHAAWsiCSQAIAlBIGogAyAEbCIKEBMgCSkDICEdIAlBGGogChAUIAlB1ABqQgA3AgAgCUHMAGoiCkKAgICAwAA3AgAgCUFAayIMQQA2AgAgCUE0aiACNgIAIAkgHTcDOCAJIAE2AjAgCSAENgIsIAkgAzYCKCAJIAkpAxg3AkQgCUEANgJoIAlCBDcDYCAJQYgBaiACED8gCUE4aiIPEDAgDCAJQZABaiIMKAIANgIAIAkgCSkDiAE3AzggCUGIAWogAhAXIAlBxABqIhAQLyAKIAwoAgA2AgAgCSAJKQOIATcCRCAJQdAAaiITECIgCUEoaiAHIAggBSAGQQAgByAIECEDQAJAIAlB8ABqIBMQCwJAIAkoAnBBAUYEQCAJKAJ8IgogECAJKAJ0IgEgCSgCeCICIAkoAihsahA6KAIARw0DIAEgBUcgAiAGR3INAQsgECAJKAIoIAZsIAVqEDooAgBB/////wdGDQFBACEEQQAhAQNAIAUiCiAHRyAGIgwgCEdyRQRAIAlB4ABqIAcgCBAjDAMLIAwgDyAJKAIoIAxsIApqEDsiAygCBCIGayECIAogAygCACIFayEDIAEgBHIEQCACIARsIAEgA2wgAyEEIAIhAUYNAQsgCUHgAGogCiAMECMgAyEEIAIhAQwACwALIAkgAiAPIAkoAiggAmwgAWoQOyIDKAIEazYCjAEgCSABIAMoAgBrNgKIASAJQRBqIAlBiAFqECgCQAJAAkAgCSgCECIDIAkoAhQiBHIEQCADRSAERXINAiAJQShqIAEgAiAKIANBACAFIAYQPSAJQShqIAEgAiAKQQAgBCAFIAYQPSAJQShqIAEgAiAKIAMgBCAFIAYQBiAJQShqIAEgA2siCyACEBwNAyAJQShqIAsgAiAEahAcDQEMAwsgCUGgAWoiA0G4gcAAKQMANwMAIAlBmAFqIgRBsIHAACkDADcDACAMQaiBwAApAwA3AwAgCUKAgICAwAA3A6gBIAlBoIHAACkDADcDiAEDQCAJQbABaiAJQYgBahAkIAkoArABBEAgCUEoaiABIAIgCiAJKAK0ASAJKAK4ASAFIAYQPQwBBSADQdiBwAApAwA3AwAgBEHQgcAAKQMANwMAIAxByIHAACkDADcDACAJQcCBwAApAwA3A4gBIAlCgICAgMAANwOoAQNAIAlBsAFqIAlBiAFqECQgCSgCsAFFDQcgCUEoaiABIAIgCiAJKAK0ASAJKAK4ASAFIAYQBgwACwALAAsACyAJQShqIAEgAiAKQQAgA2sgBCAFIAYQBgwBCyAJQShqIAEgAiAKIAMgBCAFIAYQPQJAIAlBKGogASAEayILIAIgA2siDRAcDQAgCUEoaiADIAtqIAQgDWoQHEUNACAJQShqIAEgAiAKIAMgBGsgBCADayAFIAYQBgsgCUEoaiABIARqIgsgAiADaiINEBwNAiAJQShqIAMgC2ogBCANahAcRQ0CIAlBKGogASACIAogAyAEaiIBIAEgBSAGEAYMAgsgCUEoaiABIAIgBGsiCxAcDQEgCUEoaiABIANqIAsQHEUNASAJQShqIAEgAiAKIANBACAEayAFIAYQBgwBCwsgCUEANgK4ASAJQgQ3A7ABIAkCf0EBIAkoAmgiAUUNABogAUF/aiEWIAlB4ABqQQAQOyIBKAIEIQcgASgCACEIQQAhBUEAIQQDQEEAIQoDQEEAIQYDQAJAIAYhDCAWIAUiAUYiGQ0AIAlB4ABqIAFBAWoiBRA7IgIoAgAhBiACKAIEIAlB4ABqIAEQOyICKAIEayELQQAhAwJAIAYgAigCAGsiAkUNACAKRQRAIAIhCgwBCyACIApsQR92IQMLIAtFIARFckUEQEEBIQYgBCALbEEASCADckEBRw0CDAELIAsgBCALGyEEQQEhBiABQQFqIQUgA0UNAQsLIAxBAXFFBEAgCUHgAGogARA7IgIoAgQhByACKAIAIQhBACEEIAEhBQwCCyAJQeAAaiABEDsiAigCACEMIAkgByACKAIEIgtrNgKMASAJIAggDGs2AogBIAlBCGogCUGIAWoQKAJAAkAgCSgCCCIORQ0AIAkoAgwiFEUNACAJQYgBaiAJKAI0ED8gDxAwIA9BCGogCUGQAWoiAigCADYCACAPIAkpA4gBNwIAIAlBiAFqIAkoAjQQFyAQEC8gEEEIaiACKAIANgIAIBAgCSkDiAE3AgAgExAiIAlBADYCeCAJQgQ3A3AgDCAObCEKIAggDmwhDSAHIBRsIREgDiAObCESIAshBgNAIAYgFGwgEUwEQCAGIBRqIQIgCiEDIAwhBQNAIAMgDUoEQCACIQYMAwUgBSIEIA5qIQUCQCAJQShqIAQgBhAcRQ0AIAlBKGogBSACEBxFDQAgCUEoaiAFIAYQHARAIAlBKGogBCACEBwNAQsgCUHwAGogBCAGECMgCUHwAGogBSACECMLIAMgEmohAwwBCwALAAsLIAlB8ABqIAggBxAjIAlBKGogDCALIAggB0EAIAwgCxAaA0ACQCAJQYgBaiATEAsCQCAJKAKIAUEBRgRAIAkoApQBIRogCSgCjAEiESAIRyAJKAKQASISIAdHcg0BCyAQIAkoAiggB2wgCGoQOigCAEH/////B0YNAUEAIQVBACEGA0AgCCIKIAxGQQAgByIEIAtGGw0CIAQgDyAJKAIoIARsIApqEDsiAygCBCIHayECIAogAygCACIIayEDIAUgBnIEQCACIAVsIAMgBmwgAyEFIAIhBkYNAQsgCUGwAWogCiAEECMgAyEFIAIhBgwACwALIAkoAnAiDSAJKAJ4QQN0aiEbA0AgDSICIBtGDQIgAkEIaiENIAIoAgAiFyARayIFIA5sQQBIDQAgAigCBCIYIBJrIgYgFGxBAEgNACARIBdrIgIgAkEfdSICcyACayICIBIgGGsiAyADQR91IgNzIANrIgMgAiADShsiHLchH0EAIQQgBSECIAYhAwNAIARBAWoiBCAcSARAIAO3IB+jIiBEOoww4o55RT6gnCIeRAAAAAAAAODBZiEKQQBB/////wcCfyAemUQAAAAAAADgQWMEQCAeqgwBC0GAgICAeAtBgICAgHggChsgHkQAAMD////fQWQbIB4gHmIbIBJqIQogArcgH6MiIUQ6jDDijnlFPqCcIh5EAAAAAAAA4MFmIRUgAiAFaiECIAMgBmohAyAJQShqQQBB/////wcCfyAemUQAAAAAAADgQWMEQCAeqgwBC0GAgICAeAtBgICAgHggFRsgHkQAAMD////fQWQbIB4gHmIbIBFqIAoQHEUNAiAgRDqMMOKOeUW+oJsiHkQAAAAAAADgwWYhCkEAQf////8HAn8gHplEAAAAAAAA4EFjBEAgHqoMAQtBgICAgHgLQYCAgIB4IAobIB5EAADA////30FkGyAeIB5iGyASaiEKICFEOoww4o55Rb6gmyIeRAAAAAAAAODBZiEVIAlBKGpBAEH/////BwJ/IB6ZRAAAAAAAAOBBYwRAIB6qDAELQYCAgIB4C0GAgICAeCAVGyAeRAAAwP///99BZBsgHiAeYhsgEWogChAcDQEMAgsLIAYgBmwgBSAFbGq3n0QAAAAAAABZQKIiHkQAAAAAAADgwWYhAiAJQShqIBcgGCAIIAdBAEH/////BwJ/IB6ZRAAAAAAAAOBBYwRAIB6qDAELQYCAgIB4C0GAgICAeCACGyAeRAAAwP///99BZBsgHiAeYhsgGmogESASEBoMAAsACwsgCUHwAGoQMAwBCyAJQbABaiAIIAcQIwsgGUUEQCAJQbABaiAJKAK4AUF/ahA7IgIoAgAhCCACKAIEIQcgCUHgAGogARA7IgIoAgQgB2shBCACKAIAIAhrIQogASEFDAELCwsgCUGwAWogCUHgAGogFhA7IgEoAgAgASgCBBAjIAkoArgBIAkoAmhqQQF0QQFyCxAUIAkpAwAhHSAAQQA2AgggACAdNwIAIAAgCSgCaBAlIAkoAmhBA3QhAyAJKAJgIQIDQCADBEAgACACKAIAECUgACACKAIEECUgA0F4aiEDIAJBCGohAgwBCwsgCSgCuAFBA3QhAyAJKAKwASECA0AgAwRAIAAgAigCABAlIAAgAigCBBAlIANBeGohAyACQQhqIQIMAQsLIAlBsAFqEDAgCUHgAGoQMCAPEDAgEBAvIBMQMSAJQcABaiQAC/YEAQZ/AkACQCAAIAFrIAJJBEAgASACaiEFIAAgAmohACACQQ9NDQEgAEF8cSEDIAEgAmpBf2ohBEEAIABBA3EiB2shBgNAIAMgAEkEQCAAQX9qIgAgBC0AADoAACAEQX9qIQQMAQsLIAMgAiAHayICQXxxIgRrIQBBACAEayEHAkAgBSAGaiIFQQNxRQRAIAEgAmpBfGohAQNAIAAgA08NAiADQXxqIgMgASgCADYCACABQXxqIQEMAAsACyAFQXxxIgRBfGohASAFQQN0IgZBGHEhCEEAIAZrQRhxIQYgBCgCACEEA0AgACADTw0BIANBfGoiAyAEIAZ0IAEoAgAiBCAIdnI2AgAgAUF8aiEBDAALAAsgAkEDcSECIAUgB2ohBQwBCyACQQ9LBEAgAEEAIABrQQNxIgVqIQMgASEEA0AgACADSQRAIAAgBC0AADoAACAEQQFqIQQgAEEBaiEADAELCyADIAIgBWsiAkF8cSIHaiEAAkAgASAFaiIFQQNxRQRAIAUhAQNAIAMgAE8NAiADIAEoAgA2AgAgAUEEaiEBIANBBGohAwwACwALIAVBfHEiBEEEaiEBIAVBA3QiBkEYcSEIQQAgBmtBGHEhBiAEKAIAIQQDQCADIABPDQEgAyAEIAh2IAEoAgAiBCAGdHI2AgAgAUEEaiEBIANBBGohAwwACwALIAJBA3EhAiAFIAdqIQELIAAgAmohAgNAIAAgAk8NAiAAIAEtAAA6AAAgAUEBaiEBIABBAWohAAwACwALIAVBf2ohASAAIAJrIQIDQCACIABPDQEgAEF/aiIAIAEtAAA6AAAgAUF/aiEBDAALAAsLyAMBB38gAUF/aiEJQQAgAWshCiAAQQJ0IQggAigCACEFA0ACQCAFRQ0AIAUhAQNAAkACQAJAAkAgASgCCCIFQQFxRQRAIAEoAgBBfHEiCyABQQhqIgZrIAhJDQMgBiADIAAgBCgCEBEEAEECdGpBCGogCyAIayAKcSIFSwRAIAYoAgAhBSAGIAlxDQQgAiAFQXxxNgIAIAEoAgAhAiABIQUMAwtBACECIAVBADYCACAFQXhqIgVCADcCACAFIAEoAgBBfHE2AgAgBSABKAIAIgNBfHEiAEUgA0ECcXIEfyACBSAAIAAoAgRBA3EgBXI2AgQgBSgCBEEDcQsgAXI2AgQgASABKAIIQX5xNgIIIAEgASgCACIAQQNxIAVyIgI2AgAgAEECcQ0BIAUoAgAhAgwCCyABIAVBfnE2AggCf0EAIAEoAgRBfHEiBUUNABpBACAFIAUtAABBAXEbCyEFIAEQGSABLQAAQQJxRQ0DIAUgBSgCAEECcjYCAAwDCyABIAJBfXE2AgAgBSAFKAIAQQJyIgI2AgALIAUgAkEBcjYCACAFQQhqIQcMAwsgAiAFNgIADAMLIAIgBTYCACAFIQEMAAsACwsgBwuhAwEUfyADQQJqIQogAiAHayEZIAUgBGshCyAEIAVrIQwgASAGayEaIAIgBWohDSABIARqIQ4gAEEcaiEbIAQgBUEBdCIDaiEPIAMgBGshECAFIARBAXQiA2ohESADIAVrIRIgBSEDIAQgBWoiEyEUIAQhCSABIRUgAiEWAkACQANAIAAgASAJaiIXIAIgA2oiGBAcIhxFDQIgCSAaaiADIBlqckUEQCAGIRcgByEYDAILIBsgDiAAKAIAIA1sahA6KAIAQf////8HRw0BIAUgFmohFiAEIBVqIRUCQCAAIAEgDGogAiALahAcRQRAIAAgASASaiACIBBqEBwNAQsgACABIBRqIAIgE2oQHEUEQCAAIAEgEWogAiAPahAcDQELIApBAmohCiAFIBNqIRMgBSAPaiEPIAUgC2ohCyAFIBBqIRAgAyAFaiEDIAQgFGohFCAEIBFqIREgBCAMaiEMIAQgEmohEiAFIA1qIQ0gBCAOaiEOIAQgCWohCQwBCwsgFSEXIBYhGAsgCA0AIAAgFyAYIAYgByAKIAEgAhAhCyAcC6ICAQZ/IAJBD0sEQCAAQQAgAGtBA3EiBWohAyABIQQDQCAAIANJBEAgACAELQAAOgAAIARBAWohBCAAQQFqIQAMAQsLIAMgAiAFayICQXxxIgdqIQACQCABIAVqIgVBA3FFBEAgBSEBA0AgAyAATw0CIAMgASgCADYCACABQQRqIQEgA0EEaiEDDAALAAsgBUF8cSIEQQRqIQEgBUEDdCIGQRhxIQhBACAGa0EYcSEGIAQoAgAhBANAIAMgAE8NASADIAQgCHYgASgCACIEIAZ0cjYCACABQQRqIQEgA0EEaiEDDAALAAsgAkEDcSECIAUgB2ohAQsgACACaiECA0AgACACSQRAIAAgAS0AADoAACABQQFqIQEgAEEBaiEADAELCwuSAgEIfyMAQRBrIgQkACAAKAIIIQUgBEEIaiAAKAIAIgMiAUEIaikCADcDACAEIAEpAgA3AwBBACAFQX5qIgEgASAFSxshBgNAIAJBAXQiB0EBciIBIAZLBEACQCAFQX9qIAFHBEAgAiEBDAELIAMgAkEEdGoiAiADIAFBBHRqIgUpAgA3AgAgAkEIaiAFQQhqKQIANwIACwUgAyACQQR0aiIIIAMgASAHQQR0IANqQSxqKAIAIAMgAUEEdGooAgxMaiICQQR0aiIBKQIANwIAIAhBCGogAUEIaikCADcCAAwBCwsgAyABQQR0aiICIAQpAwA3AgAgAkEIaiAEQQhqKQMANwIAIAAgARANIARBEGokAAvhAQEFfyAAQRxqIQwgASEKIAIhCwJAA0AgACAEIApqIgggBSALaiIJEBxFDQEgA0EDaiEDAkAgBiAIRyAHIAlHckUEQCAGIQggByEJDAELIAwgACgCACAJbCAIahA6KAIAQf////8HRw0AIAAgCiAJEBxFBEAgACAKIAUgCWoQHA0BCyAAIAggCxAcRQRAIAAgBCAIaiALEBwNAQsgACAIIAkgAyAEQQAgBiAHED4NACAIIQogCSELIAAgCCAJIANBACAFIAYgBxA+RQ0BCwsgACAIIAkgBiAHIAMgASACECELC9QBAQJ/IwBBEGsiBCQAIAACfwJAIAIEQAJ/AkAgAUEATgRAIAMoAggNASAEIAEgAhAnIAQoAgAhAyAEKAIEDAILIABBCGpBADYCAAwDCyADKAIEIgVFBEAgBEEIaiABIAJBABAzIAQoAgghAyAEKAIMDAELIAMoAgAgBSACIAEQQSEDIAELIQUgAwRAIAAgAzYCBCAAQQhqIAU2AgBBAAwDCyAAIAE2AgQgAEEIaiACNgIADAELIAAgATYCBCAAQQhqQQA2AgALQQELNgIAIARBEGokAAuvAQEDfyABQQ9LBEAgAEEAIABrQQNxIgRqIQIDQCAAIAJJBEAgAEEAOgAAIABBAWohAAwBCwtBCCEAA38gAEEgTwR/IAIgASAEayIBQXxxaiEAA0AgAiAASQRAIAIgAzYCACACQQRqIQIMAQsLIAFBA3EFIAMgAEEYcXQgA3IhAyAAQQF0IQAMAQsLIQELIAAgAWohAQNAIAAgAUkEQCAAQQA6AAAgAEEBaiEADAELCwvGAQEHfyMAQSBrIgMkACABKAIEIAJPBEAgA0EQaiABECkCQCADKAIYIggEQCADKAIUIQkgAygCECEGAkACQAJAIAJFBEBBBCEEDAELIAJBAnQhBUEEIQcgCEEERg0BIANBCGogBUEEECcgAygCCCIERQ0EIAQgBiAFEEgLIAYgCSAIEEAMAQsgBiAJQQQgBRBBIgRFDQILIAEgAjYCBCABIAQ2AgALQYGAgIB4IQcLIAAgBzYCBCAAIAU2AgAgA0EgaiQADwsAC60BAQN/IwBBEGsiByQAAkACQAJAIAAgASACEBxFDQAgAEEkaigCACAAKAIAIAJsIAFqIghNDQEgACgCHCAIQQJ0aiIJKAIAIANMDQAgAEEYaigCACAITQ0CIAAoAhAgCEEDdGoiCCAFNgIEIAggBDYCACAJIAM2AgAgByADIAZqNgIMIAcgAzYCCCAHIAI2AgQgByABNgIAIABBKGogBxAfCyAHQRBqJAAPCwALAAu5AQIGfwJ+IwBBEGsiAiQAIAACf0EAIAEoAggiA0UNABogASADQX9qIgQ2AgggAkEIaiIFIAEoAgAiAyAEQQR0aiIGQQhqIgcpAgA3AwAgAiAGKQIANwMAIAQEQCAFIANBCGoiBCkCADcDACAHKQIAIQggAykCACEJIAMgBikCADcCACAEIAg3AgAgAiAJNwMAIAEQBQsgACACKQMANwIEIABBDGogBSkDADcCAEEBCzYCACACQRBqJAALtwEBAX8gACgCACIEQQA2AgAgBEF4aiIAIAAoAgBBfnE2AgACQCACIAMoAhQRBQBFDQACQAJAIARBfGooAgBBfHEiAkUNACACLQAAQQFxDQAgABAZIAAtAABBAnFFDQEgAiACKAIAQQJyNgIADwsgACgCACIDQXxxIgJFIANBAnFyDQEgAi0AAEEBcQ0BIAQgAigCCEF8cTYCACACIABBAXI2AggLDwsgBCABKAIANgIAIAEgADYCAAuvAQEEfyMAQRBrIgJBCGogACgCACIDIAFBBHRqIgBBCGooAgA2AgAgAiAAKQIANwMAIAAoAgwhBANAAkAgAUEATQ0AIAMgAUF/akEBdiIAQQR0aiIFKAIMIARMDQAgAyABQQR0aiIBIAUpAgA3AgAgAUEIaiAFQQhqKQIANwIAIAAhAQwBCwsgAyABQQR0aiIAIAIpAwA3AgAgACAENgIMIABBCGogAkEIaigCADYCAAuqAQECfyMAQSBrIgMkACAAAn9BACACQQFqIgQgAkkNABogASgCBCECIANBEGogARArIAMgAkEBdCICIAQgAiAESxsiAkEEIAJBBEsbIgRBBHQgBEGAgIDAAElBAnQgA0EQahAHIAMoAgBFBEAgAygCBCECIAEgBDYCBCABIAI2AgBBgYCAgHgMAQsgAygCBCEEIANBCGooAgALNgIEIAAgBDYCACADQSBqJAALqgEBAX8jAEEgayIEJAAgAAJ/QQAgAiADaiIDIAJJDQAaIAEoAgQhAiAEQRBqIAEQKSAEIAJBAXQiAiADIAIgA0sbIgJBBCACQQRLGyIDQQJ0IANBgICAgAJJQQJ0IARBEGoQByAEKAIARQRAIAQoAgQhAiABIAM2AgQgASACNgIAQYGAgIB4DAELIAQoAgQhAyAEQQhqKAIACzYCBCAAIAM2AgAgBEEgaiQAC6oBAQF/IwBBIGsiBCQAIAACf0EAIAIgA2oiAyACSQ0AGiABKAIEIQIgBEEQaiABECogBCACQQF0IgIgAyACIANLGyICQQQgAkEESxsiA0EDdCADQYCAgIABSUECdCAEQRBqEAcgBCgCAEUEQCAEKAIEIQIgASADNgIEIAEgAjYCAEGBgICAeAwBCyAEKAIEIQMgBEEIaigCAAs2AgQgACADNgIAIARBIGokAAu2AQEBfyMAQRBrIgMkAAJAIABFDQAgAyAANgIEIAFFDQACQCACQQVPDQAgAUEDakECdkF/aiIAQf8BSw0AIANBsIPAADYCCCADIABBAnRBtIPAAGoiACgCADYCDCADQQRqIANBDGogA0EIakGAg8AAEAwgACADKAIMNgIADAELIANBsIPAACgCADYCDCADQQRqIANBDGpBgIPAAEGYg8AAEAxBsIPAACADKAIMNgIACyADQRBqJAALsgEBAn8jAEEQayICJAACQCAARQ0AIABBA2pBAnYhAAJAIAFBBU8NACAAQX9qIgNB/wFLDQAgAkGwg8AANgIEIAIgA0ECdEG0g8AAaiIDKAIANgIMIAAgASACQQxqIAJBBGpBgIPAABAdIQEgAyACKAIMNgIADAELIAJBsIPAACgCADYCCCAAIAEgAkEIakGAg8AAQZiDwAAQHSEBQbCDwAAgAigCCDYCAAsgAkEQaiQAIAELeQEEfyMAQRBrIgIkAAJAIAFFBEBBBCEDDAELAkAgAUH/////AEsNACABQQN0IgQQJkGBgICAeEcNACACQQhqIAQgAUGAgICAAUlBAnQiBRAnIAIoAggiAw0BIAQgBRBHAAsACyAAIAE2AgQgACADNgIAIAJBEGokAAt5AQR/IwBBEGsiAiQAAkAgAUUEQEEEIQMMAQsCQCABQf////8BSw0AIAFBAnQiBBAmQYGAgIB4Rw0AIAJBCGogBCABQYCAgIACSUECdCIFECcgAigCCCIDDQEgBCAFEEcACwALIAAgATYCBCAAIAM2AgAgAkEQaiQAC4sBAQF/IwBBEGsiAyQAIAMgASgCACIEKAIANgIMIAJBAmoiASABbCIBQYAQIAFBgBBLGyICQQQgA0EMakGAg8AAQZiDwAAQHSEBIAQgAygCDDYCACABBH8gAUIANwIEIAEgASACQQJ0akECcjYCAEEABUEBCyECIAAgATYCBCAAIAI2AgAgA0EQaiQAC5sBAQN/IAAiAygCBCAAKAIIIgRrIAEiAkkEQCADIAQgAhA4CyABQQEgAUEBSxsiA0F/aiEEIAMgACgCCCICaiEDIAAoAgAgAkEDdGohAgNAIAQEQCACQX82AgQgAkF/NgIAIARBf2ohBCACQQhqIQIMAQUCQCABRQRAIANBf2ohAwwBCyACQX82AgQgAkF/NgIACwsLIAAgAzYCCAtTAQJ/IwBBIGsiAiQAIAJBCGogARAUIAJBGGoiA0EANgIAIAIgAikDCDcDECACQRBqIAEQGCAAQQhqIAMoAgA2AgAgACACKQMQNwIAIAJBIGokAAuVAQEDfyAAIgMoAgQgACgCCCIEayABIgJJBEAgAyAEIAIQNwsgAUEBIAFBAUsbIgNBf2ohBCADIAAoAggiAmohAyAAKAIAIAJBAnRqIQIDQCAEBEAgAkH/////BzYCACAEQX9qIQQgAkEEaiECDAEFAkAgAUUEQCADQX9qIQMMAQsgAkH/////BzYCAAsLCyAAIAM2AggLcwECfyAAKAIAIgFBfHEiAkUgAUECcXJFBEAgAiACKAIEQQNxIAAoAgRBfHFyNgIECyAAIAAoAgQiAkF8cSIBBH8gASABKAIAQQNxIAAoAgBBfHFyNgIAIAAoAgQFIAILQQNxNgIEIAAgACgCAEEDcTYCAAuDAQEBfCACIARrIgQgBGwgASADayIDIANsarefRAAAAAAAAFlAoiIIRAAAAAAAAODBZiEDIAAgASACIAUgBiAHQQBB/////wcCfyAImUQAAAAAAADgQWMEQCAIqgwBC0GAgICAeAtBgICAgHggAxsgCEQAAMD////fQWQbIAggCGIbEAoLagACfyACQQJ0IgEgA0EDdEGAgAFqIgIgASACSxtBh4AEaiIBQRB2QAAiAkF/RgRAQQAhAkEBDAELIAJBEHQiAkIANwIEIAIgAiABQYCAfHFqQQJyNgIAQQALIQMgACACNgIEIAAgAzYCAAtUAQJ/AkACQCABQQBIDQAgAkEASCAAKAIAIgMgAUxyDQAgACgCBCACTA0AIAIgA2wgAWoiASAAQQxqKAIATw0BIAAoAgggAWotAABFIQQLIAQPCwALawECfyMAQRBrIgYkAAJAIAAgASACIAMgBBACIgUNACAGQQhqIAMgACABIAQoAgwRAwBBACEFIAYoAggNACAGKAIMIgUgAigCADYCCCACIAU2AgAgACABIAIgAyAEEAIhBQsgBkEQaiQAIAULhQEBAX8jAEEwayIJJAAgCUEQaiABIAIgAyAEIAUgBiAHIAgQACAJQShqIAlBGGooAgA2AgAgCSAJKQMQNwMgIAlBIGoiASICKAIEIAIoAggiA0sEQCACIAMQOQsgCUEIaiICIAEoAgg2AgQgAiABKAIANgIAIAAgCSkDCDcDACAJQTBqJAALXQECfyAAKAIIIgMhAiAAKAIEIANGBEAgACADEDQgACgCCCECCyAAKAIAIAJBBHRqIgIgASkCADcCACACQQhqIAFBCGopAgA3AgAgACAAKAIIQQFqNgIIIAAgAxANC1cBBX8gACgCACIAKAIEIgEEQCAAKAIAIgQgACgCECICKAIIIgNHBEAgAigCACIFIANBBHRqIAUgBEEEdGogAUEEdBABIAAoAgQhAQsgAiABIANqNgIICwtKACAAIAEgAiAFIAYgByABIANrIgAgAEEfdSIAcyAAayIAIAIgBGsiASABQR91IgFzIAFrIgFBAXRqIABBAXQgAWogACABSBsQCgtXAQJ/IwBBIGsiASQAIAAoAgghAiAAQQA2AgggASAANgIYIAFBADYCDCABIAAoAgAiADYCECABIAI2AgggASAAIAJBBHRqNgIUIAFBCGoQLSABQSBqJAALRwEBfyAAKAIIIgMgACgCBEYEQCAAIAMQNSAAKAIIIQMLIAAoAgAgA0EDdGoiAyACNgIEIAMgATYCACAAIAAoAghBAWo2AggLOwECfyAAIAEoAiAiAiABQSRqKAIASQR/IAEgAkEBajYCICAAIAEgAkEDdGopAgA3AgRBAQUgAws2AgALPgEBfyAAKAIIIgIgACgCBEYEQCAAIAIQNiAAKAIIIQILIAAoAgAgAkECdGogATYCACAAIAAoAghBAWo2AggLQAECfyMAQRBrIgEkAEGBgICAeCECIABBf0wEQCABQQhqIgBBADYCBCAAIAE2AgAgASgCDCECCyABQRBqJAAgAgs5AQF/IwBBEGsiAyQAIANBCGogASACQQAQMyADKAIMIQEgACADKAIINgIAIAAgATYCBCADQRBqJAALNgEBfyAAQX9BACABKAIEIgIbQQEgAkEBSBs2AgQgAEF/QQAgASgCACIAG0EBIABBAUgbNgIACzUBAX8gASgCBCICBEAgASgCACEBIABBBDYCCCAAIAJBAnQ2AgQgACABNgIADwsgAEEANgIICzUBAX8gASgCBCICBEAgASgCACEBIABBBDYCCCAAIAJBA3Q2AgQgACABNgIADwsgAEEANgIICzUBAX8gASgCBCICBEAgASgCACEBIABBBDYCCCAAIAJBBHQ2AgQgACABNgIADwsgAEEANgIICykBAX8gAyACEBIiBARAIAQgACABIAMgASADSRsQSCAAIAEgAhARCyAECzkBAX8jAEEQayIBJAAgAEGAgMAANgIIIABBDGpBgIDAADYCACABIAA2AgwgAUEMahAgIAFBEGokAAs0AgF/AX4jAEEQayICJAAgAkEIaiABEBMgAikDCCEDIABBADYCCCAAIAM3AgAgAkEQaiQACzIBAX8jAEEQayIBJAAgASAAECkgASgCCCIABEAgASgCACABKAIEIAAQQAsgAUEQaiQACzIBAX8jAEEQayIBJAAgASAAECogASgCCCIABEAgASgCACABKAIEIAAQQAsgAUEQaiQACzIBAX8jAEEQayIBJAAgASAAECsgASgCCCIABEAgASgCACABKAIEIAAQQAsgAUEQaiQACzIAAkAgAEH8////B0sNACAARQRAQQQPCyAAIABB/f///wdJQQJ0EEMiAEUNACAADwsACzsAAkAgAUUNACADRQRAIAEgAhBDIQIMAQsgASIDIAIQEiICBEAgAiADEAgLCyAAIAE2AgQgACACNgIACysBAX8jAEEQayICJAAgAkEIaiAAIAEQDiACKAIIIAIoAgwQPCACQRBqJAALLQEBfyMAQRBrIgIkACACQQhqIAAgAUEBEBAgAigCCCACKAIMEDwgAkEQaiQACy0BAX8jAEEQayICJAAgAkEIaiAAIAFBARAPIAIoAgggAigCDBA8IAJBEGokAAstAQF/IwBBEGsiAyQAIANBCGogACABIAIQDyADKAIIIAMoAgwQPCADQRBqJAALLQEBfyMAQRBrIgMkACADQQhqIAAgASACEBAgAygCCCADKAIMEDwgA0EQaiQACysBAX8jAEEQayICJAAgAkEIaiAAIAEQCSACKAIIIAIoAgwQPCACQRBqJAALGQAgACgCCCABTQRAAAsgACgCACABQQJ0agsZACAAKAIIIAFNBEAACyAAKAIAIAFBA3RqCx8AAkAgAUGBgICAeEcEQCABRQ0BIAAgARBHAAsPCwALFwAgACABIAIgAyAEIAUgBiAHQQAQAxoLFgAgACABIAIgAyAEIAUgBiAHQQEQAwsOACAAIAEQLiAAIAEQFgsPACABBEAgACABIAIQRQsLDAAgACABIAIgAxAsCw8AIAEEQCAAIAFBBBBFCwsIACAAIAEQEgsOAEG0i8AALQAABEAACwsKACAAIAEgAhARCwsAIAAjAGokACMACxkAIAAgAUHYi8AAKAIAIgBBCCAAGxEAAAALCgAgACABIAIQBAsEACABCwQAQQALBQBBgAQLBABBAQsDAAELC7gDAgBBgIDAAAusAXNyYy9saWIucnMAAAAAEAAKAAAAvQAAABAAAAAAABAACgAAAOIAAAAhAAAAAAAQAAoAAADkAAAAEQAAAAAAEAAKAAAAAAEAABQAAAAAABAACgAAABcBAAAUAAAAAAAQAAoAAAA6AQAAGAAAAAAAEAAKAAAAaAEAAAwAAAAAABAACgAAAGwBAAAcAAAAAAAQAAoAAAA/AQAAIgAAAAAAAAABAAAAAAAAAP////8AQbSBwAAL+QEBAAAAAAAAAP////8BAAAAAQAAAP////8BAAAA//////////8BAAAA/////wAAEAAKAAAAgQEAAB0AAAAAABAACgAAAIkBAAAgAAAAAAAQAAoAAACJAQAALgAAAAAAEAAKAAAApAEAACcAAAAAABAACgAAAOUBAAAkAAAAAAAQAAoAAADpAQAANAAAAAAAEAAKAAAACAIAABoAAAAAABAACgAAAPsBAAAlAAAAAAAQAAoAAAD+AQAAHwAAAAAAEAAKAAAAAAIAACEAAAABAAAABAAAAAQAAAACAAAAAwAAAAQAAAABAAAAAAAAAAEAAAAFAAAABgAAAAcARwlwcm9kdWNlcnMBDHByb2Nlc3NlZC1ieQIGd2FscnVzBjAuMTkuMAx3YXNtLWJpbmRnZW4SMC4yLjgzIChlYmE2OTFmMzgp';

  // 2. Base64 解码为 Wasm 二进制
  function base64ToWasmArrayBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // 3. 解码得到 Wasm 二进制（和原 import 的 jpsWasm 等价）
  const jpsWasm = base64ToWasmArrayBuffer(JPS_WASM_BASE64);

  const { Cast, BlockType, ArgumentType } = Scratch;

  const en = {
    name: 'A* Odyssey',
    document: '📖 Document',
    documentURL: 'https://getgandi.com/extensions/odyssey',

    divSetup: '🔧 Setup',
    divPathFinding: '🛰 Path Finding',
    divDebug: '💬 Debug',
    divListUtils: '📝 List Utils',
    divObstacle: '🚫 Obstacle',

    toggleDebugWindow: '🩻 Toggle Debug Window',

    createMap: `🐌 load an obstacle to a map [NAME], the obstacle from [SPRITE]'s costume [COSTUME] with options dX:[DX] dY:[DY] scale:[SCALE]%`,
    clearMap: `clear map [NAME], x:[X] y:[Y] width:[WIDTH] height:[HEIGHT]`,
    findPath: `🐌 find path on [MAP] from x:[SX] y:[SY] to x:[EX] y:[EY], and fill to [LIST] and [METHOD]`,
    findPathBetweenSprites: `🐌 find path on [MAP] from [START] to [END], and fill to [LIST] and [METHOD]`,
    drawDebugCanvasWithPath: `draw debug canvas with [MAP]`,
    fillPathToList: `fill path of the map [MAP] to list [LIST]`,
    itemOfList: `#[INDEX] of [LIST]'s #[IDX] item`,
    isWalkable: `is map [MAP]'s x:[X] y:[Y] walkable?`,
    isCurrentTargetOnWalkable: `in map [MAP] walkable area?`,

    fillMethodSmooth: 'smooth result',
    fillMethodRaw: 'keep raw result',

    fastOrAccurate: `choose the [PATH_FINDING]'s [ALGORITHM] algorithm`,
    pathFindingAstar: 'A*',
    pathFindingJps: 'JPS',
    fastOrAccurateAccurate: 'more accurate',
    fastOrAccurateFaster: 'faster',

    addRectangleObstacle: `add rectangle obstacle to [MAP] at x:[X] y:[Y] width:[WIDTH] height:[HEIGHT]`,
  };
  const cn = {
    name: 'A* 奥德赛',
    document: '📖 文档',
    documentURL: 'https://getgandi.com/cn/extensions/odyssey',

    divSetup: '🔧 设置',
    divPathFinding: '🛰 寻路',
    divDebug: '💬 调试',
    divListUtils: '📝 列表工具',
    divObstacle: '🚫 障碍物',

    toggleDebugWindow: '🩻 显示/隐藏调试窗口',

    createMap: `🐌 为地图 [NAME] 载入从 [SPRITE] 的 #[COSTUME] 造型创建的障碍物，并且 x 偏移:[DX] y 偏移:[DY] 大小:[SCALE]%`,
    clearMap: `清除名为 [NAME] 地图上的障碍物, 区域 x:[X] y:[Y] 宽:[WIDTH] 高:[HEIGHT]`,
    findPath: `🐌 在地图 [MAP] 上寻路，起点 x:[SX] y:[SY] 终点 x:[EX] y:[EY]，填充结果到 [LIST] 并且 [METHOD]`,
    findPathBetweenSprites: `🐌 在地图 [MAP] 上寻路，从 [START] 到 [END]，填充结果到 [LIST] 并且 [METHOD]`,
    drawDebugCanvasWithPath: `在调试窗口中画出地图 [MAP] 及寻路结果`,
    fillPathToList: `填充地图 [MAP] 的寻路结果到列表 [LIST]`,
    itemOfList: `[LIST] 的第 [INDEX] 项内容中的第 [IDX] 部分`,

    isWalkable: `地图 [MAP] 的 x:[X] y:[Y] 不是障碍?`,
    isCurrentTargetOnWalkable: `在地图 [MAP] 的非障碍区?`,

    fillMethodSmooth: '简化结果',
    fillMethodRaw: '保持原始结果',

    show: '显示',
    hide: '隐藏',

    addRectangleObstacle: `为[MAP]添加一个障碍区，在 x:[X] y:[Y] 宽:[WIDTH] 高:[HEIGHT]`,

    fastOrAccurate: `选择 [PATH_FINDING] 的 [ALGORITHM] 算法`,
    pathFindingAstar: 'A*',
    pathFindingJps: 'JPS',
    fastOrAccurateAccurate: '更精确',
    fastOrAccurateFaster: '更快',
  };

  const NS = 'GandiAStarExtension';
  const BLOCK_COLOR = '#44C5B8';
  // const MENU_ICON = icon;
  // const BLOCK_ICON = icon;
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 360;

  // 手写拖拽函数（替代interact）
  function makeDraggable(element) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // 鼠标按下：开始拖拽
    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      // 记录鼠标按下时的初始坐标
      startX = e.clientX;
      startY = e.clientY;
      // 避免拖拽时选中文本/图片（优化体验）
      e.preventDefault();
    });

    const position = { x: 0, y: 0 };
    // 鼠标移动：拖拽中
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      // 计算鼠标偏移量（和interact的dx/dy完全等价）
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // 更新位置
      position.x += dx;
      position.y += dy;
      // 应用位移
      element.style.transform = `translate(${position.x}px, ${position.y}px)`;
      // 更新起始坐标，实现连续拖拽
      startX = e.clientX;
      startY = e.clientY;
    });

    // 鼠标抬起：结束拖拽
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  class GandiAStar extends GandiExtension {
    static get STATE_KEY() {
      return NS;
    }

    // ========================================================================== //
    // INITIALIZATION
    constructor(runtime) {
      super(runtime, { NS, cn, en });
      // Variables
      this.debugCanvas = document.getElementById('canvasDebugForAStar');
      if (!this.debugCanvas) {
        const debugContainer = document.createElement('div');
        debugContainer.id = 'containerDebugForAStar';
        debugContainer.className = 'draggable-source';

        this.debugCanvas = document.createElement('canvas');
        this.debugCanvas.id = 'canvasDebugForAStar';
        this.debugCanvas.width = CANVAS_WIDTH;
        this.debugCanvas.height = CANVAS_HEIGHT;
        debugContainer.appendChild(this.debugCanvas);
        this.showDebugWindow = false;
        debugContainer.style.display = 'none';
        this.debugContainer = debugContainer;
        document.body.appendChild(debugContainer);

        // 调用：让容器支持拖拽
        makeDraggable(debugContainer);
      }
      this.pathFindingAlg = 'jps';
      this.weight = 60;
      this.maps = new Map();
      this.lastPaths = new Map();
      this.workers = {};
      this.astarWorkerUrl = URL.createObjectURL(new Blob([astarWorker], { type: 'text/javascript' }));
      this.jpsWorkerUrl = URL.createObjectURL(new Blob([jpsWorker], { type: 'text/javascript' }));
    }

    getInfo() {
      // ========================================================================== //
      // BLOCK DEFINITIONS

      const createMapBlock = {
        opcode: 'createMap',
        blockType: BlockType.COMMAND,
        text: this.fm({
          createMap: `🐌🐌 load an obstacle to a map [NAME], the obstacle from [SPRITE]'s costume [COSTUME] with options dX:[DX] dY:[DY] scale:[SCALE]%`,
        }),
        arguments: {
          NAME: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          SPRITE: {
            type: ArgumentType.STRING,
            menu: 'SPRITE_LIST',
          },
          COSTUME: {
            type: ArgumentType.STRING,
            defaultValue: '1',
          },
          DX: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
          DY: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
          SCALE: {
            type: ArgumentType.NUMBER,
            defaultValue: 100,
          },
        },
      };

      const clearMapBlock = {
        opcode: 'clearMap',
        blockType: BlockType.COMMAND,
        text: this.fm({
          clearMap: `clear map [NAME], x:[X] y:[Y] width:[WIDTH] height:[HEIGHT]`,
        }),
        arguments: {
          NAME: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          X: {
            type: ArgumentType.NUMBER,
            defaultValue: -320,
          },
          Y: {
            type: ArgumentType.NUMBER,
            defaultValue: 180,
          },
          WIDTH: {
            type: ArgumentType.NUMBER,
            defaultValue: 640,
          },
          HEIGHT: {
            type: ArgumentType.NUMBER,
            defaultValue: 360,
          },
        },
      };

      const findPathBlock = {
        opcode: 'findPath',
        blockType: BlockType.COMMAND,
        text: this.fm({
          findPath: `find path on [MAP] from x:[SX] y:[SY] to x:[EX] y:[EY], and fill to [LIST] and [METHOD]`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          SX: {
            type: ArgumentType.NUMBER,
            defaultValue: -320,
          },
          SY: {
            type: ArgumentType.NUMBER,
            defaultValue: 180,
          },
          EX: {
            type: ArgumentType.NUMBER,
            defaultValue: 319,
          },
          EY: {
            type: ArgumentType.NUMBER,
            defaultValue: -179,
          },
          LIST: {
            type: ArgumentType.STRING,
            menu: 'LIST_MENU',
          },
          METHOD: {
            type: ArgumentType.STRING,
            defaultValue: 'smooth',
            menu: 'FILL_METHOD_MENU',
          },
        },
      };

      const findPathAsyncBlock = { ...findPathBlock, opcode: 'findPathAsync', text: `📢 ${findPathBlock.text}` };

      const findPathBetweenSpritesBlock = {
        opcode: 'findPathBetweenSprites',
        blockType: BlockType.COMMAND,
        text: this.fm({
          findPathBetweenSprites: `find path on [MAP] from [START] to [END], and fill to [LIST] and [METHOD]`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          START: {
            type: ArgumentType.STRING,
            menu: 'SPRITE_LIST',
          },
          END: {
            type: ArgumentType.STRING,
            menu: 'SPRITE_LIST',
          },
          LIST: {
            type: ArgumentType.STRING,
            menu: 'LIST_MENU',
          },
          METHOD: {
            type: ArgumentType.STRING,
            defaultValue: 'smooth',
            menu: 'FILL_METHOD_MENU',
          },
        },
      };

      const dispatchPathCalculatedBlock = {
        opcode: 'dispatchPathCalculated',
        blockType: BlockType.HAT,
        isEdgeActivated: false,
        // shouldRestartExistingThreads: true,
        text: this.fm({
          dispatchPathCalculated: `📢 when path calculated, target = [targetId]`,
        }),
        arguments: {
          targetId: {
            type: 'ccw_hat_parameter',
          },
        },
      };
      this.__processEvent('dispatchPathCalculated');

      const findPathBetweenSpritesAsyncBlock = {
        ...findPathBetweenSpritesBlock,
        opcode: 'findPathBetweenSpritesAsync',
        text: `📢 ${findPathBetweenSpritesBlock.text}`,
      };

      const drawDebugCanvasWithPathBlock = {
        opcode: 'drawDebugCanvasWithPath',
        blockType: BlockType.COMMAND,
        text: this.fm({
          drawDebugCanvasWithPath: `draw debug canvas with [MAP]`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
        },
      };

      const fastOrAccurateBlock = {
        opcode: 'fastOrAccurate',
        blockType: BlockType.COMMAND,
        text: this.fm({
          fastOrAccurate: `choose the [PATH_FINDING]'s [ALGORITHM] algorithm`,
        }),
        arguments: {
          PATH_FINDING: {
            type: ArgumentType.STRING,
            defaultValue: 'jps',
            menu: 'PATH_FINDING_MENU',
          },
          ALGORITHM: {
            type: ArgumentType.STRING,
            defaultValue: 'faster',
            menu: 'FAST_OR_ACCURATE_MENU',
          },
        },
      };

      // const fillPathToListBlock = {
      //   opcode: 'fillPathToList',
      //   blockType: BlockType.COMMAND,
      //   text: this.fm({
      //     fillPathToList: `fill path of obstacle [MAP] to list [LIST]`,
      //   }),
      //   arguments: {
      //     MAP: {
      //       type: ArgumentType.STRING,
      //       defaultValue: 'obstacle',
      //     },
      //     LIST: {
      //       type: ArgumentType.STRING,
      //       menu: 'LIST_MENU',
      //     },
      //   },
      // };

      const itemOfListBlock = {
        opcode: 'itemOfList',
        blockType: BlockType.REPORTER,
        text: this.fm({
          itemOfList: `#[INDEX] of [LIST]'s #[IDX] item`,
        }),
        arguments: {
          LIST: {
            type: ArgumentType.STRING,
            menu: 'LIST_MENU',
          },
          INDEX: {
            type: ArgumentType.NUMBER,
            defaultValue: 1,
          },
          IDX: {
            type: ArgumentType.NUMBER,
            defaultValue: 1,
          },
        },
      };

      const isWalkableBlock = {
        opcode: 'isWalkable',
        blockType: BlockType.BOOLEAN,
        text: this.fm({
          isWalkable: `is map [MAP]'s x:[X] y:[Y] walkable?`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          X: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
          Y: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
        },
      };

      const isCurrentTargetOnWalkableBlock = {
        opcode: 'isCurrentTargetOnWalkable',
        blockType: BlockType.BOOLEAN,
        text: this.fm({
          isCurrentTargetOnWalkable: `in map [MAP] walkable area?`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
        },
      };

      const addRectangleObstacleBlock = {
        opcode: 'addRectangleObstacle',
        blockType: BlockType.COMMAND,
        text: this.fm({
          addRectangleObstacle: `add rectangle obstacle to map [MAP] at x:[X] y:[Y] width:[WIDTH] height:[HEIGHT]`,
        }),
        arguments: {
          MAP: {
            type: ArgumentType.STRING,
            defaultValue: 'obstacle',
          },
          X: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
          Y: {
            type: ArgumentType.NUMBER,
            defaultValue: 0,
          },
          WIDTH: {
            type: ArgumentType.NUMBER,
            defaultValue: 1,
          },
          HEIGHT: {
            type: ArgumentType.NUMBER,
            defaultValue: 1,
          },
        },
      };

      const goToBlock = {
        opcode: 'goTo',
        blockType: BlockType.COMMAND,
        text: this.fm({
          goTo: `go to :[XY]`,
        }),
        arguments: {
          XY: {
            type: ArgumentType.STRING,
            defaultValue: '0,0',
          },
        },
      };

      const toggleDebugWindowBlock = {
        blockType: BlockType.BUTTON,
        text: this.fm({ toggleDebugWindow: 'Toggle Debug Window' }),
        func: 'toggleDebugWindow',
      };

      const setWorkerManuallyBlock = {
        opcode: 'setWorkerManually',
        blockType: BlockType.COMMAND,
        text: this.fm({
          setWorkerManually: `set worker URL: [URL]`,
        }),
        arguments: {
          URL: {
            type: ArgumentType.STRING,
            defaultValue: 'https://',
          },
        },
      };

      const div = (id, text) => {
        const divObj = {};
        divObj[id] = text;
        return {
          blockType: Scratch.BlockType.LABEL,
          text: this.fm(divObj),
        };
      };
      const documentBlock = {
        blockType: BlockType.BUTTON,
        text: this.fm({ document: 'Document' }),
        func: 'openDocument',
      };

      this.__hideBlocks([
        findPathAsyncBlock,
        findPathBetweenSpritesAsyncBlock,
        dispatchPathCalculatedBlock,
        setWorkerManuallyBlock, // reserve for -6
      ]);

      return {
        id: NS,
        name: this.fm({ name: 'A* Odyssey' }),
        color1: BLOCK_COLOR,
        // menuIconURI: MENU_ICON,
        // blockIconURI: BLOCK_ICON,
        // ========================================================================== //
        //     blocks
        // eslint-disable-next-line prettier/prettier
        blocks: [
          documentBlock,
          div('divSetup', 'Setup'),
          // configAnObstacleBlock,
          createMapBlock,
          clearMapBlock,
          div('divObstacle', 'Obstacle'),
          isWalkableBlock,
          isCurrentTargetOnWalkableBlock,
          addRectangleObstacleBlock,
          div('divPathFinding', 'Path Finding'),
          fastOrAccurateBlock,
          findPathBlock,
          findPathBetweenSpritesBlock,
          findPathAsyncBlock,
          findPathBetweenSpritesAsyncBlock,
          dispatchPathCalculatedBlock,
          // fillPathToListBlock,
          div('divListUtils', 'List Utils'),
          itemOfListBlock,
          goToBlock,
          div('divDebug', 'Debug'),
          toggleDebugWindowBlock,
          drawDebugCanvasWithPathBlock,
          setWorkerManuallyBlock,
        ],
        // ========================================================================== //
        //     menus

        menus: {
          // SHOW: [
          //   { text: this.fm({ show: 'Show' }), value: 1 },
          //   { text: this.fm({ hide: 'Hide' }), value: 0 },
          // ],
          SPRITE_LIST: {
            acceptReporters: true,
            items: '__spriteList',
          },
          LIST_MENU: {
            acceptReporters: true,
            items: '__listList',
          },
          FILL_METHOD_MENU: [
            { text: this.fm({ fillMethodSmooth: 'smooth result' }), value: 'smooth' },
            { text: this.fm({ fillMethodRaw: 'keep raw result' }), value: 'raw' },
          ],
          FAST_OR_ACCURATE_MENU: [
            { text: this.fm({ fastOrAccurateFaster: 'faster' }), value: 'faster' },
            { text: this.fm({ fastOrAccurateAccurate: 'more accurate' }), value: 'accurate' },
          ],
          PATH_FINDING_MENU: [
            { text: this.fm({ pathFindingJps: 'jps' }), value: 'jps' },
            { text: this.fm({ pathFindingAstar: 'astar' }), value: 'astar' },
          ],
        },
      };
    }

    // ========================================================================== //
    //     helper functions | utils
    _create_initial_grid() {
      return new Array(CANVAS_HEIGHT).fill(null).map(() => new Array(CANVAS_WIDTH).fill(0));
    }

    _drawDebugCanvas(name) {
      const grid = this.maps.get(name);
      if (!grid) {
        return;
      }
      const ctx = this.debugCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
      for (let ix = 0; ix < CANVAS_WIDTH; ix++) {
        for (let iy = 0; iy < CANVAS_HEIGHT; iy++) {
          const node = grid[iy][ix];
          ctx.fillStyle = !node ? '#C1FF8F' : '#FFADAD';
          ctx.fillRect(ix, iy, 1, 1);
        }
      }
      try {
        // Path color : #03A4FF
        const { path } = this.lastPaths.get(name);
        // console.info(path);
        if (path && path.length > 0) {
          ctx.strokeStyle = '#03A4FF';
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          path.forEach(([p1, p2]) => {
            // ctx.fillRect(p1, p2, 1, 1);
            ctx.lineTo(p1, p2);
          });
          ctx.stroke();
        }
      } catch (error) {
        // ignore, path not found
      }
    }

    _addObstacle(name, asset, config = { scale: 1, dX: 0, dY: 0, rx: 0, ry: 0, width: 0, height: 0 }) {
      let grid = this.maps.get(name);
      if (!grid) {
        // not init
        grid = this._create_initial_grid();
        this.maps.set(name, grid);
      }
      // load resource
      return assetsHelper.decodeImage(asset).then(() => {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const img = assetsHelper.decodeImageCache[asset.assetId];
        const ratio = config.scale / 100.0;
        const _w = Math.floor(config.width * ratio);
        const _h = Math.floor(config.height * ratio);
        const _x = Math.floor(config.dX - config.rx * ratio + canvas.width / 2);
        const _y = Math.floor(-config.dY - config.ry * ratio + canvas.height / 2);
        ctx.drawImage(img.bmp, _x, _y, _w, _h);
        trace('start add obstacle', _x, _y, _w, _h);
        let countWall = 0;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let ix = 0; ix < canvas.width; ix++) {
          for (let iy = 0; iy < canvas.height; iy++) {
            const pix = data.data[(ix + iy * canvas.width) * 4 + 3]; // alpha channel of pixel on (ix, iy)
            if (pix > 128) {
              // grid.setWalkableAt(ix, iy, false);
              grid[iy][ix] = 1;
              countWall++;
            }
          }
        }
        trace(`end add obstacle, wall: ${countWall}`);
      });
    }

    _getObstacleAssets(obstacle) {
      // const obstacle = JSON.parse(obstacleStr);
      const sprite = this.runtime.getSpriteTargetByName(obstacle.sprite);
      const costume = sprite?.getCostumes()[obstacle.costume];
      if (!sprite || !costume) {
        return { costume: null, asset: null, config: null };
      }
      return {
        costume,
        asset: costume.asset,
        config: {
          scale: obstacle.scale / costume.bitmapResolution,
          dX: obstacle.dX,
          dY: obstacle.dY,
          rx: costume.rotationCenterX,
          ry: costume.rotationCenterY,
          width: costume.size[0],
          height: costume.size[1],
        },
      };
    }

    _transPathToScratch(path) {
      if (path && path.length >= 0) {
        const rt = [];
        path.forEach(([x, y]) => {
          rt.push([Math.floor(x - CANVAS_WIDTH / 2), Math.floor(-y + CANVAS_HEIGHT / 2)]);
        });
        return rt;
      }
      return path;
    }

    _getWorker = (workerUrl) => {
      let worker;
      try {
        worker = this.workers[workerUrl];
        // console.log("get worker", workerUrl, worker)
        if (worker) {
          return worker;
        }
        worker = new WorkerQueue(workerUrl);
        this.workers[workerUrl] = worker;
      } catch (e) {
        try {
          let blob;
          try {
            blob = new Blob([`importScripts('${workerUrl}');`], { type: 'application/javascript' });
          } catch (e1) {
            const blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
            blobBuilder.append(`importScripts('${workerUrl}');`);
            blob = blobBuilder.getBlob('application/javascript');
          }
          const url = window.URL || window.webkitURL;
          const blobUrl = url.createObjectURL(blob);
          worker = new WorkerQueue(blobUrl);
          this.workers[workerUrl] = worker;
        } catch (e2) {
          // if it still fails, there is nothing much we can do
        }
      }
      return worker;
    };

    // ========================================================================== //
    //     functions

    async createMap(args) {
      const name = Cast.toString(args.NAME);
      const { SPRITE, COSTUME, DX, DY, SCALE } = args;
      const sprite = this.runtime.getSpriteTargetByName(SPRITE);
      const costumeNameOrNumber = Cast.toString(COSTUME);

      let costumeIdx = sprite.getCostumeIndexByName(costumeNameOrNumber);
      if (costumeIdx === -1) {
        costumeIdx = Cast.toNumber(COSTUME) - 1;
      }
      const costume =
        costumeIdx >= 0 ? sprite.getCostumes()[costumeIdx] : sprite.getCostumes()[Cast.toNumber(costumeNameOrNumber) - 1];
      if (!costume) {
        warn('[createMap]', 'costume not found', costumeNameOrNumber);
        return;
      }
      const options = {
        sprite: SPRITE,
        costume: costumeIdx,
        dX: Cast.toNumber(DX),
        dY: Cast.toNumber(DY),
        scale: Cast.toNumber(SCALE),
      };
      // const obstacleStr = Cast.toString(args.OBSTACLE);
      const { asset, config } = this._getObstacleAssets(options);
      if (asset) {
        await this._addObstacle(name, asset, config);
      }
    }

    async findPath(args, util) {
      const map = Cast.toString(args.MAP);
      const startX = Cast.toNumber(args.SX);
      const startY = Cast.toNumber(args.SY);
      const endX = Cast.toNumber(args.EX);
      const endY = Cast.toNumber(args.EY);
      const list = Cast.toString(args.LIST);
      const fillMethodSmooth = Cast.toString(args.METHOD) === 'smooth';

      // const finder = new AStarFinder({ allowDiagonal: true, dontCrossCorners: true });
      // const finder = new AStarFinder({ allowDiagonal: true, dontCrossCorners: true, weight: 100 });
      let grid = this.maps.get(map);
      if (!grid) {
        grid = this._create_initial_grid();
      }
      // const gridBackup = grid.clone();

      // change scratch position to grid position
      let sx = Math.floor(CANVAS_WIDTH / 2 + startX);
      let sy = Math.floor(-startY + CANVAS_HEIGHT / 2);

      let ex = Math.floor(endX + CANVAS_WIDTH / 2);
      let ey = Math.floor(-endY + CANVAS_HEIGHT / 2);

      sx = Math.min(Math.max(sx, 0), CANVAS_WIDTH - 1);
      sy = Math.min(Math.max(sy, 0), CANVAS_HEIGHT - 1);
      ex = Math.min(Math.max(ex, 0), CANVAS_WIDTH - 1);
      ey = Math.min(Math.max(ey, 0), CANVAS_HEIGHT - 1);

      // trace('start find path', sx, sy, ex, ey, args);
      const me = this;
      const findPromise = (util, me) => {
        const points = [sx, sy, ex, ey];
        return new Promise((resolve) => {
          // direct resolve if start and end are the same or on the not walkable area
          if (grid[sy][sx] === 1 || grid[ey][ex] === 1 || (sx === ex && sy === ey)) {
            resolve({ path: [], smoothPath: [], targetId: util.target.id, me, util });
            return;
          }

          let workerUrl = this.pathFindingAlg === 'jps' ? this.jpsWorkerUrl : this.astarWorkerUrl;
          // debugger;
          if (this.workerURL) {
            workerUrl = this.workerURL;
          }
          const worker = this._getWorker(workerUrl);
          const wasmUrl = jpsWasm;
          worker
            .submit({
              points,
              grid,
              targetId: util.target.id,
              weight: this.weight,
              wasmUrl,
            })
            .then(function (msg) {
              // console.log('worker size', worker.pool.length)
              const { path, smoothPath, targetId } = msg;
              // console.log('Work done', path, smoothPath);
              // trace('worker calculated');
              // const target = this.runtime.getTargetById(targetId);
              // me.__dispatchCCWEvent('dispatchPathCalculated', {}, { targetId }, myUtil);
              // worker.terminate();
              resolve({ path, smoothPath, targetId, me, util });
            });
        });
      };
      await findPromise(util, me).then(({ path, smoothPath, targetId }) => {
        // trace('find promise resolved');
        const pathTrans = this._transPathToScratch(smoothPath);
        const rawPathTrans = this._transPathToScratch(path);
        this.lastPaths.set(map, { path: smoothPath, pathTrans });
        const calculateTarget = this.runtime.getTargetById(targetId);
        this.__fillArrayToList(fillMethodSmooth ? pathTrans : rawPathTrans, list, { overwrite: true }, calculateTarget);
      });
      // trace('end find path');
    }

    findPathAsync(args, util) {
      this.findPath(args, util);
    }

    async findPathBetweenSprites(args, util) {
      const start = Cast.toString(args.START);
      const end = Cast.toString(args.END);
      const startTarget = this.__getSpriteTargetByNameOrId(start);
      const endTarget = this.__getSpriteTargetByNameOrId(end);
      if (!startTarget || !endTarget) {
        warn('[findPathBetweenSprites]', 'start or end target is not found');
        return;
      }
      await this.findPath(
        {
          ...args,
          SX: startTarget.x,
          SY: startTarget.y,
          EX: endTarget.x,
          EY: endTarget.y,
        },
        util
      );
    }

    findPathBetweenSpritesAsync(args, util) {
      this.findPathBetweenSprites(args, util);
    }

    drawDebugCanvasWithPath(args) {
      if (this.showDebugWindow) {
        const map = Cast.toString(args.MAP);
        this._drawDebugCanvas(map);
      }
    }

    clearMap(args) {
      const map = Cast.toString(args.NAME);
      const grid = this.maps.get(map);
      if (!grid) {
        warn('[clearMap]', 'map not found', map);
        return;
      }
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const w = Cast.toNumber(args.WIDTH);
      const h = Cast.toNumber(args.HEIGHT);

      const sx = Math.floor(x + CANVAS_WIDTH / 2);
      const sy = Math.floor(-y + CANVAS_HEIGHT / 2);

      // console.info('start clear map', sx, sy, w, h);
      for (let ix = sx; ix < w + sx; ix++) {
        for (let iy = sy; iy < h + sy; iy++) {
          if (ix >= CANVAS_WIDTH || iy >= CANVAS_HEIGHT || ix < 0 || iy < 0) {
            // overflow, ignore
          } else {
            // grid.setWalkableAt(ix, iy, true);
            grid[iy][ix] = 0;
          }
        }
      }
      // this.maps.set(map, grid);
    }

    fillPathToList(args, util) {
      if (args.LIST === 'empty') {
        return;
      }
      const map = Cast.toString(args.MAP);
      const { pathTrans } = this.lastPaths.get(map);
      if (pathTrans === undefined || pathTrans.length === 0) {
        return;
      }
      this.__fillArrayToList(pathTrans, Cast.toString(args.LIST), { overwrite: true }, util.target);
    }

    itemOfList(args, util) {
      // debugger;
      const list = this.__findList(Cast.toString(args.LIST), util.target);
      if (!list) {
        // Not found
        return 0;
      }
      const index = Cast.toNumber(args.INDEX) - 1;
      const innerIndex = Cast.toNumber(args.IDX) - 1;
      if (index >= list.value.length || index < 0) {
        return 0;
      }
      if (innerIndex !== 0 && innerIndex !== 1) {
        return 0;
      }
      const item = list.value[index];
      // eslint-disable-next-line no-useless-escape
      const xy = Cast.toString(item).replace(/[\[\]\(\)]/gm, '');
      const rt = xy.split(',');
      // console.info('itemOfList', item);
      return rt[innerIndex];
    }

    isWalkable(args) {
      const map = Cast.toString(args.MAP);
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);

      const grid = this.maps.get(map);
      if (!grid) {
        warn('[isWalkable]', 'map not found', map);
        return false;
      }
      const sx = Math.floor(x + CANVAS_WIDTH / 2);
      const sy = Math.floor(-y + CANVAS_HEIGHT / 2);
      if (sx >= CANVAS_WIDTH || sy >= CANVAS_HEIGHT || sx < 0 || sy < 0) {
        return false;
      }
      return grid[sy][sx] === 0;
    }

    isCurrentTargetOnWalkable(args, utils) {
      return this.isWalkable({ ...args, X: utils.target.x, Y: utils.target.y });
    }

    goTo(args, util) {
      // eslint-disable-next-line no-useless-escape
      const xy = Cast.toString(args.XY).replace(/[\[\]\(\)]/gm, '');
      const [x, y] = xy.split(',');
      const sx = Cast.toNumber(x) || 0;
      const sy = Cast.toNumber(y) || 0;
      util.target.setXY(sx, sy, true);
    }

    fastOrAccurate(args) {
      const accurate = Cast.toString(args.ALGORITHM) === 'accurate';
      // compatible
      const pathFindingAlg = args.PATH_FINDING ? Cast.toString(args.PATH_FINDING) : 'jps';
      this.weight = accurate ? 1 : 60;
      this.pathFindingAlg = pathFindingAlg;
    }

    addRectangleObstacle(args) {
      const map = Cast.toString(args.MAP);
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      const w = Cast.toNumber(args.WIDTH);
      const h = Cast.toNumber(args.HEIGHT);
      let grid = this.maps.get(map);
      if (!grid) {
        grid = this._create_initial_grid();
        this.maps.set(map, grid);
      }
      const sx = Math.floor(x + CANVAS_WIDTH / 2);
      const sy = Math.floor(-y + CANVAS_HEIGHT / 2);
      for (let ix = sx; ix < w + sx; ix++) {
        for (let iy = sy; iy < h + sy; iy++) {
          if (ix >= CANVAS_WIDTH || iy >= CANVAS_HEIGHT || ix < 0 || iy < 0) {
            // overflow, ignore
          } else {
            grid[iy][ix] = 1;
          }
        }
      }
    }

    openDocument() {
      const url = this.fm({ documentURL: 'https://getgandi.com/extensions/odyssey' });
      window.open(url, '_blank');
    }

    toggleDebugWindow() {
      this.showDebugWindow = !this.showDebugWindow;
      this.debugContainer.style.display = this.showDebugWindow ? 'block' : 'none';
    }

    setWorkerManually(args) {
      const url = Cast.toString(args.URL);
      if (url && url.startsWith('http')) {
        this.workerURL = url;
      } else {
        this.workerURL = undefined;
      }
    }
  }

  Scratch.extensions.register(new GandiAStar(Scratch.vm.runtime));
})(Scratch);

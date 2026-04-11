(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('高级设置面板扩展需要在非沙盒模式下运行');
  }

  // 依赖库的 CDN 链接
  const LIBS = {
    LIL_GUI: 'https://cdn.jsdelivr.net/npm/lil-gui@0.19',
    MARKED: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    KATEX_CSS: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
    KATEX_JS: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
    KATEX_AUTO_RENDER: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
    MERMAID: 'https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js' 
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`${src} 加载失败`));
      document.head.appendChild(script);
    });
  }

  function loadStyle(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  let dependenciesPromise = null;

  function preloadDependencies() {
    if (dependenciesPromise) return dependenciesPromise;
    loadStyle(LIBS.KATEX_CSS);
    dependenciesPromise = Promise.all([
      loadScript(LIBS.LIL_GUI),
      loadScript(LIBS.MARKED),
      loadScript(LIBS.KATEX_JS).then(() => loadScript(LIBS.KATEX_AUTO_RENDER)),
      loadScript(LIBS.MERMAID)
    ]).then(() => {
      if (window.mermaid) {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      }
    }).catch(err => {
      console.error('设置面板扩展依赖加载异常:', err);
    });
    return dependenciesPromise;
  }

  preloadDependencies();

  class SettingsPanelExtension {
    constructor() {
      this.panels = {};
      this.panelData = {};
      this.controllers = {};
      this.folders = {}; 

      this.changedEvents = [];
      this.buttonEvents = [];
    }

    getInfo() {
      return {
        id: 'settingspanel',
        name: '高级设置面板',
        color1: '#4C97FF',
        color2: '#3373CC',
        blocks: [
          {
            opcode: 'createPanel',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建面板 [NAME] 位于 [POS]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              POS: { type: Scratch.ArgumentType.STRING, menu: 'positions', defaultValue: 'top-right' }
            }
          },
          '---',
          {
            opcode: 'addString',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加字符串 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'hello' }
            }
          },
          {
            opcode: 'addNumber',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加数字 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'num' },
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'addSlider',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加滑块 [PROP] 默认值 [VAL] 最小值 [MIN] 最大值 [MAX] 步长 [STEP]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'slider' },
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              MIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              STEP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'addBoolean',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加布尔 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'bool' },
              VAL: { type: Scratch.ArgumentType.STRING, menu: 'booleans', defaultValue: 'true' }
            }
          },
          {
            opcode: 'addDropdown',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加选项 [PROP] 默认值 [VAL] 选项 [OPTIONS]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'option' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '1' },
              OPTIONS: { type: Scratch.ArgumentType.STRING, defaultValue: '{"one":1,"two":2,"three":3}' }
            }
          },
          {
            opcode: 'addButton',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加按钮 [PROP]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'button' }
            }
          },
          {
            opcode: 'addColor',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加颜色 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'color' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '#ff0000' }
            }
          },
          '---',
          {
            opcode: 'addDateTime',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加[TYPE]选择器 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              TYPE: { type: Scratch.ArgumentType.STRING, menu: 'dateTypes', defaultValue: 'date' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'date' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'addFilePicker',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加文件上传 [PROP] 接受格式 [ACCEPT]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'file' },
              ACCEPT: { type: Scratch.ArgumentType.STRING, defaultValue: 'image/*,.json' }
            }
          },
          {
            opcode: 'addImage',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中显示图片 [PROP] 链接 [URL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://scratch.mit.edu/images/logo_sm.png' }
            }
          },
          {
            opcode: 'addTextarea',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加多行文本 [PROP] 默认值 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'text' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '第一行\n第二行' }
            }
          },
          {
            opcode: 'addMarkdown',
            blockType: Scratch.BlockType.COMMAND,
            text: '在面板 [NAME] 嵌入Markdown+Math [PROP] 内容 [TEXT]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'md' },
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '### 公式\n$$E=mc^2$$\n支持Markdown' }
            }
          },
          '---',
          {
            opcode: 'addLabel',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加标签 [TEXT]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '这是一个标签' }
            }
          },
          {
            opcode: 'addDivider',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中添加分隔线',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' } }
          },
          {
            opcode: 'createFolder',
            blockType: Scratch.BlockType.COMMAND,
            text: '在 [NAME] 中创建分组 [FOLDER]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: '高级设置' }
            }
          },
          {
            opcode: 'moveToFolder',
            blockType: Scratch.BlockType.COMMAND,
            text: '移动 [NAME] 中 [PROP] 到文件夹 [FOLDER]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' },
              FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: '高级设置' }
            }
          },
          {
            opcode: 'setFolderState',
            blockType: Scratch.BlockType.COMMAND,
            text: '[STATE] 面板 [NAME] 的分组 [FOLDER]',
            arguments: {
              STATE: { type: Scratch.ArgumentType.STRING, menu: 'folderStates', defaultValue: 'close' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: '高级设置' }
            }
          },
          '---',
          {
            opcode: 'setPropertyValue',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置面板 [NAME] 属性 [PROP] 的值为 [VAL]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: 'new value' }
            }
          },
          {
            opcode: 'setPropertyDisplayName',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置面板 [NAME] 属性 [PROP] 显示名称为 [TITLE]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' },
              TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: '我的变量' }
            }
          },
          {
            opcode: 'setPropertyTooltip',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置面板 [NAME] 属性 [PROP] 悬浮提示为 [TIP]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' },
              TIP: { type: Scratch.ArgumentType.STRING, defaultValue: '这是一个说明文本' }
            }
          },
          '---',
          {
            opcode: 'getProperty',
            blockType: Scratch.BlockType.REPORTER,
            text: '读取面板 [NAME] 的属性 [PROP]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' }
            }
          },
          {
            opcode: 'whenPropertyChanged',
            blockType: Scratch.BlockType.HAT,
            isEdgeActivated: true,
            text: '当监听到面板 [NAME] 的属性 [PROP] 改变时',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' }
            }
          },
          {
            opcode: 'whenButtonClicked',
            blockType: Scratch.BlockType.HAT,
            isEdgeActivated: true,
            text: '当监听到面板 [NAME] 的按钮 [PROP] 被点击时',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'button' }
            }
          },
          '---',
          {
            opcode: 'exportPanelJson',
            blockType: Scratch.BlockType.REPORTER,
            text: '导出面板 [NAME] 为 JSON',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' } }
          },
          {
            opcode: 'importPanelJson',
            blockType: Scratch.BlockType.COMMAND,
            text: '导入 JSON [JSON] 到面板 [NAME]',
            arguments: {
              JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '{"str":"hello","num":10}' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' }
            }
          },
          '---',
          {
            opcode: 'setPropertyEnabled',
            blockType: Scratch.BlockType.COMMAND,
            text: '[STATE] 面板 [NAME] 中的属性 [PROP]',
            arguments: {
              STATE: { type: Scratch.ArgumentType.STRING, menu: 'enableStates', defaultValue: 'disable' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' }
            }
          },
          {
            opcode: 'setPropertyVisible',
            blockType: Scratch.BlockType.COMMAND,
            text: '[STATE] 面板 [NAME] 中的属性 [PROP]',
            arguments: {
              STATE: { type: Scratch.ArgumentType.STRING, menu: 'visibleStates', defaultValue: 'hide' },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' }
            }
          },
          {
            opcode: 'removeProperty',
            blockType: Scratch.BlockType.COMMAND,
            text: '从面板 [NAME] 中删除属性 [PROP]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              PROP: { type: Scratch.ArgumentType.STRING, defaultValue: 'str' }
            }
          },
          {
            opcode: 'showPanel',
            blockType: Scratch.BlockType.COMMAND,
            text: '显示面板 [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' } }
          },
          {
            opcode: 'hidePanel',
            blockType: Scratch.BlockType.COMMAND,
            text: '隐藏面板 [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' } }
          },
          {
            opcode: 'destroyPanel',
            blockType: Scratch.BlockType.COMMAND,
            text: '销毁面板 [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' } }
          },
          {
            opcode: 'setPanelStyle',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置面板 [NAME] 样式 CSS: [CSS]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'setting' },
              CSS: { type: Scratch.ArgumentType.STRING, defaultValue: 'width: 300px; top: 50px;' }
            }
          }
        ],
        menus: {
          positions: { acceptReporters: true, items: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
          booleans: { acceptReporters: true, items: ['true', 'false'] },
          enableStates: { acceptReporters: true, items: [{text: '禁用', value: 'disable'}, {text: '启用', value: 'enable'}] },
          visibleStates: { acceptReporters: true, items: [{text: '隐藏', value: 'hide'}, {text: '显示', value: 'show'}] },
          folderStates: { acceptReporters: true, items: [{text: '展开', value: 'open'}, {text: '折叠', value: 'close'}] },
          dateTypes: { acceptReporters: true, items: [{text: '日期', value: 'date'}, {text: '时间', value: 'time'}, {text: '颜色', value: 'color'}] }
        }
      };
    }

    async _ensureLibs() {
      await preloadDependencies();
    }

    _queuePropertyChanged(name, prop) {
      this.changedEvents.push({ NAME: String(name), PROP: String(prop), id: Math.random() });
    }

    _queueButtonClicked(name, prop) {
      this.buttonEvents.push({ NAME: String(name), PROP: String(prop), id: Math.random() });
    }

    _injectCustomElement(name, prop, el) {
      if (!this.panels[name]) return;
      const childrenContainer = this.panels[name].domElement.querySelector('.children');
      if (childrenContainer) {
        childrenContainer.appendChild(el);
        if (prop) {
          this.controllers[name][prop] = { domElement: el, destroy: () => el.remove() };
        }
      }
    }

    _replaceInputWidget(name, prop, inputElement, updateCallback) {
      const controller = this.panels[name].add(this.panelData[name], prop);
      const widget = controller.domElement.querySelector('.widget');
      const oldInput = widget.querySelector('input');
      
      inputElement.style.width = '100%';
      inputElement.style.boxSizing = 'border-box';
      inputElement.style.backgroundColor = 'var(--bg-color, #222)';
      inputElement.style.color = 'var(--text-color, #eee)';
      inputElement.style.border = '1px solid var(--border-color, #444)';
      inputElement.style.fontFamily = 'inherit';
      inputElement.style.padding = '2px 4px';
      
      widget.replaceChild(inputElement, oldInput);
      widget.style.display = 'block';

      if (updateCallback) {
        controller.updateDisplay = () => {
          updateCallback(inputElement, this.panelData[name][prop]);
          return controller;
        };
      }
      this.controllers[name][prop] = controller;
      return controller;
    }

    whenPropertyChanged(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      const index = this.changedEvents.findIndex(e => e.NAME === name && e.PROP === prop);
      if (index !== -1) {
        this.changedEvents.splice(index, 1);
        return true;
      }
      return false;
    }

    whenButtonClicked(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      const index = this.buttonEvents.findIndex(e => e.NAME === name && e.PROP === prop);
      if (index !== -1) {
        this.buttonEvents.splice(index, 1);
        return true;
      }
      return false;
    }

    async createPanel(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      if (this.panels[name]) return;

      const gui = new window.lil.GUI({ title: name });
      gui.domElement.style.position = 'absolute';
      gui.domElement.style.zIndex = '9999';

      if (args.POS === 'top-left') {
        gui.domElement.style.top = '0'; gui.domElement.style.left = '0';
      } else if (args.POS === 'top-right') {
        gui.domElement.style.top = '0'; gui.domElement.style.right = '0';
      } else if (args.POS === 'bottom-left') {
        gui.domElement.style.bottom = '0'; gui.domElement.style.left = '0';
      } else if (args.POS === 'bottom-right') {
        gui.domElement.style.bottom = '0'; gui.domElement.style.right = '0';
      }

      this.panels[name] = gui;
      this.panelData[name] = {};
      this.controllers[name] = {};
      this.folders[name] = {};
    }

    _addProperty(name, prop, defaultValue, config = null) {
      if (!this.panels[name] || this.controllers[name][prop]) return;

      this.panelData[name][prop] = defaultValue;
      let controller;
      if (config && config.type === 'slider') {
        controller = this.panels[name].add(this.panelData[name], prop, config.min, config.max, config.step);
      } else if (config && config.type === 'dropdown') {
        controller = this.panels[name].add(this.panelData[name], prop, config.options);
      } else if (config && config.type === 'color') {
        controller = this.panels[name].addColor(this.panelData[name], prop);
      } else {
        controller = this.panels[name].add(this.panelData[name], prop);
      }

      controller.onChange(() => { this._queuePropertyChanged(name, prop); });
      this.controllers[name][prop] = controller;
      return controller;
    }

    _autoAddProperty(name, prop, value) {
      if (!this.panels[name] || this.controllers[name][prop]) return;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        this._addProperty(name, prop, value);
      } else if (value === null || value === undefined) {
        this._addProperty(name, prop, '');
      } else {
        let textValue = '';
        try { textValue = JSON.stringify(value); } catch (e) { textValue = String(value); }
        this._addProperty(name, prop, textValue);
      }
    }

    async addString(args) { await this._ensureLibs(); this._addProperty(String(args.NAME), String(args.PROP), String(args.VAL)); }
    async addNumber(args) { await this._ensureLibs(); this._addProperty(String(args.NAME), String(args.PROP), Number(args.VAL)); }
    
    async addSlider(args) {
      await this._ensureLibs();
      this._addProperty(String(args.NAME), String(args.PROP), Number(args.VAL), {
        type: 'slider', min: Number(args.MIN), max: Number(args.MAX), step: Number(args.STEP)
      });
    }

    async addBoolean(args) { await this._ensureLibs(); this._addProperty(String(args.NAME), String(args.PROP), String(args.VAL) === 'true'); }

    async addDropdown(args) {
      await this._ensureLibs();
      let optionsObj;
      try { optionsObj = JSON.parse(String(args.OPTIONS)); } catch (e) { optionsObj = { 'JSON错误': 'error' }; }
      let defaultValue = args.VAL;
      const values = Object.values(optionsObj);
      if (!values.includes(defaultValue) && values.includes(Number(defaultValue))) {
        defaultValue = Number(defaultValue);
      }
      this._addProperty(String(args.NAME), String(args.PROP), defaultValue, { type: 'dropdown', options: optionsObj });
    }

    async addButton(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      this.panelData[name][prop] = () => { this._queueButtonClicked(name, prop); };
      this.controllers[name][prop] = this.panels[name].add(this.panelData[name], prop);
    }

    async addColor(args) { await this._ensureLibs(); this._addProperty(String(args.NAME), String(args.PROP), String(args.VAL), { type: 'color' }); }

    async addDateTime(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      this.panelData[name][prop] = String(args.VAL);
      const input = document.createElement('input');
      input.type = String(args.TYPE); // 'date', 'time' or 'color'
      input.value = this.panelData[name][prop];

      input.addEventListener('change', () => {
        this.panelData[name][prop] = input.value;
        this._queuePropertyChanged(name, prop);
      });

      this._replaceInputWidget(name, prop, input, (el, val) => el.value = val);
    }

    async addFilePicker(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      this.panelData[name][prop] = ""; 
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = String(args.ACCEPT);
      input.style.padding = '0';
      input.style.fontSize = '11px';

      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.panelData[name][prop] = ev.target.result; // 返回 Base64 DataURL
          this._queuePropertyChanged(name, prop);
        };
        reader.readAsDataURL(file);
      });

      this._replaceInputWidget(name, prop, input);
    }

    async addImage(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      const url = String(args.URL);
      this.panelData[name][prop] = url;

      const container = document.createElement('div');
      container.className = 'lil-gui-image-container';
      container.style.padding = '4px';
      container.style.textAlign = 'center';
      
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '150px';
      img.style.borderRadius = '4px';
      img.style.objectFit = 'contain';
      
      container.appendChild(img);
      this._injectCustomElement(name, prop, container);

      this.controllers[name][prop] = {
        domElement: container,
        updateDisplay: () => {
          img.src = this.panelData[name][prop];
        },
        destroy: () => container.remove()
      };
    }

    async addTextarea(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      this.panelData[name][prop] = String(args.VAL);
      const textarea = document.createElement('textarea');
      textarea.value = this.panelData[name][prop];
      textarea.style.resize = 'vertical';
      textarea.style.minHeight = '60px';
      textarea.style.marginTop = '4px';

      textarea.addEventListener('input', () => {
        this.panelData[name][prop] = textarea.value;
        this._queuePropertyChanged(name, prop);
      });

      const controller = this._replaceInputWidget(name, prop, textarea, (el, val) => el.value = val);
      controller.domElement.style.alignItems = 'flex-start';
    }

    async addMarkdown(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.panels[name] || this.controllers[name][prop]) return;

      const el = document.createElement('div');
      el.style.padding = '6px';
      el.style.color = '#ccc';
      el.style.fontSize = '12px';
      el.style.lineHeight = '1.5';
      el.className = 'lil-gui-md-container';

      el.innerHTML = window.marked.parse(String(args.TEXT));
      const mermaidBlocks = el.querySelectorAll('pre code.language-mermaid');
      mermaidBlocks.forEach((codeBlock) => {
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = codeBlock.textContent;
        const preElement = codeBlock.parentNode;
        preElement.parentNode.replaceChild(mermaidDiv, preElement);
      });

      if (!document.getElementById('lil-gui-md-style')) {
        const style = document.createElement('style');
        style.id = 'lil-gui-md-style';
        style.textContent = `
          .lil-gui-md-container a { color: #4C97FF; }
          .lil-gui-md-container p { margin-block-start: 0.5em; margin-block-end: 0.5em; }
          .lil-gui-md-container ul, .lil-gui-md-container ol { padding-inline-start: 20px; }
          .lil-gui-md-container img { max-width: 100%; border-radius: 4px; }
          .lil-gui-md-container code { background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 3px; font-family: monospace; }
          .lil-gui-md-container pre code { background: none; padding: 0; }
          .lil-gui-md-container .mermaid svg { max-width: 100%; height: auto; }
        `;
        document.head.appendChild(style);
      }

      this._injectCustomElement(name, prop, el);

      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
        });
      }
      if (window.mermaid && el.querySelectorAll('.mermaid').length > 0) {
        window.mermaid.init(undefined, el.querySelectorAll('.mermaid'));
      }
    }

    async addLabel(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      if (!this.panels[name]) return;
      const el = document.createElement('div');
      el.textContent = String(args.TEXT);
      el.style.padding = '4px 6px';
      el.style.color = 'var(--title-text-color, #eee)';
      el.style.fontSize = '13px';
      el.style.fontWeight = 'bold';
      this._injectCustomElement(name, '_label_' + Math.random(), el);
    }

    async addDivider(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      if (!this.panels[name]) return;
      const el = document.createElement('div');
      el.style.height = '1px';
      el.style.backgroundColor = 'var(--border-color, #444)';
      el.style.margin = '4px 6px';
      this._injectCustomElement(name, '_divider_' + Math.random(), el);
    }

    // --- 文件夹操作 ---
    async createFolder(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const folderName = String(args.FOLDER);
      if (!this.panels[name]) return;
      if (!this.folders[name]) this.folders[name] = {};
      if (this.folders[name][folderName]) return;
      this.folders[name][folderName] = this.panels[name].addFolder(folderName);
    }

    moveToFolder(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      const folderName = String(args.FOLDER);
      if (!this.panels[name] || !this.folders[name] || !this.folders[name][folderName]) return;
      const controller = this.controllers[name][prop];
      if (!controller || !controller.domElement) return;
      const folderContainer = this.folders[name][folderName].domElement.querySelector('.children');
      if (folderContainer) {
        folderContainer.appendChild(controller.domElement);
      }
    }

    setFolderState(args) {
      const name = String(args.NAME);
      const folderName = String(args.FOLDER);
      if (this.folders[name] && this.folders[name][folderName]) {
        if (args.STATE === 'open') {
          this.folders[name][folderName].open();
        } else {
          this.folders[name][folderName].close();
        }
      }
    }

    // --- 属性值与配置修改 ---
    setPropertyValue(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (this.panelData[name] && prop in this.panelData[name]) {
        this.panelData[name][prop] = args.VAL;
        const controller = this.controllers[name][prop];
        if (controller && typeof controller.updateDisplay === 'function') {
          controller.updateDisplay();
        }
      }
    }

    setPropertyDisplayName(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (this.controllers[name] && this.controllers[name][prop] && typeof this.controllers[name][prop].name === 'function') {
        this.controllers[name][prop].name(String(args.TITLE));
      }
    }

    // ⭐ 修复了悬浮提示 (Tooltip) 问题
    setPropertyTooltip(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      
      const controller = this.controllers[name] ? this.controllers[name][prop] : null;
      if (controller && controller.domElement) {
        // 直接为 DOM 元素设置原生的 HTML title 属性，即可在悬停时出现提示
        controller.domElement.title = String(args.TIP);
      }
    }

    // --- 获取和数据操作 ---
    getProperty(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (this.panelData[name] && prop in this.panelData[name]) {
        const value = this.panelData[name][prop];
        if (typeof value === 'function') return '';
        return value;
      }
      return '';
    }

    exportPanelJson(args) {
      const name = String(args.NAME);
      if (!this.panelData[name]) return '{}';
      const result = {};
      for (const key in this.panelData[name]) {
        const value = this.panelData[name][key];
        if (typeof value !== 'function') result[key] = value;
      }
      try { return JSON.stringify(result); } catch (e) { return '{}'; }
    }

    async importPanelJson(args) {
      await this._ensureLibs();
      const name = String(args.NAME);
      const jsonText = String(args.JSON);
      if (!this.panelData[name] || !this.controllers[name] || !this.panels[name]) return;

      let data;
      try { data = JSON.parse(jsonText); } catch (e) { return; }
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;

      for (const key in data) {
        const incomingRawValue = data[key];
        
        if (!(key in this.panelData[name])) {
          this._autoAddProperty(name, key, incomingRawValue);
          this._queuePropertyChanged(name, key);
          continue;
        }

        if (typeof this.panelData[name][key] === 'function') continue;

        let incomingValue = incomingRawValue;
        const originalType = typeof this.panelData[name][key];

        if (originalType === 'number') {
          const n = Number(incomingValue);
          if (Number.isNaN(n)) continue;
          incomingValue = n;
        } else if (originalType === 'boolean') {
          if (typeof incomingValue === 'string') {
            const lower = incomingValue.trim().toLowerCase();
            if (lower === 'true' || lower === '1') incomingValue = true;
            else if (lower === 'false' || lower === '0') incomingValue = false;
            else continue;
          } else {
            incomingValue = !!incomingValue;
          }
        } else if (originalType === 'string') {
          if (typeof incomingValue === 'object' && incomingValue !== null) {
            try { incomingValue = JSON.stringify(incomingValue); } catch (e) { incomingValue = String(incomingValue); }
          } else {
            incomingValue = String(incomingValue);
          }
        }

        this.setPropertyValue({ NAME: name, PROP: key, VAL: incomingValue });
        this._queuePropertyChanged(name, key);
      }
    }

    // --- 界面控制 ---
    setPropertyEnabled(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.controllers[name] || !this.controllers[name][prop]) return;
      const element = this.controllers[name][prop].domElement;
      if (!element) return;
      if (args.STATE === 'disable') {
        element.style.pointerEvents = 'none';
        element.style.opacity = '0.5';
      } else {
        element.style.pointerEvents = '';
        element.style.opacity = '';
      }
    }

    setPropertyVisible(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (!this.controllers[name] || !this.controllers[name][prop]) return;
      const element = this.controllers[name][prop].domElement;
      if (!element) return;
      element.style.display = args.STATE === 'hide' ? 'none' : '';
    }

    removeProperty(args) {
      const name = String(args.NAME);
      const prop = String(args.PROP);
      if (this.controllers[name] && this.controllers[name][prop]) {
        this.controllers[name][prop].destroy();
        delete this.controllers[name][prop];
      }
      if (this.panelData[name] && prop in this.panelData[name]) {
        delete this.panelData[name][prop];
      }
    }

    showPanel(args) {
      const name = String(args.NAME);
      if (this.panels[name]) this.panels[name].show();
    }

    hidePanel(args) {
      const name = String(args.NAME);
      if (this.panels[name]) this.panels[name].hide();
    }

    destroyPanel(args) {
      const name = String(args.NAME);
      if (this.panels[name]) {
        this.panels[name].destroy();
        delete this.panels[name];
      }
      delete this.panelData[name];
      delete this.controllers[name];
      delete this.folders[name];
      this.changedEvents = this.changedEvents.filter(e => e.NAME !== name);
      this.buttonEvents = this.buttonEvents.filter(e => e.NAME !== name);
    }

    setPanelStyle(args) {
      const name = String(args.NAME);
      if (this.panels[name]) {
        this.panels[name].domElement.style.cssText += ';' + String(args.CSS);
      }
    }
  }

  Scratch.extensions.register(new SettingsPanelExtension());
})(Scratch);

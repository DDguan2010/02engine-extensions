// newline-panel.js - TurboWarp Extension v2
// 功能：编辑变量 + 列表（列表元素独立框、自动高度、桌面拖拽 + 移动端长按拖动）
// 新增：面板可拖动、可最小化（移动端适配：底部抽屉式最小化条、拖动标题栏）
(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('此扩展需要以 Unsandboxed 方式运行。');
  }

  class NewlinePanelExtension {
    constructor() {
      this.runtime = Scratch.vm.runtime;
      this.panelOpen = false;
      this.panelElement = null;

      this.selectedItemId = null;
      this.allItems = [];
      this.currentMode = 'VARIABLE';

      this.listItemsContainer = null;

      // Desktop HTML5 drag sort
      this.draggedElement = null;

      // Mobile touch sort
      this.isTouchDragging = false;
      this.touchDragEl = null;
      this.touchDragPointerOffsetY = 0;
      this.touchDragPlaceholder = null;
      this.touchLongPressTimer = null;
      this.touchLongPressMs = 350;
      this.touchMoveThreshold = 8;
      this.touchStartClientY = 0;
      this.touchStartClientX = 0;
      this.touchMoved = false;

      // Panel move/minimize
      this.isMinimized = false;
      this.panelPos = { left: null, top: null }; // px
      this.panelDrag = {
        active: false,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0
      };
      this.lastNonMinimized = { left: null, top: null, width: null, height: null };
    }

    getInfo() {
      return {
        id: 'newlinePanel',
        name: '换行面板',
        blocks: [
          {
            opcode: 'openPanel',
            blockType: Scratch.BlockType.COMMAND,
            text: '打开编辑面板'
          }
        ]
      };
    }

    openPanel() {
      if (this.panelOpen) return;
      this.createPanel();
      this.panelOpen = true;
    }

    isMobileLike() {
      return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    createPanel() {
      if (this.panelElement) this.panelElement.remove();

      const mobile = this.isMobileLike();

      const panel = document.createElement('div');
      this.panelElement = panel;
      panel.id = 'newline-panel';
      panel.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(780px, calc(100vw - 16px));
        max-height: calc(100vh - 16px);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        z-index: 10000;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: #fff;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        -webkit-tap-highlight-color: transparent;
      `;

      // 标题栏（可拖动）
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 10px 12px;
        background: rgba(0,0,0,0.22);
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,0.12);
        gap: 8px;
        cursor: ${mobile ? 'default' : 'move'};
        user-select: none;
        touch-action: none; /* 允许我们处理触控拖动面板 */
      `;

      const title = document.createElement('div');
      title.textContent = mobile ? '变量/列表编辑器' : '变量/列表编辑器（可拖动/最小化）';
      title.style.cssText = 'font-size: 14px; font-weight: 800; line-height: 1.2; flex: 1;';
      header.appendChild(title);

      const headerBtns = document.createElement('div');
      headerBtns.style.cssText = 'display:flex; gap:8px; align-items:center; flex-shrink: 0;';

      const minBtn = document.createElement('button');
      minBtn.textContent = '—';
      minBtn.title = '最小化/还原';
      minBtn.style.cssText = `
        width: 42px; height: 38px;
        border-radius: 10px;
        border: none;
        background: rgba(255,255,255,0.18);
        color: #fff;
        font-size: 22px;
        cursor: pointer;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.title = '关闭';
      closeBtn.style.cssText = `
        width: 42px; height: 38px;
        border-radius: 10px;
        border: none;
        background: rgba(255,255,255,0.18);
        color: #fff;
        font-size: 22px;
        cursor: pointer;
      `;
      closeBtn.onclick = () => this.closePanel();

      headerBtns.appendChild(minBtn);
      headerBtns.appendChild(closeBtn);
      header.appendChild(headerBtns);

      // 内容区域
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 12px 14px;
        overflow: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      `;

      const box = document.createElement('div');
      box.style.cssText = `
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 10px;
        padding: 12px;
      `;

      // 模式切换
      const modeTabArea = document.createElement('div');
      modeTabArea.style.cssText = 'margin-bottom: 12px; display:flex; gap:8px; flex-wrap:wrap;';

      const varTab = document.createElement('button');
      varTab.textContent = '🔤 变量';
      varTab.style.cssText = `
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.25);
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: 800;
      `;

      const listTab = document.createElement('button');
      listTab.textContent = '📑 列表';
      listTab.style.cssText = `
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.15);
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: 800;
      `;

      modeTabArea.appendChild(varTab);
      modeTabArea.appendChild(listTab);
      box.appendChild(modeTabArea);

      // 选择区域
      const selectArea = document.createElement('div');
      selectArea.style.cssText = 'margin-bottom: 10px;';

      const label = document.createElement('div');
      label.textContent = '选择要编辑的项目：';
      label.style.cssText = 'font-size:12px; opacity:0.95; margin-bottom:6px;';
      selectArea.appendChild(label);

      const selectRow = document.createElement('div');
      selectRow.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap;';

      const itemSelect = document.createElement('select');
      itemSelect.style.cssText = `
        flex:1;
        min-width: 180px;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(0,0,0,0.16);
        color: #fff;
        outline: none;
        font-size: 14px;
      `;

      const refreshBtn = document.createElement('button');
      refreshBtn.textContent = '🔄 刷新';
      refreshBtn.style.cssText = `
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.15);
        color: #fff;
        cursor: pointer;
        font-size: 14px;
        font-weight: 800;
      `;

      selectRow.appendChild(itemSelect);
      selectRow.appendChild(refreshBtn);
      selectArea.appendChild(selectRow);
      box.appendChild(selectArea);

      const itemInfo = document.createElement('div');
      itemInfo.style.cssText = 'font-size:11px; opacity:0.85; margin-bottom:10px; min-height:16px;';
      box.appendChild(itemInfo);

      // 变量编辑
      const varTextArea = document.createElement('textarea');
      varTextArea.placeholder = '请选择变量后编辑（支持换行）';
      varTextArea.style.cssText = `
        width: 100%;
        height: ${mobile ? '240px' : '320px'};
        resize: vertical;
        padding: 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(0,0,0,0.16);
        color: #fff;
        outline: none;
        box-sizing: border-box;
        line-height: 1.4;
        font-family: Consolas, Monaco, "Courier New", monospace;
        font-size: 13px;
        display: block;
      `;
      box.appendChild(varTextArea);

      // 列表编辑
      const listContainer = document.createElement('div');
      listContainer.style.cssText = `
        display: none;
        max-height: ${mobile ? '55vh' : '500px'};
        overflow-y: auto;
        padding-right: 4px;
        -webkit-overflow-scrolling: touch;
      `;

      const listHint = document.createElement('div');
      listHint.textContent = mobile
        ? '提示：长按“⋮⋮”进入拖动排序；拖动时可上下滚动。'
        : '提示：拖拽“⋮⋮”可排序。';
      listHint.style.cssText = 'font-size:11px; opacity:0.85; margin: 6px 0 10px;';
      listContainer.appendChild(listHint);

      const listControls = document.createElement('div');
      listControls.style.cssText = 'margin-bottom: 10px; display:flex; gap:8px; flex-wrap:wrap;';

      const addItemBtn = this.createButton('➕ 添加元素', '#2ecc71');
      listControls.appendChild(addItemBtn);
      listContainer.appendChild(listControls);

      this.listItemsContainer = document.createElement('div');
      listContainer.appendChild(this.listItemsContainer);
      box.appendChild(listContainer);

      // 按钮区
      const buttonArea = document.createElement('div');
      buttonArea.style.cssText = 'margin-top: 12px; display:grid; grid-template-columns: 1fr 1fr; gap: 8px;';

      const saveBtn = this.createButton('📥 保存', '#e74c3c');
      const clearBtn = this.createButton('🗑️ 清空内容', '#95a5a6');
      buttonArea.appendChild(saveBtn);
      buttonArea.appendChild(clearBtn);
      box.appendChild(buttonArea);

      // 状态
      const status = document.createElement('div');
      status.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        border-radius: 10px;
        font-size: 12px;
        display: none;
        background: rgba(0,0,0,0.2);
        font-weight: 800;
      `;
      box.appendChild(status);

      content.appendChild(box);
      panel.appendChild(header);
      panel.appendChild(content);
      document.body.appendChild(panel);

      // ---- 面板拖动（桌面+移动端）----
      const startPanelDrag = (clientX, clientY) => {
        // 最小化时也允许拖动（移动端表现为拖动最小化条）
        const rect = panel.getBoundingClientRect();

        // 使用 left/top 绝对值替代 translate 定位
        panel.style.transform = 'none';
        panel.style.left = `${rect.left}px`;
        panel.style.top = `${rect.top}px`;

        this.panelDrag.active = true;
        this.panelDrag.startX = clientX;
        this.panelDrag.startY = clientY;
        this.panelDrag.startLeft = rect.left;
        this.panelDrag.startTop = rect.top;
      };

      const movePanelDrag = (clientX, clientY) => {
        if (!this.panelDrag.active) return;

        const dx = clientX - this.panelDrag.startX;
        const dy = clientY - this.panelDrag.startY;

        const rect = panel.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const newLeft = this.clamp(this.panelDrag.startLeft + dx, 8, window.innerWidth - w - 8);
        const newTop = this.clamp(this.panelDrag.startTop + dy, 8, window.innerHeight - h - 8);

        panel.style.left = `${newLeft}px`;
        panel.style.top = `${newTop}px`;
      };

      const endPanelDrag = () => {
        this.panelDrag.active = false;
      };

      // 只允许从标题栏空白处拖动（避免按钮区域）
      header.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target === minBtn || e.target === closeBtn) return;
        startPanelDrag(e.clientX, e.clientY);
        const onMove = (ev) => movePanelDrag(ev.clientX, ev.clientY);
        const onUp = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          endPanelDrag();
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });

      header.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        if (e.target === minBtn || e.target === closeBtn) return;
        const t = e.touches[0];
        startPanelDrag(t.clientX, t.clientY);

        const onMove = (ev) => {
          if (!ev.touches || ev.touches.length !== 1) return;
          const tt = ev.touches[0];
          movePanelDrag(tt.clientX, tt.clientY);
        };
        const onEnd = () => {
          window.removeEventListener('touchmove', onMove);
          window.removeEventListener('touchend', onEnd);
          window.removeEventListener('touchcancel', onEnd);
          endPanelDrag();
        };

        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd, { passive: true });
        window.addEventListener('touchcancel', onEnd, { passive: true });
      }, { passive: true });

      // ---- 最小化/还原（移动端：底部条；桌面：缩成小窗）----
      const applyMinimizedStyle = () => {
        const rect = panel.getBoundingClientRect();
        this.lastNonMinimized = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };

        this.isMinimized = true;
        content.style.display = 'none';

        if (mobile) {
          // 底部抽屉式最小化：固定在底部，宽度撑满
          panel.style.transform = 'none';
          panel.style.left = '8px';
          panel.style.right = '8px';
          panel.style.top = '';
          panel.style.bottom = '8px';
          panel.style.width = 'calc(100vw - 16px)';
          panel.style.maxHeight = 'unset';
          panel.style.borderRadius = '14px';
        } else {
          // 桌面：缩成小窗，保留可拖动
          panel.style.maxHeight = 'unset';
          panel.style.width = '360px';
          panel.style.height = '56px';
        }
        minBtn.textContent = '▢'; // 还原图标
      };

      const applyRestoredStyle = () => {
        this.isMinimized = false;
        content.style.display = 'block';

        // 恢复位置（如果之前已经切换到 left/top 模式）
        panel.style.right = '';
        panel.style.bottom = '';
        panel.style.height = '';
        panel.style.maxHeight = 'calc(100vh - 16px)';
        panel.style.width = 'min(780px, calc(100vw - 16px))';
        panel.style.borderRadius = '12px';

        // 如果曾经有记录位置，用 left/top 还原；否则回到居中 transform
        if (this.lastNonMinimized.left != null && this.lastNonMinimized.top != null) {
          panel.style.transform = 'none';
          panel.style.left = `${this.clamp(this.lastNonMinimized.left, 8, window.innerWidth - 120)}px`;
          panel.style.top = `${this.clamp(this.lastNonMinimized.top, 8, window.innerHeight - 80)}px`;
        } else {
          panel.style.left = '50%';
          panel.style.top = '50%';
          panel.style.transform = 'translate(-50%, -50%)';
        }

        minBtn.textContent = '—';
      };

      minBtn.onclick = () => {
        if (this.isMinimized) applyRestoredStyle();
        else applyMinimizedStyle();
      };

      // 窗口尺寸变化时，保证面板不出界（移动端旋转）
      const onResize = () => {
        if (!this.panelElement) return;

        if (this.isMinimized && mobile) {
          // 底部条不需要处理
          return;
        }

        const rect = panel.getBoundingClientRect();
        if (panel.style.transform !== 'none') return; // 还在居中模式

        const w = rect.width;
        const h = rect.height;
        const left = this.clamp(rect.left, 8, window.innerWidth - w - 8);
        const top = this.clamp(rect.top, 8, window.innerHeight - h - 8);
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
      };
      window.addEventListener('resize', onResize);

      // ---- 业务逻辑 ----
      const loadItems = () => this.loadItemsList(itemSelect, itemInfo, varTextArea);

      const switchMode = (mode) => {
        this.currentMode = mode;
        this.selectedItemId = null;

        if (mode === 'VARIABLE') {
          varTab.style.background = 'rgba(255,255,255,0.25)';
          listTab.style.background = 'rgba(255,255,255,0.15)';
          varTextArea.style.display = 'block';
          listContainer.style.display = 'none';
        } else {
          varTab.style.background = 'rgba(255,255,255,0.15)';
          listTab.style.background = 'rgba(255,255,255,0.25)';
          varTextArea.style.display = 'none';
          listContainer.style.display = 'block';
        }
        loadItems();
      };

      varTab.onclick = () => switchMode('VARIABLE');
      listTab.onclick = () => switchMode('LIST');

      itemSelect.onchange = () => {
        this.selectedItemId = itemSelect.value;
        this.renderSelected(itemInfo, varTextArea);
      };
      refreshBtn.onclick = loadItems;

      saveBtn.onclick = () => {
        if (!this.selectedItemId) {
          this.showStatus(status, '❌ 请先选择一个项目', 'error');
          return;
        }
        if (this.currentMode === 'VARIABLE') {
          this.overwriteVariable(this.selectedItemId, varTextArea.value);
          this.showStatus(status, '✅ 已保存变量内容', 'success');
        } else {
          this.saveListFromItems();
          this.showStatus(status, '✅ 已保存列表内容（含新顺序）', 'success');
        }
      };

      clearBtn.onclick = () => {
        if (this.currentMode === 'VARIABLE') varTextArea.value = '';
        else this.listItemsContainer.innerHTML = '';
        this.showStatus(status, 'ℹ️ 已清空编辑区（需点击"保存"才能写入）', 'info');
      };

      addItemBtn.onclick = () => {
        if (this.currentMode !== 'LIST') return;
        const el = this.createListItemElement('');
        this.listItemsContainer.appendChild(el);
        this.updateListIndices();
        el.querySelector('textarea').focus();
      };

      loadItems();
    }

    // ---------- 数据加载 ----------
    loadItemsList(itemSelect, itemInfo, varTextArea) {
      const items = this.getItemsByMode(this.currentMode);
      itemSelect.innerHTML = '';
      this.allItems = items;

      if (items.length === 0) {
        itemSelect.innerHTML = `<option value="">没有可用的${this.currentMode === 'VARIABLE' ? '变量' : '列表'}</option>`;
        itemInfo.textContent = '';
        varTextArea.value = '';
        if (this.listItemsContainer) this.listItemsContainer.innerHTML = '';
        return;
      }

      const stageItems = items.filter(v => v.isStage);
      const spriteItems = items.filter(v => !v.isStage);

      if (stageItems.length) {
        const g = document.createElement('optgroup');
        g.label = '舞台';
        stageItems.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = v.name;
          g.appendChild(opt);
        });
        itemSelect.appendChild(g);
      }

      if (spriteItems.length) {
        const groups = {};
        spriteItems.forEach(v => (groups[v.targetName] ??= []).push(v));
        for (const [targetName, arr] of Object.entries(groups)) {
          const g = document.createElement('optgroup');
          g.label = `角色: ${targetName}`;
          arr.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = v.name;
            g.appendChild(opt);
          });
          itemSelect.appendChild(g);
        }
      }

      if (this.selectedItemId && items.some(v => v.id === this.selectedItemId)) {
        itemSelect.value = this.selectedItemId;
      } else {
        this.selectedItemId = items[0].id;
        itemSelect.value = this.selectedItemId;
      }

      this.renderSelected(itemInfo, varTextArea);
    }

    renderSelected(itemInfo, varTextArea) {
      if (this.currentMode === 'VARIABLE') {
        this.loadSelectedVariable(itemInfo, varTextArea);
      } else {
        this.loadSelectedList(itemInfo);
      }
    }

    getItemsByMode(mode) {
      const items = [];
      const targets = this.runtime.targets || [];
      targets.forEach(target => {
        const targetVars = target.variables || {};
        const targetName = target.getName ? target.getName() : (target.name || '未知角色');
        for (const id in targetVars) {
          const v = targetVars[id];
          if (!v) continue;
          if (mode === 'VARIABLE' && v.type === '') {
            items.push({ id, name: v.name, value: v.value, targetName, isStage: target.isStage, type: mode });
          }
          if (mode === 'LIST' && v.type === 'list') {
            items.push({ id, name: v.name, value: v.value, targetName, isStage: target.isStage, type: mode });
          }
        }
      });
      items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      return items;
    }

    loadSelectedVariable(itemInfo, varTextArea) {
      if (!this.selectedItemId) {
        itemInfo.textContent = '';
        varTextArea.value = '';
        return;
      }
      const item = this.allItems.find(v => v.id === this.selectedItemId);
      if (!item) return;

      const targetType = item.isStage ? '舞台' : '角色';
      itemInfo.textContent = `${targetType}: ${item.targetName} | 长度: ${String(item.value).length}`;
      varTextArea.value = String(item.value);
    }

    loadSelectedList(itemInfo) {
      if (!this.selectedItemId) {
        itemInfo.textContent = '';
        if (this.listItemsContainer) this.listItemsContainer.innerHTML = '';
        return;
      }
      const item = this.allItems.find(v => v.id === this.selectedItemId);
      if (!item) return;

      const targetType = item.isStage ? '舞台' : '角色';
      const arr = Array.isArray(item.value) ? item.value : [];
      itemInfo.textContent = `${targetType}: ${item.targetName} | 元素数: ${arr.length}`;

      this.listItemsContainer.innerHTML = '';
      arr.forEach(val => this.listItemsContainer.appendChild(this.createListItemElement(val)));
      this.updateListIndices();
    }

    // ---------- 列表元素 + 排序 ----------
    createListItemElement(value) {
      const wrapper = document.createElement('div');
      wrapper.className = 'list-item-wrapper';
      wrapper.style.cssText = `
        display:flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items:flex-start;
        padding: 6px;
        border-radius: 10px;
        background: rgba(0,0,0,0.06);
        border: 1px solid rgba(255,255,255,0.12);
      `;

      const handle = document.createElement('div');
      handle.textContent = '⋮⋮';
      handle.title = '拖动排序（移动端：长按）';
      handle.style.cssText = `
        width: 34px;
        padding: 12px 0;
        text-align:center;
        font-size: 16px;
        opacity: 0.75;
        flex-shrink: 0;
        user-select: none;
        border-radius: 10px;
        background: rgba(255,255,255,0.10);
        cursor: grab;
        touch-action: none;
      `;

      const indexLabel = document.createElement('div');
      indexLabel.className = 'index-label';
      indexLabel.textContent = '1.';
      indexLabel.style.cssText = `
        width: 34px;
        padding: 12px 0;
        text-align:center;
        font-size: 12px;
        opacity: 0.85;
        flex-shrink: 0;
      `;

      const textarea = document.createElement('textarea');
      textarea.value = String(value ?? '');
      textarea.style.cssText = `
        flex: 1;
        min-height: 44px;
        max-height: 260px;
        resize: vertical;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.35);
        background: rgba(0,0,0,0.16);
        color: #fff;
        outline: none;
        font-family: Consolas, Monaco, "Courier New", monospace;
        font-size: 13px;
        line-height: 1.4;
        box-sizing: border-box;
      `;

      const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(44, textarea.scrollHeight) + 'px';
      };
      textarea.addEventListener('input', autoResize);
      setTimeout(autoResize, 0);

      const del = document.createElement('button');
      del.textContent = '🗑️';
      del.title = '删除此项';
      del.style.cssText = `
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(244,67,54,0.3);
        color: #fff;
        cursor: pointer;
        font-size: 14px;
        flex-shrink: 0;
      `;
      del.onclick = () => {
        wrapper.remove();
        this.updateListIndices();
      };

      // Desktop HTML5 drag (wrapper draggable; usually desktop only)
      wrapper.draggable = true;
      wrapper.ondragstart = (e) => {
        if (e.target === textarea) { e.preventDefault(); return; }
        this.draggedElement = wrapper;
        wrapper.style.opacity = '0.6';
        e.dataTransfer.effectAllowed = 'move';
      };
      wrapper.ondragend = () => {
        wrapper.style.opacity = '';
        this.draggedElement = null;
        this.updateListIndices();
      };
      wrapper.ondragover = (e) => {
        e.preventDefault();
        if (!this.draggedElement) return;
        const after = this.getDragAfterElement(this.listItemsContainer, e.clientY);
        if (after == null) this.listItemsContainer.appendChild(this.draggedElement);
        else this.listItemsContainer.insertBefore(this.draggedElement, after);
      };

      // Mobile: long-press handle drag
      handle.addEventListener('touchstart', (e) => this.onTouchHandleStart(e, wrapper), { passive: false });
      handle.addEventListener('touchmove', (e) => this.onTouchHandleMove(e), { passive: false });
      handle.addEventListener('touchend', () => this.onTouchHandleEnd(), { passive: true });
      handle.addEventListener('touchcancel', () => this.onTouchHandleEnd(), { passive: true });

      wrapper.appendChild(handle);
      wrapper.appendChild(indexLabel);
      wrapper.appendChild(textarea);
      wrapper.appendChild(del);
      return wrapper;
    }

    onTouchHandleStart(e, wrapper) {
      if (!e.touches || e.touches.length !== 1) return;
      e.preventDefault();

      const t = e.touches[0];
      this.touchMoved = false;
      this.touchStartClientY = t.clientY;
      this.touchStartClientX = t.clientX;

      clearTimeout(this.touchLongPressTimer);
      this.touchLongPressTimer = setTimeout(() => {
        this.startTouchDrag(wrapper, t.clientY);
      }, this.touchLongPressMs);
    }

    onTouchHandleMove(e) {
      if (!e.touches || e.touches.length !== 1) return;
      const t = e.touches[0];

      const dy = Math.abs(t.clientY - this.touchStartClientY);
      const dx = Math.abs(t.clientX - this.touchStartClientX);
      if (dy > this.touchMoveThreshold || dx > this.touchMoveThreshold) this.touchMoved = true;

      if (!this.isTouchDragging && this.touchMoved) {
        clearTimeout(this.touchLongPressTimer);
        return;
      }
      if (!this.isTouchDragging) return;

      e.preventDefault();

      const y = t.clientY - this.touchDragPointerOffsetY;
      this.touchDragEl.style.top = `${y}px`;

      // auto scroll list container (parent of listItemsContainer)
      const container = this.listItemsContainer.parentElement;
      const rect = container.getBoundingClientRect();
      const edge = 40;
      const speed = 12;
      if (t.clientY < rect.top + edge) container.scrollTop -= speed;
      if (t.clientY > rect.bottom - edge) container.scrollTop += speed;

      const after = this.getDragAfterElement(this.listItemsContainer, t.clientY);
      if (after == null) this.listItemsContainer.appendChild(this.touchDragPlaceholder);
      else this.listItemsContainer.insertBefore(this.touchDragPlaceholder, after);
    }

    onTouchHandleEnd() {
      clearTimeout(this.touchLongPressTimer);
      if (!this.isTouchDragging) return;

      const ph = this.touchDragPlaceholder;
      if (ph && ph.parentNode) {
        ph.parentNode.insertBefore(this.touchDragEl, ph);
        ph.remove();
      }

      const el = this.touchDragEl;
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.zIndex = '';
      el.style.boxShadow = '';
      el.style.opacity = '';

      this.isTouchDragging = false;
      this.touchDragEl = null;
      this.touchDragPlaceholder = null;

      this.updateListIndices();
    }

    startTouchDrag(wrapper, clientY) {
      this.isTouchDragging = true;
      this.touchDragEl = wrapper;

      const rect = wrapper.getBoundingClientRect();
      this.touchDragPointerOffsetY = clientY - rect.top;

      const ph = document.createElement('div');
      ph.style.cssText = `
        height: ${rect.height}px;
        margin-bottom: 8px;
        border-radius: 10px;
        border: 2px dashed rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.08);
      `;
      this.touchDragPlaceholder = ph;

      wrapper.parentNode.insertBefore(ph, wrapper.nextSibling);

      wrapper.style.width = `${rect.width}px`;
      wrapper.style.position = 'fixed';
      wrapper.style.left = `${rect.left}px`;
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.zIndex = '10001';
      wrapper.style.boxShadow = '0 10px 30px rgba(0,0,0,0.45)';
      wrapper.style.opacity = '0.92';
    }

    getDragAfterElement(container, y) {
      const items = [...container.querySelectorAll('.list-item-wrapper')]
        .filter(el => el !== this.draggedElement && el !== this.touchDragEl);

      let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
      for (const child of items) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) closest = { offset, element: child };
      }
      return closest.element;
    }

    updateListIndices() {
      const wrappers = this.listItemsContainer?.querySelectorAll('.list-item-wrapper') || [];
      wrappers.forEach((wrapper, idx) => {
        const label = wrapper.querySelector('.index-label');
        if (label) label.textContent = `${idx + 1}.`;
      });
    }

    // ---------- 保存 ----------
    saveListFromItems() {
      if (!this.selectedItemId) return;

      const item = this.allItems.find(v => v.id === this.selectedItemId);
      if (!item) return;

      const target = this.runtime.targets.find(t => t.variables && t.variables[this.selectedItemId]);
      if (!target) return;

      const listObj = target.variables[this.selectedItemId];
      if (!listObj) return;

      const textareas = this.listItemsContainer.querySelectorAll('textarea');
      const values = Array.from(textareas).map(ta => ta.value);

      listObj.value = values;
      item.value = values;

      this.runtime.emit('PROJECT_CHANGED');
      this.runtime.requestRedraw();
    }

    overwriteVariable(varId, newText) {
      const item = this.allItems.find(v => v.id === varId);
      if (!item) return;

      const target = this.runtime.targets.find(t => t.variables && t.variables[varId]);
      if (!target) return;

      const varObj = target.variables[varId];
      if (!varObj) return;

      varObj.value = newText;
      item.value = newText;

      this.runtime.emit('PROJECT_CHANGED');
      this.runtime.requestRedraw();
    }

    // ---------- UI helpers ----------
    createButton(text, bgColor = 'rgba(255,255,255,0.15)') {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText = `
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.3);
        background: ${bgColor};
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: 900;
      `;
      return btn;
    }

    showStatus(element, message, type) {
      if (!element) return;
      element.textContent = message;
      element.style.display = 'block';
      element.style.background =
        type === 'success' ? 'rgba(76,175,80,0.3)' :
        type === 'error' ? 'rgba(244,67,54,0.3)' :
        type === 'info' ? 'rgba(52,152,219,0.3)' :
        'rgba(0,0,0,0.2)';
      setTimeout(() => (element.style.display = 'none'), 2600);
    }

    closePanel() {
      clearTimeout(this.touchLongPressTimer);

      if (this.panelElement) {
        this.panelElement.remove();
        this.panelElement = null;
      }
      this.panelOpen = false;

      this.selectedItemId = null;
      this.allItems = [];
      this.currentMode = 'VARIABLE';
      this.listItemsContainer = null;

      this.draggedElement = null;

      this.isTouchDragging = false;
      this.touchDragEl = null;
      this.touchDragPlaceholder = null;

      this.isMinimized = false;
    }
  }

  Scratch.extensions.register(new NewlinePanelExtension());
})(Scratch);

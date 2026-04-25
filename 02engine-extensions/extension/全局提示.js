class GlobalAlertExtension {
  constructor() {
    this.loadingModal = null;
    this.progressModal = null;
    this.progressTotal = 100;
    this.progressCurrent = 0;
  }

  // 获取运行时
  getInfo() {
    return {
      id: 'globalAlert',
      name: '全局提示',
      color1: '#5078F5',
      color2: '#405FC6',
      blocks: [
        {
          opcode: 'showAlert',
          blockType: Scratch.BlockType.COMMAND,
          text: '显示弹窗，标题[title]内容[content]显示在舞台[position]图标[icon]显示[seconds]秒',
          arguments: {
            title: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '提示'
            },
            content: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '这是提示内容'
            },
            position: {
              type: Scratch.ArgumentType.STRING,
              menu: 'positionMenu'
            },
            icon: {
              type: Scratch.ArgumentType.STRING,
              menu: 'iconMenu'
            },
            seconds: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 3
            }
          }
        },
        {
          opcode: 'showConfirm',
          blockType: Scratch.BlockType.REPORTER,
          text: '显示询问弹窗，标题[title]内容[content]显示在舞台[position]默认按钮内容[button1]按钮2内容[button2]',
          arguments: {
            title: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '请确认'
            },
            content: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '你确定要执行此操作吗？'
            },
            position: {
              type: Scratch.ArgumentType.STRING,
              menu: 'positionMenu'
            },
            button1: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '确定'
            },
            button2: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '取消'
            }
          }
        },
        {
          opcode: 'showInput',
          blockType: Scratch.BlockType.REPORTER,
          text: '显示输入弹窗，标题[title]提示内容[hint]默认内容[default]显示在舞台[position]',
          arguments: {
            title: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '请输入'
            },
            hint: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '请输入内容'
            },
            default: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            },
            position: {
              type: Scratch.ArgumentType.STRING,
              menu: 'positionMenu'
            }
          }
        },
        {
          opcode: 'showLoading',
          blockType: Scratch.BlockType.COMMAND,
          text: '显示加载弹窗，内容[content]显示在舞台[position]',
          arguments: {
            content: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '加载中...'
            },
            position: {
              type: Scratch.ArgumentType.STRING,
              menu: 'positionMenu'
            }
          }
        },
        {
          opcode: 'closeLoading',
          blockType: Scratch.BlockType.COMMAND,
          text: '关闭加载弹窗'
        },
        {
          opcode: 'showProgress',
          blockType: Scratch.BlockType.COMMAND,
          text: '显示进度条弹窗，内容[content]显示在舞台[position]',
          arguments: {
            content: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '处理中...'
            },
            position: {
              type: Scratch.ArgumentType.STRING,
              menu: 'positionMenu'
            }
          }
        },
        {
          opcode: 'setTotalProgress',
          blockType: Scratch.BlockType.COMMAND,
          text: '设置进度条弹窗总进度为[total]',
          arguments: {
            total: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 100
            }
          }
        },
        {
          opcode: 'setCurrentProgress',
          blockType: Scratch.BlockType.COMMAND,
          text: '设置进度条弹窗现进度为[current]',
          arguments: {
            current: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 0
            }
          }
        },
        {
          opcode: 'closeProgress',
          blockType: Scratch.BlockType.COMMAND,
          text: '关闭进度条弹窗'
        },
        {
          opcode: 'getAuthor',
          blockType: Scratch.BlockType.REPORTER,
          text: '拓展作者：Starfall Studio'
        }
      ],
      menus: {
        positionMenu: {
          items: [
            {text: '左上角', value: 'top-left'},
            {text: '左下角', value: 'bottom-left'},
            {text: '中间', value: 'middle'},
            {text: '右上角', value: 'top-right'},
            {text: '右下角', value: 'bottom-right'}
          ]
        },
        iconMenu: {
          items: [
            {text: '❌️', value: 'error'},
            {text: '⚠️', value: 'warning'},
            {text: 'i', value: 'info'}
          ]
        }
      }
    };
  }

  // 显示普通弹窗
  showAlert(args) {
    return new Promise(resolve => {
      this._createModal({
        type: 'alert',
        title: args.title,
        content: args.content,
        position: args.position,
        icon: args.icon,
        seconds: args.seconds
      });
      resolve();
    });
  }

  // 显示询问弹窗
  showConfirm(args) {
    return new Promise(resolve => {
      const result = this._createModal({
        type: 'confirm',
        title: args.title,
        content: args.content,
        position: args.position,
        button1: args.button1,
        button2: args.button2,
        callback: (selected) => {
          resolve(selected);
        }
      });
    });
  }

  // 显示输入弹窗
  showInput(args) {
    return new Promise(resolve => {
      this._createModal({
        type: 'input',
        title: args.title,
        content: args.hint,
        defaultValue: args.default,
        position: args.position,
        callback: (input) => {
          resolve(input);
        }
      });
    });
  }

  // 显示加载弹窗
  showLoading(args) {
    this._createModal({
      type: 'loading',
      content: args.content,
      position: args.position
    });
  }

  // 关闭加载弹窗
  closeLoading() {
    this._removeModal('loading');
  }

  // 显示进度条弹窗
  showProgress(args) {
    this._createModal({
      type: 'progress',
      content: args.content,
      position: args.position,
      total: this.progressTotal,
      current: this.progressCurrent
    });
  }

  // 设置进度条总进度
  setTotalProgress(args) {
    this.progressTotal = Math.max(1, args.total);
    this._updateProgressBar();
  }

  // 设置进度条当前进度
  setCurrentProgress(args) {
    this.progressCurrent = Math.max(0, Math.min(args.current, this.progressTotal));
    this._updateProgressBar();
  }

  // 关闭进度条弹窗
  closeProgress() {
    this._removeModal('progress');
  }

  // 获取作者信息
  getAuthor() {
    return 'Starfall';
  }

  // 私有方法：创建模态框
  _createModal(options) {
    // 移除同类型的旧模态框
    this._removeModal(options.type);
    
    const modal = document.createElement('div');
    modal.className = `global-alert-modal ${options.type}-modal ${options.position}`;
    modal.dataset.type = options.type;
    
    let content = '';
    
    switch(options.type) {
      case 'alert':
        content = `
          <div class="modal-header">
            <span class="modal-icon ${options.icon}">${this._getIconSymbol(options.icon)}</span>
            <h3>${this._escapeHtml(options.title)}</h3>
          </div>
          <div class="modal-body">
            <p>${this._escapeHtml(options.content)}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-primary" onclick="this.closest('.global-alert-modal').remove()">确定</button>
          </div>
        `;
        break;
        
      case 'confirm':
        content = `
          <div class="modal-header">
            <h3>${this._escapeHtml(options.title)}</h3>
          </div>
          <div class="modal-body">
            <p>${this._escapeHtml(options.content)}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-btn" onclick="this.closest('.global-alert-modal').remove(); window.dispatchEvent(new CustomEvent('globalAlertConfirm', {detail: '${options.button1}'}))">${this._escapeHtml(options.button1)}</button>
            <button class="modal-btn modal-btn-primary" onclick="this.closest('.global-alert-modal').remove(); window.dispatchEvent(new CustomEvent('globalAlertConfirm', {detail: '${options.button2}'}))">${this._escapeHtml(options.button2)}</button>
          </div>
        `;
        break;
        
      case 'input':
        content = `
          <div class="modal-header">
            <h3>${this._escapeHtml(options.title)}</h3>
          </div>
          <div class="modal-body">
            <p>${this._escapeHtml(options.content)}</p>
            <input type="text" class="modal-input" value="${this._escapeHtml(options.defaultValue)}" placeholder="${this._escapeHtml(options.content)}">
          </div>
          <div class="modal-footer">
            <button class="modal-btn" onclick="this.closest('.global-alert-modal').remove(); window.dispatchEvent(new CustomEvent('globalAlertInput', {detail: ''}))">取消</button>
            <button class="modal-btn modal-btn-primary" onclick="const input = this.closest('.global-alert-modal').querySelector('.modal-input').value; this.closest('.global-alert-modal').remove(); window.dispatchEvent(new CustomEvent('globalAlertInput', {detail: input}))">确定</button>
          </div>
        `;
        break;
        
      case 'loading':
        content = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">${this._escapeHtml(options.content)}</p>
          </div>
        `;
        this.loadingModal = modal;
        break;
        
      case 'progress':
        const percentage = this.progressTotal > 0 ? Math.round((this.progressCurrent / this.progressTotal) * 100) : 0;
        content = `
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-text">${percentage}%</div>
            <p class="progress-content">${this._escapeHtml(options.content)}</p>
          </div>
        `;
        this.progressModal = modal;
        break;
    }
    
    modal.innerHTML = content;
    
    // 添加样式
    if (!document.getElementById('global-alert-styles')) {
      this._addStyles();
    }
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 自动关闭的弹窗
    if (options.type === 'alert' && options.seconds > 0) {
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, options.seconds * 1000);
    }
    
    // 处理回调
    if (options.type === 'confirm' && options.callback) {
      window.addEventListener('globalAlertConfirm', (e) => {
        options.callback(e.detail);
      }, {once: true});
    }
    
    if (options.type === 'input' && options.callback) {
      window.addEventListener('globalAlertInput', (e) => {
        options.callback(e.detail);
      }, {once: true});
    }
    
    return modal;
  }

  // 移除模态框
  _removeModal(type) {
    const modal = document.querySelector(`.global-alert-modal[data-type="${type}"]`);
    if (modal) {
      modal.remove();
    }
    
    if (type === 'loading') {
      this.loadingModal = null;
    } else if (type === 'progress') {
      this.progressModal = null;
    }
  }

  // 更新进度条
  _updateProgressBar() {
    if (this.progressModal) {
      const percentage = this.progressTotal > 0 ? Math.round((this.progressCurrent / this.progressTotal) * 100) : 0;
      const fill = this.progressModal.querySelector('.progress-fill');
      const text = this.progressModal.querySelector('.progress-text');
      
      if (fill) {
        fill.style.width = `${percentage}%`;
      }
      
      if (text) {
        text.textContent = `${percentage}%`;
      }
    }
  }

  // 获取图标符号
  _getIconSymbol(iconType) {
    switch(iconType) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }

  // 添加样式
  _addStyles() {
    const style = document.createElement('style');
    style.id = 'global-alert-styles';
    style.textContent = `
      .global-alert-modal {
        position: fixed;
        z-index: 10000;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        padding: 20px;
        min-width: 300px;
        max-width: 400px;
        font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
        animation: modalFadeIn 0.3s ease;
      }
      
      .global-alert-modal.middle {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .global-alert-modal.top-left {
        top: 20px;
        left: 20px;
      }
      
      .global-alert-modal.top-right {
        top: 20px;
        right: 20px;
      }
      
      .global-alert-modal.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .global-alert-modal.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .modal-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .modal-icon {
        font-size: 24px;
        margin-right: 10px;
      }
      
      .modal-icon.error {
        color: #f44336;
      }
      
      .modal-icon.warning {
        color: #ff9800;
      }
      
      .modal-icon.info {
        color: #2196f3;
      }
      
      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
      
      .modal-body {
        margin-bottom: 20px;
      }
      
      .modal-body p {
        margin: 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }
      
      .modal-input {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .modal-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        color: #333;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .modal-btn:hover {
        background: #f5f5f5;
      }
      
      .modal-btn-primary {
        background: #5078F5;
        border-color: #5078F5;
        color: white;
      }
      
      .modal-btn-primary:hover {
        background: #405FC6;
      }
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #5078F5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }
      
      .loading-text {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
      
      .progress-container {
        padding: 20px;
      }
      
      .progress-bar {
        width: 100%;
        height: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      .progress-fill {
        height: 100%;
        background: #5078F5;
        border-radius: 5px;
        transition: width 0.3s ease;
      }
      
      .progress-text {
        text-align: center;
        font-size: 14px;
        color: #5078F5;
        margin-bottom: 10px;
        font-weight: bold;
      }
      
      .progress-content {
        margin: 0;
        font-size: 14px;
        color: #666;
        text-align: center;
      }
      
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .global-alert-modal.top-left,
      .global-alert-modal.top-right,
      .global-alert-modal.bottom-left,
      .global-alert-modal.bottom-right {
        transform: none;
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // 转义HTML
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 注册扩展
Scratch.extensions.register(new GlobalAlertExtension());
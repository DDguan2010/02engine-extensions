class MSJToolbox {
  constructor() {
    // 下载状态变量
    this._isDownloading = false;
    this._downloadSuccess = false;
    
    // 下载数据变量
    this.downloadSpeed = 0;
    this.downloadProgress = 0;
    this.totalSize = 0;
    this.fileDataUrl = '';
    this.fileName = '';
    this.lastLoaded = 0;
    this.lastTime = 0;
    this.downloadController = null;
    
    // 新增缓存对象
    this._ipCache = null;
    this._dnsCache = new Map();
    
    // WebSocket检测缓存
    this._wsComputing = new Map();
    this._wsComputed = new Map();
    
    // 设备信息缓存
    this._deviceInfoCache = {
      cpuName: null,
      gpuName: null,
      lastScreenInfo: null,
      lastWindowInfo: null
    };
  }

  getInfo() {
    return {
      id: 'msjtools',
      name: 'msj的工具箱',
      color1: '#009fff',
      docsURI: 'https://b23.tv/F2Ut3hr',
      blocks: [
        {
          blockType: 'label',
          text: '设备信息'
        },
        {
          opcode: 'getAuthorInfo',
          blockType: Scratch.BlockType.REPORTER,
          text: '作者信息'
        },
        {
          opcode: 'getOSInfo',
          blockType: Scratch.BlockType.REPORTER,
          text: '操作系统信息'
        },
        {
          opcode: 'getBrowserInfo',
          blockType: Scratch.BlockType.REPORTER,
          text: '浏览器信息'
        },
        {
          opcode: 'getScreenResolution',
          blockType: Scratch.BlockType.REPORTER,
          text: '屏幕分辨率'
        },
        {
          opcode: 'getDeviceMemory',
          blockType: Scratch.BlockType.REPORTER,
          text: '设备内存(GB)'
        },
        {
          opcode: 'getHardwareConcurrency',
          blockType: Scratch.BlockType.REPORTER,
          text: 'CPU核心数'
        },
        {
          opcode: 'getCPUName',
          blockType: Scratch.BlockType.REPORTER,
          text: 'CPU名称'
        },
        {
          opcode: 'getGPUName',
          blockType: Scratch.BlockType.REPORTER,
          text: 'GPU名称'
        },
        {
          opcode: 'isTouchDevice',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '是否触摸屏设备?'
        },
        {
          opcode: 'getBatteryStatus',
          blockType: Scratch.BlockType.REPORTER,
          text: '电池状态'
        },
        {
          opcode: 'getDeviceType',
          blockType: Scratch.BlockType.REPORTER,
          text: '设备类型'
        },
        {
          opcode: 'getPixelRatio',
          blockType: Scratch.BlockType.REPORTER,
          text: '屏幕像素密度'
        },
        {
          opcode: 'getWindowWidth',
          blockType: Scratch.BlockType.REPORTER,
          text: '窗口宽度'
        },
        {
          opcode: 'getWindowHeight',
          blockType: Scratch.BlockType.REPORTER,
          text: '窗口高度'
        },
        {
          opcode: 'isFullscreen',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '是否全屏?'
        },
        {
          opcode: 'isFocused',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '窗口是否聚焦?'
        },
        {
          blockType: 'label',
          text: '网络'
        },
        {
          opcode: 'isOnline',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '是否连接网络?'
        },
        {
          opcode: 'pingWebsite',
          blockType: Scratch.BlockType.REPORTER,
          text: 'ping [url] 超时 [timeout] 秒',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://example.com'
            },
            timeout: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5
            }
          }
        },
        {
          opcode: 'resolveDomain',
          blockType: Scratch.BlockType.REPORTER,
          text: '解析域名 [url] 超时 [timeout] 秒',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'example.com'
            },
            timeout: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5,
              min: 1,
              max: 30
            }
          }
        },
        {
          opcode: 'getPublicIP',
          blockType: Scratch.BlockType.REPORTER,
          text: '公网IP地址'
        },
        {
          opcode: 'checkPortOpen',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '主机 [host] 端口 [port] 是否开放? 超时 [timeout] 秒',
          arguments: {
            host: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'example.com'
            },
            port: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 80,
              min: 1,
              max: 65535
            },
            timeout: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 3,
              min: 1,
              max: 10
            }
          }
        },
        {
          opcode: 'getHttpStatus',
          blockType: Scratch.BlockType.REPORTER,
          text: '获取 [url] 的HTTP状态码 超时 [timeout] 秒',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://example.com'
            },
            timeout: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5,
              min: 1,
              max: 30
            }
          }
        },
        {
          opcode: 'parseUrlComponent',
          blockType: Scratch.BlockType.REPORTER,
          text: '解析URL [url] 的 [component]',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://example.com/path?query=value#fragment'
            },
            component: {
              type: Scratch.ArgumentType.STRING,
              menu: 'urlComponentMenu'
            }
          }
        },
        {
          opcode: 'checkHttpsSupport',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '网站 [url] 是否支持HTTPS? 超时 [timeout] 秒',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'example.com'
            },
            timeout: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5,
              min: 1,
              max: 30
            }
          }
        },
        {
          blockType: 'label',
          text: 'data:url处理'
        },
        {
          opcode: 'urlEncode',
          blockType: Scratch.BlockType.REPORTER,
          text: 'URL编码 [text]',
          arguments: {
            text: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Hello World!'
            }
          }
        },
        {
          opcode: 'urlDecode',
          blockType: Scratch.BlockType.REPORTER,
          text: 'URL解码 [text]',
          arguments: {
            text: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Hello%20World%21'
            }
          }
        },
        {
          opcode: 'calculateDataUrlSize',
          blockType: Scratch.BlockType.REPORTER,
          text: '计算 data:URL [dataUrl] 大小 单位 [unit] 显示单位 [showUnit]',
          arguments: {
            dataUrl: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'data:,Hello%2C%20World!'
            },
            unit: {
              type: Scratch.ArgumentType.STRING,
              menu: 'unitMenu'
            },
            showUnit: {
              type: Scratch.ArgumentType.STRING,
              menu: 'showUnitMenu'
            }
          }
        },
        {
          opcode: 'convertFileSize',
          blockType: Scratch.BlockType.REPORTER,
          text: '将 [size] [fromUnit] 转换为 [toUnit]',
          arguments: {
            size: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1024
            },
            fromUnit: {
              type: Scratch.ArgumentType.STRING,
              menu: 'unitMenu'
            },
            toUnit: {
              type: Scratch.ArgumentType.STRING,
              menu: 'unitMenu'
            }
          }
        },
        {
          blockType: 'label',
          text: '文件下载'
        },
        {
          opcode: 'downloadFile',
          blockType: Scratch.BlockType.COMMAND,
          text: '下载文件 [url]',
          arguments: {
            url: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'https://example.com/file.txt'
            }
          }
        },
        {
          opcode: 'isDownloading',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '下载中?'
        },
        {
          opcode: 'downloadSuccess',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '下载成功?'
        },
        {
          opcode: 'getDownloadSpeed',
          blockType: Scratch.BlockType.REPORTER,
          text: '下载速度 (KB/s)'
        },
        {
          opcode: 'getDownloadProgress',
          blockType: Scratch.BlockType.REPORTER,
          text: '下载进度 (%)'
        },
        {
          opcode: 'getTotalSize',
          blockType: Scratch.BlockType.REPORTER,
          text: '文件总大小 (KB)'
        },
        {
          opcode: 'getFileDataUrl',
          blockType: Scratch.BlockType.REPORTER,
          text: '文件(dataurl)'
        },
        {
          opcode: 'getFileName',
          blockType: Scratch.BlockType.REPORTER,
          text: '文件名称'
        },
        {
          opcode: 'cancelDownload',
          blockType: Scratch.BlockType.COMMAND,
          text: '取消下载'
        },
        {
          blockType: 'label',
          text: '计算'
        },
        {
          opcode: 'calculate',
          blockType: Scratch.BlockType.REPORTER,
          text: '计算 [EXPR]',
          arguments: {
            EXPR: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '2+3*4/6'
            }
          }
        }
      ],
      menus: {
        unitMenu: {
          items: [
            {text: 'B', value: 'B'},
            {text: 'KB', value: 'KB'},
            {text: 'MB', value: 'MB'},
            {text: 'KiB', value: 'KiB'},
            {text: 'MiB', value: 'MiB'}
          ]
        },
        showUnitMenu: {
          items: [
            {text: '附带单位', value: 'yes'},
            {text: '不带单位', value: 'no'}
          ]
        },
        urlComponentMenu: {
          items: [
            {text: '协议', value: 'protocol'},
            {text: '域名', value: 'hostname'},
            {text: '端口', value: 'port'},
            {text: '路径', value: 'pathname'},
            {text: '查询参数', value: 'search'},
            {text: '锚点', value: 'hash'},
            {text: '完整URL', value: 'href'}
          ]
        }
      }
    };
  }

  getAuthorInfo() {
    return '作者B站号为玩MC的Sc俊杰';
  }

  getOSInfo() {
    try {
      const userAgent = navigator.userAgent;
      let os = '未知操作系统';
      
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iOS') || /iPad|iPhone|iPod/.test(userAgent)) os = 'iOS';
      
      // 获取版本信息
      let version = '';
      if (os === 'Windows') {
        if (userAgent.includes('Windows NT 10.0')) version = '10/11';
        else if (userAgent.includes('Windows NT 6.3')) version = '8.1';
        else if (userAgent.includes('Windows NT 6.2')) version = '8';
        else if (userAgent.includes('Windows NT 6.1')) version = '7';
      } else if (os === 'macOS') {
        const macVersionMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/);
        if (macVersionMatch) version = macVersionMatch[1].replace('_', '.');
      } else if (os === 'Android') {
        const androidVersionMatch = userAgent.match(/Android (\d+\.\d+)/);
        if (androidVersionMatch) version = androidVersionMatch[1];
      } else if (os === 'iOS') {
        const iosVersionMatch = userAgent.match(/OS (\d+[_\.]\d+)/);
        if (iosVersionMatch) version = iosVersionMatch[1].replace('_', '.');
      }
      
      return version ? `${os} ${version}` : os;
    } catch (e) {
      return '获取失败';
    }
  }

  getBrowserInfo() {
    try {
      const userAgent = navigator.userAgent;
      let browser = '未知浏览器';
      let version = '';
      
      // 浏览器检测
      if (userAgent.includes('Edg/')) {
        browser = 'Edge (Chromium)';
        version = userAgent.match(/Edg\/(\d+\.\d+)/)[1];
      } else if (userAgent.includes('OPR/')) {
        browser = 'Opera';
        version = userAgent.match(/OPR\/(\d+\.\d+)/)[1];
      } else if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
        version = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        version = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
      } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
        version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || 
                 userAgent.match(/Safari\/(\d+\.\d+)/)?.[1] || '';
      } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        browser = 'Internet Explorer';
        const tridentMatch = userAgent.match(/Trident\/\d+\.\d+/);
        if (tridentMatch) {
          const tridentVersion = tridentMatch[0].split('/')[1];
          version = (parseFloat(tridentVersion) + 4).toString();
        } else {
          version = userAgent.match(/MSIE (\d+\.\d+)/)[1];
        }
      }
      
      return version ? `${browser} ${version}` : browser;
    } catch (e) {
      return '获取失败';
    }
  }

  getScreenResolution() {
    try {
      return `${window.screen.width} × ${window.screen.height}`;
    } catch (e) {
      return '获取失败';
    }
  }

  getDeviceMemory() {
    try {
      if (navigator.deviceMemory) {
        return `${navigator.deviceMemory} GB`;
      }
      return '获取失败';
    } catch (e) {
      return '获取失败';
    }
  }

  getHardwareConcurrency() {
    try {
      if (navigator.hardwareConcurrency) {
        return navigator.hardwareConcurrency;
      }
      return '获取失败';
    } catch (e) {
      return '获取失败';
    }
  }

  getCPUName() {
    try {
      if (this._deviceInfoCache.cpuName) {
        return this._deviceInfoCache.cpuName;
      }
      
      const userAgent = navigator.userAgent;
      let cpu = '未知CPU';
      
      if (userAgent.includes('x86_64') || userAgent.includes('x64') || userAgent.includes('Win64')) {
        cpu = 'x64 (Intel/AMD)';
      } else if (userAgent.includes('x86') || userAgent.includes('i686')) {
        cpu = 'x86 (32位)';
      } else if (userAgent.includes('ARM') || userAgent.includes('aarch64')) {
        cpu = 'ARM处理器';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        const modelMatch = userAgent.match(/iPhone(\d+),\d+|iPad(\d+),\d+/);
        if (modelMatch) {
          const model = modelMatch[1] || modelMatch[2];
          if (model >= 12) {
            cpu = 'Apple Silicon';
          } else {
            cpu = 'Apple A系列芯片';
          }
        }
      }
      
      this._deviceInfoCache.cpuName = cpu;
      return cpu;
    } catch (e) {
      return '获取失败';
    }
  }

  getGPUName() {
    try {
      if (this._deviceInfoCache.gpuName) {
        return this._deviceInfoCache.gpuName;
      }
      
      const canvas = document.createElement('canvas');
      let gl = null;
      let gpuInfo = '未知GPU';
      
      try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      } catch (e) {}
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          
          if (renderer) {
            if (renderer.includes('NVIDIA')) gpuInfo = 'NVIDIA GPU';
            else if (renderer.includes('AMD')) gpuInfo = 'AMD GPU';
            else if (renderer.includes('Intel')) gpuInfo = 'Intel GPU';
            else if (renderer.includes('Apple')) gpuInfo = 'Apple GPU';
            else if (renderer.includes('Adreno')) gpuInfo = 'Qualcomm Adreno GPU';
            else if (renderer.includes('Mali')) gpuInfo = 'ARM Mali GPU';
            else gpuInfo = renderer.split('/')[0].trim();
          }
        }
      }
      
      this._deviceInfoCache.gpuName = gpuInfo;
      return gpuInfo;
    } catch (e) {
      return '获取失败';
    }
  }

  isTouchDevice() {
    try {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             navigator.msMaxTouchPoints > 0;
    } catch (e) {
      return false;
    }
  }

  async getBatteryStatus() {
    try {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        return `电量: ${Math.floor(battery.level * 100)}% ${battery.charging ? '充电中' : ''}`;
      }
      return '获取失败';
    } catch (e) {
      return '获取失败';
    }
  }

  getDeviceType() {
    try {
      const userAgent = navigator.userAgent;
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
      const isTablet = /iPad|Android|Tablet/i.test(userAgent) && !/Mobile/i.test(userAgent);
      
      if (isTablet) return '平板';
      if (isMobile) return '手机';
      return '桌面设备';
    } catch (e) {
      return '获取失败';
    }
  }

  getPixelRatio() {
    try {
      return window.devicePixelRatio || 1;
    } catch (e) {
      return '获取失败';
    }
  }

  getWindowWidth() {
    try {
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    } catch (e) {
      return '获取失败';
    }
  }

  getWindowHeight() {
    try {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    } catch (e) {
      return '获取失败';
    }
  }

  isFullscreen() {
    try {
      return !!(document.fullscreenElement || 
               document.webkitFullscreenElement || 
               document.mozFullScreenElement || 
               document.msFullscreenElement);
    } catch (e) {
      return false;
    }
  }

  isFocused() {
    try {
      return document.hasFocus();
    } catch (e) {
      return false;
    }
  }

  isOnline() {
    return navigator.onLine;
  }

  pingWebsite(args) {
    const url = args.url.trim();
    const timeout = args.timeout * 1000;
    
    // 如果是wss协议，使用WebSocket检测方法
    if (url.startsWith('wss://')) {
      return this._pingWebSocket(url, timeout);
    }
    
    // 否则使用原来的HTTP检测方法
    return this._pingHttp(url, timeout);
  }

  _pingHttp(url, timeout) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve('超时');
      }, timeout);
      
      fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = endTime - startTime;
        resolve(Math.round(latency));
      })
      .catch(error => {
        clearTimeout(timeoutId);
        resolve('未知url');
      });
    });
  }

  _pingWebSocket(uri, timeout) {
    return new Promise((resolve) => {
      let ws;
      let startTime;
      let timeoutId;
      
      try {
        startTime = performance.now();
        ws = new WebSocket(uri);
      } catch (e) {
        resolve('未知url');
        return;
      }

      // 设置超时
      timeoutId = setTimeout(() => {
        ws.close();
        resolve('超时');
      }, timeout);

      ws.onopen = () => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        clearTimeout(timeoutId);
        ws.close();
        resolve(Math.round(latency));
      };

      ws.onerror = () => {
        clearTimeout(timeoutId);
        resolve('未知url');
      };

      ws.onclose = () => {
        clearTimeout(timeoutId);
      };
    });
  }

  resolveDomain(args) {
    const url = this._normalizeUrlForResolution(args.url);
    const timeoutSec = Number(args.timeout) || 5;
    const timeoutMs = Math.min(Math.max(timeoutSec, 1), 30) * 1000;
    
    if (this._dnsCache.has(url)) {
      return Promise.resolve(this._dnsCache.get(url));
    }

    return new Promise((resolve) => {
      if (!url) {
        resolve('无效的URL');
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve(`解析超时 (${timeoutSec}秒)`);
      }, timeoutMs);

      try {
        let parsedUrl;
        try {
          parsedUrl = new URL(url.includes('://') ? url : `https://${url}`);
        } catch (e) {
          try {
            parsedUrl = new URL(`https://${url.split('/')[0]}`);
          } catch (e) {
            clearTimeout(timeoutId);
            resolve('无法解析的URL格式');
            return;
          }
        }

        const domain = parsedUrl.hostname;
        
        if (this._isValidIP(domain)) {
          clearTimeout(timeoutId);
          this._dnsCache.set(url, domain);
          resolve(domain);
          return;
        }

        this._resolveWithDOH(domain, timeoutId, timeoutSec)
          .then(ips => {
            clearTimeout(timeoutId);
            this._dnsCache.set(url, ips);
            resolve(ips);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            resolve(`解析失败: ${error.message}`);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        resolve(`解析错误: ${error.message}`);
      }
    });
  }

  getPublicIP() {
    if (this._ipCache) {
      return Promise.resolve(this._ipCache);
    }
    
    return new Promise((resolve) => {
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipinfo.io/json',
        'https://api.myip.com'
      ];
      
      let attempts = 0;
      
      const tryService = () => {
        if (attempts >= services.length) {
          resolve('未知');
          return;
        }
        
        const serviceUrl = services[attempts++];
        fetch(serviceUrl, { 
          method: 'GET',
          mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
          const ip = data.ip || data.query || data.ip_address;
          if (ip) {
            this._ipCache = ip;
            resolve(ip);
          } else {
            tryService();
          }
        })
        .catch(() => {
          tryService();
        });
      };
      
      tryService();
    });
  }
  
  checkPortOpen(args) {
    const host = this._normalizeHost(args.host);
    const port = Number(args.port);
    const timeout = Number(args.timeout) * 1000;
    
    return new Promise((resolve) => {
      if (!host || port < 1 || port > 65535) {
        resolve(false);
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve(false);
      }, timeout);
      
      const testUrl = `wss://${host}:${port}`;
      const socket = new WebSocket(testUrl);
      
      socket.onopen = () => {
        clearTimeout(timeoutId);
        socket.close();
        resolve(true);
      };
      
      socket.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
    });
  }
  
  getHttpStatus(args) {
    const url = this._normalizeUrl(args.url);
    const timeout = args.timeout * 1000;
    
    return new Promise((resolve) => {
      if (!url) {
        resolve(0);
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve(-1);
      }, timeout);
      
      fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response.status);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          resolve(-1);
        } else {
          resolve(0);
        }
      });
    });
  }
  
  parseUrlComponent(args) {
    const inputUrl = args.url.trim();
    const component = args.component;
    
    try {
      const url = new URL(inputUrl.includes('://') ? inputUrl : `https://${inputUrl}`);
      
      switch(component) {
        case 'protocol': 
          return url.protocol.replace(':', '');
        case 'hostname':
          return url.hostname;
        case 'port':
          return url.port || (url.protocol === 'https:' ? '443' : '80');
        case 'pathname':
          return url.pathname;
        case 'search':
          return url.search;
        case 'hash':
          return url.hash;
        case 'href':
          return url.href;
        default:
          return '未知组件';
      }
    } catch (e) {
      return '无效URL';
    }
  }
  
  urlEncode(args) {
    return encodeURIComponent(args.text);
  }
  
  urlDecode(args) {
    try {
      return decodeURIComponent(args.text);
    } catch (e) {
      return '解码失败';
    }
  }
  
  checkHttpsSupport(args) {
    const host = this._normalizeHost(args.host);
    const timeout = args.timeout * 1000;
    
    return new Promise((resolve) => {
      if (!host) {
        resolve(false);
        return;
      }
      
      const httpsUrl = `https://${host}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve(false);
      }, timeout);
      
      fetch(httpsUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response.ok);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resolve(false);
      });
    });
  }
  
  calculateDataUrlSize(args) {
    const dataUrl = args.dataUrl.trim();
    const unit = args.unit;
    const showUnit = args.showUnit === 'yes';
    
    if (!dataUrl.startsWith('data:')) {
      return showUnit ? '无效的data:URL' : '0';
    }
    
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
      return showUnit ? '无效的data:URL' : '0';
    }
    
    const dataPart = dataUrl.substring(commaIndex + 1);
    
    let byteSize;
    
    if (dataUrl.includes(';base64')) {
      const base64Data = dataPart.replace(/\s/g, '');
      byteSize = Math.floor(base64Data.length * 3 / 4);
      const padding = (base64Data.match(/=/g) || []).length;
      byteSize -= padding;
    } else {
      try {
        const decodedData = decodeURIComponent(dataPart);
        const encoder = new TextEncoder();
        byteSize = encoder.encode(decodedData).length;
      } catch (e) {
        return showUnit ? '解码失败' : '0';
      }
    }
    
    let resultValue;
    let unitText = '';
    
    switch(unit) {
      case 'B':
        resultValue = byteSize;
        unitText = 'B';
        break;
      case 'KB':
        resultValue = byteSize / 1000;
        unitText = 'KB';
        break;
      case 'MB':
        resultValue = byteSize / 1000000;
        unitText = 'MB';
        break;
      case 'KiB':
        resultValue = byteSize / 1024;
        unitText = 'KiB';
        break;
      case 'MiB':
        resultValue = byteSize / (1024 * 1024);
        unitText = 'MiB';
        break;
      default:
        resultValue = byteSize;
        unitText = 'B';
    }
    
    if (resultValue < 0.0001 && resultValue > 0) resultValue = 0;
    
    let fixedDigits;
    const absValue = Math.abs(resultValue);
    if (absValue >= 100) fixedDigits = 0;
    else if (absValue >= 10) fixedDigits = 1;
    else if (absValue >= 1) fixedDigits = 2;
    else if (absValue >= 0.1) fixedDigits = 3;
    else if (absValue >= 0.01) fixedDigits = 4;
    else fixedDigits = 5;
    
    const formattedValue = resultValue.toFixed(fixedDigits);
    
    return showUnit ? `${formattedValue} ${unitText}` : formattedValue;
  }

  convertFileSize(args) {
    const size = Number(args.size);
    const fromUnit = String(args.fromUnit);
    const toUnit = String(args.toUnit);

    if (isNaN(size) || size < 0) {
      return 0;
    }

    let bytes;
    switch (fromUnit) {
      case 'B':
        bytes = size;
        break;
      case 'KB':
        bytes = size * 1000;
        break;
      case 'MB':
        bytes = size * 1000 * 1000;
        break;
      case 'KiB':
        bytes = size * 1024;
        break;
      case 'MiB':
        bytes = size * 1024 * 1024;
        break;
      default:
        bytes = size;
    }

    let result;
    switch (toUnit) {
      case 'B':
        result = bytes;
        break;
      case 'KB':
        result = bytes / 1000;
        break;
      case 'MB':
        result = bytes / (1000 * 1000);
        break;
      case 'KiB':
        result = bytes / 1024;
        break;
      case 'MiB':
        result = bytes / (1024 * 1024);
        break;
      default:
        result = bytes;
    }

    if (result < 0.0001 && result > 0) result = 0;
    
    let fixedDigits;
    const absValue = Math.abs(result);
    if (absValue >= 100) fixedDigits = 0;
    else if (absValue >= 10) fixedDigits = 1;
    else if (absValue >= 1) fixedDigits = 2;
    else if (absValue >= 0.1) fixedDigits = 3;
    else if (absValue >= 0.01) fixedDigits = 4;
    else fixedDigits = 5;
    
    return parseFloat(result.toFixed(fixedDigits));
  }

  downloadFile(args) {
    this._resetDownloadData();
    this._isDownloading = true;

    const url = args.url.trim();
    if (!url) {
      this._isDownloading = false;
      return;
    }

    this.downloadController = new AbortController();

    fetch(url, {
      signal: this.downloadController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const contentDisposition = response.headers.get('content-disposition');
      this.fileName = contentDisposition ? 
        contentDisposition.split('filename=')[1].replace(/"/g, '') : 
        url.split('/').pop() || '未命名文件';

      const contentLength = response.headers.get('content-length');
      this.totalSize = contentLength ? parseInt(contentLength) : 0;

      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;
      this.lastTime = performance.now();
      this.lastLoaded = 0;

      return new Promise((resolve, reject) => {
        const readChunk = () => {
          reader.read().then(({done, value}) => {
            if (done) {
              resolve(new Blob(chunks));
              return;
            }

            chunks.push(value);
            receivedLength += value.length;
            
            const now = performance.now();
            const timeDiff = (now - this.lastTime) / 1000;
            const loadedDiff = receivedLength - this.lastLoaded;
            
            if (timeDiff > 0) {
              this.downloadSpeed = loadedDiff / timeDiff / 1024;
            }
            if (this.totalSize > 0) {
              this.downloadProgress = (receivedLength / this.totalSize) * 100;
            }
            
            this.lastLoaded = receivedLength;
            this.lastTime = now;

            if (!this.downloadController.signal.aborted) {
              readChunk();
            }
          }).catch(reject);
        };

        readChunk();
      });
    })
    .then(blob => {
      if (this.downloadController.signal.aborted) {
        return;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.fileDataUrl = reader.result;
          this._downloadSuccess = true;
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('下载失败:', error);
      }
    })
    .finally(() => {
      this._isDownloading = false;
    });
  }

  isDownloading() {
    return this._isDownloading;
  }

  downloadSuccess() {
    return this._downloadSuccess;
  }

  getDownloadSpeed() {
    return this.downloadSpeed.toFixed(2);
  }

  getDownloadProgress() {
    return this.downloadProgress.toFixed(1);
  }

  getTotalSize() {
    return (this.totalSize / 1024).toFixed(2);
  }

  getFileDataUrl() {
    return this.fileDataUrl;
  }

  getFileName() {
    return this.fileName;
  }

  cancelDownload() {
    if (this.downloadController && !this.downloadController.signal.aborted) {
      this.downloadController.abort();
      this._isDownloading = false;
      this._downloadSuccess = false;
    }
  }

  calculate(args) {
    try {
      const expr = String(args.EXPR)
        .replace(/\s/g, '')
        .replace(/\^/g, '**')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      if (!/^[\d+\-*\/.()^]+$/.test(expr)) {
        return '非法输入';
      }
      
      const result = new Function('"use strict";return (' + expr + ')')();
      
      if (Number.isInteger(result)) {
        return result;
      } else {
        return parseFloat(result.toFixed(10));
      }
    } catch (e) {
      return '计算错误';
    }
  }

  _resetDownloadData() {
    this._isDownloading = false;
    this._downloadSuccess = false;
    this.downloadSpeed = 0;
    this.downloadProgress = 0;
    this.totalSize = 0;
    this.fileDataUrl = '';
    this.fileName = '';
    this.lastLoaded = 0;
    this.lastTime = 0;
    
    if (this.downloadController) {
      this.downloadController.abort();
      this.downloadController = null;
    }
  }

  _normalizeUrl(inputUrl) {
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('wss://')) {
      url = 'https://' + url;
    }
    return url;
  }

  _normalizeUrlForResolution(inputUrl) {
    let url = (inputUrl || '').trim();
    
    if (!url) return null;
    
    url = url.replace(/^https?:\/\//i, '')
             .replace(/^ftp:\/\//i, '')
             .split('/')[0]
             .split('?')[0];
    
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(url) && !this._isValidIP(url)) {
      return null;
    }
    
    return url;
  }

  _normalizeHost(inputHost) {
    let host = inputHost.trim();
    
    host = host.replace(/^https?:\/\//i, '')
               .split('/')[0]
               .split(':')[0];
    
    if (!host || !/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(host)) {
      return null;
    }
    
    return host;
  }

  _isValidIP(ip) {
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) ||
           /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip);
  }

  _resolveWithDOH(domain, timeoutId, timeoutSec) {
    return new Promise((resolve, reject) => {
      const providers = [
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}`,
        `https://doh.opendns.com/resolve?name=${encodeURIComponent(domain)}`
      ];

      let lastError = null;
      let attempts = 0;
      
      const tryNextProvider = () => {
        if (attempts >= providers.length) {
          reject(lastError || new Error('所有DNS提供商尝试失败'));
          return;
        }

        const url = providers[attempts++];
        
        fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/dns-json'
          },
          signal: AbortSignal.timeout(timeoutSec * 1000 * 0.8)
        })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(data => {
          const answers = data.Answer || data.answers || [];
          const ips = [];
          
          answers.forEach(record => {
            if (record.type === 1 || record.type === 'A') {
              ips.push(record.data);
            } else if (record.type === 28 || record.type === 'AAAA') {
              ips.push(record.data);
            }
          });

          if (ips.length > 0) {
            resolve(ips.join(', '));
          } else {
            throw new Error('没有找到IP记录');
          }
        })
        .catch(error => {
          lastError = error;
          tryNextProvider();
        });
      };

      tryNextProvider();
    });
  }
}

Scratch.extensions.register(new MSJToolbox());
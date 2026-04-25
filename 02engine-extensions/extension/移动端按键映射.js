// Name: 移动端按键映射与摇杆
// By:YL_YOLO
// ID: advancedtouchblock
// Description: Advanced touch blocks and joystick with key simulation}(触屏块加摇杆并且可实现按键模拟)
// v3
class AdvancedTouchBlockExtension {
  constructor() {
    this.stageTouchArea = null;
    this.imageCache = new Map();
    this.activeTouches = new Map();
    this.stageElement = null;
    this.observer = null;
    this.touchBlocks = new Map();
    this.joysticks = new Map();
    this.isTouchAreaVisible = false;
    this.showTouchPoints = false;
    this.touchPointsContainer = null;
    this.hiddenButUsable = false;
    this.setupViewModeListener();
    this.clickCache = new Map();
    this.clickConfig = {
      maxDistance: 10,
      maxTime: 300
    };
    
    this.unifiedTouchData = {};
    this.lastUpdateTime = 0;
    
    this.findStageElement();
    this.createStageTouchArea();
      if (this.stageTouchArea) {
    this.stageTouchArea.style.display = 'block';
this.stageTouchArea.style.pointerEvents = 'none';
    this.stageTouchArea.style.backgroundColor = 'rgba(0, 255, 0, 0)';
    this.stageTouchArea.style.border = 'none';
    this.isTouchAreaVisible = false;
    this.hiddenButUsable = true;
  }
    this.createTouchPointsContainer();
    this.showAllElements();
    
    this.startDataUpdate();
    
    this.observer = new MutationObserver(() => {
      setTimeout(() => this.updateStagePosition(), 100);
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    window.addEventListener('resize', () => this.updateStagePosition());
  }
  
  startDataUpdate() {
    const updateData = () => {
      this.updateUnifiedTouchData();
      requestAnimationFrame(updateData);
    };
    updateData();
  }
  
  updateUnifiedTouchData() {
    const now = Date.now();
    if (now - this.lastUpdateTime < 16) return;
    
    this.lastUpdateTime = now;
    
    this.unifiedTouchData = {
      touchBlocks: {},
      joysticks: {}
    };
    
    this.touchBlocks.forEach((blockInfo, blockId) => {
      const blockData = {
        blockId: blockId,
        isTouching: blockInfo.isTouching,
        touchCount: blockInfo.activeTouches.size,
        fingers: {}
      };
      
      blockInfo.activeTouches.forEach((touch, touchId) => {
        blockData.fingers[touchId] = {
          screenX: touch.currentX || 0,
          screenY: touch.currentY || 0,
          areaX: touch.areaX || 0,
          areaY: touch.areaY || 0,
          deltaX: touch.deltaX || 0,
          deltaY: touch.deltaY || 0,
          instantDeltaX: touch.instantDeltaX || 0,
          instantDeltaY: touch.instantDeltaY || 0,
          timestamp: touch.timestamp || 0
        };
      });
      
      this.unifiedTouchData.touchBlocks[blockId] = blockData;
    });
    
    this.joysticks.forEach((joystick, joystickId) => {
      this.unifiedTouchData.joysticks[joystickId] = {
        isActive: joystick.activeTouch !== null,
        x: joystick.currentX,
        y: joystick.currentY,
        angle: this.calculateJoystickAngle(joystick.currentX, joystick.currentY),
        distance: Math.min(1, Math.sqrt(joystick.currentX * joystick.currentX + joystick.currentY * joystick.currentY)),
        screenX: joystick.screenX,
        screenY: joystick.screenY,
        isPressingKey: joystick.simulateKeys && joystick.lastDirection !== null
      };
    });
  }
  
  calculateJoystickAngle(x, y) {
    let angle = Math.atan2(-y, x) * (180 / Math.PI);
    angle = (angle + 450) % 360;
    return angle;
  }

  setupViewModeListener() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleViewChange();
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleViewChange();
    };
    
    window.addEventListener('popstate', () => this.handleViewChange());
  }

  handleViewChange() {
    setTimeout(() => {
      this.findStageElement();
      
      if (!this.stageTouchArea || !document.body.contains(this.stageTouchArea)) {
        this.createStageTouchArea();
      }
      
      this.updateStagePosition();
      this.recreateAllTouchBlocks();
      this.recreateAllJoysticks();
    }, 500);
  }

// 在 recreateAllTouchBlocks 方法中，确保传递层级
recreateAllTouchBlocks() {
  const blocksData = Array.from(this.touchBlocks.entries());
  
  this.touchBlocks.clear();
  if (this.stageTouchArea) {
    this.stageTouchArea.innerHTML = '';
  }
  
  blocksData.forEach(([id, blockInfo]) => {
    this.addTouchBlock(
      id,
      blockInfo.x,
      blockInfo.y,
      blockInfo.width,
      blockInfo.height,
      blockInfo.color,
      blockInfo.borderColor,
      blockInfo.multiTouch,
      blockInfo.maxTouches,
      blockInfo.showTouchPoint,
      blockInfo.zIndex,  // 确保层级被传递
      blockInfo.text,
      blockInfo.textColor,
      blockInfo.textSize,
      blockInfo.image,
      blockInfo.imageSize,
      blockInfo.imageOpacity,
      blockInfo.simulateKey,
      blockInfo.keyValue
    );
  });
}

// 在 recreateAllJoysticks 方法中，确保传递层级和八方向设置
recreateAllJoysticks() {
  const joysticksData = Array.from(this.joysticks.entries());
  
  this.joysticks.clear();
  
  joysticksData.forEach(([id, joystickInfo]) => {
    this.addJoystick(
      id,
      joystickInfo.x,
      joystickInfo.y,
      joystickInfo.outerSize,
      joystickInfo.innerSize,
      joystickInfo.outerColor,
      joystickInfo.innerColor,
      joystickInfo.simulateKeys,
      joystickInfo.keyUp,
      joystickInfo.keyDown,
      joystickInfo.keyLeft,
      joystickInfo.keyRight,
      joystickInfo.zIndex
    );
    
    // 重新设置八方向设置
    if (joystickInfo.useEightDirections !== undefined) {
      this.setJoystickEightDirections(id, joystickInfo.useEightDirections);
    }
    
    // 重新设置图片
    if (joystickInfo.outerImage) {
      this.setJoystickOuterImage(id, joystickInfo.outerImage, joystickInfo.outerImageSize, joystickInfo.outerImageOpacity);
    }
    if (joystickInfo.innerImage) {
      this.setJoystickInnerImage(id, joystickInfo.innerImage, joystickInfo.innerImageSize, joystickInfo.innerImageOpacity);
    }
    
    // 重新设置可见性
    this.setJoystickVisible(id, joystickInfo.visible);
  });
}
  
  getUnifiedTouchDataJSON() {
    return JSON.stringify(this.unifiedTouchData);
  }
  
  getTouchDataFromUnified(blockId, touchId, dataType) {
    const blockData = this.unifiedTouchData.touchBlocks[blockId];
    if (!blockData) return 0;
    
    if (touchId === undefined || touchId === null) {
      switch(dataType) {
        case 'isTouching': return blockData.isTouching;
        case 'touchCount': return blockData.touchCount;
        default: return 0;
      }
    } else {
      const fingerData = blockData.fingers[touchId];
      if (!fingerData) return 0;
      
      return fingerData[dataType] || 0;
    }
  }
  
  getJoystickDataFromUnified(joystickId, dataType) {
    const joystickData = this.unifiedTouchData.joysticks[joystickId];
    if (!joystickData) return 0;
    
    return joystickData[dataType] || 0;
  }

  findStageElement() {
    if (typeof Scratch !== 'undefined' && Scratch.vm) {
      const vm = Scratch.vm;
      if (vm.runtime && vm.runtime.renderer) {
        const renderer = vm.runtime.renderer;
        const mainCanvas = renderer.canvas;
        if (mainCanvas && mainCanvas.parentElement) {
          this.stageElement = mainCanvas.parentElement;
          return;
        }
      }
    }
    
    const selectors = [
      '[class*="stage-wrapper"]',
      '[class*="stage-wrapper_stage-wrapper"]',
      '.stage-wrapper',
      '.gui_stage-wrapper',
      '#react-tabs-1',
      '.stage',
      '[class*="stage_full-screen"]',
      '.stage_wrapper'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.stageElement = element;
        return;
      }
    }
    
    const canvases = document.querySelectorAll('canvas');
    let maxArea = 0;
    let mainCanvas = null;
    
    for (const canvas of canvases) {
      const area = canvas.width * canvas.height;
      if (area > maxArea && area > 10000) {
        maxArea = area;
        mainCanvas = canvas;
      }
    }
    
    if (mainCanvas && mainCanvas.parentElement) {
      this.stageElement = mainCanvas.parentElement;
      return;
    }
    
    this.stageElement = document.body;
  }
  
updateStagePosition() {
  if (!this.stageElement) {
    this.findStageElement();
    return;
  }
  
  const rect = this.stageElement.getBoundingClientRect();
  
  if (this.stageTouchArea) {
    this.stageTouchArea.style.left = rect.left + 'px';
    this.stageTouchArea.style.top = rect.top + 'px';
    this.stageTouchArea.style.width = rect.width + 'px';
    this.stageTouchArea.style.height = rect.height + 'px';
  }
  
  this.updateAllTouchBlocks();
  this.updateAllJoysticks();
}
  
createStageTouchArea() {
  if (this.stageTouchArea && this.stageTouchArea.parentNode) {
    this.stageTouchArea.parentNode.removeChild(this.stageTouchArea);
  }
  
  this.findStageElement();
  this.stageTouchArea = document.createElement('div');
  this.stageTouchArea.id = 'stage-touch-overlay';
  this.stageTouchArea.style.position = 'fixed';
  this.stageTouchArea.style.pointerEvents = 'none';
  this.stageTouchArea.style.touchAction = 'none';
  this.stageTouchArea.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
  this.stageTouchArea.style.border = '0px solid red';
  this.stageTouchArea.style.boxSizing = 'border-box';
  this.stageTouchArea.style.zIndex = '1000';
  this.stageTouchArea.style.overflow = 'hidden';
  this.stageTouchArea.style.display = 'none';
  
  this.updateStagePosition();
  document.body.appendChild(this.stageTouchArea);
}

hideStageTouchArea() {
  if (this.stageTouchArea) {
    // 只修改绿色背景的透明度，不影响其他元素
    this.stageTouchArea.style.backgroundColor = 'rgba(0, 255, 0, 0)';
    this.stageTouchArea.style.border = 'none';
    this.isTouchAreaVisible = false;
  }
}
  
  createTouchPointsContainer() {
    if (!this.touchPointsContainer) {
      this.touchPointsContainer = document.createElement('div');
      this.touchPointsContainer.id = 'touch-points-container';
      this.touchPointsContainer.style.position = 'fixed';
      this.touchPointsContainer.style.top = '0';
      this.touchPointsContainer.style.left = '0';
      this.touchPointsContainer.style.width = '100vw';
      this.touchPointsContainer.style.height = '100vh';
      this.touchPointsContainer.style.pointerEvents = 'none';
      this.touchPointsContainer.style.zIndex = '999999';
      this.touchPointsContainer.style.overflow = 'visible';
      document.body.appendChild(this.touchPointsContainer);
    }
  }
  

hideStageTouchAreaButUsable() {
  if (this.stageTouchArea) {
    this.stageTouchArea.style.display = 'block';
this.stageTouchArea.style.pointerEvents = 'none';
    this.stageTouchArea.style.backgroundColor = 'rgba(0, 255, 0, 0)';
    this.stageTouchArea.style.border = 'none';
    this.isTouchAreaVisible = false;
    this.hiddenButUsable = true;
    
    // 只隐藏触块器，摇杆保持显示但可用
    this.updateAllTouchBlocksVisibility();
    // 摇杆不隐藏，保持正常显示
  }
}

showStageTouchArea() {
  if (!this.stageTouchArea) this.createStageTouchArea();
  // 只修改绿色背景的显示
  this.stageTouchArea.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
  this.stageTouchArea.style.border = '0px solid red';
  this.isTouchAreaVisible = true;
}
  
  updateAllTouchBlocksVisibility() {
    for (const [id, blockInfo] of this.touchBlocks) {
      this.updateTouchBlockVisibility(id, blockInfo);
    }
  }
  
  updateAllJoysticksVisibility() {
    for (const [id, joystickInfo] of this.joysticks) {
      this.updateJoystickVisibility(id, joystickInfo);
    }
  }
  
updateTouchBlockVisibility(id, blockInfo) {
  if (!blockInfo) return;
  
  if (this.hiddenButUsable) {
    // 隐藏但可用模式
    blockInfo.element.style.opacity = '0';
    blockInfo.element.style.pointerEvents = 'auto';
    blockInfo.element.style.backgroundColor = 'rgba(0,0,0,0)';
    blockInfo.element.style.border = 'none';
    blockInfo.element.style.color = 'rgba(0,0,0,0)';
    if (blockInfo.textElement) {
      blockInfo.textElement.style.opacity = '0';
    }
    if (blockInfo.imageElement) {
      blockInfo.imageElement.style.opacity = '0';
    }
  } else if (blockInfo.visible) {
    // 正常显示模式
    blockInfo.element.style.opacity = '1';
    blockInfo.element.style.pointerEvents = 'auto';
    blockInfo.element.style.backgroundColor = this.parseColor(blockInfo.color);
    blockInfo.element.style.border = `2px solid ${this.parseColor(blockInfo.borderColor)}`;
    blockInfo.element.style.color = 'white';
    if (blockInfo.textElement) {
      blockInfo.textElement.style.opacity = '1';
    }
    if (blockInfo.imageElement) {
      blockInfo.imageElement.style.opacity = blockInfo.imageOpacity || 1;
    }
  } else {
    // 完全隐藏模式
    blockInfo.element.style.opacity = '0';
    blockInfo.element.style.pointerEvents = 'none';
    if (blockInfo.textElement) {
      blockInfo.textElement.style.opacity = '0';
    }
    if (blockInfo.imageElement) {
      blockInfo.imageElement.style.opacity = '0';
    }
  }
}

updateJoystickVisibility(id, joystickInfo) {
  if (!joystickInfo) return;
  
  // 隐藏但可用模式：摇杆仍然显示，不隐藏
  if (joystickInfo.visible) {
    // 正常显示模式
    joystickInfo.outer.style.opacity = '1';
    joystickInfo.outer.style.pointerEvents = 'auto';
    joystickInfo.outer.style.backgroundColor = this.parseColor(joystickInfo.outerColor);
  } else {
    // 完全隐藏模式
    joystickInfo.outer.style.opacity = '0';
    joystickInfo.outer.style.pointerEvents = 'none';
  }
}
  
  hexToRgba(hex, alpha = 1) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  parseColor(colorStr) {
    if (colorStr.includes(',')) {
      const [color, alpha] = colorStr.split(',');
      return this.hexToRgba(color.trim(), parseFloat(alpha.trim()));
    }
    return this.hexToRgba(colorStr, 0.3);
  }
  
  // 添加触块器（完整版本）
  addTouchBlock(id, x, y, width, height, color = '#FF0000,0.3', borderColor = '#FF0000,0.8', multiTouch = true, maxTouches = 5, showTouchPoint = false, zIndex = 1, text = '', textColor = '#FFFFFF', textSize = 12, image = null, imageSize = '100%', imageOpacity = 1, simulateKey = false, keyValue = ' ') {
    if (this.touchBlocks.has(id)) return false;
    
    const touchBlock = document.createElement('div');
    touchBlock.className = 'touch-block';
    touchBlock.dataset.id = id;
    touchBlock.style.position = 'absolute';
    touchBlock.style.pointerEvents = 'auto';
    touchBlock.style.touchAction = 'none';
    touchBlock.style.boxSizing = 'border-box';
    touchBlock.style.zIndex = zIndex;
    touchBlock.style.display = 'flex';
    touchBlock.style.alignItems = 'center';
    touchBlock.style.justifyContent = 'center';
    touchBlock.style.color = 'white';
    touchBlock.style.fontSize = '12px';
    touchBlock.style.fontWeight = 'bold';
    touchBlock.style.textShadow = '1px 1px 2px black';
    touchBlock.style.cursor = 'pointer';
    touchBlock.style.overflow = 'hidden';
    touchBlock.style.borderRadius = '10px';
    touchBlock.style.transform = 'translate(-50%, -50%)';
    
    // 创建图片元素
    const imageElement = document.createElement('img');
    imageElement.style.position = 'absolute';
    imageElement.style.left = '50%';
    imageElement.style.top = '50%';
    imageElement.style.transform = 'translate(-50%, -50%)';
    imageElement.style.width = imageSize;
    imageElement.style.height = imageSize;
    imageElement.style.objectFit = 'cover';
    imageElement.style.opacity = imageOpacity;
    imageElement.style.pointerEvents = 'none';
    
// 修改触块器图片处理部分
if (image) {
  const imageData = this.getImageData(image);
  imageElement.src = imageData;
  imageElement.style.display = 'block';
} else {
  imageElement.style.display = 'none';
}
    touchBlock.appendChild(imageElement);
    
    // 创建文字元素
    const textElement = document.createElement('div');
    textElement.style.position = 'relative';
    textElement.style.color = textColor;
    textElement.style.fontSize = textSize + 'px';
    textElement.style.fontWeight = 'bold';
    textElement.style.textAlign = 'center';
    textElement.style.pointerEvents = 'none';
    textElement.style.zIndex = '1';
    textElement.textContent = text;
    touchBlock.appendChild(textElement);
    
    this.touchBlocks.set(id, {
      element: touchBlock,
      x: x,
      y: y, 
      width: width,
      height: height,
      color: color,
      borderColor: borderColor,
      visible: true,
      multiTouch: multiTouch,
      maxTouches: maxTouches,
      showTouchPoint: showTouchPoint,
      zIndex: zIndex,
      text: text,
      textElement: textElement,
      textColor: textColor,
      textSize: textSize,
      image: image,
      imageElement: imageElement,
      imageSize: imageSize,
      imageOpacity: imageOpacity,
      simulateKey: simulateKey,
      keyValue: keyValue,
      keyPressed: false,
      activeTouches: new Map(),
      touchPoints: new Map(),
      clickData: new Map(),
      isTouching: false
    });
    
    this.stageTouchArea.appendChild(touchBlock);
    this.attachTouchBlockEvents(id);
    this.updateTouchBlockPosition(id);
    this.updateTouchBlockVisibility(id, this.touchBlocks.get(id));
    return true;
  }
  
  // 添加摇杆（完整版本）
// 修改：添加摇杆（添加层级参数，移除图片相关参数）
addJoystick(id, x, y, outerSize = 100, innerSize = 40, outerColor = '#000000,0.5', innerColor = '#FFFFFF,0.8', simulateKeys = false, keyUp = 'ArrowDown', keyDown = 'ArrowUp', keyLeft = 'ArrowLeft', keyRight = 'ArrowRight', zIndex = 9999) {
  if (this.joysticks.has(id)) return false;
  
  let pw = 480;
  let ph = 360;
  if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.runtime) {
    pw = Scratch.vm.runtime.stageWidth;
    ph = Scratch.vm.runtime.stageHeight;
  }
  
  const rect = this.stageElement.getBoundingClientRect();
  const relativeX = ((x + (pw/2)) / pw) * rect.width;
  const relativeY = (((ph/2) - y) / ph) * rect.height;
  
  // 计算相对尺寸
  const relativeOuterSize = (outerSize / pw) * rect.width;
  const relativeInnerSize = (innerSize / pw) * rect.width;
  
  const outer = document.createElement('div');
  outer.id = `joystick-outer-${id}`;
  outer.style.position = 'absolute';
  outer.style.left = `${relativeX}px`;
  outer.style.top = `${relativeY}px`;
  outer.style.width = `${relativeOuterSize}px`;
  outer.style.height = `${relativeOuterSize}px`;
  outer.style.transform = 'translate(-50%, -50%)';
  outer.style.backgroundColor = this.parseColor(outerColor);
  outer.style.borderRadius = '50%';
  outer.style.pointerEvents = 'auto';
  outer.style.touchAction = 'none';
  outer.style.overflow = 'hidden';
  outer.style.zIndex = zIndex;  // 使用传入的层级
  
  // 创建外圈图片元素（默认隐藏）
  const outerImg = document.createElement('img');
  outerImg.id = `joystick-outer-img-${id}`;
  outerImg.style.position = 'absolute';
  outerImg.style.left = '50%';
  outerImg.style.top = '50%';
  outerImg.style.transform = 'translate(-50%, -50%)';
  outerImg.style.width = '100%';
  outerImg.style.height = '100%';
  outerImg.style.objectFit = 'cover';
  outerImg.style.opacity = 1;
  outerImg.style.pointerEvents = 'none';
  outerImg.style.display = 'none'; // 默认不显示
  outer.appendChild(outerImg);
  
  const inner = document.createElement('div');
  inner.id = `joystick-inner-${id}`;
  inner.style.position = 'absolute';
  inner.style.left = '50%';
  inner.style.top = '50%';
  inner.style.width = `${relativeInnerSize}px`;
  inner.style.height = `${relativeInnerSize}px`;
  inner.style.transform = 'translate(-50%, -50%)';
  inner.style.backgroundColor = this.parseColor(innerColor);
  inner.style.borderRadius = '50%';
  inner.style.pointerEvents = 'none';
  inner.style.zIndex = '1';
  inner.style.overflow = 'hidden';
  
  // 创建内圈图片元素（默认隐藏）
  const innerImg = document.createElement('img');
  innerImg.id = `joystick-inner-img-${id}`;
  innerImg.style.position = 'absolute';
  innerImg.style.left = '50%';
  innerImg.style.top = '50%';
  innerImg.style.transform = 'translate(-50%, -50%)';
  innerImg.style.width = '100%';
  innerImg.style.height = '100%';
  innerImg.style.objectFit = 'cover';
  innerImg.style.opacity = 1;
  innerImg.style.pointerEvents = 'none';
  innerImg.style.display = 'none'; // 默认不显示
  inner.appendChild(innerImg);
  
  outer.appendChild(inner);
  this.stageTouchArea.appendChild(outer);
  
  this.joysticks.set(id, {
    id: id,
    outer: outer,
    inner: inner,
    outerImg: outerImg,
    innerImg: innerImg,
    x: x,
    y: y,
    outerSize: outerSize,
    innerSize: innerSize,
    relativeOuterSize: relativeOuterSize,
    relativeInnerSize: relativeInnerSize,
    outerColor: outerColor,
    innerColor: innerColor,
    zIndex: zIndex,  // 存储层级
    visible: true,
    activeTouch: null,
    currentX: 0,
    currentY: 0,
    screenX: relativeX,
    screenY: relativeY,
    outerImage: null,  // 初始为null
    innerImage: null,  // 初始为null
    outerImageSize: '100%',
    innerImageSize: '100%',
    outerImageOpacity: 1,
    innerImageOpacity: 1,
    simulateKeys: simulateKeys,
    keyUp: keyUp,
    keyDown: keyDown,
    keyLeft: keyLeft,
    keyRight: keyRight,
    useEightDirections: false,
    lastDirection: null
  });
  
  this.attachJoystickEvents(id);
  return true;
}
  
updateTouchBlockPosition(id) {
  const blockInfo = this.touchBlocks.get(id);
  if (!blockInfo || !this.stageElement) return;
  
  let pw = 480;
  let ph = 360;
  if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.runtime) {
    pw = Scratch.vm.runtime.stageWidth;
    ph = Scratch.vm.runtime.stageHeight;
  }
  
  const rect = this.stageElement.getBoundingClientRect();
  
  // 使用绝对定位计算，不依赖绿色区域的显示状态
  const relativeX = ((blockInfo.x + (pw/2)) / pw) * rect.width;
  const relativeY = (((ph/2) - blockInfo.y) / ph) * rect.height;
  const relativeWidth = (blockInfo.width / pw) * rect.width;
  const relativeHeight = (blockInfo.height / ph) * rect.height;
  
  blockInfo.element.style.left = relativeX + 'px';
  blockInfo.element.style.top = relativeY + 'px';
  blockInfo.element.style.width = relativeWidth + 'px';
  blockInfo.element.style.height = relativeHeight + 'px';
  
  // 更新文字大小
  const relativeTextSize = (blockInfo.textSize / pw) * rect.width;
  blockInfo.textElement.style.fontSize = `${Math.max(relativeTextSize, 8)}px`;
}

updateJoystickPosition(id) {
  const joystick = this.joysticks.get(id);
  if (!joystick || !this.stageElement) return;
  
  let pw = 480;
  let ph = 360;
  if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.runtime) {
    pw = Scratch.vm.runtime.stageWidth;
    ph = Scratch.vm.runtime.stageHeight;
  }
  
  const rect = this.stageElement.getBoundingClientRect();
  const relativeX = ((joystick.x + (pw/2)) / pw) * rect.width;
  const relativeY = (((ph/2) - joystick.y) / ph) * rect.height;
  
  // 更新相对尺寸
  joystick.relativeOuterSize = (joystick.outerSize / pw) * rect.width;
  joystick.relativeInnerSize = (joystick.innerSize / pw) * rect.width;
  
  joystick.outer.style.left = `${relativeX}px`;
  joystick.outer.style.top = `${relativeY}px`;
  joystick.outer.style.width = `${joystick.relativeOuterSize}px`;
  joystick.outer.style.height = `${joystick.relativeOuterSize}px`;
  
  joystick.inner.style.width = `${joystick.relativeInnerSize}px`;
  joystick.inner.style.height = `${joystick.relativeInnerSize}px`;
  
  joystick.screenX = relativeX;
  joystick.screenY = relativeY;
}
  
  updateAllTouchBlocks() {
    for (const id of this.touchBlocks.keys()) {
      this.updateTouchBlockPosition(id);
    }
  }
  
  updateAllJoysticks() {
    for (const id of this.joysticks.keys()) {
      this.updateJoystickPosition(id);
    }
  }
  
  attachTouchBlockEvents(id) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return;
    
    const element = blockInfo.element;
    
    element.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      this.handleTouchBlockStart(id, e);
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      this.handleTouchBlockEnd(id, e);
    }, { passive: false });
    
    element.addEventListener('touchcancel', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      this.handleTouchBlockEnd(id, e);
    }, { passive: false });
    
    element.addEventListener('touchmove', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      this.handleTouchBlockMove(id, e);
    }, { passive: false });
    
    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleMouseDown(id, e);
    });
    
    element.addEventListener('mouseup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleMouseUp(id, e);
    });
    
    element.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleMouseUp(id, e);
    });
  }
  
  attachJoystickEvents(id) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return;
    
    const outer = joystick.outer;
    
    outer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleJoystickTouchStart(id, e);
    }, { passive: false });
    
    outer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleJoystickMouseDown(id, e);
    });
  }
  
handleTouchBlockStart(id, e) {
  const blockInfo = this.touchBlocks.get(id);
  if (!blockInfo || !blockInfo.visible) return;
  
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (!blockInfo.multiTouch && blockInfo.activeTouches.size >= 1) continue;
    if (blockInfo.activeTouches.size >= blockInfo.maxTouches) continue;
    
    const touchId = touch.identifier;
    const clientX = typeof touch.clientX === 'number' ? touch.clientX : 0;
    const clientY = typeof touch.clientY === 'number' ? touch.clientY : 0;
    
    const blockRect = blockInfo.element.getBoundingClientRect();
    const centerX = blockRect.left + blockRect.width / 2;
    const centerY = blockRect.top + blockRect.height / 2;
    
    const greenRect = this.stageElement.getBoundingClientRect();
    const gw = greenRect.width;
    const gh = greenRect.height;
    const gLeft = greenRect.left;
    const gTop = greenRect.top;
    const gcx = gLeft + gw / 2;
    const gcy = gTop + gh / 2;
    
    let pw = 480;
    let ph = 360;
    if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.runtime) {
      pw = Scratch.vm.runtime.stageWidth;
      ph = Scratch.vm.runtime.stageHeight;
    }
    const kx = pw / gw;
    const ky = ph / gh;
    
    // 立即计算正确的坐标
    const screenX = kx * (clientX - gcx);
    const screenY = ky * (gcy - clientY);
    const areaX = kx * (clientX - centerX);
    const areaY = ky * (centerY - clientY);
    
    blockInfo.activeTouches.set(touchId, {
      identifier: touchId,
      startX: clientX,
      startY: clientY,
      currentX: screenX,        // 立即设置正确的舞台坐标
      currentY: screenY,        // 立即设置正确的舞台坐标
      areaX: areaX,             // 立即设置正确的相对坐标
      areaY: areaY,             // 立即设置正确的相对坐标
      deltaX: 0,
      deltaY: 0,
      timestamp: Date.now(),
      lastX: clientX,           // 初始化 lastX
      lastY: clientY,           // 初始化 lastY
      instantDeltaX: 0,
      instantDeltaY: 0
    });
    
    blockInfo.clickData.set(touchId, {
      startX: clientX,
      startY: clientY,
      startTime: Date.now(),
      isClick: false
    });
    
    this.activeTouches.set(touchId, { type: 'touchBlock', id: id });
    
    // 按键模拟
    if (blockInfo.simulateKey && !blockInfo.keyPressed) {
      Scratch.vm.postIOData("keyboard", {
        key: blockInfo.keyValue,
        isDown: true
      });
      blockInfo.keyPressed = true;
    }
    
    if (blockInfo.showTouchPoint || this.showTouchPoints) {
      this.createTouchPoint(id, touchId, clientX, clientY);
    }
  }
  
  blockInfo.isTouching = blockInfo.activeTouches.size > 0;
}
  
  handleJoystickTouchStart(id, e) {
    const joystick = this.joysticks.get(id);
    if (!joystick || !joystick.visible) return;
    
    const touch = e.changedTouches[0];
    if (joystick.activeTouch !== null) return;
    
    joystick.activeTouch = touch.identifier;
    this.activeTouches.set(touch.identifier, { type: 'joystick', id: id });
    
    const handleTouchMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touch.identifier) {
          this.updateJoystickPositionValue(id, t.clientX, t.clientY);
          break;
        }
      }
    };
    
    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touch.identifier) {
          this.resetJoystick(id);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
          break;
        }
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    this.updateJoystickPositionValue(id, touch.clientX, touch.clientY);
  }
  
  handleJoystickMouseDown(id, e) {
    const joystick = this.joysticks.get(id);
    if (!joystick || !joystick.visible) return;
    
    if (joystick.activeTouch !== null) return;
    
    joystick.activeTouch = 0;
    this.activeTouches.set(0, { type: 'joystick', id: id });
    
    const handleMouseMove = (e) => {
      this.updateJoystickPositionValue(id, e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      this.resetJoystick(id);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    this.updateJoystickPositionValue(id, e.clientX, e.clientY);
  }
  
  // 摇杆方向判断 - 修复角度问题
  getJoystickDirection(x, y, useEightDirections = false) {
    const deadZone = 0.3;
    
    if (Math.abs(x) < deadZone && Math.abs(y) < deadZone) {
      return 'neutral';
    }
    
    const angle = Math.atan2(-y, x) * (180 / Math.PI);
    const normalizedAngle = (angle + 360) % 360;
    
    if (useEightDirections) {
      // 八方向
      if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'right';
      if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'up-right';
      if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'up';
      if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'up-left';
      if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'left';
      if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'down-left';
      if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'down';
      return 'down-right';
    } else {
      // 四方向
      if (normalizedAngle >= 315 || normalizedAngle < 45) return 'right';
      if (normalizedAngle >= 45 && normalizedAngle < 135) return 'up';
      if (normalizedAngle >= 135 && normalizedAngle < 225) return 'left';
      return 'down';
    }
  }
  
  // 发送摇杆按键
  pressJoystickKey(joystick, direction) {
    let key;
    switch(direction) {
      case 'up': key = joystick.keyUp; break;
      case 'down': key = joystick.keyDown; break;
      case 'left': key = joystick.keyLeft; break;
      case 'right': key = joystick.keyRight; break;
      case 'up-left': 
        this.pressJoystickKey(joystick, 'up');
        this.pressJoystickKey(joystick, 'left');
        return;
      case 'up-right': 
        this.pressJoystickKey(joystick, 'up');
        this.pressJoystickKey(joystick, 'right');
        return;
      case 'down-left': 
        this.pressJoystickKey(joystick, 'down');
        this.pressJoystickKey(joystick, 'left');
        return;
      case 'down-right': 
        this.pressJoystickKey(joystick, 'down');
        this.pressJoystickKey(joystick, 'right');
        return;
    }
    
    if (key) {
      Scratch.vm.postIOData("keyboard", {
        key: key,
        isDown: true
      });
    }
  }
  
  releaseJoystickKey(joystick, direction) {
    let key;
    switch(direction) {
      case 'up': key = joystick.keyUp; break;
      case 'down': key = joystick.keyDown; break;
      case 'left': key = joystick.keyLeft; break;
      case 'right': key = joystick.keyRight; break;
      case 'up-left': 
        this.releaseJoystickKey(joystick, 'up');
        this.releaseJoystickKey(joystick, 'left');
        return;
      case 'up-right': 
        this.releaseJoystickKey(joystick, 'up');
        this.releaseJoystickKey(joystick, 'right');
        return;
      case 'down-left': 
        this.releaseJoystickKey(joystick, 'down');
        this.releaseJoystickKey(joystick, 'left');
        return;
      case 'down-right': 
        this.releaseJoystickKey(joystick, 'down');
        this.releaseJoystickKey(joystick, 'right');
        return;
    }
    
    if (key) {
      Scratch.vm.postIOData("keyboard", {
        key: key,
        isDown: false
      });
    }
  }
  
  updateJoystickKeys(id, direction) {
    const joystick = this.joysticks.get(id);
    if (!joystick || !joystick.simulateKeys) return;
    
    if (joystick.lastDirection && joystick.lastDirection !== direction) {
      this.releaseJoystickKey(joystick, joystick.lastDirection);
    }
    
    if (direction !== 'neutral') {
      this.pressJoystickKey(joystick, direction);
    } else if (joystick.lastDirection) {
      this.releaseJoystickKey(joystick, joystick.lastDirection);
    }
    
    joystick.lastDirection = direction;
  }
  
  updateJoystickPositionValue(id, clientX, clientY) {
    const joystick = this.joysticks.get(id);
    if (!joystick || !joystick.inner) return;
    
    const rect = joystick.outer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = joystick.relativeOuterSize / 2 - joystick.relativeInnerSize / 2;
    
    let moveX = deltaX;
    let moveY = deltaY;
    
    if (distance > maxDistance) {
      moveX = (deltaX / distance) * maxDistance;
      moveY = (deltaY / distance) * maxDistance;
    }
    
    joystick.currentX = moveX / maxDistance;
    joystick.currentY = -moveY / maxDistance;
    
    joystick.inner.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    
    // 更新按键模拟
    const direction = this.getJoystickDirection(joystick.currentX, joystick.currentY, joystick.useEightDirections);
    this.updateJoystickKeys(id, direction);
  }
  
  resetJoystick(id) {
    const joystick = this.joysticks.get(id);
    if (joystick) {
      joystick.activeTouch = null;
      joystick.currentX = 0;
      joystick.currentY = 0;
      
      joystick.inner.style.transition = 'transform 0.2s ease-out';
      joystick.inner.style.transform = 'translate(-50%, -50%)';
      
      // 释放所有按键
      if (joystick.simulateKeys && joystick.lastDirection) {
        this.releaseJoystickKey(joystick, joystick.lastDirection);
        joystick.lastDirection = null;
      }
      
      setTimeout(() => {
        joystick.inner.style.transition = 'none';
      }, 200);
      
      this.activeTouches.forEach((value, key) => {
        if (value.type === 'joystick' && value.id === id) {
          this.activeTouches.delete(key);
        }
      });
    }
  }
  
  handleTouchBlockMove(id, e) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo || !blockInfo.visible) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchInfo = this.activeTouches.get(touch.identifier);
      if (touchInfo && touchInfo.type === 'touchBlock' && touchInfo.id === id) {
        this.updateTouchPosition(id, touch.identifier, touch.clientX, touch.clientY);
      }
    }
  }
  
  handleTouchBlockEnd(id, e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const touchInfo = this.activeTouches.get(t.identifier);
      if (touchInfo && touchInfo.type === 'touchBlock' && touchInfo.id === id) {
        this.checkClick(id, t.identifier, t.clientX, t.clientY);
        this.removeTouch(id, t.identifier);
      }
    }
  }
  
  handleMouseDown(id, e) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo || !blockInfo.visible) return;
    if (!blockInfo.multiTouch && blockInfo.activeTouches.size >= 1) return;
    if (blockInfo.activeTouches.size >= blockInfo.maxTouches) return;
    
    const touchId = 0;
    const blockRect = blockInfo.element.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const centerX = blockRect.left + blockRect.width / 2;
    const centerY = blockRect.top + blockRect.height / 2;
    const relativeX = clientX - centerX;
    const relativeY = clientY - centerY;
    
    blockInfo.activeTouches.set(touchId, {
      identifier: touchId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      areaX: relativeX,
      areaY: relativeY,
      deltaX: 0,
      deltaY: 0,
      timestamp: Date.now(),
      lastX: clientX,
      lastY: clientY,
      instantDeltaX: 0,
      instantDeltaY: 0
    });
    
    blockInfo.clickData.set(touchId, {
      startX: clientX,
      startY: clientY,
      startTime: Date.now(),
      isClick: false
    });
    
    this.activeTouches.set(touchId, { type: 'touchBlock', id: id });
    blockInfo.isTouching = true;
    
    // 按键模拟
    if (blockInfo.simulateKey && !blockInfo.keyPressed) {
      Scratch.vm.postIOData("keyboard", {
        key: blockInfo.keyValue,
        isDown: true
      });
      blockInfo.keyPressed = true;
    }
    
    if (blockInfo.showTouchPoint || this.showTouchPoints) {
      this.createTouchPoint(id, touchId, clientX, clientY);
    }
    
    const handleMouseMove = (e) => {
      this.updateTouchPosition(id, touchId, e.clientX, e.clientY);
    };
    
    const handleMouseUp = (e) => {
      this.checkClick(id, touchId, e.clientX, e.clientY);
      this.removeTouch(id, touchId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  handleMouseUp(id, e) {
    this.checkClick(id, 0, e.clientX, e.clientY);
    this.removeTouch(id, 0);
  }

  checkClick(id, touchId, endX, endY) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return;
    
    const clickData = blockInfo.clickData.get(touchId);
    if (!clickData) return;
    
    const distance = Math.sqrt(
      Math.pow(endX - clickData.startX, 2) + 
      Math.pow(endY - clickData.startY, 2)
    );
    const duration = Date.now() - clickData.startTime;
    
    const isClick = (distance <= this.clickConfig.maxDistance && duration <= this.clickConfig.maxTime);
    
    if (isClick) {
      this.clickCache.set(`${id}-${touchId}`, {
        timestamp: Date.now(),
        blockId: id,
        touchId: touchId
      });
    }
  }
  
  isTouchClick(id, touchId) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return false;
    
    const clickData = blockInfo.clickData.get(touchId);
    if (!clickData) return false;
    
    const result = clickData.isClick;
    clickData.isClick = false;
    return result;
  }
  
  setClickConfig(maxDistance, maxTime) {
    this.clickConfig.maxDistance = maxDistance;
    this.clickConfig.maxTime = maxTime;
  }
  
  createTouchPoint(blockId, touchId, x, y) {
    const point = document.createElement('div');
    point.id = `touch-point-${blockId}-${touchId}`;
    point.style.position = 'absolute';
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.style.width = '20px';
    point.style.height = '20px';
    point.style.transform = 'translate(-50%, -50%)';
    point.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    point.style.border = '2px solid rgba(0, 0, 0, 0.5)';
    point.style.borderRadius = '50%';
    point.style.pointerEvents = 'none';
    point.style.zIndex = '1000000';
    
    this.touchPointsContainer.appendChild(point);
    
    const blockInfo = this.touchBlocks.get(blockId);
    if (blockInfo) {
      blockInfo.touchPoints.set(touchId, point);
    }
  }
  
updateTouchPosition(blockId, touchId, x, y) {
  const blockInfo = this.touchBlocks.get(blockId);
  if (!blockInfo) return;
  
  const touch = blockInfo.activeTouches.get(touchId);
  if (!touch) return;
  
  const validX = typeof x === 'number' ? x : touch.currentX;
  const validY = typeof y === 'number' ? y : touch.currentY;
  
  const greenRect = this.stageTouchArea.getBoundingClientRect();
  const gw = greenRect.width;
  const gh = greenRect.height;
  const gLeft = greenRect.left;
  const gTop = greenRect.top;
  const gcx = gLeft + gw / 2;
  const gcy = gTop + gh / 2;
  
  let pw = 480;
  let ph = 360;
  if (typeof Scratch !== 'undefined' && Scratch.vm && Scratch.vm.runtime) {
    pw = Scratch.vm.runtime.stageWidth;
    ph = Scratch.vm.runtime.stageHeight;
  }
  
  const blockRect = blockInfo.element.getBoundingClientRect();
  const centerX = blockRect.left + blockRect.width / 2;
  const centerY = blockRect.top + blockRect.height / 2;
  const kx = pw / gw;
  const ky = ph / gh;
  
  // 计算屏幕坐标（相对于绿色区域）
  const screenX = kx * (validX - gcx);
  const screenY = ky * (gcy - validY);
  
  // 计算相对于触块的坐标
  const areaX = kx * (validX - centerX);
  const areaY = ky * (centerY - validY);
  
  // 计算移动距离（从触摸开始）
  const deltaX = kx * (validX - touch.startX);
  const deltaY = ky * (touch.startY - validY);
  
  // 计算瞬时变化（从上次更新）
  touch.instantDeltaX = 1.5 * kx * (validX - touch.lastX);
  touch.instantDeltaY = 1.5 * ky * (touch.lastY - validY);
  
  // 更新触摸数据
  touch.lastX = validX;
  touch.lastY = validY;
  touch.currentX = screenX;        // 舞台坐标
  touch.currentY = screenY;        // 舞台坐标
  touch.deltaX = deltaX;           // 移动距离X
  touch.deltaY = deltaY;           // 移动距离Y
  touch.areaX = areaX;             // 相对于触块的X
  touch.areaY = areaY;             // 相对于触块的Y
  
  // 更新触摸点显示
  const touchPoint = blockInfo.touchPoints.get(touchId);
  if (touchPoint) {
    touchPoint.style.left = `${validX}px`;
    touchPoint.style.top = `${validY}px`;
  }
}
  
  removeTouch(blockId, touchId) {
    const blockInfo = this.touchBlocks.get(blockId);
    if (!blockInfo) return;
    
    // 释放按键模拟
    if (blockInfo.simulateKey && blockInfo.keyPressed && blockInfo.activeTouches.size <= 1) {
      Scratch.vm.postIOData("keyboard", {
        key: blockInfo.keyValue,
        isDown: false
      });
      blockInfo.keyPressed = false;
    }
    
    const touchPoint = blockInfo.touchPoints.get(touchId);
    if (touchPoint && touchPoint.parentNode) {
      touchPoint.parentNode.removeChild(touchPoint);
    }
    blockInfo.touchPoints.delete(touchId);
    
    blockInfo.activeTouches.delete(touchId);
    this.activeTouches.delete(touchId);
    
    blockInfo.isTouching = blockInfo.activeTouches.size > 0;
  }
  
  // 触块器相关方法
  setTouchBlockVisible(id, visible) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return false;
    
    blockInfo.visible = visible;
    this.updateTouchBlockVisibility(id, blockInfo);
    return true;
  }
  
  setTouchBlockMultiTouch(id, multiTouch, maxTouches = 5) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return false;
    
    blockInfo.multiTouch = multiTouch;
    blockInfo.maxTouches = maxTouches;
    return true;
  }
  
  setShowTouchPoints(show) {
    this.showTouchPoints = show;
    
    if (!show) {
      this.touchBlocks.forEach(block => {
        if (!block.showTouchPoint) {
          block.touchPoints.forEach((point, touchId) => {
            if (point.parentNode) {
              point.parentNode.removeChild(point);
            }
          });
          block.touchPoints.clear();
        }
      });
    }
  }
  
  setTouchBlockShowTouchPoint(id, show) {
    const blockInfo = this.touchBlocks.get(id);
    if (blockInfo) {
      blockInfo.showTouchPoint = show;
      
      if (!show && !this.showTouchPoints) {
        blockInfo.touchPoints.forEach((point, touchId) => {
          if (point.parentNode) {
            point.parentNode.removeChild(point);
          }
        });
        blockInfo.touchPoints.clear();
      }
    }
  }
  
  setTouchBlockZIndex(id, zIndex) {
    const blockInfo = this.touchBlocks.get(id);
    if (blockInfo) {
      blockInfo.zIndex = zIndex;
      blockInfo.element.style.zIndex = zIndex;
    }
  }
  // 新增：设置摇杆层级
setJoystickZIndex(id, zIndex) {
  const joystick = this.joysticks.get(id);
  if (joystick) {
    joystick.zIndex = zIndex;
    joystick.outer.style.zIndex = zIndex;
  }
}
// 新增：设置摇杆位置
setJoystickPosition(id, x, y) {
  const joystick = this.joysticks.get(id);
  if (!joystick) return false;
  
  joystick.x = x;
  joystick.y = y;
  this.updateJoystickPosition(id);
  return true;
}
// 新增：设置摇杆外圈图片
setJoystickOuterImage(id, imageId, size = '100%', opacity = 1) {
  const joystick = this.joysticks.get(id);
  if (!joystick) return false;
  
  joystick.outerImage = imageId;
  joystick.outerImageSize = size;
  joystick.outerImageOpacity = opacity;
  
  if (imageId) {
    const imageData = this.getImageData(imageId);
    joystick.outerImg.src = imageData;
    joystick.outerImg.style.width = size;
    joystick.outerImg.style.height = size;
    joystick.outerImg.style.opacity = opacity;
    joystick.outerImg.style.display = 'block';
  } else {
    joystick.outerImg.style.display = 'none';
  }
  
  return true;
}
// 新增：设置摇杆内圈图片
setJoystickInnerImage(id, imageId, size = '100%', opacity = 1) {
  const joystick = this.joysticks.get(id);
  if (!joystick) return false;
  
  joystick.innerImage = imageId;
  joystick.innerImageSize = size;
  joystick.innerImageOpacity = opacity;
  
  if (imageId) {
    const imageData = this.getImageData(imageId);
    joystick.innerImg.src = imageData;
    joystick.innerImg.style.width = size;
    joystick.innerImg.style.height = size;
    joystick.innerImg.style.opacity = opacity;
    joystick.innerImg.style.display = 'block';
  } else {
    joystick.innerImg.style.display = 'none';
  }
  
  return true;
}
  
  setTouchBlockColor(id, color, borderColor) {
    const blockInfo = this.touchBlocks.get(id);
    if (blockInfo) {
      if (color) {
        blockInfo.color = color;
        if (!this.hiddenButUsable && blockInfo.visible) {
          blockInfo.element.style.backgroundColor = this.parseColor(color);
        }
      }
      if (borderColor) {
        blockInfo.borderColor = borderColor;
        if (!this.hiddenButUsable && blockInfo.visible) {
          blockInfo.element.style.borderColor = this.parseColor(borderColor);
        }
      }
    }
  }
  
  setTouchBlockText(id, text, textColor, textSize) {
    const blockInfo = this.touchBlocks.get(id);
    if (blockInfo) {
      if (text !== undefined) {
        blockInfo.text = text;
        blockInfo.textElement.textContent = text;
      }
      if (textColor) {
        blockInfo.textColor = textColor;
        blockInfo.textElement.style.color = textColor;
      }
      if (textSize) {
        blockInfo.textSize = textSize;
        this.updateTouchBlockPosition(id); // 这会更新文字大小
      }
    }
  }
  
// 修改：设置触块器图片（使用图片ID）
setTouchBlockImage(id, image, imageSize, imageOpacity) {
  const blockInfo = this.touchBlocks.get(id);
  if (blockInfo) {
    if (image !== undefined) {
      blockInfo.image = image;
      const imageData = this.getImageData(image);
      if (imageData) {
        blockInfo.imageElement.src = imageData;
        blockInfo.imageElement.style.display = 'block';
      } else {
        blockInfo.imageElement.style.display = 'none';
      }
    }
    if (imageSize) {
      blockInfo.imageSize = imageSize;
      blockInfo.imageElement.style.width = imageSize;
      blockInfo.imageElement.style.height = imageSize;
    }
    if (imageOpacity !== undefined) {
      blockInfo.imageOpacity = imageOpacity;
      blockInfo.imageElement.style.opacity = imageOpacity;
    }
  }
}
  
  setTouchBlockKeySimulation(id, simulateKey, keyValue) {
    const blockInfo = this.touchBlocks.get(id);
    if (blockInfo) {
      // 如果之前有按键按下，先释放
      if (blockInfo.simulateKey && blockInfo.keyPressed) {
        Scratch.vm.postIOData("keyboard", {
          key: blockInfo.keyValue,
          isDown: false
        });
        blockInfo.keyPressed = false;
      }
      
      blockInfo.simulateKey = simulateKey;
      if (keyValue) {
        blockInfo.keyValue = keyValue;
      }
    }
  }
  
  isTouchBlockTouching(id) {
    const blockInfo = this.touchBlocks.get(id);
    return blockInfo ? blockInfo.isTouching : false;
  }
  
  getActiveTouchCount(id) {
    const blockInfo = this.touchBlocks.get(id);
    return blockInfo ? blockInfo.activeTouches.size : 0;
  }
  
  getActiveTouchIds(id) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return [];
    return Array.from(blockInfo.activeTouches.keys());
  }
  
  touchBlockExists(id) {
    return this.touchBlocks.has(id);
  }
  
  removeTouchBlock(id) {
    const blockInfo = this.touchBlocks.get(id);
    if (!blockInfo) return false;
    
    // 释放按键模拟
    if (blockInfo.simulateKey && blockInfo.keyPressed) {
      Scratch.vm.postIOData("keyboard", {
        key: blockInfo.keyValue,
        isDown: false
      });
    }
    
    blockInfo.touchPoints.forEach((point, touchId) => {
      if (point.parentNode) {
        point.parentNode.removeChild(point);
      }
    });
    
    blockInfo.activeTouches.forEach((touch, touchId) => {
      this.activeTouches.delete(touchId);
    });
    
    if (blockInfo.element.parentNode) {
      blockInfo.element.parentNode.removeChild(blockInfo.element);
    }
    
    this.touchBlocks.delete(id);
    return true;
  }
  
  getAllTouchBlockIds() {
    return Array.from(this.touchBlocks.keys());
  }
  
  // 摇杆相关方法
  setJoystickVisible(id, visible) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return false;
    
    joystick.visible = visible;
    this.updateJoystickVisibility(id, joystick);
    return true;
  }
  
  updateJoystickAppearance(id, options) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return;
    
    if (options.outerSize !== undefined) {
      joystick.outerSize = options.outerSize;
      this.updateJoystickPosition(id);
    }
    
    if (options.innerSize !== undefined) {
      joystick.innerSize = options.innerSize;
      this.updateJoystickPosition(id);
    }
    
    if (options.outerColor !== undefined) {
      joystick.outerColor = options.outerColor;
      joystick.outer.style.backgroundColor = this.parseColor(options.outerColor);
    }
    
    if (options.innerColor !== undefined) {
      joystick.innerColor = options.innerColor;
      joystick.inner.style.backgroundColor = this.parseColor(options.innerColor);
    }
    
    if (options.outerImage !== undefined) {
      joystick.outerImage = options.outerImage;
      if (options.outerImage) {
        joystick.outerImg.src = options.outerImage;
        joystick.outerImg.style.display = 'block';
      } else {
        joystick.outerImg.style.display = 'none';
      }
    }
    
    if (options.innerImage !== undefined) {
      joystick.innerImage = options.innerImage;
      if (options.innerImage) {
        joystick.innerImg.src = options.innerImage;
        joystick.innerImg.style.display = 'block';
      } else {
        joystick.innerImg.style.display = 'none';
      }
    }
    
    if (options.outerImageSize !== undefined) {
      joystick.outerImageSize = options.outerImageSize;
      joystick.outerImg.style.width = options.outerImageSize;
      joystick.outerImg.style.height = options.outerImageSize;
    }
    
    if (options.innerImageSize !== undefined) {
      joystick.innerImageSize = options.innerImageSize;
      joystick.innerImg.style.width = options.innerImageSize;
      joystick.innerImg.style.height = options.innerImageSize;
    }
    
    if (options.outerImageOpacity !== undefined) {
      joystick.outerImageOpacity = options.outerImageOpacity;
      joystick.outerImg.style.opacity = options.outerImageOpacity;
    }
    
    if (options.innerImageOpacity !== undefined) {
      joystick.innerImageOpacity = options.innerImageOpacity;
      joystick.innerImg.style.opacity = options.innerImageOpacity;
    }
  }
  
  setJoystickKeySimulation(id, simulateKeys, keyUp, keyDown, keyLeft, keyRight, useEightDirections = false) {
    const joystick = this.joysticks.get(id);
    if (joystick) {
      // 如果之前有按键按下，先释放
      if (joystick.simulateKeys && joystick.lastDirection) {
        this.releaseJoystickKey(joystick, joystick.lastDirection);
        joystick.lastDirection = null;
      }
      
      joystick.simulateKeys = simulateKeys;
      if (keyUp) joystick.keyUp = keyUp;
      if (keyDown) joystick.keyDown = keyDown;
      if (keyLeft) joystick.keyLeft = keyLeft;
      if (keyRight) joystick.keyRight = keyRight;
      joystick.useEightDirections = useEightDirections;
    }
  }
  
  setJoystickEightDirections(id, useEightDirections) {
    const joystick = this.joysticks.get(id);
    if (joystick) {
      joystick.useEightDirections = useEightDirections;
    }
  }
  
  isJoystickActive(id) {
    const joystick = this.joysticks.get(id);
    return joystick ? joystick.activeTouch !== null : false;
  }
  
  isJoystickPressingKey(id) {
    const joystick = this.joysticks.get(id);
    return joystick ? (joystick.simulateKeys && joystick.lastDirection !== null) : false;
  }
  
  getJoystickX(id) {
    const joystick = this.joysticks.get(id);
    return joystick ? joystick.currentX : 0;
  }
  
  getJoystickY(id) {
    const joystick = this.joysticks.get(id);
    return joystick ? joystick.currentY : 0;
  }
  
  getJoystickAngle(id) {
    const joystick = this.joysticks.get(id);
    return joystick ? this.calculateJoystickAngle(joystick.currentX, joystick.currentY) : 0;
  }
  
  getJoystickDistance(id) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return 0;
    return Math.min(1, Math.sqrt(joystick.currentX * joystick.currentX + joystick.currentY * joystick.currentY));
  }
  
  getJoystickDirectionKey(id, direction) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return '';
    
    switch(direction) {
      case 'up': return joystick.keyUp;
      case 'down': return joystick.keyDown;
      case 'left': return joystick.keyLeft;
      case 'right': return joystick.keyRight;
      default: return '';
    }
  }
  
  joystickExists(id) {
    return this.joysticks.has(id);
  }
  
  removeJoystick(id) {
    const joystick = this.joysticks.get(id);
    if (!joystick) return false;
    
    // 释放按键
    if (joystick.simulateKeys && joystick.lastDirection) {
      this.releaseJoystickKey(joystick, joystick.lastDirection);
    }
    
    if (joystick.outer.parentNode) {
      joystick.outer.parentNode.removeChild(joystick.outer);
    }
    
    if (joystick.activeTouch !== null) {
      this.activeTouches.delete(joystick.activeTouch);
    }
    
    this.joysticks.delete(id);
    return true;
  }
  
  getAllJoystickIds() {
    return Array.from(this.joysticks.keys());
  }
  
removeStageTouchArea() {
  // 只删除触块器和摇杆，不删除绿色背景
  for (const id of this.touchBlocks.keys()) {
    this.removeTouchBlock(id);
  }
  
  for (const id of this.joysticks.keys()) {
    this.removeJoystick(id);
  }
  
  // 不清除绿色背景，只清空内容
  if (this.stageTouchArea) {
    this.stageTouchArea.innerHTML = '';
  }
  
  return true;
}
showAllElements() {
  this.hiddenButUsable = false;
  this.updateAllTouchBlocksVisibility();
  this.updateAllJoysticksVisibility();
}
// 获取触块器的所有活动手指ID
getTouchBlockTouchIds(id) {
  const blockInfo = this.touchBlocks.get(id);
  if (!blockInfo) return [];
  return Array.from(blockInfo.activeTouches.keys());
}

// 获取触块器的第一个手指ID
getFirstTouchId(id) {
  const blockInfo = this.touchBlocks.get(id);
  if (!blockInfo || blockInfo.activeTouches.size === 0) return -1;
  
  // 返回第一个触摸的手指ID
  return Array.from(blockInfo.activeTouches.keys())[0];
}

// 获取触块器的手指数量
getTouchCount(id) {
  const blockInfo = this.touchBlocks.get(id);
  return blockInfo ? blockInfo.activeTouches.size : 0;
}
// 新增：缓存图片
cacheImage(imageId, imageData) {
  if (!imageId || !imageData) return false;
  
  // 如果是 data:image 格式，直接缓存
  if (imageData.startsWith('data:image')) {
    this.imageCache.set(imageId, imageData);
    return true;
  }
  
  // 如果是 URL，尝试预加载
  const img = new Image();
  img.onload = () => {
    this.imageCache.set(imageId, imageData); // 缓存 URL
  };
  img.onerror = () => {
    console.warn(`Failed to load image: ${imageId}`);
  };
  img.src = imageData;
  
  // 暂时先缓存URL
  this.imageCache.set(imageId, imageData);
  return true;
}

// 新增：获取图片数据（优先从缓存获取）
getImageData(imageId) {
  // 如果已经是 data:image 格式，直接返回
  if (imageId.startsWith('data:image')) {
    return imageId;
  }
  
  // 从缓存中获取
  const cached = this.imageCache.get(imageId);
  if (cached) {
    // 检查缓存的是URL还是data:image
    if (cached.startsWith('data:image')) {
      return cached;
    }
    // 如果缓存的是URL，返回URL
    return cached;
  }
  
  // 如果没有缓存，假设传入的是URL
  return imageId;
}
// 在 AdvancedTouchBlockExtension 类中添加这个方法
getAllDomElementsInfo() {
  const elementsInfo = {
    timestamp: Date.now(),
    stageTouchArea: {
      exists: !!this.stageTouchArea,
      id: this.stageTouchArea ? this.stageTouchArea.id : null,
      parent: this.stageTouchArea && this.stageTouchArea.parentNode ? 
        this.stageTouchArea.parentNode.id || this.stageTouchArea.parentNode.tagName : null,
      display: this.stageTouchArea ? this.stageTouchArea.style.display : null,
      visibility: this.isTouchAreaVisible ? 'visible' : 'hidden',
      backgroundColor: this.stageTouchArea ? this.stageTouchArea.style.backgroundColor : null
    },
    touchBlocks: {},
    joysticks: {},
    touchPointsContainer: {
      exists: !!this.touchPointsContainer,
      id: this.touchPointsContainer ? this.touchPointsContainer.id : null,
      parent: this.touchPointsContainer && this.touchPointsContainer.parentNode ? 
        this.touchPointsContainer.parentNode.id || this.touchPointsContainer.parentNode.tagName : null
    }
  };
  
  // 收集所有触块器信息
  this.touchBlocks.forEach((blockInfo, id) => {
    elementsInfo.touchBlocks[id] = {
      exists: !!blockInfo.element,
      elementId: blockInfo.element ? blockInfo.element.id || blockInfo.element.dataset.id : null,
      parent: blockInfo.element && blockInfo.element.parentNode ? 
        (blockInfo.element.parentNode.id || blockInfo.element.parentNode.tagName) : null,
      visible: blockInfo.visible,
      zIndex: blockInfo.zIndex || 1,
      display: blockInfo.element ? blockInfo.element.style.display : null,
      opacity: blockInfo.element ? blockInfo.element.style.opacity : null,
      position: {
        x: blockInfo.x,
        y: blockInfo.y
      }
    };
  });
  
  // 收集所有摇杆信息
  this.joysticks.forEach((joystickInfo, id) => {
    elementsInfo.joysticks[id] = {
      exists: !!joystickInfo.outer,
      outerId: joystickInfo.outer ? joystickInfo.outer.id : null,
      innerId: joystickInfo.inner ? joystickInfo.inner.id : null,
      parent: joystickInfo.outer && joystickInfo.outer.parentNode ? 
        (joystickInfo.outer.parentNode.id || joystickInfo.outer.parentNode.tagName) : null,
      visible: joystickInfo.visible,
      zIndex: joystickInfo.zIndex || 9999,
      useEightDirections: joystickInfo.useEightDirections || false,
      display: joystickInfo.outer ? joystickInfo.outer.style.display : null,
      opacity: joystickInfo.outer ? joystickInfo.outer.style.opacity : null,
      position: {
        x: joystickInfo.x,
        y: joystickInfo.y
      }
    };
  });
  
  return JSON.stringify(elementsInfo, null, 2);
}
// 在 AdvancedTouchBlockExtension 类中添加获取和分析JSON的方法

// 直接获取当前项目JSON（借鉴lmsAssets的代码）
getCurrentProjectJSON() {
  try {
    // 直接使用 Scratch.vm.toJSON() 获取项目JSON
    if (typeof Scratch !== 'undefined' && Scratch.vm) {
      return Scratch.vm.toJSON();
    }
    return '{}';
  } catch (error) {
    console.error('获取项目JSON失败:', error);
    return '{}';
  }
}

// 检测所有按键积木（包括 sensing_keypressed 和 event_whenkeypressed）
detectAllKeyBlocks() {
  try {
    const projectJson = this.getCurrentProjectJSON();
    const data = typeof projectJson === 'string' ? JSON.parse(projectJson) : projectJson;
    
    const allKeyBlocks = [];
    
    // 遍历所有角色
    Object.values(data.targets || []).forEach(target => {
      Object.entries(target.blocks || {}).forEach(([blockId, block]) => {
        // 1. 检测 event_whenkeypressed (当按下键)
        if (block.opcode === 'event_whenkeypressed') {
          const key = block.fields?.KEY_OPTION?.[0];
          if (key) {
            allKeyBlocks.push({
              type: 'whenKeyPressed',
              key: key,
              blockId: blockId,
              targetName: target.name || 'Stage',
              isStage: target.isStage,
              x: block.x || 0,
              y: block.y || 0
            });
          }
        }
        
        // 2. 检测 sensing_keypressed (按下键？)
        else if (block.opcode === 'sensing_keypressed') {
          const keyInput = block.inputs?.KEY_OPTION;
          if (keyInput && keyInput[0] === 1) { // 只处理硬编码
            const keyBlockId = keyInput[1];
            if (keyBlockId && target.blocks?.[keyBlockId]) {
              const keyBlock = target.blocks[keyBlockId];
              const key = keyBlock.fields?.KEY_OPTION?.[0];
              if (key) {
                allKeyBlocks.push({
                  type: 'keyPressed',
                  key: key,
                  blockId: blockId,
                  targetName: target.name || 'Stage',
                  isStage: target.isStage,
                  x: block.x || 0,
                  y: block.y || 0
                });
              }
            }
          }
        }
      });
    });
    
    return allKeyBlocks;
  } catch (error) {
    console.error('检测按键积木失败:', error);
    return [];
  }
}

// 获取按键信息报告
getKeyDetectionReport() {
  const keyBlocks = this.detectAllKeyBlocks();
  
  if (keyBlocks.length === 0) {
    return '当前项目中没有检测到按键控制积木';
  }
  
  // 按键统计
  const keyStats = {};
  const targetStats = {};
  
  keyBlocks.forEach(block => {
    // 按键统计
    keyStats[block.key] = (keyStats[block.key] || 0) + 1;
    
    // 角色统计
    const targetKey = block.targetName;
    targetStats[targetKey] = (targetStats[targetKey] || 0) + 1;
  });
  
  // 生成报告
  const uniqueKeys = Object.keys(keyStats);
  const keyList = uniqueKeys.map(key => {
    const displayName = this.getKeyDisplayName(key);
    const count = keyStats[key];
    return `${displayName}(${key})×${count}`;
  }).join(', ');
  
  const targetList = Object.entries(targetStats)
    .map(([target, count]) => `${target}×${count}`)
    .join(', ');
  
  return `检测到 ${keyBlocks.length} 个按键积木\n按键: ${keyList}\n位置: ${targetList}`;
}

// 获取按键显示名称
getKeyDisplayName(key) {
  const displayMap = {
    'space': '空格',
    'up arrow': '↑',
    'down arrow': '↓',
    'left arrow': '←',
    'right arrow': '→',
    'enter': '回车',
    'backspace': '删除',
    'shift': 'Shift',
    'control': 'Ctrl',
    'escape': 'Esc',
    'tab': 'Tab',
    'caps lock': '大写锁定'
  };
  
  return displayMap[key] || key.toUpperCase();
}

// 获取所有检测到的按键（逗号分隔）
getDetectedKeysString() {
  const keyBlocks = this.detectAllKeyBlocks();
  const uniqueKeys = new Set();
  
  keyBlocks.forEach(block => {
    uniqueKeys.add(block.key);
  });
  
  return Array.from(uniqueKeys).join(',');
}

// 获取按键映射JSON
getKeyMappingsJSON() {
  const keyBlocks = this.detectAllKeyBlocks();
  const result = {
    total: keyBlocks.length,
    keys: [],
    blocks: keyBlocks
  };
  
  // 收集所有不重复的按键
  const uniqueKeys = new Set();
  keyBlocks.forEach(block => {
    uniqueKeys.add(block.key);
  });
  
  result.keys = Array.from(uniqueKeys);
  return JSON.stringify(result);
}
}

// 注册扩展
(function() {
  let extensionInstance = null;
  
  const extension = {
    _getTouchExtension: function() {
      if (!extensionInstance) {
        extensionInstance = new AdvancedTouchBlockExtension();
      }
      return extensionInstance;
    },
    
    getInfo: function() {
    const tua="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAAXFkAAFxZAStO/ZEAAAFeSURBVFiF1ZnREYMgDIZDr2PVwXSAOpjuRR8qNgIhiRKh/10fiif5CElIqQNKr7cnn1lonVxuOB28GyxWBPr70hos1gb6aM3B6evB3rwXtE7uDzzYq/c2PWtN5Jfx8hxumJOxaoCUgSC/jMlzPEYtsFkM5oBzqg4o3WoJHIABoBvmLKQUKFbVGKSEgbWgJoAYIo41SWJgmSZJLhFwCLhh3j+Uut/iqh70y8jCSMtL0G2F+qy6bxZYD3KZZuE1LBIQZ1pJ2pjSKttuaY1qO5nbkyTUNspwbgHSHUqSxHrLcvZKOgByXojrHBbVJEhFzS0qM/GLJdDSewD6hbCAmskkxrVeNivUAeSsp4O6P0lYQCppuEagViU4ANZu17W69LPzDOTV0gNQMQatCnwCGFatWbnl6VO83eLOS8l5qq2jB62TY6/fSgbMk2cHBOjvjvC/blixWnuSvESP1cnfEB+gxcI+cSmFjwAAAABJRU5ErkJggg=="; // blockIcon
      const tub="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAAXFkAAFxZAStO/ZEAAABiSURBVFiF7dexCoAwDADRRvz/X46rg0rwMES4t7bDkXbJWpL0qXg6zMxsC4m4bNm6At4aH7hXL949AVH5QuMnaCBlIGUgZSBlIGUgZSBlIGUgNT6wvDR17shn4yc4PlDS3x3S3ww2mxfCIQAAAABJRU5ErkJggg==";
      const tuc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAAXFkAAFxZAStO/ZEAAADJSURBVFiF7ZdRDoAgDEPFeP8rzx9JDBLWzQ5M3PuGtZSRjG1LkiQJpbwtICKiipTi1nFtREx1xRxGzRtac5qodX2LafFdzCrk3Qsv9AiMWgGtYRKynJz1eHaGkBektmqwwk4PBTYYhXaYoUFP77FZnqBGiEEkcfRWwhJktUXoFfdMlgu0xsG19ORtkv98JFORi1V1P5+garA2OTNFSy1TggyT1rkSMngvxEqSOrBWPj3y94QQsamfppEwJDbj29miGV05SyZJkgCc4Dl4J1QvwmIAAAAASUVORK5CYII=";
return {
  id: 'advancedtouchblock',
  name: '高级触屏块与摇杆',
  color1: '#2C2C2C',
  color2: '#1A1A1A',
  color3: '#2196F3',
  blockIconURI: tua,
  docsURI: 'https://b23.tv/5P2xenX',
  blocks: [
    {
      opcode: 'showStageTouch',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#007824',
      text: '显示绿色背景'
    },
    {
      opcode: 'hideStageTouch',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#6C0000',
      text: '隐藏绿色背景'
    },
    {
      opcode: 'hideStageTouchButUsable',
      blockType: Scratch.BlockType.COMMAND,
      text: '隐藏但可用（仅触块器）'
    },
    {
      opcode: 'showAllElements',
      blockType: Scratch.BlockType.COMMAND,
      text: '显示所有元素'
    },
    {
      opcode: 'removeStageTouch',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#FF0000',
      text: '删除所有触控元素'
    },
{
  opcode: 'cacheImage',
  blockType: Scratch.BlockType.COMMAND,
  text: '缓存图片 ID [IMAGE_ID] 数据 [IMAGE_DATA]',
  arguments: {
    IMAGE_ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '图片1'
    },
    IMAGE_DATA: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: ''
    }
  }
},
    '---',
    // 触块器积木组 - 统一使用蓝色和触块器图标
    {
      opcode: 'addTouchBlock',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '添加触块器id[ID]位于X[X]Y[Y]宽度[WIDTH]高度[HEIGHT]颜色[COLOR]边框颜色[BORDERCOLOR]多指触控[MULTITOUCH]最大触摸数[MAXTOUCHES]显示触摸点[SHOWTOUCHPOINT]层级[ZINDEX]文字[TEXT]文字颜色[TEXTCOLOR]文字大小[TEXTSIZE]图片[IMAGE]图片尺寸[IMAGESIZE]图片透明度[IMAGEOPACITY]模拟按键[SIMULATEKEY]按键值[KEYVALUE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        X: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        },
        Y: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        },
        WIDTH: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 100
        },
        HEIGHT: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 50
        },
        COLOR: {
          type: Scratch.ArgumentType.STRING,
          menu: 'colors',
          defaultValue: '#FF0000,0.3'
        },
        BORDERCOLOR: {
          type: Scratch.ArgumentType.STRING,
          menu: 'colors',
          defaultValue: '#FF0000,0.8'
        },
        MULTITOUCH: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        },
        MAXTOUCHES: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 5
        },
        SHOWTOUCHPOINT: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '否'
        },
        ZINDEX: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 1
        },
        TEXT: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮'
        },
        TEXTCOLOR: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '#FFFFFF'
        },
        TEXTSIZE: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 12
        },
        IMAGE: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: ''
        },
        IMAGESIZE: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '100%'
        },
        IMAGEOPACITY: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 1
        },
        SIMULATEKEY: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '否'
        },
        KEYVALUE: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: ' '
        }
      }
    },
    {
      opcode: 'removeTouchBlock',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '删除触块器id[ID]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'setTouchBlockPosition',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '设置触块器id[ID]位置X[X]Y[Y]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        X: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        },
        Y: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        }
      }
    },
{
  opcode: 'setTouchBlockZIndex',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#0154BA',
  blockIconURI: tub,
  text: '设置触块器 id [ID] 层级 [ZINDEX]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '按钮1'
    },
    ZINDEX: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 1
    }
  }
},
    {
      opcode: 'setTouchBlockVisible',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '设置触块器id[ID]显示[VISIBLE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        VISIBLE: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        }
      }
    },
    {
      opcode: 'setTouchBlockText',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '设置触块器id[ID]文字[TEXT]文字颜色[TEXTCOLOR]文字大小[TEXTSIZE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        TEXT: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '新文字'
        },
        TEXTCOLOR: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '#FFFFFF'
        },
        TEXTSIZE: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 12
        }
      }
    },
{
  opcode: 'setTouchBlockImage',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#0154BA',
  blockIconURI: tub,
  text: '设置触块器 id [ID] 图片 [IMAGE] 图片尺寸 [IMAGESIZE] 图片透明度 [IMAGEOPACITY]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '按钮1'
    },
    IMAGE: {
      type: Scratch.ArgumentType.STRING,
      // menu: 'imageIdsMenu', // 可选：添加图片ID菜单
      defaultValue: ''
    },
    IMAGESIZE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '100%'
    },
    IMAGEOPACITY: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 1
    }
  }
},
    {
      opcode: 'setTouchBlockKeySimulation',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '设置触块器id[ID]模拟按键[ENABLED]按键值[KEYVALUE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        ENABLED: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        },
        KEYVALUE: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: ' '
        }
      }
    },
    {
      opcode: 'touchBlockExists',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]存在?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'isTouchBlockTouching',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]被触摸?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'isTouchClick',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]手指id[TOUCHID]点击了?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        TOUCHID: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        }
      }
    },
    {
      opcode: 'isTouchBlockPressingKey',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]正在模拟按键?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'getTouchBlockTouchIds',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]的所有手指id',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'getFirstTouchId',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]的第一个手指id',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'getTouchCount',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]的手指数量',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'getActiveTouchCount',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]活动触摸数',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        }
      }
    },
    {
      opcode: 'getTouchValue',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '触块器id[ID]手指id[TOUCHID]的[DATATYPE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '按钮1'
        },
        TOUCHID: {
          type: Scratch.ArgumentType.NUMBER,
          defaultValue: 0
        },
        DATATYPE: {
          type: Scratch.ArgumentType.STRING,
          menu: 'dataTypeMenu',
          defaultValue: 'screenX'
        }
      }
    },
    {
      opcode: 'getAllTouchBlockIds',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#0154BA',
      blockIconURI: tub,
      text: '所有触块器id'
    },
    '---',
    // 摇杆积木组 - 统一使用青色和摇杆图标
{
  opcode: 'addJoystick',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#006D78',
  blockIconURI: tuc,
  text: '添加摇杆 id [ID] 位于 X [X] Y [Y] 外圈大小 [OUTERSIZE] 内圈大小 [INNERSIZE] 外圈颜色 [OUTERCOLOR] 内圈颜色 [INNERCOLOR] 模拟按键 [SIMULATEKEYS] ↓ [KEYUP] ↑ [KEYDOWN] ← [KEYLEFT] → [KEYRIGHT] 层级 [ZINDEX]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '摇杆1'
    },
    X: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 0
    },
    Y: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 0
    },
    OUTERSIZE: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 100
    },
    INNERSIZE: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 40
    },
    OUTERCOLOR: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '#000000,0.5'
    },
    INNERCOLOR: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '#FFFFFF,0.8'
    },
    SIMULATEKEYS: {
      type: Scratch.ArgumentType.STRING,
      menu: 'booleanMenu',
      defaultValue: '否'
    },
    KEYUP: {
      type: Scratch.ArgumentType.STRING,
      menu: 'keysMenu',
      defaultValue: 'ArrowDown'
    },
    KEYDOWN: {
      type: Scratch.ArgumentType.STRING,
      menu: 'keysMenu',
      defaultValue: 'ArrowUp'
    },
    KEYLEFT: {
      type: Scratch.ArgumentType.STRING,
      menu: 'keysMenu',
      defaultValue: 'ArrowLeft'
    },
    KEYRIGHT: {
      type: Scratch.ArgumentType.STRING,
      menu: 'keysMenu',
      defaultValue: 'ArrowRight'
    },
    ZINDEX: {  // 新增层级参数
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 2
    }
  }
},
{
  opcode: 'setJoystickPosition',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#006D78',
  blockIconURI: tuc,
  text: '设置摇杆 id [ID] 位置 X [X] Y [Y]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '摇杆1'
    },
    X: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 0
    },
    Y: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 0
    }
  }
},
{
  opcode: 'setJoystickZIndex',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#006D78',
  blockIconURI: tuc,
  text: '设置摇杆 id [ID] 层级 [ZINDEX]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '摇杆1'
    },
    ZINDEX: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 9999
    }
  }
},
    {
      opcode: 'setJoystickEightDirections',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '设置摇杆id[ID]按键映射为八方向[EIGHTDIRECTIONS]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        },
        EIGHTDIRECTIONS: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        }
      }
    },
    {
      opcode: 'removeJoystick',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '删除摇杆id[ID]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'setJoystickVisible',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '设置摇杆id[ID]显示[VISIBLE]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        },
        VISIBLE: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        }
      }
    },
    {
      opcode: 'setJoystickKeySimulation',
      blockType: Scratch.BlockType.COMMAND,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '设置摇杆id[ID]模拟按键[ENABLED]↓[KEYUP]↑[KEYDOWN]←[KEYLEFT]→[KEYRIGHT]',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        },
        ENABLED: {
          type: Scratch.ArgumentType.STRING,
          menu: 'booleanMenu',
          defaultValue: '是'
        },
        KEYUP: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: 'ArrowDown'
        },
        KEYDOWN: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: 'ArrowUp'
        },
        KEYLEFT: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: 'ArrowLeft'
        },
        KEYRIGHT: {
          type: Scratch.ArgumentType.STRING,
          menu: 'keysMenu',
          defaultValue: 'ArrowRight'
        }
      }
    },
{
  opcode: 'setJoystickOuterImage',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#006D78',
  blockIconURI: tuc,
  text: '设置摇杆 id [ID] 外圈图片 [OUTER_IMAGE] 图片尺寸 [OUTER_SIZE] 图片透明度 [OUTER_OPACITY]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '摇杆1'
    },
    OUTER_IMAGE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: ''
    },
    OUTER_SIZE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '100%'
    },
    OUTER_OPACITY: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 1
    }
  }
},
{
  opcode: 'setJoystickInnerImage',
  blockType: Scratch.BlockType.COMMAND,
  color1: '#006D78',
  blockIconURI: tuc,
  text: '设置摇杆 id [ID] 内圈图片 [INNER_IMAGE] 图片尺寸 [INNER_SIZE] 图片透明度 [INNER_OPACITY]',
  arguments: {
    ID: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '摇杆1'
    },
    INNER_IMAGE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: ''
    },
    INNER_SIZE: {
      type: Scratch.ArgumentType.STRING,
      defaultValue: '100%'
    },
    INNER_OPACITY: {
      type: Scratch.ArgumentType.NUMBER,
      defaultValue: 1
    }
  }
},
    {
      opcode: 'joystickExists',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]存在?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'isJoystickActive',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]正在使用?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'isJoystickPressingKey',
      blockType: Scratch.BlockType.BOOLEAN,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]正在模拟按键?',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'getJoystickX',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]X方向值',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'getJoystickY',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]Y方向值',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'getJoystickAngle',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]角度',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'getJoystickDistance',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]距离',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        }
      }
    },
    {
      opcode: 'getJoystickDirectionKey',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '摇杆id[ID]的[DIRECTION]按键',
      arguments: {
        ID: {
          type: Scratch.ArgumentType.STRING,
          defaultValue: '摇杆1'
        },
        DIRECTION: {
          type: Scratch.ArgumentType.STRING,
          menu: 'directionMenu',
          defaultValue: 'up'
        }
      }
    },
    {
      opcode: 'getAllJoystickIds',
      blockType: Scratch.BlockType.REPORTER,
      color1: '#006D78',
      blockIconURI: tuc,
      text: '所有摇杆id'
    },
    '---',
    // 通用数据积木
    {
      opcode: 'getUnifiedTouchData',
      blockType: Scratch.BlockType.REPORTER,
      text: '获取统一触摸数据JSON'
    },
{
  opcode: 'getAllCachedImageIds',
  blockType: Scratch.BlockType.REPORTER,
  text: '获取所有缓存图片ID'
},
// 在 getInfo() 方法的 blocks 数组中添加：
{
  opcode: 'getAllDomElementsInfo',
  blockType: Scratch.BlockType.REPORTER,
  text: '获取所有DOM元素信息'
},
// 在 getInfo() 的 blocks 数组中添加：
{
  opcode: 'detectKeyBlocks',
  blockType: Scratch.BlockType.REPORTER,
  text: '检测项目中的按键积木'
},
{
  opcode: 'getDetectedKeys',
  blockType: Scratch.BlockType.REPORTER,
  text: '获取所有检测到的按键'
},
{
  opcode: 'getKeyMappingsJSON',
  blockType: Scratch.BlockType.REPORTER,
  text: '获取按键映射JSON'
}
  ],
        menus: {
          booleanMenu: {
            items: ['是', '否']
          },
          dataTypeMenu: {
            items: [
              { text: '在舞台的坐标X', value: 'screenX' },
              { text: '在舞台的坐标Y', value: 'screenY' },
              { text: '相对于该触块的X', value: 'areaX' },
              { text: '相对于该触块的Y', value: 'areaY' },
              { text: '移动距离X', value: 'deltaX' },
              { text: '移动距离Y', value: 'deltaY' },
              { text: '瞬时变化X', value: 'instantDeltaX' },
              { text: '瞬时变化Y', value: 'instantDeltaY' }
            ]
          },
          colors: {
            items: [
              '#FF0000,0.3',
              '#00FF00,0.3', 
              '#0000FF,0.3',
              '#FFFF00,0.3',
              '#FF00FF,0.3',
              '#00FFFF,0.3',
              '#FFA500,0.3',
              '#800080,0.3',
              '#FFC0CB,0.3',
              '#A52A2A,0.3'
            ]
          },
          keysMenu: {
            acceptReporters: true,
            items: [
              { text: '空格', value: ' ' },
              { text: '↑', value: 'ArrowUp' },
              { text: '↓', value: 'ArrowDown' },
              { text: '→', value: 'ArrowRight' },
              { text: '←', value: 'ArrowLeft' },
              { text: '回车', value: 'Enter' },
              { text: '退格', value: 'Backspace' },
              { text: '删除', value: 'Delete' },
              { text: 'Shift', value: 'Shift' },
              { text: 'Ctrl', value: 'Control' },
              { text: 'Esc', value: 'Escape' },
              'a','b','c','d','e','f','g','h','i','j','k','l','m',
              'n','o','p','q','r','s','t','u','v','w','x','y','z',
              '0','1','2','3','4','5','6','7','8','9'
            ]
          },
          directionMenu: {
            items: [
              { text: '上', value: 'up' },
              { text: '下', value: 'down' },
              { text: '左', value: 'left' },
              { text: '右', value: 'right' }
            ]
          }
        }
      };
    },

getAllDomElementsInfo: function() {
  return this._getTouchExtension().getAllDomElementsInfo();
},
    // 基础控制方法
    showStageTouch: function() {
      this._getTouchExtension().showStageTouchArea();
    },
    
    hideStageTouch: function() {
      this._getTouchExtension().hideStageTouchArea();
    },
    
    hideStageTouchButUsable: function() {
      this._getTouchExtension().hideStageTouchAreaButUsable();
    },
    
    removeStageTouch: function() {
      this._getTouchExtension().removeStageTouchArea();
    },
    
    // 触块器方法
    addTouchBlock: function(args) {
      const extension = this._getTouchExtension();
      extension.removeTouchBlock(args.ID);
      
      return extension.addTouchBlock(
        args.ID,
        Number(args.X),
        Number(args.Y), 
        Number(args.WIDTH),
        Number(args.HEIGHT),
        args.COLOR,
        args.BORDERCOLOR,
        args.MULTITOUCH === '是',
        Number(args.MAXTOUCHES),
        args.SHOWTOUCHPOINT === '是',
        Number(args.ZINDEX),
        args.TEXT,
        args.TEXTCOLOR,
        Number(args.TEXTSIZE),
        args.IMAGE,
        args.IMAGESIZE,
        Number(args.IMAGEOPACITY),
        args.SIMULATEKEY === '是',
        args.KEYVALUE
      );
    },
    
    setTouchBlockPosition: function(args) {
      const extension = this._getTouchExtension();
      const blockInfo = extension.touchBlocks.get(args.ID);
      if (!blockInfo) return false;
      
      blockInfo.x = Number(args.X);
      blockInfo.y = Number(args.Y);
      
      extension.updateTouchBlockPosition(args.ID);
      return true;
    },
    
    removeTouchBlock: function(args) {
      return this._getTouchExtension().removeTouchBlock(args.ID);
    },
    
    setTouchBlockVisible: function(args) {
      return this._getTouchExtension().setTouchBlockVisible(args.ID, args.VISIBLE === '是');
    },
    
    setTouchBlockText: function(args) {
      this._getTouchExtension().setTouchBlockText(
        args.ID,
        args.TEXT,
        args.TEXTCOLOR,
        Number(args.TEXTSIZE)
      );
    },
    
setTouchBlockImage: function(args) {
  this._getTouchExtension().setTouchBlockImage(
    args.ID,
    args.IMAGE,
    args.IMAGESIZE,
    Number(args.IMAGEOPACITY)
  );
},
    
    setTouchBlockKeySimulation: function(args) {
      this._getTouchExtension().setTouchBlockKeySimulation(
        args.ID,
        args.ENABLED === '是',
        args.KEYVALUE
      );
    },
    
    touchBlockExists: function(args) {
      return this._getTouchExtension().touchBlockExists(args.ID);
    },
    
    isTouchBlockTouching: function(args) {
      return this._getTouchExtension().isTouchBlockTouching(args.ID);
    },
    
    isTouchClick: function(args) {
      const extension = this._getTouchExtension();
      const cacheKey = `${args.ID}-${args.TOUCHID}`;
      const cachedClick = extension.clickCache.get(cacheKey);
      
      if (cachedClick) {
        if (Date.now() - cachedClick.timestamp < 500) {
          extension.clickCache.delete(cacheKey);
          return true;
        } else {
          extension.clickCache.delete(cacheKey);
        }
      }
      
      return false;
    },
    
    isTouchBlockPressingKey: function(args) {
      const extension = this._getTouchExtension();
      const blockInfo = extension.touchBlocks.get(args.ID);
      return blockInfo ? blockInfo.keyPressed : false;
    },
    
    getActiveTouchCount: function(args) {
      return this._getTouchExtension().getActiveTouchCount(args.ID);
    },
    
    getTouchValue: function(args) {
      const extension = this._getTouchExtension();
      return extension.getTouchDataFromUnified(args.ID, args.TOUCHID, args.DATATYPE);
    },
    
    getAllTouchBlockIds: function() {
      const ids = this._getTouchExtension().getAllTouchBlockIds();
      return ids.join(',');
    },
    
    // 摇杆方法
addJoystick: function(args) {
  const extension = this._getTouchExtension();
  extension.removeJoystick(args.ID);
  
  return extension.addJoystick(
    args.ID,
    Number(args.X),
    Number(args.Y),
    Number(args.OUTERSIZE),
    Number(args.INNERSIZE),
    args.OUTERCOLOR,
    args.INNERCOLOR,
    args.SIMULATEKEYS === '是',
    args.KEYUP,
    args.KEYDOWN,
    args.KEYLEFT,
    args.KEYRIGHT,
    Number(args.ZINDEX)  // 新增：层级参数
  );
},
    
    setJoystickEightDirections: function(args) {
      this._getTouchExtension().setJoystickEightDirections(
        args.ID,
        args.EIGHTDIRECTIONS === '是'
      );
    },
    
    removeJoystick: function(args) {
      return this._getTouchExtension().removeJoystick(args.ID);
    },
    
    setJoystickVisible: function(args) {
      return this._getTouchExtension().setJoystickVisible(args.ID, args.VISIBLE === '是');
    },
    
    setJoystickKeySimulation: function(args) {
      this._getTouchExtension().setJoystickKeySimulation(
        args.ID,
        args.ENABLED === '是',
        args.KEYUP,
        args.KEYDOWN,
        args.KEYLEFT,
        args.KEYRIGHT,
        false
      );
    },
    
    joystickExists: function(args) {
      return this._getTouchExtension().joystickExists(args.ID);
    },
    
    isJoystickActive: function(args) {
      return this._getTouchExtension().isJoystickActive(args.ID);
    },
    
    isJoystickPressingKey: function(args) {
      return this._getTouchExtension().isJoystickPressingKey(args.ID);
    },
    
    getJoystickX: function(args) {
      return this._getTouchExtension().getJoystickX(args.ID);
    },
    
    getJoystickY: function(args) {
      return this._getTouchExtension().getJoystickY(args.ID);
    },
    
    getJoystickAngle: function(args) {
      return this._getTouchExtension().getJoystickAngle(args.ID);
    },
    
    getJoystickDistance: function(args) {
      return this._getTouchExtension().getJoystickDistance(args.ID);
    },
    
    getJoystickDirectionKey: function(args) {
      return this._getTouchExtension().getJoystickDirectionKey(args.ID, args.DIRECTION);
    },
    
    getAllJoystickIds: function() {
      const ids = this._getTouchExtension().getAllJoystickIds();
      return ids.join(',');
    },
    
    // 数据方法
    getUnifiedTouchData: function() {
      const extension = this._getTouchExtension();
      return extension.getUnifiedTouchDataJSON();
    },
showAllElements: function() {
  this._getTouchExtension().showAllElements();
},

getTouchBlockTouchIds: function(args) {
  const ids = this._getTouchExtension().getTouchBlockTouchIds(args.ID);
  return ids.join(',');
},

getFirstTouchId: function(args) {
  return this._getTouchExtension().getFirstTouchId(args.ID);
},

getTouchCount: function(args) {
  return this._getTouchExtension().getTouchCount(args.ID);
},
setTouchBlockZIndex: function(args) {
  const extension = this._getTouchExtension();
  const blockInfo = extension.touchBlocks.get(args.ID);
  if (blockInfo) {
    extension.setTouchBlockZIndex(args.ID, Number(args.ZINDEX));
    return true;
  }
  return false;
},
getAllCachedImageIds: function() {
  const extension = this._getTouchExtension();
  const imageIds = Array.from(extension.imageCache.keys());
  return imageIds.join(',');
},
setJoystickInnerImage: function(args) {
  const extension = this._getTouchExtension();
  return extension.setJoystickInnerImage(
    args.ID,
    args.INNER_IMAGE,
    args.INNER_SIZE,
    Number(args.INNER_OPACITY)
  );
},
setJoystickOuterImage: function(args) {
  const extension = this._getTouchExtension();
  return extension.setJoystickOuterImage(
    args.ID,
    args.OUTER_IMAGE,
    args.OUTER_SIZE,
    Number(args.OUTER_OPACITY)
  );
},
setJoystickPosition: function(args) {
  const extension = this._getTouchExtension();
  return extension.setJoystickPosition(
    args.ID,
    Number(args.X),
    Number(args.Y)
  );
},
setJoystickZIndex: function(args) {
  const extension = this._getTouchExtension();
  return extension.setJoystickZIndex(args.ID, Number(args.ZINDEX));
},
cacheImage: function(args) {
  const extension = this._getTouchExtension();
  return extension.cacheImage(args.IMAGE_ID, args.IMAGE_DATA);
},
// 在 extension 对象中添加对应的方法：
detectKeyBlocks: function() {
  const extension = this._getTouchExtension();
  return extension.getKeyDetectionReport();
},

getDetectedKeys: function() {
  const extension = this._getTouchExtension();
  return extension.getDetectedKeysString();
},

getKeyMappingsJSON: function() {
  const extension = this._getTouchExtension();
  return extension.getKeyMappingsJSON();
}
  };
  
  Scratch.extensions.register(extension);
})();
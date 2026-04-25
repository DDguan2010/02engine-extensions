// Name: Iframe
// ID: iframe
// Description: 显示网页或HTML覆盖舞台，支持多窗口管理
// License: MIT AND MPL-2.0

(function (Scratch) {
  "use strict";

  /** @type {Object.<string, {iframe: HTMLIFrameElement, overlay: any, name: string, url: string, visible: boolean, interactive: boolean, resizeBehavior: string, x: number, y: number, width: number, height: number}>} */
  let iframes = {};
  let currentUserAgent = "default";

  const featurePolicy = {
    accelerometer: "'none'",
    "ambient-light-sensor": "'none'",
    battery: "'none'",
    camera: "'none'",
    "display-capture": "'none'",
    "document-domain": "'none'",
    "encrypted-media": "'none'",
    fullscreen: "'none'",
    geolocation: "'none'",
    gyroscope: "'none'",
    magnetometer: "'none'",
    microphone: "'none'",
    midi: "'none'",
    payment: "'none'",
    "picture-in-picture": "'none'",
    "publickey-credentials-get": "'none'",
    "speaker-selection": "'none'",
    usb: "'none'",
    vibrate: "'none'",
    vr: "'none'",
    "screen-wake-lock": "'none'",
    "web-share": "'none'",
    "interest-cohort": "'none'",
  };

  const SANDBOX = [
    "allow-same-origin",
    "allow-scripts",
    "allow-forms",
    "allow-modals",
    "allow-popups",
    "allow-downloads",
    "allow-pointer-lock"
  ];

  const getOverlayMode = (resizeBehavior) =>
    resizeBehavior === "scale" ? "scale-centered" : "manual";

  const createFrame = (src, name, isHTMLContent = false) => {
    // 如果同名的iframe已存在，先关闭它
    if (iframes[name]) {
      closeFrame(name);
    }

    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    
    // 设置sandbox属性，允许更多交互功能
    iframe.setAttribute("sandbox", SANDBOX.join(" "));
    iframe.setAttribute(
      "allow",
      Object.entries(featurePolicy)
        .map(([name, permission]) => `${name} ${permission}`)
        .join("; ")
    );
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("allowfullscreen", "false");
    
    // 设置User-Agent
    if (currentUserAgent === "desktop") {
      iframe.setAttribute("sandbox", SANDBOX.concat("allow-same-origin").join(" "));
    } else if (currentUserAgent === "mobile") {
      iframe.setAttribute("sandbox", SANDBOX.concat("allow-same-origin").join(" "));
    }
    
    // 修复链接跳转问题
    iframe.addEventListener("load", () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const links = iframeDoc.querySelectorAll("a");
        
        links.forEach(link => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) {
              // 在同一个iframe中打开链接
              iframe.contentWindow.location.href = href;
            }
          });
          
          // 移除target属性防止新窗口打开
          link.removeAttribute("target");
        });
      } catch (error) {
        // 跨域问题，无法访问iframe内部
      }
    });

    if (isHTMLContent) {
      // 对于HTML内容，使用srcdoc属性而不是src
      iframe.setAttribute("srcdoc", src);
      iframe.setAttribute("src", "about:blank"); // 防止某些浏览器的安全限制
    } else {
      iframe.setAttribute("src", src);
    }

    const overlay = Scratch.renderer.addOverlay(iframe, getOverlayMode("scale"));
    
    iframes[name] = {
      iframe,
      overlay,
      name,
      url: src,
      visible: true,
      interactive: true,
      resizeBehavior: "scale",
      x: 0,
      y: 0,
      width: Scratch.vm.runtime.stageWidth,
      height: Scratch.vm.runtime.stageHeight
    };

    updateFrameAttributes(name);
  };

  const closeFrame = (name) => {
    if (iframes[name]) {
      Scratch.renderer.removeOverlay(iframes[name].iframe);
      delete iframes[name];
    }
  };

  const updateFrameAttributes = (name) => {
    if (!iframes[name]) return;

    const { iframe, x, y, width, height, interactive, resizeBehavior } = iframes[name];
    
    iframe.style.pointerEvents = interactive ? "auto" : "none";
    iframe.style.display = iframes[name].visible ? "" : "none";

    const { stageWidth, stageHeight } = Scratch.vm.runtime;
    const effectiveWidth = width >= 0 ? width : stageWidth;
    const effectiveHeight = height >= 0 ? height : stageHeight;

    if (resizeBehavior === "scale") {
      iframe.style.width = `${effectiveWidth}px`;
      iframe.style.height = `${effectiveHeight}px`;

      iframe.style.transform = `translate(${-effectiveWidth / 2 + x}px, ${
        -effectiveHeight / 2 - y
      }px)`;
      iframe.style.top = "0";
      iframe.style.left = "0";
    } else {
      // As the stage is resized in fullscreen mode, only % can be relied upon
      iframe.style.width = `${(effectiveWidth / stageWidth) * 100}%`;
      iframe.style.height = `${(effectiveHeight / stageHeight) * 100}%`;

      iframe.style.transform = "";
      iframe.style.top = `${
        (0.5 - effectiveHeight / 2 / stageHeight - y / stageHeight) * 100
      }%`;
      iframe.style.left = `${
        (0.5 - effectiveWidth / 2 / stageWidth + x / stageWidth) * 100
      }%`;
    }
    
    if (overlay) {
      overlay.mode = getOverlayMode(resizeBehavior);
      Scratch.renderer._updateOverlays();
    }
  };

  const updateAllFrames = () => {
    Object.keys(iframes).forEach(name => {
      updateFrameAttributes(name);
    });
  };

  Scratch.vm.on("STAGE_SIZE_CHANGED", updateAllFrames);

  Scratch.vm.runtime.on("RUNTIME_DISPOSED", () => {
    Object.keys(iframes).forEach(name => {
      closeFrame(name);
    });
  });

  class IframeExtension {
    getInfo() {
      return {
        name: "Iframe",
        id: "iframe",
        color1: "#4B8BBE",
        color2: "#306998",
        blocks: [
          {
            opcode: "display",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示来自URL [URL] 的网页并且命名成 [NAME]",
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://extensions.turbowarp.org/hello.html",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          {
            opcode: "displayHTML",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示HTML [HTML] 并且命名成 [NAME]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "<h1>你好!</h1><button onclick=\"alert('按钮被点击!')\">点击我</button>",
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "HTML页面",
              }
            },
          },
          "---",
          {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示名字为 [NAME] 的网页",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "隐藏名字为 [NAME] 的网页",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          {
            opcode: "close",
            blockType: Scratch.BlockType.COMMAND,
            text: "退出名字为 [NAME] 的网页",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          "---",
          {
            opcode: "showUrl",
            blockType: Scratch.BlockType.REPORTER,
            text: "显示名字为 [NAME] 的网页的网址",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          {
            opcode: "isLoaded",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "名字为 [NAME] 的网页加载成功？",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          {
            opcode: "refresh",
            blockType: Scratch.BlockType.COMMAND,
            text: "刷新名字为 [NAME] 的网页",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              }
            },
          },
          "---",
          {
            opcode: "closeAll",
            blockType: Scratch.BlockType.COMMAND,
            text: "退出所有网页",
          },
          {
            opcode: "hideAll",
            blockType: Scratch.BlockType.COMMAND,
            text: "隐藏所有的网页",
          },
          "---",
          {
            opcode: "setUserAgent",
            blockType: Scratch.BlockType.COMMAND,
            text: "访问 [TYPE] 版网页",
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "userAgentMenu",
              },
            },
          },
          "---",
          {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页 x 坐标为 [X]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          },
          {
            opcode: "setY",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页 y 坐标为 [Y]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          },
          {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页宽度为 [WIDTH]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageWidth,
              },
            },
          },
          {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页高度为 [HEIGHT]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: Scratch.vm.runtime.stageHeight,
              },
            },
          },
          {
            opcode: "setInteractive",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页交互性为 [INTERACTIVE]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              INTERACTIVE: {
                type: Scratch.ArgumentType.STRING,
                menu: "interactiveMenu",
              },
            },
          },
          {
            opcode: "setResize",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置名字为 [NAME] 的网页调整行为为 [RESIZE]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "网页1",
              },
              RESIZE: {
                type: Scratch.ArgumentType.STRING,
                menu: "resizeMenu",
              },
            },
          },
        ],
        menus: {
          userAgentMenu: {
            acceptReporters: true,
            items: [
              {
                text: "电脑",
                value: "desktop",
              },
              {
                text: "手机",
                value: "mobile",
              },
              {
                text: "默认",
                value: "default",
              }
            ],
          },
          interactiveMenu: {
            acceptReporters: true,
            items: ["true", "false"],
          },
          resizeMenu: {
            acceptReporters: true,
            items: [
              {
                text: "缩放",
                value: "scale",
              },
              {
                text: "视口",
                value: "viewport",
              },
            ],
          },
        },
      };
    }

    async display({ URL, NAME }) {
      const url = Scratch.Cast.toString(URL);
      const name = Scratch.Cast.toString(NAME);
      
      if (await Scratch.canEmbed(url)) {
        createFrame(url, name);
      }
    }

    async displayHTML({ HTML, NAME }) {
      const html = Scratch.Cast.toString(HTML);
      const name = Scratch.Cast.toString(NAME);
      
      // 使用srcdoc属性而不是data URL，这样JavaScript可以正常运行
      createFrame(html, name, true);
    }

    show({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].visible = true;
        updateFrameAttributes(name);
      }
    }

    hide({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].visible = false;
        updateFrameAttributes(name);
      }
    }

    close({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      closeFrame(name);
    }

    showUrl({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        return iframes[name].url;
      }
      return "";
    }

    isLoaded({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        const iframe = iframes[name].iframe;
        try {
          // 检查iframe是否已加载完成
          return iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete';
        } catch (e) {
          // 跨域情况下无法访问内容，但可以检查iframe的readyState
          return iframe.readyState === 'complete';
        }
      }
      return false;
    }

    refresh({ NAME }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        const iframe = iframes[name].iframe;
        try {
          iframe.contentWindow.location.reload();
        } catch (error) {
          // 跨域问题，重新加载URL
          const url = iframe.src;
          iframe.src = "";
          setTimeout(() => {
            iframe.src = url;
          }, 10);
        }
      }
    }

    closeAll() {
      Object.keys(iframes).forEach(name => {
        closeFrame(name);
      });
    }

    hideAll() {
      Object.keys(iframes).forEach(name => {
        iframes[name].visible = false;
        updateFrameAttributes(name);
      });
    }

    setUserAgent({ TYPE }) {
      currentUserAgent = Scratch.Cast.toString(TYPE);
    }

    setX({ NAME, X }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].x = Scratch.Cast.toNumber(X);
        updateFrameAttributes(name);
      }
    }

    setY({ NAME, Y }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].y = Scratch.Cast.toNumber(Y);
        updateFrameAttributes(name);
      }
    }

    setWidth({ NAME, WIDTH }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].width = Scratch.Cast.toNumber(WIDTH);
        updateFrameAttributes(name);
      }
    }

    setHeight({ NAME, HEIGHT }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].height = Scratch.Cast.toNumber(HEIGHT);
        updateFrameAttributes(name);
      }
    }

    setInteractive({ NAME, INTERACTIVE }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name]) {
        iframes[name].interactive = Scratch.Cast.toBoolean(INTERACTIVE);
        updateFrameAttributes(name);
      }
    }

    setResize({ NAME, RESIZE }) {
      const name = Scratch.Cast.toString(NAME);
      if (iframes[name] && (RESIZE === "scale" || RESIZE === "viewport")) {
        iframes[name].resizeBehavior = RESIZE;
        updateFrameAttributes(name);
      }
    }
  }

  Scratch.extensions.register(new IframeExtension());
})(Scratch);
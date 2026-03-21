// Name: Shovel Debugger + Code Cleaner Panel
// By: TheShovel + integrated cleaner
// License: MIT

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed)
    throw new Error("Debugger extension must be run unsandboxed");
  if (!vm.runtime.ext_pen)
    vm.runtime.extensionManager.loadExtensionIdSync("pen");

  const oldStamp = vm.runtime.ext_pen._stamp;
  let stampsPerFrame = 0;
  vm.runtime.ext_pen._stamp = function (target) {
    stampsPerFrame += 1;
    oldStamp.call(this, target);
  };

  const oldStepThread = vm.runtime.sequencer.stepThread;
  let _threadExecutionTimes = {};
  vm.runtime.sequencer.stepThread = function (e) {
    const startTime = performance.now();
    oldStepThread.call(this, e);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    const variableName = `thread_${e.topBlock}_executionTime`;
    _threadExecutionTimes[variableName] = executionTime;
  };

  const oldSetTarget = vm.runtime.setEditingTarget;
  vm.runtime.setEditingTarget = function (editingTarget) {
    if (
      typeof vm.runtime.ext_DebuggerExtensionTS?._updateThreadViewer ===
      "function"
    ) {
      vm.runtime.ext_DebuggerExtensionTS._updateThreadViewer(true);
    }
    oldSetTarget.call(this, editingTarget);
  };

  const COLOR_TOKEN_PREFIX = "[__COLOR:";
  const COLOR_TOKEN_SUFFIX = "__]";
  const COLOR_TOKEN_END = "[__END__]";

  const SVG_PAUSE = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
    </svg>`;

  const SVG_PLAY = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
        <path d="M8 5v14l11-7z" />
    </svg>`;

  const SVG_SCROLL_DOWN = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
        <path d="M12 16.59l4.59-4.59L18 13l-6 6-6-6 1.41-1.41L12 16.59z" />
    </svg>`;

  const SVG_EXPORT = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>`;

  const SVG_CLOSE = `
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>`;

  const SVG_DEBUGGER_ICON = `
    <svg viewBox="0 0 24 24" fill="#4C97FF" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;">
      <path d="M20 8h-2.1a6.96 6.96 0 0 0-1.2-2.2l1.5-1.5-1.4-1.4-1.7 1.7A6.97 6.97 0 0 0 12 4c-1.1 0-2.1.3-3 .7L7.3 3 5.9 4.4l1.5 1.5C6.9 6.5 6.5 7.2 6.3 8H4v2h2v2H4v2h2.3c.2.8.6 1.5 1.1 2.1l-1.5 1.5 1.4 1.4 1.7-1.7c.9.4 1.9.7 3 .7 1.1 0 2.1-.3 3-.7l1.7 1.7 1.4-1.4-1.5-1.5c.5-.6.9-1.3 1.1-2.1H20v-2h-2v-2h2V8zM8 14V9h8v5H8zm2-3h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
    </svg>`;

  class DebuggerExtensionTS {
    runtime = Scratch.vm.runtime;

    debuggerWindow = null;
    logContentArea = null;
    profilerContentArea = null;
    threadContentArea = null;
    variablesContentArea = null;
    variablesTableContainer = null;
    scrollToBottomButton = null;
    pauseButton = null;

    listsContentArea = null;
    listsTableContainer = null;
    listSearchQuery = "";
    listsOld = null;
    listsCountLabel = null;

    codeSearchContentArea = null;
    codeSearchInput = null;
    codeSearchResultsContainer = null;
    codeSearchQuery = "";
    codeSearchOld = null;
    codeSearchCountLabel = null;

    cleanerContentArea = null;
    cleanerResultsContainer = null;
    cleanerOld = null;
    cleanerSelected = new Set();

    logEntries = [];
    LOG_LIMIT = 10000;
    scrollSizer = null;
    logContainer = null;
    averageEntryHeight = 18;
    renderBufferSize = 50;
    userScrolledUp = false;

    historyLength = 600;
    sampleIntervalMs = 100;
    lastSampleTime = 0;

    fpsHistory = null;
    writeIndex = 0;
    smoothingWindow = 5;

    fpsCanvas = null;
    fpsCtx = null;
    fpsTooltip = null;

    stampsPerFrameHistory = null;
    stampsPerFrameCanvas = null;
    stampsPerFrameCtx = null;
    stampsPerFrameTooltip = null;

    threadsOld = null;
    variablesOld = null;
    performanceMode = false;
    variableSearchQuery = "";

    packaged = typeof scaffolding !== "undefined";

    constructor() {
      this.fpsHistory = new Array(this.historyLength).fill(0);
      this.stampsPerFrameHistory = new Array(this.historyLength).fill(0);
      const oldStep = this.runtime._step;
      let lastFrame = performance.now();

      this.runtime._step = () => {
        oldStep.call(this.runtime);
        const t1 = performance.now();

        const frameDelta = t1 - lastFrame;
        lastFrame = t1;
        const fpsInstant = frameDelta > 0 ? 1000 / frameDelta : 0;

        const lastFps =
          this.fpsHistory[
            (this.writeIndex - 1 + this.historyLength) % this.historyLength
          ] || 0;
        const smoothedFps = lastFps + (fpsInstant - lastFps) * 0.25;

        this._maybeSample(t1, smoothedFps, stampsPerFrame);
        stampsPerFrame = 0;
        this._updateThreadViewer();
      };

      if (!this.debuggerWindow) this._createWindow();
      this.runtime.ext_DebuggerExtensionTS = this;
    }

    getInfo() {
      return {
        id: "DebuggerExtensionTS",
        name: "调试器",
        blocks: [
          {
            opcode: "log",
            blockType: Scratch.BlockType.COMMAND,
            text: "输出日志 [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "你好",
              },
            },
          },
          {
            opcode: "coloredText",
            blockType: Scratch.BlockType.REPORTER,
            text: "文本 [TEXT] 颜色 [COLOR]",
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: "文本" },
              COLOR: {
                type: Scratch.ArgumentType.COLOR,
                defaultValue: "#FF0000",
              },
            },
          },
          {
            opcode: "clear",
            blockType: Scratch.BlockType.COMMAND,
            text: "清空日志",
          },

          "---",
          {
            opcode: "commandWasRan",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "运行过命令？",
            disableMonitor: true,
          },
          {
            opcode: "getCommand",
            blockType: Scratch.BlockType.REPORTER,
            text: "命令",
            disableMonitor: true,
          },
          {
            opcode: "pause",
            blockType: Scratch.BlockType.COMMAND,
            text: "暂停调试",
          },
          "---",
          {
            opcode: "showDebugger",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示调试器",
          },
          {
            opcode: "hideDebugger",
            blockType: Scratch.BlockType.COMMAND,
            text: "隐藏调试器",
          },

          
    
        ],
      };
    }

    coloredText({ TEXT, COLOR }) {
      return `${COLOR_TOKEN_PREFIX}${COLOR}${COLOR_TOKEN_SUFFIX}${TEXT}${COLOR_TOKEN_END}`;
    }

    hideDebugger() {
      if (this.debuggerWindow) {
        this.debuggerWindow.style.pointerEvents = "none";
        this.debuggerWindow.style.opacity = "0";
        this.debuggerWindow.style.transform = "scale(0.95)";
        this.debuggerWindow.style.transition = "all 0.2s ease-in-out";
        setTimeout(() => {
          this.debuggerWindow.style.display = "none";
          this.debuggerWindow.style.pointerEvents = "";
          this.debuggerWindow.style.transition = "";
        }, 200);
      }
    }

    showDebugger() {
      if (this.debuggerWindow) {
        this.debuggerWindow.style.display = "flex";
        this.debuggerWindow.style.opacity = "0";
        this.debuggerWindow.style.transform = "scale(0.95)";
        this.debuggerWindow.style.transition = "all 0.2s ease-out";
        this.debuggerWindow.offsetHeight;
        this.debuggerWindow.style.opacity = "1";
        this.debuggerWindow.style.transform = "scale(1)";
        setTimeout(() => {
          this.debuggerWindow.style.transition = "";
        }, 200);
      }
    }

    _createWindow() {
      const checkAndAddButton = () => {
        const container = document.querySelector(
          '[class^="stage-header_stage-size-row_"]'
        );
        if (container && !container.querySelector(".sa-debugger-container")) {
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "sa-debugger-container";
          buttonContainer.dataset.saSharedSpaceOrder = "-1";

          buttonContainer.innerHTML = `
            <div class="button_outlined-button_1bS__ stage-header_stage-button_hkl9B" style="margin-right: .2rem;">
              <div class="button_content_3jdgj">
                <span class="stage-header_stage-button-icon_3zzFK" style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;">
                  ${SVG_DEBUGGER_ICON}
                </span>
              </div>
            </div>
          `;

          buttonContainer.addEventListener("click", () => {
            if (this.debuggerWindow.style.display === "none") {
              this.showDebugger();
            } else {
              this.hideDebugger();
            }
          });
          container.insertBefore(buttonContainer, container.firstChild);
        }
      };

      checkAndAddButton();

      const observer = new MutationObserver(() => {
        checkAndAddButton();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const w = (this.debuggerWindow = document.createElement("div"));
      Object.assign(w.style, {
        position: "fixed",
        top: "80px",
        right: "80px",
        width: "460px",
        height: "320px",
        minWidth: "320px",
        minHeight: "240px",
        background: "var(--ui-primary, hsla(215, 100%, 95%, 1))",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        borderRadius: "8px",
        zIndex: 501,
        display: "flex",
        flexDirection: "column",
        resize: "both",
        overflow: "hidden",
        boxSizing: "border-box",
        boxShadow: "0px 5px 25px 5px hsla(0, 0%, 0%, 0.15)",
      });

      const resizeObserver = new ResizeObserver(() => {
        this._updateVirtualScroll();
      });
      resizeObserver.observe(w);

      const header = document.createElement("div");
      Object.assign(header.style, {
        background: getComputedStyle(document.documentElement).getPropertyValue(
          "--ui-secondary"
        )
          ? "#009CCC"
          : "hsla(194, 100%, 50%, 1)",
        color: "#fff",
        padding: "6px 10px",
        cursor: "move",
        userSelect: "none",
        fontWeight: "600",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      });
      header.textContent = "调试器";

      const closeButton = document.createElement("button");
      closeButton.innerHTML = SVG_CLOSE;
      Object.assign(closeButton.style, {
        background: "transparent",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        padding: "0",
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
      closeButton.title = "关闭调试器";
      closeButton.addEventListener("click", () => {
        this.hideDebugger();
      });

      header.appendChild(closeButton);
      w.appendChild(header);

      const tabBar = document.createElement("div");
      Object.assign(tabBar.style, {
        display: "flex",
        background: "var(--ui-secondary, hsla(215, 75%, 95%, 1))",
        borderBottom:
          "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        flexWrap: "wrap",
      });
      w.appendChild(tabBar);

      const makeTabButton = (label) => {
        const b = document.createElement("button");
        Object.assign(b.style, {
          background: "transparent",
          border: "none",
          color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
          padding: "8px 12px",
          cursor: "pointer",
          outline: "none",
          transition: "background-color 0.3s ease",
        });
        b.textContent = label;

        b.addEventListener("mouseover", () => {
          b.style.backgroundColor = "rgba(0, 156, 204, 0.2)";
        });

        b.addEventListener("mouseout", () => {
          b.style.backgroundColor = "transparent";
        });

        return b;
      };

      const logsTabButton = makeTabButton("日志");
      const profilerTabButton = makeTabButton("性能分析");
      const threadsTabButton = makeTabButton("线程");
      const runtimeVarsTabButton = makeTabButton("变量");
      const listsTabButton = makeTabButton("列表");
      const codeSearchTabButton = makeTabButton("代码搜索");
      const cleanerTabButton = makeTabButton("代码清理");

      tabBar.appendChild(logsTabButton);
      tabBar.appendChild(profilerTabButton);
      tabBar.appendChild(threadsTabButton);
      tabBar.appendChild(runtimeVarsTabButton);
      tabBar.appendChild(listsTabButton);
      tabBar.appendChild(codeSearchTabButton);
      tabBar.appendChild(cleanerTabButton);

      const exportButton = document.createElement("button");
      Object.assign(exportButton.style, {
        background: "transparent",
        border: "none",
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--ui-secondary"
        )
          ? "#009CCC"
          : "hsla(194, 100%, 50%, 1)",
        padding: "8px",
        fontSize: "16px",
        cursor: "pointer",
        outline: "none",
        marginLeft: "auto",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
      });
      exportButton.innerHTML = SVG_EXPORT;
      exportButton.title = "导出日志";
      exportButton.addEventListener("click", this._exportLogsToHtml.bind(this));
      tabBar.appendChild(exportButton);

      const tabContent = document.createElement("div");
      Object.assign(tabContent.style, {
        flexGrow: 1,
        position: "relative",
        overflowX: "hidden",
        padding: "15px",
      });
      w.appendChild(tabContent);

      this.logContentArea = document.createElement("div");
      Object.assign(this.logContentArea.style, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        padding: "8px",
        color: "#eee",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box",
        display: "block",
      });
      tabContent.appendChild(this.logContentArea);

      this.scrollSizer = document.createElement("div");
      Object.assign(this.scrollSizer.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "1px",
        height: "0px",
      });
      this.logContainer = document.createElement("div");
      Object.assign(this.logContainer.style, { position: "relative" });
      this.logContentArea.appendChild(this.scrollSizer);
      this.logContentArea.appendChild(this.logContainer);
      this.logContentArea.addEventListener(
        "scroll",
        this._handleScroll.bind(this)
      );

      const buttonStyles = {
        position: "absolute",
        bottom: "10px",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        border: "none",
        background: getComputedStyle(document.documentElement).getPropertyValue(
          "--ui-secondary"
        )
          ? "#009CCC"
          : "hsla(194, 100%, 50%, 1)",
        color: "#fff",
        fontSize: "16px",
        cursor: "pointer",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

      this.pauseButton = document.createElement("button");
      Object.assign(this.pauseButton.style, buttonStyles, {
        left: "10px",
        display: "none",
      });
      this.pauseButton.title = "暂停项目（Ctrl+点击以调试）";

      this.pauseButton.addEventListener("mouseover", () => {
        this.pauseButton.style.opacity = 0.5;
      });

      this.pauseButton.addEventListener("mouseout", () => {
        this.pauseButton.style.opacity = 1;
      });

      const updatePauseButton = () => {
        if (this.runtime.paused) {
          this.pauseButton.innerHTML = SVG_PLAY;
          this.pauseButton.title = "继续项目";
        } else {
          this.pauseButton.innerHTML = SVG_PAUSE;
          this.pauseButton.title = "暂停项目";
        }
      };

      this.pauseButton.addEventListener("click", () => {
        this.pause();
        updatePauseButton();
      });
      tabContent.appendChild(this.pauseButton);
      this.runtime.on("RUNTIME_UNPAUSED", updatePauseButton);
      this.runtime.on("PROJECT_STOP_ALL", updatePauseButton);
      this.runtime.on("RUNTIME_PAUSED", updatePauseButton);
      updatePauseButton();

      this.scrollToBottomButton = document.createElement("button");
      this.scrollToBottomButton.innerHTML = SVG_SCROLL_DOWN;
      Object.assign(this.scrollToBottomButton.style, buttonStyles, {
        right: "10px",
        display: "none",
      });
      this.scrollToBottomButton.title = "滚动到底部";
      this.scrollToBottomButton.addEventListener("click", () => {
        this.logContentArea.scrollTop = this.logContentArea.scrollHeight + 20;
        this.userScrolledUp = false;
      });
      tabContent.appendChild(this.scrollToBottomButton);

      this.profilerContentArea = document.createElement("div");
      tabContent.appendChild(this.profilerContentArea);

      this.threadContentArea = document.createElement("div");
      tabContent.appendChild(this.threadContentArea);

      this.variablesContentArea = document.createElement("div");
      Object.assign(this.variablesContentArea.style, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box",
        display: "none",
        flexDirection: "column",
      });
      tabContent.appendChild(this.variablesContentArea);

      const varsSearchContainer = document.createElement("div");
      Object.assign(varsSearchContainer.style, {
        padding: "8px",
        borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        flexShrink: 0,
      });

      const varsSearchInput = document.createElement("input");
      Object.assign(varsSearchInput.style, {
        width: "100%",
        padding: "4px 6px",
        boxSizing: "border-box",
        borderRadius: "4px",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        background: "var(--ui-primary, #fff)",
        color: "var(--text-primary, #000)",
        fontFamily: "monospace",
        fontSize: "11px",
      });
      varsSearchInput.placeholder = "搜索变量...";
      varsSearchInput.addEventListener("input", (e) => {
        this.variableSearchQuery = e.target.value;
        this._updateVariablesViewer();
      });

      varsSearchContainer.appendChild(varsSearchInput);
      this.variablesContentArea.appendChild(varsSearchContainer);

      this.variablesTableContainer = document.createElement("div");
      Object.assign(this.variablesTableContainer.style, {
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "8px",
      });
      this.variablesContentArea.appendChild(this.variablesTableContainer);

      this.listsContentArea = document.createElement("div");
      Object.assign(this.listsContentArea.style, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box",
        display: "none",
        flexDirection: "column",
      });
      tabContent.appendChild(this.listsContentArea);

      const listsSearchContainer = document.createElement("div");
      Object.assign(listsSearchContainer.style, {
        padding: "8px",
        borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        flexShrink: 0,
      });

      const listsSearchInput = document.createElement("input");
      Object.assign(listsSearchInput.style, {
        width: "100%",
        padding: "4px 6px",
        boxSizing: "border-box",
        borderRadius: "4px",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        background: "var(--ui-primary, #fff)",
        color: "var(--text-primary, #000)",
        fontFamily: "monospace",
        fontSize: "11px",
      });
      listsSearchInput.placeholder = "搜索列表...";
      listsSearchInput.addEventListener("input", (e) => {
        this.listSearchQuery = e.target.value;
        this._updateListsViewer();
      });

      listsSearchContainer.appendChild(listsSearchInput);
      this.listsContentArea.appendChild(listsSearchContainer);

      this.listsTableContainer = document.createElement("div");
      Object.assign(this.listsTableContainer.style, {
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "8px",
      });
      this.listsContentArea.appendChild(this.listsTableContainer);

      this.codeSearchContentArea = document.createElement("div");
      Object.assign(this.codeSearchContentArea.style, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box",
        display: "none",
        flexDirection: "column",
      });
      tabContent.appendChild(this.codeSearchContentArea);

      const codeSearchBar = document.createElement("div");
      Object.assign(codeSearchBar.style, {
        padding: "8px",
        borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        flexShrink: 0,
        display: "flex",
        gap: "8px",
        alignItems: "center",
      });

      this.codeSearchInput = document.createElement("input");
      Object.assign(this.codeSearchInput.style, {
        flexGrow: 1,
        padding: "6px 8px",
        boxSizing: "border-box",
        borderRadius: "4px",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        background: "var(--ui-primary, #fff)",
        color: "var(--text-primary, #000)",
        fontFamily: "monospace",
        fontSize: "11px",
      });
      this.codeSearchInput.placeholder =
        "搜索项目积木（按 opcode/文字/变量名/块ID 等）...";

      const codeSearchBtn = document.createElement("button");
      codeSearchBtn.textContent = "搜索";
      Object.assign(codeSearchBtn.style, {
        padding: "6px 10px",
        borderRadius: "4px",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        background: "#009CCC",
        color: "#fff",
        cursor: "pointer",
        fontFamily: "monospace",
        fontSize: "11px",
      });

      codeSearchBtn.addEventListener("click", () => {
        this.codeSearchQuery = this.codeSearchInput.value || "";
        this._updateCodeSearchResults(true);
      });
      this.codeSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.codeSearchQuery = this.codeSearchInput.value || "";
          this._updateCodeSearchResults(true);
        }
      });

      codeSearchBar.appendChild(this.codeSearchInput);
      codeSearchBar.appendChild(codeSearchBtn);
      this.codeSearchContentArea.appendChild(codeSearchBar);

      this.codeSearchResultsContainer = document.createElement("div");
      Object.assign(this.codeSearchResultsContainer.style, {
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "8px",
      });
      this.codeSearchContentArea.appendChild(this.codeSearchResultsContainer);

      this.cleanerContentArea = document.createElement("div");
      Object.assign(this.cleanerContentArea.style, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box",
        display: "none",
        flexDirection: "column",
      });
      tabContent.appendChild(this.cleanerContentArea);

      const cleanerToolbar = document.createElement("div");
      Object.assign(cleanerToolbar.style, {
        padding: "8px",
        borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        flexShrink: 0,
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      });

      const mkCleanerBtn = (text) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        Object.assign(btn.style, {
          padding: "6px 10px",
          borderRadius: "4px",
          border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
          background: "#009CCC",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "11px",
        });
        return btn;
      };

      const cleanerRefreshBtn = mkCleanerBtn("刷新");
      const cleanerSelectAllBtn = mkCleanerBtn("全选");
      const cleanerClearBtn = mkCleanerBtn("取消全选");
      const cleanerDeleteBtn = mkCleanerBtn("删除勾选项");

      cleanerToolbar.appendChild(cleanerRefreshBtn);
      cleanerToolbar.appendChild(cleanerSelectAllBtn);
      cleanerToolbar.appendChild(cleanerClearBtn);
      cleanerToolbar.appendChild(cleanerDeleteBtn);
      this.cleanerContentArea.appendChild(cleanerToolbar);

      this.cleanerResultsContainer = document.createElement("div");
      Object.assign(this.cleanerResultsContainer.style, {
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "8px",
      });
      this.cleanerContentArea.appendChild(this.cleanerResultsContainer);

      cleanerRefreshBtn.addEventListener("click", () => {
        this._updateCleanerViewer(true);
      });

      cleanerSelectAllBtn.addEventListener("click", () => {
        const items = this._collectCleanerBlocks();
        this.cleanerSelected = new Set(items.map((i) => i.key));
        this._updateCleanerViewer(true);
      });

      cleanerClearBtn.addEventListener("click", () => {
        this.cleanerSelected.clear();
        this._updateCleanerViewer(true);
      });

      cleanerDeleteBtn.addEventListener("click", () => {
        this._deleteSelectedCleanerBlocks();
      });

      const threadControls = document.createElement("div");
      Object.assign(threadControls.style, {
        padding: "8px",
        borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
        marginBottom: "10px",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        borderRadius: "4px",
      });
      this.threadContentArea.appendChild(threadControls);

      const perfModeContainer = document.createElement("div");
      Object.assign(perfModeContainer.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
      });

      const perfModeCheckbox = document.createElement("input");
      perfModeCheckbox.type = "checkbox";
      perfModeCheckbox.id = "perfModeCheckbox";
      Object.assign(perfModeCheckbox.style, {
        margin: "0",
        cursor: "pointer",
      });
      perfModeCheckbox.checked = this.performanceMode;

      const perfModeLabel = document.createElement("label");
      perfModeLabel.htmlFor = "perfModeCheckbox";
      Object.assign(perfModeLabel.style, {
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        fontFamily: "monospace",
        fontSize: "10px",
        cursor: "pointer",
        userSelect: "none",
      });
      perfModeLabel.textContent = "线程预览（实验性）";

      if (!this.packaged) {
        perfModeContainer.appendChild(perfModeCheckbox);
        perfModeContainer.appendChild(perfModeLabel);
        threadControls.appendChild(perfModeContainer);
      }

      perfModeCheckbox.addEventListener("change", (e) => {
        this.performanceMode = e.target.checked;
        this._updateThreadViewer(true);
      });

      this.threadViewerContainer = document.createElement("div");
      Object.assign(this.threadViewerContainer.style, {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "10px",
        boxSizing: "border-box",
        color: "#eee",
        fontFamily: "monospace",
        fontSize: "12px",
      });
      this.threadContentArea.appendChild(this.threadViewerContainer);

      this.fpsCanvas = document.createElement("canvas");
      this.fpsCtx = this.fpsCanvas.getContext("2d");
      this.fpsTooltip = this._makeTooltip();
      this.profilerContentArea.appendChild(
        this._wrapCanvas("FPS（最近 60 秒）", this.fpsCanvas, this.fpsTooltip, {
          height: 180,
        })
      );

      this.stampsPerFrameCanvas = document.createElement("canvas");
      this.stampsPerFrameCtx = this.stampsPerFrameCanvas.getContext("2d");
      this.stampsPerFrameTooltip = this._makeTooltip();
      this.profilerContentArea.appendChild(
        this._wrapCanvas(
          "画笔 每帧印章次数（最近 60 秒）",
          this.stampsPerFrameCanvas,
          this.stampsPerFrameTooltip,
          { height: 140 }
        )
      );

      const cmdWrap = document.createElement("div");
      Object.assign(cmdWrap.style, {
        padding: "6px",
        background: "var(--ui-secondary, hsla(215, 75%, 95%, 1))",
      });
      const input = document.createElement("input");
      Object.assign(input.style, {
        width: "100%",
        background: "var(--ui-secondary, hsl(0, 0%, 100%))",
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        padding: "6px",
        boxSizing: "border-box",
        fontFamily: "monospace",
        borderRadius: "4px",
      });

      const activateTab = (tabName) => {
        cmdWrap.style.height = "0px";
        logsTabButton.style.borderBottom = "2px solid transparent";
        profilerTabButton.style.borderBottom = "2px solid transparent";
        threadsTabButton.style.borderBottom = "2px solid transparent";
        runtimeVarsTabButton.style.borderBottom = "2px solid transparent";
        listsTabButton.style.borderBottom = "2px solid transparent";
        codeSearchTabButton.style.borderBottom = "2px solid transparent";
        cleanerTabButton.style.borderBottom = "2px solid transparent";

        this.logContentArea.style.display = "none";
        this.profilerContentArea.style.display = "none";
        this.threadContentArea.style.display = "none";
        this.variablesContentArea.style.display = "none";
        this.listsContentArea.style.display = "none";
        this.codeSearchContentArea.style.display = "none";
        this.cleanerContentArea.style.display = "none";

        this.scrollToBottomButton.style.display = "none";
        this.pauseButton.style.display = "none";
        exportButton.style.display = "none";
        input.style.visibility = "hidden";

        switch (tabName) {
          case "logs":
            cmdWrap.style.height = "";
            logsTabButton.style.borderBottom = "2px solid #009CCC";
            this.logContentArea.style.display = "block";
            this.pauseButton.style.display = "flex";
            exportButton.style.display = "flex";
            this._updateVirtualScroll();
            input.style.visibility = "";
            break;
          case "profiler":
            profilerTabButton.style.borderBottom = "2px solid #009CCC";
            this.profilerContentArea.style.display = "block";
            this._resizeAllCanvases();
            this._renderAllGraphs();
            break;
          case "threads":
            threadsTabButton.style.borderBottom = "2px solid #009CCC";
            this.threadContentArea.style.display = "block";
            this._updateThreadViewer();
            break;
          case "variables":
            runtimeVarsTabButton.style.borderBottom = "2px solid #009CCC";
            this.variablesContentArea.style.display = "flex";
            this._updateVariablesViewer();
            break;
          case "lists":
            listsTabButton.style.borderBottom = "2px solid #009CCC";
            this.listsContentArea.style.display = "flex";
            this._updateListsViewer();
            break;
          case "codeSearch":
            codeSearchTabButton.style.borderBottom = "2px solid #009CCC";
            this.codeSearchContentArea.style.display = "flex";
            this._updateCodeSearchResults();
            break;
          case "cleaner":
            cleanerTabButton.style.borderBottom = "2px solid #009CCC";
            this.cleanerContentArea.style.display = "flex";
            this._updateCleanerViewer(true);
            break;
        }
      };

      runtimeVarsTabButton.addEventListener("click", () =>
        activateTab("variables")
      );
      logsTabButton.addEventListener("click", () => activateTab("logs"));
      profilerTabButton.addEventListener("click", () =>
        activateTab("profiler")
      );
      threadsTabButton.addEventListener("click", () => activateTab("threads"));
      listsTabButton.addEventListener("click", () => activateTab("lists"));
      codeSearchTabButton.addEventListener("click", () =>
        activateTab("codeSearch")
      );
      cleanerTabButton.addEventListener("click", () =>
        activateTab("cleaner")
      );

      activateTab("logs");

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const command = input.value.trim();
          if (command) {
            this.commandText = command;
            this.log({ TEXT: ">> " + command });
            input.value = "";
            this.ranCommand = true;
          }
        }
      });
      cmdWrap.appendChild(input);
      w.appendChild(cmdWrap);

      document.body.appendChild(w);
      this._drag(header, w);

      this.lastSampleTime = performance.now();
      this._attachCanvasEvents(
        this.fpsCanvas,
        this.fpsTooltip,
        (value) => ({
          label: "FPS",
          value: value.toFixed(1),
        }),
        this.fpsHistory
      );

      this._attachCanvasEvents(
        this.stampsPerFrameCanvas,
        this.stampsPerFrameTooltip,
        (value) => ({
          label: "印章/帧",
          value: Math.round(value),
        }),
        this.stampsPerFrameHistory,
        { raw: true }
      );

      requestAnimationFrame(() => this._renderLoop());
      this.hideDebugger();
    }

    _drag(header, el) {
      let x = 0,
        y = 0;
      header.onmousedown = (e) => {
        const r = el.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
        document.onmousemove = (e2) => {
          el.style.left =
            Math.max(
              0,
              Math.min(e2.clientX - x, window.innerWidth - el.offsetWidth)
            ) + "px";
          el.style.top =
            Math.max(
              0,
              Math.min(e2.clientY - y, window.innerHeight - el.offsetHeight)
            ) + "px";
        };
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }

    _getDynamicMax(arr) {
      const maxVal = arr.reduce((max, current) => Math.max(max, current), 0);

      if (maxVal === 0) return 10;

      const steps = [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

      for (const step of steps) {
        if (maxVal <= step) {
          return step;
        }
      }

      const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
      let roundedMax = Math.ceil(maxVal / magnitude) * magnitude;

      if (roundedMax < maxVal * 1.1) {
        roundedMax += magnitude;
      }

      return roundedMax;
    }

    _makeTooltip() {
      const t = document.createElement("div");
      Object.assign(t.style, {
        position: "fixed",
        pointerEvents: "none",
        background: "#141416",
        border: "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
        color: "#fff",
        padding: "6px 8px",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px",
        display: "none",
        zIndex: 10050,
      });
      document.body.appendChild(t);
      return t;
    }

    _wrapCanvas(labelText, canvas, tooltip, opts) {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "8px";
      const label = document.createElement("div");
      label.textContent = labelText;
      Object.assign(label.style, {
        color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        marginBottom: "4px",
        fontSize: "12px",
      });
      canvas.style.width = "100%";
      canvas.style.display = "block";
      canvas.style.border =
        "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))";
      canvas.style.height = (opts && opts.height ? opts.height : 100) + "px";
      canvas.width = 600;
      canvas.height = opts && opts.height ? opts.height : 100;
      wrapper.appendChild(label);
      wrapper.appendChild(canvas);
      return wrapper;
    }

    _attachCanvasEvents(canvas, tooltip, formatFn, historyArr, opts) {
      opts = opts || {};
      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const idx = Math.floor((x / rect.width) * this.historyLength);
        const realIndex = (this.writeIndex + idx) % this.historyLength;

        const value = opts.raw
          ? historyArr[realIndex] || 0
          : this._smoothedValue(historyArr, realIndex);

        const info = formatFn(value);
        tooltip.style.left = e.clientX + 12 + "px";
        tooltip.style.top = e.clientY + 12 + "px";
        tooltip.textContent = info.label + ": " + info.value;
        tooltip.style.display = "block";
      });
      canvas.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    }

    _smoothedValue(arr, idx) {
      let sum = 0,
        cnt = 0;
      const half = Math.floor(this.smoothingWindow / 2);
      for (let i = -half; i <= half; i++) {
        const j = (idx + i + arr.length) % arr.length;
        sum += arr[j] || 0;
        cnt++;
      }
      return sum / Math.max(1, cnt);
    }

    _maybeSample(now, fpsValue, stampsPerFrameCount) {
      if (vm.runtime.paused) return;
      if (now - this.lastSampleTime >= this.sampleIntervalMs) {
        this.fpsHistory[this.writeIndex] = fpsValue;
        this.stampsPerFrameHistory[this.writeIndex] = stampsPerFrameCount;
        this.writeIndex = (this.writeIndex + 1) % this.historyLength;
        this.lastSampleTime = now;
      }
    }

    _resizeAllCanvases() {
      this.fpsCanvas.width = Math.max(
        200,
        Math.floor(this.fpsCanvas.getBoundingClientRect().width)
      );
      this.fpsCanvas.height = Math.max(
        60,
        Math.floor(this.fpsCanvas.getBoundingClientRect().height)
      );
      this.stampsPerFrameCanvas.width = Math.max(
        200,
        Math.floor(this.stampsPerFrameCanvas.getBoundingClientRect().width)
      );
      this.stampsPerFrameCanvas.height = Math.max(
        60,
        Math.floor(this.stampsPerFrameCanvas.getBoundingClientRect().height)
      );
    }

    _renderAllGraphs() {
      this._renderGraph(this.fpsCanvas, this.fpsCtx, this.fpsHistory, {
        color: "#4ee27a",
        maxValue: 250,
        label: "FPS",
      });

      const stampsMax = this._getDynamicMax(this.stampsPerFrameHistory);

      this._renderGraph(
        this.stampsPerFrameCanvas,
        this.stampsPerFrameCtx,
        this.stampsPerFrameHistory,
        {
          color: "#4e7ae2",
          maxValue: stampsMax,
          label: "印章/帧",
          raw: true,
        }
      );
    }

    _renderGraph(canvas, ctx, arr, opts) {
      if (!ctx) ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (
        getComputedStyle(document.documentElement).getPropertyValue(
          "--ui-secondary"
        )
      ) {
        ctx.fillStyle = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--ui-secondary");
      } else {
        ctx.fillStyle = "#FFFFFF";
      }

      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#494949";
      ctx.lineWidth = 1;
      const maxValue = opts.maxValue || 1;
      const numLines = 5;
      const step = maxValue / numLines;

      ctx.fillStyle = "#555";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";

      for (let i = 0; i <= numLines; i++) {
        const y = h - (i / numLines) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        if (i > 0) {
          const labelText = Math.round(step * i * 10) / 10;
          ctx.fillText(labelText, w - 2, y - 2);
        }
      }

      ctx.strokeStyle = opts.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let i = 0; i < this.historyLength; i++) {
        const idx = (this.writeIndex + i) % this.historyLength;
        const val = opts.raw ? arr[idx] || 0 : this._smoothedValue(arr, idx);
        const x = (i / (this.historyLength - 1)) * w;
        const y = h - (val / maxValue) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    _renderLoop() {
      if (
        this.profilerContentArea &&
        this.profilerContentArea.style.display !== "none"
      ) {
        this._resizeAllCanvases();
        this._renderAllGraphs();
      }

      if (
        this.threadContentArea &&
        this.threadContentArea.style.display !== "none"
      ) {
        this._updateThreadViewer();
      }

      if (
        this.variablesContentArea &&
        this.variablesContentArea.style.display !== "none"
      ) {
        this._updateVariablesViewer();
      }

      if (
        this.listsContentArea &&
        this.listsContentArea.style.display !== "none"
      ) {
        this._updateListsViewer();
      }

      if (
        this.codeSearchContentArea &&
        this.codeSearchContentArea.style.display !== "none"
      ) {
        this._updateCodeSearchResults();
      }

      if (
        this.cleanerContentArea &&
        this.cleanerContentArea.style.display !== "none"
      ) {
        this._updateCleanerViewer();
      }

      if (this.logContentArea && this.logContentArea.style.display !== "none") {
        this.scrollToBottomButton.style.display = this.userScrolledUp
          ? "flex"
          : "none";
      } else if (this.scrollToBottomButton) {
        this.scrollToBottomButton.style.display = "none";
      }
      requestAnimationFrame(() => this._renderLoop());
    }

    _collectAllLists() {
      const allEntries = [];
      if (this.runtime.targets) {
        this.runtime.targets.forEach((target) => {
          const variables = target.variables;
          if (!variables) return;
          const targetName = target.getName();
          Object.values(variables).forEach((variable) => {
            if (!variable) return;
            if (variable.type !== "list") return;
            allEntries.push({
              id: variable.id || targetName + variable.name,
              key: target.isStage
                ? variable.name
                : `${targetName}: ${variable.name}`,
              value: variable.value,
              ref: variable,
              targetName,
              varName: variable.name,
            });
          });
        });
      }
      allEntries.sort((a, b) => a.key.localeCompare(b.key));
      return allEntries;
    }

    _findListByNameAnyTarget(name) {
      if (!this.runtime.targets) return null;
      for (const target of this.runtime.targets) {
        const variables = target.variables;
        if (!variables) continue;
        for (const v of Object.values(variables)) {
          if (v && v.type === "list" && v.name === name) {
            return v;
          }
        }
      }
      return null;
    }

    getListValue({ LIST }) {
      const v = this._findListByNameAnyTarget(String(LIST));
      if (!v) return "";
      try {
        return JSON.stringify(v.value);
      } catch (e) {
        return String(v.value);
      }
    }

    setListValue({ LIST, VALUE }) {
      const v = this._findListByNameAnyTarget(String(LIST));
      if (!v) return;

      let parsed = null;
      const raw = String(VALUE);

      try {
        const json = JSON.parse(raw);
        if (Array.isArray(json)) parsed = json;
      } catch (e) {}

      if (!parsed) {
        parsed = raw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((s) => {
            if (s !== "" && !isNaN(s)) return Number(s);
            return s;
          });
      }

      v.value = parsed;
    }

    _updateListsViewer() {
      if (!this.listsContentArea || !this.listsTableContainer) return;

      const allEntries = this._collectAllLists();
      const filteredEntries = this.listSearchQuery
        ? allEntries.filter((entry) =>
            entry.key.toLowerCase().includes(this.listSearchQuery.toLowerCase())
          )
        : allEntries;

      if (!this.listsCountLabel) {
        this.listsCountLabel = document.createElement("div");
        Object.assign(this.listsCountLabel.style, {
          padding: "8px",
          color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
          fontFamily: "monospace",
          fontSize: "12px",
          fontWeight: "bold",
          borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
          background: "var(--ui-secondary, hsl(0, 0%, 100%))",
          flexShrink: 0,
        });
        this.listsContentArea.insertBefore(
          this.listsCountLabel,
          this.listsContentArea.children[1]
        );
      }
      this.listsCountLabel.textContent = `列表数量：${filteredEntries.length}`;

      const container = this.listsTableContainer;
      const rowHeight = 28;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
      const buffer = 20;

      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
      const endIndex = Math.min(
        filteredEntries.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + buffer
      );

      const structureString =
        filteredEntries.map((e) => e.id).join(",") +
        this.listSearchQuery +
        `:${startIndex}:${endIndex}:${filteredEntries.length}`;

      if (this.listsOld !== structureString) {
        this.listsOld = structureString;

        container.innerHTML = "";
        const table = document.createElement("table");
        Object.assign(table.style, {
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          tableLayout: "fixed",
        });

        if (startIndex > 0) {
          const spacerRow = document.createElement("tr");
          spacerRow.style.height = `${startIndex * rowHeight}px`;
          const spacerCell = document.createElement("td");
          spacerCell.colSpan = 2;
          spacerRow.appendChild(spacerCell);
          table.appendChild(spacerRow);
        }

        for (let i = startIndex; i < endIndex; i++) {
          const entry = filteredEntries[i];
          if (!entry) continue;

          const row = document.createElement("tr");
          row.style.background =
            i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.03)";
          row.style.borderBottom =
            "1px solid var(--ui-black-transparent, rgba(0,0,0,0.1))";
          row.style.height = `${rowHeight}px`;

          const keyCell = document.createElement("td");
          keyCell.textContent = entry.key;
          Object.assign(keyCell.style, {
            paddingLeft: "8px",
            fontWeight: "bold",
            width: "40%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "left",
            borderRight:
              "1px solid var(--ui-black-transparent, rgba(0,0,0,0.1))",
          });

          const valCell = document.createElement("td");
          Object.assign(valCell.style, {
            paddingLeft: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: "left",
          });

          const input = document.createElement("input");
          input.dataset.listId = entry.id;
          Object.assign(input.style, {
            width: "100%",
            background: "transparent",
            border: "none",
            color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
            outline: "none",
            fontFamily: "monospace",
            padding: "6px",
            fontSize: "11px",
          });

          let shown = "";
          try {
            shown = JSON.stringify(entry.value);
          } catch (e) {
            shown = String(entry.value);
          }
          input.value = shown;

          input.addEventListener("change", (e) => {
            const raw = String(e.target.value);
            let parsed = null;
            try {
              const json = JSON.parse(raw);
              if (Array.isArray(json)) parsed = json;
            } catch (err) {}

            if (!parsed) {
              parsed = raw
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .map((s) => {
                  if (s !== "" && !isNaN(s)) return Number(s);
                  return s;
                });
            }

            entry.ref.value = parsed;
          });

          valCell.appendChild(input);
          row.appendChild(keyCell);
          row.appendChild(valCell);
          table.appendChild(row);
        }

        if (endIndex < filteredEntries.length) {
          const spacerRow = document.createElement("tr");
          spacerRow.style.height = `${
            (filteredEntries.length - endIndex) * rowHeight
          }px`;
          const spacerCell = document.createElement("td");
          spacerCell.colSpan = 2;
          spacerRow.appendChild(spacerCell);
          table.appendChild(spacerRow);
        }

        container.appendChild(table);
      } else {
        filteredEntries.forEach((entry) => {
          const input = container.querySelector(
            `input[data-list-id="${entry.id}"]`
          );
          if (input && document.activeElement !== input) {
            let shown = "";
            try {
              shown = JSON.stringify(entry.value);
            } catch (e) {
              shown = String(entry.value);
            }
            if (input.value !== shown) input.value = shown;
          }
        });
      }
    }

    _safeLower(s) {
      return String(s == null ? "" : s).toLowerCase();
    }

    _getBlocklyMainWorkspaceSafe() {
      const B = typeof Blockly !== "undefined" ? Blockly : window.Blockly;
      if (!B || !B.getMainWorkspace) return null;
      try {
        return B.getMainWorkspace();
      } catch (e) {
        return null;
      }
    }

    _blockSearchText(block) {
      let parts = [];
      try {
        parts.push(block.id || "");
        parts.push(block.type || "");
        if (block.getField) {
          if (typeof block.toString === "function") parts.push(block.toString());
        }
        if (block.inputList && Array.isArray(block.inputList)) {
          block.inputList.forEach((inp) => {
            if (inp && inp.fieldRow && Array.isArray(inp.fieldRow)) {
              inp.fieldRow.forEach((f) => {
                if (!f) return;
                if (typeof f.getText === "function") parts.push(f.getText());
                if (typeof f.getValue === "function") parts.push(f.getValue());
              });
            }
          });
        }
      } catch (e) {}
      return parts.filter(Boolean).join(" ");
    }

    _blockToInlineSvg(block) {
      if (!block || !block.svgGroup_) return null;

      try {
        let svgData = block.svgGroup_.outerHTML;
        svgData = svgData.replace(/ transform="[^"]*"/, "");
        svgData = svgData.replace(/ filter="[^"]*"/, "");
        svgData = svgData.replace(/&nbsp;/g, " ");

        const bbox = block.svgGroup_.getBBox();
        const w = Math.max(1, bbox.width);
        const h = Math.max(1, bbox.height);

        const cssMatches = svgData.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
        let extractedCss = "";
        if (cssMatches) {
          extractedCss = cssMatches.join("\n");
          svgData = svgData.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        }

        const css = `
          <style>
            .blocklyText {
              fill: #fff;
              font-family: "Helvetica Neue", Helvetica, sans-serif;
              font-size: 12pt;
              font-weight: 500;
            }
            .blocklyNonEditableText>text, .blocklyEditableText>text {
              fill: #575E75;
            }
            .blocklyDropdownText {
              fill: #fff !important;
            }
            path { fill-opacity: 1; }
            ${extractedCss}
          </style>
        `;

        return `
          <svg xmlns="http://www.w3.org/2000/svg"
               xmlns:xlink="http://www.w3.org/1999/xlink"
               width="${w}" height="${h}"
               viewBox="${bbox.x} ${bbox.y} ${w} ${h}">
            ${css}
            ${svgData}
          </svg>
        `;
      } catch (e) {
        return null;
      }
    }

    _updateCodeSearchResults(force) {
      if (!this.codeSearchResultsContainer) return;

      const query = this._safeLower(this.codeSearchQuery || "");
      const ws = this._getBlocklyMainWorkspaceSafe();

      if (!ws) {
        if (this.codeSearchOld !== "NO_BLOCKLY") {
          this.codeSearchOld = "NO_BLOCKLY";
          this.codeSearchResultsContainer.innerHTML =
            '<div style="color:#888;font-size:11px;">未检测到 Blockly 工作区，无法搜索积木。</div>';
        }
        return;
      }

      if (!query.trim()) {
        if (this.codeSearchOld !== "EMPTY_QUERY") {
          this.codeSearchOld = "EMPTY_QUERY";
          this.codeSearchResultsContainer.innerHTML =
            '<div style="color:#888;font-size:11px;">请输入关键字后点击“搜索”。</div>';
        }
        return;
      }

      const marker = "Q:" + query;
      if (!force && this.codeSearchOld === marker) return;
      this.codeSearchOld = marker;

      let blocks = [];
      try {
        blocks = ws.getAllBlocks(false) || [];
      } catch (e) {
        blocks = [];
      }

      const results = [];
      for (const b of blocks) {
        const text = this._safeLower(this._blockSearchText(b));
        if (text.includes(query)) {
          results.push({
            id: b.id,
            type: b.type,
            text: this._blockSearchText(b),
          });
        }
      }

      this.codeSearchResultsContainer.innerHTML = "";

      const countLabel = document.createElement("div");
      Object.assign(countLabel.style, {
        padding: "6px 0",
        fontWeight: "bold",
        fontSize: "12px",
      });
      countLabel.textContent = `结果：${results.length}`;
      this.codeSearchResultsContainer.appendChild(countLabel);

      if (results.length === 0) {
        const empty = document.createElement("div");
        empty.style.color = "#888";
        empty.style.fontSize = "11px";
        empty.textContent = "没有匹配的积木。";
        this.codeSearchResultsContainer.appendChild(empty);
        return;
      }

      results.slice(0, 500).forEach((r, idx) => {
        const item = document.createElement("div");
        Object.assign(item.style, {
          border: "1px solid var(--ui-black-transparent, rgba(0,0,0,0.12))",
          background: "var(--ui-secondary, hsl(0, 0%, 100%))",
          borderRadius: "4px",
          padding: "6px 8px",
          marginBottom: "6px",
          cursor: "pointer",
          fontSize: "11px",
          lineHeight: "1.3",
          userSelect: "none",
        });

        const title = document.createElement("div");
        title.style.fontWeight = "bold";
        title.textContent = `${idx + 1}. ${r.type}  (${r.id})`;

        const body = document.createElement("div");
        body.style.whiteSpace = "pre-wrap";
        body.style.wordBreak = "break-word";
        body.style.color = "var(--text-primary, hsla(225, 15%, 40%, 1))";
        body.textContent = r.text;

        item.appendChild(title);

        try {
          const block = ws.getBlockById(r.id);
          const svg = this._blockToInlineSvg(block);
          if (svg) {
            const preview = document.createElement("div");
            Object.assign(preview.style, {
              marginTop: "6px",
              marginBottom: "6px",
              padding: "6px",
              border: "1px solid var(--ui-black-transparent, rgba(0,0,0,0.12))",
              borderRadius: "4px",
              background: "var(--ui-secondary, hsl(0, 0%, 100%))",
              overflowX: "auto",
              overflowY: "hidden",
            });
            preview.innerHTML = svg;

            const svgEl = preview.querySelector("svg");
            if (svgEl) {
              svgEl.style.display = "block";
              svgEl.style.maxWidth = "100%";
              svgEl.style.height = "auto";
            }
            item.appendChild(preview);
          }
        } catch (e) {}

        item.appendChild(body);

        item.addEventListener("click", () => {
          try {
            const block = ws.getBlockById(r.id);
            if (block) {
              if (typeof ws.centerOnBlock === "function") {
                ws.centerOnBlock(r.id);
              } else if (typeof block.scrollIntoView === "function") {
                block.scrollIntoView();
              }
              if (typeof block.select === "function") block.select();
            }
          } catch (e) {}
        });

        this.codeSearchResultsContainer.appendChild(item);
      });

      if (results.length > 500) {
        const more = document.createElement("div");
        more.style.color = "#888";
        more.style.fontSize = "11px";
        more.textContent = `结果过多，仅显示前 500 条。`;
        this.codeSearchResultsContainer.appendChild(more);
      }
    }

    _getCleanerBlockText(block) {
      try {
        const ws = this._getBlocklyMainWorkspaceSafe();
        if (ws) {
          const realBlock = ws.getBlockById(block.id);
          if (realBlock && typeof realBlock.toString === "function") {
            return realBlock.toString();
          }
        }
      } catch (e) {}
      return `${block.opcode || "unknown"} (${block.id || ""})`;
    }

    _collectCleanerBlocks() {
      const results = [];
      const runtime = this.runtime;
      if (!runtime || !runtime.targets) return results;

      for (const target of runtime.targets) {
        if (!target || !target.blocks || typeof target.blocks.getScripts !== "function") continue;

        const topLevelBlockIds = target.blocks.getScripts();
        const targetName = target.getName ? target.getName() : "未知角色";

        for (const blockId of topLevelBlockIds) {
          const block = target.blocks.getBlock(blockId);
          if (!block) continue;

          const isHat = runtime.getIsHat(block.opcode);
          const isLonelyHat = isHat && !block.next;
          const isHatlessScript = !isHat;

          if (isLonelyHat || isHatlessScript) {
            results.push({
              key: `${target.id}:${blockId}`,
              targetId: target.id,
              targetName,
              blockId,
              opcode: block.opcode,
              isHat,
              isLonelyHat,
              isHatlessScript,
              text: this._getCleanerBlockText(block),
            });
          }
        }
      }

      return results;
    }

    _jumpToBlock(blockId) {
      try {
        const ws = this._getBlocklyMainWorkspaceSafe();
        if (!ws) return;

        const block = ws.getBlockById(blockId);
        if (!block) return;

        if (typeof ws.centerOnBlock === "function") {
          ws.centerOnBlock(blockId);
        } else if (typeof block.scrollIntoView === "function") {
          block.scrollIntoView();
        }

        if (typeof block.select === "function") {
          block.select();
        }
      } catch (e) {}
    }

    _previewBlockInCleaner(blockId) {
      try {
        const ws = this._getBlocklyMainWorkspaceSafe();
        if (!ws) return false;

        const block = ws.getBlockById(blockId);
        if (!block) return false;

        const svg = this._blockToInlineSvg(block);
        if (!svg) return false;

        // 创建预览模态框
        const modal = document.createElement("div");
        Object.assign(modal.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--ui-primary, #fff)",
          border: "2px solid #009CCC",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 10000,
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "20px",
        });

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = SVG_CLOSE;
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          width: "24px",
          height: "24px",
        });
        closeBtn.addEventListener("click", () => modal.remove());

        const content = document.createElement("div");
        content.innerHTML = svg;

        const svgEl = content.querySelector("svg");
        if (svgEl) {
          svgEl.style.display = "block";
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }

        modal.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.remove();
        });

        return true;
      } catch (e) {
        return false;
      }
    }

    _updateCleanerViewer(force) {
      if (!this.cleanerResultsContainer) return;

      const items = this._collectCleanerBlocks();
      const marker = JSON.stringify(
        items.map((i) => ({
          key: i.key,
          opcode: i.opcode,
          type: i.isLonelyHat ? "hat" : "block",
        }))
      );

      if (!force && this.cleanerOld === marker) return;
      this.cleanerOld = marker;

      this.cleanerResultsContainer.innerHTML = "";

      const summary = document.createElement("div");
      Object.assign(summary.style, {
        fontWeight: "bold",
        marginBottom: "8px",
      });

      const lonelyHats = items.filter((i) => i.isLonelyHat);
      const hatlessBlocks = items.filter((i) => i.isHatlessScript);

      summary.textContent = `独立帽子头：${lonelyHats.length}    独立块积木：${hatlessBlocks.length}`;
      this.cleanerResultsContainer.appendChild(summary);

      if (items.length === 0) {
        const empty = document.createElement("div");
        empty.style.color = "#888";
        empty.textContent = "没有检测到可清理的积木。";
        this.cleanerResultsContainer.appendChild(empty);
        return;
      }

      const renderSection = (titleText, sectionItems) => {
        const title = document.createElement("div");
        Object.assign(title.style, {
          marginTop: "10px",
          marginBottom: "6px",
          fontWeight: "bold",
          color: "#009CCC",
        });
        title.textContent = titleText;
        this.cleanerResultsContainer.appendChild(title);

        if (sectionItems.length === 0) {
          const none = document.createElement("div");
          none.style.color = "#888";
          none.style.marginBottom = "8px";
          none.textContent = "无";
          this.cleanerResultsContainer.appendChild(none);
          return;
        }

        sectionItems.forEach((item, idx) => {
          const row = document.createElement("div");
          Object.assign(row.style, {
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "6px 8px",
            marginBottom: "6px",
            border: "1px solid var(--ui-black-transparent, rgba(0,0,0,0.12))",
            borderRadius: "4px",
            background: "var(--ui-secondary, hsl(0, 0%, 100%))",
            cursor: "pointer",
          });

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = this.cleanerSelected.has(item.key);
          checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
          });
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) this.cleanerSelected.add(item.key);
            else this.cleanerSelected.delete(item.key);
          });

          const info = document.createElement("div");
          info.style.flexGrow = "1";
          info.style.wordBreak = "break-word";

          const line1 = document.createElement("div");
          line1.style.fontWeight = "bold";
          line1.textContent = `${idx + 1}. ${item.targetName}`;

          const line2 = document.createElement("div");
          line2.textContent = `${item.opcode}  (${item.blockId})`;

          const line3 = document.createElement("div");
          line3.style.color = "#666";
          line3.textContent = item.text;

          info.appendChild(line1);
          info.appendChild(line2);
          info.appendChild(line3);

          // 预览按钮
          const previewBtn = document.createElement("button");
          previewBtn.textContent = "预览";
          Object.assign(previewBtn.style, {
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid #009CCC",
            background: "transparent",
            color: "#009CCC",
            cursor: "pointer",
            fontSize: "10px",
            fontFamily: "monospace",
            marginLeft: "8px",
            flexShrink: 0,
          });
          previewBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._previewBlockInCleaner(item.blockId);
          });

          const btnContainer = document.createElement("div");
          btnContainer.appendChild(previewBtn);

          row.appendChild(checkbox);
          row.appendChild(info);
          row.appendChild(btnContainer);

          row.addEventListener("click", () => {
            if (checkbox.checked) this.cleanerSelected.delete(item.key);
            else this.cleanerSelected.add(item.key);
            this._updateCleanerViewer(true);
            this._jumpToBlock(item.blockId);
          });

          this.cleanerResultsContainer.appendChild(row);
        });
      };

      renderSection("独立帽子头", lonelyHats);
      renderSection("独立块积木", hatlessBlocks);
    }

    _deleteSelectedCleanerBlocks() {
      if (!this.cleanerSelected || this.cleanerSelected.size === 0) {
        alert("没有勾选任何积木。");
        return;
      }

      if (
        !confirm(
          `确定删除已勾选的 ${this.cleanerSelected.size} 个积木吗？此操作不可撤销。`
        )
      ) {
        return;
      }

      let removed = 0;

      for (const target of this.runtime.targets) {
        if (!target || !target.blocks || typeof target.blocks.getScripts !== "function") continue;

        const scripts = target.blocks.getScripts();
        for (const blockId of scripts) {
          const key = `${target.id}:${blockId}`;
          if (!this.cleanerSelected.has(key)) continue;

          const block = target.blocks.getBlock(blockId);
          if (!block) continue;

          const isHat = this.runtime.getIsHat(block.opcode);
          const isLonelyHat = isHat && !block.next;
          const isHatlessScript = !isHat;

          if (isLonelyHat || isHatlessScript) {
            target.blocks.deleteBlock(blockId);
            removed++;
          }
        }
      }

      this.cleanerSelected.clear();

      if (Scratch.vm && typeof Scratch.vm.emitWorkspaceUpdate === "function") {
        Scratch.vm.emitWorkspaceUpdate();
      }

      this._updateCleanerViewer(true);
      alert(`删除完成：${removed} 个积木`);
    }

    _updateVariablesViewer() {
      if (!this.variablesContentArea || !this.variablesTableContainer) return;

      const allEntries = [];
      if (this.runtime.targets) {
        this.runtime.targets.forEach((target) => {
          const variables = target.variables;
          if (!variables) return;
          const targetName = target.getName();
          Object.values(variables).forEach((variable) => {
            allEntries.push({
              id: variable.id || targetName + variable.name,
              key: target.isStage
                ? variable.name
                : `${targetName}: ${variable.name}`,
              value: variable.value,
              ref: variable,
            });
          });
        });
      }

      if (this.runtime.variables) {
        Object.keys(this.runtime.variables).forEach((key) => {
          allEntries.push({
            id: "runtime-" + key,
            key: `[运行时] ${key}`,
            value: this.runtime.variables[key],
            ref: { type: "runtime", key: key },
          });
        });
      }

      allEntries.sort((a, b) => a.key.localeCompare(b.key));

      const filteredEntries = this.variableSearchQuery
        ? allEntries.filter((entry) =>
            entry.key
              .toLowerCase()
              .includes(this.variableSearchQuery.toLowerCase())
          )
        : allEntries;

      if (!this.variablesCountLabel) {
        this.variablesCountLabel = document.createElement("div");
        Object.assign(this.variablesCountLabel.style, {
          padding: "8px",
          color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
          fontFamily: "monospace",
          fontSize: "12px",
          fontWeight: "bold",
          borderBottom: "1px solid var(--ui-secondary, hsl(0, 0%, 100%))",
          background: "var(--ui-secondary, hsl(0, 0%, 100%))",
          flexShrink: 0,
        });
        this.variablesContentArea.insertBefore(
          this.variablesCountLabel,
          this.variablesContentArea.children[1]
        );
      }
      this.variablesCountLabel.textContent = `变量数量：${filteredEntries.length}`;

      const container = this.variablesTableContainer;
      const rowHeight = 24;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
      const buffer = 20;

      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / rowHeight) - buffer
      );
      const endIndex = Math.min(
        filteredEntries.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + buffer
      );

      const structureString =
        filteredEntries.map((e) => e.id).join(",") +
        this.variableSearchQuery +
        `:${startIndex}:${endIndex}:${filteredEntries.length}`;

      if (this.variablesOld !== structureString) {
        this.variablesOld = structureString;

        container.innerHTML = "";
        const table = document.createElement("table");
        Object.assign(table.style, {
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          tableLayout: "fixed",
        });

        if (startIndex > 0) {
          const spacerRow = document.createElement("tr");
          spacerRow.style.height = `${startIndex * rowHeight}px`;
          const spacerCell = document.createElement("td");
          spacerCell.colSpan = 2;
          spacerRow.appendChild(spacerCell);
          table.appendChild(spacerRow);
        }

        for (let i = startIndex; i < endIndex; i++) {
          const entry = filteredEntries[i];
          if (!entry) continue;
          const row = document.createElement("tr");
          row.style.background =
            i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.03)";
          row.style.borderBottom =
            "1px solid var(--ui-black-transparent, rgba(0,0,0,0.1))";
          row.style.height = `${rowHeight}px`;

          const keyCell = document.createElement("td");
          keyCell.textContent = entry.key;
          Object.assign(keyCell.style, {
            paddingLeft: "8px",
            fontWeight: "bold",
            width: "40%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "left",
            borderRight:
              "1px solid var(--ui-black-transparent, rgba(0,0,0,0.1))",
          });

          const valCell = document.createElement("td");
          Object.assign(valCell.style, {
            paddingLeft: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: "left",
          });

          const input = document.createElement("input");
          input.dataset.varId = entry.id;
          Object.assign(input.style, {
            width: "100%",
            background: "transparent",
            border: "none",
            color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
            outline: "none",
            fontFamily: "monospace",
            padding: "6px",
          });

          input.value = entry.value;

          input.addEventListener("change", (e) => {
            let val = e.target.value;
            if (val !== "" && !isNaN(val)) val = Number(val);

            if (entry.ref.type === "runtime") {
              this.runtime.variables[entry.ref.key] = val;
            } else {
              entry.ref.value = val;
            }
          });

          valCell.appendChild(input);
          row.appendChild(keyCell);
          row.appendChild(valCell);
          table.appendChild(row);
        }

        if (endIndex < filteredEntries.length) {
          const spacerRow = document.createElement("tr");
          spacerRow.style.height = `${
            (filteredEntries.length - endIndex) * rowHeight
          }px`;
          const spacerCell = document.createElement("td");
          spacerCell.colSpan = 2;
          spacerRow.appendChild(spacerCell);
          table.appendChild(spacerRow);
        }

        container.appendChild(table);
      } else {
        this._syncVariableInputs(filteredEntries);
      }
    }

    _syncVariableInputs(entries) {
      entries.forEach((entry) => {
        const input = this.variablesTableContainer.querySelector(
          `input[data-var-id="${entry.id}"]`
        );
        if (input && document.activeElement !== input) {
          if (input.value !== String(entry.value)) {
            input.value = entry.value;
          }
        }
      });
    }

    _updateThreadViewer(forceUpdate) {
      if (
        !this.threadContentArea ||
        this.threadContentArea.style.display === "none"
      ) {
        return;
      }

      const currentThreadsSummary = this.runtime.threads.map((thread) => ({
        id: thread.id,
        topBlock: thread.topBlock,
        status: thread.status,
      }));
      const currentThreadsString = JSON.stringify(currentThreadsSummary);
      if (forceUpdate) this.threadsOld = null;
      if (this.threadsOld !== currentThreadsString) {
        const threads = this.runtime.threads;
        const container = this.threadViewerContainer;
        container.innerHTML = "";
        this.threadsOld = currentThreadsString;

        const threadsByTarget = {};
        if (threads && threads.length > 0) {
          threads.forEach((thread) => {
            const targetName = thread.target
              ? thread.target.getName()
              : "未知";
            if (!threadsByTarget[targetName]) {
              threadsByTarget[targetName] = [];
            }
            threadsByTarget[targetName].push(thread);
          });
        }

        if (!this.collapsedTargets) {
          this.collapsedTargets = {};
        }

        const targetNames = Object.keys(threadsByTarget);
        container.style.gridTemplateColumns = "1fr";

        if (targetNames.length > 0) {
          targetNames.forEach((targetName) => {
            const targetThreads = threadsByTarget[targetName];

            const headerDiv = document.createElement("div");
            Object.assign(headerDiv.style, {
              background: "var(--ui-secondary, hsl(0, 0%, 100%))",
              color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
              padding: "8px",
              margin: "4px 0",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            });

            const headerText = document.createElement("span");
            headerText.textContent = `${targetName}（${targetThreads.length} 个线程）`;

            const toggleButton = document.createElement("span");
            toggleButton.innerHTML = this.collapsedTargets[targetName]
              ? `
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>`
              : `
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>`;
            toggleButton.style.fontSize = "12px";

            headerDiv.appendChild(headerText);
            headerDiv.appendChild(toggleButton);

            headerDiv.addEventListener("click", () => {
              this.collapsedTargets[targetName] =
                !this.collapsedTargets[targetName];
              this._updateThreadViewer(true);
            });

            container.appendChild(headerDiv);

            if (!this.collapsedTargets[targetName]) {
              targetThreads.forEach((thread, index) => {
                let topBlock = null;
                const B =
                  typeof Blockly !== "undefined" ? Blockly : window.Blockly;

                if (B && B.getMainWorkspace && thread.topBlock) {
                  topBlock = B.getMainWorkspace().blockDB_[thread.topBlock];
                }

                const executionTimeKey = `thread_${thread.topBlock}_executionTime`;
                const executionTime =
                  _threadExecutionTimes[executionTimeKey] || 0;
                const showExecutionTime = executionTime > 0;

                if (!this.performanceMode) {
                  const messageDiv = document.createElement("div");
                  Object.assign(messageDiv.style, {
                    paddingBottom: "5px",
                    paddingTop: "5px",
                    color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
                    border: "1px dashed #444",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    width: "100%",
                    marginLeft: "15px",
                    cursor: "pointer",
                  });

                  let labelText = `线程 ${index + 1}`;
                  if (showExecutionTime) {
                    labelText += `（${executionTime.toFixed(2)}ms）`;
                  }
                  messageDiv.textContent = labelText;

                  if (!this.packaged) {
                    messageDiv.addEventListener("click", () => {
                      if (B && B.getMainWorkspace && thread.topBlock) {
                        const workspace = B.getMainWorkspace();
                        const block = workspace.getBlockById(thread.topBlock);

                        if (block) {
                          if (typeof workspace.centerOnBlock === "function") {
                            workspace.centerOnBlock(thread.topBlock);
                          } else if (block.scrollIntoView) {
                            block.scrollIntoView();
                          }
                        }
                      }
                    });
                  }

                  container.appendChild(messageDiv);
                  return;
                }

                if (topBlock && topBlock.svgGroup_) {
                  let svgData = topBlock.svgGroup_.outerHTML;
                  svgData = svgData.replace(/ transform="[^"]*"/, "");
                  svgData = svgData.replace(/ filter="[^"]*"/, "");
                  svgData = svgData.replace(/&nbsp;/g, " ");

                  const bbox = topBlock.svgGroup_.getBBox();
                  const w = bbox.width;
                  const h = bbox.height;

                  const cssMatches = svgData.match(
                    /<style[^>]*>[\s\S]*?<\/style>/gi
                  );
                  let extractedCss = "";
                  if (cssMatches) {
                    extractedCss = cssMatches.join("\n");
                    svgData = svgData.replace(
                      /<style[^>]*>[\s\S]*?<\/style>/gi,
                      ""
                    );
                  }

                  const css = `
                        <style>
                          .blocklyText {
                            fill: #fff;
                            font-family: "Helvetica Neue", Helvetica, sans-serif;
                            font-size: 12pt;
                            font-weight: 500;
                          }
                          .blocklyNonEditableText>text, .blocklyEditableText>text {
                            fill: #575E75;
                          }
                          .blocklyDropdownText {
                            fill: #fff !important;
                          }
                          path { fill-opacity: 1; }
                          ${extractedCss}
                        </style>
                      `;

                  const fullSvg = `
                     <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${bbox.x} ${bbox.y} ${w} ${h}">
                       ${css}
                       ${svgData}
                     </svg>
                   `;

                  const wrapper = document.createElement("div");
                  Object.assign(wrapper.style, {
                    border:
                      "1px solid var(--ui-black-transparent, hsla(0, 0%, 0%, 0.15))",
                    borderRadius: "3px",
                    background: "var(--ui-secondary, hsl(0, 0%, 100%))",
                    minHeight: "40px",
                    width: "100%",
                    height: `${h}px`,
                    position: "relative",
                    marginBottom: "8px",
                  });
                  container.appendChild(wrapper);

                  const label = document.createElement("div");
                  let labelText = `线程 ${index + 1}`;
                  if (showExecutionTime) {
                    labelText += `（${executionTime.toFixed(2)}ms）`;
                  }
                  label.textContent = labelText;
                  Object.assign(label.style, {
                    position: "absolute",
                    top: "2px",
                    left: "2px",
                    color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
                    fontSize: "10px",
                    padding: "1px 3px",
                    borderRadius: "2px",
                    zIndex: "10",
                    pointerEvents: "none",
                  });
                  wrapper.appendChild(label);

                  const copyButton = document.createElement("button");
                  copyButton.textContent = "复制 PNG";
                  Object.assign(copyButton.style, {
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "10px",
                    padding: "2px 4px",
                    cursor: "pointer",
                    zIndex: "11",
                  });
                  wrapper.appendChild(copyButton);

                  const dynamicContentContainer = document.createElement("div");
                  Object.assign(dynamicContentContainer.style, {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    overflowX: "scroll",
                    overflowY: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--ui-secondary, hsl(0, 0%, 100%))",
                    zIndex: "1",
                  });
                  wrapper.appendChild(dynamicContentContainer);

                  const img = new Image();
                  let hasLoaded = false;
                  let pngImg = null;

                  const handleClick = () => {
                    if (B && B.getMainWorkspace && thread.topBlock) {
                      const workspace = B.getMainWorkspace();
                      const block = workspace.getBlockById(thread.topBlock);

                      if (block) {
                        if (typeof workspace.centerOnBlock === "function") {
                          workspace.centerOnBlock(thread.topBlock);
                        } else if (block.scrollIntoView) {
                          block.scrollIntoView();
                        }
                      }
                    }
                  };

                  const copyToClipboard = (dataUrl) => {
                    fetch(dataUrl)
                      .then((res) => res.blob())
                      .then((blob) => {
                        navigator.clipboard
                          .write([new ClipboardItem({ [blob.type]: blob })])
                          .then(() => {
                            const originalText = copyButton.textContent;
                            copyButton.textContent = "已复制！";
                            setTimeout(() => {
                              copyButton.textContent = originalText;
                            }, 1000);
                          })
                          .catch((err) => {
                            console.error("复制图片失败：", err);
                          });
                      });
                  };

                  copyButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (pngImg) {
                      copyToClipboard(pngImg.src);
                    }
                  });

                  wrapper.addEventListener("click", handleClick);

                  const showSvgPreview = () => {
                    if (hasLoaded) return;
                    hasLoaded = true;
                    dynamicContentContainer.innerHTML = "";
                    dynamicContentContainer.innerHTML += fullSvg;
                    const svgEl = dynamicContentContainer.querySelector("svg");
                    if (svgEl) {
                      svgEl.style.maxWidth = "100%";
                      svgEl.style.height = "auto";
                    }
                  };

                  const hideSvgPreview = () => {
                    if (!hasLoaded) return;
                    hasLoaded = false;
                    dynamicContentContainer.innerHTML = "";
                    if (pngImg) {
                      dynamicContentContainer.appendChild(pngImg);
                    }
                  };

                  img.onload = () => {
                    if (hasLoaded) return;
                    const canvas = document.createElement("canvas");
                    const MAX_HEIGHT = 1000;
                    let scale =
                      img.height > MAX_HEIGHT ? MAX_HEIGHT / img.height : 1;

                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    pngImg = document.createElement("img");
                    pngImg.src = canvas.toDataURL("image/png");
                    Object.assign(pngImg.style, {
                      height: "auto",
                      display: "block",
                      width: `${w}px`,
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    });
                    dynamicContentContainer.appendChild(pngImg);

                    wrapper.addEventListener("mouseenter", showSvgPreview);
                    wrapper.addEventListener("mouseleave", hideSvgPreview);
                  };

                  img.onerror = () => {
                    showSvgPreview();
                  };

                  img.src =
                    "data:image/svg+xml;base64," +
                    btoa(
                      encodeURIComponent(fullSvg).replace(
                        /%([0-9A-F]{2})/g,
                        function toSolidBytes(match, p1) {
                          return String.fromCharCode("0x" + p1);
                        }
                      )
                    );
                } else {
                  const messageDiv = document.createElement("div");
                  Object.assign(messageDiv.style, {
                    paddingBottom: "5px",
                    paddingTop: "5px",
                    color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
                    border: "1px dashed #444",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    width: "100%",
                    marginLeft: "15px",
                    cursor: "pointer",
                  });

                  let labelText = `线程 ${index + 1}`;
                  if (showExecutionTime) {
                    labelText += `（${executionTime.toFixed(2)}ms）`;
                  }
                  messageDiv.textContent = labelText;

                  messageDiv.addEventListener("click", () => {
                    if (B && B.getMainWorkspace && thread.topBlock) {
                      const workspace = B.getMainWorkspace();
                      const block = workspace.getBlockById(thread.topBlock);

                      if (block) {
                        if (typeof workspace.centerOnBlock === "function") {
                          workspace.centerOnBlock(thread.topBlock);
                        } else if (block.scrollIntoView) {
                          block.scrollIntoView();
                        }
                      }
                    }
                  });

                  container.appendChild(messageDiv);
                }
              });
            }
          });
        } else {
          const messageDiv = document.createElement("div");
          Object.assign(messageDiv.style, {
            paddingBottom: "5px",
            paddingTop: "5px",
            color: "#888",
            fontFamily: "monospace",
            fontSize: "10px",
            width: "100%",
          });
          messageDiv.textContent = "没有正在运行的线程。";
          container.appendChild(messageDiv);
        }
      }
    }

    log({ TEXT }) {
      const entry = { text: TEXT };
      this.logEntries.push(entry);
      if (this.logEntries.length > this.LOG_LIMIT) {
        this.logEntries.shift();
      }
      this._performLogUpdate();
    }

    _formatLogItem(text) {
      if (!text) return "";
      let safeText = String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      const colorRegex = /\[__COLOR:(#[0-9A-Fa-f]{6})__\](.*?)\[__END__\]/g;
      return safeText.replace(
        colorRegex,
        (match, color, content) =>
          `<span style="color: ${color}">${content}</span>`
      );
    }

    _exportLogsToHtml() {
      const logHTML = this.logEntries
        .map((entry) => {
          const formatted = this._formatLogItem(entry.text);
          return `<div>${formatted}</div>`;
        })
        .join("\n");

      const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>调试器日志导出</title>
    <meta charset="utf-8">
    <style>
        body {
            background: #141416;
            color: #eee;
            font-family: monospace;
            font-size: 14px;
            padding: 10px;
        }
        div {
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.2;
            padding: 2px 0;
            color: #ccc;
        }
    </style>
</head>
<body>
${logHTML}
</body>
</html>
        `;

      const blob = new Blob([fullHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `debugger-logs-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    _performLogUpdate() {
      if (!this.userScrolledUp && this.logContentArea.style.display !== "none") {
        this.logContentArea.scrollTop = this.logContentArea.scrollHeight;
      }
      this._updateVirtualScroll();
      if (this.scrollToBottomButton) this.scrollToBottomButton.click();
    }

    _updateVirtualScroll() {
      if (!this.logContentArea || this.logContentArea.style.display === "none")
        return;
      const totalHeight = this.logEntries.length * this.averageEntryHeight;
      this.scrollSizer.style.height = `${totalHeight}px`;
      const scrollTop = this.logContentArea.scrollTop;
      const clientHeight = this.logContentArea.clientHeight;
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / this.averageEntryHeight) - this.renderBufferSize
      );
      const endIndex = Math.min(
        this.logEntries.length,
        Math.ceil((scrollTop + clientHeight) / this.averageEntryHeight) +
          this.renderBufferSize
      );
      this.logContainer.innerHTML = "";

      let currentTop = startIndex * this.averageEntryHeight;

      for (let i = startIndex; i < endIndex; i++) {
        const entry = this.logEntries[i];
        const div = document.createElement("div");
        Object.assign(div.style, {
          position: "absolute",
          top: `${currentTop}px`,
          left: "6px",
          right: "6px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "var(--text-primary, hsla(225, 15%, 40%, 1))",
        });

        div.innerHTML = this._formatLogItem(entry.text);
        this.logContainer.appendChild(div);

        div.style.width = "calc(100% - 12px)";
        const rect = div.getBoundingClientRect();
        const height = rect.height || this.averageEntryHeight;
        currentTop += height;
      }
    }

    clear() {
      this.logEntries = [];
      this._updateVirtualScroll();
    }

    pause() {
      const rt = this.runtime || (Scratch.vm && Scratch.vm.runtime);
      if (!rt) return;

      const nextPaused = !rt.paused;

      if (typeof rt.setPaused === "function") {
        rt.setPaused(nextPaused);
        return;
      }

      if (nextPaused) {
        if (typeof rt.pause === "function") {
          rt.pause();
          return;
        }
      } else {
        if (typeof rt.play === "function") {
          rt.play();
          return;
        }
      }

      rt.paused = nextPaused;
      if (typeof rt.emit === "function") {
        rt.emit(nextPaused ? "RUNTIME_PAUSED" : "RUNTIME_UNPAUSED");
      }
    }

    commandWasRan() {
      if (this.ranCommand) {
        this.ranCommand = false;
        return true;
      }
      return false;
    }

    getCommand() {
      return this.commandText || "";
    }

    _handleScroll() {
      if (!this.logContentArea) return;
      const isAtBottom =
        this.logContentArea.scrollTop >=
        this.logContentArea.scrollHeight -
          this.logContentArea.clientHeight -
          10;
      this.userScrolledUp = !isAtBottom;
      this._updateVirtualScroll();
    }
  }

  Scratch.extensions.register(new DebuggerExtensionTS());
})(Scratch);

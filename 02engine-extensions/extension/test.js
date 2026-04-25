(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('请勾上“在非沙盒环境下运行”');
  }
  let {
    Cast,
    ArgumentType,
    BlockType,
    vm
  } = Scratch;
  console.log("WebBuilder扩展已加载");
  const 初始网页内容 = `
  <html lang="zh-CN">
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>WebBuilder搭建的网页</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <body>
  <script>
  window.addEventListener('message', (event) => {
  eval(event.data);
  });
  </script>
  </body>
  </html>
  `;
  //创建Iframe
  let WebBuilderIframe = document.createElement("iframe");
  WebBuilderIframe.id = "WebBuilder";
  WebBuilderIframe.style.position = "absolute";
  WebBuilderIframe.style.width = "100%";
  WebBuilderIframe.style.height = "100%";
  WebBuilderIframe.style.border = "none";
  WebBuilderIframe.style.transformOrigin = "center center";
  vm.runtime.renderer.canvas.parentElement.prepend(WebBuilderIframe);


  function delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  function 发送代码(代码) {
    WebBuilderIframe.contentWindow.postMessage(代码, "*");
  }

  function 创建元素(名, 类型) {
    发送代码(`let 新元素 = document.createElement('${类型}');
      新元素.id = '${名}';
      document.body.appendChild(新元素);
      `);
  }

  function 嵌套元素(父元素, 名, 类型) {
    发送代码(`let 父元素 = document.getElementsById('${父元素}');
      let 子元素 = document.createElement('${类型}');
      子元素.id = '${名}';
      父元素.appendChild(子元素);
      }`);
  }

  function 删除元素(名) {
    发送代码(`document.getElementsById('${名}').remove();`);
  }

  function 设置内容(名, 内容) {
    发送代码(`document.getElementsById('${名}').innerHTML = '${内容}';`);
  }

  function 修改元素属性(名, 属性, 值) {
    发送代码(`document.getElementsById('${名}')['${属性}'] = '${值}';`);
  }

  function 修改元素样式(名, 样式, 值) {
    发送代码(`document.getElementsById('${名}').style['${样式}'] = '${值}';`);
  }

  function 事件监听(名, 事件类型, 回调函数, 参数) {
    发送代码(`document.getElementsById('${名}').addEventListener('${事件类型}',function(${参数}) {${回调函数}}); `);
  }

  class WebBuilder {
    getInfo() {
      return {
        id: "WebBuilder",
        name: "网页开发",
        color1: "#68cdff",
        color2: "#68cdff",
        color3: "#68cdff",
        blocks: [{
          opcode: "初始化",
          blockType: BlockType.COMMAND,
          text: "初始化",

        },
          {
            blockType: BlockType.LABEL,
            text: "内容结构操作",
          },
          {
            opcode: "创建元素",
            blockType: BlockType.COMMAND,
            text: "创建元素[名]类型[类型]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
              类型: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "div",
              },
            },
          },
          {
            opcode: "设置内容",
            blockType: BlockType.COMMAND,
            text: "设置元素[名]内容[内容]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
              内容: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "你好，世界！",
              },
            },
          },
          {
            opcode: "嵌套元素",
            blockType: BlockType.COMMAND,
            text: "元素[元素]中嵌套元素[名]类型[类型]",
            arguments: {
              元素: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "父元素",
              },
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "子元素",
              },
              类型: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "input",
              },
            },
          },
          {
            opcode: "标签",
            blockType: BlockType.REPORTER,
            text: "快速类型[类型]",
            arguments: {
              类型: {
                type: Scratch.ArgumentType.STRING,
                menu: "标签",
              },
            },
          },
          {
            opcode: "表单元素",
            blockType: BlockType.REPORTER,
            text: "表单类型[类型]",
            arguments: {
              类型: {
                type: Scratch.ArgumentType.STRING,
                menu: "表单元素",
              },
            },
          },
          {
            opcode: "多媒体元素",
            blockType: BlockType.REPORTER,
            text: "多媒体类型[类型]",
            arguments: {
              类型: {
                type: Scratch.ArgumentType.STRING,
                menu: "多媒体元素",
              },
            },
          },
          {
            opcode: "其他元素",
            blockType: BlockType.REPORTER,
            text: "其他类型[类型]",
            arguments: {
              类型: {
                type: Scratch.ArgumentType.STRING,
                menu: "其他元素",
              },
            },
          },
          {
            opcode: "删除元素",
            blockType: BlockType.COMMAND,
            text: "删除[名]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
            },
          },

          {
            opcode: "获取元素内容",
            blockType: BlockType.REPORTER,
            text: "获取[名]的内容",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
            },
          },
          {
            opcode: "设置属性",
            blockType: BlockType.COMMAND,
            text: "设置元素[名]属性[属性]值[值]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
              属性: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "class",
              },
              值: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "属性值",
              },
            },
          },
          {
            blockType: BlockType.LABEL,
            text: "样式操作",
          },
          {
            opcode: "设置样式",
            blockType: BlockType.COMMAND,
            text: "设置元素[名]样式[样式]值[值]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
              样式: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "color",
              },
              值: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "red",
              },
            },
          },
          {
            opcode: "文本样式",
            blockType: BlockType.REPORTER,
            text: "文本样式[类型]",
            arguments: {
              类型: {
                type: Scratch.ArgumentType.STRING,
                menu: "文本样式",
              },
            },
          },
          {
            blockType: BlockType.LABEL,
            text: "逻辑脚本操作",
          },
          {
            opcode: "事件监听",
            blockType: BlockType.COMMAND,
            text: "当[名]被[事件]执行>参数[参数]函数[函数]",
            arguments: {
              名: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "元素",
              },
              事件: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "事件",
              },
              参数: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "参数",
              },
              函数: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "函数",
              },
            },
          },
          {
            opcode: "鼠标事件",
            blockType: BlockType.REPORTER,
            text: "鼠标[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "鼠标事件",
              },
            },
          },
          {
            opcode: "键盘事件",
            blockType: BlockType.REPORTER,
            text: "键盘[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "键盘事件",
              },
            },
          },
          {
            opcode: "表单事件",
            blockType: BlockType.REPORTER,
            text: "表单[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "表单事件",
              },
            },
          },
          {
            opcode: "页面生命周期事件",
            blockType: BlockType.REPORTER,
            text: "页面[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "页面生命周期事件",
              },
            },
          },
          {
            opcode: "定时器事件",
            blockType: BlockType.REPORTER,
            text: "定时器[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "定时器事件",
              },
            },
          },
          {
            opcode: "触摸事件",
            blockType: BlockType.REPORTER,
            text: "触摸[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "触摸事件",
              },
            },
          },
          {
            opcode: "页面滚动事件",
            blockType: BlockType.REPORTER,
            text: "页面滚动[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "页面滚动事件",
              },
            },
          },
          {
            opcode: "窗口大小改变事件",
            blockType: BlockType.REPORTER,
            text: "窗口[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "窗口大小改变事件",
              },
            },
          },
          {
            opcode: "鼠标滚轮事件",
            blockType: BlockType.REPORTER,
            text: "鼠标滚轮[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "鼠标滚轮事件",
              },
            },
          },
          {
            opcode: "表格事件",
            blockType: BlockType.REPORTER,
            text: "表格[事件]",
            arguments: {
              事件: {
                type: Scratch.ArgumentType.STRING,
                menu: "表格事件",
              },
            },
          },
          {
            opcode: "回调函数",
            blockType: BlockType.REPORTER,
            text: "代码[代码]",
            arguments: {
              代码: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "代码",
              },
            },
          },
          {
            opcode: "插入脚本",
            blockType: BlockType.COMMAND,
            text: "插入脚本[代码]",
            arguments: {
              代码: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "alert('你好，世界！');",
              },
            },
          },
          {
            blockType: BlockType.LABEL,
            text: "获取网站代码",
          },
          {
            opcode: "网站代码",
            blockType: BlockType.REPORTER,
            text: "网站代码",
          },
        ],
        menus: {
          标签: {
            items: [{
              text: "div",
              value: "div"
            },
              {
                text: "标题",
                value: "h1"
              },
              {
                text: "段落",
                value: "p"
              },
              {
                text: "链接",
                value: "a"
              },
              {
                text: "图片",
                value: "img"
              },
              {
                text: "无序列表",
                value: "ul"
              },
              {
                text: "有序列表",
                value: "ol"
              },
              {
                text: "表格",
                value: "table"
              },
              {
                text: "表头",
                value: "thead"
              },
              {
                text: "表体",
                value: "tbody"
              },
              {
                text: "表尾",
                value: "tfoot"
              },
              {
                text: "单元格",
                value: "td"
              },
              {
                text: "表头单元格",
                value: "th"
              },
              {
                text: "换行",
                value: "br"
              },
              {
                text: "水平线",
                value: "hr"
              },
              {
                text: "弹出式提示",
                value: "tooltip"
              },
              {
                text: "标签组",
                value: "fieldset"
              },
              {
                text: "选项分组",
                value: "optgroup"
              },
              {
                text: "定义列表",
                value: "dl"
              },
              {
                text: "定义项",
                value: "dt"
              },
              {
                text: "定义描述",
                value: "dd"
              },
              {
                text: "水平规则",
                value: "hr"
              },
              {
                text: "热点区域",
                value: "area"
              },
              {
                text: "预格式化文本",
                value: "pre"
              },
              {
                text: "细节内容",
                value: "details"
              },
              {
                text: "摘要",
                value: "summary"
              },
            ],
          },
          文本样式: {
            items: [{
              text: "加粗文本",
              value: "strong"
            },
              {
                text: "斜体文本",
                value: "em"
              },
              {
                text: "下划线文本",
                value: "u"
              },
              {
                text: "删除线文本",
                value: "s"
              },
              {
                text: "上标文本",
                value: "sup"
              },
              {
                text: "下标文本",
                value: "sub"
              },
              {
                text: "文字注音",
                value: "ruby"
              },
              {
                text: "正文注音",
                value: "rt"
              },
              {
                text: "扩展注音",
                value: "rp"
              },
              {
                text: "强调文本",
                value: "em"
              },
              {
                text: "斜体文本",
                value: "i"
              },
              {
                text: "加粗文本",
                value: "b"
              },
              {
                text: "删除线文本",
                value: "s"
              },
              {
                text: "下划线文本",
                value: "u"
              },
              {
                text: "引用文本",
                value: "quote"
              },
            ],
          },
          表单元素: {
            items: [{
              text: "输入框",
              value: "input"
            },
              {
                text: "输入区域",
                value: "textarea"
              },
              {
                text: "复选框",
                value: "checkbox"
              },
              {
                text: "单选按钮",
                value: "radio"
              },
              {
                text: "下拉菜单",
                value: "select"
              },
              {
                text: "选项",
                value: "option"
              },
              {
                text: "进度条",
                value: "progress"
              },
              {
                text: "自动完成",
                value: "autocomplete"
              },
            ],
          },
          多媒体元素: {
            items: [{
              text: "视频",
              value: "video"
            },
              {
                text: "音频",
                value: "audio"
              },
              {
                text: "画布",
                value: "canvas"
              },
              {
                text: "地图",
                value: "map"
              },
              {
                text: "嵌入式内容",
                value: "embed"
              },
              {
                text: "内嵌框架",
                value: "iframe"
              },
              {
                text: "源文件",
                value: "source"
              },
            ],
          },
          其他元素: {
            items: [{
              text: "滚动条",
              value: "scrollbar"
            },
              {
                text: "滚动区域",
                value: "scrollbox"
              },
              {
                text: "本地存储",
                value: "localStorage"
              },
              {
                text: "会话存储",
                value: "sessionStorage"
              },
              {
                text: "IndexedDB",
                value: "IndexedDB"
              },
              {
                text: "图片集",
                value: "srcset"
              },
              {
                text: "键盘输入",
                value: "kbd"
              },
              {
                text: "代码",
                value: "code"
              },
              {
                text: "上下文菜单",
                value: "menu"
              },
              {
                text: "标签页",
                value: "tab"
              },
              {
                text: "引用块",
                value: "blockquote"
              },
              {
                text: "短引用",
                value: "q"
              },
              {
                text: "大字体",
                value: "big"
              },
              {
                text: "小字体",
                value: "small"
              },
              {
                text: "键盘输入",
                value: "kbd"
              },
            ],
          },

          鼠标事件: {
            items: [{
              text: "单击",
              value: "click",
            },
              {
                text: "双击",
                value: "dblclick",
              },
              {
                text: "悬停",
                value: "mouseover",
              },
              {
                text: "移出",
                value: "mouseout",
              },
              {
                text: "按下",
                value: "mousedown",
              },
              {
                text: "松开",
                value: "mouseup",
              },
            ],
          },
          键盘事件: {
            items: [{
              text: "按下",
              value: "keydown",
            },
              {
                text: "松开",
                value: "keyup",
              },
              {
                text: "按下并松开",
                value: "keypress",
              },
            ],
          },
          表单事件: {
            items: [{
              text: "提交",
              value: "submit",
            },
              {
                text: "重置",
                value: "reset",
              },
              {
                text: "输入内容变化",
                value: "input",
              },
              {
                text: "元素值改变",
                value: "change",
              },
              {
                text: "选择文本",
                value: "select",
              },
            ],
          },
          页面生命周期事件: {
            items: [{
              text: "加载完成",
              value: "load",
            },
              {
                text: "即将关闭",
                value: "beforeunload",
              },
              {
                text: "关闭",
                value: "unload",
              },
            ],
          },
          定时器事件: {
            items: [{
              text: "延迟执行",
              value: "setTimeout",
            },
              {
                text: "间隔执行",
                value: "setInterval",
              },
              {
                text: "清除定时器(clearTimeout)",
                value: "clearTimeout",
              },
              {
                text: "清除定时器(clearInterval)",
                value: "clearInterval",
              },
            ],
          },
          触摸事件: {
            items: [{
              text: "开始",
              value: "touchstart",
            },
              {
                text: "结束",
                value: "touchend",
              },
              {
                text: "移动",
                value: "touchmove",
              },
              {
                text: "取消",
                value: "touchcancel",
              },
            ],
          },
          页面滚动事件: {
            items: [{
              text: "滚动",
              value: "scroll",
            },
            ],
          },
          窗口大小改变事件: {
            items: [{
              text: "大小改变",
              value: "resize",
            },
            ],
          },
          鼠标滚轮事件: {
            items: [{
              text: "滚动",
              value: "mousewheel",
            },
              {
                text: "滚动",
                value: "DOMMouseScroll",
              },
            ],
          },
          表格事件: {
            items: [{
              text: "表格行点击",
              value: "rowclick",
            },
              {
                text: "表格单元格点击",
                value: "cellclick",
              },
              {
                text: "鼠标悬停在表格行上",
                value: "rowmouseover",
              },
              {
                text: "鼠标悬停在表格单元格上",
                value: "cellmouseover",
              },
            ],
          },
        },
      };
    }
    async 初始化() {
      WebBuilderIframe.srcdoc = 初始网页内容;
      await delay(200);
    }
    创建元素({
      名, 类型
    }) {
      创建元素(名, 类型);
    }

    嵌套元素({
      元素, 名, 类型
    }) {
      嵌套元素(元素, 名, 类型);
    }

    删除元素({
      名
    }) {
      删除元素(名);
    }
    设置内容({
      名, 内容
    }) {
      设置内容(名, 内容);
    }
    设置属性({
      名, 属性, 值
    }) {
      修改元素属性(名, 属性, 值);
    }
    设置样式({
      名, 样式, 值
    }) {
      修改元素样式(名, 样式, 值);
    }

    获取元素内容({
      名
    }) {
      return WebBuilderIframe.querySelector('#'+名)
    }
    事件监听({
      名, 事件, 函数, 参数
    }) {
      事件监听(名, 事件, 函数, 参数);
    }
    回调函数({
      代码
    }) {
      return 代码;
    }
    插入脚本({
      代码
    }) {
      发送代码(`
        var 脚本容器 = document.createElement('script');
        脚本容器.innerHTML = "${代码}";
        document.body.appendChild(脚本容器);
        `);
    }
    网站代码() {
      const iframeContent =
      WebBuilderIframe.contentDocument || WebBuilderIframe.contentWindow.document;
      return iframeContent.documentElement.innerHTML;
    }
    鼠标事件({
      事件
    }) {
      return 事件;
    }
    键盘事件({
      事件
    }) {
      return 事件;
    }
    表单事件({
      事件
    }) {
      return 事件;
    }
    页面生命周期事件({
      事件
    }) {
      return 事件;
    }
    定时器事件({
      事件
    }) {
      return 事件;
    }
    触摸事件({
      事件
    }) {
      return 事件;
    }
    页面滚动事件({
      事件
    }) {
      return 事件;
    }
    窗口大小改变事件({
      事件
    }) {
      return 事件;
    }
    鼠标滚轮事件({
      事件
    }) {
      return 事件;
    }
    表格事件({
      事件
    }) {
      return 事件;
    }

    标签({
      类型
    }) {
      return 类型;
    }
    文本样式({
      类型
    }) {
      return 类型;
    }
    表单元素({
      类型
    }) {
      return 类型;
    }
    多媒体元素({
      类型
    }) {
      return 类型;
    }
    其他元素({
      类型
    }) {
      return 类型;
    }
  }

  Scratch.extensions.register(new WebBuilder());
})(Scratch);
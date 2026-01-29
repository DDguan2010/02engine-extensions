(function(Scratch) {
    'use strict';

    // 核心数据存储：管理所有页面和元素信息
    const pageManager = {
        pages: {}, // 页面集合：{页面名: {texts: {}, buttons: {}, images: {}, inputs: {}}}
        currentPage: '', // 当前显示的页面名称

        // 初始化页面（新建页面时调用）
        initPage(pageName) {
            if (!this.pages[pageName]) {
                this.pages[pageName] = {
                    texts: {},     // 文本元素：{元素名: 属性对象}
                    buttons: {},   // 按钮元素：{元素名: 属性对象}
                    images: {},    // 图片元素：{元素名: 属性对象}
                    inputs: {}     // 输入框元素：{元素名: 属性对象}
                };
                // 若当前无显示页面，默认设为新页面
                if (!this.currentPage) {
                    this.currentPage = pageName;
                }
            }
        },

        // 删除指定页面
        deletePage(pageName) {
            delete this.pages[pageName];
            // 若删除的是当前页面，清空当前页面
            if (this.currentPage === pageName) {
                this.currentPage = '';
            }
        },

        // 删除所有页面
        deleteAllPages() {
            this.pages = {};
            this.currentPage = '';
        },

        // 生成指定页面的HTML代码
        generatePageHTML(pageName) {
            const page = this.pages[pageName];
            if (!page) return '<div>页面不存在</div>';

            // 基础样式重置
            let html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; position: absolute; }
                        body { background: transparent; }
                    </style>
                </head>
                <body>
            `;

            // 生成文本元素HTML
            Object.entries(page.texts).forEach(([name, props]) => {
                const textAlign = props.align || 'left';
                const whiteSpace = props.multiline ? 'normal' : 'nowrap';
                html += `
                    <div id="text-${name}" 
                         style="left: ${props.x}px; top: ${props.y}px; width: ${props.width}px; height: ${props.height}px; 
                                opacity: ${props.opacity/100}; font-family: ${props.font}; font-size: ${props.fontSize}px; 
                                font-weight: ${props.bold ? 'bold' : 'normal'}; text-align: ${textAlign}; color: ${props.color};
                                white-space: ${whiteSpace}; cursor: pointer;"
                         onclick="navigator.clipboard.writeText('${props.clipboardText || ''}')">
                        ${props.content || ''}
                    </div>
                `;
            });

            // 生成按钮元素HTML
            Object.entries(page.buttons).forEach(([name, props]) => {
                const textAlign = props.align || 'left';
                const whiteSpace = props.multiline ? 'normal' : 'nowrap';
                html += `
                    <button id="btn-${name}" 
                            style="left: ${props.x}px; top: ${props.y}px; width: ${props.width}px; height: ${props.height}px; 
                                   opacity: ${props.opacity/100}; font-family: ${props.font}; font-size: ${props.fontSize}px; 
                                   font-weight: ${props.bold ? 'bold' : 'normal'}; text-align: ${textAlign}; 
                                   background-color: ${props.btnColor}; color: ${props.fontColor}; border: none; cursor: pointer;"
                            onclick="navigator.clipboard.writeText('${props.clipboardText || ''}')">
                        ${props.content || ''}
                    </button>
                `;
            });

            // 生成图片元素HTML
            Object.entries(page.images).forEach(([name, props]) => {
                html += `
                    <img id="img-${name}" 
                         src="${props.url || ''}" 
                         style="left: ${props.x}px; top: ${props.y}px; width: ${props.width}px; height: ${props.height}px; 
                                opacity: ${props.opacity/100}; cursor: pointer;"
                         onclick="navigator.clipboard.writeText('${props.clipboardText || ''}')">
                `;
            });

            // 生成输入框元素HTML
            Object.entries(page.inputs).forEach(([name, props]) => {
                const inputTag = props.multiline ? 'textarea' : 'input';
                const textAlign = props.align || 'left';
                html += `
                    <${inputTag} id="input-${name}" 
                                 placeholder="${props.placeholder || ''}" 
                                 style="left: ${props.x}px; top: ${props.y}px; width: ${props.width}px; height: ${props.height}px; 
                                        font-family: ${props.font}; font-size: ${props.fontSize}px; font-weight: ${props.bold ? 'bold' : 'normal'}; 
                                        text-align: ${textAlign}; color: ${props.fontColor}; border: 1px solid #ccc; padding: 4px;"
                                 onchange="navigator.clipboard.writeText(JSON.stringify({
                                     input: this.value,
                                     attachment: '${props.attachment || ''}'
                                 }))">${props.multiline ? props.defaultContent || '' : ''}</${inputTag}>
                    ${!props.multiline ? `<script>document.getElementById('input-${name}').value = '${props.defaultContent || ''}'</script>` : ''}
                `;
            });

            // 闭合HTML标签
            html += `
                </body>
                </html>
            `;

            return html;
        },

        // 实时渲染页面到Scratch舞台
        renderPageToStage(pageName) {
            const html = this.generatePageHTML(pageName);
            // 查找/创建舞台中的HTML显示容器
            let container = document.getElementById('scratch-html-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'scratch-html-container';
                container.style.position = 'absolute';
                container.style.top = '10px';
                container.style.left = '10px';
                container.style.width = '400px';
                container.style.height = '300px';
                container.style.zIndex = '100';
                container.style.border = '1px solid #ccc';
                // 插入到Scratch舞台区域（适配官方编辑器结构）
                const stage = document.querySelector('.stage-wrapper') || document.body;
                stage.appendChild(container);
            }
            // 创建iframe显示HTML内容
            let iframe = container.querySelector('iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                container.appendChild(iframe);
            }
            iframe.srcdoc = html;
        }
    };

    // 定义Scratch拓展
    class SimpleHTML {
        constructor() {
            // 拓展初始化
        }

        // 获取拓展元信息
        getInfo() {
            return {
                id: 'simpleHTML', // 拓展唯一ID
                name: '简·HTML',  // 拓展名称（显示在积木面板）
                color1: '#E63946', // 积木主色
                color2: '#D62828', // 积木次色
                blocks: [
                    // ========== 页面管理积木 ==========
                    {
                        opcode: 'createPage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '新建名为 [PAGE] 的页面',
                        arguments: {
                            PAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '首页'
                            }
                        }
                    },
                    {
                        opcode: 'deletePage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '删除名为 [PAGE] 的页面',
                        arguments: {
                            PAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '首页'
                            }
                        }
                    },
                    {
                        opcode: 'deleteAllPages',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '删除所有页面'
                    },
                    {
                        opcode: 'getCurrentPage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取当前显示的页面名称'
                    },
                    {
                        opcode: 'getAllPages',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取所有页面信息'
                    },
                    // ========== 文本元素积木 ==========
                    {
                        opcode: 'addText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '向页面 [PAGE] 添加文本 [NAME]，内容 [CONTENT]，坐标x [X] y [Y]，长 [W] 宽 [H]，是否多行 [MULTI]，不透明度 [OPACITY]，字体 [FONT]，字体大小 [FONTSIZE]，是否加粗 [BOLD]，向 [ALIGN] 对齐，颜色 [COLOR]，当文本被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            PAGE: { type: Scratch.ArgumentType.STRING, defaultValue: '首页' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '微软雅黑' },
                            FONTSIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '左' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#000000' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'modifyTextContent',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的内容为 [CONTENT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'New Text' }
                        }
                    },
                    {
                        opcode: 'modifyTextPos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的坐标为x [X] y [Y]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
                        }
                    },
                    {
                        opcode: 'modifyTextSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的长为 [W] 宽为 [H]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 120 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 }
                        }
                    },
                    {
                        opcode: 'modifyTextMulti',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的是否多行 [MULTI]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyTextOpacity',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的不透明度为 [OPACITY]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 }
                        }
                    },
                    {
                        opcode: 'modifyTextFont',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的字体为 [FONT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '宋体' }
                        }
                    },
                    {
                        opcode: 'modifyTextFontSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的字体大小为 [SIZE]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 18 }
                        }
                    },
                    {
                        opcode: 'modifyTextBold',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的字体是否加粗 [BOLD]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyTextAlign',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本向 [ALIGN] 对齐',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '中' }
                        }
                    },
                    {
                        opcode: 'modifyTextColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本的颜色为 [COLOR]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#FF0000' }
                        }
                    },
                    {
                        opcode: 'modifyTextClipboard',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的文本当文本被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文本1' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: 'clicked' }
                        }
                    },
                    // ========== 按钮元素积木 ==========
                    {
                        opcode: 'addButton',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '向页面 [PAGE] 添加按钮 [NAME]，内容 [CONTENT]，坐标x [X] y [Y]，长 [W] 宽 [H]，是否多行 [MULTI]，按钮不透明度 [OPACITY]，字体 [FONT]，字体大小 [FONTSIZE]，是否加粗 [BOLD]，向 [ALIGN] 对齐，按钮颜色 [BTNCOLOR]，字体颜色 [FONTCOLOR]，当按钮被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            PAGE: { type: Scratch.ArgumentType.STRING, defaultValue: '首页' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: '点击我' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '微软雅黑' },
                            FONTSIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 14 },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '中' },
                            BTNCOLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#4CAF50' },
                            FONTCOLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#FFFFFF' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'modifyButtonContent',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮内容为 [CONTENT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: '新按钮' }
                        }
                    },
                    {
                        opcode: 'modifyButtonPos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮坐标为x [X] y [Y]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 }
                        }
                    },
                    {
                        opcode: 'modifyButtonSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮长为 [W] 宽为 [H]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 35 }
                        }
                    },
                    {
                        opcode: 'modifyButtonMulti',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮是否多行 [MULTI]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyButtonOpacity',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮不透明度为 [OPACITY]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 90 }
                        }
                    },
                    {
                        opcode: 'modifyButtonFont',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮字体为 [FONT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '宋体' }
                        }
                    },
                    {
                        opcode: 'modifyButtonFontSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮字体大小为 [SIZE]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 }
                        }
                    },
                    {
                        opcode: 'modifyButtonBold',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮字体是否加粗 [BOLD]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyButtonAlign',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮向 [ALIGN] 对齐',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '左' }
                        }
                    },
                    {
                        opcode: 'modifyButtonColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮颜色为 [COLOR]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#2196F3' }
                        }
                    },
                    {
                        opcode: 'modifyButtonFontColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮字体颜色为 [COLOR]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#000000' }
                        }
                    },
                    {
                        opcode: 'modifyButtonClipboard',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的按钮当按钮被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '按钮1' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: 'btn_clicked' }
                        }
                    },
                    // ========== 图片元素积木 ==========
                    {
                        opcode: 'addImage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '页面 [PAGE] 添加名为 [NAME] 的图片，坐标x [X] y [Y]，长 [W] 宽 [H]，不透明度 [OPACITY]，URL/Base64为 [URL]，当图片被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            PAGE: { type: Scratch.ArgumentType.STRING, defaultValue: '首页' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://via.placeholder.com/100' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'modifyImagePos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的图片坐标x [X] y [Y]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 110 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 110 }
                        }
                    },
                    {
                        opcode: 'modifyImageSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的图片长为 [W] 宽为 [H]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 120 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 120 }
                        }
                    },
                    {
                        opcode: 'modifyImageOpacity',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的图片不透明度为 [OPACITY]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            OPACITY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 }
                        }
                    },
                    {
                        opcode: 'modifyImageURL',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的图片URL/Base64为 [URL]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://via.placeholder.com/120' }
                        }
                    },
                    {
                        opcode: 'modifyImageClipboard',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的图片被点击设置剪贴板为 [CLIP]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '图片1' },
                            CLIP: { type: Scratch.ArgumentType.STRING, defaultValue: 'img_clicked' }
                        }
                    },
                    // ========== 输入框元素积木 ==========
                    {
                        opcode: 'addInput',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '向页面 [PAGE] 添加输入框 [NAME]，坐标x [X] y [Y]，长 [W] 宽 [H]，提示内容 [PLACEHOLDER]，默认内容 [DEFAULT]，是否多行 [MULTI]，字体 [FONT]，字体大小 [FONTSIZE]，是否加粗 [BOLD]，向 [ALIGN] 对齐，字体颜色 [COLOR]，附加内容 [ATTACH]',
                        arguments: {
                            PAGE: { type: Scratch.ArgumentType.STRING, defaultValue: '首页' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 150 },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 200 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
                            PLACEHOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: '请输入内容' },
                            DEFAULT: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '微软雅黑' },
                            FONTSIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 14 },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: false },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '左' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#000000' },
                            ATTACH: { type: Scratch.ArgumentType.STRING, defaultValue: '附加信息' }
                        }
                    },
                    {
                        opcode: 'modifyInputPos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框坐标x [X] y [Y]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 160 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 160 }
                        }
                    },
                    {
                        opcode: 'modifyInputSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框长为 [W] 宽为 [H]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 220 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 35 }
                        }
                    },
                    {
                        opcode: 'modifyInputPlaceholder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框提示内容为 [PLACEHOLDER]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            PLACEHOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: '新的提示' }
                        }
                    },
                    {
                        opcode: 'modifyInputDefault',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框默认内容为 [DEFAULT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            DEFAULT: { type: Scratch.ArgumentType.STRING, defaultValue: '默认值' }
                        }
                    },
                    {
                        opcode: 'modifyInputMulti',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框是否多行 [MULTI]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            MULTI: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyInputFont',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框字体为 [FONT]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            FONT: { type: Scratch.ArgumentType.STRING, defaultValue: '宋体' }
                        }
                    },
                    {
                        opcode: 'modifyInputFontSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框字体大小为 [SIZE]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 16 }
                        }
                    },
                    {
                        opcode: 'modifyInputBold',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框字体是否加粗 [BOLD]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            BOLD: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'modifyInputAlign',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框向 [ALIGN] 对齐',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            ALIGN: { type: Scratch.ArgumentType.STRING, defaultValue: '中' }
                        }
                    },
                    {
                        opcode: 'modifyInputColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改名为 [NAME] 的输入框字体颜色为 [COLOR]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '输入框1' },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#FF0000' }
                        }
                    },
                    // ========== 代码输出 & 剪贴板积木 ==========
                    {
                        opcode: 'exportPageCode',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '输出页面 [PAGE] 的代码',
                        arguments: {
                            PAGE: { type: Scratch.ArgumentType.STRING, defaultValue: '首页' }
                        }
                    },
                    {
                        opcode: 'getClipboardValue',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取剪贴板的值'
                    },
                    {
                        opcode: 'getAuthorInfo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '拓展作者：Starfall Studio'
                    }
                ]
            };
        }

        // ========== 页面管理积木实现 ==========
        createPage(args) {
            const pageName = args.PAGE;
            pageManager.initPage(pageName);
            // 实时渲染新页面
            pageManager.renderPageToStage(pageName);
        }

        deletePage(args) {
            const pageName = args.PAGE;
            pageManager.deletePage(pageName);
            // 若还有页面，渲染第一个页面；否则清空容器
            const pageList = Object.keys(pageManager.pages);
            if (pageList.length > 0) {
                pageManager.currentPage = pageList[0];
                pageManager.renderPageToStage(pageManager.currentPage);
            } else {
                const container = document.getElementById('scratch-html-container');
                if (container) container.innerHTML = '';
            }
        }

        deleteAllPages() {
            pageManager.deleteAllPages();
            const container = document.getElementById('scratch-html-container');
            if (container) container.innerHTML = '';
        }

        getCurrentPage() {
            return pageManager.currentPage || '无';
        }

        getAllPages() {
            const pageList = Object.keys(pageManager.pages);
            return JSON.stringify(pageList); // 以数组格式输出
        }

        // ========== 文本元素积木实现 ==========
        addText(args) {
            const pageName = args.PAGE;
            pageManager.initPage(pageName); // 确保页面存在
            const textName = args.NAME;
            // 对齐方式转换（中文转CSS值）
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            // 存储文本属性
            pageManager.pages[pageName].texts[textName] = {
                content: args.CONTENT,
                x: args.X,
                y: args.Y,
                width: args.W,
                height: args.H,
                multiline: args.MULTI,
                opacity: args.OPACITY,
                font: args.FONT,
                fontSize: args.FONTSIZE,
                bold: args.BOLD,
                align: alignMap[args.ALIGN] || 'left',
                color: args.COLOR,
                clipboardText: args.CLIP
            };
            // 实时渲染页面
            pageManager.renderPageToStage(pageName);
        }

        modifyTextContent(args) {
            const textName = args.NAME;
            const content = args.CONTENT;
            // 遍历所有页面查找文本元素
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].content = content;
                }
            });
            // 实时渲染当前页面
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextPos(args) {
            const textName = args.NAME;
            const x = args.X;
            const y = args.Y;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].x = x;
                    page.texts[textName].y = y;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextSize(args) {
            const textName = args.NAME;
            const w = args.W;
            const h = args.H;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].width = w;
                    page.texts[textName].height = h;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextMulti(args) {
            const textName = args.NAME;
            const multi = args.MULTI;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].multiline = multi;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextOpacity(args) {
            const textName = args.NAME;
            const opacity = args.OPACITY;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].opacity = opacity;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextFont(args) {
            const textName = args.NAME;
            const font = args.FONT;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].font = font;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextFontSize(args) {
            const textName = args.NAME;
            const size = args.SIZE;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].fontSize = size;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextBold(args) {
            const textName = args.NAME;
            const bold = args.BOLD;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].bold = bold;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextAlign(args) {
            const textName = args.NAME;
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            const align = alignMap[args.ALIGN] || 'left';
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].align = align;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextColor(args) {
            const textName = args.NAME;
            const color = args.COLOR;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].color = color;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyTextClipboard(args) {
            const textName = args.NAME;
            const clip = args.CLIP;
            Object.values(pageManager.pages).forEach(page => {
                if (page.texts[textName]) {
                    page.texts[textName].clipboardText = clip;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        // ========== 按钮元素积木实现 ==========
        addButton(args) {
            const pageName = args.PAGE;
            pageManager.initPage(pageName);
            const btnName = args.NAME;
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            pageManager.pages[pageName].buttons[btnName] = {
                content: args.CONTENT,
                x: args.X,
                y: args.Y,
                width: args.W,
                height: args.H,
                multiline: args.MULTI,
                opacity: args.OPACITY,
                font: args.FONT,
                fontSize: args.FONTSIZE,
                bold: args.BOLD,
                align: alignMap[args.ALIGN] || 'center',
                btnColor: args.BTNCOLOR,
                fontColor: args.FONTCOLOR,
                clipboardText: args.CLIP
            };
            pageManager.renderPageToStage(pageName);
        }

        modifyButtonContent(args) {
            const btnName = args.NAME;
            const content = args.CONTENT;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].content = content;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonPos(args) {
            const btnName = args.NAME;
            const x = args.X;
            const y = args.Y;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].x = x;
                    page.buttons[btnName].y = y;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonSize(args) {
            const btnName = args.NAME;
            const w = args.W;
            const h = args.H;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].width = w;
                    page.buttons[btnName].height = h;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonMulti(args) {
            const btnName = args.NAME;
            const multi = args.MULTI;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].multiline = multi;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonOpacity(args) {
            const btnName = args.NAME;
            const opacity = args.OPACITY;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].opacity = opacity;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonFont(args) {
            const btnName = args.NAME;
            const font = args.FONT;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].font = font;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonFontSize(args) {
            const btnName = args.NAME;
            const size = args.SIZE;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].fontSize = size;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonBold(args) {
            const btnName = args.NAME;
            const bold = args.BOLD;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].bold = bold;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonAlign(args) {
            const btnName = args.NAME;
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            const align = alignMap[args.ALIGN] || 'center';
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].align = align;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonColor(args) {
            const btnName = args.NAME;
            const color = args.COLOR;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].btnColor = color;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonFontColor(args) {
            const btnName = args.NAME;
            const color = args.COLOR;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].fontColor = color;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyButtonClipboard(args) {
            const btnName = args.NAME;
            const clip = args.CLIP;
            Object.values(pageManager.pages).forEach(page => {
                if (page.buttons[btnName]) {
                    page.buttons[btnName].clipboardText = clip;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        // ========== 图片元素积木实现 ==========
        addImage(args) {
            const pageName = args.PAGE;
            pageManager.initPage(pageName);
            const imgName = args.NAME;
            pageManager.pages[pageName].images[imgName] = {
                x: args.X,
                y: args.Y,
                width: args.W,
                height: args.H,
                opacity: args.OPACITY,
                url: args.URL,
                clipboardText: args.CLIP
            };
            pageManager.renderPageToStage(pageName);
        }

        modifyImagePos(args) {
            const imgName = args.NAME;
            const x = args.X;
            const y = args.Y;
            Object.values(pageManager.pages).forEach(page => {
                if (page.images[imgName]) {
                    page.images[imgName].x = x;
                    page.images[imgName].y = y;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyImageSize(args) {
            const imgName = args.NAME;
            const w = args.W;
            const h = args.H;
            Object.values(pageManager.pages).forEach(page => {
                if (page.images[imgName]) {
                    page.images[imgName].width = w;
                    page.images[imgName].height = h;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyImageOpacity(args) {
            const imgName = args.NAME;
            const opacity = args.OPACITY;
            Object.values(pageManager.pages).forEach(page => {
                if (page.images[imgName]) {
                    page.images[imgName].opacity = opacity;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyImageURL(args) {
            const imgName = args.NAME;
            const url = args.URL;
            Object.values(pageManager.pages).forEach(page => {
                if (page.images[imgName]) {
                    page.images[imgName].url = url;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyImageClipboard(args) {
            const imgName = args.NAME;
            const clip = args.CLIP;
            Object.values(pageManager.pages).forEach(page => {
                if (page.images[imgName]) {
                    page.images[imgName].clipboardText = clip;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        // ========== 输入框元素积木实现 ==========
        addInput(args) {
            const pageName = args.PAGE;
            pageManager.initPage(pageName);
            const inputName = args.NAME;
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            pageManager.pages[pageName].inputs[inputName] = {
                x: args.X,
                y: args.Y,
                width: args.W,
                height: args.H,
                placeholder: args.PLACEHOLDER,
                defaultContent: args.DEFAULT,
                multiline: args.MULTI,
                font: args.FONT,
                fontSize: args.FONTSIZE,
                bold: args.BOLD,
                align: alignMap[args.ALIGN] || 'left',
                fontColor: args.COLOR,
                attachment: args.ATTACH
            };
            pageManager.renderPageToStage(pageName);
        }

        modifyInputPos(args) {
            const inputName = args.NAME;
            const x = args.X;
            const y = args.Y;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].x = x;
                    page.inputs[inputName].y = y;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputSize(args) {
            const inputName = args.NAME;
            const w = args.W;
            const h = args.H;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].width = w;
                    page.inputs[inputName].height = h;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputPlaceholder(args) {
            const inputName = args.NAME;
            const placeholder = args.PLACEHOLDER;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].placeholder = placeholder;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputDefault(args) {
            const inputName = args.NAME;
            const defaultContent = args.DEFAULT;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].defaultContent = defaultContent;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputMulti(args) {
            const inputName = args.NAME;
            const multi = args.MULTI;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].multiline = multi;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputFont(args) {
            const inputName = args.NAME;
            const font = args.FONT;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].font = font;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputFontSize(args) {
            const inputName = args.NAME;
            const size = args.SIZE;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].fontSize = size;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputBold(args) {
            const inputName = args.NAME;
            const bold = args.BOLD;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].bold = bold;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputAlign(args) {
            const inputName = args.NAME;
            const alignMap = { '左': 'left', '中': 'center', '右': 'right' };
            const align = alignMap[args.ALIGN] || 'left';
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].align = align;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        modifyInputColor(args) {
            const inputName = args.NAME;
            const color = args.COLOR;
            Object.values(pageManager.pages).forEach(page => {
                if (page.inputs[inputName]) {
                    page.inputs[inputName].fontColor = color;
                }
            });
            pageManager.renderPageToStage(pageManager.currentPage);
        }

        // ========== 代码输出 & 剪贴板积木实现 ==========
        exportPageCode(args) {
            const pageName = args.PAGE;
            return pageManager.generatePageHTML(pageName);
        }

        async getClipboardValue() {
            try {
                // 调用剪贴板API获取内容
                const text = await navigator.clipboard.readText();
                return text;
            } catch (err) {
                return '获取失败：' + err.message;
            }
        }

        getAuthorInfo() {
            return 'Starfall'; // 输出指定值
        }
    }

    // 注册拓展到Scratch VM
    Scratch.extensions.register(new SimpleHTML());
})(Scratch);
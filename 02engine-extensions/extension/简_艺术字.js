// Name: 艺术字简化版
// Description: 简单的艺术字显示扩展
// By: YL_YOLO
// v3
(function(Scratch) {
    "use strict";

    const CUSTOM_STATE_KEY = Symbol();
    const ALIGN_LEFT = 0;
    const ALIGN_CENTER = 1;
    const ALIGN_RIGHT = 2;

    const vm = Scratch.vm;
    const renderer = vm.renderer;
    const gl = renderer.gl;

    // 自定义字体映射
    const customFonts = new Map();
    
    // 歌词数据存储
    const lyricsData = new Map();

    class SimpleTextSkin extends renderer.exports.Skin {
        constructor(id) {
            super(id, renderer);
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            
            // 文本属性
            this.text = "";
            this.color = "#FF0000";
            this.fontFamily = "sans-serif";
            this.align = ALIGN_CENTER;
            this._size = [0, 0];
            this._rotationCenter = [0, 0];
            
            // 缓存相关
            this._textureDirty = true;
            this._cachedTexture = null;
            this._cachedText = "";
            this._cachedFont = "";
            this._cachedAlign = ALIGN_CENTER;
            
            // 文本布局信息
            this.lines = [];
            this.lineCount = 0;
            this.lineWidths = [];
        }

        get size() {
            return this._size;
        }

        _getFontStyle() {
            if (customFonts.has(this.fontFamily)) {
                return `24px "${this.fontFamily}", sans-serif`;
            }
            return `24px ${this.fontFamily}`;
        }

// 修改 SimpleTextSkin 类的 _renderToCanvas 方法
_renderToCanvas() {
    const fontSize = 24;
    const padding = 10;
    const lineHeight = fontSize * 1.2;
    
    this.ctx.font = this._getFontStyle();
    
    // 直接按换行符分割，支持无限行
    this.lines = this.text.split('\n');
    this.lineCount = this.lines.length;
    
    // 计算最大行宽和总高度
    let maxLineWidth = 0;
    this.lineWidths = [];
    
    for (const line of this.lines) {
        const lineWidth = this.ctx.measureText(line).width;
        this.lineWidths.push(lineWidth);
        if (lineWidth > maxLineWidth) {
            maxLineWidth = lineWidth;
        }
    }
    
    // 关键修改：根据对齐方式设置画布宽度
    let canvasWidth;
    let baseX; // 绘制基准点
    
    if (this.align === ALIGN_CENTER) {
        // 居中对齐：正常宽度
        canvasWidth = maxLineWidth + padding * 2;
        baseX = padding;
    } else {
        // 左/右对齐：将画布宽度扩大2倍，以角色中心为基准
        canvasWidth = Math.max(maxLineWidth * 2 + padding * 2, 200); // 最小200像素
        // 基准点设为画布中心
        baseX = canvasWidth / 2;
    }
    
    const canvasHeight = this.lines.length * lineHeight + padding * 2;
    
    // 设置画布尺寸
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // 清空并绘制
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.font = this._getFontStyle();
    this.ctx.fillStyle = this.color;
    this.ctx.textBaseline = 'top';
    
    // 绘制每一行文本
    for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        const lineWidth = this.lineWidths[i];
        const y = padding + (i * lineHeight);
        
        let x;
        
        // 关键：根据对齐方式计算绘制位置
        if (this.align === ALIGN_LEFT) {
            // 居左：从画布中心开始向右绘制
            x = baseX;
        } else if (this.align === ALIGN_CENTER) {
            // 居中：在正常宽度的画布内居中
            x = baseX + (maxLineWidth - lineWidth) / 2;
        } else if (this.align === ALIGN_RIGHT) {
            // 居右：从画布中心向左绘制
            x = baseX - lineWidth;
        }
        
        this.ctx.fillText(line, x, y);
    }
    
    this._size[0] = canvasWidth;
    this._size[1] = canvasHeight;
    this._rotationCenter[0] = canvasWidth / 2;
    this._rotationCenter[1] = canvasHeight / 2;
    
    return this.canvas;
}
        getTexture(scale) {
            // 使用缓存键优化查询
            const cacheKey = `${this.text}|${this.fontFamily}|${this.align}`;
            
            if (!this._textureDirty && this._cachedKey === cacheKey && this._cachedTexture) {
                return this._cachedTexture;
            }

            this._renderToCanvas();

            if (!this._texture) {
                this._texture = renderer.exports.twgl.createTexture(gl, {
                    auto: false,
                    wrap: gl.CLAMP_TO_EDGE,
                });
            }
            
            this._setTexture(this.canvas);
            this._textureDirty = false;
            
            // 更新缓存
            this._cachedTexture = this._texture;
            this._cachedKey = cacheKey;

            return this._texture;
        }

        setText(text) {
            if (this.text === text) return;
            this.text = text;
            this._textureDirty = true;
            this.emitWasAltered();
        }

        setFont(font) {
            if (this.fontFamily === font) return;
            this.fontFamily = font;
            this._textureDirty = true;
            this.emitWasAltered();
        }

        setAlign(align) {
            if (this.align === align) return;
            this.align = align;
            this._textureDirty = true;
            this.emitWasAltered();
        }

        getLineCount() {
            return this.lineCount;
        }

        getCurrentText() {
            return this.text;
        }
        
        getLineWidth(lineIndex) {
            if (lineIndex >= 0 && lineIndex < this.lineWidths.length) {
                return this.lineWidths[lineIndex];
            }
            return 0;
        }

        dispose() {
            if (this._texture) {
                gl.deleteTexture(this._texture);
            }
            super.dispose();
        }
    }

    const createTextCostumeSkin = (target) => {
        const id = renderer._nextSkinId++;
        const skin = new SimpleTextSkin(id);
        renderer._allSkins[id] = skin;
        return skin;
    };

class SimpleTextExtension {
    constructor() {
        this.createdSkins = new Map();
        this.texturesCreating = 0;
        this.MAX_TEXTURES = 200;
    }

    // 借鉴纹理扩展的添加纹理方法
    async _addTextSkin(data, name) {
        if (!name || name.trim() === "") {
            console.log("纹理名称不能为空");
            return;
        }
        
        if (this.createdSkins.has(name)) {
            console.log(`纹理"${name}"已存在，将被替换`);
            this._disposeTextSkin(name);
        }
        
        try {
            const skinId = await this._createSkinFromData(data);
            if (skinId && renderer._allSkins[skinId]) {
                this.createdSkins.set(name, {
                    id: skinId,
                    skin: renderer._allSkins[skinId],
                    data: data
                });
                console.log(`艺术字扩展成功添加纹理"${name}"`);
                return true;
            }
        } catch (error) {
            console.error("艺术字扩展添加纹理失败:", error);
        }
        return false;
    }

    // 借鉴纹理扩展的创建纹理方法
    async _createSkinFromData(data) {
        if (data.startsWith('data:')) {
            return await this._createSkinFromDataURL(data);
        }
        throw new Error("不支持的纹理格式");
    }

    async _createSkinFromDataURL(dataURL) {
        const commaIndex = dataURL.indexOf(',');
        if (commaIndex === -1) throw new Error("无效的DataURL");

        const mimeType = dataURL.substring(5, dataURL.indexOf(';'));
        
        if (mimeType.startsWith('image/')) {
            const img = new Image();
            img.src = dataURL;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            return renderer.createBitmapSkin(img);
        }
        
        throw new Error(`不支持的MIME类型: ${mimeType}`);
    }

    // 借鉴纹理扩展的清理方法
    _disposeTextSkin(name) {
        const skinData = this.createdSkins.get(name);
        if (skinData && skinData.id && renderer._allSkins[skinData.id]) {
            renderer.destroySkin(skinData.id);
        }
        this.createdSkins.delete(name);
    }
async _createTextSkinInBackground(text, fontFamily, align, color = "#FF0000") {
    if (this.texturesCreating >= this.MAX_TEXTURES) return false;
    
    const skinKey = `TEXT_${text}_${fontFamily}_${align}`;
    if (this.createdSkins.has(skinKey)) return true;
    
    this.texturesCreating++;
    
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const fontSize = 24;
        const padding = 10;
        const lineHeight = fontSize * 1.2;
        
        // 设置字体
        let fontStyle = `${fontSize}px ${fontFamily}`;
        if (customFonts.has(fontFamily)) {
            fontStyle = `${fontSize}px "${fontFamily}", sans-serif`;
        }
        ctx.font = fontStyle;
        
        // 计算文本尺寸
        const lines = text.split('\n');
        let maxLineWidth = 0;
        const lineWidths = [];
        
        for (const line of lines) {
            const lineWidth = ctx.measureText(line).width;
            lineWidths.push(lineWidth);
            if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
        }
        
        // 布局逻辑（保持和SimpleTextSkin一致）
        let baseWidth, baseX;
        if (align === ALIGN_CENTER) {
            baseWidth = maxLineWidth + padding * 2;
            baseX = padding;
        } else {
            baseWidth = Math.max(maxLineWidth * 2 + padding * 2, 200);
            baseX = baseWidth / 2;
        }
        
        const baseHeight = lines.length * lineHeight + padding * 2;
        
        // 高清绘制
        const scale = 2;
        canvas.width = baseWidth * scale;
        canvas.height = baseHeight * scale;
        
        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, baseWidth, baseHeight);
        ctx.font = fontStyle;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        
        // 绘制文本
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineWidth = lineWidths[i];
            const y = padding + (i * lineHeight);
            
            let x;
            if (align === ALIGN_LEFT) {
                x = baseX;
            } else if (align === ALIGN_CENTER) {
                x = baseX + (maxLineWidth - lineWidth) / 2;
            } else { // ALIGN_RIGHT
                x = baseX - lineWidth;
            }
            
            ctx.fillText(line, x, y);
        }
        
        // 创建纹理
        const skinId = renderer.createBitmapSkin(canvas);
        if (skinId && renderer._allSkins[skinId]) {
            const skin = renderer._allSkins[skinId];
            if (skin.setSize) skin.setSize([baseWidth, baseHeight]);
            
            this.createdSkins.set(skinKey, {
                id: skinId,
                skin: skin
            });
            
            return true;
        }
    } catch (e) {
        // 静默失败
    } finally {
        this.texturesCreating--;
    }
    
    return false;
}
        getInfo() {
            return {
                id: "simpleText",
                name: "简_艺术字",
                color1: "#300058",
                blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAAXFkAAFxZAStO/ZEAAAKoSURBVFiFY2TAAQwYIv7jkqMFuMCwghGbOIYgvR2GDtAdCucMtMPQAcyhTAPtEEKAkYFh8IUeDFxgWME4+ENwsIYeDLCQovj8/eUofEPFSKo6BhsgOopZWVhp6Q6cgGgHnrq9CEOsrbKUqo7BBkjOJN/e/YCzPdOMqOoYbIAoB25a0w9nWxsnMsxu2E0zB6EDohwoayyBwp+2cB6cffzCAuq6CA2QFMW5oRMxxDj42cmyeMm0Fobz95cznL+/nMFIWw+nOoLFDHLRcuTMCTj76cVXDNL6YiQ5Cr2YgoG5WyrhbPSii+yaxCcgn6DFMCAjIU1QDS6z8IYgEyOi5WOjlUKUBdjAkxdP4WxchTuyw46dX8BgZZgAcQM+g8/eWwZnf/3+FUN+28yzcLauuiZeRxoqRuKteZDlOAUQ6ZqixkJ1Rw+cvWhHHSVG4QQ4Hbh8djucTY86l4GBgWFO414MMZwO1HBRIMrQOI8mOPvYeeLKRGZmZngRg4xfvn6FoZak1gw2cPnmdTgbOe1gA9s3T2aQ0BHBKV89BTOmsDoQPasTW0TgA9jMSPXrZDh/7TKDsqw8Q3l+PINRgBqGGqq3qLE5BFmsNWc5PEefuXyB4e/fvwy3HtxjSC6sZziz7iaGXrxR/P//fwYjpSiyHYYNrNm6iSh1MIARgsgWEes4dLB96xSs4rPqd+HVZxKkjiFGtShGLooktISxqvGPNCHZXBQHIofe+smnSDaMEBDXEMIpd/DYHKziOEOwqa8flxRRAFeaPH9/OUNDcSGcz8vNy3D+/nIGPkluhv6SDbgdiNwwIBfgqnHQxf1zzOCF86Ers+Dii9auxO1A5IZBaw7l5R4hRyKD////45Qf9B33QT/0MegdODq6RSkYHWGlFAydQXR0MFimIQBkVNfhQOg2mgAAAABJRU5ErkJggg==',
                docsURI: 'https://b23.tv/5P2xenX',
                blocks: [
                    {
                        opcode: "importFont",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "导入字体 [NAME] 数据 [DATAURL]",
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "我的字体"
                            },
                            DATAURL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },
{
    opcode: "removeFontById",
    blockType: Scratch.BlockType.COMMAND,
    text: "删除字体 [FONT_ID]",
    arguments: {
        FONT_ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "我的字体"
        }
    }
},
{
    opcode: "clearAllFonts",
    blockType: Scratch.BlockType.COMMAND,
    text: "清除所有字体"
},
                    {
                        opcode: "showText",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "角色显示文字 [TEXT] 字体 [FONT] 对齐 [ALIGN]",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "第一行\n第二行\n第三行\n第四行..."
                            },
                            FONT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "sans-serif"
                            },
                            ALIGN: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "alignMenu"
                            }
                        }
                    },
{
    opcode: "showTextCanvas",
    blockType: Scratch.BlockType.COMMAND,
    text: "角色显示文字2 [TEXT] 字体 [FONT] 对齐 [ALIGN] 这个将不采用纹理",
    arguments: {
        TEXT: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "第一行\n第二行"
        },
        FONT: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "sans-serif"
        },
        ALIGN: {
            type: Scratch.ArgumentType.STRING,
            menu: "alignMenu"
        }
    }
},
                    {
                        opcode: "getImportedFonts",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "已导入的字体"
                    },
                    {
                        opcode: "getLineCount",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "当前文本行数"
                    },
                    {
                        opcode: "getCurrentText",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "当前显示文本"
                    },
                    {
                        opcode: "getLineWidth",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "第 [LINE] 行宽度",
                        arguments: {
                            LINE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: "showSprite",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "恢复角色"
                    },
                    {
                        opcode: "wrapByPixelWidth",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "将 [TEXT] 按宽度 [PIXELS] 像素自动换行",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "这是一段需要自动换行的文本"
                            },
                            PIXELS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "100"
                            }
                        }
                    },
                    {
                        opcode: "wrapEnglishByPixelWidth",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "将英文 [TEXT] 按宽度 [PIXELS] 像素自动换行",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "This is a long English text"
                            },
                            PIXELS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "150"
                            }
                        }
                    },
                    {
                        opcode: "wrapMixedByPixelWidth",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "将混合文本 [TEXT] 按宽度 [PIXELS] 像素智能换行",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Hello 你好 Mixed text"
                            },
                            PIXELS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "120"
                            }
                        }
                    },
                    {
                        opcode: "getWrappedLineWidth",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "文本 [TEXT] 换行后第 [LINE] 行宽度",
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "这是一段需要换行的文本"
                            },
                            LINE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    // 新增歌词相关积木
                    {
                        opcode: "loadLyrics",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "加载歌词 [ID] 内容 [LYRICS]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "song1"
                            },
                            LYRICS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "[00:00]开始\n[00:15]第一句歌词\n[00:30]第二句歌词"
                            }
                        }
                    },
                    {
                        opcode: "getLyricsAtTime",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "歌词 [ID] 在 [TIME] 秒的内容",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "song1"
                            },
                            TIME: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 20
                            }
                        }
                    },
                    {
                        opcode: "getLyricsLineCount",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "歌词 [ID] 总行数",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "song1"
                            }
                        }
                    },
                    {
                        opcode: "getLyricsLine",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "歌词 [ID] 第 [LINE] 行",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "song1"
                            },
                            LINE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
// 添加到 blocks 数组中
{
    opcode: "getLyricsStartTime",
    blockType: Scratch.BlockType.REPORTER,
    text: "歌词 [ID] 第 [LINE] 行开始时间",
    arguments: {
        ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "song1"
        },
        LINE: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 1
        }
    }
},
{
    opcode: "getLyricsEndTime",
    blockType: Scratch.BlockType.REPORTER,
    text: "歌词 [ID] 第 [LINE] 行结束时间",
    arguments: {
        ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "song1"
        },
        LINE: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 1
        }
    }
},
{
    opcode: "getLyricsDuration",
    blockType: Scratch.BlockType.REPORTER,
    text: "歌词 [ID] 第 [LINE] 行持续时间",
    arguments: {
        ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "song1"
        },
        LINE: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 1
        }
    }
},
{
    opcode: "getCurrentLyricsLine",
    blockType: Scratch.BlockType.REPORTER,
    text: "歌词 [ID] 在 [TIME] 秒时的行号",
    arguments: {
        ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "song1"
        },
        TIME: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 20
        }
    }
},
{
    opcode: "getLyricsTotalDuration",
    blockType: Scratch.BlockType.REPORTER,
    text: "歌词 [ID] 总时长",
    arguments: {
        ID: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "song1"
        }
    }
},
{
    opcode: "clearAllLyrics",
    blockType: Scratch.BlockType.COMMAND,
    text: "清除所有歌词数据"
},
                    {
                        opcode: "removeLyrics",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "删除歌词 [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "song1"
                            }
                        }
                    },
{
    opcode: "joinWithNewline",
    blockType: Scratch.BlockType.REPORTER,
    text: "连接 [A] 和 [B] 并换行",
    arguments: {
        A: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "第一行"
        },
        B: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "第二行"
        }
    }
},
{
    opcode: "joinWithCustomSeparator",
    blockType: Scratch.BlockType.REPORTER,
    text: "将 [TEXTS] 用分隔符 [SEPARATOR] 连接并换行",
    arguments: {
        TEXTS: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "第一行,第二行,第三行"
        },
        SEPARATOR: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: ","
        }
    }
},
{
    opcode: "timeToSeconds",
    blockType: Scratch.BlockType.REPORTER,
    text: "将时间 [TIME] 转换为秒",
    arguments: {
        TIME: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "00:01:30"
        }
    }
},
{
    opcode: "padZero",
    blockType: Scratch.BlockType.REPORTER,
    text: "将 [NUMBER] 补零到 [LENGTH] 位",
    arguments: {
        NUMBER: {
            type: Scratch.ArgumentType.STRING,
            defaultValue: "2"
        },
        LENGTH: {
            type: Scratch.ArgumentType.NUMBER,
            defaultValue: 2
        }
    }
}
                ],
                menus: {
                    alignMenu: {
                        acceptReporters: true,
                        items: ["左对齐", "居中", "右对齐"]
                    }
                }
            };
        }

        // 歌词解析方法
        _parseLyrics(lyricsText) {
            const lines = lyricsText.split('\n');
            const parsed = [];
            
            for (const line of lines) {
                // 匹配 [mm:ss] 或 [mm:ss.xx] 格式的时间戳
                const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
                if (match) {
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const milliseconds = match[3] ? parseInt(match[3]) : 0;
                    const text = match[4].trim();
                    
                    const totalSeconds = minutes * 60 + seconds + milliseconds / 100;
                    parsed.push({
                        time: totalSeconds,
                        text: text
                    });
                }
            }
            
            // 按时间排序
            parsed.sort((a, b) => a.time - b.time);
            return parsed;
        }

        // 在指定时间获取歌词
        _getLyricsAtTime(lyricsId, time) {
            if (!lyricsData.has(lyricsId)) return "";
            
            const lyrics = lyricsData.get(lyricsId);
            let currentLyric = "";
            
            for (let i = 0; i < lyrics.length; i++) {
                if (time >= lyrics[i].time) {
                    currentLyric = lyrics[i].text;
                    // 如果不是最后一句，检查下一句的时间
                    if (i < lyrics.length - 1 && time >= lyrics[i + 1].time) {
                        currentLyric = "";
                    }
                }
            }
            
            return currentLyric;
        }

        // 中文/字符级分割
        _wrapByPixelWidth(text, maxPixelWidth) {
            if (!text || maxPixelWidth <= 0) return text;
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.font = '24px sans-serif';
            
            const lines = [];
            let currentLine = '';
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const testLine = currentLine + char;
                const testWidth = tempCtx.measureText(testLine).width;
                
                if (testWidth > maxPixelWidth || char === '\n') {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    currentLine = char === '\n' ? '' : char;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
            
            return lines.join('\n');
        }

        // 英文/单词级分割
        _wrapEnglishByPixelWidth(text, maxPixelWidth) {
            if (!text || maxPixelWidth <= 0) return text;
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.font = '24px sans-serif';
            
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const testWidth = tempCtx.measureText(testLine).width;
                
                if (testWidth > maxPixelWidth) {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
            
            return lines.join('\n');
        }

        // 中英文混合智能分割
        _wrapMixedByPixelWidth(text, maxPixelWidth) {
            if (!text || maxPixelWidth <= 0) return text;
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.font = '24px sans-serif';
            
            const lines = [];
            let currentLine = '';
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const testLine = currentLine + char;
                const testWidth = tempCtx.measureText(testLine).width;
                
                const isSpace = char === ' ';
                const isEnglishChar = /[a-zA-Z]/.test(char);
                const nextIsEnglish = i < text.length - 1 && /[a-zA-Z]/.test(text[i + 1]);
                
                if (testWidth > maxPixelWidth) {
                    if (isEnglishChar && nextIsEnglish) {
                        const lastSpaceIndex = currentLine.lastIndexOf(' ');
                        if (lastSpaceIndex !== -1) {
                            lines.push(currentLine.substring(0, lastSpaceIndex));
                            currentLine = currentLine.substring(lastSpaceIndex + 1) + char;
                        } else {
                            if (currentLine) {
                                lines.push(currentLine);
                            }
                            currentLine = char;
                        }
                    } else {
                        if (currentLine) {
                            lines.push(currentLine);
                        }
                        currentLine = char;
                    }
                } else if (char === '\n') {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    currentLine = '';
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
            
            return lines.join('\n');
        }
        // 在 _parseLyrics 方法后添加以下方法

// 获取指定行的歌词信息（包含时间信息）
_getLyricsLineInfo(lyricsId, lineIndex) {
    if (!lyricsData.has(lyricsId)) return null;
    
    const lyrics = lyricsData.get(lyricsId);
    if (lineIndex >= 0 && lineIndex < lyrics.length) {
        return {
            ...lyrics[lineIndex],
            lineNumber: lineIndex + 1
        };
    }
    return null;
}

// 获取歌词行的开始时间
_getLyricsStartTime(lyricsId, lineIndex) {
    const lineInfo = this._getLyricsLineInfo(lyricsId, lineIndex);
    return lineInfo ? lineInfo.time : -1;
}

// 获取歌词行的结束时间（下一行的开始时间，或无限大）
_getLyricsEndTime(lyricsId, lineIndex) {
    if (!lyricsData.has(lyricsId)) return -1;
    
    const lyrics = lyricsData.get(lyricsId);
    if (lineIndex >= 0 && lineIndex < lyrics.length) {
        if (lineIndex < lyrics.length - 1) {
            return lyrics[lineIndex + 1].time;
        } else {
            return Infinity; // 最后一行没有结束时间
        }
    }
    return -1;
}

// 获取歌词行的持续时间
_getLyricsDuration(lyricsId, lineIndex) {
    const startTime = this._getLyricsStartTime(lyricsId, lineIndex);
    const endTime = this._getLyricsEndTime(lyricsId, lineIndex);
    
    if (startTime === -1 || endTime === -1) return 0;
    if (endTime === Infinity) return 0; // 最后一行持续时间未知
    
    return endTime - startTime;
}

// 获取当前时间对应的歌词行号
_getCurrentLyricsLineNumber(lyricsId, time) {
    if (!lyricsData.has(lyricsId)) return 0;
    
    const lyrics = lyricsData.get(lyricsId);
    for (let i = lyrics.length - 1; i >= 0; i--) {
        if (time >= lyrics[i].time) {
            return i + 1;
        }
    }
    return 0;
}

// 获取歌词的总时长
_getLyricsTotalDuration(lyricsId) {
    if (!lyricsData.has(lyricsId)) return 0;
    
    const lyrics = lyricsData.get(lyricsId);
    if (lyrics.length === 0) return 0;
    
    return lyrics[lyrics.length - 1].time;
}

// 清除所有歌词数据
_clearAllLyrics() {
    lyricsData.clear();
}
// 高效的字符串连接换行方法
_joinWithNewline(...args) {
    // 快速处理空参数情况
    if (args.length === 0) return '';
    if (args.length === 1) return Scratch.Cast.toString(args[0]);
    
    const result = [];
    
    for (let i = 0; i < args.length; i++) {
        const str = Scratch.Cast.toString(args[i]);
        // 只有当字符串非空时才添加
        if (str) {
            result.push(str);
        }
    }
    
    return result.join('\n');
}
// 自动识别时间格式并转换为秒数
_convertTimeToSeconds(timeStr) {
    if (typeof timeStr !== 'string') return 0;
    
    timeStr = timeStr.trim();
    
    // 移除可能的中括号
    timeStr = timeStr.replace(/[\[\]]/g, '');
    
    // 格式1: hh:mm:ss 或 hh:mm:ss.xx
    const match1 = timeStr.match(/^(\d+):(\d+):(\d+)(?:\.(\d+))?$/);
    if (match1) {
        const hours = parseInt(match1[1]);
        const minutes = parseInt(match1[2]);
        const seconds = parseInt(match1[3]);
        const milliseconds = match1[4] ? parseInt(match1[4]) : 0;
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 100;
    }
    
    // 格式2: mm:ss 或 mm:ss.xx
    const match2 = timeStr.match(/^(\d+):(\d+)(?:\.(\d+))?$/);
    if (match2) {
        const minutes = parseInt(match2[1]);
        const seconds = parseInt(match2[2]);
        const milliseconds = match2[3] ? parseInt(match2[3]) : 0;
        return minutes * 60 + seconds + milliseconds / 100;
    }
    
    // 格式3: 纯秒数（支持小数）
    const secondsOnly = parseFloat(timeStr);
    if (!isNaN(secondsOnly)) {
        return secondsOnly;
    }
    
    return 0;
}
// 自定义长度补零
_padZero(number, length) {
    const num = Scratch.Cast.toString(number);
    if (num.length >= length) return num;
    
    return '0'.repeat(length - num.length) + num;
}

        // 积木实现
        wrapByPixelWidth(args, util) {
            const text = Scratch.Cast.toString(args.TEXT);
            const pixels = Scratch.Cast.toNumber(args.PIXELS);
            return this._wrapByPixelWidth(text, pixels);
        }

        wrapEnglishByPixelWidth(args, util) {
            const text = Scratch.Cast.toString(args.TEXT);
            const pixels = Scratch.Cast.toNumber(args.PIXELS);
            return this._wrapEnglishByPixelWidth(text, pixels);
        }

        wrapMixedByPixelWidth(args, util) {
            const text = Scratch.Cast.toString(args.TEXT);
            const pixels = Scratch.Cast.toNumber(args.PIXELS);
            return this._wrapMixedByPixelWidth(text, pixels);
        }

        // 新增歌词积木实现
        loadLyrics(args, util) {
            const lyricsId = Scratch.Cast.toString(args.ID);
            const lyricsText = Scratch.Cast.toString(args.LYRICS);
            
            const parsedLyrics = this._parseLyrics(lyricsText);
            lyricsData.set(lyricsId, parsedLyrics);
        }

        getLyricsAtTime(args, util) {
            const lyricsId = Scratch.Cast.toString(args.ID);
            const time = Scratch.Cast.toNumber(args.TIME);
            
            return this._getLyricsAtTime(lyricsId, time);
        }

        getLyricsLineCount(args, util) {
            const lyricsId = Scratch.Cast.toString(args.ID);
            if (!lyricsData.has(lyricsId)) return 0;
            
            return lyricsData.get(lyricsId).length;
        }

        getLyricsLine(args, util) {
            const lyricsId = Scratch.Cast.toString(args.ID);
            const lineIndex = Math.max(0, Scratch.Cast.toNumber(args.LINE) - 1);
            
            if (!lyricsData.has(lyricsId)) return "";
            
            const lyrics = lyricsData.get(lyricsId);
            if (lineIndex < lyrics.length) {
                return lyrics[lineIndex].text;
            }
            return "";
        }

        removeLyrics(args, util) {
            const lyricsId = Scratch.Cast.toString(args.ID);
            lyricsData.delete(lyricsId);
        }

        importFont(args, util) {
            const fontName = Scratch.Cast.toString(args.NAME).trim();
            const dataUrl = Scratch.Cast.toString(args.DATAURL).trim();
            
            if (!fontName || !dataUrl) return;
            
            const validFontTypes = [
                'data:font/woff', 'data:font/woff2', 'data:font/ttf', 'data:font/otf',
                'data:application/font-woff', 'data:application/font-woff2',
                'data:application/x-font-ttf', 'data:application/x-font-otf'
            ];
            
            const isValidFontData = validFontTypes.some(type => dataUrl.startsWith(type));
            if (!isValidFontData) return;
            
            if (customFonts.has(fontName)) return;
            
            try {
                const fontFace = new FontFace(fontName, `url(${dataUrl})`);
                
                fontFace.load().then(() => {
                    document.fonts.add(fontFace);
                    customFonts.set(fontName, { 
                        fontFace: fontFace, 
                        dataUrl: dataUrl, 
                        loaded: true 
                    });
                }).catch(error => {
                    console.error('字体加载失败:', error);
                    customFonts.delete(fontName);
                });
                
                customFonts.set(fontName, { 
                    fontFace: fontFace, 
                    dataUrl: dataUrl, 
                    loaded: false 
                });
                
            } catch (error) {
                console.error('字体导入失败:', error);
                customFonts.delete(fontName);
            }
        }

        getImportedFonts(args, util) {
            const fonts = Array.from(customFonts.keys());
            return fonts.length > 0 ? fonts.join(', ') : '暂无导入的字体';
        }

        getLineWidth(args, util) {
            const state = this._getState(util.target);
            const lineIndex = Math.max(0, Scratch.Cast.toNumber(args.LINE) - 1);
            return state.skin.getLineWidth(lineIndex);
        }

        _getState(target) {
            const state = target[CUSTOM_STATE_KEY];
            if (!state) {
                const newState = {
                    skin: createTextCostumeSkin(target),
                    isTextMode: false
                };
                target[CUSTOM_STATE_KEY] = newState;
                return newState;
            }
            return state;
        }

        _renderText(target, state) {
            state.isTextMode = true;
            renderer.updateDrawableSkinId(target.drawableID, state.skin.id);
        }

        _hideText(target, state) {
            state.isTextMode = false;
            target.setCostume(target.currentCostume);
        }

   showText(args, util) {
        const state = this._getState(util.target);
        const text = Scratch.Cast.toString(args.TEXT);
        const font = Scratch.Cast.toString(args.FONT);
        const align = Scratch.Cast.toString(args.ALIGN);
        
        // 设置字体
        if (customFonts.has(font)) {
            const fontInfo = customFonts.get(font);
            if (!fontInfo.loaded) return;
        }
        state.skin.setFont(font);
        
        // 设置对齐方式
        let alignValue = ALIGN_CENTER;
        if (align === "左对齐") {
            alignValue = ALIGN_LEFT;
        } else if (align === "右对齐") {
            alignValue = ALIGN_RIGHT;
        }
        state.skin.setAlign(alignValue);
        
        // 先检查自己的纹理是否存在
        const skinKey = `TEXT_${text}_${font}_${alignValue}`;
        
        if (this.createdSkins.has(skinKey)) {
            const skinData = this.createdSkins.get(skinKey);
            // 验证纹理是否仍然存在
            if (skinData && skinData.skin && renderer._allSkins[skinData.id]) {
                // 纹理存在，直接应用
                const drawableID = util.target.drawableID;
                if (renderer._allDrawables[drawableID]) {
                    renderer._allDrawables[drawableID].skin = skinData.skin;
                    util.runtime.requestRedraw();
                    return; // 直接返回，不执行后面的canvas渲染
                }
            } else {
                // 纹理已失效，清理
                this._disposeTextSkin(skinKey);
            }
        }
        
        // 纹理不存在，用原来的canvas方式显示
        this._renderText(util.target, state);
        state.skin.setText(text);
        util.runtime.requestRedraw();
        
        // 后台创建纹理（使用自己的纹理功能）
        setTimeout(() => {
            this._createTextSkinInBackground(text, font, alignValue);
        }, 0);
    }

        getLineCount(args, util) {
            const state = this._getState(util.target);
            return state.skin.getLineCount();
        }

        getCurrentText(args, util) {
            const state = this._getState(util.target);
            return state.skin.getCurrentText();
        }

        showSprite(args, util) {
            const state = this._getState(util.target);
            this._hideText(util.target, state);
            util.runtime.requestRedraw();
        }
        
        getWrappedLineWidth(args, util) {
            const text = Scratch.Cast.toString(args.TEXT);
            const lineNumber = Math.max(1, Scratch.Cast.toNumber(args.LINE));
            
            // 创建临时canvas测量宽度
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.font = '24px sans-serif';
            
            // 先进行换行处理
            const wrappedText = this._wrapByPixelWidth(text, 1000); // 用大宽度确保只按自然换行
            const lines = wrappedText.split('\n');
            
            if (lineNumber - 1 < lines.length) {
                const line = lines[lineNumber - 1];
                return tempCtx.measureText(line).width;
            }
            
            return 0;
        }
// 在积木实现部分添加以下方法

getLyricsStartTime(args, util) {
    const lyricsId = Scratch.Cast.toString(args.ID);
    const lineIndex = Math.max(0, Scratch.Cast.toNumber(args.LINE) - 1);
    return this._getLyricsStartTime(lyricsId, lineIndex);
}

getLyricsEndTime(args, util) {
    const lyricsId = Scratch.Cast.toString(args.ID);
    const lineIndex = Math.max(0, Scratch.Cast.toNumber(args.LINE) - 1);
    const endTime = this._getLyricsEndTime(lyricsId, lineIndex);
    return endTime === Infinity ? "最后一行" : endTime;
}

getLyricsDuration(args, util) {
    const lyricsId = Scratch.Cast.toString(args.ID);
    const lineIndex = Math.max(0, Scratch.Cast.toNumber(args.LINE) - 1);
    return this._getLyricsDuration(lyricsId, lineIndex);
}

getCurrentLyricsLine(args, util) {
    const lyricsId = Scratch.Cast.toString(args.ID);
    const time = Scratch.Cast.toNumber(args.TIME);
    return this._getCurrentLyricsLineNumber(lyricsId, time);
}

getLyricsTotalDuration(args, util) {
    const lyricsId = Scratch.Cast.toString(args.ID);
    return this._getLyricsTotalDuration(lyricsId);
}

clearAllLyrics(args, util) {
    this._clearAllLyrics();
}

joinWithNewline(args, util) {
    const a = args.A;
    const b = args.B;
    return this._joinWithNewline(a, b);
}

// 使用自定义分隔符连接多个文本
_joinWithSeparator(texts, separator) {
    const textStr = Scratch.Cast.toString(texts);
    const sep = Scratch.Cast.toString(separator);
    
    if (!textStr) return '';
    
    // 按分隔符分割，然后过滤空值
    const parts = textStr.split(sep).filter(part => part.trim() !== '');
    
    return parts.join('\n');
}
timeToSeconds(args, util) {
    const timeStr = Scratch.Cast.toString(args.TIME);
    return this._convertTimeToSeconds(timeStr);
}

padZero(args, util) {
    const number = args.NUMBER; // 保持原样，在方法内转换
    const length = Math.max(1, Scratch.Cast.toNumber(args.LENGTH));
    return this._padZero(number, length);
}
joinWithCustomSeparator(args, util) {
    const texts = args.TEXTS;
    const separator = args.SEPARATOR;
    return this._joinWithSeparator(texts, separator);
}
// 删除指定ID的字体
_removeFontById(fontId) {
    fontId = Scratch.Cast.toString(fontId).trim();
    if (customFonts.has(fontId)) {
        const fontInfo = customFonts.get(fontId);
        
        // 从文档字体集中移除
        if (fontInfo.fontFace && document.fonts) {
            document.fonts.delete(fontInfo.fontFace);
        }
        
        customFonts.delete(fontId);
        return true;
    }
    return false;
}
removeFontById(args, util) {
    const fontId = Scratch.Cast.toString(args.FONT_ID);
    return this._removeFontById(fontId);
}
// 清除所有已导入的字体
_clearAllFonts() {
    const fontIds = Array.from(customFonts.keys());
    
    for (const fontId of fontIds) {
        const fontInfo = customFonts.get(fontId);
        
        // 从文档字体集中移除
        if (fontInfo.fontFace && document.fonts) {
            document.fonts.delete(fontInfo.fontFace);
        }
        
        customFonts.delete(fontId);
    }
    
    return fontIds.length; // 返回清除的字体数量
}
clearAllFonts(args, util) {
    this._clearAllFonts();
}
showTextCanvas(args, util) {
    const state = this._getState(util.target);
    const text = Scratch.Cast.toString(args.TEXT);
    const font = Scratch.Cast.toString(args.FONT);
    const align = Scratch.Cast.toString(args.ALIGN);
    
    // 检查字体是否已加载
    if (customFonts.has(font)) {
        const fontInfo = customFonts.get(font);
        if (!fontInfo.loaded) return;
    }
    
    // 设置字体
    state.skin.setFont(font);
    
    // 设置对齐方式
    let alignValue = ALIGN_CENTER;
    if (align === "左对齐") {
        alignValue = ALIGN_LEFT;
    } else if (align === "右对齐") {
        alignValue = ALIGN_RIGHT;
    }
    state.skin.setAlign(alignValue);
    
    // 直接使用canvas渲染，完全跳过纹理处理
    this._renderText(util.target, state);
    state.skin.setText(text);
    util.runtime.requestRedraw();
    
    // 注意：不调用 _createTextSkinInBackground，不创建纹理
}
    }

    Scratch.extensions.register(new SimpleTextExtension());
})(Scratch);
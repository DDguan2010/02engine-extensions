// 网页嗅探器-F_code、AI制作
(function(Scratch) {
    'use strict';

    // 检查是否为有效的URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 补全相对路径为绝对路径
    function resolveUrl(href, baseUrl) {
        if (!href || !baseUrl) return null;
        if (isValidUrl(href)) return href;
        try {
            return new URL(href, baseUrl).href;
        } catch (e) {
            return null;
        }
    }

    // 核心嗅探函数（返回纯URL数组）
    async function sniffResources(targetUrl) {
        if (!isValidUrl(targetUrl)) {
            return {
                success: false,
                message: '这是无效的网址，请检查格式',
                resources: [],
                urlArray: [] // 新增纯URL数组字段
            };
        }

        try {
            const response = await fetch(targetUrl, {
                mode: 'cors',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                return {
                    success: false,
                    message: `请求失败：${response.status} ${response.statusText}`,
                    resources: [],
                    urlArray: []
                };
            }

            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // 定义需要嗅探的资源类型
            const resourceTypes = [
                { tag: 'img', attr: 'src' },
                { tag: 'img', attr: 'data-src' },
                { tag: 'video', attr: 'src' },
                { tag: 'source', attr: 'src' },
                { tag: 'audio', attr: 'src' },
                { tag: 'a', attr: 'href' },
                { tag: 'link', attr: 'href' },
                { tag: 'script', attr: 'src' }
            ];

            // 存储去重后的资源链接
            const resourcesSet = new Set();

            // 遍历提取链接
            resourceTypes.forEach(({ tag, attr }) => {
                doc.querySelectorAll(tag).forEach(element => {
                    const rawUrl = element.getAttribute(attr);
                    if (!rawUrl) return;

                    const fullUrl = resolveUrl(rawUrl, targetUrl);
                    if (!fullUrl || fullUrl.startsWith('javascript:')) return;
                    
                    resourcesSet.add(fullUrl);
                });
            });

            // 转换为纯URL数组
            const urlArray = Array.from(resourcesSet);

            return {
                success: true,
                message: `成功嗅探到 ${urlArray.length} 个资源`,
                resources: urlArray, // 兼容原有字段
                urlArray: urlArray   // 纯URL数组
            };

        } catch (error) {
            return {
                success: false,
                message: `嗅探失败：${error.message}`,
                resources: [],
                urlArray: []
            };
        }
    }

    // 注册TurboWarp扩展
    class ResourceSniffer {
        constructor() {
            this._lastResult = {
                success: false,
                message: '',
                resources: [],
                urlArray: []
            };
        }

        getInfo() {
            return {
                id: 'resourcesniffer',
                name: '资源嗅探器',
                color1: '#4CAF50',
                color2: '#388E3C',
                blocks: [
                    {
                        opcode: 'sniffFromUrl',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '嗅探网址 [URL] 的资源',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://example.com'
                            }
                        }
                    },
                    {
                        opcode: 'getUrlArray', // 新增：返回纯URL数组
                        blockType: Scratch.BlockType.REPORTER,
                        text: '嗅探到的资源(JSON数组)'
                    },
                    {
                        opcode: 'getResourceCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '嗅探到的资源数量'
                    },
                    {
                        opcode: 'getResourceByIndex', // 按索引获取单个URL
                        blockType: Scratch.BlockType.REPORTER,
                        text: '嗅探到的第 [INDEX] 个资源的URL',
                        arguments: {
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    }
                ]
            };
        }

        // 执行嗅探命令
        async sniffFromUrl(args) {
            const url = args.URL.trim();
            this._lastResult = await sniffResources(url);
        }

        // 核心：返回纯URL数组（JSON格式 ["url1","url2"]）
        getUrlArray() {
            return JSON.stringify(this._lastResult.urlArray);
        }

        // 获取资源数量
        getResourceCount() {
            return this._lastResult.urlArray.length;
        }

        // 按索引获取单个URL
        getResourceByIndex(args) {
            const index = Math.max(0, args.INDEX - 1); // Scratch中索引从1开始
            return this._lastResult.urlArray[index] || '无此资源';
        }
    }

    // 注册扩展
    Scratch.extensions.register(new ResourceSniffer());

})(Scratch);
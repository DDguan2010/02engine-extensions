(function(Scratch) {
    'use strict';

    class TextToURL {
        getInfo() {
            return {
                id: 'textToURL',
                name: '文字转URL',
                color1: '#9333EA',
                color2: '#9333EA',
                color3: '#9333EA',
                blocks: [
                    {
                        opcode: 'generateDisplayTextURL',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '生成显示文字的URL：显示 [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '我是要在网页显示的文字！'
                            }
                        },
                        iconURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDMi41OSAyIDAgNC41OSAwIDh2OGMwIDMuNDEgMi41OSA2IDYgNmgyYzAgMy40MSAyLjU5IDYgNiA2IDMuNDEgMCA2LTIuNTkgNi02VjhoMi4wMDFDMjEuNDEgMTYgMjQgMTMuNDEgMjQgMTBIMjhWOGMyLjU5IDAgNi0yLjU5IDYtNlY2YzAtMy40MS0yLjU5LTYtNi02ek0xMiA0YzQuNDIgMCA4IDMuNTggOCA4cy0zLjU4IDgtOCA4LTguMDAtMy41OC04LTggMy41OC04IDgtOHptMCAxMmMxLjExIDAgMi0uODkgMi0ycy0uODktMi0yLTItMiAwLjg5LTIgMiAwLjg5IDIgMiAyeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4='
                    },
                    {
                        opcode: 'urlToText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '将显示文字的URL转换为文字 [URL]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data:text/html;charset=utf-8,%0A%20%20%20%20%3C!DOCTYPE%20html%3E%0A%20%20%20%20%3Chtml%3E%0A%20%20%20%20%3Cbody%20style%3D%22font-size%36px%3B%20text-align%3Acenter%3B%20margin-top%3A100px%3B%20color%3A%23333%3B%22%3E%0A%20%20%20%20%20%20%20%20%E6%88%91%E6%98%AF%E8%A6%81%E5%9C%A8%E7%BD%91%E9%A1%B5%E6%98%BE%E7%A4%BA%E7%9A%84%E6%96%87%E5%AD%97%EF%BC%81%0A%20%20%20%20%3C/body%3E%0A%20%20%20%3C/html%3E%0A'
                            }
                        },
                        iconURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDMi41OSAyIDAgNC41OSAwIDh2OGMwIDMuNDEgMi41OSA2IDYgNmgyYzAgMy40MSAyLjU5IDYgNiA2IDMuNDEgMCA2LTIuNTkgNi02VjhoMi4wMDFDMjEuNDEgMTYgMjQgMTMuNDEgMjQgMTBIMjhWOGMyLjU5IDAgNi0yLjU5IDYtNlY2YzAtMy40MS0yLjU5LTYtNi02ek0xMiA0YzQuNDIgMCA4IDMuNTggOCA4cy0zLjU4IDgtOCA4LTguMDAtMy41OC04LTggMy41OC04IDgtOHptMCAxMmMxLjExIDAgMi0uODkgMi0ycy0uODktMi0yLTItMiAwLjg5LTIgMiAwLjg5IDIgMiAyeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4='
                    }
                ],
                css: `
                    [data-extension-id="textToURL"] .blocklyPathNumber1 {
                        fill: #9333EA !important;
                    }
                    [data-extension-id="textToURL"] .blocklyPathNumber2 {
                        stroke: #7E22CE !important;
                        stroke-width: 1px !important;
                    }
                    [data-extension-id="textToURL"] .blocklyText {
                        fill: #FFFFFF !important;
                    }
                `,
                svg: `
                    <defs>
                        <linearGradient id="textToURLGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#9333EA"/>
                            <stop offset="50%" stop-color="#9333EA"/>
                            <stop offset="100%" stop-color="#9333EA"/>
                        </linearGradient>
                    </defs>
                `
            };
        }

        generateDisplayTextURL(args) {
            const text = encodeURIComponent(args.TEXT);
            const html = `
                <!DOCTYPE html>
                <html>
                <body style="font-size:36px; text-align:center; margin-top:100px; color:#333;">
                    ${decodeURIComponent(text)}
                </body>
                </html>
            `;
            return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
        }

        urlToText(args) {
            try {
                const url = args.URL;
                if (!url.startsWith('data:text/html;charset=utf-8,')) {
                    return '无效的显示文字URL';
                }
                const htmlEncoded = url.split('data:text/html;charset=utf-8,')[1];
                const html = decodeURIComponent(htmlEncoded);
                const textMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
                if (textMatch && textMatch[1]) {
                    return textMatch[1].trim();
                } else {
                    return '未提取到文字';
                }
            } catch (e) {
                return '解析失败';
            }
        }
    }

    Scratch.extensions.register(new TextToURL());
})(Scratch);
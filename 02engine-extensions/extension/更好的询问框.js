(function(Scratch) {
    'use strict';

    if (typeof Scratch === 'undefined') {
        Scratch = {
            extensions: {
                unsandboxed: true,
                register: () => {}
            },
            BlockType: { REPORTER: 'reporter' },
            ArgumentType: { STRING: 'string' }
        };
    }

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('该扩展需要非沙盒模式');
    }

    // 自定义HTML转义函数（替代可能不存在的Scratch.htmlEscape）
    function htmlEscape(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 仅在浏览器环境下创建自定义弹窗样式
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
            /* 通用弹窗样式 */
            .custom-prompt, .custom-confirm {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                backdrop-filter: blur(4px);
            }
            .prompt-content, .confirm-content {
                background: white;
                padding: 28px;
                border-radius: 16px;
                width: 90%;
                max-width: 420px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .prompt-header, .confirm-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                margin: 0 0 22px;
                font-size: 18px;
                font-weight: 600;
                line-height: 1.5;
            }
            .prompt-buttons, .confirm-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .prompt-btn, .confirm-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-cancel {
                background: #f5f5f5;
                color: #555;
            }
            .btn-cancel:hover {
                background: #e9e9e9;
                transform: translateY(-1px);
            }
            .btn-ok {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-ok:hover {
                background: linear-gradient(135deg, #5a6fdd 0%, #6a4390 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            /* 询问框特有样式 */
            .prompt-input {
                width: 100%;
                padding: 12px 15px;
                margin-bottom: 22px;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                font-size: 15px;
                box-sizing: border-box;
                transition: all 0.3s ease;
            }
            .prompt-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }

    class BetterDialogs {
        getInfo() {
            return {
                id: 'betterDialogs',
                name: '更好的对话框',
                color1: '#667eea',
                color2: '#764ba2',
                blocks: [
                    {
                        opcode: 'ask',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '询问 [PROMPT] 并等待',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '请输入内容'
                            }
                        }
                    },
                    {
                        opcode: 'confirm',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '确认 [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '你确定吗？'
                            }
                        }
                    }
                ]
            };
        }

        // 自定义询问框实现
        ask(args) {
            return new Promise(resolve => {
                if (typeof document === 'undefined') {
                    resolve('');
                    return;
                }

                const promptDiv = document.createElement('div');
                promptDiv.className = 'custom-prompt';
                // 使用自定义的htmlEscape替代Scratch.htmlEscape
                promptDiv.innerHTML = `
                    <div class="prompt-content">
                        <p class="prompt-header">${htmlEscape(args.PROMPT)}</p>
                        <input type="text" class="prompt-input">
                        <div class="prompt-buttons">
                            <button class="prompt-btn btn-cancel">取消</button>
                            <button class="prompt-btn btn-ok">确定</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(promptDiv);

                const input = promptDiv.querySelector('.prompt-input');
                const okBtn = promptDiv.querySelector('.btn-ok');
                const cancelBtn = promptDiv.querySelector('.btn-cancel');

                input.focus();

                const handleOk = () => {
                    document.body.removeChild(promptDiv);
                    resolve(input.value);
                };

                const handleCancel = () => {
                    document.body.removeChild(promptDiv);
                    resolve('');
                };

                okBtn.addEventListener('click', handleOk);
                cancelBtn.addEventListener('click', handleCancel);

                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') handleOk();
                    if (e.key === 'Escape') handleCancel();
                });

                promptDiv.addEventListener('click', e => {
                    if (e.target === promptDiv) handleCancel();
                });
            });
        }

        // 自定义确认框实现
        confirm(args) {
            return new Promise(resolve => {
                if (typeof document === 'undefined') {
                    resolve('否');
                    return;
                }

                const confirmDiv = document.createElement('div');
                confirmDiv.className = 'custom-confirm';
                // 使用自定义的htmlEscape替代Scratch.htmlEscape
                confirmDiv.innerHTML = `
                    <div class="confirm-content">
                        <p class="confirm-header">${htmlEscape(args.MESSAGE)}</p>
                        <div class="confirm-buttons">
                            <button class="confirm-btn btn-cancel">取消</button>
                            <button class="confirm-btn btn-ok">确定</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(confirmDiv);

                const okBtn = confirmDiv.querySelector('.btn-ok');
                const cancelBtn = confirmDiv.querySelector('.btn-cancel');

                const handleOk = () => {
                    document.body.removeChild(confirmDiv);
                    resolve('是');
                };

                const handleCancel = () => {
                    document.body.removeChild(confirmDiv);
                    resolve('否');
                };

                okBtn.addEventListener('click', handleOk);
                cancelBtn.addEventListener('click', handleCancel);

                confirmDiv.addEventListener('keydown', e => {
                    if (e.key === 'Enter') handleOk();
                    if (e.key === 'Escape') handleCancel();
                });

                confirmDiv.addEventListener('click', e => {
                    if (e.target === confirmDiv) handleCancel();
                });

                okBtn.focus();
            });
        }
    }

    Scratch.extensions.register(new BetterDialogs());
})(typeof Scratch !== 'undefined' ? Scratch : undefined);

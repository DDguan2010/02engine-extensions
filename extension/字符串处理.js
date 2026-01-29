class StringSplitExtension {
    constructor() {
        // 不需要存储状态
    }
    
    getInfo() {
        return {
            id: 'stringSplit',
            name: '字符串处理',
            color1: '#4CBF4C',
            color2: '#3DA63D',
            blocks: [
                {
                    opcode: 'splitString',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '将 [TEXT] 按 [DELIMITER] 分割为 [OUTPUT_TYPE]',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '123'
                        },
                        DELIMITER: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '2'
                        },
                        OUTPUT_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'outputTypeMenu'
                        }
                    }
                },
                {
                    opcode: 'joinArray',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '用 [DELIMITER] 作为分隔符合并数组 [ARRAY]',
                    arguments: {
                        DELIMITER: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ''
                        },
                        ARRAY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '["wow", "!!"]'
                        }
                    }
                },
                {
                    opcode: 'getLineCount',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[MULTILINE_TEXT] 的行数',
                    arguments: {
                        MULTILINE_TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Starfall!!!\nStarfall!!!'
                        }
                    }
                },
                {
                    opcode: 'getLineAt',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[MULTILINE_TEXT] 的第 [LINE_NUM] 行',
                    arguments: {
                        MULTILINE_TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Starfall!!!\nStarfall!!!'
                        },
                        LINE_NUM: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'deleteLine',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '删除 [MULTILINE_TEXT] 的第 [LINE_NUM] 行',
                    arguments: {
                        MULTILINE_TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Starfall!!!\nStarfall!!!'
                        },
                        LINE_NUM: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'insertLine',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '将 [NEW_LINE] 插入到 [MULTILINE_TEXT] 的第 [LINE_NUM] 行之前',
                    arguments: {
                        NEW_LINE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'I love'
                        },
                        MULTILINE_TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Starfall!!!\nStarfall!!!'
                        },
                        LINE_NUM: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 'last'
                        }
                    }
                },
                {
                    opcode: 'multilineToArray',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '将多行文本 [MULTILINE_TEXT] 转化为数组',
                    arguments: {
                        MULTILINE_TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Starfall!!!\nStarfall!!!'
                        }
                    }
                },
                {
                    opcode: 'arrayToMultiline',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '将数组 [ARRAY] 转化为多行文本',
                    arguments: {
                        ARRAY: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '["Starfall!!!", "Starfall!!!"]'
                        }
                    }
                }
            ],
            menus: {
                outputTypeMenu: {
                    items: ['数组', '多行文本']
                }
            }
        };
    }
    
    splitString(args) {
        try {
            const text = String(args.TEXT);
            const delimiter = String(args.DELIMITER);
            const outputType = String(args.OUTPUT_TYPE);
            
            // 使用分隔符分割字符串
            const parts = text.split(delimiter);
            
            // 根据选择的输出类型返回结果
            if (outputType === '数组') {
                // 返回JSON格式的数组字符串
                return JSON.stringify(parts);
            } else {
                // 返回多行文本
                return parts.join('\n');
            }
        } catch (error) {
            console.error('分割字符串时出错:', error);
            return outputType === '数组' ? '[]' : '';
        }
    }
    
    joinArray(args) {
        try {
            const delimiter = String(args.DELIMITER);
            const arrayStr = String(args.ARRAY);
            
            // 解析JSON数组
            const array = JSON.parse(arrayStr);
            
            // 使用分隔符合并数组
            return array.join(delimiter);
        } catch (error) {
            console.error('合并数组时出错:', error);
            return '';
        }
    }
    
    getLineCount(args) {
        try {
            const multilineText = String(args.MULTILINE_TEXT);
            
            // 按换行符分割并计算行数
            const lines = multilineText.split('\n');
            return lines.length;
        } catch (error) {
            console.error('获取行数时出错:', error);
            return 0;
        }
    }
    
    getLineAt(args) {
        try {
            const multilineText = String(args.MULTILINE_TEXT);
            let lineNum = args.LINE_NUM;
            
            // 如果输入是"last"，则获取最后一行
            if (lineNum === 'last') {
                const lines = multilineText.split('\n');
                return lines[lines.length - 1] || '';
            }
            
            // 否则按数字处理
            lineNum = Math.floor(Number(lineNum));
            const lines = multilineText.split('\n');
            
            // Scratch索引从1开始，JavaScript数组从0开始
            const index = lineNum - 1;
            
            if (index >= 0 && index < lines.length) {
                return String(lines[index]);
            } else {
                return '';
            }
        } catch (error) {
            console.error('获取指定行时出错:', error);
            return '';
        }
    }
    
    deleteLine(args) {
        try {
            const multilineText = String(args.MULTILINE_TEXT);
            let lineNum = args.LINE_NUM;
            
            const lines = multilineText.split('\n');
            
            // 如果输入是"last"，则删除最后一行
            if (lineNum === 'last') {
                lines.pop();
            } else {
                // 否则按数字处理
                lineNum = Math.floor(Number(lineNum));
                const index = lineNum - 1;
                
                if (index >= 0 && index < lines.length) {
                    lines.splice(index, 1);
                }
            }
            
            // 重新组合为多行文本
            return lines.join('\n');
        } catch (error) {
            console.error('删除行时出错:', error);
            return multilineText;
        }
    }
    
    insertLine(args) {
        try {
            const newLine = String(args.NEW_LINE);
            const multilineText = String(args.MULTILINE_TEXT);
            let lineNum = args.LINE_NUM;
            
            const lines = multilineText.split('\n');
            
            // 如果输入是"last"，则在末尾插入
            if (lineNum === 'last') {
                lines.push(newLine);
            } else {
                // 否则按数字处理
                lineNum = Math.floor(Number(lineNum));
                const index = lineNum - 1;
                
                if (index >= 0 && index <= lines.length) {
                    lines.splice(index, 0, newLine);
                } else if (index < 0) {
                    lines.unshift(newLine); // 插入到开头
                } else {
                    lines.push(newLine); // 插入到末尾
                }
            }
            
            // 重新组合为多行文本
            return lines.join('\n');
        } catch (error) {
            console.error('插入行时出错:', error);
            return multilineText;
        }
    }
    
    multilineToArray(args) {
        try {
            const multilineText = String(args.MULTILINE_TEXT);
            
            // 按换行符分割为数组
            const lines = multilineText.split('\n');
            
            // 返回JSON格式的数组字符串
            return JSON.stringify(lines);
        } catch (error) {
            console.error('转换为数组时出错:', error);
            return '[]';
        }
    }
    
    arrayToMultiline(args) {
        try {
            const arrayStr = String(args.ARRAY);
            
            // 解析JSON数组
            const array = JSON.parse(arrayStr);
            
            // 使用换行符合并数组为多行文本
            return array.join('\n');
        } catch (error) {
            console.error('转换为多行文本时出错:', error);
            return '';
        }
    }
}

// 注册扩展
if (typeof Scratch !== 'undefined' && Scratch.extensions) {
    Scratch.extensions.register(new StringSplitExtension());
}
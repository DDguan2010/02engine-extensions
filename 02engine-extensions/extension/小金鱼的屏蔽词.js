(function(Scratch) {
    'use strict';

    class ProhibitedWordsExtension {
        getInfo() {
            return {
                id: "prohibitedWordsExtension",
                name: '小金鱼的违禁词检测',
                color1: '#FFA500',
                blocks: [
                    // 1. 屏蔽词列表管理
                    {
                        blockType: 'label',
                        text: '屏蔽词列表管理'
                    },
                    {
                        opcode: 'addProhibitedWord',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '添加违禁词[word]到列表',
                        arguments: {
                            word: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'addBulkProhibitedWords',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '批量添加违禁词[wordsStr]，用[separator]分隔',
                        arguments: {
                            wordsStr: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '词1,词2,词3'
                            },
                            separator: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ','
                            }
                        }
                    },
                    {
                        opcode: 'deleteWordFromList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '将 [word] 从屏蔽词列表中删除',
                        arguments: {
                            word: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'setWordAtIndex',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '将屏蔽词列表中的第 [index] 项设为 [newWord]',
                        arguments: {
                            index: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            newWord: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'clearProhibitedWordsList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清空敏感词列表'
                    },
                    {
                        opcode: 'getProhibitedWordsList',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '违禁词列表'
                    },

                    // 2. 违禁词分组管理
                    {
                        blockType: 'label',
                        text: '违禁词分组管理'
                    },
                    {
                        opcode: 'createWordGroup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建违禁词分组[groupName]',
                        arguments: {
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    },
                    {
                        opcode: 'deleteWordGroup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '删除违禁词分组[groupName]',
                        arguments: {
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    },
                    {
                        opcode: 'switchToWordGroup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '切换到违禁词分组[groupName]',
                        arguments: {
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    },
                    {
                        opcode: 'addWordToGroup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '添加[word]到分组[groupName]',
                        arguments: {
                            word: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    },
                    {
                        opcode: 'getWordsInGroup',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '分组[groupName]中的违禁词',
                        arguments: {
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    },
                    {
                        opcode: 'getAllGroups',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '所有违禁词分组'
                    },

                    // 3. 基础检测功能
                    {
                        blockType: 'label',
                        text: '基础检测功能'
                    },
                    {
                        opcode: 'checkProhibitedWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '检测文本[textInput]是否包含违禁词',
                        arguments: {
                            textInput: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'replaceProhibitedWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '检测并替换文本[textInput]中的违禁词',
                        arguments: {
                            textInput: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'checkAndReplaceWithGivenText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '若 [text] 有违禁词 则用 [text1] 屏蔽',
                        arguments: {
                            text: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            text1: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '***'
                            }
                        }
                    },
                    {
                        opcode: 'replaceAllProhibitedWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '将 [text] 中的敏感词部分逐个替换成 [text1]',
                        arguments: {
                            text: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            text1: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '*'
                            }
                        }
                    },

                    // 4. 断续词检测
                    {
                        blockType: 'label',
                        text: '断续词检测处理'
                    },
                    {
                        opcode: 'replaceDiscontinuousProhibitedWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '将 [text] 中间断的屏蔽词替换为 [replaceText]',
                        arguments: {
                            text: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            replaceText: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '【文本】'
                            }
                        }
                    },
                    {
                        opcode: 'deleteDiscontinuousProhibitedWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '删除 [text] 中间断的屏蔽词',
                        arguments: {
                            text: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },

                    // 5. 高级检测功能
                    {
                        blockType: 'label',
                        text: '高级检测功能'
                    },
                    {
                        opcode: 'checkWithIgnoringSymbols',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '检测[text]是否包含被符号分隔的违禁词',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'checkCaseInsensitive',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '忽略大小写检测[text]是否包含违禁词',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'replacePartial',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '将[text]中的违禁词替换中间[length]个字符为[char]',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                            length: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            char: { type: Scratch.ArgumentType.STRING, defaultValue: '*' }
                        }
                    },

                    // 6. 变体检测功能
                    {
                        blockType: 'label',
                        text: '变体检测功能'
                    },
                    {
                        opcode: 'checkHomophones',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '检测[text]是否包含违禁词的同音字变体',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'checkSimilarCharacters',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '检测[text]是否包含违禁词的形近字变体',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'replaceVariantWords',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '替换[text]中违禁词的所有变体为[replaceText]',
                        arguments: {
                            text: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                            replaceText: { type: Scratch.ArgumentType.STRING, defaultValue: '***' }
                        }
                    },
                    {
                        opcode: 'addHomophoneMapping',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '添加同音字映射: [char] 映射到 [homophones]',
                        arguments: {
                            char: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                            homophones: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },
                    {
                        opcode: 'addSimilarCharMapping',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '添加形近字映射: [char] 映射到 [similarChars]',
                        arguments: {
                            char: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                            similarChars: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },

                    // 7. 记录与设置
                    {
                        blockType: 'label',
                        text: '记录与设置'
                    },
                    {
                        opcode: 'toggleSensitiveWordRecorder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '[recorderStatus] 敏感词记录器',
                        arguments: {
                            recorderStatus: {
                                type: Scratch.ArgumentType.STRING,
                                menu:'recorder_status_menu'
                            }
                        }
                    },
                    {
                        opcode: 'clearSensitiveWordRecorder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清空敏感词记录器'
                    },
                    {
                        opcode: 'getSensitiveWordCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '用户说敏感词的次数(记录器)'
                    },
                    {
                        opcode: 'isRecorderOn',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '记录器开启?'
                    },
                    {
                        opcode: 'setThreshold',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置连续出现[count]个违禁词才触发过滤',
                        arguments: {
                            count: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },

                    // 8. 导入导出
                    {
                        blockType: 'label',
                        text: '导入导出'
                    },
                    {
                        opcode: 'importProhibitedWords',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '从文件导入违禁词列表'
                    },
                    {
                        opcode: 'exportProhibitedWords',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '导出违禁词列表到文件'
                    },
                    {
                        opcode: 'exportWordGroup',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '导出分组[groupName]到文件',
                        arguments: {
                            groupName: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '默认分组'
                            }
                        }
                    }
                ],
                menus: {
                    'recorder_status_menu': {
                        acceptReporters: false,
                        items: ['开启', '关闭']
                    }
                }
            };
        }

        // 类属性
        prohibitedWordsGroups = {
            '默认分组': []  // 取消实例敏感词列表，默认分组为空
        };
        currentGroup = '默认分组';
        isRecorderEnabled = false;
        sensitiveWordCount = 0;
        detectionThreshold = 1;
        consecutiveViolationCount = 0;
        
        // 同音字和形近字映射表
        homophoneMappings = this.getDefaultHomophones();
        similarCharMappings = this.getDefaultSimilarChars();

        // 获取当前分组的违禁词列表
        get currentGroupWords() {
            return this.prohibitedWordsGroups[this.currentGroup] || [];
        }

        // 默认同音字映射表
        getDefaultHomophones() {
            return {
                '你': '泥,尼,拟,祢',
                '好': '郝,号,昊,浩',
                '不': '布,步,部,簿',
                '是': '事,市,式,士',
                '我': '窝,卧,沃,蜗'
            };
        }

        // 默认形近字映射表
        getDefaultSimilarChars() {
            return {
                '己': '已,巳',
                '人': '入,八',
                '木': '术,本,末',
                '王': '玉,主',
                '日': '曰,目'
            };
        }

        // 辅助函数：转义正则特殊字符
        escapeRegExp(word) {
            return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // 辅助函数：生成断续匹配的正则表达式
        getDiscontinuousRegExp(word) {
            if (!word) return null;
            const escaped = this.escapeRegExp(word);
            const pattern = escaped.split('').join('.*');
            return new RegExp(pattern, 'gi');
        }

        // 辅助函数：生成同音字变体的正则表达式
        getHomophoneRegExp(word) {
            if (!word) return null;
            
            let pattern = '';
            for (const char of word) {
                const homophones = this.homophoneMappings[char]? 
                    [char,...this.homophoneMappings[char].split(',')] : [char];
                pattern += `[${this.escapeRegExp(homophones.join(''))}]`;
            }
            
            return new RegExp(pattern, 'gi');
        }

        // 辅助函数：生成形近字变体的正则表达式
        getSimilarCharRegExp(word) {
            if (!word) return null;
            
            let pattern = '';
            for (const char of word) {
                const similarChars = this.similarCharMappings[char]? 
                    [char,...this.similarCharMappings[char].split(',')] : [char];
                pattern += `[${this.escapeRegExp(similarChars.join(''))}]`;
            }
            
            return new RegExp(pattern, 'gi');
        }

        // 屏蔽词列表管理方法
        addProhibitedWord(args) {
            const word = args.word;
            if (word.trim()!== '' &&!this.currentGroupWords.includes(word)) {
                this.prohibitedWordsGroups[this.currentGroup].push(word);
            }
        }

        // 批量添加违禁词
        addBulkProhibitedWords(args) {
            const wordsStr = args.wordsStr;
            const separator = args.separator || ',';
            
            if (wordsStr.trim() === '') return;
            
            const words = wordsStr.split(separator)
               .map(word => word.trim())
               .filter(word => word!== '');
            
            for (const word of words) {
                if (!this.currentGroupWords.includes(word)) {
                    this.prohibitedWordsGroups[this.currentGroup].push(word);
                }
            }
        }

        deleteWordFromList(args) {
            const word = args.word;
            const index = this.currentGroupWords.indexOf(word);
            if (index!== -1) {
                this.prohibitedWordsGroups[this.currentGroup].splice(index, 1);
            }
        }

        setWordAtIndex(args) {
            const index = Math.floor(args.index) - 1;
            const newWord = args.newWord;
            if (index >= 0 && index < this.currentGroupWords.length && newWord.trim()!== '') {
                this.prohibitedWordsGroups[this.currentGroup][index] = newWord;
            }
        }

        clearProhibitedWordsList() {
            this.prohibitedWordsGroups[this.currentGroup] = [];
        }

        getProhibitedWordsList() {
            return this.currentGroupWords.join(', ');
        }

        // 违禁词分组管理方法
        createWordGroup(args) {
            const groupName = args.groupName.trim();
            if (groupName &&!this.prohibitedWordsGroups[groupName]) {
                this.prohibitedWordsGroups[groupName] = [];
            }
        }

        deleteWordGroup(args) {
            const groupName = args.groupName.trim();
            if (groupName && groupName!== '默认分组' && groupName!== this.currentGroup) {
                delete this.prohibitedWordsGroups[groupName];
            }
        }

        switchToWordGroup(args) {
            const groupName = args.groupName.trim();
            if (this.prohibitedWordsGroups[groupName]) {
                this.currentGroup = groupName;
            }
        }

        addWordToGroup(args) {
            const word = args.word.trim();
            const groupName = args.groupName.trim();
            
            if (word && this.prohibitedWordsGroups[groupName] &&!this.prohibitedWordsGroups[groupName].includes(word)) {
                this.prohibitedWordsGroups[groupName].push(word);
            }
        }

        getWordsInGroup(args) {
            const groupName = args.groupName.trim();
            return this.prohibitedWordsGroups[groupName]? this.prohibitedWordsGroups[groupName].join(', ') : '';
        }

        getAllGroups() {
            return Object.keys(this.prohibitedWordsGroups).join(', ');
        }

        // 基础检测功能方法
        checkProhibitedWords(args) {
            const inputText = args.textInput;
            let hasViolation = false;
            
            for (const word of this.currentGroupWords) {
                if (inputText.includes(word)) {
                    hasViolation = true;
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                    break;
                }
            }
            
            if (hasViolation) {
                this.consecutiveViolationCount++;
                return this.consecutiveViolationCount >= this.detectionThreshold;
            } else {
                this.consecutiveViolationCount = 0;
                return false;
            }
        }

        replaceProhibitedWords(args) {
            let inputText = args.textInput;
            for (const word of this.currentGroupWords) {
                if (inputText.includes(word)) {
                    const asterisks = '*'.repeat(word.length);
                    inputText = inputText.replace(new RegExp(this.escapeRegExp(word), 'gi'), asterisks);
                }
            }
            return inputText;
        }

        checkAndReplaceWithGivenText(args) {
            const text = args.text;
            const replacementText = args.text1;
            for (const word of this.currentGroupWords) {
                if (text.includes(word)) {
                    return text.replace(new RegExp(this.escapeRegExp(word), 'gi'), replacementText);
                }
            }
            return text;
        }

        replaceAllProhibitedWords(args) {
            let text = args.text;
            const replacementChar = args.text1;
            for (const word of this.currentGroupWords) {
                if (text.includes(word)) {
                    const replacement = replacementChar.repeat(word.length);
                    text = text.replace(new RegExp(this.escapeRegExp(word), 'gi'), replacement);
                }
            }
            return text;
        }

        // 断续词检测处理方法
        replaceDiscontinuousProhibitedWords(args) {
            let text = args.text;
            const replaceText = args.replaceText;
            for (const word of this.currentGroupWords) {
                const regExp = this.getDiscontinuousRegExp(word);
                if (regExp && regExp.test(text)) {
                    text = text.replace(regExp, replaceText);
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                }
            }
            return text;
        }

        deleteDiscontinuousProhibitedWords(args) {
            let text = args.text;
            for (const word of this.currentGroupWords) {
                const regExp = this.getDiscontinuousRegExp(word);
                if (regExp && regExp.test(text)) {
                    text = text.replace(regExp, '');
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                }
            }
            return text;
        }

        // 高级检测功能方法
        checkWithIgnoringSymbols(args) {
            const text = args.text;
            const cleanedText = text.replace(/[\s*\-#_]/g, '');
            for (const word of this.currentGroupWords) {
                if (cleanedText.includes(word)) {
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                    return true;
                }
            }
            return false;
        }

        checkCaseInsensitive(args) {
            const text = args.text.toLowerCase();
            for (const word of this.currentGroupWords) {
                if (text.includes(word.toLowerCase())) {
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                    return true;
                }
            }
            return false;
        }

        replacePartial(args) {
            let text = args.text;
            const replaceLength = Math.max(1, Math.floor(args.length));
            const replaceChar = args.char || '*';

            for (const word of this.currentGroupWords) {
                if (text.includes(word) && word.length > 2) {
                    const start = word[0];
                    const end = word[word.length - 1];
                    const middleLength = Math.min(replaceLength, word.length - 2);
                    const middle = replaceChar.repeat(middleLength);
                    const replacement = start + middle + end;
                    text = text.replace(new RegExp(this.escapeRegExp(word), 'gi'), replacement);
                }
            }
            return text;
        }

        // 同音字/形近字变体检测方法
        checkHomophones(args) {
            const text = args.text;
            
            for (const word of this.currentGroupWords) {
                const regExp = this.getHomophoneRegExp(word);
                if (regExp && regExp.test(text)) {
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                    return true;
                }
            }
            return false;
        }

        checkSimilarCharacters(args) {
            const text = args.text;
            
            for (const word of this.currentGroupWords) {
                const regExp = this.getSimilarCharRegExp(word);
                if (regExp && regExp.test(text)) {
                    if (this.isRecorderEnabled) {
                        this.sensitiveWordCount++;
                    }
                    return true;
                }
            }
            return false;
        }

        replaceVariantWords(args) {
            let text = args.text;
            const replaceText = args.replaceText;
            
            // 先替换同音字变体
            for (const word of this.currentGroupWords) {
                const regExp = this.getHomophoneRegExp(word);
                if (regExp && regExp.test(text)) {
                    text = text.replace(regExp, replaceText);
                }
            }
            
            // 再替换形近字变体
            for (const word of this.currentGroupWords) {
                const regExp = this.getSimilarCharRegExp(word);
                if (regExp && regExp.test(text)) {
                    text = text.replace(regExp, replaceText);
                }
            }
            
            return text;
        }

        addHomophoneMapping(args) {
            const char = args.char.trim();
            const homophones = args.homophones.trim();
            
            if (char && homophones) {
                this.homophoneMappings[char] = homophones;
            }
        }

        addSimilarCharMapping(args) {
            const char = args.char.trim();
            const similarChars = args.similarChars.trim();
            
            if (char && similarChars) {
                this.similarCharMappings[char] = similarChars;
            }
        }

        // 记录与设置方法
        toggleSensitiveWordRecorder(args) {
            this.isRecorderEnabled = args.recorderStatus === '开启';
        }

        clearSensitiveWordRecorder() {
            this.sensitiveWordCount = 0;
            this.consecutiveViolationCount = 0;
        }

        getSensitiveWordCount() {
            return this.sensitiveWordCount;
        }

        isRecorderOn() {
            return this.isRecorderEnabled;
        }

        setThreshold(args) {
            this.detectionThreshold = Math.max(1, Math.floor(args.count));
        }

        // 导入导出方法
        importProhibitedWords() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const words = event.target.result.split('\n')
                           .map(word => word.trim())
                           .filter(word => word &&!this.currentGroupWords.includes(word));
                        this.prohibitedWordsGroups[this.currentGroup].push(...words);
                    };
                    reader.readAsText(file);
                }
                document.body.removeChild(input);
            };
            input.click();
        }

        exportProhibitedWords() {
            if (this.currentGroupWords.length === 0) return;
            
            const content = this.currentGroupWords.join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prohibited_words_${this.currentGroup}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // 导出指定分组
        exportWordGroup(args) {
            const groupName = args.groupName.trim();
            const words = this.prohibitedWordsGroups[groupName];
            
            if (!words || words.length === 0) return;
            
            const content = words.join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prohibited_words_${groupName}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    Scratch.extensions.register(new ProhibitedWordsExtension());
})(Scratch);
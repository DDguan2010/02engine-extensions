class MecsTechnology{
    getInfo() {
        return {
            id: 'MecsTechnology',
            name: 'Mec\'sTechnology',
            color1: '#00BFFF',
            color2: '#FF00FF',
            blocks: [
                {
                    blockType:'label',
                    text:'数学运算'
                }
                ,{
                    opcode: 'Pi',
                    blockType: 'reporter',
                    text: 'π'
                },
                {
                    opcode:'Infinity',
                    blockType:'reporter',
                    text:'∞'
                },
                {
                    opcode:'e',
                    blockType:'reporter',
                    text:'e'
                },
                ,{
                    opcode:'NegativeNumber',
                    blockType:'reporter',
                    text:'-[number]',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:''
                        }
                    }                
                },
                {
                    opcode: 'Sqrt',
                    blockType: 'reporter',
                    text: '[power]√[number]',
                    arguments: {
                        number: {
                            type: 'number',
                            defaultValue: ''
                        },
                        power: {
                            type: 'number',
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'Pow',
                    blockType: 'reporter',
                    text: '[number1]^[number2]',
                    arguments: {
                        number1: {
                            type: 'number',
                            defaultValue: ''
                        },
                        number2: {
                            type: 'number',
                            defaultValue: ''
                        }
                    }
                },
                ,{
                    opcode:'FibonacciSequence',
                    blockType:'reporter',
                    text:'斐波那契数列第[n]项',
                    arguments:{
                        n:{
                            type:'number',
                            defaultValue:'10'
                        }
                    }
                },
                {
                    opcode:'WhatKindOfNumberIsIt',
                    blockType:'Boolean',
                    text:'[number]是[select]?',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:''
                        },
                        select:{
                            type: 'string',
                            menu: 'selectMenu',
                            defaultValue: 'integer'
                        }
                    }
                },
                {
                    opcode:'BiggerOrSame',
                    blockType:'Boolean',
                    text:'[number1]≥[number2]',
                    arguments: {
                        number1: {
                            type: 'number',
                            defaultValue: ''
                        },
                        number2: {
                            type: 'number',
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode:'SmallerOrSame',
                    blockType:'Boolean',
                    text:'[number1]≤[number2]',
                    arguments: {
                        number1: {
                            type: 'number',
                            defaultValue: ''
                        },
                        number2: {
                            type: 'number',
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode:'Neq',
                    blockType:'Boolean',
                    text:'[number1]≠[number2]',
                    arguments: {
                        number1: {
                            type: 'number',
                            defaultValue: ''
                        },
                        number2: {
                            type: 'number',
                            defaultValue: ''
                        }
                    }
                }
                ,{
                    opcode:'OddNumber',
                    blockType:'Boolean',
                    text:'[number]是奇数吗?',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:''
                        }
                    }
                }
                ,{
                    opcode:'EvenNumber',
                    blockType:'Boolean',
                    text:'[number]是偶数吗?',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:''
                        }
                    }
                }
                ,{
                    opcode:'RoundNumber',
                    blockType:'reporter',
                    text:'[number1]保留[number2]位小数',
                    arguments:{
                        number1:{
                            type:'number',
                            defaultValue:''
                        },
                        number2:{
                            type:'number',
                            defaultValue:''
                        }
                    }
                }
                ,{
                    opcode:'IntegerPart',
                    blockType:'reporter',
                    text:'[number]的整数部分',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:''
                        }
                    }
                }
                ,{
                    opcode:'FactorAndMultipleJudgment',
                    blockType:'Boolean',
                    text:'[number1]是[number2]的[chance]?',
                    arguments:{
                        number1:{
                            type:'number',
                            defaultValue:''
                        },
                        number2:{
                            type:'number',
                            defaultValue:''
                        },
                        chance:{
                            type:'string',
                            menu:'chanceMenu',
                            defaultValue:'倍数'
                        }
                    }
                }
                ,{
                    opcode:'Calculate',
                    blockType:'reporter',
                    text:'计算[Equation]',
                    arguments:{
                        Equation:{
                            type:'string',
                            defaultValue:'1+2+3+4'
                        }
                    }
                }
                ,{
                    blockType:'label',
                    text:'日志'
                }
                ,{
                    opcode: 'Log',
                    blockType: 'command',
                    text: '输出日志[CONTENT]',
                    arguments: {
                        CONTENT: {
                            type: 'string',
                            defaultValue: '控制台:ctrl+shift+I'
                        }
                    }
                },
                {
                    blockType:'label',
                    text:'弹窗工具'
                }
                ,{
                    opcode: 'InformationPopup',
                    blockType: 'command',
                    text: '弹出信息框,标题[title],内容[content]',
                    arguments: {
                        title: {
                            type: 'string',
                            defaultValue: '提示'
                        },
                        content: {
                            type: 'string',
                            defaultValue: '这是一条信息'
                        }
                    }
                },
                {
                    opcode: 'inputPopup',
                    blockType: 'reporter',
                    text: '弹出输入框,标题[title],内容[content],按钮文字[buttonText],默认值[defaultValue],输入模式[mode],选项1[opt1],选项2[opt2],选项3[opt3],计时[timed],时长[seconds]',
                    arguments: {
                        title: { type: 'string', defaultValue: '提示' },
                        content: { type: 'string', defaultValue: '这是一条信息' },
                        defaultValue: { type: 'string', defaultValue: '' },
                        buttonText: { type: 'string', defaultValue: '确认' },
                        mode: { 
                            type: 'string', 
                            menu: 'inputModes', 
                            defaultValue: 'text' 
                        },
                        opt1: { type: 'string', defaultValue: '选项1' },
                        opt2: { type: 'string', defaultValue: '选项2' },
                        opt3: { type: 'string', defaultValue: '选项3' },
                        timed: { 
                            type: 'string', 
                            menu: 'timedModes', 
                            defaultValue: 'off' 
                        },
                        seconds: { type: 'number', defaultValue: 10 }
                    }
                }
                ,{
                    opcode:'ConfirmPopup',
                    blockType:'Boolean',
                    text:'弹出确认框,标题[title],内容[content]',
                    arguments: {
                        title: {
                            type: 'string',
                            defaultValue:'提示'
                        },
                        content: {
                            type: 'string',
                            defaultValue:'这是一个问题'
                        }
                    }
                },
                ,{
                    blockType:'label',
                    text:'时间计算'
                }
                ,{
                    opcode:'CurrentTime',
                    blockType:'reporter',
                    text:'当前时间'
                }
                ,{
                    opcode:'CurrentDate',
                    blockType:'reporter',
                    text:'当前日期'
                }
                ,{
                    opcode:'CurrentTimeStamp',
                    blockType:'reporter',
                    text:'当前时间戳'
                }
                ,{
                    opcode:'TimeDifference',
                    blockType:'reporter',
                    text:'[time]到现在有多少[difference]',
                    arguments: {
                        time: {
                            type: 'string',
                            defaultValue:'45645546'
                        },
                        difference: {
                            type:'string',
                            menu: 'differenceMenu',
                            defaultValue: 'seconds'
                        }
                    }
                },
                ,{
                    blockType:'label',
                    text:'进度条'
                }
                ,{
                    opcode:'OpenProgressBar',
                    blockType:'command',
                    text:'显示进度条',
                }
                ,{
                    opcode:'CloseProgressBar',
                    blockType:'command',
                    text:'关闭进度条'
                }
                ,{
                    opcode:'SetProgress',
                    blockType:'command',
                    text:'设置进度条进度为[progress]%',
                    arguments: {
                        progress: {
                            type: 'number',
                            defaultValue: 50
                        }
                    }
                }
                ,{
                    opcode:'ShowProgressBarColorPicker',
                    blockType:'command',
                    text:'设置进度条颜色(弹窗选择)'
                }
                ,{
                    opcode:'SetProgressBarColor',
                    blockType:'command',
                    text:'设置进度条颜色为[color]',
                    arguments:{
                        color:{
                            type:'string',
                            defaultValue:'#00BFFF'
                        }
                    }
                }
                ,{
                    opcode:'AddProgress',
                    blockType:'command',
                    text:'进度条进度增加[progress]%',
                    arguments: {
                        progress: {
                            type: 'number',
                            defaultValue: 10
                        }
                    }
                }
                ,{
                    opcode:'ProgressShowOrNot',
                    blockType:'Boolean',
                    text:'进度条显示?'
                }
                ,{
                    blockType:'label',
                    text:'新鲜小玩意'
                }
                ,{
                    opcode:'TodayLuckValue',
                    blockType:'reporter',
                    text:'今日人品值'
                },
                ,{
                    opcode:'Attractiveness',
                    blockType:'reporter',
                    text:'[person]的颜值',
                    arguments:{
                        person:{
                            type:'string',
                            menu: 'PersonMenu',
                            defaultValue: 'writer'
                        }
                    }
                }
                ,{
                    opcode:'CalculateBMI',
                    blockType:'reporter',
                    text:'计算BMI(弹窗输入身高体重)'
                }
                ,{
                    blockType:'label',
                    text:'特殊值'
                }
                ,{
                    opcode:'Ture',
                    blockType:'Boolean',
                    text:'真'
                }
                ,{
                    opcode:'False',
                    blockType:'Boolean',
                    text:'假'
                }
                ,{
                    opcode:'NewlineCharacter',
                    blockType:'reporter',
                    text:'换行符'
                }
                ,{
                    blockType:'label',
                    text:'字符处理'
                }
                ,{
                    opcode:'RandomCharacter',
                    blockType:'reporter',
                    text:'生成随机[number]位字符',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:8
                        }
                    }
                }
                ,{
                    opcode: 'DecodeBase64OrBinary',
                    blockType: 'reporter',
                    text: '解码[content]为[encoding]',
                    arguments: {
                        content: {
                            type: 'string',
                            defaultValue: 'TGl0dGxlVGVjaG5vbG9neQ=='
                        },
                        encoding: {
                            type: 'string',
                            menu: 'encodingMenu',
                            defaultValue: 'base64'
                        }
                    }
                },
                {
                    opcode: 'EncodeBase64OrBinary',
                    blockType: 'reporter',
                    text: '编码[content]为[encoding]',
                    arguments: {
                        content: {
                            type: 'string',
                            defaultValue: 'LittleTechnology'
                        },
                        encoding: {
                            type: 'string',
                            menu: 'encodingMenu',
                            defaultValue: 'base64'
                        }
                    }
                }
                ,{
                    opcode:'TemperatureConvert',
                    blockType:'reporter',
                    text:'将[temperature]从[fromUnit]转换为[toUnit]',
                    arguments:{
                        temperature:{
                            type:'number',
                            defaultValue:'25'
                        },
                        fromUnit:{
                            type:'string',
                            menu:'temperatureMenu',
                            defaultValue:'celsius'
                        },
                        toUnit:{
                            type:'string',
                            menu:'temperatureMenu',
                            defaultValue:'fahrenheit'
                        }
                    }
                }
                ,{
                    opcode:'RandomCharacterInInputContent',
                    blockType:'reporter',
                    text:'从[content]中随机取[number]位字符',
                    arguments:{
                        content:{
                            type:'string',
                            defaultValue:''
                        },
                        number:{
                            type:'number',
                            defaultValue:8
                        }
                    }
                }
                ,{
                    opcode:'SplitString',
                    blockType:'reporter',
                    text:'以[delimiter]分割[content]取第[number]项',
                    arguments:{
                        content:{
                            type:'string',
                            defaultValue:'Little,Technology'
                        },
                        delimiter:{
                            type:'string',
                            defaultValue:','
                        },
                        number:{
                            type:'number',
                            defaultValue:1
                        }
                    }
                }
                ,{
                    opcode:'Substring',
                    blockType:'reporter',
                    text:'[content]的第[number1]~[number2]个字符',
                    arguments:{
                        content:{
                            type:'string',
                            defaultValue:'LittleTechnology'
                        },
                        number1:{
                            type:'number',
                            defaultValue:1
                        },
                        number2:{
                            type:'number',
                            defaultValue:5
                        }
                    }
                }
                ,{
                    opcode:'ConvertImageToURL',
                    blockType:'reporter',
                    text:'将图片[image]转换为[format]格式',
                    arguments:{
                        image:{
                            type:'string',
                            menu:'imageSources'
                        },
                        format:{
                            type:'string',
                            menu:'imageFormatMenu'
                        }
                    }
                }
                ,{
                    opcode: 'StringTransform',
                    blockType: 'reporter',
                    text: '将[text]转换为[transformType]',
                    arguments: {
                        text: {
                            type: 'string',
                            defaultValue: 'LittleTechnology'
                        },
                        transformType: {
                            type: 'string',
                            menu: 'transformMenu',
                            defaultValue: 'uppercase'
                        }
                    }
                }
                ,{
                    opcode:'ReplaceString',
                    blockType:'reporter',
                    text:'将[content]中的第[number]个[oldString]替换为[newString]',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:1
                        },
                        content:{
                            type:'string',
                            defaultValue:'LittleTechnology'
                        },
                        oldString:{
                            type:'string',
                            defaultValue:'Little'
                        },
                        newString:{
                            type:'string',
                            defaultValue:'Big'
                        }
                    }
                }
                ,{
                    blockType:'label',
                    text:'发送通知'
                }
                ,{
                    opcode:'SendNotice',
                    blockType:'command',
                    text:'发送通知,图片来源[imageSource],图片[photo],标题[title],内容[content],自动关闭时间[autoCloseTime]秒',
                    //图片为空则不显示图片
                    arguments:{
                        imageSource:{
                            type:'string',
                            menu:'imageSources',
                            defaultValue:'none'
                        },
                        photo:{
                            type:'string',
                            defaultValue:''
                        },
                        title:{
                            type:'string',
                            defaultValue:'LittleTechnology'
                        },
                        content:{
                            type:'string',
                            defaultValue:'消息'
                        },
                        autoCloseTime:{
                            type:'number',
                            defaultValue:2.5
                        },//图片路径错误则不显示图片
                    }
                }
                ,{
                    opcode:'ShowNoticeColorPicker',
                    blockType:'command',
                    text:'设置通知颜色(弹窗选择)'
                }
                ,{
                    opcode:'SetNoticeColor',
                    blockType:'command',
                    text:'设置通知颜色为[color]',
                    arguments:{
                        color:{
                            type:'string',
                            defaultValue:'#000000'
                        }
                    }
                }
            ],
            menus: {
                transformMenu: [
                    { value: 'uppercase', text: '大写' },
                    { value: 'lowercase', text: '小写' },
                    { value: 'reverse', text: '反转' },
                    { value: 'shuffle', text: '随机打乱' }
                ],
                encodingMenu: [
                    { value: 'base64', text: 'base64' },
                    { value: 'binary', text: '二进制' }
                ],
                inputModes: [
                    { value: 'text', text: '文本' },
                    { value: 'password', text: '密码' },
                    { value: 'number', text: '数字' },
                    { value: 'select', text: '选择题' }
                ],
                timedModes: [
                    { value: 'off', text: '关闭' },
                    { value: 'on', text: '开启' }
                ],
                imageSources: [
                    { value: 'none', text: '无图片' },
                    { value: 'file', text: '选择文件...' },
                    { value: 'url', text: 'URL' },
                    { value: 'base64', text: 'base64' }
                ],
                imageFormatMenu: [
                    { value: 'dataurl', text: 'base64' },
                    { value: 'bloburl', text: 'URL' }
                ],
                selectMenu: [
                    { value: 'integer', text: '整数' },
                    { value: 'decimal', text: '小数' },
                    { value: 'number', text: '数字' },
                    { value: 'character', text: '字符' },
                    { value: 'prime', text: '质数' }
                ]
                ,chanceMenu: [
                    { value: 'times', text: '倍数' },
                    { value: 'divide', text: '因数' }
                ],
                PersonMenu: [
                    { value: 'writer', text: '作者' },
                    { value: 'PPN', text: 'PPN' },
                    { value: 'NortheastRainSister', text: '东北雨姐' },
                    { value: 'DirectorXiaoChao', text: '小潮院长' },
                    { value: 'OldWangnextdoor', text: '隔壁老王' },
                ],
                shapeMenu: [
                    { value: 'circle', text: '圆形' },
                    { value: 'square', text: '正方形' },
                    { value: 'rectangle', text: '长方形' },
                    { value: 'triangle', text: '三角形' }
                ],
                temperatureMenu: [
                    { value: 'celsius', text: '摄氏度' },
                    { value: 'fahrenheit', text: '华氏度' },
                    { value: 'kelvin', text: '开尔文' }
                ],
                differenceMenu: [
                    { value: 'milliseconds', text: '毫秒' },
                    { value: 'seconds', text: '秒' },
                    { value: 'minutes', text: '分' },
                    { value: 'hours', text: '时' },
                    { value: 'days', text: '天' },
                    { value: 'weeks', text: '周' },
                    { value: 'months', text: '月' },
                    { value: 'quarters', text:'季' },
                    { value: 'years', text: '年' },
                    { value: 'decades', text: '年代' },
                    { value: 'decades', text: '世纪' },
                    { value: 'millenia', text: '千年' },
                ]
            }
        };
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }

    Pow(args) {
        return Math.pow(args.number1, args.number2);
    }

    Pi() {
        return Math.PI;
    }
    Infinity() {
        return Infinity;
    }
    e() {
        return Math.E;
    }

    Sqrt(args) {
        return Math.pow(args.number, 1 / args.power);
    }
    
    WhatKindOfNumberIsIt(args) {
        const number = args.number;
        const select = args.select;
        
        switch (select) {
            case 'integer':
                // 检查是否为整数
                return Number.isInteger(number);
            case 'decimal':
                // 检查是否为小数（非整数）
                return !Number.isInteger(number) && !isNaN(number);
            case 'number':
                // 检查是否为有效数字
                return !isNaN(number) && isFinite(number);
            case 'character':
                // 检查是否为单个字符（字符串长度为1）
                if (typeof number === 'string') {
                    return number.length === 1;
                }
                // 如果是数字，检查是否为0-9的单个数字
                if (typeof number === 'number') {
                    return number >= 0 && number <= 9 && Number.isInteger(number);
                }
                return false;
            case 'prime':
                // 检查是否为质数
                if (number <= 1) return false;
                if (number <= 3) return true;
                if (number % 2 === 0 || number % 3 === 0) return false;
                
                for (let i = 5; i * i <= number; i += 6) {
                    if (number % i === 0 || number % (i + 2) === 0) return false;
                }
                
                return true;
            default:
                return false;
        }
    }
    
    Log(args) {
        console.log(args.CONTENT);
    }

    BiggerOrSame(args) {
      return args.number1 >= args.number2;
    }

    Neq(args) {
      return args.number1 != args.number2;
    }

    SmallerOrSame(args) {
      return args.number1 <= args.number2;
    }

    OddNumber(args) {
        return args.number % 2 !== 0;
    }

    EvenNumber(args) {
        return args.number % 2 === 0;
    }

    RoundNumber(args) {
        const number = args.number1;
        const decimalPlaces = args.number2;
        
        // 确保参数有效
        if (isNaN(number) || isNaN(decimalPlaces)) return 0;
        if (decimalPlaces < 0) return number; // 负数小数位数直接返回原数
        
        return Number(number.toFixed(Math.floor(decimalPlaces)));
    }

    IntegerPart(args) {
        return Math.floor(args.number);
    }

    FactorAndMultipleJudgment(args) {
        const number1 = args.number1;
        const number2 = args.number2;
        const chance = args.chance;
        
        // 确保数字有效且不为零
        if (number2 === 0) return false;
        if (isNaN(number1) || isNaN(number2)) return false;
        
        switch (chance) {
            case 'times':
                // 判断number1是否是number2的倍数
                return number1 % number2 === 0;
            case 'divide':
                // 判断number1是否是number2的因数
                return number2 % number1 === 0;
            default:
                return false;
        }
    }

    Calculate(args) {
        try {
            // 安全地计算数学表达式，避免使用eval()
            const equation = String(args.Equation || '').trim();
            
            // 安全检查：只允许数字、基本运算符和括号
            if (!/^[0-9+\-*/.()\s]+$/.test(equation)) {
                throw new Error('表达式包含非法字符');
            }
            
            // 使用Function构造器作为更安全的替代方案
            const result = new Function(`return ${equation}`)();
            
            // 确保结果是数字
            if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
                throw new Error('计算结果不是有效数字');
            }
            
            return result;
        } catch (error) {
            console.warn('计算表达式失败:', error.message);
            return 0; // 出错时返回0
        }
    }

    InformationPopup(args) {
        const title = args.title || '提示';
        const content = args.content || '这是一条信息';
        alert(`${title}\n\n${content}`);
    }

    inputPopup(args) {
        // 基本参数处理
        const title = this.escapeHtml(args.title || '提示');
        const content = this.escapeHtml(args.content || '这是一条信息');
        const buttonText = this.escapeHtml(args.buttonText || '确认');
        const mode = args.mode || 'text';
        const defaultValue = this.escapeHtml(args.defaultValue || '');
        const timed = args.timed || 'off';
        const seconds = Math.max(1, parseInt(args.seconds) || 10);
        
        // 处理选项，确保有默认值 - 适配Scratch扩展环境
        const options = [];
        
        // 在Scratch环境中，参数可能通过不同的方式传递
        // 尝试多种方式获取选项参数
        const getOptionValue = (argName) => {
            // 方式1: 直接通过args.optX获取
            if (args[argName] !== undefined && args[argName] !== null) {
                const value = args[argName].toString().trim();
                if (value !== '') return value;
            }
            
            // 方式2: 通过args.arguments?.optX获取（某些Scratch版本）
            if (args.arguments && args.arguments[argName] !== undefined && args.arguments[argName] !== null) {
                const value = args.arguments[argName].toString().trim();
                if (value !== '') return value;
            }
            
            // 方式3: 通过args.MENU_OPTX获取（菜单参数）
            const menuKey = 'MENU_' + argName.toUpperCase();
            if (args[menuKey] !== undefined && args[menuKey] !== null) {
                const value = args[menuKey].toString().trim();
                if (value !== '') return value;
            }
            
            return null;
        };
        
        // 获取所有选项
        const opt1Value = getOptionValue('opt1');
        const opt2Value = getOptionValue('opt2');
        const opt3Value = getOptionValue('opt3');
        
        if (opt1Value) options.push(this.escapeHtml(opt1Value));
        if (opt2Value) options.push(this.escapeHtml(opt2Value));
        if (opt3Value) options.push(this.escapeHtml(opt3Value));
        
        // 如果没有有效选项，添加默认选项
        if (options.length === 0) {
            options.push('选项1', '选项2', '选项3');
        }
        
        // 调试输出，检查选项值
        console.log('输入模式:', mode);
        console.log('选项值:', options);
        
        return new Promise((resolve) => {
            let timer = null;
            const popupContainer = document.createElement('div');
            popupContainer.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center;
                z-index: 9999;
            `;
            
            const popupBox = document.createElement('div');
            popupBox.style.cssText = `
                background: white; padding: 20px; border-radius: 8px;
                width: 300px; font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.5);
            `;
            
            // 构建输入区域 - 简化实现
            let inputHtml = '';
            if (mode === 'select') {
                // 选择题模式 - 使用更美观的HTML select元素
                inputHtml = '<div style="margin: 15px 0;">';
                inputHtml += `<select style="
                    width: 100%; 
                    padding: 12px 15px;
                    margin: 10px 0; 
                    box-sizing: border-box; 
                    border: 2px solid #00BFFF;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #f8f9fa;
                    color: #333;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    outline: none;
                " onfocus="this.style.borderColor='#007bff'" onblur="this.style.borderColor='#00BFFF'">`;
                
                // 添加默认提示选项
                if (options.length > 0) {
                    inputHtml += `<option value="" disabled ${!defaultValue ? 'selected' : ''}>请选择...</option>`;
                }
                
                options.forEach((opt, index) => {
                    const isSelected = defaultValue === opt || (index === 0 && !defaultValue);
                    inputHtml += `<option value="${opt}" ${isSelected ? 'selected' : ''}>${opt}</option>`;
                });
                
                inputHtml += '</select>';
                inputHtml += '</div>';
            } else if (mode === 'password') {
                inputHtml = `<input type="password" style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box;" value="${defaultValue}" />`;
            } else if (mode === 'number') {
                inputHtml = `<input type="number" style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box;" value="${defaultValue}" />`;
            } else if (mode === 'text') {
                inputHtml = `<input type="text" style="width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box;" value="${defaultValue}" />`;
            }

            // 计时显示
            const timerHtml = timed === 'on' ? 
                `<div style="color: #ff0000; margin: 10px 0;">剩余时间: <span id="timerDisplay">${seconds}</span>秒</div>` : '';
            
            // 构建弹窗内容
            popupBox.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #333;">${title}</h3>
                <p style="margin: 0 0 15px 0;">${content}</p>
                ${inputHtml}
                ${timerHtml}
                <button style="width: 100%; padding: 8px; background: #00BFFF; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">${buttonText}</button>
            `;
            
            popupContainer.appendChild(popupBox);
            document.body.appendChild(popupContainer);

            // 计时处理
            if (timed === 'on') {
                let remaining = seconds;
                const timerDisplay = popupBox.querySelector('#timerDisplay');
                timer = setInterval(() => {
                    remaining--;
                    timerDisplay.textContent = remaining;
                    if (remaining <= 0) {
                        clearInterval(timer);
                        document.body.removeChild(popupContainer);
                        resolve(null);
                    }
                }, 1000);
            }
            
            // 获取输入值
            const getInputValue = () => {
                if (mode === 'select') {
                    const select = popupBox.querySelector('select');
                    return select ? select.value : '';
                } else {
                    const input = popupBox.querySelector('input');
                    return input ? input.value.trim() : '';
                }
            };
            
            // 确认按钮事件
            const confirmBtn = popupBox.querySelector('button');
            const handleConfirm = () => {
                const value = getInputValue();
                clearInterval(timer);
                document.body.removeChild(popupContainer);
                resolve(value);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            
            // 回车键支持
            if (mode !== 'select') {
                const input = popupBox.querySelector('input');
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') handleConfirm();
                });
                input.focus();
            }
        });
    
    }
    CurrentTime(){
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    ConfirmPopup(args){
        const title = args.title || '提示';
        const content = args.content || '这是一条信息';
        return confirm(`${title}\n\n${content}`);
    }
    CurrentDate(){
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    TimeDifference(args){
        try {
            // 获取并验证日期参数
            const inputTime = new Date(args.time);
            const currentTime = new Date();
            
            // 检查日期是否有效
            if (isNaN(inputTime.getTime())) {
                return "无效的日期格式";
            }
            
            // 计算毫秒差值（取绝对值确保结果为正）
            let diff = Math.abs(currentTime - inputTime);
            
            // 根据选择的单位返回相应的时间差
            const unit = args.difference || 'seconds';
            
            switch (unit) {
                case 'milliseconds':
                    return diff;
                case 'seconds':
                    return Math.floor(diff / 1000);
                case 'minutes':
                    return Math.floor(diff / (1000 * 60));
                case 'hours':
                    return Math.floor(diff / (1000 * 60 * 60));
                case 'days':
                    return Math.floor(diff / (1000 * 60 * 60 * 24));
                case 'weeks':
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
                case 'months':
                    // 近似计算：平均每月30.44天
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
                case 'quarters':
                    // 近似计算：一个季度约91.31天
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 91.31));
                case 'years':
                    // 近似计算：一年约365.25天
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                case 'decades':
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25 * 10));
                case 'centuries':
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25 * 100));
                case 'millenia':
                    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25 * 1000));
                default:
                    return Math.floor(diff / 1000); // 默认返回秒
            }
        } catch (error) {
            return "计算时间差时出错";
        }
    }
    OpenProgressBar(){
        // 创建进度条容器
        const progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'scratch-progress-bar-container';
        progressBarContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            z-index: 9998;
            display: block;
        `;
        
        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.id = 'scratch-progress-bar';
        progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00BFFF, #FF00FF);
            transition: width 0.3s ease;
            border-radius: 0 4px 4px 0;
        `;
        
        // 创建进度文本
        const progressText = document.createElement('div');
        progressText.id = 'scratch-progress-text';
        progressText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-size: 12px;
            font-family: Arial, sans-serif;
            font-weight: bold;
        `;
        progressText.textContent = '0%';
        
        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressText);
        document.body.appendChild(progressBarContainer);
        
        // 存储进度条引用以便后续操作
        this.progressBar = progressBar;
        this.progressText = progressText;
    }
    
    CloseProgressBar(){
        // 移除进度条
        const progressBarContainer = document.getElementById('scratch-progress-bar-container');
        if (progressBarContainer) {
            document.body.removeChild(progressBarContainer);
        }
        // 清除引用
        this.progressBar = null;
        this.progressText = null;
    }
    
    // 可选：添加更新进度的方法
    SetProgress(args) {
        if (this.progressBar && this.progressText) {
            const percent = Math.max(0, Math.min(100, args.progress));
            this.progressBar.style.width = percent + '%';
            this.progressText.textContent = Math.round(percent) + '%';
        }
    }
    
    AddProgress(args){
        if (this.progressBar && this.progressText) {
            const currentPercent = parseFloat(this.progressBar.style.width) || 0;
            const newPercent = Math.max(0, Math.min(100, currentPercent + args.progress));
            this.progressBar.style.width = newPercent + '%';
            this.progressText.textContent = Math.round(newPercent) + '%';
        }
    }
    
    ProgressShowOrNot(args){
        if (this.progressBar) {
            this.progressBar.style.display = args.show ? 'block' : 'none';
            return this.progressBar.style.display === 'block';
        }
        else
        return false;
    }
    
    TodayLuckValue(){
        // 检查是否已经有缓存的人品值，并且是否在同一天
        const today = new Date().toDateString();
        
        if (this._lastLuckValue && this._lastLuckDate === today) {
            // 如果同一天已经生成过，返回缓存的值
            return this._lastLuckValue + ',' + this._lastLuckComment;
        }
        
        // 生成新的人品值
        const luckValue = Math.floor(Math.random() * 101);
        let comment;
        
        if (luckValue >= 0 && luckValue <= 15) {
            comment = '太low了👎!';
        } else if (luckValue >= 16 && luckValue <= 35) {
            comment = '一般般😅。';
        } else if (luckValue >= 36 && luckValue <= 60) {
            comment = '还可以...吧😶?';
        } else if (luckValue >= 61 && luckValue <= 80) {
            comment = 'wow!真不错👍。';
        } else if (luckValue >= 81 && luckValue <= 95) {
            comment = '太高了吧!羡慕😍';
        } else {
            comment = '超神!😰😱';
        }
        
        // 缓存结果和日期
        this._lastLuckValue = luckValue;
        this._lastLuckComment = comment;
        this._lastLuckDate = today;
        
        return luckValue + ',' + comment;
    }

    NewlineCharacter(){
        return '\n';
    }

    Content(args){
        const content = args.content || '';
        return content;
    }

    NegativeNumber(args){
        const number = args.number || '';
        return '-'+number 
    }

    Ture(){
        return true
    }

    False(){
        return false
    }
    
    DecodeBase64OrBinary(args) {
        const content = args.content || '';
        const encoding = args.encoding || 'base64';
        
        try {
            if(encoding === 'base64'){
                // 将Base64解码为字符串
                const decoded = decodeURIComponent(escape(atob(content)));
                return decoded;
            }
            else if(encoding === 'binary'){
                // 将二进制字符串解码为普通字符串
                const binaryStr = content.replace(/\s+/g, ''); // 移除空格
                let result = '';
                for (let i = 0; i < binaryStr.length; i += 8) {
                    const byte = binaryStr.substr(i, 8);
                    if (byte.length === 8) {
                        const charCode = parseInt(byte, 2);
                        result += String.fromCharCode(charCode);
                    }
                }
                return result;
            }
            else
            return '未知编码类型';
        } catch (error) {
            if(encoding === 'base64')
            return 'Base64解码失败';
            else if(encoding === 'binary')
            return '二进制解码失败';
            else
            return '未知编码类型';
        }
    }

    EncodeBase64OrBinary(args) {
        const content = args.content || '';
        const encoding = args.encoding || 'base64';
        
        try {
            if(encoding === 'base64'){
                // 将字符串编码为Base64
                const base64 = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
                return base64;
            }
            else if(encoding === 'binary'){
                // 将字符串编码为二进制（8位格式）
                const binary = content.split('').map(char => {
                    const binaryStr = char.charCodeAt(0).toString(2);
                    // 确保每个字符都是8位二进制
                    return '0'.repeat(8 - binaryStr.length) + binaryStr;
                }).join(' '); // 添加空格分隔每个字节
                return binary;
            }
            else
            return '未知编码类型';
        } catch (error) {
            if(encoding === 'base64')
            return 'Base64编码失败';
            else if(encoding === 'binary')
            return '二进制编码失败';
            else
            return '未知编码类型';
        }
    }
    
    UpperCase(args) {
        const content = args.content || '';
        return content.toUpperCase();
    }
    
    LowerCase(args) {
        const content = args.content || '';
        return content.toLowerCase();
    }

    StringTransform(args){
        const text = args.text || '';
        switch(args.transformType) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'reverse':
                return text.split('').reverse().join('');
            case 'shuffle':
                // 随机打乱字符串（Fisher-Yates洗牌算法）
                const arr = text.split('');
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr.join('');
            default:
                return text;
        }
    }

    ReplaceString(args){
        const content = args.content || '';
        const oldString = args.oldString || '';
        const newString = args.newString || '';
        const targetOccurrence = args.number || 1;
        
        // 如果目标出现次数小于1或oldString为空，直接返回原内容
        if (targetOccurrence < 1 || oldString === '') {
            return content;
        }
        
        let currentIndex = 0;
        let occurrenceCount = 0;
        let result = '';
        
        while (currentIndex < content.length) {
            const nextIndex = content.indexOf(oldString, currentIndex);
            
            // 如果没有找到更多匹配项，添加剩余内容并退出
            if (nextIndex === -1) {
                result += content.substring(currentIndex);
                break;
            }
            
            occurrenceCount++;
            
            // 添加当前匹配项之前的内容
            result += content.substring(currentIndex, nextIndex);
            
            // 如果是目标出现次数，替换oldString为newString
            if (occurrenceCount === targetOccurrence) {
                result += newString;
            } else {
                // 如果不是目标出现次数，保持原样
                result += oldString;
            }
            
            currentIndex = nextIndex + oldString.length;
        }
        
        return result;
    }

    RandomCharacter(args){
        const number = args.number || 8;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < number; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    RandomCharacterInInputContent(args){
        // 获取参数并确保类型正确
        const content = String(args.content || '');
        let number = parseInt(args.number);
        
        // 处理无效的数字参数
        if (isNaN(number) || number < 0) {
            number = 8; // 默认值
        }
        
        // 如果输入内容为空或数字为0，返回空字符串
        if (content.length === 0 || number === 0) {
            return '';
        }
        
        let result = '';
        
        // 从输入内容中随机选择字符
        for (let i = 0; i < number; i++) {
            const randomIndex = Math.floor(Math.random() * content.length);
            result += content.charAt(randomIndex);
        }
        return result;
    }

    SplitString(args){
        const content = args.content || '';
        const delimiter = args.delimiter || ',';
        const number = args.number || 1;
        const arr = content.split(delimiter);
        if(number > 0 && number <= arr.length){
            return arr[number - 1];
        }
        else
        return '';
    }

    Substring(args){
        const content = args.content || '';
        const number1 = args.number1 || 0;
        const number2 = args.number2 || content.length;
        return content.substring(number1 - 1, number2);
    }

    CurrentTimeStamp(){
        return Date.now();
    }

    async SendNotice(args){
        const title = args.title || 'LittleTechnology';
        const content = args.content || '消息';
        const autoCloseTimeSeconds = args.autoCloseTime || 5; // 默认5秒
        const autoCloseTimeMilliseconds = autoCloseTimeSeconds * 1000; // 转换为毫秒
        const imageSource = args.imageSource || '';
        
        let imageUrl = '';
        
        // 处理图片来源选择
        if (imageSource === 'file') {
            // 文件选择模式 - 弹出文件选择器
            const file = await this.showFilePicker();
            if (file) {
                imageUrl = await this.fileToDataUrl(file);
            }
        } else if (imageSource === 'url' && args.photo && args.photo.trim() !== '') {
            // URL模式 - 使用输入的URL
            imageUrl = args.photo;
        } else if (imageSource === 'base64' && args.photo && args.photo.trim() !== '') {
            // base64模式 - 直接使用输入的base64数据
            // 检查是否是有效的base64数据URL格式
            if (args.photo.startsWith('data:image/')) {
                imageUrl = args.photo;
            } else {
                // 如果不是完整的data URL，尝试添加默认的image/jpeg前缀
                imageUrl = 'data:image/jpeg;base64,' + args.photo;
            }
        }
        // 如果imageSource为空或'无图片'，则不显示图片
        
        // 使用自定义HTML通知代替Notification API
        this.ShowCustomNotification(title, content, autoCloseTimeMilliseconds, imageUrl);
        
        return true;
    }
    
    ShowCustomNotification(title, content, autoCloseTime = 5000, image = '') {
        // 检查CSS动画样式是否已存在，避免重复添加
        if (!document.getElementById('notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .custom-notification {
                    animation: slideIn 0.3s ease-out;
                }
                .custom-notification.slide-out {
                    animation: slideOut 0.3s ease-in;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 创建通知容器
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'custom-notification';
        notificationDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            font-family: 'Arial', sans-serif;
            animation: slideIn 0.3s ease-out;
            background-color: #4CAF50;
            display: flex;
            align-items: flex-start;
        `;
        
        // 创建左侧图片区域（如果有图片）
        let imageDiv = null;
        if(image !== ''){
            imageDiv = document.createElement('div');
            imageDiv.style.cssText = `
                width: 80px;
                height: 80px;
                background-image: url(${image});
                background-size: cover;
                background-position: center;
                border-radius: 6px;
                margin-right: 15px;
                flex-shrink: 0;
                position: relative;
            `;
            
            // 添加图片加载错误处理
            const img = new Image();
            img.onload = function() {
                // 图片加载成功，移除错误提示
                const errorOverlay = imageDiv.querySelector('.image-error-overlay');
                if (errorOverlay) {
                    errorOverlay.style.display = 'none';
                }
            };
            img.onerror = function() {
                // 图片加载失败，显示错误提示
                let errorOverlay = imageDiv.querySelector('.image-error-overlay');
                if (!errorOverlay) {
                    errorOverlay = document.createElement('div');
                    errorOverlay.className = 'image-error-overlay';
                    errorOverlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255,0,0,0.1);
                        border: 2px dashed #f44336;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #f44336;
                        font-size: 12px;
                        font-weight: bold;
                        text-align: center;
                        padding: 5px;
                        box-sizing: border-box;
                    `;
                    errorOverlay.textContent = '图片加载失败';
                    imageDiv.appendChild(errorOverlay);
                } else {
                    errorOverlay.style.display = 'flex';
                }
            };
            img.src = image;
        }
        
        // 创建右侧内容区域
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            flex: 1;
            min-width: 0;
            position: relative;
        `;
        
        // 创建标题
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        `;
        titleDiv.textContent = title;
        
        // 创建内容
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `    
            font-size: 14px;
            line-height: 1.4;
        `;
        contentDiv.textContent = content;
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeButton.innerHTML = '×';
        closeButton.onclick = function() {
            notificationDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notificationDiv.parentNode) {
                    notificationDiv.parentNode.removeChild(notificationDiv);
                }
            }, 300);
        };
        
        // 组装通知
        if (imageDiv) {
            notificationDiv.appendChild(imageDiv);
        }
        notificationDiv.appendChild(contentContainer);
        contentContainer.appendChild(titleDiv);
        contentContainer.appendChild(contentDiv);
        contentContainer.appendChild(closeButton);
        
        // 添加到页面
        document.body.appendChild(notificationDiv);
        
        // 点击通知聚焦窗口
        notificationDiv.onclick = function(e) {
            if (e.target !== closeButton) {
                window.focus();
            }
        };
        
        // 自动关闭通知（使用传入的时间参数）
        setTimeout(() => {
            if (notificationDiv.parentNode) {
                notificationDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notificationDiv.parentNode) {
                        notificationDiv.parentNode.removeChild(notificationDiv);
                    }
                }, 300);
            }
        }, autoCloseTime);
    }
    SetNoticeColor(args){
        const color = args.color || '#667eea';
        this.noticeColor = color;
        
        // 移除现有的通知颜色样式（如果存在）
        const existingStyle = document.getElementById('notification-color-style');
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }
        
        // 创建新的通知颜色样式
        const style = document.createElement('style');
        style.id = 'notification-color-style';
        style.textContent = `
            .custom-notification {
                background: linear-gradient(135deg, ${color} 0%, ${color} 100%) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 颜色选择器方法 - 提供可视化颜色选择
    ShowColorPicker(args){
        const title = args.title || '选择通知颜色';
        const currentColor = this.noticeColor || '#667eea';
        
        return new Promise((resolve) => {
            // 创建颜色选择弹窗
            const colorPickerContainer = document.createElement('div');
            colorPickerContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            
            const colorPickerBox = document.createElement('div');
            colorPickerBox.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 300px;
                font-family: Arial, sans-serif;
                text-align: center;
            `;
            
            // 构建颜色选择器内容
            colorPickerBox.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">${title}</h3>
                <input type="color" id="colorPicker" value="${currentColor}" 
                       style="width: 100px; height: 100px; border: none; cursor: pointer;">
                <div style="margin: 15px 0;">
                    <input type="text" id="colorInput" value="${currentColor}" 
                           style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                           placeholder="#RRGGBB">
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirmColor" style="padding: 8px 16px; background: #00BFFF; color: white; border: none; border-radius: 4px; cursor: pointer;">确认</button>
                    <button id="cancelColor" style="padding: 8px 16px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">常用颜色:</div>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        <div style="width: 20px; height: 20px; background: #667eea; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#667eea'; document.getElementById('colorInput').value='#667eea';"></div>
                        <div style="width: 20px; height: 20px; background: #764ba2; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#764ba2'; document.getElementById('colorInput').value='#764ba2';"></div>
                        <div style="width: 20px; height: 20px; background: #f093fb; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#f093fb'; document.getElementById('colorInput').value='#f093fb';"></div>
                        <div style="width: 20px; height: 20px; background: #f5576c; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#f5576c'; document.getElementById('colorInput').value='#f5576c';"></div>
                        <div style="width: 20px; height: 20px; background: #4facfe; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#4facfe'; document.getElementById('colorInput').value='#4facfe';"></div>
                        <div style="width: 20px; height: 20px; background: #43e97b; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('colorPicker').value='#43e97b'; document.getElementById('colorInput').value='#43e97b';"></div>
                    </div>
                </div>
            `;
            
            colorPickerContainer.appendChild(colorPickerBox);
            document.body.appendChild(colorPickerContainer);
            
            const colorPicker = colorPickerBox.querySelector('#colorPicker');
            const colorInput = colorPickerBox.querySelector('#colorInput');
            const confirmBtn = colorPickerBox.querySelector('#confirmColor');
            const cancelBtn = colorPickerBox.querySelector('#cancelColor');
            
            // 颜色选择器和输入框同步
            colorPicker.addEventListener('input', () => {
                colorInput.value = colorPicker.value;
            });
            
            colorInput.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(colorInput.value)) {
                    colorPicker.value = colorInput.value;
                }
            });
            
            // 确认按钮点击事件
            const handleConfirm = () => {
                const selectedColor = colorPicker.value;
                document.body.removeChild(colorPickerContainer);
                this.SetNoticeColor({ color: selectedColor });
                resolve(selectedColor);
            };
            
            // 取消按钮点击事件
            const handleCancel = () => {
                document.body.removeChild(colorPickerContainer);
                resolve(currentColor); // 返回原颜色
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            // 支持回车键确认
            colorInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            // 阻止弹窗外点击关闭
            colorPickerContainer.addEventListener('click', (e) => {
                if (e.target === colorPickerContainer) {
                    handleCancel();
                }
            });
            
            // 自动聚焦颜色输入框
            colorInput.focus();
            colorInput.select();
        });
    }
    
    // 通知颜色选择器方法 - 提供可视化通知颜色选择
    ShowNoticeColorPicker(args) {
        return this.ShowColorPicker(args);
    }
    
    // 设置进度条颜色方法
    SetProgressBarColor(args) {
        const color = args.color || '#00BFFF';
        this.progressBarColor = color;
        
        // 移除现有的进度条颜色样式（如果存在）
        const existingStyle = document.getElementById('progress-bar-color-style');
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }
        
        // 创建新的进度条颜色样式
        const style = document.createElement('style');
        style.id = 'progress-bar-color-style';
        style.textContent = `
            #scratch-progress-bar {
                background: linear-gradient(135deg, ${color} 0%, ${color} 100%) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 进度条颜色选择器方法 - 提供可视化进度条颜色选择
    ShowProgressBarColorPicker(args) {
        const title = args.title || '选择进度条颜色';
        const currentColor = this.progressBarColor || '#00BFFF';
        
        return new Promise((resolve) => {
            // 创建颜色选择弹窗
            const colorPickerContainer = document.createElement('div');
            colorPickerContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            
            const colorPickerBox = document.createElement('div');
            colorPickerBox.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                width: 300px;
                font-family: Arial, sans-serif;
                text-align: center;
            `;
            
            // 构建颜色选择器内容
            colorPickerBox.innerHTML = `
                <h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">${title}</h3>
                <input type="color" id="progressColorPicker" value="${currentColor}" 
                       style="width: 100px; height: 100px; border: none; cursor: pointer;">
                <div style="margin: 15px 0;">
                    <input type="text" id="progressColorInput" value="${currentColor}" 
                           style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                           placeholder="#RRGGBB">
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="progressConfirmColor" style="padding: 8px 16px; background: #00BFFF; color: white; border: none; border-radius: 4px; cursor: pointer;">确认</button>
                    <button id="progressCancelColor" style="padding: 8px 16px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">常用进度条颜色:</div>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
                        <div style="width: 20px; height: 20px; background: #00BFFF; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#00BFFF'; document.getElementById('progressColorInput').value='#00BFFF';"></div>
                        <div style="width: 20px; height: 20px; background: #0078D7; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#0078D7'; document.getElementById('progressColorInput').value='#0078D7';"></div>
                        <div style="width: 20px; height: 20px; background: #107C10; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#107C10'; document.getElementById('progressColorInput').value='#107C10';"></div>
                        <div style="width: 20px; height: 20px; background: #D83B01; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#D83B01'; document.getElementById('progressColorInput').value='#D83B01';"></div>
                        <div style="width: 20px; height: 20px; background: #FFB900; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#FFB900'; document.getElementById('progressColorInput').value='#FFB900';"></div>
                        <div style="width: 20px; height: 20px; background: #881798; border-radius: 3px; cursor: pointer;" onclick="document.getElementById('progressColorPicker').value='#881798'; document.getElementById('progressColorInput').value='#881798';"></div>
                    </div>
                </div>
            `;
            
            colorPickerContainer.appendChild(colorPickerBox);
            document.body.appendChild(colorPickerContainer);
            
            const colorPicker = colorPickerBox.querySelector('#progressColorPicker');
            const colorInput = colorPickerBox.querySelector('#progressColorInput');
            const confirmBtn = colorPickerBox.querySelector('#progressConfirmColor');
            const cancelBtn = colorPickerBox.querySelector('#progressCancelColor');
            
            // 颜色选择器和输入框同步
            colorPicker.addEventListener('input', () => {
                colorInput.value = colorPicker.value;
            });
            
            colorInput.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(colorInput.value)) {
                    colorPicker.value = colorInput.value;
                }
            });
            
            // 确认按钮点击事件
            const handleConfirm = () => {
                const selectedColor = colorPicker.value;
                document.body.removeChild(colorPickerContainer);
                this.SetProgressBarColor({ color: selectedColor });
                resolve(selectedColor);
            };
            
            // 取消按钮点击事件
            const handleCancel = () => {
                document.body.removeChild(colorPickerContainer);
                resolve(currentColor); // 返回原颜色
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            // 支持回车键确认
            colorInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            // 阻止弹窗外点击关闭
            colorPickerContainer.addEventListener('click', (e) => {
                if (e.target === colorPickerContainer) {
                    handleCancel();
                }
            });
            
            // 自动聚焦颜色输入框
            colorInput.focus();
            colorInput.select();
        });
    }
    
    // 显示文件选择器方法
    showFilePicker() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.addEventListener('change', () => {
                if (input.files && input.files[0]) {
                    resolve(input.files[0]);
                } else {
                    resolve(null);
                }
                document.body.removeChild(input);
            });
            
            input.addEventListener('cancel', () => {
                resolve(null);
                document.body.removeChild(input);
            });
            
            document.body.appendChild(input);
            input.click();
        });
    }
    
    // 文件转Data URL方法
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // 图片转URL/base64方法
    ConvertImageToURL(args) {
        const imageSource = args.image || '';
        const format = args.format || 'dataurl';
        
        return new Promise(async (resolve) => {
            try {
                if (imageSource === 'file') {
                    // 文件选择模式
                    const file = await this.showFilePicker();
                    if (!file) {
                        resolve('');
                        return;
                    }
                    
                    if (format === 'dataurl') {
                        // 转换为Data URL (base64)
                        const dataUrl = await this.fileToDataUrl(file);
                        resolve(dataUrl);
                    } else if (format === 'bloburl') {
                        // 转换为Blob URL
                        const blobUrl = URL.createObjectURL(file);
                        resolve(blobUrl);
                    }
                } else if (imageSource === 'url') {
                    // URL输入模式 - 需要用户输入URL
                    const url = await this.inputPopup({
                        title: '输入图片URL',
                        content: '请输入图片的URL地址：',
                        mode: 'text',
                        defaultValue: 'https://'
                    });
                    
                    if (url && url.trim() !== '' && url !== 'https://') {
                        if (format === 'dataurl') {
                            // 对于URL，Data URL需要先下载图片
                            try {
                                const response = await fetch(url);
                                const blob = await response.blob();
                                const dataUrl = await this.fileToDataUrl(blob);
                                resolve(dataUrl);
                            } catch (error) {
                                console.error('下载图片失败:', error);
                                resolve('');
                            }
                        } else {
                            // 直接返回URL
                            resolve(url.trim());
                        }
                    } else {
                        resolve('');
                    }
                } else {
                    // 无图片模式
                    resolve('');
                }
            } catch (error) {
                console.error('图片转换失败:', error);
                resolve('');
            }
        });
    }
    
    // 斐波那契数列
    FibonacciSequence(args) {
        const n = parseInt(args.n) || 10;
        
        if (n <= 0) return 0;
        if (n === 1) return 0;
        if (n === 2) return 1;
        
        let a = 0, b = 1;
        for (let i = 3; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
        }
        
        return b;
    }
    
    // 温度转换
    TemperatureConvert(args) {
        const temperature = parseFloat(args.temperature) || 25;
        const fromUnit = args.fromUnit || 'celsius';
        const toUnit = args.toUnit || 'fahrenheit';
        
        // 先转换为摄氏度
        let celsius = temperature;
        
        if (fromUnit === 'fahrenheit') {
            celsius = (temperature - 32) * 5 / 9;
        } else if (fromUnit === 'kelvin') {
            celsius = temperature - 273.15;
        }
        
        // 从摄氏度转换为目标单位
        if (toUnit === 'celsius') {
            return celsius;
        } else if (toUnit === 'fahrenheit') {
            return (celsius * 9 / 5) + 32;
        } else if (toUnit === 'kelvin') {
            return celsius + 273.15;
        }
        
        return temperature;
    }
    
    // 计算BMI（弹窗输入）
    async CalculateBMI(){
        // 弹窗输入身高
        const heightInput = await this.inputPopup({
            title: '输入身高',
            content: '请输入您的身高（厘米）：',
            mode: 'number',
            defaultValue: '170'
        });
        
        if (!heightInput || heightInput.trim() === '') return 0;
        
        // 弹窗输入体重
        const weightInput = await this.inputPopup({
            title: '输入体重',
            content: '请输入您的体重（千克）：',
            mode: 'number',
            defaultValue: '65'
        });
        
        if (!weightInput || weightInput.trim() === '') return 0;
        
        const height = parseFloat(heightInput);
        const weight = parseFloat(weightInput);
        
        if (height <= 0 || weight <= 0) return 0;
        
        // 转换为米
        const heightInMeters = height / 100;
        // BMI公式: 体重(kg) / 身高(m)²
        const bmi = weight / (heightInMeters * heightInMeters);
        
        return Number(bmi.toFixed(2));
    }
    
    Attractiveness(args){
        const person = args.person || 'writer';
        
        if (person === 'NortheastRainSister') {
            return '啊哟我滴妈呀这是啥呀';
        } else if (person === 'DirectorXiaoChao') {
            return '90';
        } else if (person === 'OldWangnextdoor') {
            return '7.8';
        } else if (person === 'writer') {
            return '100';
        } else if (person === 'PPN') {
            return 'Infinity';
        } else {
            return '未知'; // 默认返回值
        }
    }
}
Scratch.extensions.register(new MecsTechnology());

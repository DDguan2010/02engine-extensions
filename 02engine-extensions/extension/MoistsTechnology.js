class MoistsTechnology{
    constructor() {
        // 初始化鼠标事件状态变量
        this.isDoubleClick = false;
        this.wheelDirection = null;
        this.mouseButtons = {
            left: false,
            middle: false,
            right: false
        };
        
        // 对话框相关状态变量
        this.dialogTextVisible = false;
        this.dialogTextSize = 'medium'; // 默认中等大小
        
        // 双击检测
        let lastClickTime = 0;
        document.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const timeBetweenClicks = currentTime - lastClickTime;
            
            if (timeBetweenClicks < 300 && timeBetweenClicks > 0) {
                // 双击事件发生
                this.isDoubleClick = true;
                
                // 50毫秒后重置双击状态（避免连续检测到双击）
                setTimeout(() => {
                    this.isDoubleClick = false;
                }, 50);
            }
            
            lastClickTime = currentTime;
        });
        
        // 鼠标滚轮事件
        document.addEventListener('wheel', (e) => {
            if (e.deltaY < 0) {
                this.wheelDirection = 'up';
            } else {
                this.wheelDirection = 'down';
            }
            
            // 20毫秒后重置滚轮方向（让Scratch能够检测到这个状态变化）
            setTimeout(() => {
                this.wheelDirection = null;
            }, 20);
        });
        
        // 鼠标按键事件
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseButtons.left = true;
            } else if (e.button === 1) {
                this.mouseButtons.middle = true;
            } else if (e.button === 2) {
                this.mouseButtons.right = true;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouseButtons.left = false;
            } else if (e.button === 1) {
                this.mouseButtons.middle = false;
            } else if (e.button === 2) {
                this.mouseButtons.right = false;
            }
        });
        
        // 右键菜单阻止
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    //1.0版本
    
    getInfo() {
        return {
            id: 'MoistsTechnology',
            name: 'Moist\'s Technology',
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
                    text:'日志输出'
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
                ,{
                    blockType:'label',
                    text:'侦测鼠标'
                }
                ,{
                    opcode:'DoubleClick',
                    blockType:'Boolean',
                    text:'双击?'
                }
                ,{
                    opcode:'MouseWheel',
                    blockType:'Boolean',
                    text:'鼠标滚轮[direction]?',
                    arguments:{
                        direction:{
                            type:'string',
                            menu:'directionMenu',
                            defaultValue:'up'
                        }
                    }
                }
                ,{
                    opcode:'LMRClick',
                    blockType:'Boolean',
                    text:'按下[button]?',
                    arguments:{
                        button:{
                            type:'string',
                            menu:'buttonMenu',
                            defaultValue:'right'
                        }
                    }
                }
                ,{
                    blockType:'label',
                    text:'弹窗工具'
                }
                ,{
                    opcode: 'InformationPopup',
                    blockType: 'command',
                    text: '弹出信息框,标题[title],内容[content],按钮文字[buttonText],文字位置[textLocation],文字样式[textStyle]',
                    arguments: {
                        title: {
                            type: 'string',
                            defaultValue: '提示'
                        },
                        content: {
                            type: 'string',
                            defaultValue: '这是一条信息'
                        },
                        buttonText: {
                            type: 'string',
                            defaultValue: '确认'
                        },
                        textLocation: {
                            type: 'string',
                            menu: 'textLocationMenu',
                            defaultValue: 'left'
                        },
                        textStyle: {
                            type: 'string',
                            menu: 'textStyleMenu',
                            defaultValue: 'default'
                        }
                    }
                },
                {
                    opcode: 'inputPopup',
                    blockType: 'reporter',
                    text: '弹出输入框,标题[title],内容[content],按钮文字[buttonText],文字位置[textLocation],文字样式[textStyle],默认值[defaultValue],输入模式[mode],选项1[opt1],选项2[opt2],选项3[opt3],定时关闭[timed],时长[seconds]',
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
                        seconds: { type: 'number', defaultValue: 10 },
                        textLocation: {
                            type: 'string',
                            menu: 'textLocationMenu',
                            defaultValue: 'left'
                        },
                        textStyle: {
                            type: 'string',
                            menu: 'textStyleMenu',
                            defaultValue: 'default'
                        }
                    }
                }
                ,{
                    opcode:'ConfirmPopup',
                    blockType:'Boolean',
                    text:'弹出确认框,标题[title],内容[content],按钮1文字[buttonText1],按钮2文字[buttonText2],文字位置[textLocation],文字样式[textStyle]',
                    arguments: {
                        title: {
                            type: 'string',
                            defaultValue:'提示'
                        },
                        content: {
                            type: 'string',
                            defaultValue:'这是一个问题'
                        },
                        buttonText1: {
                            type: 'string',
                            defaultValue: '确认'
                        },
                        buttonText2: {
                            type: 'string',
                            defaultValue: '取消'
                        },
                        textLocation: {
                            type: 'string',
                            menu: 'textLocationMenu',
                            defaultValue: 'left'
                        },
                        textStyle: {
                            type: 'string',
                            menu: 'textStyleMenu',
                            defaultValue: 'default'
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
                    opcode:'TimeUnitConversion',
                    blockType:'reporter',
                    text:'以[unit1]为单位把[number]转为[unit2]',
                    arguments:{
                        number:{
                            type:'number',
                            defaultValue:'114514'
                        },
                        unit1:{
                            type:'string',
                            menu:'unit1Menu',
                            defaultValue:'timestamp'
                        },
                        unit2:{
                            type:'string',
                            menu:'unit2Menu',
                            defaultValue:'minutes'
                        }
                    }
                }
                ,{
                    opcode:'TimeStampToFormat',
                    blockType:'reporter',
                    text:'时间戳[TimeStamp]转[Format]',
                    arguments: {
                        TimeStamp: {
                            type: 'string',
                            defaultValue:'114514'
                        },
                        Format: {
                            type:'string',
                            menu: 'formatMenu',
                            defaultValue: 'yyyy-MM-dd HH:mm:ss'
                        }
                    }
                }
                ,{
                    opcode:'TimeDifference',
                    blockType:'reporter',
                    text:'[time]到现在有多少[difference]',
                    arguments: {
                        time: {
                            type: 'string',
                            defaultValue:'0'
                        },
                        difference: {
                            type:'string',
                            menu: 'differenceMenu',
                            defaultValue: 'milliseconds'
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
                    opcode:'RandomBoolean',
                    blockType:'Boolean',
                    text:'随机'
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
                    opcode:'RandomCharacterInInputContent',
                    blockType:'reporter',
                    text:'从[content]中随机取[number]位字符',
                    arguments:{
                        content:{
                            type:'string',
                            defaultValue:'114514'
                        },
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
                    opcode:'IfThenElse',
                    blockType:'reporter',
                    text:'如果[condition]则[trueValue]，否则[falseValue]',
                    arguments:{
                        condition:{
                            type:'Boolean'
                        },
                        trueValue:{
                            type:'string',
                            defaultValue:''
                        },
                        falseValue:{
                            type:'string',
                            defaultValue:''
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
                    text:'成就'
                }
                ,{
                    opcode:'ShowAchievement',
                    blockType:'command',
                    text:'获得成就,图片来源[imageSource],链接[photo],标题[title],内容[content],自动关闭时间[autoCloseTime]秒',
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
                    opcode:'ShowAchievementColorPicker',
                    blockType:'command',
                    text:'设置成就颜色(弹窗选择)'
                }
                ,{
                    opcode:'SetAchievementColor',
                    blockType:'command',
                    text:'设置成就颜色为[color]',
                    arguments:{
                        color:{
                            type:'string',
                            defaultValue:'#000000'
                        }
                    }
                }
                ,{
                    blockType:'label',
                    text:'对话框'
                }
                ,{
                    opcode:'isDialogTextVisible',
                    blockType:'Boolean',
                    text:'对话框文字显示中?'
                }
                ,{
                    opcode:'ShowDialogFontColorPicker',
                    blockType:'command',
                    text:'设置对话框字体颜色(弹窗选择)'
                }
                ,{
                    opcode:'SetDialogFontColor',
                    blockType:'command',
                    text:'设置对话框字体颜色为[color]',
                    arguments:{
                        color:{
                            type:'string',
                            defaultValue:'#000000'
                        }
                    }
                }
                ,{
                    opcode:'SetDialogTextSize',
                    blockType:'command',
                    text:'设置对话框文字大小为[textSize]',
                    arguments:{
                        textSize:{
                            type:'string',
                            menu:'textSizeMenu',
                            defaultValue:'中'
                        }
                    }
                }
                ,{
                    opcode:'ShowDialog',
                    blockType:'command',
                    text:'显示对话框,显示模式[showMode],文字位置[fontPosition],文字效果[textEffect],标题[title],内容[content],对话框位置[position]',
                    arguments:{
                        showMode:{
                            type:'string',
                            menu:'showModesMenu',
                            defaultValue:'逐字显示'
                        },
                        position:{
                            type:'string',
                            menu:'positionMenu',
                            defaultValue:'top'
                        },
                        fontPosition:{
                            type:'string',
                            menu:'fontPositionMenu',
                            defaultValue:'left'
                        },
                        textEffect:{
                            type:'string',
                            menu:'textEffectMenu',
                            defaultValue:'普通'
                        },
                        title:{
                            type:'string',
                            defaultValue:'LittleTechnology'
                        },
                        content:{
                            type:'string',
                            defaultValue:'消息'
                        },
                    }
                }
                ,{
                    blockType:'label',
                    text:'文件'
                }
                ,{                    
                    opcode:'ReadFile',                    
                    blockType:'reporter',                    
                    text:'打开一个文件作为[format1]',                    
                    arguments:{                        
                        format1:{                            
                            type:'string',                            
                            menu:'format1Menu',                            
                            defaultValue:'text'                        
                        }               
                    }                
                }
                ,{                    
                    opcode:'ReadFileFormat',                    
                    blockType:'reporter',                    
                    text:'打开一个格式为[format]的文件作为[format2]',                    
                    arguments:{                        
                        format:{                            
                            type:'string',                            
                            defaultValue:'.txt'                        
                        },                        
                        format2:{                            
                            type:'string',                            
                            menu:'format1Menu',                           
                            defaultValue:'text'                        
                        }                                 
                        }                
                }
                ,{
                    opcode:'ClearSelectedFile',
                    blockType:'command',
                    text:'清除已选择的文件'
                }
                ,{
                    opcode:'GetFileName',
                    blockType:'reporter',
                    text:'文件名'
                }
                ,{
                    opcode:'GetFileFormat',
                    blockType:'reporter',
                    text:'文件格式'
                }
                ,{
                    opcode:'GetFileSize',
                    blockType:'reporter',
                    text:'文件大小([unit3])',
                    arguments:{
                        unit3:{
                            type:'string',
                            menu:'unit3Menu',
                            defaultValue:'byte'
                        }
                    }
                }
                ,{                    
                    opcode:'GetLastModifiedTime',                    
                    blockType:'reporter',                    
                    text:'最后修改时间'                
                }                
                ,{                    
                    opcode:'IsFileSelected',                    
                    blockType:'Boolean',                    
                    text:'已选择文件?'                
                }
                ,{
                    opcode:'WriteFile',
                    blockType:'command',
                    text:'保存文件,名为[filePath],内容[content]',
                    arguments:{
                        content:{
                            type:'string',
                            defaultValue:'内容'
                        },
                        filePath:{
                            type:'string',
                            defaultValue:'文件路径'
                        }
                    }
                }
                ,{
                    blockType:'label',
                    text:'关于系统'
                }
                ,{
                    opcode:'GetSystemName',
                    blockType:'reporter',
                    text:'系统名'
                }
                ,{
                    opcode:'GetBrowserName',
                    blockType:'reporter',
                    text:'浏览器名'
                }
            ],
            menus: {
                textSizeMenu: [
                    { value: 'tiny', text: '微' },
                    { value: 'small', text: '小' },
                    { value: 'medium', text: '中' },
                    { value: 'large', text: '大' },
                    { value: 'huge', text: '巨大' }
                ],
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
                ,formatMenu: [
                    { value: 'yyyy-MM-dd HH:mm:ss', text: 'yyyy-MM-dd HH:mm:ss' },
                    { value: 'yyyy-MM-dd', text: 'yyyy-MM-dd' },
                    { value: 'HH:mm:ss', text: 'HH:mm:ss' },
                    { value: 'HH:mm', text: 'HH:mm' },
                ]
                ,unit1Menu: [
                    { value: 'timestamp', text: '时间戳' },
                    { value: 'milliseconds', text: '毫秒' },
                    { value: 'seconds', text: '秒' },
                    { value: 'minutes', text: '分' },
                    { value: 'hours', text: '时' },
                    { value: 'days', text: '天' },
                    { value: 'weeks', text: '周' },
                    { value: 'months', text:'月' },
                    { value: 'quarters', text:'季' },
                    { value: 'years', text: '年' },
                    { value: 'decades', text: '年代' },
                    { value: 'decades', text: '世纪' },
                    { value: 'millenia', text: '千年' },
                ]
                ,unit2Menu: [
                    { value: 'timestamp', text: '时间戳' },
                    { value: 'milliseconds', text: '毫秒' },
                    { value: 'seconds', text: '秒' },
                    { value: 'minutes', text: '分' },
                    { value: 'hours', text: '时' },
                    { value: 'days', text: '天' },
                    { value: 'weeks', text: '周' },
                    { value: 'months', text:'月' },
                    { value: 'quarters', text:'季' },
                    { value: 'years', text: '年' },
                    { value: 'decades', text: '年代' },
                    { value: 'decades', text: '世纪' },
                    { value: 'millenia', text: '千年' },
                ]
                ,showModesMenu: [
                    { value: 'typewriter', text: '逐字显示' },
                    { value: 'fade', text: '渐变显示' },
                    { value: 'direct', text: '直接显示' },
                ],
                textEffectMenu: [
                    { value: 'normal', text: '普通' },
                    { value: 'shake', text: '颤抖' },
                    { value: 'color', text: '变色' },
                    { value: 'gibberish', text: '胡言乱语' },
                    { value: 'random', text: '随机' },
                ],
                fontPositionMenu: [
                    { value: 'left', text: '左对齐' },
                    { value: 'center', text: '居中对齐' },
                    { value: 'right', text: '右对齐' }
                ],
                positionMenu: [
                    { value: 'top', text: '顶部' },
                    { value: 'middle', text: '中间' },
                    { value: 'bottom', text: '底部' },
                ],
                textLocationMenu: [
                    { value: 'left', text: '左对齐' },
                    { value: 'center', text: '居中对齐' },
                    { value: 'right', text: '右对齐' }     
                ],
                textStyleMenu: [
                    { value: 'default', text: '默认' },
                    { value: 'bold', text: '加粗' },
                    { value: 'italic', text: '斜体' },
                    { value: 'underline', text: '下划线' },
                ],
                unit3Menu: [
                    { value: 'byte', text: '字节' },
                    { value: 'B', text: 'B' },
                    { value: 'KB', text: 'KB' },
                    { value: 'MB', text: 'MB' },
                    { value: 'GB', text: 'GB' },
                    { value: 'TB', text: 'TB' },
                ],
                format1Menu: [
                    { value: 'text', text: '文本' },
                    { value: 'json', text: 'JSON' },
                    { value: 'url', text: 'URL' },
                    { value: 'base64', text: 'Base64' }
                ],
                format2Menu: [
                    { value: 'text', text: '文本' },
                    { value: 'json', text: 'JSON' },
                    { value: 'url', text: 'URL' },
                    { value: 'base64', text: 'Base64' }
                ],
                directionMenu: [
                    { value: 'up', text: '向上' },
                    { value: 'down', text: '向下' }
                ],
                buttonMenu: [
                    { value: 'left', text: '左键' },
                    { value: 'middle', text: '中键' },
                    { value: 'right', text: '右键' }
                ],
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
      
    // 文字样式处理函数
    getTextStyle(style) {
        switch(style) {
            case 'bold':
                return 'font-weight: bold;';
            case 'italic':
                return 'font-style: italic;';
            case 'underline':
                return 'text-decoration: underline;';
            case 'big':
                return 'font-size: 18px;';
            case 'small':
                return 'font-size: 12px;';
            case 'red':
                return 'color: red;';
            case 'blue':
                return 'color: blue;';
            case 'green':
                return 'color: green;';
            default:
                return '';
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
        const buttonText = args.buttonText || '确定';
        const textLocation = args.textLocation || 'center';
        const textStyle = args.textStyle || 'default';
        
        // 创建自定义信息框
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;
            
            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                min-width: 320px;
                max-width: 480px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
                font-family: 'Segoe UI', Arial, sans-serif;
            `;
            
            // 创建图标
            const icon = document.createElement('div');
            icon.style.cssText = `
                width: 48px;
                height: 48px;
                background: #0078d4;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto 16px auto;
                color: white;
                font-size: 24px;
                font-weight: bold;
            `;
            icon.textContent = 'i';
            
            // 创建标题
            const titleEl = document.createElement('h3');
            titleEl.textContent = title;
            
            // 根据文字位置设置标题对齐方式
            let titleAlign = 'center';
            if (textLocation === 'left') titleAlign = 'left';
            else if (textLocation === 'right') titleAlign = 'right';
            
            titleEl.style.cssText = `
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                text-align: ${titleAlign};
            `;
            
            // 创建内容
            const contentEl = document.createElement('div');
            contentEl.textContent = content;
            
            // 根据文字位置设置内容对齐方式
            let contentAlign = 'center';
            if (textLocation === 'left') contentAlign = 'left';
            else if (textLocation === 'right') contentAlign = 'right';
            
            // 根据文字样式设置内容样式
            let contentStyle = '';
            if (textStyle === 'bold') contentStyle = 'font-weight: bold;';
            else if (textStyle === 'italic') contentStyle = 'font-style: italic;';
            else if (textStyle === 'underline') contentStyle = 'text-decoration: underline;';
            
            contentEl.style.cssText = `
                margin: 0 0 24px 0;
                font-size: 14px;
                line-height: 1.5;
                color: #666;
                text-align: ${contentAlign};
                min-height: 40px;
                ${contentStyle}
            `;
            
            // 创建确认按钮
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = buttonText;
            
            // 根据文字位置设置按钮对齐方式
            let buttonAlign = 'center';
            if (textLocation === 'left') buttonAlign = 'flex-start';
            else if (textLocation === 'right') buttonAlign = 'flex-end';
            
            confirmBtn.style.cssText = `
                padding: 10px 24px;
                border: none;
                background: #0078d4;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                display: block;
                margin: ${buttonAlign === 'center' ? '0 auto' : '0'};
                min-width: 120px;
            `;
            confirmBtn.onmouseover = () => {
                confirmBtn.style.background = '#106ebe';
                confirmBtn.style.transform = 'translateY(-1px)';
            };
            confirmBtn.onmouseout = () => {
                confirmBtn.style.background = '#0078d4';
                confirmBtn.style.transform = 'translateY(0)';
            };
            
            // 添加动画样式（如果不存在）
            if (!document.querySelector('style[data-info-popup-animations]')) {
                const style = document.createElement('style');
                style.setAttribute('data-info-popup-animations', 'true');
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        from { 
                            opacity: 0; 
                            transform: translateY(-20px) scale(0.9);
                        }
                        to { 
                            opacity: 1; 
                            transform: translateY(0) scale(1);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 按钮点击事件
            const handleClose = () => {
                document.body.removeChild(overlay);
                resolve();
            };
            
            confirmBtn.onclick = handleClose;
            
            // 点击遮罩层关闭
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    handleClose();
                }
            };
            
            // 回车键关闭
            const handleKeyPress = (e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    handleClose();
                }
            };
            document.addEventListener('keydown', handleKeyPress);
            
            // 组装对话框
            dialog.appendChild(icon);
            dialog.appendChild(titleEl);
            dialog.appendChild(contentEl);
            dialog.appendChild(confirmBtn);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // 聚焦确认按钮
            confirmBtn.focus();
            
            // 清理事件监听器
            overlay.addEventListener('DOMNodeRemoved', () => {
                document.removeEventListener('keydown', handleKeyPress);
            });
        });
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
        
        // 添加对textLocation和textStyle参数的处理
        const textLocation = args.textLocation || 'left';
        const textStyle = args.textStyle || 'default';
        
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
                <p style="margin: 0 0 15px 0; text-align: ${textLocation}; ${this.getTextStyle(textStyle)}">${content}</p>
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
        const buttonText1 = args.buttonText1 || '确认';
        const buttonText2 = args.buttonText2 || '取消';
        const textLocation = args.textLocation || 'left';
        const textStyle = args.textStyle || 'default';
        
        // 创建自定义确认框
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;
            
            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                min-width: 320px;
                max-width: 480px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
                font-family: 'Segoe UI', Arial, sans-serif;
            `;
            
            // 创建标题
            const titleEl = document.createElement('h3');
            titleEl.textContent = title;
            
            // 根据文字位置设置标题对齐方式
            let titleAlign = 'left';
            if (textLocation === 'center') titleAlign = 'center';
            else if (textLocation === 'right') titleAlign = 'right';
            
            titleEl.style.cssText = `
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                border-bottom: 2px solid #0078d4;
                padding-bottom: 8px;
                text-align: ${titleAlign};
            `;
            
            // 创建内容
            const contentEl = document.createElement('div');
            contentEl.textContent = content;
            
            // 根据文字位置设置内容对齐方式
            let contentAlign = 'left';
            if (textLocation === 'center') contentAlign = 'center';
            else if (textLocation === 'right') contentAlign = 'right';
            
            // 根据文字样式设置内容样式
            let contentStyle = '';
            if (textStyle === 'bold') contentStyle = 'font-weight: bold;';
            else if (textStyle === 'italic') contentStyle = 'font-style: italic;';
            else if (textStyle === 'underline') contentStyle = 'text-decoration: underline;';
            
            contentEl.style.cssText = `
                margin: 0 0 24px 0;
                font-size: 14px;
                line-height: 1.5;
                color: #666;
                min-height: 40px;
                text-align: ${contentAlign};
                ${contentStyle}
            `;
            
            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            
            // 根据文字位置设置按钮容器对齐方式
            let buttonJustify = 'flex-end';
            if (textLocation === 'center') buttonJustify = 'center';
            else if (textLocation === 'left') buttonJustify = 'flex-start';
            
            buttonContainer.style.cssText = `
                display: flex;
                justify-content: ${buttonJustify};
                gap: 12px;
            `;
            
            // 创建确认按钮
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = buttonText1;
            confirmBtn.style.cssText = `
                padding: 10px 20px;
                border: none;
                background: #0078d4;
                color: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                min-width: 80px;
            `;
            confirmBtn.onmouseover = () => {
                confirmBtn.style.background = '#106ebe';
                confirmBtn.style.transform = 'translateY(-1px)';
            };
            confirmBtn.onmouseout = () => {
                confirmBtn.style.background = '#0078d4';
                confirmBtn.style.transform = 'translateY(0)';
            };
            
            // 创建取消按钮
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = buttonText2;
            cancelBtn.style.cssText = `
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: white;
                color: #666;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                min-width: 80px;
            `;
            cancelBtn.onmouseover = () => {
                cancelBtn.style.background = '#f5f5f5';
                cancelBtn.style.borderColor = '#ccc';
                cancelBtn.style.transform = 'translateY(-1px)';
            };
            cancelBtn.onmouseout = () => {
                cancelBtn.style.background = 'white';
                cancelBtn.style.borderColor = '#ddd';
                cancelBtn.style.transform = 'translateY(0)';
            };
            
            // 添加动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-20px) scale(0.9);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            
            // 按钮点击事件
            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };
            
            confirmBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
            
            // 点击遮罩层关闭（可选）
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            };
            
            // 组装对话框
            buttonContainer.appendChild(cancelBtn);
            buttonContainer.appendChild(confirmBtn);
            dialog.appendChild(titleEl);
            dialog.appendChild(contentEl);
            dialog.appendChild(buttonContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(style);
            document.body.appendChild(overlay);
            
            // 聚焦确认按钮
            confirmBtn.focus();
        });
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
            let inputTime;
            const timeInput = String(args.time || '').trim();
            
            // 处理数字输入（Unix时间戳）
            if (/^\d+$/.test(timeInput)) {
                const timestamp = parseInt(timeInput);
                // 检查是否是合理的时间戳（1970年之后）
                if (timestamp > 0 && timestamp < 253402300800000) { // 最大支持到9999年
                    inputTime = new Date(timestamp);
                } else {
                    return "无效的时间戳";
                }
            } else {
                // 处理字符串日期格式
                inputTime = new Date(timeInput);
            }
            
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
            height: 30px;
            background: rgba(240, 240, 240, 0.95);
            z-index: 9998;
            display: block;
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        `;
        
        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.id = 'scratch-progress-bar';
        progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00BFFF, #0078D7);
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0 4px 4px 0;
            position: relative;
            overflow: hidden;
        `;
        
        // 添加进度条动画效果
        const progressAnimation = document.createElement('div');
        progressAnimation.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: shimmer 2s infinite;
        `;
        progressBar.appendChild(progressAnimation);
        
        // 创建进度文本
        const progressText = document.createElement('div');
        progressText.id = 'scratch-progress-text';
        progressText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-size: 14px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
            z-index: 1;
        `;
        progressText.textContent = '0%';
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
            #scratch-progress-bar-container {
                transition: transform 0.3s ease;
            }
            #scratch-progress-bar-container.hidden {
                transform: translateY(100%);
            }
        `;
        document.head.appendChild(style);
        
        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressText);
        document.body.appendChild(progressBarContainer);
        
        // 存储进度条引用以便后续操作
        this.progressBar = progressBar;
        this.progressText = progressText;
        this.progressBarContainer = progressBarContainer;
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
        if (this.progressBarContainer) {
            if (args.show) {
                this.progressBarContainer.classList.remove('hidden');
            } else {
                this.progressBarContainer.classList.add('hidden');
            }
            return args.show;
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

    async ShowAchievement(args){
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
        this.ShowCustomAchievement(title, content, autoCloseTimeMilliseconds, imageUrl);
        
        return true;
    }
    
    ShowCustomAchievement(title, content, autoCloseTime = 5000, image = '') {
        // 检查CSS动画样式是否已存在，避免重复添加
        if (!document.getElementById('achievement-animations')) {
            const style = document.createElement('style');
            style.id = 'achievement-animations';
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
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'custom-achievement';
        achievementDiv.style.cssText = `
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
            achievementDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (achievementDiv.parentNode) {
                    achievementDiv.parentNode.removeChild(achievementDiv);
                }
            }, 300);
        };
        
        // 组装通知
        if (imageDiv) {
            achievementDiv.appendChild(imageDiv);
        }
        achievementDiv.appendChild(contentContainer);
        contentContainer.appendChild(titleDiv);
        contentContainer.appendChild(contentDiv);
        contentContainer.appendChild(closeButton);
        
        // 添加到页面
        document.body.appendChild(achievementDiv);
        
        // 点击通知聚焦窗口
        achievementDiv.onclick = function(e) {
            if (e.target !== closeButton) {
                window.focus();
            }
        };
        
        // 自动关闭通知（使用传入的时间参数）
        setTimeout(() => {
            if (achievementDiv.parentNode) {
                achievementDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (achievementDiv.parentNode) {
                        achievementDiv.parentNode.removeChild(achievementDiv);
                    }
                }, 300);
            }
        }, autoCloseTime);
    }
    SetAchievementColor(args){
        const color = args.color || '#667eea';
        this.achievementColor = color;
        
        // 移除现有的成就颜色样式（如果存在）
        const existingStyle = document.getElementById('achievement-color-style');
        if (existingStyle) {
            document.head.removeChild(existingStyle);
        }
        
        // 创建新的成就颜色样式 
        const style = document.createElement('style');
        style.id = 'achievement-color-style';
        style.textContent = `
            .custom-achievement {
                background: linear-gradient(135deg, ${color} 0%, ${color} 100%) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 颜色选择器方法 - 提供可视化颜色选择
    ShowAchievementColorPicker(args){
        const title = args.title || '选择成就颜色';
        const currentColor = this.achievementColor || '#667eea';
        
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
                this.SetAchievementColor({ color: selectedColor });
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
        return this.ShowAchievementColorPicker(args);
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
                background: linear-gradient(90deg, ${color}, ${this._getDarkerColor(color, 20)}) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 颜色处理辅助函数
    _getDarkerColor(color, percent) {
        // 将十六进制颜色转换为RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 计算更深的颜色
        const darken = (value) => Math.max(0, Math.floor(value * (100 - percent) / 100));
        
        const darkerR = darken(r);
        const darkerG = darken(g);
        const darkerB = darken(b);
        
        // 转换回十六进制
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
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
    showFilePicker(fileType = 'text') {        
        // 根据文件类型设置accept属性
        let accept = '*'; // 默认允许所有文件
        
        if (fileType === 'text') {
            accept = '.txt,.md,.html,.css,.js,.json,.csv';
        } else if (fileType === 'image') {
            accept = 'image/*';
        } else if (fileType === 'json') {
            accept = '.json';
        }
        
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.style.display = 'none';
            
            input.addEventListener('change', () => {
                if (input.files && input.files[0]) {
                    // 保存选择的文件到全局引用
                    this.selectedFile = input.files[0];
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

    // 时间戳转换
    TimeStampToFormat(args){
        const timeStamp = args.TimeStamp || '0';
        const format = args.Format || 'yyyy-MM-dd HH:mm:ss';
        
        if (!timeStamp || timeStamp.trim() === '') return '';
        
        // 将时间戳转换为数字
        let timestampNum = parseInt(timeStamp);
        
        // 判断时间戳单位：如果时间戳小于10000000000，则认为是秒为单位，需要转换为毫秒
        if (timestampNum < 10000000000) {
            timestampNum *= 1000;
        }
        
        const date = new Date(timestampNum);
        
        if (isNaN(date.getTime())) {
            console.warn('无效的时间戳:', timeStamp);
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        
        // 使用更安全的替换方法，避免重复替换
        let result = format;
        result = result.replace(/yyyy/g, year);
        result = result.replace(/MM/g, month);
        result = result.replace(/dd/g, day);
        result = result.replace(/HH/g, hour);
        result = result.replace(/mm/g, minute);
        result = result.replace(/ss/g, second);
        
        return result;
    }

    // 时间单位转换
    TimeUnitConversion(args){
        const number = parseFloat(args.number) || 0;
        const unit1 = args.unit1 || 'seconds';
        const unit2 = args.unit2 || 'minutes';
        
        if (unit1 === unit2) return number;
        
        // 定义单位转换系数（基于秒）
        const unitFactors = {
            'timestamp': 1,        // 时间戳（秒）
            'milliseconds': 0.001, // 毫秒
            'seconds': 1,          // 秒
            'minutes': 60,         // 分
            'hours': 3600,         // 时
            'days': 86400,         // 天
            'weeks': 604800,       // 周
            'months': 2592000,     // 月（30天）
            'quarters': 7776000,   // 季（90天）
            'years': 31536000,     // 年（365天）
            'decades': 315360000,  // 年代（10年）
            'century': 3153600000, // 世纪（100年）
            'millenia': 31536000000, // 千年（1000年）
        };
        
        // 检查单位是否有效
        if (!unitFactors[unit1] || !unitFactors[unit2]) {
            console.warn('无效的时间单位:', unit1, '或', unit2);
            return 0;
        }
        
        // 转换为秒
        const seconds = number * unitFactors[unit1];
        
        // 转换为目标单位
        return seconds / unitFactors[unit2];
    }

    // 弹窗选择对话框字体颜色
    async ShowDialogFontColorPicker(){
        // 创建颜色选择器
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = '#000000';
        
        // 创建弹窗容器
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #00BFFF;
            border-radius: 10px;
            padding: 20px;
            z-index: 10001;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            text-align: center;
        `;
        
        // 标题
        const title = document.createElement('div');
        title.textContent = '选择对话框字体颜色';
        title.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #00BFFF;
        `;
        
        // 颜色预览
        const preview = document.createElement('div');
        preview.style.cssText = `
            width: 100px;
            height: 50px;
            margin: 10px auto;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: ${colorInput.value};
        `;
        
        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 15px;
            display: flex;
            gap: 10px;
            justify-content: center;
        `;
        
        // 确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '确认';
        confirmButton.style.cssText = `
            background: #00BFFF;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        // 取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
            background: #ccc;
            color: black;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        // 组装弹窗
        popup.appendChild(title);
        popup.appendChild(colorInput);
        popup.appendChild(preview);
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        popup.appendChild(buttonContainer);
        
        // 添加到页面
        document.body.appendChild(popup);
        
        // 颜色变化时更新预览
        colorInput.addEventListener('input', () => {
            preview.style.backgroundColor = colorInput.value;
        });
        
        // 返回Promise处理用户选择
        return new Promise((resolve) => {
            // 确认按钮点击
            confirmButton.onclick = () => {
                document.body.removeChild(popup);
                resolve(colorInput.value);
            };
            
            // 取消按钮点击
            cancelButton.onclick = () => {
                document.body.removeChild(popup);
                resolve(null);
            };
            
            // 点击外部关闭
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    document.body.removeChild(popup);
                    resolve(null);
                }
            });
            
            // ESC键关闭
            const handleKeyPress = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(popup);
                    document.removeEventListener('keydown', handleKeyPress);
                    resolve(null);
                }
            };
            document.addEventListener('keydown', handleKeyPress);
        });
    }

    // 设置对话框字体颜色
    SetDialogFontColor(args){
        const color = args.color || '#000000';
        
        // 验证颜色格式
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(color)) {
            console.warn('无效的颜色格式:', color);
            return;
        }
        
        // 存储颜色设置到localStorage，供ShowDialog函数使用
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dialogFontColor', color);
        }
        
        console.log('对话框字体颜色已设置为:', color);
    }

    ShowDialog(args){
        const showMode = args.showMode || 'typewriter';
        const fontPosition = args.fontPosition || 'left';
        const textEffect = args.textEffect || 'normal';
        const title = args.title || 'LittleTechnology';
        const content = args.content || '消息';
        
        // 获取用户设置的字体颜色（从localStorage）
        let fontColor = '#000000'; // 默认黑色
        if (typeof localStorage !== 'undefined') {
            const savedColor = localStorage.getItem('dialogFontColor');
            if (savedColor) {
                fontColor = savedColor;
            }
        }
        
        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: ${args.position === 'middle' ? '50%' : '80%'};
            left: 50%;
            transform: translate(-50%, -${args.position === 'middle' ? '50%' : '50%'});
            background: white;
            border: 2px solid #00BFFF;
            border-radius: 10px;
            padding: 30px;
            min-width: 1000px;
            max-width: 1200px;
            min-height: 125px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            cursor: pointer;
        `;
        
        // 标题栏
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: ${fontColor};
            text-align: ${fontPosition};
        `;
        titleBar.textContent = title;
        
        // 内容区域
        const contentArea = document.createElement('div');
        // 根据文字大小设置字体大小
        const sizeMap = {
            'tiny': '12px',
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'huge': '24px'
        };
        contentArea.style.cssText = `
            font-size: ${sizeMap[this.dialogTextSize] || '16px'};
            line-height: 1.5;
            text-align: ${fontPosition};
            min-height: 50px;
            color: ${fontColor};
        `;
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 12px;
        `;
        closeButton.textContent = '×';
        closeButton.onclick = () => {
            // 清理文字效果
            if (contentArea._shakeTimer) {
                clearInterval(contentArea._shakeTimer);
                contentArea._shakeTimer = null;
            }
            if (contentArea._cleanupShake) {
                contentArea._cleanupShake();
                contentArea._cleanupShake = null;
            }
            document.body.removeChild(dialog);
            this.dialogTextVisible = false;
        };
        
        // 组装对话框
        dialog.appendChild(closeButton);
        dialog.appendChild(titleBar);
        dialog.appendChild(contentArea);
        
        // 添加到页面
        document.body.appendChild(dialog);
        
        // 更新对话框显示状态
        this.dialogTextVisible = true;
        
        // 根据显示模式处理内容显示
        if (showMode === 'typewriter') {
            // 逐字显示效果
            contentArea.textContent = ''; // 清空内容
            let index = 0;
            let typewriter = null;
            let isAnimating = true;
            
            // 逐字显示函数
            const startTypewriter = () => {
                typewriter = setInterval(() => {
                    if (index < content.length && isAnimating) {
                        contentArea.textContent += content[index];
                        index++;
                        // 滚动到最新内容
                        contentArea.scrollTop = contentArea.scrollHeight;
                    } else {
                        clearInterval(typewriter);
                        isAnimating = false;
                        // 动画完成后移除点击跳过监听器
                        dialog.removeEventListener('click', skipAnimation);
                    }
                }, 50);
            };
            
            // 开始逐字显示
            startTypewriter();
            
            // 点击跳过动画功能
            const skipAnimation = (e) => {
                // 防止事件冒泡到外部点击关闭
                e.stopPropagation();
                if (isAnimating) {
                    clearInterval(typewriter);
                    contentArea.textContent = content; // 立即显示全部内容
                    contentArea.scrollTop = contentArea.scrollHeight;
                    isAnimating = false;
                    // 跳过动画后移除点击跳过监听器
                    dialog.removeEventListener('click', skipAnimation);
                }
            };
            
            // 为对话框添加点击跳过功能
            dialog.addEventListener('click', skipAnimation);
            
        } else if (showMode === 'fade') {
            // 渐变显示效果
            contentArea.textContent = content;
            contentArea.style.opacity = '0';
            contentArea.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                contentArea.style.opacity = '1';
            }, 100);
        } else {
            // 直接显示（默认）
            contentArea.textContent = content;
        }
        
        // 应用文字效果
        this.applyTextEffect(contentArea, textEffect, content);
        
        // 点击对话框外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                // 清理文字效果
                if (contentArea._shakeTimer) {
                    clearInterval(contentArea._shakeTimer);
                    contentArea._shakeTimer = null;
                }
                if (contentArea._cleanupShake) {
                    contentArea._cleanupShake();
                    contentArea._cleanupShake = null;
                }
                document.body.removeChild(dialog);
                this.dialogTextVisible = false;
            }
        });
        
        // 添加ESC键关闭功能
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                // 清理文字效果
                if (contentArea._shakeTimer) {
                    clearInterval(contentArea._shakeTimer);
                    contentArea._shakeTimer = null;
                }
                if (contentArea._cleanupShake) {
                    contentArea._cleanupShake();
                    contentArea._cleanupShake = null;
                }
                document.body.removeChild(dialog);
                this.dialogTextVisible = false;
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }
    
    // 应用文字效果
    applyTextEffect(element, effectType, originalContent) {
        // 清除之前的效果
        element.innerHTML = originalContent;
        element.style.animation = 'none';
        element.style.filter = 'none';
        
        // 清除颤抖效果的定时器
        if (element._shakeTimer) {
            clearInterval(element._shakeTimer);
            element._shakeTimer = null;
        }
        
        // 调用颤抖效果的清理函数（如果有）
        if (element._cleanupShake) {
            element._cleanupShake();
            element._cleanupShake = null;
        }
        
        // 随机文字效果的辅助函数
        const getRandomEffect = () => {
            const effects = ['normal', 'shake', 'color', 'gibberish'];
            return effects[Math.floor(Math.random() * effects.length)];
        };
        
        // 如果是随机效果，先随机选择一个效果类型
        const actualEffect = effectType === 'random' ? getRandomEffect() : effectType;
        
        switch (actualEffect) {
            case 'shake':
                // 颤抖效果（上下左右随机）
                // 清除之前的动画效果
                element.style.animation = 'none';
                element.style.position = 'relative';
                element.style.left = '0';
                element.style.top = '0';
                
                // 保存原始位置
                const originalPosition = {
                    left: element.style.left,
                    top: element.style.top,
                    position: element.style.position
                };
                
                // 清除之前的定时器（如果有）
                if (element._shakeTimer) {
                    clearInterval(element._shakeTimer);
                }
                
                // 创建随机颤抖效果
                element._shakeTimer = setInterval(() => {
                    const randomX = Math.floor(Math.random() * 10) - 5; // -5到4的随机值
                    const randomY = Math.floor(Math.random() * 10) - 5; // -5到4的随机值
                    element.style.left = randomX + 'px';
                    element.style.top = randomY + 'px';
                }, 100);
                
                // 确保在效果切换或元素移除时清除定时器
                const cleanupShake = () => {
                    if (element._shakeTimer) {
                        clearInterval(element._shakeTimer);
                        element._shakeTimer = null;
                    }
                    // 恢复原始位置
                    element.style.position = originalPosition.position;
                    element.style.left = originalPosition.left;
                    element.style.top = originalPosition.top;
                };
                
                // 存储清理函数，以便在需要时调用
                element._cleanupShake = cleanupShake;
                break;
                
            case 'color':
                // 变色效果
                element.style.animation = 'colorChange 1s infinite';
                // 添加变色动画样式
                if (!document.getElementById('colorAnimation')) {
                    const style = document.createElement('style');
                    style.id = 'colorAnimation';
                    style.textContent = `
                        @keyframes colorChange {
                            0% { color: red; }
                            25% { color: blue; }
                            50% { color: green; }
                            75% { color: yellow; }
                            100% { color: red; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
                
            case 'gibberish':
                // 胡言乱语效果（随机替换字符）
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
                let gibberishText = '';
                
                for (let i = 0; i < originalContent.length; i++) {
                    // 保留空格和标点符号
                    if (originalContent[i].match(/[\s\p{P}]/u)) {
                        gibberishText += originalContent[i];
                    } else {
                        gibberishText += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                
                element.textContent = gibberishText;
                break;
                
            case 'normal':
            default:
                // 普通效果，不做任何处理
                break;
        }
    }
    
    // 侦测对话框文字是否显示中
    isDialogTextVisible() {
        return this.dialogTextVisible;
    }
    
    // 设置对话框文字大小
    SetDialogTextSize(args) {
        const size = args.textSize;
        if (['tiny', 'small', 'medium', 'large', 'huge'].includes(size)) {
            this.dialogTextSize = size;
        }
    }
    
    IfThenElse(args){
        const condition = args.condition;
        const trueValue = args.trueValue;
        const falseValue = args.falseValue;
        if(condition){
            return trueValue;
        }else{
            return falseValue;
        }
    }

    // 修复ReadFile方法，支持对象参数和直接参数两种调用方式
    ReadFile(args, format){
        // 处理不同的调用方式
        let filePath, targetFormat, forceNewFile = false;
        if (typeof args === 'object' && args !== null) {
            // 处理对象参数调用: ReadFile({ filePath: filePath, format: format, forceNewFile: forceNewFile })
            filePath = args.filePath;
            targetFormat = args.format || 'text';
            forceNewFile = args.forceNewFile || false;
        } else {
            // 处理直接参数调用: ReadFile(filePath, format)
            filePath = args;
            targetFormat = format || 'text';
        }
        
        // 根据格式调用相应的读取方法
        if(targetFormat === 'text'){
            return this.readTextFile(filePath, forceNewFile);
        }else if(targetFormat === 'json'){
            return this.readJsonFile(filePath, forceNewFile);
        }else if(targetFormat === 'url'){
            return this.readUrlFile(filePath, forceNewFile);
        }else if(targetFormat === 'base64'){
            return this.readBase64File(filePath, forceNewFile);
        }
        
        return '';
    }
    
    // 读取文本文件
    async readTextFile(filePath, forceNewFile = false) {
        try {
            // 如果filePath是文件对象，直接读取
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                return await this.fileToText(filePath);
            }
            
            // 如果没有强制要求新文件，并且有全局引用的文件，优先使用
            if (!forceNewFile && this.selectedFile instanceof File) {
                return await this.fileToText(this.selectedFile);
            }
            
            // 否则显示文件选择器
            const file = await this.showFilePicker('text');
            if (!file) {
                return '';
            }
            
            return await this.fileToText(file);
        } catch (error) {
            console.error('读取文本文件失败:', error);
            return '';
        }
    }
    
    // 读取JSON文件
    async readJsonFile(filePath, forceNewFile = false) {
        try {
            // 如果filePath是文件对象，直接读取
            let file;
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                file = filePath;
            } else if (!forceNewFile && this.selectedFile instanceof File) {
                // 如果没有强制要求新文件，并且有全局引用的文件，优先使用
                file = this.selectedFile;
            } else {
                // 否则显示文件选择器
                file = await this.showFilePicker('json');
                if (!file) {
                    return null;
                }
            }
            
            const text = await this.fileToText(file);
            return JSON.parse(text);
        } catch (error) {
            console.error('读取JSON文件失败:', error);
            return null;
        }
    }
    
    // 读取文件为URL对象
    async readUrlFile(filePath, forceNewFile = false) {
        try {
            // 如果filePath是文件对象，直接使用
            let file;
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                file = filePath;
            } else if (!forceNewFile && this.selectedFile instanceof File) {
                // 如果没有强制要求新文件，并且有全局引用的文件，优先使用
                file = this.selectedFile;
            } else {
                // 否则显示文件选择器
                file = await this.showFilePicker('text');
                if (!file) {
                    // 返回一个默认的空文件对象结构
                    return { size: 0, lastModified: 0, name: '', type: '' };
                }
            }
            
            return file;
        } catch (error) {
            console.error('读取文件为URL失败:', error);
            return { size: 0, lastModified: 0, name: '', type: '' };
        }
    }
    
    // 读取文件为Base64
    async readBase64File(filePath, forceNewFile = false) {
        try {
            // 如果filePath是文件对象，直接读取
            let file;
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                file = filePath;
            } else if (!forceNewFile && this.selectedFile instanceof File) {
                // 如果没有强制要求新文件，并且有全局引用的文件，优先使用
                file = this.selectedFile;
            } else {
                // 否则显示文件选择器
                file = await this.showFilePicker('text');
                if (!file) {
                    return '';
                }
            }
            
            return await this.fileToDataUrl(file);
        } catch (error) {
            console.error('读取文件为Base64失败:', error);
            return '';
        }
    }
    
    // 清除已选择的文件
    ClearSelectedFile() {
        try {
            this.selectedFile = null;
            return true;
        } catch (error) {
            console.error('清除已选文件失败:', error);
            return false;
        }
    }
    
    // 文件转文本方法
    fileToText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    ReadFileFormat(args){
        const filePath = args.filePath;
        const format2 = args.format2 || 'text';
        const forceNewFile = args.forceNewFile || false;
        return this.ReadFile({ filePath: filePath, format: format2, forceNewFile: forceNewFile });
    }

    // 获取已选择文件的名称
    GetFileName(args){
        try {
            // 优先使用全局引用的文件
            if (this.selectedFile instanceof File) {
                return this.selectedFile.name;
            }
            
            const filePath = args && args.filePath;
            // 检查filePath是否是文件对象
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                return filePath.name;
            }
            // 处理字符串路径或使用文件选择器
            const file = typeof filePath === 'string' && filePath ? { name: filePath.split('/').pop() } : null;
            return file && file.name ? file.name : '';
        } catch (error) {
            console.error('获取文件名失败:', error);
            return '';
        }
    }

    // 获取已选择文件的路径
    GetFilePath(args){
        try {
            // 优先使用全局引用的文件
            if (this.selectedFile instanceof File) {
                return ''; // 文件对象没有路径信息（浏览器安全限制）
            }
            
            const filePath = args && args.filePath;
            // 检查filePath是否是文件对象
            if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                return ''; // 文件对象没有路径信息（浏览器安全限制）
            }
            // 处理字符串路径
            if (typeof filePath === 'string') {
                return filePath.split('/').slice(0, -1).join('/');
            }
            return '';
        } catch (error) {
            console.error('获取文件路径失败:', error);
            return '';
        }
    }

    // 获取已选择文件的格式
    GetFileFormat(args){
        try {
            // 优先使用全局引用的文件
            if (this.selectedFile instanceof File) {
                const fileName = this.selectedFile.name;
                return fileName && fileName.includes('.') ? fileName.split('.').pop() : '';
            }
            
            const fileName = this.GetFileName(args);
            return fileName && fileName.includes('.') ? fileName.split('.').pop() : '';
        } catch (error) {
            console.error('获取文件格式失败:', error);
            return '';
        }
    }

    // 获取已选择文件的大小
    async GetFileSize(args){
        const unit3 = args && args.unit3 || 'byte';
        
        try {
            // 优先使用全局引用的文件
            let file;
            if (this.selectedFile instanceof File) {
                file = this.selectedFile;
            } else {
                const filePath = args && args.filePath;
                // 检查filePath是否是文件对象
                if (filePath && typeof filePath === 'object' && filePath instanceof File) {
                    file = filePath;
                }
            }
            
            if (!file || !file.size) return 0;
            
            // 根据单位转换文件大小
            let size = file.size;
            switch(unit3) {
                case 'KB':
                    return (size / 1024).toFixed(2);
                case 'MB':
                    return (size / (1024 * 1024)).toFixed(2);
                case 'GB':
                    return (size / (1024 * 1024 * 1024)).toFixed(2);
                case 'TB':
                    return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2);
                case 'B':
                case 'byte':
                default:
                    return size;
            }
        } catch (error) {
            console.error('获取文件大小失败:', error);
            return 0;
        }
    }

    // 获取已选择文件的最后修改时间
    async GetLastModifiedTime(args){
        try {
            // 优先使用全局引用的文件
            if (this.selectedFile instanceof File) {
                // 格式化时间
                const date = new Date(this.selectedFile.lastModified);
                return date.toLocaleString();
            }
            
            // 兼容旧的调用方式
            const file = args ? await this.ReadFile(args, 'url') : null;
            if (file && file.lastModified) {
                const date = new Date(file.lastModified);
                return date.toLocaleString();
            }
            
            return '';
        } catch (error) {
            console.error('获取最后修改时间失败:', error);
            return '';
        }
    }

    // 检查是否有已选择的文件
    async IsFileSelected(args){
        try {
            // 优先检查全局引用的文件
            if (this.selectedFile instanceof File) {
                return this.selectedFile.size > 0;
            }
            
            // 兼容旧的调用方式
            const file = args ? await this.ReadFile(args, 'url') : null;
            return file && file.size > 0;
        } catch (error) {
            console.error('检查文件是否选择失败:', error);
            return false;
        }
    }

    // 文件写入方法
    async WriteFile(args){
        const content = args.content || '';
        const filePath = args.filePath || 'output.txt';
        
        try {
            // 创建Blob对象
            const blob = new Blob([content], {type: 'text/plain'});
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath;
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('写入文件失败:', error);
            return false;
        }
    }

    RandomBoolean(){
        return Math.random() >= 0.5;
    }

    GetBrowserName(){
        const userAgent = navigator.userAgent;
        
        // 检测浏览器类型
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            return 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            return 'Firefox';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            return 'Safari';
        } else if (userAgent.includes('Edg')) {
            return 'Edge';
        } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
            return 'Opera';
        } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
            return 'Internet Explorer';
        } else {
            return 'Unknown Browser';
        }
    }

    GetSystemName(){
        // `navigator.platform` 已弃用，改用 `navigator.userAgentData.platform` 替代，若不支持则回退到 `navigator.userAgent` 解析
        if (navigator.userAgentData && navigator.userAgentData.platform) {
            return navigator.userAgentData.platform;
        }
        // 回退方案
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Win')) {
            return 'Windows';
        } else if (userAgent.includes('Mac')) {
            return 'Macintosh';
        } else if (userAgent.includes('Linux')) {
            return 'Linux';
        } else if (userAgent.includes('Android')) {
            return 'Android';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
            return 'iOS';
        }
        return 'Unknown';
    }
    
    DoubleClick(){        
        // 检测是否发生双击事件
        const result = this.isDoubleClick;
        // 如果检测到双击，立即重置状态（确保每次双击只被检测一次）
        if (result) {
            this.isDoubleClick = false;
        }
        return result;
    }

    MouseWheel(args){
        const direction = args.direction;
        // 检测鼠标滚轮方向
        return this.wheelDirection === direction;
    }

    LMRClick(args){
        const button = args.button;
        // 检测鼠标按键状态
        return this.mouseButtons[button] || false;
    }
}
Scratch.extensions.register(new MoistsTechnology());

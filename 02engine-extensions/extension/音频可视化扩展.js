// Name: FFT音频可视化
// ID: AudioFFT
// Description: 音频FFT可视化+自定义音频效果+左右声道图形。与v1.1兼容
// By：YL_YOLO
// Version V2
class AudioFFTExtension {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.masterGain = null;
        this.audioBuffers = new Map(); // 存储音频数据
        this.audioSources = new Map(); // 存储正在播放的音频源和状态
        this.effectProcessors = new Map(); 
        this.urlCache = new Map(); // 添加URL缓存
        this.cacheExpiry = 5 * 60 * 1000; 
        
        // FFT配置
        this.fftConfig = {
            size: 2048,
            smoothing: 0.2,
            minDecibels: -85,
            maxDecibels: -10
        };
        
    this.currentPlayingAudioId = null; // 跟踪当前正在播放的音频ID
    
    // 可视化数据 - 添加原始声道数据存储
    this.visualizationData = {
        waveform: new Array(1024).fill(0),
        frequencies: new Array(1024).fill(0),
        bass: 0, mid: 0, treble: 0,
        volume: 0,
        // 声道数据（模拟或真实）
        leftChannel: new Array(2048).fill(0),
        rightChannel: new Array(2048).fill(0),
        channelLength: 2048,
        // 新增：原始音频数据缓存
        rawAudioData: null,
        currentAudioPosition: 0
    };
        this.lastUpdate = 0;
        this.updateInterval = 16;
        
        this.startUpdateLoop();
    }

    startUpdateLoop() {
        const update = () => {
            this.updateVisualizationData();
            requestAnimationFrame(update);
        };
        update();
    }

    getInfo() {
        return {
            id: 'AudioFFT',
            name: '音频FFT可视化',
color1: '#381873',
color2: '#3A50FF',
color3: '#FB03FF',
blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAAXFkAAFxZAStO/ZEAAAHUSURBVFiF7Zk9S8NAGMd/uXTQScgkOpQ2fgEtIriJgw34KdwdpHVwcC59W/wy4u4m1U8gDu4dpShtHMKlySUxTdpro/YHhXvJ5f73PHdPeK4GCdSshpvUp4PBsG/EtUcaly1MRRXqV1YtTEUKFasWkoYBxbOeZDDsG4W3oKhZDdexezh2jzEjxoyQdSBUlvXj3Su/LKnbXc4q7Uj7Sfk2Ml7WhSDSV9u+mJathlsCuH9tAmCyQbDu4RJz2LUQnFeWS+mDrrUJmkxUY0Qp/B5MtaBK2ooXPV67Bb8mH3j7OB9/z8VBVHcdDEwerPAzj+99AG6GXjhpWSty8f6TnlC0EIHSOot+FnK4eNYJVJe2rGZmcaDpkAT3ZlCUFJtFqLZTnPUwJFH4MPN/BeY5EHFot2BwL+YJ1nN9SZJw7B4twiLyWjSzwLjVZ5l8JZ+6ltXk5VBP3rVQFz/XxvAW35c3Ls5lwWDCk4SaNGUls0CZuS2LmQSO3c/pAGH6aWce1DQ2DQFgbZbDL6l2cKodwMt3z/fucgv6cXIlL65X276Wut2dCiwyAuBo5xLH7iGEtyoM4f0AY0lJO4BhmFS2TkPzFt6C69uteVnfsM7L77lEVynK3xDfbMCXalU9iTQAAAAASUVORK5CYII=',
            docsURI: 'https://b23.tv/5P2xenX',
            blocks: [
                {
                    opcode: 'addAudio',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '添加音频 [ID] 数据 [DATA_URL]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        DATA_URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'DataURL' }
                    }
                },
            {
                opcode: 'getDataURLFromURL',
                blockType: Scratch.BlockType.REPORTER,
                text: '获取网络URL [URL] 转换为DataURL音乐数据',
                arguments: {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'https://example.com/audio.mp3'
                    }
                }
            },
            {
                opcode: 'removeAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '删除音频 [ID] 数据',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                }
            },
                {
                    opcode: 'playAudio',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '播放音频 [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'playAudioFrom',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '播放音频 [ID] 从 [START]秒 开始',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        START: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                    }
                },
                {
                    opcode: 'stopAudio',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '停止音频 [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'pauseAudio',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '暂停音频 [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
            {
                opcode: 'stopAllAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '停止所有音频'
            },
            {
                opcode: 'removeAllAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '删除所有音频数据'
            },
                {
                    opcode: 'setVolume',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 音量 [VOLUME]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        VOLUME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 }
                    }
                },
                {
                    opcode: 'setPlaybackRate',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 速度 [RATE]%',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        RATE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
                    }
                },
                {
                    opcode: 'getCurrentTime',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '音频 [ID] 当前时间',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'getAudioDuration',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '音频 [ID] 总时长',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'getPlaybackProgress',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '音频 [ID] 播放进度%',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'isPlayingAudio',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '音频 [ID] 正在播放？',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'isPausedAudio',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '音频 [ID] 已暂停？',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'getPlayingList',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取所有播放中的音频ID'
                },
                // 波形数据相关积木
                {
                    opcode: 'getWaveformValue',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取波形位于轨道 [INDEX]的大小',
                    arguments: {
                        INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                    }
                },
                {
                    opcode: 'getFrequencyValue',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取FFT位于轨道 [INDEX]的大小',
                    arguments: {
                        INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                    }
                },
{
    opcode: 'getLeftChannel',
    blockType: Scratch.BlockType.REPORTER,
    text: '左声道 [INDEX]',
    arguments: {
        INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
    }
},
{
    opcode: 'getRightChannel', 
    blockType: Scratch.BlockType.REPORTER,
    text: '右声道 [INDEX]',
    arguments: {
        INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
    }
},
// 在getInfo()的blocks数组中添加：
{
    opcode: 'getChannelStats',
    blockType: Scratch.BlockType.REPORTER,
    text: '声道统计数据'
},
                {
                    opcode: 'getBassLevel',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '低音强度'
                },
                {
                    opcode: 'getMidLevel',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '中音强度'
                },
                {
                    opcode: 'getTrebleLevel',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '高音强度'
                },
                {
                    opcode: 'getVolumeLevel',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '总体音量'
                },
                {
                    opcode: 'getDataLength',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '数据长度'
                },
                {
                    opcode: 'setFFTSensitivity',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置FFT灵敏度 大小 [SIZE] 平滑度 [SMOOTHING]%',
                    arguments: {
                        SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2048 },
                        SMOOTHING: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
                    }
                },
                {
                    opcode: 'getFFTConfig',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '当前FFT配置'
                },
                // 音效相关积木
                {
                    opcode: 'setReverb',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 混响 强度 [LEVEL]% 时长 [TIME]秒',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        LEVEL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
                        TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
                    }
                },
                {
                    opcode: 'setDelay',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 延迟 反馈 [FEEDBACK]% 时间 [TIME]秒',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        FEEDBACK: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 },
                        TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 }
                    }
                },
                {
                    opcode: 'setDistortion',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 失真 强度 [AMOUNT]%',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        AMOUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                    }
                },
                {
                    opcode: 'setFilter',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 滤波器 类型 [TYPE] 频率 [FREQ]Hz',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        TYPE: { 
                            type: Scratch.ArgumentType.STRING,
                            menu: 'filterType'
                        },
                        FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1000 }
                    }
                },
                {
                    opcode: 'setCompressor',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置音频 [ID] 压缩器 阈值 [THRESHOLD]dB 比率 [RATIO]:1',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                        THRESHOLD: { type: Scratch.ArgumentType.NUMBER, defaultValue: -20 },
                        RATIO: { type: Scratch.ArgumentType.NUMBER, defaultValue: 4 }
                    }
                },
            {
                opcode: 'setTremolo',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 颤音 速度 [SPEED]Hz 深度 [DEPTH]%',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
                    DEPTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                }
            },
            {
                opcode: 'setChorus',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 合唱 速度 [SPEED]Hz 深度 [DEPTH]% 延迟 [DELAY]秒',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                    DEPTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
                    DELAY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.02 }
                }
            },
            {
                opcode: 'setPhaser',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 相位 速度 [SPEED]Hz 深度 [DEPTH]% 反馈 [FEEDBACK]%',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
                    DEPTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
                    FEEDBACK: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
                }
            },
            {
                opcode: 'setEQ',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 均衡器 低频 [LOW]dB 中频 [MID]dB 高频 [HIGH]dB',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    LOW: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                    MID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                    HIGH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                }
            },
            {
                opcode: 'setBitCrusher',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 位压缩 位数 [BITS] 频率 [FREQ]Hz',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    BITS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 8 },
                    FREQ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1000 }
                }
            },
            {
                opcode: 'setPanner',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 声像 位置 [PAN]%',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    PAN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                }
            },
            {
                opcode: 'setFlanger',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音频 [ID] 镶边 速度 [SPEED]Hz 深度 [DEPTH] 延迟 [DELAY]ms 反馈 [FEEDBACK]%',
                arguments: {
                    ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' },
                    SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.3 },
                    DEPTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.002 },
                    DELAY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                    FEEDBACK: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                }
            },
                {
                    opcode: 'clearEffects',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '清除音频 [ID] 所有音效',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'getActiveEffects',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '音频 [ID] 当前音效',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'music' }
                    }
                },
                {
                    opcode: 'showAudioInfo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '显示音频信息面板'
                }
            ],
            menus: {
                filterType: {
                    items: ['低通', '高通', '带通', '陷波']
                }
            }
        };
    }

async getDataURLFromURL(args) {
    try {
        const url = Scratch.Cast.toString(args.URL);
        
        if (!url || !url.startsWith('http')) {
            return '错误：请输入有效的HTTP URL';
        }
        
        // 检查缓存
        const cached = this.urlCache.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.dataUrl;
        }
        
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            return `错误：HTTP ${response.status}`;
        }
        
        const blob = await response.blob();
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                // 存入缓存
                this.urlCache.set(url, {
                    dataUrl: dataUrl,
                    timestamp: Date.now()
                });
                resolve(dataUrl);
            };
            reader.onerror = () => {
                resolve('错误：读取数据失败');
            };
            reader.readAsDataURL(blob);
        });
        
    } catch (error) {
        console.error('获取DataURL失败:', error);
        return `错误：${error.message}`;
    }
}
stopAllAudio() {
    for (const audioId of this.audioSources.keys()) {
        this._stopAudioSource(audioId);
    }
}
removeAllAudio() {
    // 停止所有正在播放的音频
    this.stopAllAudio();
    
    // 清除所有音频缓冲区
    this.audioBuffers.clear();
    
    // 清除所有音效处理器
    this.effectProcessors.clear();
}
removeAudio(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    
    // 停止该音频的播放
    this._stopAudioSource(audioId);
    
    // 删除音频缓冲区
    this.audioBuffers.delete(audioId);
    
    // 删除音效处理器
    this.effectProcessors.delete(audioId);
}
    // 初始化音频上下文和FFT分析器
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.masterGain = this.audioContext.createGain();
            
            this.analyser.fftSize = this.fftConfig.size;
            this.analyser.smoothingTimeConstant = this.fftConfig.smoothing;
            this.analyser.minDecibels = this.fftConfig.minDecibels;
            this.analyser.maxDecibels = this.fftConfig.maxDecibels;
            
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
        return this.audioContext;
    }

    // 音效处理器创建方法（从第一个扩展复制）
    createReverb(level, time) {
        const convolver = this.audioContext.createConvolver();
        const rate = this.audioContext.sampleRate;
        const length = rate * time;
        const impulse = this.audioContext.createBuffer(2, length, rate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2) * (level / 100);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }

    createDelay(feedback, time) {
        const delay = this.audioContext.createDelay();
        const feedbackNode = this.audioContext.createGain();
        
        delay.delayTime.value = time;
        feedbackNode.gain.value = feedback / 100;
        
        delay.connect(feedbackNode);
        feedbackNode.connect(delay);
        
        return { delay, feedbackNode };
    }

    createDistortion(amount) {
        const distortion = this.audioContext.createWaveShaper();
        const curve = new Float32Array(65536);
        const k = amount / 50;
        
        for (let i = 0; i < 65536; i++) {
            const x = (i - 32768) / 32768;
            curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
        }
        
        distortion.curve = curve;
        return distortion;
    }

    createFilter(type, frequency) {
        const filter = this.audioContext.createBiquadFilter();
        filter.frequency.value = frequency;
        
        switch (type) {
            case '低通': filter.type = 'lowpass'; break;
            case '高通': filter.type = 'highpass'; break;
            case '带通': filter.type = 'bandpass'; break;
            case '陷波': filter.type = 'notch'; break;
        }
        
        return filter;
    }

    createCompressor(threshold, ratio) {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = threshold;
        compressor.ratio.value = ratio;
        compressor.knee.value = 30;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        return compressor;
    }

    // 应用音效到音频源
    applyEffects(audioId, effects) {
        const audioState = this.audioSources.get(audioId);
        if (!audioState || !audioState.source) return;
        
        // 断开现有连接
        audioState.source.disconnect();
        
        // 重新连接音效链
        let lastNode = audioState.source;
        
        for (const effect of effects) {
            lastNode.connect(effect.input || effect);
            lastNode = effect.output || effect;
        }
        
        // 连接到主增益
        lastNode.connect(this.masterGain);
    }

    // 添加音频
    async addAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const dataUrl = Scratch.Cast.toString(args.DATA_URL);
        
        if (!dataUrl || !dataUrl.startsWith('data:audio/')) {
            return;
        }
        
        this.initAudioContext();
        
        try {
            const response = await fetch(dataUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.audioBuffers.set(audioId, audioBuffer);
            
        } catch (error) {
            console.error('音频加载失败:', error);
        }
    }

    // 播放音频 - 支持从指定时间开始
    playAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        this.playAudioFromTime(audioId, 0);
    }

    playAudioFrom(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const startTime = Scratch.Cast.toNumber(args.START);
        this.playAudioFromTime(audioId, startTime);
    }

    playAudioFromTime(audioId, startTime) {
        //this.clearEffects(audiold)
        const audioBuffer = this.audioBuffers.get(audioId);
        if (!audioBuffer) return;
        
        const context = this.initAudioContext();
        
        // 🔥 关键修复：彻底停止之前的播放
        this._stopAudioSource(audioId);
        
        // 创建新的音频源
        const source = context.createBufferSource();
        const gainNode = context.createGain();
        
        source.buffer = audioBuffer;
        gainNode.gain.value = 1;
        
        // 应用音效
        if (this.effectProcessors.has(audioId)) {
            const effects = this.effectProcessors.get(audioId);
            let lastNode = source;
            
            for (const effect of effects) {
                lastNode.connect(effect.input || effect);
                lastNode = effect.output || effect;
            }
            lastNode.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        gainNode.connect(this.masterGain);
        
        const adjustedStartTime = Math.max(0, startTime);
        
        // 开始播放
        source.start(0, adjustedStartTime % audioBuffer.duration);
        
        // 🔥 关键修复：统一状态管理
        const audioState = {
            source: source,
            gainNode: gainNode,
            startTime: context.currentTime - adjustedStartTime,
            isPlaying: true,
            isPaused: false,
            volume: 1,
            playbackRate: 1
        };
        
        this.audioSources.set(audioId, audioState);
        this.currentPlayingAudioId = audioId;
        
        // 播放结束时的处理
        source.onended = () => {
            const currentState = this.audioSources.get(audioId);
            if (currentState && currentState.source === source) {
                this.audioSources.delete(audioId);
            }
        };
    }

    // 内部方法：停止音频源
    _stopAudioSource(audioId) {
        const audioState = this.audioSources.get(audioId);
        if (audioState && audioState.source) {
            try {
                audioState.source.stop();
                audioState.source.disconnect();
                if (audioState.gainNode) {
                    audioState.gainNode.disconnect();
                }
            } catch (e) {
                // 忽略已经停止的源
            }
        }
        this.audioSources.delete(audioId);
    }

    // 停止音频
    stopAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        this._stopAudioSource(audioId);
    }

    // 暂停音频
    pauseAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const audioState = this.audioSources.get(audioId);
        const audioBuffer = this.audioBuffers.get(audioId);
        
        if (audioState && audioState.isPlaying && !audioState.isPaused && audioBuffer) {
            const currentTime = this.getCurrentTime({ ID: audioId });
            this._stopAudioSource(audioId);
            
            // 保存状态以便恢复
            this.audioSources.set(audioId, {
                source: null,
                gainNode: null,
                startTime: 0,
                isPlaying: false,
                isPaused: true,
                pausedTime: currentTime,
                volume: audioState.volume,
                playbackRate: audioState.playbackRate
            });
        }
    }

    // 获取当前时间 - 彻底修复时间计算
    getCurrentTime(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const audioState = this.audioSources.get(audioId);
        const audioBuffer = this.audioBuffers.get(audioId);
        
        if (!audioState || !audioBuffer) {
            return 0;
        }
        
        if (audioState.isPaused) {
            return audioState.pausedTime || 0;
        }
        
        if (audioState.isPlaying) {
            const currentTime = this.audioContext.currentTime - audioState.startTime;
            return Math.min(currentTime, audioBuffer.duration);
        }
        
        return 0;
    }

    // 获取音频总时长
    getAudioDuration(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const audioBuffer = this.audioBuffers.get(audioId);
        return audioBuffer ? audioBuffer.duration : 0;
    }

    // 获取播放进度百分比
    getPlaybackProgress(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const currentTime = this.getCurrentTime({ ID: audioId });
        const duration = this.getAudioDuration({ ID: audioId });
        
        if (duration > 0) {
            return (currentTime / duration) * 100;
        }
        return 0;
    }

    // 检查是否正在播放
    isPlayingAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const audioState = this.audioSources.get(audioId);
        return !!(audioState && audioState.isPlaying && !audioState.isPaused);
    }

    // 检查是否已暂停
    isPausedAudio(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const audioState = this.audioSources.get(audioId);
        return !!(audioState && audioState.isPaused);
    }

    // 设置音量
    setVolume(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const volume = Math.max(0, Math.min(1, Scratch.Cast.toNumber(args.VOLUME) / 100));
        
        const audioState = this.audioSources.get(audioId);
        if (audioState) {
            audioState.volume = volume;
            if (audioState.gainNode) {
                audioState.gainNode.gain.value = volume;
            }
        }
    }

    // 设置播放速度
    setPlaybackRate(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const rate = Math.max(0.1, Math.min(4, Scratch.Cast.toNumber(args.RATE) / 100));
        
        const audioState = this.audioSources.get(audioId);
        if (audioState) {
            audioState.playbackRate = rate;
            if (audioState.source) {
                audioState.source.playbackRate.value = rate;
            }
        }
    }

// 波形数据相关方法
updateVisualizationData() {
    if (!this.analyser) return;
    
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = currentTime;
    
    // 更新波形数据
    const waveformData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(waveformData);
    
    for (let i = 0; i < Math.min(1024, waveformData.length); i++) {
        this.visualizationData.waveform[i] = (waveformData[i] - 128) / 128;
    }
    
    // 更新频率数据
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);
    
    for (let i = 0; i < Math.min(1024, frequencyData.length); i++) {
        this.visualizationData.frequencies[i] = frequencyData[i] / 255;
    }
    
    // 计算频段强度
    const bassRange = Math.floor(frequencyData.length * 0.02);
    const midRange = Math.floor(frequencyData.length * 0.1);
    const trebleRange = Math.floor(frequencyData.length * 0.3);
    
    this.visualizationData.bass = this.calculateAverage(frequencyData, 0, bassRange);
    this.visualizationData.mid = this.calculateAverage(frequencyData, bassRange, midRange);
    this.visualizationData.treble = this.calculateAverage(frequencyData, midRange, trebleRange);
    this.visualizationData.volume = this.calculateAverage(frequencyData, 0, frequencyData.length);
    this.updateChannelDataFromCurrentAudio();
}

// 从当前播放的音频获取声道数据
// 从所有播放的音频获取声道数据并混合
updateChannelDataFromCurrentAudio() {
    // 清空声道数据
    for (let i = 0; i < 2048; i++) {
        this.visualizationData.leftChannel[i] = 0;
        this.visualizationData.rightChannel[i] = 0;
    }
    
    let hasPlayingAudio = false;
    let playingCount = 0;
    
    // 遍历所有音频源
    for (const [audioId, audioState] of this.audioSources) {
        if (!audioState || !audioState.isPlaying || audioState.isPaused) {
            continue;
        }
        
        const audioBuffer = this.audioBuffers.get(audioId);
        if (!audioBuffer) {
            continue;
        }
        
        hasPlayingAudio = true;
        playingCount++;
        
        // 获取当前播放位置
        const currentTime = this.getCurrentTime({ ID: audioId });
        const sampleRate = audioBuffer.sampleRate;
        const startSample = Math.floor(currentTime * sampleRate);
        
        // 获取声道数据
        const leftData = audioBuffer.getChannelData(0);
        const rightData = audioBuffer.numberOfChannels > 1 ? 
                         audioBuffer.getChannelData(1) : leftData;
        
        // 填充2048个轨道的声道数据并混合
        const dataLength = Math.min(2048, audioBuffer.length - startSample);
        
        for (let i = 0; i < dataLength; i++) {
            // 混合左声道数据（直接叠加）
            this.visualizationData.leftChannel[i] += leftData[startSample + i];
            
            // 混合右声道数据
            this.visualizationData.rightChannel[i] += rightData[startSample + i];
        }
    }
    
    // 如果没有音频在播放，使用模拟数据
    if (!hasPlayingAudio) {
        this.generateSimulatedChannelData();
    } else {
        // 检查并记录数据范围
        let maxLeft = 0;
        let maxRight = 0;
        for (let i = 0; i < 2048; i++) {
            maxLeft = Math.max(maxLeft, Math.abs(this.visualizationData.leftChannel[i]));
            maxRight = Math.max(maxRight, Math.abs(this.visualizationData.rightChannel[i]));
        }
        
        console.log(`声道数据范围: 左声道最大绝对值=${maxLeft}, 右声道最大绝对值=${maxRight}`);
        
        // 如果有多个音频，需要归一化防止削波
        if (playingCount > 1 && maxLeft > 0.1) {
            console.log(`检测到${playingCount}个音频同时播放，应用归一化`);
            const normalizationFactor = 1.0 / playingCount;
            for (let i = 0; i < 2048; i++) {
                this.visualizationData.leftChannel[i] *= normalizationFactor;
                this.visualizationData.rightChannel[i] *= normalizationFactor;
            }
        }
        
        // 更新原始数据引用
        this.visualizationData.rawAudioData = {
            left: this.visualizationData.leftChannel,
            right: this.visualizationData.rightChannel,
            position: 0,
            sampleRate: 44100,
            isMixed: playingCount > 1,
            playingCount: playingCount
        };
        this.visualizationData.currentAudioPosition = 0;
    }
}

generateSimulatedChannelData() {
    const time = Date.now() / 1000;
    
    for (let i = 0; i < 2048; i++) {
        const t = i / 2048 * 2 * Math.PI;
        
        // 左声道：使用多个正弦波组合
        this.visualizationData.leftChannel[i] = 
            0.5 * Math.sin(t * 2 + time) * this.visualizationData.volume +
            0.3 * Math.sin(t * 5 + time * 2) * this.visualizationData.mid +
            0.2 * Math.sin(t * 10 + time * 3) * this.visualizationData.treble;
        
        // 右声道：类似的模式但稍有不同，创造立体声效果
        this.visualizationData.rightChannel[i] = 
            0.5 * Math.cos(t * 2 + time + 0.5) * this.visualizationData.volume +
            0.3 * Math.cos(t * 5 + time * 2 + 0.3) * this.visualizationData.mid +
            0.2 * Math.cos(t * 10 + time * 3 + 0.7) * this.visualizationData.treble;
    }
    
    // 更新原始数据引用
    this.visualizationData.rawAudioData = {
        left: this.visualizationData.leftChannel,
        right: this.visualizationData.rightChannel,
        position: 0,
        sampleRate: 44100,
        isMixed: false,
        isSimulated: true
    };
}

    calculateAverage(data, start, end) {
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += data[i];
        }
        return sum / (end - start) / 255;
    }

    getWaveformValue(args) {
        const index = Math.max(0, Math.min(1023, Math.floor(Scratch.Cast.toNumber(args.INDEX))));
        return this.visualizationData.waveform[index] || 0;
    }

    getFrequencyValue(args) {
        const index = Math.max(0, Math.min(1023, Math.floor(Scratch.Cast.toNumber(args.INDEX))));
        return this.visualizationData.frequencies[index] || 0;
    }

    getBassLevel() { return this.visualizationData.bass; }
    getMidLevel() { return this.visualizationData.mid; }
    getTrebleLevel() { return this.visualizationData.treble; }
    getVolumeLevel() { return this.visualizationData.volume; }
    getDataLength() { return 1024; }

    setFFTSensitivity(args) {
        const size = Math.max(32, Math.min(32768, Math.pow(2, Math.floor(Math.log2(Scratch.Cast.toNumber(args.SIZE))))));
        const smoothing = Math.max(0, Math.min(1, Scratch.Cast.toNumber(args.SMOOTHING) / 100));
        
        this.fftConfig.size = size;
        this.fftConfig.smoothing = smoothing;
        
        if (this.analyser) {
            this.analyser.fftSize = size;
            this.analyser.smoothingTimeConstant = smoothing;
        }
    }

    getFFTConfig() {
        return `大小: ${this.fftConfig.size}, 平滑度: ${Math.round(this.fftConfig.smoothing * 100)}%`;
    }

    // 音效积木实现
    setReverb(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const level = Scratch.Cast.toNumber(args.LEVEL);
        const time = Scratch.Cast.toNumber(args.TIME);
        
        this.initAudioContext();
        
        if (!this.effectProcessors.has(audioId)) {
            this.effectProcessors.set(audioId, []);
        }
        
        const reverb = this.createReverb(level, time);
        this.effectProcessors.get(audioId).push(reverb);
        this.applyEffects(audioId, this.effectProcessors.get(audioId));
    }

    setDelay(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const feedback = Scratch.Cast.toNumber(args.FEEDBACK);
        const time = Scratch.Cast.toNumber(args.TIME);
        
        this.initAudioContext();
        
        if (!this.effectProcessors.has(audioId)) {
            this.effectProcessors.set(audioId, []);
        }
        
        const delaySystem = this.createDelay(feedback, time);
        this.effectProcessors.get(audioId).push(delaySystem.delay);
        this.applyEffects(audioId, this.effectProcessors.get(audioId));
    }

    setDistortion(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const amount = Scratch.Cast.toNumber(args.AMOUNT);
        
        this.initAudioContext();
        
        if (!this.effectProcessors.has(audioId)) {
            this.effectProcessors.set(audioId, []);
        }
        
        const distortion = this.createDistortion(amount);
        this.effectProcessors.get(audioId).push(distortion);
        this.applyEffects(audioId, this.effectProcessors.get(audioId));
    }

    setFilter(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const type = Scratch.Cast.toString(args.TYPE);
        const frequency = Scratch.Cast.toNumber(args.FREQ);
        
        this.initAudioContext();
        
        if (!this.effectProcessors.has(audioId)) {
            this.effectProcessors.set(audioId, []);
        }
        
        const filter = this.createFilter(type, frequency);
        this.effectProcessors.get(audioId).push(filter);
        this.applyEffects(audioId, this.effectProcessors.get(audioId));
    }

    setCompressor(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        const threshold = Scratch.Cast.toNumber(args.THRESHOLD);
        const ratio = Scratch.Cast.toNumber(args.RATIO);
        
        this.initAudioContext();
        
        if (!this.effectProcessors.has(audioId)) {
            this.effectProcessors.set(audioId, []);
        }
        
        const compressor = this.createCompressor(threshold, ratio);
        this.effectProcessors.get(audioId).push(compressor);
        this.applyEffects(audioId, this.effectProcessors.get(audioId));
    }

    clearEffects(args) {
        const audioId = Scratch.Cast.toString(args.ID);
        
        if (this.effectProcessors.has(audioId)) {
            this.effectProcessors.delete(audioId);
            
            // 重新连接无效果
            const audioState = this.audioSources.get(audioId);
            if (audioState && audioState.source) {
                audioState.source.disconnect();
                audioState.source.connect(this.masterGain);
            }
        }
    }

getActiveEffects(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    
    if (!this.effectProcessors.has(audioId)) {
        return '无音效';
    }
    
    const effects = this.effectProcessors.get(audioId);
    const effectNames = [];
    
    for (const effect of effects) {
        if (effect.constructor.name === 'ConvolverNode') effectNames.push('混响');
        else if (effect.constructor.name === 'DelayNode') effectNames.push('延迟');
        else if (effect.constructor.name === 'WaveShaperNode') effectNames.push('失真');
        else if (effect.constructor.name === 'BiquadFilterNode') effectNames.push('滤波器');
        else if (effect.constructor.name === 'DynamicsCompressor') effectNames.push('压缩器');
        else if (effect.gain && effect.oscillator) {
            // 区分不同类型的调制效果
            if (effect.delayNode) effectNames.push('镶边');
            else effectNames.push('调制效果');
        }
        else if (effect.constructor.name === 'ScriptProcessorNode') effectNames.push('位压缩');
        else if (effect.constructor.name === 'StereoPannerNode') effectNames.push('声像');
    }
    
    return effectNames.length > 0 ? effectNames.join(', ') : '无音效';
}

    // 获取所有播放中的音频ID
    getPlayingList() {
        const playingList = [];
        
        for (const [audioId, audioState] of this.audioSources) {
            if (audioState && audioState.isPlaying && !audioState.isPaused) {
                const currentTime = this.getCurrentTime({ ID: audioId });
                const audioBuffer = this.audioBuffers.get(audioId);
                const duration = audioBuffer ? audioBuffer.duration : 0;
                
                playingList.push({
                    id: audioId,
                    currentTime: currentTime,
                    duration: duration,
                    progress: duration > 0 ? (currentTime / duration * 100).toFixed(1) + '%' : '0%'
                });
            }
        }
        
        return JSON.stringify(playingList);
    }

    // 显示音频信息面板
    showAudioInfo() {
        // 移除已存在的面板
        const existingPanel = document.getElementById('audioInfoPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // 创建新面板
        const panel = document.createElement('div');
        panel.id = 'audioInfoPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial;
            font-size: 12px;
            z-index: 10000;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
            border: 2px solid #666;
        `;
        
        let html = '<h3 style="margin:0 0 15px 0; color: #4CAF50;">🎵 增强音频信息面板</h3>';
        
        // FFT配置信息
        html += `<div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
            <strong>📊 FFT配置:</strong><br>
            大小: ${this.fftConfig.size}<br>
            平滑度: ${Math.round(this.fftConfig.smoothing * 100)}%<br>
            数据长度: 1024点
        </div>`;
        
        // 所有加载的音频
        html += '<h4 style="margin:10px 0 5px 0; color: #FF9800;">📁 已加载音频:</h4>';
        if (this.audioBuffers.size === 0) {
            html += '<div style="color: #999; margin: 5px 0;">无</div>';
        } else {
            for (const [audioId, audioBuffer] of this.audioBuffers) {
                const audioState = this.audioSources.get(audioId);
                const duration = audioBuffer ? audioBuffer.duration.toFixed(2) : 'N/A';
                let status = '⚪ 已停止';
                let color = '#666';
                
                if (audioState) {
                    if (audioState.isPlaying && !audioState.isPaused) {
                        status = '🔴 播放中';
                        color = '#4CAF50';
                    } else if (audioState.isPaused) {
                        status = '⏸️ 已暂停';
                        color = '#FF9800';
                    }
                }
                
                const currentTime = this.getCurrentTime({ ID: audioId }).toFixed(2);
                const effects = this.effectProcessors.has(audioId) ? this.getActiveEffects({ ID: audioId }) : '无';
                
                html += `<div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px; border-left: 3px solid ${color};">
                    <strong>🎧 ${audioId}</strong><br>
                    📊 状态: ${status}<br>
                    ⏱️ 时长: ${duration}s<br>
                    🎯 当前: ${currentTime}s<br>
                    🎛️ 音效: ${effects}
                </div>`;
            }
        }
        
        // 波形数据信息
        html += `<div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <strong>📈 波形数据:</strong><br>
            低音: ${(this.visualizationData.bass * 100).toFixed(1)}%<br>
            中音: ${(this.visualizationData.mid * 100).toFixed(1)}%<br>
            高音: ${(this.visualizationData.treble * 100).toFixed(1)}%<br>
            音量: ${(this.visualizationData.volume * 100).toFixed(1)}%
        </div>`;
        
        // 关闭按钮
        html += '<button onclick="document.getElementById(\'audioInfoPanel\').remove()" style="margin-top:15px; padding:8px 15px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">关闭面板</button>';
        // 在showAudioInfo方法中添加以下信息：
        
        panel.innerHTML = html;
        document.body.appendChild(panel);
    }
// 添加更多音效创建方法
createTremolo(speed, depth) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.frequency.value = speed;
    oscillator.type = 'sine';
    gainNode.gain.value = depth / 100;
    
    oscillator.connect(gainNode);
    oscillator.start();
    
    return { oscillator, gainNode };
}

createChorus(speed, depth, delay) {
    const delayNode = this.audioContext.createDelay();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    delayNode.delayTime.value = delay;
    oscillator.frequency.value = speed;
    oscillator.type = 'sine';
    gainNode.gain.value = depth / 100;
    
    oscillator.connect(gainNode);
    gainNode.connect(delayNode.delayTime);
    oscillator.start();
    
    return { delayNode, oscillator, gainNode };
}

createPhaser(speed, depth, feedback) {
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const allpassFilters = [];
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const feedbackNode = this.audioContext.createGain();
    
    // 创建多个全通滤波器
    for (let i = 0; i < 4; i++) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'allpass';
        filter.frequency.value = 350;
        allpassFilters.push(filter);
    }
    
    // 连接滤波器
    let node = input;
    for (const filter of allpassFilters) {
        node.connect(filter);
        node = filter;
    }
    node.connect(output);
    
    // 调制
    oscillator.frequency.value = speed;
    oscillator.type = 'sine';
    gainNode.gain.value = depth;
    
    oscillator.connect(gainNode);
    gainNode.connect(allpassFilters[0].frequency);
    gainNode.connect(allpassFilters[1].frequency);
    gainNode.connect(allpassFilters[2].frequency);
    gainNode.connect(allpassFilters[3].frequency);
    
    // 反馈
    feedbackNode.gain.value = feedback / 100;
    output.connect(feedbackNode);
    feedbackNode.connect(input);
    
    oscillator.start();
    
    return { input, output, oscillator };
}

createEQ(low, mid, high) {
    const lowFilter = this.audioContext.createBiquadFilter();
    const midFilter = this.audioContext.createBiquadFilter();
    const highFilter = this.audioContext.createBiquadFilter();
    
    lowFilter.type = 'lowshelf';
    lowFilter.frequency.value = 320;
    lowFilter.gain.value = low;
    
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;
    midFilter.gain.value = mid;
    
    highFilter.type = 'highshelf';
    highFilter.frequency.value = 3200;
    highFilter.gain.value = high;
    
    return { lowFilter, midFilter, highFilter };
}

createBitCrusher(bits, frequency) {
    const node = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    node.onaudioprocess = function(e) {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);
        const step = Math.pow(1/2, bits);
        
        for (let i = 0; i < input.length; i++) {
            output[i] = step * Math.floor(input[i] / step + 0.5);
        }
    };
    
    return node;
}

createPanner(pan) {
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = pan / 100;
    return panner;
}
// 新增音效方法实现
setTremolo(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const speed = Scratch.Cast.toNumber(args.SPEED);
    const depth = Scratch.Cast.toNumber(args.DEPTH);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const tremolo = this.createTremolo(speed, depth);
    this.effectProcessors.get(audioId).push(tremolo.gainNode);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}

setChorus(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const speed = Scratch.Cast.toNumber(args.SPEED);
    const depth = Scratch.Cast.toNumber(args.DEPTH);
    const delay = Scratch.Cast.toNumber(args.DELAY);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const chorus = this.createChorus(speed, depth, delay);
    this.effectProcessors.get(audioId).push(chorus.delayNode);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}

setPhaser(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const speed = Scratch.Cast.toNumber(args.SPEED);
    const depth = Scratch.Cast.toNumber(args.DEPTH);
    const feedback = Scratch.Cast.toNumber(args.FEEDBACK);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const phaser = this.createPhaser(speed, depth, feedback);
    this.effectProcessors.get(audioId).push(phaser.input);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}

setEQ(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const low = Scratch.Cast.toNumber(args.LOW);
    const mid = Scratch.Cast.toNumber(args.MID);
    const high = Scratch.Cast.toNumber(args.HIGH);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const eq = this.createEQ(low, mid, high);
    this.effectProcessors.get(audioId).push(eq.lowFilter, eq.midFilter, eq.highFilter);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}

setBitCrusher(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const bits = Scratch.Cast.toNumber(args.BITS);
    const frequency = Scratch.Cast.toNumber(args.FREQ);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const bitCrusher = this.createBitCrusher(bits, frequency);
    this.effectProcessors.get(audioId).push(bitCrusher);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}

setPanner(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const pan = Scratch.Cast.toNumber(args.PAN);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const panner = this.createPanner(pan);
    this.effectProcessors.get(audioId).push(panner);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}
createFlanger(speed, depth, delay, feedback) {
    const delayNode = this.audioContext.createDelay();
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const feedbackNode = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    
    // 设置参数
    delayNode.delayTime.value = delay;
    oscillator.frequency.value = speed;
    oscillator.type = 'sine';
    gainNode.gain.value = depth;
    feedbackNode.gain.value = feedback / 100;
    wetGain.gain.value = 0.7; // 湿信号混合比例
    dryGain.gain.value = 0.7; // 干信号混合比例
    
    // 连接调制
    oscillator.connect(gainNode);
    gainNode.connect(delayNode.delayTime);
    
    // 创建反馈回路
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    
    // 混合干湿信号
    input.connect(dryGain);
    input.connect(delayNode);
    delayNode.connect(wetGain);
    dryGain.connect(output);
    wetGain.connect(output);
    
    oscillator.start();
    
    return { input, output, oscillator };
}
setFlanger(args) {
    const audioId = Scratch.Cast.toString(args.ID);
    const speed = Scratch.Cast.toNumber(args.SPEED);
    const depth = Scratch.Cast.toNumber(args.DEPTH);
    const delay = Scratch.Cast.toNumber(args.DELAY) / 1000; // 转换为秒
    const feedback = Scratch.Cast.toNumber(args.FEEDBACK);
    
    this.initAudioContext();
    
    if (!this.effectProcessors.has(audioId)) {
        this.effectProcessors.set(audioId, []);
    }
    
    const flanger = this.createFlanger(speed, depth, delay, feedback);
    this.effectProcessors.get(audioId).push(flanger.input);
    this.applyEffects(audioId, this.effectProcessors.get(audioId));
}
// 获取左声道数据
getLeftChannel(args) {
    const index = Math.max(0, Math.min(2047, Math.floor(Scratch.Cast.toNumber(args.INDEX))));
    return this.visualizationData.leftChannel[index] || 0;
}

// 获取右声道数据
getRightChannel(args) {
    const index = Math.max(0, Math.min(2047, Math.floor(Scratch.Cast.toNumber(args.INDEX))));
    return this.visualizationData.rightChannel[index] || 0;
}

// 获取当前正在播放的音频ID
getCurrentPlayingAudioId() {
    for (const [audioId, audioState] of this.audioSources) {
        if (audioState && audioState.isPlaying && !audioState.isPaused) {
            return audioId;
        }
    }
    return null;
}
// 实现声道统计
getChannelStats() {
    let minL = 1, maxL = -1, avgL = 0;
    let minR = 1, maxR = -1, avgR = 0;
    let count = 0;
    
    for (let i = 0; i < 2048; i++) {
        const valL = this.visualizationData.leftChannel[i];
        const valR = this.visualizationData.rightChannel[i];
        
        if (valL !== 0 || valR !== 0) {
            minL = Math.min(minL, valL);
            maxL = Math.max(maxL, valL);
            minR = Math.min(minR, valR);
            maxR = Math.max(maxR, valR);
            avgL += valL;
            avgR += valR;
            count++;
        }
    }
    
    if (count > 0) {
        avgL /= count;
        avgR /= count;
    }
    
    return `左声道: 最小=${minL.toFixed(4)}, 最大=${maxL.toFixed(4)}, 平均=${avgL.toFixed(4)} | 右声道: 最小=${minR.toFixed(4)}, 最大=${maxR.toFixed(4)}, 平均=${avgR.toFixed(4)}`;
}
}

// 注册扩展
Scratch.extensions.register(new AudioFFTExtension());
// Transformers.js Turbowarp扩展
// 版本: 1.0.0
// 使用 Hugging Face Transformers.js 3.8.1

(function(ext) {
    // 清理函数，用于扩展卸载
    ext._shutdown = function() {};
    
    // 扩展状态报告
    ext._getStatus = function() {
        return { status: 2, msg: 'Ready' };
    };
    
    // ==================== 全局变量定义 ====================
    
    // Transformers.js库引用
    let transformers = null;
    let isTransformersLoaded = false;
    let loadError = null;
    
    // Pipeline存储（Pipeline ID到Pipeline对象的映射）
    let pipelines = {};
    let nextPipelineId = 1;
    
    // 模型存储（模型ID到模型对象的映射）
    let models = {};
    let nextModelId = 1;
    
    // 分词器存储（分词器ID到分词器对象的映射）
    let tokenizers = {};
    let nextTokenizerId = 1;
    
    // 处理器存储（处理器ID到处理器对象的映射）
    let processors = {};
    let nextProcessorId = 1;
    
    // ==================== Transformers.js加载函数 ====================
    
    /**
     * 安全的JSON序列化函数，处理BigInt等特殊类型
     * @param {any} value - 要序列化的值
     * @param {number|string} space - 缩进空格数
     * @returns {string} JSON字符串
     */
    function safeStringify(value, space = 2) {
        return JSON.stringify(value, (key, val) => {
            if (typeof val === 'bigint') {
                return val.toString(); // 将BigInt转换为字符串
            }
            return val; // 其他类型保持不变
        }, space);
    }
    
    /**
     * 确保Transformers.js库已加载
     * @returns {Promise<object>} Transformers.js库对象
     */
    async function ensureTransformersLoaded() {
        if (isTransformersLoaded) {
            return transformers;
        }
        
        if (loadError) {
            throw loadError;
        }
        
        try {
            console.log('开始加载Transformers.js v3.8.1...');
            
            // 使用ES模块动态导入Transformers.js
            // Transformers.js 3.8.1 应该通过ES模块导入
            const module = await import('https://extensions.02engine.02studio.xyz/attachment/transformers.js');
            
            // 检查关键API是否可用
            if (!module.pipeline) {
                throw new Error('Transformers.js加载成功，但pipeline API未找到');
            }
            
            // 设置transformers对象，包含所有需要的API
            transformers = {
                pipeline: module.pipeline,
                env: module.env,
                AutoModel: module.AutoModel,
                AutoTokenizer: module.AutoTokenizer,
                AutoProcessor: module.AutoProcessor,
                // 其他可能的API
                AutoModelForSequenceClassification: module.AutoModelForSequenceClassification,
                AutoModelForQuestionAnswering: module.AutoModelForQuestionAnswering,
                AutoModelForCausalLM: module.AutoModelForCausalLM,
                AutoModelForSeq2SeqLM: module.AutoModelForSeq2SeqLM,
                AutoModelForTokenClassification: module.AutoModelForTokenClassification,
                AutoModelForMaskedLM: module.AutoModelForMaskedLM,
                // 工具函数
                tensor: module.tensor,
                // 其他工具...
            };
            
            isTransformersLoaded = true;
            console.log('Transformers.js v3.8.1 加载成功');
            return transformers;
        } catch (error) {
            loadError = error;
            console.error('加载Transformers.js失败:', error);
            
            // 提供更详细的错误信息
            if (error.toString().includes('Failed to fetch')) {
                loadError = new Error('无法加载Transformers.js，请检查网络连接。错误: ' + error.message);
            } else if (error.toString().includes('Unexpected token')) {
                loadError = new Error('Transformers.js模块格式可能不正确，请确保使用正确的CDN链接。错误: ' + error.message);
            }
            
            throw loadError;
        }
    }
    
    // ==================== 扩展描述符 ====================
    
    const descriptor = {
        blocks: [
            // 状态检查积木块
            ['r', 'Transformers.js状态', 'getTransformersStatus'],
            
            // Pipeline相关积木块
            [' ', '创建Pipeline 任务类型 %m.pipelineTasks 模型名称 %s', 'createPipeline', 'text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english'],
            ['r', 'Pipeline执行 %s 输入 %s', 'runPipeline', 'pipelineId', '输入文本'],
            [' ', '释放Pipeline %s', 'disposePipeline', 'pipelineId'],
            
            // 文本分类
            ['r', '文本分类 %s 文本 %s', 'textClassification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', 'I love this movie!'],
            
            // 问答
            ['r', '问答 %s 问题 %s 上下文 %s', 'questionAnswering', 'Xenova/distilbert-base-uncased-distilled-squad', 'What is AI?', 'Artificial Intelligence is...'],
            
            // 文本生成
            ['r', '文本生成 %s 提示 %s', 'textGeneration', 'Xenova/gpt2', 'Once upon a time'],
            
            // 翻译
            ['r', '翻译 %s 文本 %s', 'translation', 'Xenova/t5-small', 'Hello, world!'],
            
            // 摘要
            ['r', '文本摘要 %s 文本 %s', 'summarization', 'Xenova/bart-large-cnn', '长文本内容...'],
            
            // 零样本分类
            ['r', '零样本分类 %s 文本 %s 候选标签 %s', 'zeroShotClassification', 'Xenova/bart-large-mnli', 'This is a great movie', '["positive", "negative"]'],
            
            // 填充掩码
            ['r', '填充掩码 %s 文本 %s', 'fillMask', 'Xenova/bert-base-uncased', 'The quick brown [MASK] jumps over the lazy dog'],
            
            // 情感分析
            ['r', '情感分析 %s 文本 %s', 'sentimentAnalysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', 'I love programming!'],
            
            // 命名实体识别
            ['r', '命名实体识别 %s 文本 %s', 'namedEntityRecognition', 'Xenova/dbmdz/bert-large-cased-finetuned-conll03-english', 'John works at Google in New York'],
            
            // 模型管理积木块
            [' ', '加载模型 %s 模型名称 %s', 'loadModel', 'modelId', 'Xenova/bert-base-uncased'],
            [' ', '释放模型 %s', 'disposeModel', 'modelId'],
            
            // 分词器积木块
            [' ', '加载分词器 %s 模型名称 %s', 'loadTokenizer', 'tokenizerId', 'Xenova/bert-base-uncased'],
            ['r', '分词器编码 %s 文本 %s', 'tokenizerEncode', 'tokenizerId', 'Hello world'],
            ['r', '分词器解码 %s 标记IDs %s', 'tokenizerDecode', 'tokenizerId', '[101, 7592, 2088, 102]'],
            [' ', '释放分词器 %s', 'disposeTokenizer', 'tokenizerId'],
            
            // 处理器积木块
            [' ', '加载处理器 %s 模型名称 %s', 'loadProcessor', 'processorId', 'Xenova/clip-vit-base-patch16'],
            [' ', '释放处理器 %s', 'disposeProcessor', 'processorId'],
            
            // 资源管理
            [' ', '清理所有资源', 'cleanupAll'],
            
            // 版本信息
            ['r', '版本信息', 'getVersion'],
        ],
        menus: {
            pipelineTasks: [
                'text-classification',
                'question-answering', 
                'text-generation',
                'translation',
                'summarization',
                'zero-shot-classification',
                'fill-mask',
                'sentiment-analysis',
                'named-entity-recognition',
                'image-classification',
                'automatic-speech-recognition',
                'object-detection',
                'image-segmentation'
            ]
        },
        url: 'https://github.com/xenova/transformers.js',
        displayName: 'Transformers.js',
        extensionId: 'transformersjs'
    };
    
    // ==================== 状态检查函数 ====================
    
    /**
     * 获取Transformers.js状态
     * @returns {string} 状态信息
     */
    ext.getTransformersStatus = async function() {
        try {
            const tfjs = await ensureTransformersLoaded();
            return 'Transformers.js v3.8.1 已加载';
        } catch (error) {
            return '错误: ' + error.message;
        }
    };
    
    // ==================== Pipeline函数 ====================
    
    /**
     * 创建Pipeline
     * @param {string} task - 任务类型
     * @param {string} modelName - 模型名称
     * @returns {string} Pipeline ID
     */
    ext.createPipeline = async function(task, modelName) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            // 创建Pipeline
            const pipeline = await tfjs.pipeline(task, modelName);
            const pipelineId = 'pipeline_' + nextPipelineId++;
            pipelines[pipelineId] = pipeline;
            
            return pipelineId;
        } catch (error) {
            console.error('创建Pipeline失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 执行Pipeline
     * @param {string} pipelineId - Pipeline ID
     * @param {string} input - 输入数据
     * @returns {string} 处理结果的JSON字符串
     */
    ext.runPipeline = async function(pipelineId, input) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!pipelines[pipelineId]) {
                throw new Error('未找到指定的Pipeline');
            }
            
            const pipeline = pipelines[pipelineId];
            
            // 执行Pipeline
            const result = await pipeline(input);
            
            // 将结果转换为JSON字符串
            return safeStringify(result);
        } catch (error) {
            console.error('执行Pipeline失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 释放Pipeline
     * @param {string} pipelineId - Pipeline ID
     * @returns {string} 成功消息
     */
    ext.disposePipeline = function(pipelineId) {
        try {
            if (pipelines[pipelineId]) {
                // 如果Pipeline有dispose方法，调用它
                if (typeof pipelines[pipelineId].dispose === 'function') {
                    pipelines[pipelineId].dispose();
                }
                delete pipelines[pipelineId];
                return 'Pipeline已释放';
            } else {
                return '未找到指定的Pipeline';
            }
        } catch (error) {
            console.error('释放Pipeline失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 特定任务函数 ====================
    
    /**
     * 文本分类
     * @param {string} modelName - 模型名称
     * @param {string} text - 文本
     * @returns {string} 分类结果的JSON字符串
     */
    ext.textClassification = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            // 创建文本分类Pipeline
            const classifier = await tfjs.pipeline('text-classification', modelName);
            const result = await classifier(text);
            
            // 释放资源
            if (typeof classifier.dispose === 'function') {
                classifier.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('文本分类失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 问答
     * @param {string} modelName - 模型名称
     * @param {string} question - 问题
     * @param {string} context - 上下文
     * @returns {string} 答案的JSON字符串
     */
    ext.questionAnswering = async function(modelName, question, context) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const qaPipeline = await tfjs.pipeline('question-answering', modelName);
            const result = await qaPipeline({
                question: question,
                context: context
            });
            
            if (typeof qaPipeline.dispose === 'function') {
                qaPipeline.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('问答失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 文本生成
     * @param {string} modelName - 模型名称
     * @param {string} prompt - 提示文本
     * @returns {string} 生成文本的JSON字符串
     */
    ext.textGeneration = async function(modelName, prompt) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const generator = await tfjs.pipeline('text-generation', modelName);
            const result = await generator(prompt, {
                max_new_tokens: 50,
                temperature: 0.7
            });
            
            if (typeof generator.dispose === 'function') {
                generator.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('文本生成失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 翻译
     * @param {string} modelName - 模型名称
     * @param {string} text - 要翻译的文本
     * @returns {string} 翻译结果的JSON字符串
     */
    ext.translation = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const translator = await tfjs.pipeline('translation', modelName);
            const result = await translator(text);
            
            if (typeof translator.dispose === 'function') {
                translator.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('翻译失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 文本摘要
     * @param {string} modelName - 模型名称
     * @param {string} text - 要摘要的文本
     * @returns {string} 摘要结果的JSON字符串
     */
    ext.summarization = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const summarizer = await tfjs.pipeline('summarization', modelName);
            const result = await summarizer(text, {
                max_length: 100,
                min_length: 30
            });
            
            if (typeof summarizer.dispose === 'function') {
                summarizer.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('文本摘要失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 零样本分类
     * @param {string} modelName - 模型名称
     * @param {string} text - 要分类的文本
     * @param {string} candidateLabelsStr - 候选标签的JSON字符串
     * @returns {string} 分类结果的JSON字符串
     */
    ext.zeroShotClassification = async function(modelName, text, candidateLabelsStr) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            let candidateLabels;
            try {
                candidateLabels = JSON.parse(candidateLabelsStr);
            } catch (e) {
                throw new Error('无法解析候选标签，请确保输入有效的JSON数组');
            }
            
            const classifier = await tfjs.pipeline('zero-shot-classification', modelName);
            const result = await classifier(text, candidateLabels);
            
            if (typeof classifier.dispose === 'function') {
                classifier.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('零样本分类失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 填充掩码
     * @param {string} modelName - 模型名称
     * @param {string} text - 包含[MASK]的文本
     * @returns {string} 填充结果的JSON字符串
     */
    ext.fillMask = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const filler = await tfjs.pipeline('fill-mask', modelName);
            const result = await filler(text);
            
            if (typeof filler.dispose === 'function') {
                filler.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('填充掩码失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 情感分析
     * @param {string} modelName - 模型名称
     * @param {string} text - 要分析的文本
     * @returns {string} 情感分析结果的JSON字符串
     */
    ext.sentimentAnalysis = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const sentiment = await tfjs.pipeline('sentiment-analysis', modelName);
            const result = await sentiment(text);
            
            if (typeof sentiment.dispose === 'function') {
                sentiment.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('情感分析失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 命名实体识别
     * @param {string} modelName - 模型名称
     * @param {string} text - 要分析的文本
     * @returns {string} 实体识别结果的JSON字符串
     */
    ext.namedEntityRecognition = async function(modelName, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            const ner = await tfjs.pipeline('named-entity-recognition', modelName);
            const result = await ner(text);
            
            if (typeof ner.dispose === 'function') {
                ner.dispose();
            }
            
            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error('命名实体识别失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 模型管理函数 ====================
    
    /**
     * 加载模型
     * @param {string} modelId - 模型ID
     * @param {string} modelName - 模型名称
     * @returns {string} 成功消息
     */
    ext.loadModel = async function(modelId, modelName) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!tfjs.AutoModel) {
                throw new Error('当前Transformers.js版本不支持AutoModel');
            }
            
            const model = await tfjs.AutoModel.from_pretrained(modelName);
            models[modelId] = model;
            
            return '模型加载成功: ' + modelName;
        } catch (error) {
            console.error('加载模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 释放模型
     * @param {string} modelId - 模型ID
     * @returns {string} 成功消息
     */
    ext.disposeModel = function(modelId) {
        try {
            if (models[modelId]) {
                if (typeof models[modelId].dispose === 'function') {
                    models[modelId].dispose();
                }
                delete models[modelId];
                return '模型已释放';
            } else {
                return '未找到指定的模型';
            }
        } catch (error) {
            console.error('释放模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 分词器函数 ====================
    
    /**
     * 加载分词器
     * @param {string} tokenizerId - 分词器ID
     * @param {string} modelName - 模型名称
     * @returns {string} 成功消息
     */
    ext.loadTokenizer = async function(tokenizerId, modelName) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!tfjs.AutoTokenizer) {
                throw new Error('当前Transformers.js版本不支持AutoTokenizer');
            }
            
            const tokenizer = await tfjs.AutoTokenizer.from_pretrained(modelName);
            tokenizers[tokenizerId] = tokenizer;
            
            return '分词器加载成功: ' + modelName;
        } catch (error) {
            console.error('加载分词器失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 分词器编码
     * @param {string} tokenizerId - 分词器ID
     * @param {string} text - 要编码的文本
     * @returns {string} 编码结果的JSON字符串
     */
    ext.tokenizerEncode = async function(tokenizerId, text) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!tokenizers[tokenizerId]) {
                throw new Error('未找到指定的分词器');
            }
            
            const tokenizer = tokenizers[tokenizerId];
            const encoding = tokenizer(text);
            
            // 使用安全的JSON序列化函数
            return safeStringify(encoding);
        } catch (error) {
            console.error('分词器编码失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 分词器解码
     * @param {string} tokenizerId - 分词器ID
     * @param {string} tokenIdsStr - 标记ID数组的JSON字符串
     * @returns {string} 解码后的文本
     */
    ext.tokenizerDecode = async function(tokenizerId, tokenIdsStr) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!tokenizers[tokenizerId]) {
                throw new Error('未找到指定的分词器');
            }
            
            let tokenIds;
            try {
                tokenIds = JSON.parse(tokenIdsStr);
            } catch (e) {
                throw new Error('无法解析标记ID，请确保输入有效的JSON数组');
            }
            
            const tokenizer = tokenizers[tokenizerId];
            const decoded = tokenizer.decode(tokenIds);
            
            return decoded;
        } catch (error) {
            console.error('分词器解码失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 释放分词器
     * @param {string} tokenizerId - 分词器ID
     * @returns {string} 成功消息
     */
    ext.disposeTokenizer = function(tokenizerId) {
        try {
            if (tokenizers[tokenizerId]) {
                if (typeof tokenizers[tokenizerId].dispose === 'function') {
                    tokenizers[tokenizerId].dispose();
                }
                delete tokenizers[tokenizerId];
                return '分词器已释放';
            } else {
                return '未找到指定的分词器';
            }
        } catch (error) {
            console.error('释放分词器失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 处理器函数 ====================
    
    /**
     * 加载处理器
     * @param {string} processorId - 处理器ID
     * @param {string} modelName - 模型名称
     * @returns {string} 成功消息
     */
    ext.loadProcessor = async function(processorId, modelName) {
        try {
            const tfjs = await ensureTransformersLoaded();
            
            if (!tfjs.AutoProcessor) {
                throw new Error('当前Transformers.js版本不支持AutoProcessor');
            }
            
            const processor = await tfjs.AutoProcessor.from_pretrained(modelName);
            processors[processorId] = processor;
            
            return '处理器加载成功: ' + modelName;
        } catch (error) {
            console.error('加载处理器失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 释放处理器
     * @param {string} processorId - 处理器ID
     * @returns {string} 成功消息
     */
    ext.disposeProcessor = function(processorId) {
        try {
            if (processors[processorId]) {
                if (typeof processors[processorId].dispose === 'function') {
                    processors[processorId].dispose();
                }
                delete processors[processorId];
                return '处理器已释放';
            } else {
                return '未找到指定的处理器';
            }
        } catch (error) {
            console.error('释放处理器失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 资源管理函数 ====================
    
    /**
     * 清理所有资源
     */
    ext.cleanupAll = async function() {
        try {
            // 清理所有Pipeline
            for (const id in pipelines) {
                if (pipelines[id] && typeof pipelines[id].dispose === 'function') {
                    try {
                        pipelines[id].dispose();
                    } catch (e) {
                        console.warn('清理Pipeline时出错:', e);
                    }
                }
            }
            
            // 清理所有模型
            for (const id in models) {
                if (models[id] && typeof models[id].dispose === 'function') {
                    try {
                        models[id].dispose();
                    } catch (e) {
                        console.warn('清理模型时出错:', e);
                    }
                }
            }
            
            // 清理所有分词器
            for (const id in tokenizers) {
                if (tokenizers[id] && typeof tokenizers[id].dispose === 'function') {
                    try {
                        tokenizers[id].dispose();
                    } catch (e) {
                        console.warn('清理分词器时出错:', e);
                    }
                }
            }
            
            // 清理所有处理器
            for (const id in processors) {
                if (processors[id] && typeof processors[id].dispose === 'function') {
                    try {
                        processors[id].dispose();
                    } catch (e) {
                        console.warn('清理处理器时出错:', e);
                    }
                }
            }
            
            // 重置所有存储
            pipelines = {};
            models = {};
            tokenizers = {};
            processors = {};
            nextPipelineId = 1;
            nextModelId = 1;
            nextTokenizerId = 1;
            nextProcessorId = 1;
            
            console.log('所有Transformers.js资源已清理');
        } catch (error) {
            console.error('清理资源失败:', error);
        }
    };
    
    /**
     * 获取版本信息
     * @returns {string} 版本信息
     */
    ext.getVersion = function() {
        return 'Transformers.js Turbowarp扩展 v1.0.0';
    };
    
    // ==================== 扩展注册 ====================
    
    // 注册扩展
    if (typeof ScratchExtensions !== 'undefined') {
        ScratchExtensions.register('Transformers', descriptor, ext);
    } else if (typeof window.TurboWarp !== 'undefined') {
        // Turbowarp兼容
        window.TurboWarp.extensions.register(descriptor, ext);
    } else {
        console.error('未找到Scratch或Turbowarp扩展系统');
    }
    
})({});
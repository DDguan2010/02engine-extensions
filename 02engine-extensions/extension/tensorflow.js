/**
 * TensorFlow.js Turbowarp Extension
 * 提供TensorFlow.js机器学习功能的图形化编程接口
 * 通过CDN动态加载TensorFlow.js库
 */

(function(ext) {
    'use strict';
    
    // ==================== 扩展状态和初始化 ====================
    let tf = null; // TensorFlow.js全局引用
    let isTFLoaded = false;
    let loadError = null;
    
    // TensorFlow.js CDN URL
    const TF_CDN_URL = 'https://extensions.02engine.02studio.xyz/attachment/tensorflow.js';
    
    // 模型存储（模型ID到模型对象的映射）
    let models = {};
    let nextModelId = 1;
    
    // 张量存储（张量ID到张量对象的映射）
    let tensors = {};
    let nextTensorId = 1;
    
    

    
    // ==================== TensorFlow.js加载函数 ====================
    function loadTensorFlowJS() {
        return new Promise((resolve, reject) => {
            if (isTFLoaded) {
                resolve(tf);
                return;
            }
            
            if (loadError) {
                reject(loadError);
                return;
            }
            
            // 检查是否已通过其他方式加载
            if (typeof window.tf !== 'undefined') {
                tf = window.tf;
                isTFLoaded = true;
                console.log('TensorFlow.js已通过全局变量加载');
                resolve(tf);
                return;
            }
            
            // 动态创建script标签加载TensorFlow.js
            const script = document.createElement('script');
            script.src = TF_CDN_URL;
            script.onload = function() {
                if (typeof window.tf === 'undefined') {
                    loadError = new Error('TensorFlow.js加载失败：全局tf对象未定义');
                    reject(loadError);
                    return;
                }
                tf = window.tf;
                isTFLoaded = true;
                console.log('TensorFlow.js加载成功，版本:', tf.version.tfjs);
                resolve(tf);
            };
            script.onerror = function(error) {
                loadError = new Error('TensorFlow.js脚本加载失败: ' + error);
                reject(loadError);
            };
            
            document.head.appendChild(script);
        });
    }
    
    // 确保TensorFlow.js已加载的辅助函数
    async function ensureTFLoaded() {
        if (!isTFLoaded) {
            await loadTensorFlowJS();
        }
        return tf;
    }
    

    
    // 注册自定义层，以便序列化
    // 注意：需要在TensorFlow.js加载后才能注册

    
    // ==================== Base64辅助函数 ====================
    /**
     * 将ArrayBuffer转换为Base64字符串
     * @param {ArrayBuffer} buffer - 二进制数据
     * @returns {string} Base64字符串
     */
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    /**
     * 将Base64字符串转换为ArrayBuffer
     * @param {string} base64 - Base64字符串
     * @returns {ArrayBuffer} 二进制数据
     */
    function base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    // ==================== 扩展描述符 ====================
    const descriptor = {
        blocks: [
            // 张量操作积木块
            ['r', '创建张量 %s', 'tensorCreate', '[1,2,3,4]'],
            ['r', '创建二维张量 行数 %n 列数 %n 值 %s', 'tensorCreate2D', '2', '3', '[1,2,3,4,5,6]'],
            ['r', '张量相加 %s %s', 'tensorAdd', 'tensorId1', 'tensorId2'],
            ['r', '张量相减 %s %s', 'tensorSub', 'tensorId1', 'tensorId2'],
            ['r', '张量相乘 %s %s', 'tensorMul', 'tensorId1', 'tensorId2'],
            ['r', '张量相除 %s %s', 'tensorDiv', 'tensorId1', 'tensorId2'],
            ['r', '获取张量形状 %s', 'tensorShape', 'tensorId'],
            ['r', '获取张量数据 %s', 'tensorData', 'tensorId'],
            [' ', '释放张量 %s', 'tensorDispose', 'tensorId'],
            
            // 模型创建积木块
            ['r', '创建顺序模型', 'modelCreateSequential'],
            [' ', '添加密集层 到模型 %s 神经元数 %n 输入形状 %s 激活函数 %m.activation', 'modelAddDenseLayer', 'modelId', '10', '[null]', 'linear'],
            [' ', '添加卷积层 到模型 %s 过滤器数 %n 核大小 %n 输入形状 %s 激活函数 %m.activation', 'modelAddConv2DLayer', 'modelId', '32', '3', '[null,28,28,1]', 'relu'],
            [' ', '添加最大池化层 到模型 %s 池大小 %n', 'modelAddMaxPooling2DLayer', 'modelId', '2'],
            [' ', '添加扁平层 到模型 %s', 'modelAddFlattenLayer', 'modelId'],
            
            // 新增核心层
            [' ', '添加重塑层 到模型 %s 目标形状 %s', 'modelAddReshapeLayer', 'modelId', '[784]'],
            [' ', '添加丢弃层 到模型 %s 丢弃率 %n', 'modelAddDropoutLayer', 'modelId', '0.5'],
            [' ', '添加激活层 到模型 %s 激活函数 %m.activation', 'modelAddActivationLayer', 'modelId', 'relu'],
            
            // 新增卷积与池化层
            [' ', '添加平均池化层 到模型 %s 池大小 %n', 'modelAddAveragePooling2DLayer', 'modelId', '2'],
            [' ', '添加一维卷积层 到模型 %s 过滤器数 %n 核大小 %n 输入形状 %s 激活函数 %m.activation', 'modelAddConv1DLayer', 'modelId', '32', '3', '[null,100,1]', 'relu'],
            
            // 新增循环层
            [' ', '添加LSTM层 到模型 %s 单元数 %n 输入形状 %s 激活函数 %m.activation 是否返回序列 %b', 'modelAddLSTMLayer', 'modelId', '50', '[null,10,64]', 'tanh', 'false'],
            [' ', '添加GRU层 到模型 %s 单元数 %n 输入形状 %s 激活函数 %m.activation 是否返回序列 %b', 'modelAddGRULayer', 'modelId', '50', '[null,10,64]', 'tanh', 'false'],
            [' ', '添加简单RNN层 到模型 %s 单元数 %n 输入形状 %s 激活函数 %m.activation 是否返回序列 %b', 'modelAddSimpleRNNLayer', 'modelId', '50', '[null,10,64]', 'tanh', 'false'],
            
            // 新增Transformer与注意力层
            [' ', '添加层归一化层 到模型 %s 轴 %s epsilon %n', 'modelAddLayerNormalizationLayer', 'modelId', '-1', '0.001'],
            
            // 新增其他重要层
            [' ', '添加嵌入层 到模型 %s 输入维度 %n 输出维度 %n 输入长度 %s', 'modelAddEmbeddingLayer', 'modelId', '1000', '64', '[null]'],
            [' ', '添加批量归一化层 到模型 %s 轴 %s 动量 %n epsilon %n', 'modelAddBatchNormalizationLayer', 'modelId', '-1', '0.99', '0.001'],
            [' ', '添加全局平均池化层 到模型 %s', 'modelAddGlobalAveragePooling2DLayer', 'modelId'],
            
            [' ', '编译模型 %s 优化器 %m.optimizer 损失函数 %m.loss 评估指标 %s', 'modelCompile', 'modelId', 'sgd', 'meanSquaredError', '["accuracy"]'],
            
            // 模型训练积木块
            ['r', '训练模型 %s 输入张量 %s 标签张量 %s 训练轮数 %n', 'modelFit', 'modelId', 'tensorIdXs', 'tensorIdYs', '10'],
            ['r', '预测 %s 输入张量 %s', 'modelPredict', 'modelId', 'tensorIdInput'],
            
            // 工具积木块
            ['r', 'TensorFlow.js状态', 'getTFStatus'],
            [' ', '保存模型 %s 名称 %s', 'modelSave', 'modelId', 'my_model'],
            ['r', '加载模型 名称 %s', 'modelLoad', 'my_model'],
            [' ', '导出模型为文件 模型 %s 文件名 %s', 'modelExportToFile', 'modelId', 'model.json'],
            ['r', '获取模型base64 %s', 'modelToBase64', 'modelId'],
            ['r', '从base64导入模型 拓扑 %s 权重 %s', 'modelFromBase64', 'topologyBase64', 'weightsBase64'],
            ['r', '从JSON导入模型 %s', 'modelFromJSON', '{"topology":"...","weights":"..."}'],
            [' ', '清理所有张量和模型', 'cleanupAll'],
            

            
            ['r', '版本信息', 'getVersion'],
        ],
        menus: {
            activation: ['linear', 'relu', 'sigmoid', 'tanh', 'softmax', 'elu', 'selu', 'softplus', 'softsign', 'hard_sigmoid', 'exponential'],
            optimizer: ['sgd', 'adam', 'adagrad', 'rmsprop'],
            loss: ['meanSquaredError', 'meanAbsoluteError', 'categoricalCrossentropy', 'binaryCrossentropy'],
            padding: ['valid', 'same'],
            mergeMode: ['concat', 'sum', 'mul', 'ave'],
            dataFormat: ['channels_last', 'channels_first'],
        },
        url: 'https://github.com/tensorflow/tfjs'
    };
    
    // ==================== 扩展生命周期函数 ====================
    ext._shutdown = function() {
        // 清理所有TensorFlow.js资源
        for (const id in tensors) {
            if (tensors[id] && typeof tensors[id].dispose === 'function') {
                try {
                    tensors[id].dispose();
                } catch (e) {
                    console.warn('清理张量时出错:', e);
                }
            }
        }
        tensors = {};
        models = {};
        console.log('TensorFlow扩展已关闭，资源已清理');
    };
    
    ext._getStatus = function() {
        if (!isTFLoaded) {
            return {status: 1, msg: '加载TensorFlow.js...'};
        }
        if (loadError) {
            return {status: 0, msg: 'TensorFlow.js加载失败'};
        }
        return {status: 2, msg: 'TensorFlow.js已就绪'};
    };

    
    // ==================== 张量操作函数 ====================
    
    /**
     * 创建张量
     * @param {string} valuesStr - 数组字符串，如 "[1,2,3,4]"
     * @returns {string} 张量ID
     */
    ext.tensorCreate = async function(valuesStr) {
        try {
            const tf = await ensureTFLoaded();
            let values;
            try {
                values = JSON.parse(valuesStr);
            } catch (e) {
                throw new Error('请输入有效的JSON数组，例如: [1,2,3,4]');
            }
            
            const tensor = tf.tensor(values);
            const tensorId = 'tensor_' + nextTensorId++;
            tensors[tensorId] = tensor;
            return tensorId;
        } catch (error) {
            console.error('创建张量失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 创建二维张量
     * @param {number} rows - 行数
     * @param {number} cols - 列数
     * @param {string} valuesStr - 数组字符串
     * @returns {string} 张量ID
     */
    ext.tensorCreate2D = async function(rows, cols, valuesStr) {
        try {
            const tf = await ensureTFLoaded();
            let values;
            try {
                values = JSON.parse(valuesStr);
            } catch (e) {
                throw new Error('请输入有效的JSON数组');
            }
            
            // 检查数组长度是否匹配
            if (values.length !== rows * cols) {
                throw new Error(`数组长度应为 ${rows * cols}，但实际为 ${values.length}`);
            }
            
            const tensor = tf.tensor2d(values, [rows, cols]);
            const tensorId = 'tensor_' + nextTensorId++;
            tensors[tensorId] = tensor;
            return tensorId;
        } catch (error) {
            console.error('创建二维张量失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 张量相加
     * @param {string} tensorId1 - 第一个张量ID
     * @param {string} tensorId2 - 第二个张量ID
     * @returns {string} 结果张量ID
     */
    ext.tensorAdd = async function(tensorId1, tensorId2) {
        try {
            const tf = await ensureTFLoaded();
            const tensor1 = tensors[tensorId1];
            const tensor2 = tensors[tensorId2];
            
            if (!tensor1 || !tensor2) {
                throw new Error('张量不存在');
            }
            
            const result = tensor1.add(tensor2);
            const resultId = 'tensor_' + nextTensorId++;
            tensors[resultId] = result;
            return resultId;
        } catch (error) {
            console.error('张量相加失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 张量相减
     * @param {string} tensorId1 - 第一个张量ID
     * @param {string} tensorId2 - 第二个张量ID
     * @returns {string} 结果张量ID
     */
    ext.tensorSub = async function(tensorId1, tensorId2) {
        try {
            const tf = await ensureTFLoaded();
            const tensor1 = tensors[tensorId1];
            const tensor2 = tensors[tensorId2];
            
            if (!tensor1 || !tensor2) {
                throw new Error('张量不存在');
            }
            
            const result = tensor1.sub(tensor2);
            const resultId = 'tensor_' + nextTensorId++;
            tensors[resultId] = result;
            return resultId;
        } catch (error) {
            console.error('张量相减失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 张量相乘
     * @param {string} tensorId1 - 第一个张量ID
     * @param {string} tensorId2 - 第二个张量ID
     * @returns {string} 结果张量ID
     */
    ext.tensorMul = async function(tensorId1, tensorId2) {
        try {
            const tf = await ensureTFLoaded();
            const tensor1 = tensors[tensorId1];
            const tensor2 = tensors[tensorId2];
            
            if (!tensor1 || !tensor2) {
                throw new Error('张量不存在');
            }
            
            const result = tensor1.mul(tensor2);
            const resultId = 'tensor_' + nextTensorId++;
            tensors[resultId] = result;
            return resultId;
        } catch (error) {
            console.error('张量相乘失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 张量相除
     * @param {string} tensorId1 - 第一个张量ID
     * @param {string} tensorId2 - 第二个张量ID
     * @returns {string} 结果张量ID
     */
    ext.tensorDiv = async function(tensorId1, tensorId2) {
        try {
            const tf = await ensureTFLoaded();
            const tensor1 = tensors[tensorId1];
            const tensor2 = tensors[tensorId2];
            
            if (!tensor1 || !tensor2) {
                throw new Error('张量不存在');
            }
            
            const result = tensor1.div(tensor2);
            const resultId = 'tensor_' + nextTensorId++;
            tensors[resultId] = result;
            return resultId;
        } catch (error) {
            console.error('张量相除失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 获取张量形状
     * @param {string} tensorId - 张量ID
     * @returns {string} 形状字符串
     */
    ext.tensorShape = async function(tensorId) {
        try {
            const tf = await ensureTFLoaded();
            const tensor = tensors[tensorId];
            
            if (!tensor) {
                throw new Error('张量不存在');
            }
            
            return JSON.stringify(tensor.shape);
        } catch (error) {
            console.error('获取张量形状失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 获取张量数据
     * @param {string} tensorId - 张量ID
     * @returns {string} 数据字符串
     */
    ext.tensorData = async function(tensorId) {
        try {
            const tf = await ensureTFLoaded();
            const tensor = tensors[tensorId];
            
            if (!tensor) {
                throw new Error('张量不存在');
            }
            
            const data = await tensor.array();
            return JSON.stringify(data);
        } catch (error) {
            console.error('获取张量数据失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 释放张量
     * @param {string} tensorId - 张量ID
     */
    ext.tensorDispose = async function(tensorId) {
        try {
            const tf = await ensureTFLoaded();
            const tensor = tensors[tensorId];
            
            if (tensor) {
                tensor.dispose();
                delete tensors[tensorId];
            }
        } catch (error) {
            console.error('释放张量失败:', error);
        }
    };
    
    // ==================== 模型操作函数 ====================
    
    /**
     * 创建顺序模型
     * @returns {string} 模型ID
     */
    ext.modelCreateSequential = async function() {
        try {
            const tf = await ensureTFLoaded();
            const model = tf.sequential();
            const modelId = 'model_' + nextModelId++;
            models[modelId] = model;
            return modelId;
        } catch (error) {
            console.error('创建模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 添加密集层
     * @param {string} modelId - 模型ID
     * @param {number} units - 神经元数量
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     */
    ext.modelAddDenseLayer = async function(modelId, units, inputShapeStr, activation) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [10] 或 [28,28,3]');
                }
            }
            
            const layerConfig = {units: units};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.dense(layerConfig));
        } catch (error) {
            console.error('添加密集层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加卷积层
     * @param {string} modelId - 模型ID
     * @param {number} filters - 过滤器数量
     * @param {number} kernelSize - 核大小
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     */
    ext.modelAddConv2DLayer = async function(modelId, filters, kernelSize, inputShapeStr, activation) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null,28,28,1]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [null,28,28,1]');
                }
            }
            
            const layerConfig = {filters: filters, kernelSize: kernelSize};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.conv2d(layerConfig));
        } catch (error) {
            console.error('添加卷积层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加最大池化层
     * @param {string} modelId - 模型ID
     * @param {number} poolSize - 池大小
     */
    ext.modelAddMaxPooling2DLayer = async function(modelId, poolSize) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            model.add(tf.layers.maxPooling2d({poolSize: poolSize}));
        } catch (error) {
            console.error('添加最大池化层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加扁平层
     * @param {string} modelId - 模型ID
     */
    ext.modelAddFlattenLayer = async function(modelId) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            model.add(tf.layers.flatten());
        } catch (error) {
            console.error('添加扁平层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加重塑层
     * @param {string} modelId - 模型ID
     * @param {string} targetShapeStr - 目标形状字符串
     */
    ext.modelAddReshapeLayer = async function(modelId, targetShapeStr) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let targetShape;
            try {
                targetShape = JSON.parse(targetShapeStr);
            } catch (e) {
                throw new Error('目标形状应为JSON数组，如 [784]');
            }
            
            if (!Array.isArray(targetShape)) {
                throw new Error('目标形状必须是数组');
            }
            
            model.add(tf.layers.reshape({targetShape: targetShape}));
        } catch (error) {
            console.error('添加重塑层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加丢弃层
     * @param {string} modelId - 模型ID
     * @param {number} rate - 丢弃率 (0-1)
     */
    ext.modelAddDropoutLayer = async function(modelId, rate) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            if (rate < 0 || rate > 1) {
                throw new Error('丢弃率必须在0到1之间');
            }
            
            model.add(tf.layers.dropout({rate: rate}));
        } catch (error) {
            console.error('添加丢弃层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加激活层
     * @param {string} modelId - 模型ID
     * @param {string} activation - 激活函数
     */
    ext.modelAddActivationLayer = async function(modelId, activation) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            model.add(tf.layers.activation({activation: activation}));
        } catch (error) {
            console.error('添加激活层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加平均池化层
     * @param {string} modelId - 模型ID
     * @param {number} poolSize - 池大小
     */
    ext.modelAddAveragePooling2DLayer = async function(modelId, poolSize) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            model.add(tf.layers.averagePooling2d({poolSize: poolSize}));
        } catch (error) {
            console.error('添加平均池化层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加一维卷积层
     * @param {string} modelId - 模型ID
     * @param {number} filters - 过滤器数量
     * @param {number} kernelSize - 核大小
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     */
    ext.modelAddConv1DLayer = async function(modelId, filters, kernelSize, inputShapeStr, activation) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null,100,1]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [null,100,1]');
                }
            }
            
            const layerConfig = {filters: filters, kernelSize: kernelSize};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.conv1d(layerConfig));
        } catch (error) {
            console.error('添加一维卷积层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加LSTM层
     * @param {string} modelId - 模型ID
     * @param {number} units - 单元数
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     * @param {boolean} returnSequences - 是否返回序列
     */
    ext.modelAddLSTMLayer = async function(modelId, units, inputShapeStr, activation, returnSequences) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null,10,64]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [null,10,64]');
                }
            }
            
            const layerConfig = {units: units, returnSequences: returnSequences};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.lstm(layerConfig));
        } catch (error) {
            console.error('添加LSTM层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加GRU层
     * @param {string} modelId - 模型ID
     * @param {number} units - 单元数
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     * @param {boolean} returnSequences - 是否返回序列
     */
    ext.modelAddGRULayer = async function(modelId, units, inputShapeStr, activation, returnSequences) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null,10,64]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [null,10,64]');
                }
            }
            
            const layerConfig = {units: units, returnSequences: returnSequences};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.gru(layerConfig));
        } catch (error) {
            console.error('添加GRU层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加简单RNN层
     * @param {string} modelId - 模型ID
     * @param {number} units - 单元数
     * @param {string} inputShapeStr - 输入形状字符串
     * @param {string} activation - 激活函数
     * @param {boolean} returnSequences - 是否返回序列
     */
    ext.modelAddSimpleRNNLayer = async function(modelId, units, inputShapeStr, activation, returnSequences) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let inputShape = null;
            if (inputShapeStr !== '[null,10,64]') {
                try {
                    inputShape = JSON.parse(inputShapeStr);
                } catch (e) {
                    throw new Error('输入形状应为JSON数组，如 [null,10,64]');
                }
            }
            
            const layerConfig = {units: units, returnSequences: returnSequences};
            if (inputShape) {
                layerConfig.inputShape = inputShape;
            }
            if (activation !== 'linear') {
                layerConfig.activation = activation;
            }
            
            model.add(tf.layers.simpleRNN(layerConfig));
        } catch (error) {
            console.error('添加简单RNN层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加层归一化层
     * @param {string} modelId - 模型ID
     * @param {string} axisStr - 轴字符串
     * @param {number} epsilon - epsilon值
     */
    ext.modelAddLayerNormalizationLayer = async function(modelId, axisStr, epsilon) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let axis;
            try {
                axis = JSON.parse(axisStr);
            } catch (e) {
                axis = -1;
            }
            
            model.add(tf.layers.layerNormalization({axis: axis, epsilon: epsilon}));
        } catch (error) {
            console.error('添加层归一化层失败:', error);
            throw error;
        }
    };
    

    
    /**
     * 添加嵌入层
     * @param {string} modelId - 模型ID
     * @param {number} inputDim - 输入维度
     * @param {number} outputDim - 输出维度
     * @param {string} inputLengthStr - 输入长度字符串
     */
    ext.modelAddEmbeddingLayer = async function(modelId, inputDim, outputDim, inputLengthStr) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            const layerConfig = {inputDim: inputDim, outputDim: outputDim};
            
            if (inputLengthStr !== '[null]') {
                try {
                    const inputLength = JSON.parse(inputLengthStr);
                    if (Array.isArray(inputLength) && inputLength.length === 1) {
                        layerConfig.inputLength = inputLength[0];
                    } else if (!Array.isArray(inputLength)) {
                        layerConfig.inputLength = inputLength;
                    }
                } catch (e) {
                    // 忽略解析错误，使用默认值
                }
            }
            
            model.add(tf.layers.embedding(layerConfig));
        } catch (error) {
            console.error('添加嵌入层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加批量归一化层
     * @param {string} modelId - 模型ID
     * @param {string} axisStr - 轴字符串
     * @param {number} momentum - 动量
     * @param {number} epsilon - epsilon值
     */
    ext.modelAddBatchNormalizationLayer = async function(modelId, axisStr, momentum, epsilon) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let axis;
            try {
                axis = JSON.parse(axisStr);
            } catch (e) {
                axis = -1;
            }
            
            model.add(tf.layers.batchNormalization({axis: axis, momentum: momentum, epsilon: epsilon}));
        } catch (error) {
            console.error('添加批量归一化层失败:', error);
            throw error;
        }
    };
    
    /**
     * 添加全局平均池化层
     * @param {string} modelId - 模型ID
     */
    ext.modelAddGlobalAveragePooling2DLayer = async function(modelId) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            model.add(tf.layers.globalAveragePooling2d());
        } catch (error) {
            console.error('添加全局平均池化层失败:', error);
            throw error;
        }
    };
    
    /**
     * 编译模型
     * @param {string} modelId - 模型ID
     * @param {string} optimizer - 优化器
     * @param {string} loss - 损失函数
     * @param {string} metricsStr - 评估指标字符串
     */
    ext.modelCompile = async function(modelId, optimizer, loss, metricsStr) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            let metrics;
            try {
                metrics = JSON.parse(metricsStr);
            } catch (e) {
                metrics = ['accuracy'];
            }
            
            const optimizerMap = {
                sgd: tf.train.sgd(0.01),
                adam: tf.train.adam(0.001),
                adagrad: tf.train.adagrad(0.01),
                rmsprop: tf.train.rmsprop(0.001)
            };
            
            const selectedOptimizer = optimizerMap[optimizer] || optimizerMap.sgd;
            
            model.compile({
                optimizer: selectedOptimizer,
                loss: loss,
                metrics: metrics
            });
        } catch (error) {
            console.error('编译模型失败:', error);
            throw error;
        }
    };
    
    /**
     * 训练模型
     * @param {string} modelId - 模型ID
     * @param {string} tensorIdXs - 输入张量ID
     * @param {string} tensorIdYs - 标签张量ID
     * @param {number} epochs - 训练轮数
     * @returns {string} 训练历史字符串
     */
    ext.modelFit = async function(modelId, tensorIdXs, tensorIdYs, epochs) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            const xs = tensors[tensorIdXs];
            const ys = tensors[tensorIdYs];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            if (!xs || !ys) {
                throw new Error('输入张量或标签张量不存在');
            }
            
            const history = await model.fit(xs, ys, {
                epochs: epochs,
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        console.log(`第 ${epoch + 1} 轮: 损失 = ${logs.loss}`);
                    }
                }
            });
            
            // 返回训练历史
            const historyObj = {
                loss: history.history.loss,
                metrics: history.history
            };
            return JSON.stringify(historyObj);
        } catch (error) {
            console.error('训练模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 预测
     * @param {string} modelId - 模型ID
     * @param {string} tensorIdInput - 输入张量ID
     * @returns {string} 预测结果张量ID
     */
    ext.modelPredict = async function(modelId, tensorIdInput) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            const inputTensor = tensors[tensorIdInput];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            if (!inputTensor) {
                throw new Error('输入张量不存在');
            }
            
            const prediction = model.predict(inputTensor);
            const predictionId = 'tensor_' + nextTensorId++;
            tensors[predictionId] = prediction;
            return predictionId;
        } catch (error) {
            console.error('预测失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    // ==================== 工具函数 ====================
    
    /**
     * 获取TensorFlow.js状态
     * @returns {string} 状态信息
     */
    ext.getTFStatus = async function() {
        try {
            const tf = await ensureTFLoaded();
            return `TensorFlow.js ${tf.version.tfjs} 已加载`;
        } catch (error) {
            return 'TensorFlow.js未加载: ' + error.message;
        }
    };
    
    /**
     * 保存模型到浏览器存储
     * @param {string} modelId - 模型ID
     * @param {string} name - 模型名称
     */
    ext.modelSave = async function(modelId, name) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            // 使用localStorage保存模型
            const saveResult = await model.save(`localstorage://${name}`);
            console.log(`模型已保存: ${name}`, saveResult);
        } catch (error) {
            console.error('保存模型失败:', error);
            throw error;
        }
    };
    
    /**
     * 从浏览器存储加载模型
     * @param {string} name - 模型名称
     * @returns {string} 模型ID
     */
    ext.modelLoad = async function(name) {
        try {
            const tf = await ensureTFLoaded();
            
            // 从localStorage加载模型
            const model = await tf.loadLayersModel(`localstorage://${name}`);
            const modelId = 'model_' + nextModelId++;
            models[modelId] = model;
            return modelId;
        } catch (error) {
            console.error('加载模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 导出模型为文件
     * @param {string} modelId - 模型ID
     * @param {string} fileName - 文件名（如 model.json）
     */
    ext.modelExportToFile = async function(modelId, fileName) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            // 使用downloads://协议触发浏览器下载
            const saveResult = await model.save(`downloads://${fileName}`);
            console.log(`模型已导出为文件: ${fileName}`, saveResult);
        } catch (error) {
            console.error('导出模型失败:', error);
            throw error;
        }
    };
    
    /**
     * 获取模型的Base64编码（拓扑和权重）
     * @param {string} modelId - 模型ID
     * @returns {string} 包含topology和weights的JSON字符串
     */
    ext.modelToBase64 = async function(modelId) {
        try {
            const tf = await ensureTFLoaded();
            const model = models[modelId];
            
            if (!model) {
                throw new Error('模型不存在');
            }
            
            // 创建自定义保存处理器
            const ioHandler = tf.io.withSaveHandler(async (modelArtifacts) => {
                // 将权重数据转换为base64
                let weightsBase64 = '';
                if (modelArtifacts.weightData) {
                    weightsBase64 = arrayBufferToBase64(modelArtifacts.weightData);
                }
                
                // 将模型拓扑转换为JSON然后base64
                const topologyJSON = JSON.stringify(modelArtifacts.modelTopology);
                const topologyBase64 = btoa(encodeURIComponent(topologyJSON));
                
                // 返回包含所有必要信息的对象
                return {
                    topologyBase64: topologyBase64,
                    weightsBase64: weightsBase64,
                    weightSpecs: modelArtifacts.weightSpecs,
                    format: modelArtifacts.format,
                    generatedBy: modelArtifacts.generatedBy,
                    convertedBy: modelArtifacts.convertedBy
                };
            });
            
            // 保存模型，获取结果
            const result = await model.save(ioHandler);
            
            // 返回包含完整模型工件信息的JSON字符串
            return JSON.stringify({
                topology: result.topologyBase64,
                weights: result.weightsBase64,
                weightSpecs: result.weightSpecs,
                format: result.format,
                generatedBy: result.generatedBy,
                convertedBy: result.convertedBy
            });
        } catch (error) {
            console.error('获取模型base64失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 从Base64编码导入模型
     * @param {string} topologyBase64OrJSON - 模型拓扑的base64编码或完整的JSON字符串
     * @param {string} weightsBase64 - 权重的base64编码（如果第一个参数是JSON，此参数可选）
     * @returns {string} 模型ID
     */
    ext.modelFromBase64 = async function(topologyBase64OrJSON, weightsBase64) {
        try {
            const tf = await ensureTFLoaded();
            
            let modelArtifacts;
            
            // 尝试解析第一个参数是否为JSON（新格式）
            try {
                const parsed = JSON.parse(topologyBase64OrJSON);
                if (parsed.topology && parsed.weights) {
                    // 新格式：包含完整模型工件信息的JSON
                    const topologyJSON = decodeURIComponent(atob(parsed.topology));
                    const modelTopology = JSON.parse(topologyJSON);
                    const weightData = base64ToArrayBuffer(parsed.weights);
                    
                    modelArtifacts = {
                        modelTopology: modelTopology,
                        weightSpecs: parsed.weightSpecs || modelTopology.weights || [],
                        weightData: weightData,
                        format: parsed.format || modelTopology.format || 'layers-model',
                        generatedBy: parsed.generatedBy || modelTopology.generatedBy,
                        convertedBy: parsed.convertedBy || modelTopology.convertedBy
                    };
                } else {
                    // 不是新格式，回退到旧格式
                    throw new Error('不是新格式JSON');
                }
            } catch (jsonError) {
                // 旧格式：两个独立的base64字符串
                const topologyJSON = decodeURIComponent(atob(topologyBase64OrJSON));
                const modelTopology = JSON.parse(topologyJSON);
                const weightData = base64ToArrayBuffer(weightsBase64);
                
                // 尝试从多个位置获取权重规格
                let weightSpecs = [];
                
                // 1. 尝试从modelTopology.weights获取
                if (modelTopology.weights && Array.isArray(modelTopology.weights)) {
                    weightSpecs = modelTopology.weights;
                }
                // 2. 尝试从weightsManifest获取
                else if (modelTopology.weightsManifest && 
                         Array.isArray(modelTopology.weightsManifest) &&
                         modelTopology.weightsManifest[0] &&
                         modelTopology.weightsManifest[0].weights) {
                    weightSpecs = modelTopology.weightsManifest[0].weights;
                }
                // 3. 尝试从keras版本获取
                else if (modelTopology.keras_version && 
                         modelTopology.config && 
                         modelTopology.config.layers) {
                    // 从Keras格式的层配置中提取权重名称
                    weightSpecs = [];
                    for (const layer of modelTopology.config.layers) {
                        if (layer.config && layer.config.weights) {
                            for (const weight of layer.config.weights) {
                                weightSpecs.push({
                                    name: weight[0],
                                    shape: weight[1]
                                });
                            }
                        }
                    }
                }
                
                modelArtifacts = {
                    modelTopology: modelTopology,
                    weightSpecs: weightSpecs,
                    weightData: weightData,
                    format: modelTopology.format || 'layers-model',
                    generatedBy: modelTopology.generatedBy,
                    convertedBy: modelTopology.convertedBy
                };
            }
            
            // 验证权重规格
            if (!modelArtifacts.weightSpecs || modelArtifacts.weightSpecs.length === 0) {
                console.warn('警告：未找到权重规格，尝试使用默认权重加载');
                // 如果没有权重规格，尝试加载不包含权重的模型
                // 这种情况下模型将需要重新训练
            }
            
            // 创建自定义加载处理器
            const ioHandler = tf.io.fromMemory(modelArtifacts);
            
            // 加载模型
            const model = await tf.loadLayersModel(ioHandler);
            const modelId = 'model_' + nextModelId++;
            models[modelId] = model;
            return modelId;
        } catch (error) {
            console.error('从base64导入模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    
    /**
     * 从JSON导入模型
     * @param {string} jsonString - 包含模型拓扑和权重的JSON字符串（modelToBase64的输出格式）
     * @returns {string} 模型ID
     */
    ext.modelFromJSON = async function(jsonString) {
        try {
            // 调用现有的modelFromBase64函数，第二个参数传空字符串
            // modelFromBase64会自动检测JSON格式
            return await ext.modelFromBase64(jsonString, '');
        } catch (error) {
            console.error('从JSON导入模型失败:', error);
            return '错误: ' + error.message;
        }
    };
    

    
    /**
     * 清理所有资源
     */
    ext.cleanupAll = async function() {
        try {
            const tf = await ensureTFLoaded();
            
            // 清理所有张量
            for (const id in tensors) {
                if (tensors[id] && typeof tensors[id].dispose === 'function') {
                    try {
                        tensors[id].dispose();
                    } catch (e) {
                        console.warn('清理张量时出错:', e);
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
            
            tensors = {};
            models = {};
            nextTensorId = 1;
            nextModelId = 1;
            
            console.log('所有TensorFlow.js资源已清理');
        } catch (error) {
            console.error('清理资源失败:', error);
        }
    };
    
    /**
     * 获取版本信息
     * @returns {string} 版本信息
     */
    ext.getVersion = function() {
        return 'TensorFlow.js Turbowarp扩展 v1.0.0';
    };
    
    // ==================== 扩展注册 ====================
    
    // 注册扩展
    if (typeof ScratchExtensions !== 'undefined') {
        ScratchExtensions.register('TensorFlow', descriptor, ext);
    } else if (typeof window.TurboWarp !== 'undefined') {
        // Turbowarp兼容
        window.TurboWarp.extensions.register(descriptor, ext);
    } else {
        console.error('未找到Scratch或Turbowarp扩展系统');
    }
    
})({});
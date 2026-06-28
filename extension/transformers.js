// Name: Hugging Face Transformers
// ID: huggingfacetransformers
// Description: Run Hugging Face Transformers.js models in TurboWarp with configurable tasks, devices, and dtypes.
// By: 0.2Studio
// License: MPL-2.0
// Context: "Hugging Face" and "Transformers.js" are brand names. Model IDs, task IDs, device IDs, and dtypes such as q4f16 should not be translated.

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Hugging Face Transformers must run unsandboxed");
  }

  const MODULE_URL =
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.min.js";
  const EXTENSION_VERSION = "2.0.0";
  const LIBRARY_VERSION = "4.2.0";
  const DOCS_URI =
    "https://extensions.turbowarp.org/huggingface-transformers";
  const DEFAULT_MODEL_OPTIONS = '{"device":"auto","dtype":"auto"}';
  const EMPTY_JSON_OBJECT = "{}";

  const DEFAULT_SENTIMENT_MODEL =
    "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
  const DEFAULT_QA_MODEL = "Xenova/distilbert-base-cased-distilled-squad";
  const DEFAULT_GENERATION_MODEL = "onnx-community/SmolLM-135M-Instruct-ONNX";
  const DEFAULT_TRANSLATION_MODEL = "Xenova/t5-small";
  const DEFAULT_TRANSLATION_MODEL_OPTIONS = '{"device":"auto","dtype":"fp32"}';
  const DEFAULT_SUMMARIZATION_MODEL = "Xenova/distilbart-cnn-6-6";
  const DEFAULT_ZERO_SHOT_MODEL = "Xenova/distilbert-base-uncased-mnli";
  const DEFAULT_FILL_MASK_MODEL = "onnx-community/ettin-encoder-32m-ONNX";
  const DEFAULT_NER_MODEL = "Xenova/bert-base-multilingual-cased-ner-hrl";
  const DEFAULT_GENERIC_MODEL = "Xenova/bert-base-uncased";
  const DEFAULT_PROCESSOR_MODEL = "Xenova/clip-vit-base-patch16";
  const DEFAULT_GENERATION_MODEL_OPTIONS = '{"device":"auto","dtype":"q4"}';
  const DEFAULT_FILL_MASK_MODEL_OPTIONS = '{"device":"auto","dtype":"fp32"}';

  const SOURCE_TRANSLATIONS = {
    "zh-cn": {
      "_Candidate labels must be a JSON array or a comma-separated list.": "候选标签必须是 JSON 数组或逗号分隔列表。",
      "_Downloading {file} for {name}.": "正在为 {name} 下载 {file}。",
      "_Error: {message}": "错误：{message}",
      "_Finished loading {file} for {name}.": "已为 {name} 完成加载 {file}。",
      "_Hugging Face Transformers": "Hugging Face Transformers",
      "_Loading Transformers.js module...": "正在加载 Transformers.js 模块...",
      "_Loading {name}: {progress}%": "正在加载 {name}：{progress}%",
      "_Model": "模型",
      "_Model inputs must be a JSON object.": "模型输入必须是 JSON 对象。",
      "_Permission to fetch {url} was denied.": "没有权限获取 {url}。",
      "_Pipeline": "流水线",
      "_Preparing {file} for {name}.": "正在为 {name} 准备 {file}。",
      "_Processor": "处理器",
      "_Ready: {name}": "就绪：{name}",
      "_Retrying {name} (attempt {attempt})": "正在重试 {name}（第 {attempt} 次）",
      "_Tokenizer": "分词器",
      "_Transformers status": "Transformers 状态",
      "_Transformers.js has not been loaded yet.": "Transformers.js 尚未加载。",
      "_Transformers.js loaded, but the expected APIs were not found.": "Transformers.js 已加载，但没有找到预期的 API。",
      "_Transformers.js {libraryVersion} / extension {extensionVersion}": "Transformers.js {libraryVersion} / 扩展 {extensionVersion}",
      "_Transformers.js {version} ready.": "Transformers.js {version} 已就绪。",
      "_WebGPU supported?": "支持 WebGPU？",
      "_{label} looks like JSON but could not be parsed.": "{label} 看起来像 JSON，但无法解析。",
      "_{label} must be a JSON object.": "{label} 必须是 JSON 对象。",
      "_{label} must be a valid JSON object.": "{label} 必须是有效的 JSON 对象。",
      "_{label} not found.": "未找到 {label}。",
      "_{label} released.": "已释放 {label}。",
      "_audio classification": "音频分类",
      "_auto": "自动",
      "_automatic speech recognition": "自动语音识别",
      "_available dtypes for model [MODEL] options [OPTIONS]": "模型 [MODEL] 在选项 [OPTIONS] 下可用的数据类型",
      "_cpu": "CPU",
      "_feature extraction": "特征提取",
      "_fill mask": "填空预测",
      "_fill mask model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "填空模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_generation options": "生成选项",
      "_gpu": "GPU",
      "_image classification": "图像分类",
      "_image segmentation": "图像分割",
      "_image to text": "图像转文本",
      "_input": "输入",
      "_inputs": "输入数据",
      "_last loading progress": "上一次加载进度",
      "_library version": "库版本",
      "_load model [ID] model [MODEL] options [OPTIONS]": "加载模型 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_load pipeline [ID] task [TASK] model [MODEL] options [OPTIONS]": "加载流水线 [ID] 任务 [TASK] 模型 [MODEL] 选项 [OPTIONS]",
      "_load processor [ID] model [MODEL] options [OPTIONS]": "加载处理器 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_load tokenizer [ID] model [MODEL] options [OPTIONS]": "加载分词器 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_model options": "模型选项",
      "_named entity recognition": "命名实体识别",
      "_named entity recognition model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "命名实体识别模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_object detection": "目标检测",
      "_processor [ID] run [INPUT]": "处理器 [ID] 运行 [INPUT]",
      "_processor options": "处理器选项",
      "_question answering": "问答",
      "_question answering model [MODEL] question [QUESTION] context [CONTEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "问答模型 [MODEL] 问题 [QUESTION] 上下文 [CONTEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_registry options": "注册表选项",
      "_release all resources": "释放全部资源",
      "_release model [ID]": "释放模型 [ID]",
      "_release pipeline [ID]": "释放流水线 [ID]",
      "_release processor [ID]": "释放处理器 [ID]",
      "_release tokenizer [ID]": "释放分词器 [ID]",
      "_run model [ID] inputs [INPUTS]": "运行模型 [ID] 输入 [INPUTS]",
      "_run options": "运行选项",
      "_run pipeline [ID] input [INPUT] options [OPTIONS]": "运行流水线 [ID] 输入 [INPUT] 选项 [OPTIONS]",
      "_sentiment analysis": "情感分析",
      "_sentiment analysis model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "情感分析模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_summarization": "摘要",
      "_summarization model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "摘要模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_text classification": "文本分类",
      "_text classification model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "文本分类模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_text generation": "文本生成",
      "_text generation model [MODEL] input [INPUT] model options [MODEL_OPTIONS] generate options [GENERATE_OPTIONS]": "文本生成模型 [MODEL] 输入 [INPUT] 模型选项 [MODEL_OPTIONS] 生成选项 [GENERATE_OPTIONS]",
      "_text to audio": "文本转音频",
      "_text to text generation": "文本到文本生成",
      "_token IDs": "标记 ID",
      "_token classification": "词元分类",
      "_tokenizer [ID] decode [TOKENS]": "分词器 [ID] 解码 [TOKENS]",
      "_tokenizer [ID] encode [INPUT]": "分词器 [ID] 编码 [INPUT]",
      "_tokenizer options": "分词器选项",
      "_translation": "翻译",
      "_translation model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "翻译模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_wasm": "WASM",
      "_webgpu": "WebGPU",
      "_webnn": "WebNN",
      "_webnn cpu": "WebNN CPU",
      "_webnn gpu": "WebNN GPU",
      "_webnn npu": "WebNN NPU",
      "_zero shot classification model [MODEL] text [TEXT] labels [LABELS] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "零样本文本分类模型 [MODEL] 文本 [TEXT] 标签 [LABELS] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_zero-shot classification": "零样本文本分类",
      "_advanced: available dtypes for model [MODEL] options [OPTIONS]": "高级：模型 [MODEL] 在选项 [OPTIONS] 下可用的数据类型",
      "_advanced: fill mask model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：填空模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: load model [ID] model [MODEL] options [OPTIONS]": "高级：加载模型 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_advanced: load pipeline [ID] task [TASK] model [MODEL] options [OPTIONS]": "高级：加载流水线 [ID] 任务 [TASK] 模型 [MODEL] 选项 [OPTIONS]",
      "_advanced: load processor [ID] model [MODEL] options [OPTIONS]": "高级：加载处理器 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_advanced: load tokenizer [ID] model [MODEL] options [OPTIONS]": "高级：加载分词器 [ID] 模型 [MODEL] 选项 [OPTIONS]",
      "_advanced: named entity recognition model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：命名实体识别模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: processor [ID] run [INPUT]": "高级：处理器 [ID] 运行 [INPUT]",
      "_advanced: question answering model [MODEL] question [QUESTION] context [CONTEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：问答模型 [MODEL] 问题 [QUESTION] 上下文 [CONTEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: release all resources": "高级：释放全部资源",
      "_advanced: release model [ID]": "高级：释放模型 [ID]",
      "_advanced: release pipeline [ID]": "高级：释放流水线 [ID]",
      "_advanced: release processor [ID]": "高级：释放处理器 [ID]",
      "_advanced: release tokenizer [ID]": "高级：释放分词器 [ID]",
      "_advanced: run model [ID] inputs [INPUTS]": "高级：运行模型 [ID] 输入 [INPUTS]",
      "_advanced: run pipeline [ID] input [INPUT] options [OPTIONS]": "高级：运行流水线 [ID] 输入 [INPUT] 选项 [OPTIONS]",
      "_advanced: sentiment analysis model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：情感分析模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: summarization model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：摘要模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: text classification model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：文本分类模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: text generation model [MODEL] input [INPUT] model options [MODEL_OPTIONS] generate options [GENERATE_OPTIONS]": "高级：文本生成模型 [MODEL] 输入 [INPUT] 模型选项 [MODEL_OPTIONS] 生成选项 [GENERATE_OPTIONS]",
      "_advanced: tokenizer [ID] decode [TOKENS]": "高级：分词器 [ID] 解码 [TOKENS]",
      "_advanced: tokenizer [ID] encode [INPUT]": "高级：分词器 [ID] 编码 [INPUT]",
      "_advanced: translation model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：翻译模型 [MODEL] 文本 [TEXT] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_advanced: zero shot classification model [MODEL] text [TEXT] labels [LABELS] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]": "高级：零样本文本分类模型 [MODEL] 文本 [TEXT] 标签 [LABELS] 模型选项 [MODEL_OPTIONS] 运行选项 [RUN_OPTIONS]",
      "_analyze sentiment of [TEXT]": "分析 [TEXT] 的情感",
      "_answer [QUESTION] from [CONTEXT]": "从 [CONTEXT] 中回答 [QUESTION]",
      "_bnb4": "bnb4",
      "_classify [TEXT] with labels [LABELS]": "用标签 [LABELS] 分类 [TEXT]",
      "_fill the blank in [TEXT]": "填补 [TEXT] 中的空白",
      "_find named entities in [TEXT]": "在 [TEXT] 中查找命名实体",
      "_fp16": "fp16",
      "_fp32": "fp32",
      "_generate text from [INPUT]": "从 [INPUT] 生成文本",
      "_int8": "int8",
      "_q1": "q1",
      "_q1f16": "q1f16",
      "_q2": "q2",
      "_q2f16": "q2f16",
      "_q4": "q4",
      "_q4f16": "q4f16",
      "_q8": "q8",
      "_summarize [TEXT]": "总结 [TEXT]",
      "_translate [TEXT]": "翻译 [TEXT]",
      "_uint8": "uint8"
    }
  };

  if (Scratch.translate && Scratch.translate.setup) {
    // Raw source imports do not get the gallery build's injected translations.
    // eslint-disable-next-line extension/no-translate-setup
    Scratch.translate.setup(SOURCE_TRANSLATIONS);
  }

  const stores = {
    pipelines: new Map(),
    models: new Map(),
    tokenizers: new Map(),
    processors: new Map(),
  };

  const counters = {
    pipeline: 1,
    model: 1,
    tokenizer: 1,
    processor: 1,
  };

  let transformersModulePromise = null;
  let transformersModule = null;
  let lastErrorMessage = "";
  let lastProgressInfo = null;

  function setLastError(message) {
    lastErrorMessage = Scratch.Cast.toString(message || "");
  }

  function clearLastError() {
    lastErrorMessage = "";
  }

  function setLastProgress(info) {
    lastProgressInfo = info;
  }

  function errorMessage(error) {
    return error && error.message
      ? error.message
      : Scratch.Cast.toString(error);
  }

  function shouldRetryLoadError(error) {
    const message = errorMessage(error).toLowerCase();
    return (
      message.includes("network error") ||
      message.includes("failed to fetch") ||
      message.includes("load failed") ||
      message.includes("fetch failed")
    );
  }

  async function withRetry(load, label) {
    let lastError;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        return await load();
      } catch (error) {
        lastError = error;
        if (attempt >= 4 || !shouldRetryLoadError(error)) {
          throw error;
        }
        setLastProgress({
          context: "retry",
          name: label,
          info: {
            status: "retrying",
            attempt: attempt + 1,
            error: errorMessage(error),
          },
          timestamp: Date.now(),
        });
      }
    }
    throw lastError;
  }

  function stringifyJSON(value) {
    return JSON.stringify(serializeValue(value), null, 2);
  }

  function serializeValue(value, seen) {
    const activeSeen = seen || new WeakSet();

    if (value === null || value === undefined) {
      return value;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }
    if (typeof value === "bigint") {
      return value.toString();
    }
    if (typeof value === "function") {
      return "[Function]";
    }
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
      };
    }
    if (Array.isArray(value)) {
      return value.map((item) => serializeValue(item, activeSeen));
    }
    if (ArrayBuffer.isView(value)) {
      return serializeTypedArray(value);
    }
    if (value instanceof ArrayBuffer) {
      return {
        type: "ArrayBuffer",
        byteLength: value.byteLength,
      };
    }
    if (value instanceof URL) {
      return value.toString();
    }
    if (typeof value.tolist === "function") {
      return serializeTensorLike(value, activeSeen);
    }
    if (typeof value === "object") {
      if (activeSeen.has(value)) {
        return "[Circular]";
      }
      activeSeen.add(value);

      if (value instanceof Map) {
        const mapObject = {};
        for (const [key, entryValue] of value.entries()) {
          mapObject[key] = serializeValue(entryValue, activeSeen);
        }
        return mapObject;
      }

      const output = {};
      for (const [key, entryValue] of Object.entries(value)) {
        output[key] = serializeValue(entryValue, activeSeen);
      }
      return output;
    }

    return Scratch.Cast.toString(value);
  }

  function serializeTypedArray(array) {
    const previewLength = Math.min(array.length, 32);
    return {
      type: array.constructor.name,
      length: array.length,
      preview: Array.from(array.slice(0, previewLength), (item) =>
        typeof item === "bigint" ? item.toString() : item
      ),
      truncated: array.length > previewLength,
    };
  }

  function serializeTensorLike(tensor, seen) {
    const serialized = {
      type: "Tensor",
      dtype: tensor.type || null,
      dims: Array.isArray(tensor.dims) ? tensor.dims.slice() : null,
      size: typeof tensor.size === "number" ? tensor.size : null,
    };

    try {
      serialized.value = serializeLargeArray(tensor.tolist(), seen || new WeakSet());
    } catch (_error) {
      serialized.value = "[Tensor data omitted]";
    }

    return serialized;
  }

  function serializeLargeArray(value, seen) {
    if (!Array.isArray(value)) {
      return serializeValue(value, seen);
    }

    const previewLength = Math.min(value.length, 12);
    const preview = [];
    for (let i = 0; i < previewLength; i++) {
      preview.push(serializeLargeArray(value[i], seen));
    }

    if (value.length <= previewLength) {
      return preview;
    }

    return {
      preview,
      length: value.length,
      truncated: true,
    };
  }

  function parseJSONObject(text, label) {
    const raw = Scratch.Cast.toString(text).trim();
    if (!raw) {
      return {};
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_error) {
      throw new Error(
        Scratch.translate("{label} must be a valid JSON object.", {
          label,
        })
      );
    }

    if (!isPlainObject(parsed)) {
      throw new Error(
        Scratch.translate("{label} must be a JSON object.", {
          label,
        })
      );
    }

    return parsed;
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function looksStructured(text) {
    return (
      text.startsWith("{") ||
      text.startsWith("[") ||
      text.startsWith('"') ||
      text === "true" ||
      text === "false" ||
      text === "null" ||
      /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(text)
    );
  }

  function parseMaybeStructuredInput(text, label) {
    const raw = Scratch.Cast.toString(text).trim();
    if (!raw) {
      return "";
    }
    if (!looksStructured(raw)) {
      return Scratch.Cast.toString(text);
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      throw new Error(
        Scratch.translate("{label} looks like JSON but could not be parsed.", {
          label,
        })
      );
    }
  }

  function parseLabelList(text) {
    const raw = Scratch.Cast.toString(text).trim();
    if (!raw) {
      return [];
    }

    if (raw.startsWith("[")) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_error) {
        throw new Error(
          Scratch.translate(
            "Candidate labels must be a JSON array or a comma-separated list."
          )
        );
      }

      if (!Array.isArray(parsed)) {
        throw new Error(
          Scratch.translate(
            "Candidate labels must be a JSON array or a comma-separated list."
          )
        );
      }

      return parsed.map((item) => Scratch.Cast.toString(item));
    }

    return raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  function isTensorSpec(value) {
    return (
      isPlainObject(value) &&
      Array.isArray(value.data) &&
      Array.isArray(value.dims) &&
      typeof value.type === "string"
    );
  }

  function isNumericScalarLike(value) {
    if (typeof value === "number" || typeof value === "bigint") {
      return true;
    }
    if (typeof value === "boolean") {
      return true;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      return (
        /^-?\d+$/.test(trimmed) ||
        /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(trimmed)
      );
    }
    return false;
  }

  function isTensorArrayLike(value) {
    if (!Array.isArray(value)) {
      return isNumericScalarLike(value);
    }
    if (value.length === 0) {
      return false;
    }
    return value.every((item) => isTensorArrayLike(item));
  }

  function inferTensorDims(value) {
    const dims = [];
    let current = value;
    while (Array.isArray(current)) {
      dims.push(current.length);
      current = current[0];
    }
    return dims;
  }

  function flattenTensorArray(value, output) {
    if (Array.isArray(value)) {
      for (const item of value) {
        flattenTensorArray(item, output);
      }
      return;
    }
    output.push(value);
  }

  function inferTensorFromArray(module, value) {
    if (!isTensorArrayLike(value)) {
      return value;
    }

    const flatValues = [];
    flattenTensorArray(value, flatValues);
    if (flatValues.length === 0) {
      return value;
    }

    let hasFloat = false;
    let hasBoolean = false;
    const normalized = flatValues.map((item) => {
      if (typeof item === "boolean") {
        hasBoolean = true;
        return item ? 1 : 0;
      }
      if (typeof item === "bigint") {
        return item;
      }
      if (typeof item === "number") {
        if (!Number.isInteger(item)) {
          hasFloat = true;
        }
        return item;
      }

      const trimmed = Scratch.Cast.toString(item).trim();
      if (/^-?\d+$/.test(trimmed)) {
        return BigInt(trimmed);
      }
      if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(trimmed)) {
        const parsed = Number(trimmed);
        if (!Number.isInteger(parsed)) {
          hasFloat = true;
        }
        return parsed;
      }
      return item;
    });

    const dims = inferTensorDims(value);
    const dtype = hasBoolean ? "bool" : hasFloat ? "float32" : "int64";
    const finalValues = normalized.map((item) => {
      if (dtype === "int64") {
        return typeof item === "bigint" ? item : BigInt(item);
      }
      if (dtype === "bool") {
        return item ? 1 : 0;
      }
      return Number(item);
    });
    return new module.Tensor(dtype, finalValues, dims);
  }

  function looksLikeImageURL(value) {
    const text = Scratch.Cast.toString(value).trim();
    return (
      /^data:image\//i.test(text) ||
      /^blob:/i.test(text) ||
      (/^https?:\/\//i.test(text) &&
        /\.(png|jpe?g|webp|gif|bmp|svg)(?:[?#].*)?$/i.test(text))
    );
  }

  async function normalizeProcessorInput(module, value) {
    if (Array.isArray(value)) {
      return Promise.all(value.map((item) => normalizeProcessorInput(module, item)));
    }
    if (typeof value === "string" && looksLikeImageURL(value)) {
      try {
        return await module.RawImage.fromURL(value);
      } catch (_error) {
        return value;
      }
    }
    if (!isPlainObject(value)) {
      return value;
    }
    const output = {};
    for (const [key, entryValue] of Object.entries(value)) {
      output[key] = await normalizeProcessorInput(module, entryValue);
    }
    return output;
  }

  function convertModelInputs(module, value) {
    if (Array.isArray(value)) {
      return inferTensorFromArray(module, value);
    }

    if (!isPlainObject(value)) {
      return value;
    }

    if (isTensorSpec(value)) {
      return new module.Tensor(
        value.type,
        value.data.map((item) =>
          value.type === "int64" || value.type === "uint64"
            ? BigInt(item)
            : item
        ),
        value.dims
      );
    }

    const output = {};
    for (const [key, entryValue] of Object.entries(value)) {
      output[key] = convertModelInputs(module, entryValue);
    }
    return output;
  }

  function invokePipeline(pipeline, input, options) {
    const task = Scratch.Cast.toString(pipeline.task || "");
    const hasOptions = Object.keys(options).length > 0;

    if (
      task === "question-answering" &&
      isPlainObject(input) &&
      Object.prototype.hasOwnProperty.call(input, "question") &&
      Object.prototype.hasOwnProperty.call(input, "context")
    ) {
      return hasOptions
        ? pipeline(
            Scratch.Cast.toString(input.question),
            Scratch.Cast.toString(input.context),
            options
          )
        : pipeline(
            Scratch.Cast.toString(input.question),
            Scratch.Cast.toString(input.context)
          );
    }

    if (task === "zero-shot-classification" && isPlainObject(input)) {
      const text = Scratch.Cast.toString(
        input.text ?? input.sequence ?? input.input ?? ""
      );
      const rawLabels =
        input.candidate_labels ?? input.candidateLabels ?? input.labels;
      if (rawLabels !== undefined) {
        const labels = Array.isArray(rawLabels)
          ? rawLabels.map((item) => Scratch.Cast.toString(item))
          : parseLabelList(rawLabels);
        return hasOptions
          ? pipeline(text, labels, options)
          : pipeline(text, labels);
      }
    }

    return hasOptions ? pipeline(input, options) : pipeline(input);
  }

  function createProgressCallback(kind, name) {
    return function (info) {
      setLastProgress({
        context: kind,
        name,
        info: serializeValue(info),
        timestamp: Date.now(),
      });
    };
  }

  function ensureTransformers() {
    if (transformersModule) {
      return transformersModule;
    }
    if (transformersModulePromise) {
      return transformersModulePromise;
    }

    clearLastError();
    setLastProgress({
      context: "module",
      name: MODULE_URL,
      info: {
        status: "loading",
      },
      timestamp: Date.now(),
    });

    transformersModulePromise = (async () => {
      try {
        return await Scratch.external.importModule(
          "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.min.js"
        );
      } catch (_error) {
        return import(
          "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.min.js"
        );
      }
    })()
      .then((module) => {
        if (!module || !module.pipeline || !module.env) {
          throw new Error(
            Scratch.translate(
              "Transformers.js loaded, but the expected APIs were not found."
            )
          );
        }

        module.env.allowRemoteModels = true;
        module.env.allowLocalModels = false;
        module.env.useFS = false;
        module.env.useFSCache = false;
        module.env.useBrowserCache = true;
        module.env.useCustomCache = false;
        module.env.logLevel = module.LogLevel.ERROR;

        transformersModule = module;
        setLastProgress({
          context: "module",
          name: MODULE_URL,
          info: {
            status: "ready",
            version: module.env.version,
          },
          timestamp: Date.now(),
        });
        return module;
      })
      .catch((error) => {
        transformersModulePromise = null;
        setLastError(error.message || Scratch.Cast.toString(error));
        throw error;
      });

    return transformersModulePromise;
  }

  function withPretrainedOptions(kind, name, text) {
    const options = parseJSONObject(
      text,
      Scratch.translate("model options")
    );
    if (options.device === "auto") {
      delete options.device;
    }
    if (options.dtype === "auto") {
      delete options.dtype;
    }
    options.progress_callback = createProgressCallback(kind, name);
    return options;
  }

  function getResourceId(rawId, counterKey) {
    const requested = Scratch.Cast.toString(rawId).trim();
    if (requested) {
      return requested;
    }

    const id = counterKey + counters[counterKey];
    counters[counterKey] += 1;
    return id;
  }

  async function disposeValue(value) {
    if (value && typeof value.dispose === "function") {
      await value.dispose();
    }
  }

  async function setStoreValue(store, id, value) {
    if (store.has(id)) {
      await disposeValue(store.get(id));
    }
    store.set(id, value);
  }

  async function removeStoreValue(store, id, missingLabel, removedLabel) {
    if (!store.has(id)) {
      return Scratch.translate("{label} not found.", {
        label: missingLabel,
      });
    }

    const value = store.get(id);
    store.delete(id);
    await disposeValue(value);
    return Scratch.translate("{label} released.", {
      label: removedLabel,
    });
  }

  function requireStoreValue(store, id, label) {
    const key = Scratch.Cast.toString(id).trim();
    if (!store.has(key)) {
      throw new Error(
        Scratch.translate("{label} not found.", {
          label,
        })
      );
    }
    return store.get(key);
  }

  async function disposeAllResources() {
    for (const store of Object.values(stores)) {
      for (const value of store.values()) {
        await disposeValue(value);
      }
      store.clear();
    }
    counters.pipeline = 1;
    counters.model = 1;
    counters.tokenizer = 1;
    counters.processor = 1;
  }

  function formatLastProgress() {
    if (lastErrorMessage) {
      return Scratch.translate("Error: {message}", {
        message: lastErrorMessage,
      });
    }
    if (!lastProgressInfo) {
      return Scratch.translate("Transformers.js has not been loaded yet.");
    }

    const info = lastProgressInfo.info || {};
    switch (info.status) {
      case "loading":
        return Scratch.translate("Loading Transformers.js module...");
      case "ready":
        if (lastProgressInfo.context === "module") {
          return Scratch.translate("Transformers.js {version} ready.", {
            version: info.version || LIBRARY_VERSION,
          });
        }
        return Scratch.translate("Ready: {name}", {
          name: lastProgressInfo.name,
        });
      case "initiate":
        return Scratch.translate("Preparing {file} for {name}.", {
          file: info.file || "file",
          name: lastProgressInfo.name,
        });
      case "download":
        return Scratch.translate("Downloading {file} for {name}.", {
          file: info.file || "file",
          name: lastProgressInfo.name,
        });
      case "progress":
      case "progress_total":
        return Scratch.translate("Loading {name}: {progress}%", {
          name: lastProgressInfo.name,
          progress: Math.round(info.progress || 0),
        });
      case "retrying":
        return Scratch.translate("Retrying {name} (attempt {attempt})", {
          name: lastProgressInfo.name,
          attempt: info.attempt,
        });
      case "done":
        return Scratch.translate("Finished loading {file} for {name}.", {
          file: info.file || "file",
          name: lastProgressInfo.name,
        });
      default:
        return stringifyJSON(lastProgressInfo);
    }
  }

  async function runEphemeralPipeline(task, modelName, modelOptionsText, callArgs) {
    const module = await ensureTransformers();
    const pipelineOptions = await withPretrainedOptions(
      "pipeline",
      modelName,
      modelOptionsText
    );
    const runner = await withRetry(
      () => module.pipeline(task, modelName, pipelineOptions),
      modelName
    );
    try {
      const result = await callArgs(runner);
      return stringifyJSON(result);
    } finally {
      await disposeValue(runner);
    }
  }

  class HuggingFaceTransformersExtension {
    getInfo() {
      return {
        id: "huggingfacetransformers",
        name: Scratch.translate("Hugging Face Transformers"),
        color1: "#c7953a",
        color2: "#b4832c",
        docsURI: DOCS_URI,
        blocks: [
          {
            opcode: "getTransformersStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("Transformers status"),
            disableMonitor: true,
          },
          {
            opcode: "getLastProgress",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("last loading progress"),
            disableMonitor: true,
          },
          {
            opcode: "getVersion",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("library version"),
            disableMonitor: true,
          },
          {
            opcode: "supportsWebGPU",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("WebGPU supported?"),
          },
          "---",
          {
            opcode: "quickSentiment",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("analyze sentiment of [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "I love this movie!",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickQuestionAnswering",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("answer [QUESTION] from [CONTEXT]"),
            arguments: {
              QUESTION: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Who was Jim Henson?",
              },
              CONTEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Jim Henson was a nice puppet.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickTextGeneration",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("generate text from [INPUT]"),
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Write a short greeting.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickTranslation",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("translate [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello, world!",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickSummarization",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("summarize [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  "Transformers.js can run machine learning models directly in the browser.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickZeroShot",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("classify [TEXT] with labels [LABELS]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "This is a great movie",
              },
              LABELS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'positive, negative',
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickFillMask",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("fill the blank in [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "The quick brown [MASK] jumps over the lazy dog.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "quickNamedEntityRecognition",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("find named entities in [TEXT]"),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "John works at Google in New York.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "getAvailableDtypes",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: available dtypes for model [MODEL] options [OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_GENERATION_MODEL,
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          "---",
          {
            opcode: "createPipeline",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: load pipeline [ID] task [TASK] model [MODEL] options [OPTIONS]"
            ),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "pipeline1",
              },
              TASK: {
                type: Scratch.ArgumentType.STRING,
                menu: "taskMenu",
                defaultValue: "text-classification",
              },
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_SENTIMENT_MODEL,
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "runPipeline",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: run pipeline [ID] input [INPUT] options [OPTIONS]"
            ),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "pipeline1",
              },
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "I love Transformers.js!",
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "disposePipeline",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("advanced: release pipeline [ID]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "pipeline1",
              },
            },
          },
          "---",
          {
            opcode: "textClassification",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: text classification model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_SENTIMENT_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "I love this movie!",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_TRANSLATION_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "questionAnswering",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: question answering model [MODEL] question [QUESTION] context [CONTEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_QA_MODEL,
              },
              QUESTION: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "What is AI?",
              },
              CONTEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Artificial intelligence is a field of computer science.",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"device":"auto","dtype":"fp32"}',
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "textGeneration",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: text generation model [MODEL] input [INPUT] model options [MODEL_OPTIONS] generate options [GENERATE_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_GENERATION_MODEL,
              },
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Once upon a time,",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"device":"webgpu","dtype":"q4"}',
              },
              GENERATE_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"max_new_tokens":32,"return_full_text":false}',
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "translation",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: translation model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_TRANSLATION_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello, world!",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "summarization",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: summarization model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_SUMMARIZATION_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  "Transformers.js can run modern Hugging Face models directly in the browser.",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"max_new_tokens":64}',
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "zeroShotClassification",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: zero shot classification model [MODEL] text [TEXT] labels [LABELS] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_ZERO_SHOT_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "This is a great movie",
              },
              LABELS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '["positive","negative"]',
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "fillMask",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: fill mask model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_FILL_MASK_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "The quick brown [MASK] jumps over the lazy dog.",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "sentimentAnalysis",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: sentiment analysis model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_SENTIMENT_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "I love programming!",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "namedEntityRecognition",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: named entity recognition model [MODEL] text [TEXT] model options [MODEL_OPTIONS] run options [RUN_OPTIONS]"
            ),
            arguments: {
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_NER_MODEL,
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "John works at Google in New York.",
              },
              MODEL_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
              RUN_OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"aggregation_strategy":"simple"}',
              },
            },
            disableMonitor: true,
          },
          "---",
          {
            opcode: "loadModel",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: load model [ID] model [MODEL] options [OPTIONS]"
            ),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "model1",
              },
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_GENERIC_MODEL,
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_MODEL_OPTIONS,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "runModel",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("advanced: run model [ID] inputs [INPUTS]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "model1",
              },
              INPUTS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '{"input_ids":[[101,7592,2088,102]]}',
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "disposeModel",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("advanced: release model [ID]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "model1",
              },
            },
          },
          "---",
          {
            opcode: "loadTokenizer",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: load tokenizer [ID] model [MODEL] options [OPTIONS]"
            ),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "tokenizer1",
              },
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_GENERIC_MODEL,
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "tokenizerEncode",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("advanced: tokenizer [ID] encode [INPUT]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "tokenizer1",
              },
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello world",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "tokenizerDecode",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("advanced: tokenizer [ID] decode [TOKENS]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "tokenizer1",
              },
              TOKENS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "[101,7592,2088,102]",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "disposeTokenizer",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("advanced: release tokenizer [ID]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "tokenizer1",
              },
            },
          },
          "---",
          {
            opcode: "loadProcessor",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "advanced: load processor [ID] model [MODEL] options [OPTIONS]"
            ),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "processor1",
              },
              MODEL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_PROCESSOR_MODEL,
              },
              OPTIONS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: EMPTY_JSON_OBJECT,
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "runProcessor",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("advanced: processor [ID] run [INPUT]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "processor1",
              },
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger.jpg",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "disposeProcessor",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("advanced: release processor [ID]"),
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "processor1",
              },
            },
          },
          "---",
          {
            opcode: "cleanupAll",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("advanced: release all resources"),
          },
        ],
        menus: {
          taskMenu: {
            acceptReporters: true,
            items: [
              {
                text: Scratch.translate("text classification"),
                value: "text-classification",
              },
              {
                text: Scratch.translate("sentiment analysis"),
                value: "sentiment-analysis",
              },
              {
                text: Scratch.translate("question answering"),
                value: "question-answering",
              },
              {
                text: Scratch.translate("text generation"),
                value: "text-generation",
              },
              {
                text: Scratch.translate("translation"),
                value: "translation",
              },
              {
                text: Scratch.translate("summarization"),
                value: "summarization",
              },
              {
                text: Scratch.translate("zero-shot classification"),
                value: "zero-shot-classification",
              },
              {
                text: Scratch.translate("fill mask"),
                value: "fill-mask",
              },
              {
                text: Scratch.translate("token classification"),
                value: "token-classification",
              },
              {
                text: Scratch.translate("named entity recognition"),
                value: "ner",
              },
              {
                text: Scratch.translate("feature extraction"),
                value: "feature-extraction",
              },
              {
                text: Scratch.translate("image classification"),
                value: "image-classification",
              },
              {
                text: Scratch.translate("image to text"),
                value: "image-to-text",
              },
              {
                text: Scratch.translate("image segmentation"),
                value: "image-segmentation",
              },
              {
                text: Scratch.translate("object detection"),
                value: "object-detection",
              },
              {
                text: Scratch.translate("automatic speech recognition"),
                value: "automatic-speech-recognition",
              },
              {
                text: Scratch.translate("audio classification"),
                value: "audio-classification",
              },
              {
                text: Scratch.translate("text to audio"),
                value: "text-to-audio",
              },
              {
                text: Scratch.translate("text to text generation"),
                value: "text2text-generation",
              },
            ],
          },
          deviceMenu: {
            acceptReporters: true,
            items: [
              { text: Scratch.translate("auto"), value: "auto" },
              { text: Scratch.translate("cpu"), value: "cpu" },
              { text: Scratch.translate("wasm"), value: "wasm" },
              { text: Scratch.translate("webgpu"), value: "webgpu" },
              { text: Scratch.translate("webnn"), value: "webnn" },
              { text: Scratch.translate("webnn gpu"), value: "webnn-gpu" },
              { text: Scratch.translate("webnn cpu"), value: "webnn-cpu" },
              { text: Scratch.translate("webnn npu"), value: "webnn-npu" },
              { text: Scratch.translate("gpu"), value: "gpu" },
            ],
          },
          dtypeMenu: {
            acceptReporters: true,
            items: [
              { text: Scratch.translate("auto"), value: "auto" },
              { text: Scratch.translate("fp32"), value: "fp32" },
              { text: Scratch.translate("fp16"), value: "fp16" },
              { text: Scratch.translate("q8"), value: "q8" },
              { text: Scratch.translate("int8"), value: "int8" },
              { text: Scratch.translate("uint8"), value: "uint8" },
              { text: Scratch.translate("q4"), value: "q4" },
              { text: Scratch.translate("bnb4"), value: "bnb4" },
              { text: Scratch.translate("q4f16"), value: "q4f16" },
              { text: Scratch.translate("q2"), value: "q2" },
              { text: Scratch.translate("q2f16"), value: "q2f16" },
              { text: Scratch.translate("q1"), value: "q1" },
              { text: Scratch.translate("q1f16"), value: "q1f16" },
            ],
          },
        },
      };
    }

    getTransformersStatus() {
      return formatLastProgress();
    }

    quickSentiment(args) {
      return this.sentimentAnalysis({
        MODEL: DEFAULT_SENTIMENT_MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: DEFAULT_MODEL_OPTIONS,
        RUN_OPTIONS: EMPTY_JSON_OBJECT,
      });
    }

    quickQuestionAnswering(args) {
      return this.questionAnswering({
        MODEL: DEFAULT_QA_MODEL,
        QUESTION: args.QUESTION,
        CONTEXT: args.CONTEXT,
        MODEL_OPTIONS: DEFAULT_MODEL_OPTIONS,
        RUN_OPTIONS: EMPTY_JSON_OBJECT,
      });
    }

    quickTextGeneration(args) {
      return this.textGeneration({
        MODEL: DEFAULT_GENERATION_MODEL,
        INPUT: args.INPUT,
        MODEL_OPTIONS: DEFAULT_GENERATION_MODEL_OPTIONS,
        GENERATE_OPTIONS: '{"max_new_tokens":32,"return_full_text":false}',
      });
    }

    quickTranslation(args) {
      return this.translation({
        MODEL: DEFAULT_TRANSLATION_MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: DEFAULT_TRANSLATION_MODEL_OPTIONS,
        RUN_OPTIONS: EMPTY_JSON_OBJECT,
      });
    }

    quickSummarization(args) {
      return this.summarization({
        MODEL: DEFAULT_SUMMARIZATION_MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: '{"device":"auto","dtype":"fp32"}',
        RUN_OPTIONS: '{"max_new_tokens":64}',
      });
    }

    quickZeroShot(args) {
      return this.zeroShotClassification({
        MODEL: DEFAULT_ZERO_SHOT_MODEL,
        TEXT: args.TEXT,
        LABELS: args.LABELS,
        MODEL_OPTIONS: DEFAULT_MODEL_OPTIONS,
        RUN_OPTIONS: EMPTY_JSON_OBJECT,
      });
    }

    quickFillMask(args) {
      return this.fillMask({
        MODEL: DEFAULT_FILL_MASK_MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: DEFAULT_FILL_MASK_MODEL_OPTIONS,
        RUN_OPTIONS: EMPTY_JSON_OBJECT,
      });
    }

    quickNamedEntityRecognition(args) {
      return this.namedEntityRecognition({
        MODEL: DEFAULT_NER_MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: DEFAULT_MODEL_OPTIONS,
        RUN_OPTIONS: '{"aggregation_strategy":"simple"}',
      });
    }

    getLastProgress() {
      if (!lastProgressInfo) {
        return EMPTY_JSON_OBJECT;
      }
      return stringifyJSON(lastProgressInfo);
    }

    supportsWebGPU() {
      return typeof navigator !== "undefined" && "gpu" in navigator;
    }

    async getAvailableDtypes(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const options = parseJSONObject(
          args.OPTIONS,
          Scratch.translate("registry options")
        );
        const dtypes = await module.ModelRegistry.get_available_dtypes(
          Scratch.Cast.toString(args.MODEL),
          options
        );
        return stringifyJSON(dtypes);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async createPipeline(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const id = getResourceId(args.ID, "pipeline");
        const modelName = Scratch.Cast.toString(args.MODEL);
        const task = Scratch.Cast.toString(args.TASK);
        const options = await withPretrainedOptions(
          "pipeline",
          modelName,
          args.OPTIONS
        );
        const pipeline = await withRetry(
          () => module.pipeline(task, modelName, options),
          modelName
        );
        await setStoreValue(stores.pipelines, id, pipeline);
        setLastProgress({
          context: "pipeline",
          name: id,
          info: {
            status: "ready",
            task,
            model: modelName,
          },
          timestamp: Date.now(),
        });
        return id;
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async runPipeline(args) {
      try {
        clearLastError();
        const pipeline = requireStoreValue(
          stores.pipelines,
          args.ID,
          Scratch.translate("Pipeline")
        );
        const input = parseMaybeStructuredInput(
          args.INPUT,
          Scratch.translate("input")
        );
        const options = parseJSONObject(
          args.OPTIONS,
          Scratch.translate("run options")
        );
        const result = await invokePipeline(pipeline, input, options);
        return stringifyJSON(result);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async disposePipeline(args) {
      await removeStoreValue(
        stores.pipelines,
        Scratch.Cast.toString(args.ID).trim(),
        Scratch.translate("Pipeline"),
        Scratch.translate("Pipeline")
      );
    }

    async textClassification(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "text-classification",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), options)
              : pipeline(Scratch.Cast.toString(args.TEXT));
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async questionAnswering(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "question-answering",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(
                  Scratch.Cast.toString(args.QUESTION),
                  Scratch.Cast.toString(args.CONTEXT),
                  options
                )
              : pipeline(
                  Scratch.Cast.toString(args.QUESTION),
                  Scratch.Cast.toString(args.CONTEXT)
                );
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async textGeneration(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "text-generation",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const input = parseMaybeStructuredInput(
              args.INPUT,
              Scratch.translate("input")
            );
            const options = parseJSONObject(
              args.GENERATE_OPTIONS,
              Scratch.translate("generation options")
            );
            return Object.keys(options).length > 0
              ? pipeline(input, options)
              : pipeline(input);
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async translation(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "translation",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), options)
              : pipeline(Scratch.Cast.toString(args.TEXT));
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async summarization(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "summarization",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), options)
              : pipeline(Scratch.Cast.toString(args.TEXT));
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async zeroShotClassification(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "zero-shot-classification",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            const labels = parseLabelList(args.LABELS);
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), labels, options)
              : pipeline(Scratch.Cast.toString(args.TEXT), labels);
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async fillMask(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "fill-mask",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), options)
              : pipeline(Scratch.Cast.toString(args.TEXT));
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    sentimentAnalysis(args) {
      return this.textClassification({
        MODEL: args.MODEL,
        TEXT: args.TEXT,
        MODEL_OPTIONS: args.MODEL_OPTIONS,
        RUN_OPTIONS: args.RUN_OPTIONS,
      });
    }

    async namedEntityRecognition(args) {
      try {
        clearLastError();
        return await runEphemeralPipeline(
          "token-classification",
          Scratch.Cast.toString(args.MODEL),
          args.MODEL_OPTIONS,
          (pipeline) => {
            const options = parseJSONObject(
              args.RUN_OPTIONS,
              Scratch.translate("run options")
            );
            return Object.keys(options).length > 0
              ? pipeline(Scratch.Cast.toString(args.TEXT), options)
              : pipeline(Scratch.Cast.toString(args.TEXT), {
                  aggregation_strategy: "simple",
                });
          }
        );
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async loadModel(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const id = getResourceId(args.ID, "model");
        const modelName = Scratch.Cast.toString(args.MODEL);
        const options = await withPretrainedOptions(
          "model",
          modelName,
          args.OPTIONS
        );
        const model = await withRetry(
          () => module.AutoModel.from_pretrained(modelName, options),
          modelName
        );
        await setStoreValue(stores.models, id, model);
        setLastProgress({
          context: "model",
          name: id,
          info: {
            status: "ready",
            model: modelName,
          },
          timestamp: Date.now(),
        });
        return id;
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async runModel(args) {
      try {
        clearLastError();
        const model = requireStoreValue(
          stores.models,
          args.ID,
          Scratch.translate("Model")
        );
        const module = await ensureTransformers();
        const inputs = parseMaybeStructuredInput(
          args.INPUTS,
          Scratch.translate("inputs")
        );
        if (!isPlainObject(inputs)) {
          throw new Error(
            Scratch.translate("Model inputs must be a JSON object.")
          );
        }
        const result = await model(convertModelInputs(module, inputs));
        return stringifyJSON(result);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async disposeModel(args) {
      await removeStoreValue(
        stores.models,
        Scratch.Cast.toString(args.ID).trim(),
        Scratch.translate("Model"),
        Scratch.translate("Model")
      );
    }

    async loadTokenizer(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const id = getResourceId(args.ID, "tokenizer");
        const modelName = Scratch.Cast.toString(args.MODEL);
        const options = parseJSONObject(
          args.OPTIONS,
          Scratch.translate("tokenizer options")
        );
        options.progress_callback = createProgressCallback("tokenizer", modelName);
        const tokenizer = await withRetry(
          () => module.AutoTokenizer.from_pretrained(modelName, options),
          modelName
        );
        await setStoreValue(stores.tokenizers, id, tokenizer);
        return id;
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async tokenizerEncode(args) {
      try {
        clearLastError();
        const tokenizer = requireStoreValue(
          stores.tokenizers,
          args.ID,
          Scratch.translate("Tokenizer")
        );
        const input = parseMaybeStructuredInput(
          args.INPUT,
          Scratch.translate("input")
        );
        const result = await tokenizer(input);
        return stringifyJSON(result);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async tokenizerDecode(args) {
      try {
        clearLastError();
        const tokenizer = requireStoreValue(
          stores.tokenizers,
          args.ID,
          Scratch.translate("Tokenizer")
        );
        const tokens = parseMaybeStructuredInput(
          args.TOKENS,
          Scratch.translate("token IDs")
        );
        const decoded = await tokenizer.decode(tokens, {
          skip_special_tokens: true,
        });
        return Scratch.Cast.toString(decoded);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async disposeTokenizer(args) {
      await removeStoreValue(
        stores.tokenizers,
        Scratch.Cast.toString(args.ID).trim(),
        Scratch.translate("Tokenizer"),
        Scratch.translate("Tokenizer")
      );
    }

    async loadProcessor(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const id = getResourceId(args.ID, "processor");
        const modelName = Scratch.Cast.toString(args.MODEL);
        const options = parseJSONObject(
          args.OPTIONS,
          Scratch.translate("processor options")
        );
        options.progress_callback = createProgressCallback("processor", modelName);
        const processor = await withRetry(
          () => module.AutoProcessor.from_pretrained(modelName, options),
          modelName
        );
        await setStoreValue(stores.processors, id, processor);
        return id;
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async runProcessor(args) {
      try {
        clearLastError();
        const module = await ensureTransformers();
        const processor = requireStoreValue(
          stores.processors,
          args.ID,
          Scratch.translate("Processor")
        );
        const input = parseMaybeStructuredInput(
          args.INPUT,
          Scratch.translate("input")
        );
        const result = await processor(
          await normalizeProcessorInput(module, input)
        );
        return stringifyJSON(result);
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
        return Scratch.translate("Error: {message}", {
          message: error.message || Scratch.Cast.toString(error),
        });
      }
    }

    async disposeProcessor(args) {
      await removeStoreValue(
        stores.processors,
        Scratch.Cast.toString(args.ID).trim(),
        Scratch.translate("Processor"),
        Scratch.translate("Processor")
      );
    }

    async cleanupAll() {
      try {
        clearLastError();
        await disposeAllResources();
      } catch (error) {
        setLastError(error.message || Scratch.Cast.toString(error));
      }
    }

    getVersion() {
      return Scratch.translate(
        "Transformers.js {libraryVersion} / extension {extensionVersion}",
        {
          libraryVersion: LIBRARY_VERSION,
          extensionVersion: EXTENSION_VERSION,
        }
      );
    }
  }

  Scratch.extensions.register(new HuggingFaceTransformersExtension());
})(Scratch);

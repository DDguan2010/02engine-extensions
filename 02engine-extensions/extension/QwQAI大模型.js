class QwQAIExtension {
  constructor(runtime) {
    this.runtime = runtime;
    this.apiKey = "sk-W0rpStc95T7JVYVwDYc29IyirjtpPPby6SozFMQr17m8KWeo";
    this.apiUrl = "https://api.suanli.cn/v1";
    this.defaultModel = "free:QwQ-32B";
  }

  getInfo() {
    return {
      id: "qwqai",
      name: "QwQ AI大模型",
      blocks: [
        {
          opcode: "sendChat",
          blockType: Scratch.BlockType.REPORTER,
          text: "发送消息 [MESSAGE] 使用模型 [MODEL]",
          arguments: {
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: "如何看待人的一生"
            },
            MODEL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: this.defaultModel
            }
          }
        },
        {
          opcode: "setAPIKey",
          blockType: Scratch.BlockType.COMMAND,
          text: "设置API密钥为 [KEY]",
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: this.apiKey
            }
          }
        },
        {
          opcode: "setAPIUrl",
          blockType: Scratch.BlockType.COMMAND,
          text: "设置API地址为 [URL]",
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: this.apiUrl
            }
          }
        },
        {
          opcode: "setDefaultModel",
          blockType: Scratch.BlockType.COMMAND,
          text: "设置默认模型为 [MODEL]",
          arguments: {
            MODEL: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: this.defaultModel
            }
          }
        }
      ],
      menus: {
        models: {
          acceptReporters: true,
          items: [
            "free:QwQ-32B",
            "gpt-3.5-turbo",
            "gpt-4",
            "claude-2",
            "其他模型"
          ]
        }
      }
    };
  }

  sendChat(args) {
    const message = args.MESSAGE;
    const model = args.MODEL || this.defaultModel;
    
    return this._callAPI(message, model);
  }

  setAPIKey(args) {
    this.apiKey = args.KEY;
  }

  setAPIUrl(args) {
    this.apiUrl = args.URL;
  }

  setDefaultModel(args) {
    this.defaultModel = args.MODEL;
  }

  async _callAPI(message, model) {
    const requestData = {
      model: model,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    };

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "未收到响应";
    } catch (error) {
      console.error("调用API出错:", error);
      return `错误: ${error.message}`;
    }
  }
}


Scratch.extensions.register(new QwQAIExtension());
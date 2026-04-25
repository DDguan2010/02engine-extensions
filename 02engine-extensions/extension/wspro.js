// Name: WebSocket
// ID: gsaWebsocket
// Description: Manually connect to WebSocket servers.
// By: RedMan13 <https://scratch.mit.edu/users/RedMan13/>
// License: MIT

/* generated l10n code */Scratch.translate.setup({"fi":{"_close connection":"päätä yhteys","_close connection with code [CODE]":"päätä yhteys koodilla [CODE]","_close connection with reason [REASON] and code [CODE]":"päätä yhteys syyllä [REASON] ja koodilla [CODE]","_closing code":"päättymiskoodi","_closing message":"päättymisviesti","_connect to [URL]":"yhdistä palvelimeen [URL]","_connection errored?":"onko yhteys vikaantunut?","_is connected?":"onko yhdistetty?","_is connection closed?":"onko yhteys päättynyt?","_received message data":"vastaanotetun viestin data","_send message [PAYLOAD]":"lähetä viesti [PAYLOAD]","_when connected":"kun yhteys muodostuu","_when connection closes":"kun yhteys päättyy","_when connection errors":"kun yhteys vikaantuu","_when message received":"kun viesti vastaanotetaan"},"ja":{"_close connection":"接続を切る","_close connection with code [CODE]":"コード[CODE]で接続を切る","_close connection with reason [REASON] and code [CODE]":"理由を[REASON]にしてコード[CODE]で接続を切る","_closing code":"終了コード","_closing message":"終了メッセージ","_connect to [URL]":"[URL]に接続する","_connection errored?":"接続エラーが起きた","_is connected?":"接続された","_is connection closed?":"接続が切られた","_received message data":"受け取ったメッセージデータ","_send message [PAYLOAD]":"メッセージ[PAYLOAD]を送る","_when connected":"接続されたとき","_when connection closes":"接続が切られたとき","_when connection errors":"接続エラーが起きたとき","_when message received":"メッセージを受け取ったとき"},"ko":{"_close connection":"연결 닫기","_close connection with code [CODE]":"코드 [CODE](으)로 연결 닫기","_close connection with reason [REASON] and code [CODE]":"이유 [REASON] 코드 [CODE](으)로 연결 닫기","_closing code":"닫기 코드","_closing message":"닫기 메시지","_connect to [URL]":"[URL](으)로 연결하기","_connection errored?":"연결 오류가 발생했는가?","_is connected?":"연결되었는가?","_is connection closed?":"연결이 닫혔는가?","_received message data":"맏은 메시지 데이터","_send message [PAYLOAD]":"메시지 보내기 [PAYLOAD]","_when connected":"연결되었을 때","_when connection closes":"연결이 닫혔을 때","_when connection errors":"연결 오류가 발생했을 때","_when message received":"메시지를 받았을 때"},"ru":{"_close connection":"закрыть подключение","_close connection with code [CODE]":"закрыть подключение с кодом [CODE]","_close connection with reason [REASON] and code [CODE]":"закрыть подключение с причиной [REASON] и кодом [CODE]","_closing code":"закрывающий код","_closing message":"закрывающее сообщение","_connect to [URL]":"подключиться к [URL]","_connection errored?":"произошла ошибка подключения?","_is connected?":"подключён?","_is connection closed?":"подключение закрыто?","_received message data":"полученные данные сообщения","_send message [PAYLOAD]":"отправить сообщение [PAYLOAD]","_when connected":"когда подключился","_when connection closes":"когда подключение закрывается","_when connection errors":"когда подключение проваливается","_when message received":"когда сообщение получено"},"zh-cn":{"_close connection":"关闭连接","_close connection with code [CODE]":"以代码[CODE]关闭连接","_close connection with reason [REASON] and code [CODE]":"以理由[REASON]和代码[CODE]关闭连接","_closing code":"关闭代码","_closing message":"关闭信息","_connect to [URL]":"连接到[URL]","_connection errored?":"发生连接错误？","_is connected?":"已连接？","_is connection closed?":"连接关闭？","_received message data":"收到的信息数据","_send message [PAYLOAD]":"发送信息[PAYLOAD]","_when connected":"当建立连接","_when connection closes":"当连接关闭","_when connection errors":"当发生连接错误","_when message received":"当收到信息"}});/* end generated l10n code */(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("can not load outside unsandboxed mode");
  }

  const blobToDataURL = (blob) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () =>
        reject(new Error(`Failed to read as data URL: ${fr.error}`));
      fr.readAsDataURL(blob);
    });

  /* ------- BLOCKS -------- */
  const { BlockType, Cast, ArgumentType } = Scratch;
  const vm = Scratch.vm;
  const runtime = vm.runtime;

  /**
   * @typedef WebSocketInfo
   * @property {boolean} destroyed
   * @property {boolean} errored
   * @property {string} closeMessage
   * @property {number} closeCode
   * @property {WebSocket|null} websocket
   * @property {VM.Thread[]} connectThreads
   * @property {object[]} sendOnceConnected
   */

  /**
   * @param {unknown} exitCode
   * @return {number} a valid code that won't throw an error in WebSocket#close()
   */
  const toCloseCode = (exitCode) => {
    const casted = Cast.toNumber(exitCode);
    // Only valid values are 1000 or the range 3000-4999
    if (casted === 1000 || (casted >= 3000 && casted <= 4999)) {
      return casted;
    }
    return 1000;
  };

  /**
   * @param {unknown} reason
   * @returns {string} a valid reason that won't throw an error in WebSocket#close()
   */
  const toCloseReason = (reason) => {
    const casted = Cast.toString(reason);

    // Reason can't be longer than 123 UTF-8 bytes
    // We can't just truncate by reason.length as that would not work for eg. emoji
    const encoder = new TextEncoder();
    let encoded = encoder.encode(casted);
    encoded = encoded.slice(0, 123);

    // Now we have another problem: If the 123 byte cut-off produced invalid UTF-8, we
    // need to keep cutting off bytes until it's valid.
    const decoder = new TextDecoder();
    while (encoded.byteLength > 0) {
      try {
        const decoded = decoder.decode(encoded);
        return decoded;
      } catch (e) {
        encoded = encoded.slice(0, encoded.byteLength - 1);
      }
    }

    return "";
  };

  class WebSocketExtension {
    /**
     * no need to install runtime as it comes with Scratch var
     */
    constructor() {
      /** @type {Record<string, WebSocketInfo>} */
      this.instances = {};

      runtime.on("targetWasRemoved", (target) => {
        const instance = this.instances[target.id];
        if (instance) {
          instance.destroyed = true;
          if (instance.websocket) {
            instance.websocket.close();
          }
          delete this.instances[target.id];
        }
      });
    }
    getInfo() {
      return {
        id: "gsaWebsocket",
        // eslint-disable-next-line extension/should-translate
        name: "WebSocket",
        docsURI: "https://extensions.turbowarp.org/godslayerakp/ws",
        color1: "#307eff",
        color2: "#2c5eb0",
        blocks: [
          {
            opcode: "newInstance",
            blockType: BlockType.COMMAND,
            arguments: {
              URL: {
                type: ArgumentType.STRING,
                defaultValue: "wss://echoserver.redman13.repl.co",
              },
            },
            text: Scratch.translate("connect to [URL]"),
          },
          "---",
          {
            opcode: "onOpen",
            blockType: BlockType.EVENT,
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            text: Scratch.translate("when connected"),
          },
          {
            opcode: "isConnected",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("is connected?"),
            disableMonitor: true,
          },
          "---",
          {
            opcode: "onMessage",
            blockType: BlockType.EVENT,
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            text: Scratch.translate("when message received"),
          },
          {
            opcode: "getLastMessage",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("received message data"),
            disableMonitor: true,
          },
          "---",
          {
            opcode: "sendMessage",
            blockType: BlockType.COMMAND,
            arguments: {
              PAYLOAD: {
                type: ArgumentType.STRING,
                defaultValue: "Hello!",
              },
            },
            text: Scratch.translate("send message [PAYLOAD]"),
          },
          "---",
          {
            opcode: "onError",
            blockType: BlockType.EVENT,
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            text: Scratch.translate("when connection errors"),
          },
          {
            opcode: "hasErrored",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("connection errored?"),
            disableMonitor: true,
          },
          "---",
          {
            opcode: "onClose",
            blockType: BlockType.EVENT,
            isEdgeActivated: false,
            shouldRestartExistingThreads: true,
            text: Scratch.translate("when connection closes"),
          },
          {
            opcode: "isClosed",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("is connection closed?"),
            disableMonitor: true,
          },
          {
            opcode: "closeCode",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("closing code"),
            disableMonitor: true,
          },
          {
            opcode: "closeMessage",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("closing message"),
            disableMonitor: true,
          },
          {
            opcode: "closeWithoutReason",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("close connection"),
          },
          {
            opcode: "closeWithCode",
            blockType: BlockType.COMMAND,
            arguments: {
              CODE: {
                type: ArgumentType.NUMBER,
                defaultValue: "1000",
              },
            },
            text: Scratch.translate("close connection with code [CODE]"),
          },
          {
            opcode: "closeWithReason",
            blockType: BlockType.COMMAND,
            arguments: {
              CODE: {
                type: ArgumentType.NUMBER,
                defaultValue: "1000",
              },
              REASON: {
                type: ArgumentType.STRING,
                defaultValue: "fulfilled",
              },
            },
            text: Scratch.translate(
              "close connection with reason [REASON] and code [CODE]"
            ),
          },
        ],
      };
    }

    newInstance(args, util) {
      const target = util.target;

      let url = Cast.toString(args.URL);
      if (!/^(ws|wss):/is.test(url)) {
        // url doesnt start with a valid connection type
        // so we just assume its formated without it
        if (/^(?!(ws|http)s?:\/\/).*$/is.test(url)) {
          url = `wss://${url}`;
        } else if (/^(http|https):/is.test(url)) {
          const urlParts = url.split(":");
          urlParts[0] = url.toLowerCase().startsWith("https") ? "wss" : "ws";
          url = urlParts.join(":");
        } else {
          // we couldnt fix the url...
          return;
        }
      }

      const oldInstance = this.instances[util.target.id];
      if (oldInstance) {
        oldInstance.destroyed = true;
        if (oldInstance.websocket) {
          oldInstance.websocket.close();
        }
      }

      /** @type {WebSocketInfo} */
      const instance = {
        destroyed: false,
        errored: false,
        closeMessage: "",
        closeCode: 0,
        websocket: null,
        connectThreads: [],
        sendOnceConnected: [],
        lastMessage: ""
      };
      this.instances[util.target.id] = instance;

      return Scratch.canFetch(url)
        .then(
          (allowed) =>
            new Promise((resolve) => {
              if (!allowed) {
                throw new Error("Not allowed");
              }

              if (instance.destroyed) {
                resolve();
                return;
              }

              // canFetch() checked above
              // eslint-disable-next-line extension/check-can-fetch
              const websocket = new WebSocket(url);
              instance.websocket = websocket;

              const onStopAll = () => {
                instance.destroyed = true;
                websocket.close();
              };

              vm.runtime.on("PROJECT_STOP_ALL", onStopAll);

              const cleanup = () => {
                vm.runtime.off("PROJECT_STOP_ALL", onStopAll);

                for (const thread of instance.connectThreads) {
                  thread.status = 4; // STATUS_DONE
                }

                resolve();
              };

              websocket.onopen = (e) => {
                if (instance.destroyed) {
                  cleanup();
                  websocket.close();
                  return;
                }

                for (const item of instance.sendOnceConnected) {
                  websocket.send(item);
                }
                instance.sendOnceConnected.length = 0;

                instance.connectThreads = runtime.startHats(
                  "gsaWebsocket_onOpen",
                  null,
                  target
                );
                resolve();
              };

              websocket.onclose = (e) => {
                if (!instance.errored) {
                  instance.closeMessage = e.reason || "";
                  instance.closeCode = e.code;
                  cleanup();

                  if (!instance.destroyed) {
                    runtime.startHats("gsaWebsocket_onClose", null, target);
                  }
                }
              };

              websocket.onerror = (e) => {
                console.error("websocket error", e);
                instance.errored = true;
                cleanup();

                if (!instance.destroyed) {
                  runtime.startHats("gsaWebsocket_onError", null, target);
                }
              };

              websocket.onmessage = async (e) => {
                if (instance.destroyed) {
                  return;
                }

                let data = e.data;

                // Convert binary messages to a data: uri
                if (data instanceof Blob) {
                  data = await blobToDataURL(data);
                }

                // Store the last message and immediately trigger the event
                instance.lastMessage = data;
                runtime.startHats(
                  "gsaWebsocket_onMessage",
                  null,
                  target
                );
              };
            })
        )
        .catch((error) => {
          console.error("could not open websocket connection", error);

          instance.errored = true;
          if (!instance.destroyed) {
            runtime.startHats("gsaWebsocket_onError", null, target);
          }
        });
    }

    isConnected(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return false;
      return (
        !!instance.websocket && instance.websocket.readyState === WebSocket.OPEN
      );
    }

    getLastMessage(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return "";
      return instance.lastMessage;
    }

    isClosed(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return false;
      return instance.closeCode !== 0;
    }

    closeCode(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return 0;
      return instance.closeCode;
    }

    closeMessage(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return "";
      return instance.closeMessage;
    }

    hasErrored(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return false;
      return instance.errored;
    }

    sendMessage(args, utils) {
      const PAYLOAD = Cast.toString(args.PAYLOAD);
      const instance = this.instances[utils.target.id];
      if (!instance) return;

      if (
        !instance.websocket ||
        instance.websocket.readyState === WebSocket.CONNECTING
      ) {
        // Trying to send now will throw an error. Send it once we get connected.
        instance.sendOnceConnected.push(PAYLOAD);
      } else {
        // CLOSING and CLOSED states won't throw an error, just silently ignore
        instance.websocket.send(PAYLOAD);
      }
    }

    closeWithoutReason(_, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return;
      instance.destroyed = true;
      if (instance.websocket) {
        instance.websocket.close();
      }
    }

    closeWithCode(args, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return;
      instance.destroyed = true;
      if (instance.websocket) {
        instance.websocket.close(toCloseCode(args.CODE));
      }
    }

    closeWithReason(args, utils) {
      const instance = this.instances[utils.target.id];
      if (!instance) return;
      instance.destroyed = true;
      if (instance.websocket) {
        instance.websocket.close(
          toCloseCode(args.CODE),
          toCloseReason(args.REASON)
        );
      }
    }
  }

  // @ts-ignore
  Scratch.extensions.register(new WebSocketExtension());
})(Scratch);
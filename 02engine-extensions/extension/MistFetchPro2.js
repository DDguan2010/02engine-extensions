// Name: MistFetch
// Author: Mistium
// Description: my fetch extension for http and stuff cos i needed a better one for originOS

// License: MPL-2.0
// This Source Code is subject to the terms of the Mozilla Public License, v2.0,
// If a copy of the MPL was not distributed with this file,
// Then you can obtain one at https://mozilla.org/MPL/2.0/

(function (Scratch) {

    const Cast = Scratch.Cast;

    class MistFetch {
        constructor() {
            this.requests = {};
        }

        getInfo() {
            return {
                id: 'mistfetch',
                name: 'Mist Fetch',
                color1: "#6fa6eb",
                blocks: [
                    {
                        opcode: 'fetchUrlWithId',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '[method] [URL] with ID [ID] headers [headers] body [body]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://extensions.turbowarp.org/hello.txt'
                            },
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            },
                            headers: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            },
                            method: {
                                menu: "METHODS"
                            },
                            body: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            }
                        }
                    },
                    {
                        opcode: 'fetchUrlWithIdReporter',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[method] [URL] with ID [ID] headers [headers] body [body] and wait',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://extensions.turbowarp.org/hello.txt'
                            },
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            },
                            headers: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            },
                            method: {
                                menu: "METHODS"
                            },
                            body: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            }
                        }
                    },
                    {
                        opcode: 'getBytesById',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'bytes downloaded for ID [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'getResponseBodyById',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'response body for ID [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'getInfoById',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[INFO] for ID [ID]',
                        arguments: {
                            INFO: {
                                menu: "INFO"
                            },
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'getHeadersById',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'headers for ID [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'isRequestCompleted',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is request [ID] completed?',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'deleteRequestById',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'delete request with ID [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'deleteAllRequests',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'delete all requests',
                    },
                    {
                        opcode: 'cancelRequestById',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'cancel request with ID [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'whenIdRequestCompleted',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'when request [ID] completed',
                        isEdgeActivated: false,
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'request1'
                            }
                        }
                    },
                    {
                        opcode: 'inProgress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'all requests in progress',
                    },
                    {
                        opcode: 'all',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'full request object',
                    }
                ],
                menus: {
                    METHODS: {
                        acceptReporters: true,
                        items: ["GET", "POST", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE", "PATCH", "PURGE"]
                    },
                    INFO: {
                        acceptReporters: true,
                        items: ["PERCENT", "STATUS", "URL", "JSON", "METHOD"]
                    }
                },
            };
        }

        stringify(value) {
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return value;
        }

        fetchUrlWithId({ URL, ID, headers, method, body }) {
            ID = Cast.toString(ID)
            URL = Cast.toString(URL)

            if (this.requests[ID]) {
                return '';
            }

            let parsedHeaders = {};
            let parsedBody = null;

            if (headers) {
                try {
                    parsedHeaders = JSON.parse(Cast.toString(headers));
                } catch (e) {
                    return `Error: ${e.message}`;
                }
            }

            if (body) {
                try {
                    parsedBody = JSON.parse(Cast.toString(body));
                } catch (e) {
                    return `Error: ${e.message}`;
                }
            }

            method = method ? Cast.toString(method).toUpperCase() : 'GET';

            const controller = new AbortController();
            const signal = controller.signal;

            this.requests[ID] = { totalBytes: 0, response: '', status: 0, completed: false, contentLength: 0, url: URL, controller: controller };

            const fetchOptions = {
                method: method,
                headers: parsedHeaders,
                body: method !== 'GET' && method !== 'HEAD' ? this.stringify(parsedBody) : null,
                signal: signal
            };

            fetch(URL, fetchOptions)
                .then(response => {
                    this.requests[ID].status = response.status;
                    this.requests[ID].contentLength = parseInt(response.headers.get('Content-Length'), 10) || 0;
                    this.requests[ID].headers = response.headers;
                    
                    // 使用text()方法获取响应内容
                    return response.text();
                })
                .then(text => {
                    this.requests[ID].response = text;
                    this.requests[ID].totalBytes = text.length;
                    this.requests[ID].completed = true;
                    Scratch.vm.runtime.startHats('mistfetch_whenIdRequestCompleted', { ID: Cast.toString(ID) });
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        this.requests[ID].error = 'Fetch aborted';
                    } else {
                        this.requests[ID].error = error.message;
                    }
                    this.requests[ID].completed = true;
                });
        }

        async fetchUrlWithIdReporter({ URL, ID, headers, method, body }) {
            ID = Cast.toString(ID)
            URL = Cast.toString(URL)

            // 如果请求已存在，先删除它
            if (this.requests[ID]) {
                this.requests[ID].controller.abort();
                delete this.requests[ID];
            }

            let parsedHeaders = {};
            let parsedBody = null;

            if (headers) {
                try {
                    parsedHeaders = JSON.parse(Cast.toString(headers));
                } catch (e) {
                    return `Error: ${e.message}`;
                }
            }

            if (body) {
                try {
                    parsedBody = JSON.parse(Cast.toString(body));
                } catch (e) {
                    return `Error: ${e.message}`;
                }
            }

            method = method ? Cast.toString(method).toUpperCase() : 'GET';

            const controller = new AbortController();
            const signal = controller.signal;

            this.requests[ID] = { totalBytes: 0, response: '', status: 0, completed: false, contentLength: 0, url: URL, controller: controller };

            const fetchOptions = {
                method: method,
                headers: parsedHeaders,
                body: method !== 'GET' && method !== 'HEAD' ? this.stringify(parsedBody) : null,
                signal: signal
            };

            try {
                const response = await fetch(URL, fetchOptions);
                this.requests[ID].status = response.status;
                this.requests[ID].contentLength = parseInt(response.headers.get('Content-Length'), 10) || 0;
                this.requests[ID].headers = response.headers;
                
                // 使用text()方法获取响应内容
                const text = await response.text();
                this.requests[ID].response = text;
                this.requests[ID].totalBytes = text.length;
                this.requests[ID].completed = true;
                
                // 返回响应内容后删除请求对象
                const tempresp = this.requests[ID].response;
                delete this.requests[ID];
                return tempresp;
            } catch (error) {
                if (error.name === 'AbortError') {
                    this.requests[ID].error = 'Fetch aborted';
                } else {
                    this.requests[ID].error = error.message;
                }
                this.requests[ID].completed = true;
                
                const errorMsg = `Error: ${error.message}`;
                delete this.requests[ID];
                return errorMsg;
            }
        }

        getBytesById({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID]) {
                if (this.requests[ID].error) {
                    return `Error: ${this.requests[ID].error}`;
                }
                return this.requests[ID].totalBytes;
            }
            return '';
        }

        getResponseBodyById({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID]) {
                if (this.requests[ID].error) {
                    return `Error: ${this.requests[ID].error}`;
                }
                return this.requests[ID].response;
            }
            return '';
        }

        isRequestCompleted({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID]) {
                return this.requests[ID].completed;
            }
            return false;
        }

        deleteRequestById({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID]) {
                this.requests[ID].controller.abort();
                delete this.requests[ID];
            }
        }

        deleteAllRequests() {
            for (const ID in this.requests) {
                this.requests[ID].controller.abort();
            }
            this.requests = {};
        }

        cancelRequestById({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID]) {
                this.requests[ID].controller.abort();
                this.requests[ID].completed = true;
            }
        }

        whenIdRequestCompleted({ ID }) {
            ID = Cast.toString(ID)

            if (this.requests[ID] && this.requests[ID].completed) {
                return true;
            }
            return false;
        }

        inProgress() {
            return JSON.stringify(Object.keys(this.requests));
        }

        getInfoById({ INFO, ID }) {
            ID = Cast.toString(ID)

            if (!this.requests[ID]) return '';
            if (this.requests[ID].error) return `Error: ${this.requests[ID].error}`;

            const request = this.requests[ID];
            switch (Cast.toString(INFO)) {
                case "PERCENT":
                    if (request.contentLength > 0) {
                        return (request.totalBytes / request.contentLength) * 100;
                    }
                    return 0;
                case "STATUS":
                    return request.status ?? 0;
                case "URL":
                    return request.url ?? "";
                case "JSON":
                    return JSON.stringify(request);
                case "METHOD":
                    return request.method ?? "";
            }
            return '';
        }

        getHeadersById({ ID }) {
            ID = Cast.toString(ID)

            if (!this.requests[ID]) return '';

            if (this.requests[ID].error) {
                return `Error: ${this.requests[ID].error}`;
            }
            
            // 将Headers对象转换为普通对象
            const headersObj = {};
            if (this.requests[ID].headers) {
                this.requests[ID].headers.forEach((value, key) => {
                    headersObj[key] = value;
                });
            }
            return JSON.stringify(headersObj);
        }

        all() {
            return JSON.stringify(this.requests);
        }
    }

    // Register the extension
    Scratch.extensions.register(new MistFetch());
})(Scratch);

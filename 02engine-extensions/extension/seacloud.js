class SeacloudExtension {
    constructor() {
        this.ws = null;
        this.blocks = {};
        this.lastContent = null;
        this.userExists = null;
        this.loggedIn = false;
        this.currentUser = null;
        this.isDeveloper = false;
    }

    getInfo() {
        return {
            id: 'seacloud',
            name: 'SeaCloud',
            blocks: [
                {
                    opcode: 'connectServer',
                    blockType: 'command',
                    text: '连接到服务器',
                    func: 'connectServer'
                },
                {
                    opcode: 'registerUser',
                    blockType: 'command',
                    text: '注册 用户名 [USERNAME] 密码 [PASSWORD]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "pass" }
                    },
                    func: 'registerUser'
                },
                {
                    opcode: 'loginUser',
                    blockType: 'command',
                    text: '登录 用户名 [USERNAME] 密码 [PASSWORD]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "pass" }
                    },
                    func: 'loginUser'
                },
                {
                    opcode: 'verifyDeveloper',
                    blockType: 'command',
                    text: '验证开发者 用户名 [DEV_USERNAME] 密码 [DEV_PASSWORD]',
                    arguments: {
                        DEV_USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "dev_user" },
                        DEV_PASSWORD: { type: Scratch.ArgumentType.STRING, defaultValue: "dev_pass" }
                    },
                    func: 'verifyDeveloper'
                },
                {
                    opcode: 'uploadFile',
                    blockType: 'command',
                    text: '上传 用户名 [USERNAME] ID [FILE_ID] 内容 [CONTENT]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        FILE_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "id" },
                        CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "content" }
                    },
                    func: 'uploadFile'
                },
                {
                    opcode: 'getFile',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取 用户名 [USERNAME] ID [FILE_ID]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        FILE_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "id" }
                    },
                    func: 'getFile'
                },
                {
                    opcode: 'deleteFile',
                    blockType: 'command',
                    text: '删除 用户名 [USERNAME] ID [FILE_ID]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        FILE_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "id" }
                    },
                    func: 'deleteFile'
                },
                {
                    opcode: 'replaceFile',
                    blockType: 'command',
                    text: '替换 用户名 [USERNAME] ID [FILE_ID] 内容 [CONTENT]',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" },
                        FILE_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "id" },
                        CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "new content" }
                    },
                    func: 'replaceFile'
                },
                {
                    opcode: 'checkUserExists',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '用户 [USERNAME] 是否存在',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" }
                    },
                    func: 'checkUserExists'
                },
                {
                    opcode: 'checkLoggedIn',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '用户 [USERNAME] 是否登录',
                    arguments: {
                        USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: "user" }
                    },
                    func: 'checkLoggedIn'
                },
                {
                    opcode: 'isConnected',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '是否连接',
                    func: 'isConnected'
                }
            ]
        };
    }

    connectServer() {
        this.ws = new WebSocket("wss://seacloud-s.deep-sea.filegear-sg.me");
        console.log("🌸 尝试连接到服务器: wss://seacloud-s.deep-sea.filegear-sg.me");
        this.ws.onopen = () => {
            console.log("🌟 成功连接到SeaCloud服务器！");
        };
        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log("📬 收到服务器消息: ", response);
            if (response.action === "login" && response.status === "success") {
                this.loggedIn = true;
                this.currentUser = response.username || null;
                console.log("🔑 登录成功，当前用户: " + this.currentUser);
            } else if (response.action === "verifyDeveloper" && response.status === "success") {
                this.isDeveloper = true;
                console.log("🔐 开发者验证成功");
            } else if (response.action === "get" && response.status === "success") {
                this.lastContent = response.content;
                console.log("🍀 获取文件内容: " + this.lastContent);
            } else if (response.action === "checkUserExists") {
                this.userExists = response.exists;
                console.log("🔍 用户存在状态: " + this.userExists);
            } else if (response.action === "checkLoggedIn") {
                this.loggedIn = response.loggedIn;
                this.isDeveloper = response.isDeveloper || false;
                this.currentUser = response.username || this.currentUser;
                console.log("🔑 用户登录状态: " + this.loggedIn + ", 开发者状态: " + this.isDeveloper + ", 当前用户: " + this.currentUser);
            } else if (response.action === "delete" && response.status === "success") {
                this.lastContent = null;
                console.log("🗑️ 文件删除成功，lastContent 已清空");
            } else if (response.action === "replace" && response.status === "success") {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        action: 'get',
                        username: this.currentUser,
                        fileId: response.fileId
                    }));
                }
                console.log("🔄 文件替换成功");
            } else if (response.status === "error") {
                console.log("❌ 服务器错误: " + (response.message || "操作失败"));
            }
        };
    }

    registerUser(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("⭐ 尝试注册用户: " + args.USERNAME);
            this.ws.send(JSON.stringify({
                action: 'register',
                username: args.USERNAME,
                password: args.PASSWORD
            }));
        } else {
            console.log("❌ 服务器未连接，无法注册");
            return "服务器未连接";
        }
    }

    loginUser(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("🌟 尝试登录用户: " + args.USERNAME);
            this.ws.send(JSON.stringify({
                action: 'login',
                username: args.USERNAME,
                password: args.PASSWORD
            }));
            return "登录请求已发送";
        } else {
            console.log("❌ 服务器未连接，无法登录");
            return "服务器未连接";
        }
    }

    verifyDeveloper(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("🔐 尝试验证开发者: " + args.DEV_USERNAME);
            this.ws.send(JSON.stringify({
                action: 'verifyDeveloper',
                devUsername: args.DEV_USERNAME,
                devPassword: args.DEV_PASSWORD
            }));
            return "验证请求已发送";
        } else {
            console.log("❌ 服务器未连接，无法验证开发者");
            return "服务器未连接";
        }
    }

    uploadFile(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("当前状态 - loggedIn:", this.loggedIn, "currentUser:", this.currentUser, "isDeveloper:", this.isDeveloper);
            if (!this.loggedIn || (args.USERNAME && this.currentUser !== args.USERNAME)) {
                console.log("🚫 未登录或用户名不匹配，无法上传");
                return "请先登录用户 " + (args.USERNAME || this.currentUser) + " 以上传文件";
            }
            if (!this.isDeveloper) {
                console.log("🚫 未通过开发者验证，无法上传");
                return "请先验证开发者身份";
            }
            console.log("🌈 尝试上传文件, 用户: " + (args.USERNAME || this.currentUser) + ", ID: " + args.FILE_ID);
            this.ws.send(JSON.stringify({
                action: 'upload',
                username: this.currentUser,
                fileId: args.FILE_ID,
                content: args.CONTENT
            }));
            return "上传请求已发送";
        } else {
            console.log("⚠️ 服务器未连接，无法上传");
            return "服务器未连接";
        }
    }

    getFile(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("当前状态 - loggedIn:", this.loggedIn, "currentUser:", this.currentUser, "isDeveloper:", this.isDeveloper);
            if (!this.loggedIn || (args.USERNAME && this.currentUser !== args.USERNAME)) {
                console.log("🚫 未登录或用户名不匹配，无法获取文件");
                return "请先登录用户 " + (args.USERNAME || this.currentUser) + " 以获取文件";
            }
            if (!this.isDeveloper) {
                console.log("🚫 未通过开发者验证，无法获取文件");
                return "请先验证开发者身份";
            }
            console.log("🔍 尝试获取文件, 用户: " + (args.USERNAME || this.currentUser) + ", ID: " + args.FILE_ID);
            this.ws.send(JSON.stringify({
                action: 'get',
                username: this.currentUser,
                fileId: args.FILE_ID
            }));
            return this.lastContent || "文件未找到或未加载";
        }
        console.log("❌ 服务器未连接，无法获取文件");
        return "服务器未连接";
    }

    deleteFile(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("当前状态 - loggedIn:", this.loggedIn, "currentUser:", this.currentUser, "isDeveloper:", this.isDeveloper);
            if (!this.loggedIn || (args.USERNAME && this.currentUser !== args.USERNAME)) {
                console.log("🚫 未登录或用户名不匹配，无法删除");
                return "请先登录用户 " + (args.USERNAME || this.currentUser) + " 以删除文件";
            }
            if (!this.isDeveloper) {
                console.log("🚫 未通过开发者验证，无法删除");
                return "请先验证开发者身份";
            }
            if (!args.FILE_ID) {
                console.log("🚫 缺少文件ID");
                return "缺少文件ID";
            }
            console.log("🗑️ 尝试删除文件, 用户: " + (args.USERNAME || this.currentUser) + ", ID: " + args.FILE_ID);
            this.ws.send(JSON.stringify({
                action: 'delete',
                username: this.currentUser,
                fileId: args.FILE_ID
            }));
            return "删除请求已发送";
        } else {
            console.log("⚠️ 服务器未连接，无法删除");
            return "服务器未连接";
        }
    }

    replaceFile(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("当前状态 - loggedIn:", this.loggedIn, "currentUser:", this.currentUser, "isDeveloper:", this.isDeveloper);
            if (!this.loggedIn || (args.USERNAME && this.currentUser !== args.USERNAME)) {
                console.log("🚫 未登录或用户名不匹配，无法替换");
                return "请先登录用户 " + (args.USERNAME || this.currentUser) + " 以替换文件";
            }
            if (!this.isDeveloper) {
                console.log("🚫 未通过开发者验证，无法替换");
                return "请先验证开发者身份";
            }
            if (!args.FILE_ID || !args.CONTENT) {
                console.log("🚫 缺少文件ID或内容");
                return "缺少文件ID或内容";
            }
            console.log("🔄 尝试替换文件, 用户: " + (args.USERNAME || this.currentUser) + ", ID: " + args.FILE_ID);
            this.ws.send(JSON.stringify({
                action: 'replace',
                username: this.currentUser,
                fileId: args.FILE_ID,
                content: args.CONTENT
            }));
            return "替换请求已发送";
        } else {
            console.log("⚠️ 服务器未连接，无法替换");
            return "服务器未连接";
        }
    }

    checkUserExists(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("🔍 检查用户 " + args.USERNAME + " 是否存在");
            this.ws.send(JSON.stringify({
                action: 'checkUserExists',
                username: args.USERNAME
            }));
            return this.userExists !== null ? this.userExists : false;
        }
        console.log("❌ 服务器未连接，无法检查用户存在");
        return false;
    }

    checkLoggedIn(args) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("🔑 检查用户 " + args.USERNAME + " 是否登录");
            this.ws.send(JSON.stringify({
                action: 'checkLoggedIn',
                username: args.USERNAME
            }));
            return this.loggedIn && this.currentUser === args.USERNAME;
        }
        console.log("❌ 服务器未连接，无法检查登录状态");
        return false;
    }

    isConnected() {
        const connected = this.ws && this.ws.readyState === WebSocket.OPEN;
        console.log("🔗 连接状态: " + connected);
        return connected;
    }
}

Scratch.extensions.register(new SeacloudExtension());

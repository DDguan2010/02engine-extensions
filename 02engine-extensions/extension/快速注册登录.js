const Scratch = window.Scratch;
class QuickLoginRegisterExtension {
    constructor (runtime) {
        this.runtime = runtime;
        this._loginUser = "";
        this._loginPwd = "";
        this._loginDiv = null;
        this._loginClicked = false;
        this._regUser = "";
        this._regPwd = "";
        this._regPwdConfirm = "";
        this._regDiv = null;
        this._regClicked = false;
    }
    getInfo () {
        return {
            id: "quickLoginRegister",
            name: "快速注册/登录",
            blocks: [
                { opcode: "showLogin", blockType: Scratch.BlockType.COMMAND, text: "在舞台上显示登录界面" },
                { opcode: "loginUsername", blockType: Scratch.BlockType.REPORTER, text: "登录用户名？" },
                { opcode: "loginPassword", blockType: Scratch.BlockType.REPORTER, text: "登录密码？" },
                { opcode: "hideLogin", blockType: Scratch.BlockType.COMMAND, text: "关闭登录界面" },
                { opcode: "isLoginConfirmClicked", blockType: Scratch.BlockType.BOOLEAN, text: "登录界面按下确定键？" },
                { opcode: "showRegister", blockType: Scratch.BlockType.COMMAND, text: "在舞台上显示注册界面" },
                { opcode: "registerUsername", blockType: Scratch.BlockType.REPORTER, text: "注册用户名？" },
                { opcode: "registerPassword", blockType: Scratch.BlockType.REPORTER, text: "注册密码？" },
                { opcode: "hideRegister", blockType: Scratch.BlockType.COMMAND, text: "关闭注册界面" },
                { opcode: "registerAlert", blockType: Scratch.BlockType.COMMAND, text: "提示 [MESSAGE]",
                  arguments: { MESSAGE:{type: Scratch.ArgumentType.STRING, defaultValue:"注册/登陆成功"} } },
                { opcode: "isRegisterConfirmClicked", blockType: Scratch.BlockType.BOOLEAN, text: "注册界面按下确定键？" },
                { opcode: "getNthPart", blockType: Scratch.BlockType.REPORTER,
                  text: "将 [TEXT] 以 [DELIM] 分割，取第 [INDEX] 段",
                  arguments: {
                      TEXT: {type: Scratch.ArgumentType.STRING, defaultValue:"a,b,c,d"},
                      DELIM: {type: Scratch.ArgumentType.STRING, defaultValue:","},
                      INDEX: {type: Scratch.ArgumentType.NUMBER, defaultValue:1}
                  } }
            ]
        };
    }
    showLogin () {
        if (this._loginDiv) { this._loginDiv.style.display = "flex"; return; }
        const overlay = document.createElement("div");
        Object.assign(overlay.style,{
            position:"absolute", left:"0", top:"0", width:"100%", height:"100%",
            backgroundColor:"rgba(0,0,0,0.5)", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:"9999"
        });
        const box = document.createElement("div");
        Object.assign(box.style,{
            background:"#fff", padding:"20px", borderRadius:"8px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.2)", minWidth:"260px", color:"#000"
        });
        const title = document.createElement("h3");
        title.textContent="登录";
        title.style.marginTop="0";
        box.appendChild(title);
        const userLabel = document.createElement("label");
        userLabel.textContent="用户名：";
        const userInput = document.createElement("input");
        userInput.type="text";
        userInput.style.width="100%";
        userInput.style.marginBottom="10px";
        userInput.oninput=e=>{ this._loginUser = e.target.value; };
        box.appendChild(userLabel);
        box.appendChild(userInput);
        const passLabel = document.createElement("label");
        passLabel.textContent="密码：";
        const passInput = document.createElement("input");
        passInput.type="password";
        passInput.style.width="100%";
        passInput.style.marginBottom="10px";
        passInput.oninput=e=>{ this._loginPwd = e.target.value; };
        box.appendChild(passLabel);
        box.appendChild(passInput);
        const btn = document.createElement("button");
        btn.textContent="确定";
        btn.style.width="100%";
        btn.onclick=()=>{ this._loginClicked = true; };
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        this._loginDiv = overlay;
    }
    loginUsername () { return this._loginUser; }
    loginPassword () { return this._loginPwd; }
    hideLogin () { if (this._loginDiv){ document.body.removeChild(this._loginDiv); this._loginDiv=null; } }
    isLoginConfirmClicked () { const v=this._loginClicked; this._loginClicked=false; return v; }
    showRegister () {
        if (this._regDiv) { this._regDiv.style.display = "flex"; return; }
        const overlay = document.createElement("div");
        Object.assign(overlay.style,{
            position:"absolute", left:"0", top:"0", width:"100%", height:"100%",
            backgroundColor:"rgba(0,0,0,0.5)", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:"9999"
        });
        const box = document.createElement("div");
        Object.assign(box.style,{
            background:"#fff", padding:"20px", borderRadius:"8px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.2)", minWidth:"260px", color:"#000"
        });
        const title = document.createElement("h3");
        title.textContent="注册";
        title.style.marginTop="0";
        box.appendChild(title);
        const userLabel = document.createElement("label");
        userLabel.textContent="用户名：";
        const userInput = document.createElement("input");
        userInput.type="text";
        userInput.style.width="100%";
        userInput.style.marginBottom="10px";
        userInput.oninput=e=>{ this._regUser = e.target.value; };
        box.appendChild(userLabel);
        box.appendChild(userInput);
        const passLabel = document.createElement("label");
        passLabel.textContent="密码：";
        const passInput = document.createElement("input");
        passInput.type="password";
        passInput.style.width="100%";
        passInput.style.marginBottom="10px";
        passInput.oninput=e=>{ this._regPwd = e.target.value; };
        box.appendChild(passLabel);
        box.appendChild(passInput);
        const confirmLabel = document.createElement("label");
        confirmLabel.textContent="确认密码：";
        const confirmInput = document.createElement("input");
        confirmInput.type="password";
        confirmInput.style.width="100%";
        confirmInput.style.marginBottom="10px";
        confirmInput.oninput=e=>{ this._regPwdConfirm = e.target.value; };
        box.appendChild(confirmLabel);
        box.appendChild(confirmInput);
        const btn = document.createElement("button");
        btn.textContent="确定";
        btn.style.width="100%";
        btn.onclick=()=>{  
            if (this._regPwd !== this._regPwdConfirm) {
                alert("两次输入的密码不一致，请重新输入。");
                this._regPwd = ""; this._regPwdConfirm = "";
                passInput.value = ""; confirmInput.value = "";
                return;
            }
            this._regClicked = true;
        };
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        this._regDiv = overlay;
    }
    registerUsername () { return this._regUser; }
    registerPassword () { return this._regPwd; }
    hideRegister () { if (this._regDiv){ document.body.removeChild(this._regDiv); this._regDiv=null; } }
    registerAlert (args) { alert(args.MESSAGE); }
    isRegisterConfirmClicked () { const v=this._regClicked; this._regClicked=false; return v; }
    getNthPart (args) {
        const text = String(args.TEXT);
        const delim = String(args.DELIM);
        const index = Math.max(1, Math.floor(Number(args.INDEX)));
        const parts = text.split(delim);
        return index <= parts.length ? parts[index - 1] : "";
    }
}
Scratch.extensions.register(new QuickLoginRegisterExtension());


// By: 10000why

(function (Scratch) {
  'use strict';

  /* ---------- 默认配置 ---------- */
  const CFG = {
    size: 60,
    gap: 4,
    alpha: 0.9,
    round: 50,
    glow: 12,
    marginRight: 16,
    marginBottom: 16,
    arrowColor: '#ffffff'
  };

  let panel, buttons = {};
  let cfg = { ...CFG };

  /* ---------- 工具 ---------- */
  const pressKey = (key, down) =>
    Scratch.vm.postIOData('keyboard', { key, isDown: down });

  const updatePosition = () => {
    if (!panel) return;
    panel.style.left =
      window.innerWidth -
      cfg.size * 3 -
      cfg.gap * 2 -
      cfg.marginRight +
      'px';
    panel.style.top =
      window.innerHeight -
      cfg.size * 3 -
      cfg.gap * 2 -
      cfg.marginBottom +
      'px';
  };

  const createPad = () => {
    if (panel) return;

    panel = document.createElement('div');
    panel.style.cssText = `
      position:fixed; display:grid; gap:${cfg.gap}px;
      grid-template-columns:repeat(3,${cfg.size}px);
      grid-template-rows:repeat(3,${cfg.size}px);
      pointer-events:none; z-index:10000;
    `;
    document.body.appendChild(panel);

    const dirs = [
      { id:'up',    key:'ArrowUp',    label:'↑', row:1, col:2 },
      { id:'down',  key:'ArrowDown',  label:'↓', row:3, col:2 },
      { id:'left',  key:'ArrowLeft',  label:'←', row:2, col:1 },
      { id:'right', key:'ArrowRight', label:'→', row:2, col:3 }
    ];

    dirs.forEach(d => {
      const btn = document.createElement('button');
      btn.innerText = d.label;
      btn.style.cssText = `
        grid-row:${d.row}; grid-column:${d.col};
        width:${cfg.size}px; height:${cfg.size}px;
        border:none; border-radius:${cfg.round}%;
        font-size:${cfg.size*0.45}px; font-weight:bold;
        color:${cfg.arrowColor};
        background:rgba(0,0,0,${1-cfg.alpha});
        box-shadow:0 0 ${cfg.glow}px ${cfg.arrowColor};
        cursor:pointer; transition:transform .2s, box-shadow .4s;
        pointer-events:auto;
        overflow:hidden; position:relative;
      `;

      /* ---------- 美化特效 ---------- */
      // 1. 呼吸阴影
      btn.animate(
        [
          { boxShadow: `0 0 ${cfg.glow}px ${cfg.arrowColor}` },
          { boxShadow: `0 0 ${cfg.glow * 2}px ${cfg.arrowColor}` },
          { boxShadow: `0 0 ${cfg.glow}px ${cfg.arrowColor}` }
        ],
        { duration: 2000, iterations: Infinity }
      );

      // 2. 悬停放大
      btn.addEventListener('mouseenter', () => {
        if (!btn.dataset.down) btn.style.transform = 'scale(1.08)';
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.dataset.down) btn.style.transform = 'scale(1)';
      });

      // 3. 点击水波纹
      btn.addEventListener('mousedown', e => {
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
          position:absolute; border-radius:50%; background:#fff3;
          transform:scale(0); pointer-events:none;
          width:${size}px; height:${size}px;
          left:${e.clientX - rect.left - size/2}px;
          top:${e.clientY - rect.top - size/2}px;
          transition:transform .6s, opacity .6s;
        `;
        btn.appendChild(ripple);
        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(2)';
          ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 600);
      });

      /* ---------- 长按连续触发 ---------- */
      let isDown = false, repeatTimer = null;
      const REPEAT_DELAY = 200, REPEAT_RATE = 60;

      const down = () => {
        if (isDown) return;
        isDown = true;
        btn.dataset.down = '1';
        btn.style.transform = 'scale(0.85)';
        btn.style.background = 'rgba(0,0,0,0.5)';
        pressKey(d.key, true);

        repeatTimer = setInterval(() => {
          pressKey(d.key, false);
          pressKey(d.key, true);
        }, REPEAT_RATE);
      };

      const up = () => {
        if (!isDown) return;
        isDown = false;
        delete btn.dataset.down;
        clearInterval(repeatTimer);
        repeatTimer = null;
        btn.style.transform = 'scale(1)';
        btn.style.background = `rgba(0,0,0,${1-cfg.alpha})`;
        pressKey(d.key, false);
      };

      btn.addEventListener('mousedown', down);
      btn.addEventListener('mouseup', up);
      btn.addEventListener('mouseleave', up);
      btn.addEventListener('touchstart', e => { e.preventDefault(); down(); });
      btn.addEventListener('touchend',   e => { e.preventDefault(); up(); });
      btn.addEventListener('touchcancel', e => { e.preventDefault(); up(); });

      panel.appendChild(btn);
      buttons[d.id] = btn;
    });

    updatePosition();
  };

  const destroyPad = () => {
    if (panel) { panel.remove(); panel = null; }
    buttons = {};
  };

  /* ---------- 积木 ---------- */
  class RainbowDirPad {
    getInfo() {
      return {
        id: 'rainbowDirPad',
        name: '方向猫',
        color1: '#8e24aa',
        color2: '#6a1b9a',
        blocks: [
          { opcode:'show', blockType:Scratch.BlockType.COMMAND, text:'显示方向键' },
          { opcode:'hide', blockType:Scratch.BlockType.COMMAND, text:'隐藏方向键' },
          { opcode:'setMargin', blockType:Scratch.BlockType.COMMAND,
            text:'设置右下角边距 右:[R]px 下:[B]px',
            arguments:{
              R:{type:Scratch.ArgumentType.NUMBER,defaultValue:16},
              B:{type:Scratch.ArgumentType.NUMBER,defaultValue:16}
            }
          },
          { opcode:'setColor', blockType:Scratch.BlockType.COMMAND,
            text:'设置箭头颜色 [COLOR]',
            arguments:{ COLOR:{type:Scratch.ArgumentType.COLOR,defaultValue:'#ffffff'} } },
          { opcode:'setSize', blockType:Scratch.BlockType.COMMAND,
            text:'设置按钮大小 [SIZE]',
            arguments:{ SIZE:{type:Scratch.ArgumentType.NUMBER,defaultValue:60} } },
          { opcode:'isPressed', blockType:Scratch.BlockType.BOOLEAN,
            text:'方向键 [DIR] 被按下？',
            arguments:{ DIR:{type:Scratch.ArgumentType.STRING,menu:'dirMenu',defaultValue:'up'} } }
        ],
        menus:{
          dirMenu:{ acceptReporters:false, items:['up','down','left','right'] }
        }
      };
    }

    show() { createPad(); }
    hide() { destroyPad(); }

    setMargin(args) {
      cfg.marginRight  = Math.max(0, Scratch.Cast.toNumber(args.R));
      cfg.marginBottom = Math.max(0, Scratch.Cast.toNumber(args.B));
      updatePosition();
    }

    setColor(args) {
      cfg.arrowColor = Scratch.Cast.toString(args.COLOR);
      Object.values(buttons).forEach(b => {
        b.style.color = cfg.arrowColor;
        b.style.boxShadow = `0 0 ${cfg.glow}px ${cfg.arrowColor}`;
      });
    }

    setSize(args) {
      cfg.size = Math.max(20, Math.min(200, Scratch.Cast.toNumber(args.SIZE)));
      destroyPad(); createPad();
    }

    isPressed(args) {
      const map = {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};
      return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsDown(map[args.DIR]);
    }
  }

  Scratch.extensions.register(new RainbowDirPad());
})(Scratch);
//by b站的 10000why制作
(function (Scratch) {
  'use strict';

  const request = async (url) => {
    const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('network');
    return res.json();
  };

  class BiliBiliExt {
    getInfo() {
      return {
        id: 'biliMulti',
        name: 'B小猫',
        color1: '#3B8BEE',          // 蓝色主色
        color2: '#2A6BC5',          // 蓝色辅色
        color3: '#3B8BEE',
        menuIconURI: 'https://yunpa.vip/%E5%9B%BE%E7%89%87%E5%90%88%E9%9B%86/10000why.svg',
        blockIconURI: 'https://yunpa.vip/%E5%9B%BE%E7%89%87%E5%90%88%E9%9B%86/10000why.svg',
        docsURI: 'https://yunpa.vip/10000why扩展文档/',
        blocks: [
          // 1. 粉丝数
          {
            opcode: 'getFan',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 的粉丝数',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 2. 关注数
          {
            opcode: 'getFollow',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 的关注数',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 3. 拉黑数
          {
            opcode: 'getBlack',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 的拉黑数',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 4. 投稿视频数
          {
            opcode: 'getVideoCount',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 的投稿视频数',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 5. 历史获赞
          {
            opcode: 'getLiked',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 历史获赞总量',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 6. 是否正在直播
          {
            opcode: 'isLive',
            blockType: Scratch.BlockType.REPORTER,
            text: '[UID] 是否直播中',
            arguments: { UID: { type: Scratch.ArgumentType.STRING, defaultValue: '541080936' } }
          },
          // 7. 视频信息
          {
            opcode: 'videoInfo',
            blockType: Scratch.BlockType.REPORTER,
            text: '视频 [BVID] 信息',
            arguments: { BVID: { type: Scratch.ArgumentType.STRING, defaultValue: 'BV1arpEz2EcE' } }
          },
          // 8. 直播间在线
          {
            opcode: 'liveOnline',
            blockType: Scratch.BlockType.REPORTER,
            text: '直播间 [ROOM] 在线人数',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: '21452505' } }
          },
          // 9. 分区日榜 TOP1 标题
          {
            opcode: 'rankTop1',
            blockType: Scratch.BlockType.REPORTER,
            text: '分区 [RID] 日榜 TOP1 标题',
            arguments: { RID: { type: Scratch.ArgumentType.STRING, defaultValue: '0' } }
          },
          // 10. 视频热评（改造版）
          {
            opcode: 'hotComment',
            blockType: Scratch.BlockType.REPORTER,
            text: '获取 [BVID] 热评 [COUNT] 条以 [SEP] 的形式分开每句',
            arguments: {
              BVID: { type: Scratch.ArgumentType.STRING, defaultValue: 'BV1arpEz2EcE' },
              COUNT: {
                type: Scratch.ArgumentType.STRING,
                menu: 'countMenu',
                defaultValue: '1'
              },
              SEP: {
                type: Scratch.ArgumentType.STRING,
                menu: 'sepMenu',
                defaultValue: '换行'
              }
            }
          },
          // 11. 随机 B 站 Emoji
          {
            opcode: 'randEmoji',
            blockType: Scratch.BlockType.REPORTER,
            text: '随机 B 站 Emoji'
          }
        ],
        menus: {
          countMenu: {
            acceptReporters: false,
            items: [{ text: '1', value: '1' }, { text: '2', value: '2' }, { text: '3', value: '3' }]
          },
          sepMenu: {
            acceptReporters: false,
            items: [{ text: '换行', value: '换行' }, { text: '空格', value: '空格' }, { text: '逗号', value: '逗号' }, { text: '无', value: '无' }]
          }
        }
      };
    }

    /* ---------- 功能实现 ---------- */
    async getFan(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${args.UID}`);
        return json.code === 0 ? json.data.follower : '获取失败';
      } catch { return '获取失败'; }
    }

    async getFollow(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${args.UID}`);
        return json.code === 0 ? json.data.following : '获取失败';
      } catch { return '获取失败'; }
    }

    async getBlack(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/relation/stat?vmid=${args.UID}`);
        return json.code === 0 ? json.data.black : '获取失败';
      } catch { return '获取失败'; }
    }

    async getVideoCount(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/space/navnum?mid=${args.UID}`);
        return json.code === 0 ? json.data.video : '获取失败';
      } catch { return '获取失败'; }
    }

    async getLiked(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/space/upstat?mid=${args.UID}`);
        return json.code === 0 ? json.data.likes : '获取失败';
      } catch { return '获取失败'; }
    }

    async isLive(args) {
      try {
        const json = await request(`https://api.live.bilibili.com/room/v1/Room/getRoomIdByUid?uid=${args.UID}`);
        if (json.code !== 0) return '未开通直播间';
        const roomId = json.data.room_id;
        const info = await request(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`);
        return info.code === 0 && info.data.live_status === 1 ? '直播中' : '未直播';
      } catch { return '获取失败'; }
    }

    async videoInfo(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/web-interface/view?bvid=${args.BVID}`);
        if (json.code !== 0) return '视频不存在';
        const d = json.data, s = d.stat;
        return `标题：${d.title} | 播放：${s.view} | 弹幕：${s.danmaku} | 点赞：${s.like}`;
      } catch { return '获取失败'; }
    }

    async liveOnline(args) {
      try {
        const json = await request(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${args.ROOM}`);
        return json.code === 0 ? json.data.online : '获取失败';
      } catch { return '获取失败'; }
    }

    async rankTop1(args) {
      try {
        const json = await request(`https://api.bilibili.com/x/web-interface/ranking/v2?rid=${args.RID}&type=all`);
        return (json.code === 0 && json.data.list[0]) ? json.data.list[0].title : '获取失败';
      } catch { return '获取失败'; }
    }

    // 改造后的热评积木
    async hotComment(args) {
      try {
        const oid = args.BVID;
        const ps = Math.min(3, Math.max(1, parseInt(args.COUNT, 10) || 1));
        const json = await request(`https://api.bilibili.com/x/v2/reply?type=1&oid=${oid}&sort=2&ps=${ps}`);
        if (json.code !== 0 || !json.data.replies) return '获取失败';
        const map = { '换行': '\n', '空格': ' ', '逗号': '，', '无': '' };
        const sep = map[args.SEP] ?? '\n';
        return json.data.replies.map(r => r.content.message).join(sep);
      } catch { return '获取失败'; }
    }

    randEmoji() {
      const pool = ['(｡>∀<｡)', '(￣▽￣)', '(°∀°)ﾉ', '(╯°口°)╯', '(｡･ω･｡)', '(*´▽`*)', '(=・ω・=)', '(￣﹃￣)', '╮(￣▽￣)╭', '(￣ε￣；)'];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  Scratch.extensions.register(new BiliBiliExt());
})(Scratch);
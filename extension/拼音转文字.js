(function (Scratch) {
  'use strict';

  class OnlinePinyinIME {
    constructor () {
      this.lastResult = [];
    }

    getInfo () {
      return {
        id: 'onlinePinyinIME',
        color1: '#ffa74a',
        name: '拼音转文字',
        blocks: [
          {
            opcode: 'searchPinyin',
            blockType: Scratch.BlockType.REPORTER,
            text: '拼音 [PINYIN] 对应的字',
            arguments: {
              PINYIN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'niganma'
              }
            }
          },
          {
            opcode: 'firstChar',
            blockType: Scratch.BlockType.REPORTER,
            text: '第一个返回字'
          },
          {
            opcode: 'nthChar',
            blockType: Scratch.BlockType.REPORTER,
            text: '第 [N] 返回字',
            arguments: {
              N: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          }
        ]
      };
    }

    async searchPinyin (args) {
      const pinyin = encodeURIComponent(args.PINYIN.trim());
      if (!pinyin) return '';

      try {
        const url =
          'https://inputtools.google.com/request?text=' +
          pinyin +
          '&itc=zh-t-i0-pinyin&num=10';

        const res = await fetch(url);
        const json = await res.json();

        if (json[0] !== 'SUCCESS') {
          this.lastResult = [];
          return '';
        }

        const words = json[1][0][1];
        this.lastResult = words;

        return words.join(' ');
      } catch (e) {
        console.error(e);
        this.lastResult = [];
        return '';
      }
    }

    firstChar () {
      return this.lastResult[0] || '';
    }

    nthChar (args) {
      const n = Math.floor(args.N) - 1;
      return this.lastResult[n] || '';
    }
  }

  Scratch.extensions.register(new OnlinePinyinIME());
})(Scratch);

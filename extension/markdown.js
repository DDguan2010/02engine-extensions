// ==TurboWarp==
// @name WitCatMarkDown
// @version 1.2.0
// @description 更优雅的文本框 / Make your text box more colorful (支持动态解析规则)
// @homepage https://www.ccw.site/student/6173f57f48cf8f4796fc860e
// @author 白猫 @ CCW
// ==/TurboWarp==

(function(Scratch) {
  'use strict';

  /* eslint-disable */
  // ==================== Markdown 解析器部分（增强版） ====================
  let markdownExpose = {};

  (function () {
    var Markdown = (markdownExpose.Markdown = function (dialect) {
      switch (typeof dialect) {
        case "undefined":
          this.dialect = Markdown.dialects.Gruber;
          break;
        case "object":
          this.dialect = dialect;
          break;
        default:
          if (dialect in Markdown.dialects) {
            this.dialect = Markdown.dialects[dialect];
          } else {
            throw new Error("Unknown Markdown dialect '" + String(dialect) + "'");
          }
          break;
      }
      this.em_state = [];
      this.strong_state = [];
      this.debug_indent = "";
    });

    markdownExpose.parse = function (source, dialect) {
      var md = new Markdown(dialect);
      return md.toTree(source);
    };

    markdownExpose.toHTML = function toHTML(source, dialect, options) {
      var input = markdownExpose.toHTMLTree(source, dialect, options);
      return markdownExpose.renderJsonML(input);
    };

    markdownExpose.toHTMLTree = function toHTMLTree(input, dialect, options) {
      if (typeof input === "string") input = this.parse(input, dialect);
      var attrs = extract_attr(input),
        refs = {};
      if (attrs && attrs.references) {
        refs = attrs.references;
      }
      var html = convert_tree_to_html(input, refs, options);
      merge_text_nodes(html);
      return html;
    };

    var mk_block = (Markdown.mk_block = function (block, trail, line) {
      if (arguments.length == 1) trail = "\n\n";
      var s = new String(block);
      s.trailing = trail;
      s.inspect = function () {
        return "Markdown.mk_block(" + JSON.stringify(this.toString()) + ", " + JSON.stringify(this.trailing) + ", " + JSON.stringify(this.lineNumber) + ")";
      };
      if (line != undefined) s.lineNumber = line;
      return s;
    });

    Markdown.prototype.split_blocks = function splitBlocks(input, startLine) {
      input = input.replace(/(\r\n|\n|\r)/g, "\n");
      var re = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,
        blocks = [],
        m;
      var line_no = 1;
      if ((m = /^(\s*\n)/.exec(input)) != null) {
        line_no += count_lines(m[0]);
        re.lastIndex = m[0].length;
      }
      while ((m = re.exec(input)) !== null) {
        if (m[2] == "\n#") {
          m[2] = "\n";
          re.lastIndex--;
        }
        blocks.push(mk_block(m[1], m[2], line_no));
        line_no += count_lines(m[0]);
      }
      return blocks;
    };

    function count_lines(str) {
      var n = 0,
        i = -1;
      while ((i = str.indexOf("\n", i + 1)) !== -1) n++;
      return n;
    }

    Markdown.prototype.processBlock = function processBlock(block, next) {
      var cbs = this.dialect.block,
        ord = cbs.__order__;
      if ("__call__" in cbs) {
        return cbs.__call__.call(this, block, next);
      }
      for (var i = 0; i < ord.length; i++) {
        var res = cbs[ord[i]].call(this, block, next);
        if (res) {
          return res;
        }
      }
      return [];
    };

    Markdown.prototype.processInline = function processInline(block) {
      return this.dialect.inline.__call__.call(this, String(block));
    };

    Markdown.prototype.toTree = function toTree(source, custom_root) {
      var blocks = source instanceof Array ? source : this.split_blocks(source);
      var old_tree = this.tree;
      try {
        this.tree = custom_root || this.tree || ["markdown"];
        blocks: while (blocks.length) {
          var b = this.processBlock(blocks.shift(), blocks);
          if (!b.length) continue blocks;
          this.tree.push.apply(this.tree, b);
        }
        return this.tree;
      } finally {
        if (custom_root) {
          this.tree = old_tree;
        }
      }
    };

    Markdown.prototype.debug = function () {};

    Markdown.prototype.loop_re_over_block = function (re, block, cb) {
      var m,
        b = block.valueOf();
      while (b.length && (m = re.exec(b)) != null) {
        b = b.substr(m[0].length);
        cb.call(this, m);
      }
      return b;
    };

    Markdown.dialects = {};

    Markdown.dialects.Gruber = {
      block: {
        atxHeader: function atxHeader(block, next) {
          var m = block.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/);
          if (!m) return undefined;
          var header = ["header", { level: m[1].length }];
          Array.prototype.push.apply(header, this.processInline(m[2]));
          if (m[0].length < block.length)
            next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + 2));
          return [header];
        },

        setextHeader: function setextHeader(block, next) {
          var m = block.match(/^(.*)\n([-=])\2\2+(?:\n|$)/);
          if (!m) return undefined;
          var level = m[2] === "=" ? 1 : 2;
          var header = ["header", { level: level }, m[1]];
          if (m[0].length < block.length)
            next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + 2));
          return [header];
        },

        // ====== 新增：围栏代码块 ======
        fencedCode: function fencedCode(block, next) {
          var m = block.match(/^(`{3,}|~{3,})[ \t]*(\S+)?[ \t]*\n([\s\S]*?)\n[ \t]*\1[ \t]*(?:\n|$)/);
          if (!m) return undefined;
          var fence = m[1];
          var lang = m[2] || "";
          var code = m[3];
          var attrs = {};
          if (lang) attrs.language = lang;
          var consumedLines = count_lines(m[0]);
          if (m[0].length < block.length) {
            next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + consumedLines));
          }
          return [["fenced_code", attrs, code]];
        },

        // ====== 原有：缩进代码块 ======
        code: function code(block, next) {
          var ret = [],
            re = /^(?: {0,3}\t| {4})(.*)\n?/;
          if (!block.match(re)) return undefined;
          block_search: do {
            var b = this.loop_re_over_block(re, block.valueOf(), function (m) {
              ret.push(m[1]);
            });
            if (b.length) {
              next.unshift(mk_block(b, block.trailing));
              break block_search;
            } else if (next.length) {
              ret.push(block.trailing.replace(/[^\n]/g, "").substring(2));
              block = next.shift();
            } else {
              break block_search;
            }
          } while (true);
          return [["code_block", ret.join("\n")]];
        },

        horizRule: function horizRule(block, next) {
          var m = block.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/);
          if (!m) return undefined;
          var jsonml = [["hr"]];
          if (m[1]) {
            jsonml.unshift.apply(jsonml, this.processBlock(m[1], []));
          }
          if (m[3]) {
            next.unshift(mk_block(m[3]));
          }
          return jsonml;
        },

        lists: (function () {
          var any_list = "[*+-]|\\d+\\.",
            bullet_list = /[*+-]/,
            number_list = /\d+\./,
            is_list_re = new RegExp("^( {0,3})(" + any_list + ")[ \t]+"),
            indent_re = "(?: {0,3}\\t| {4})";

          function regex_for_depth(depth) {
            return new RegExp(
              "(?:^(" +
                indent_re +
                "{0," +
                depth +
                "} {0,3})(" +
                any_list +
                ")\\s+)|" +
                "(^" +
                indent_re +
                "{0," +
                (depth - 1) +
                "}[ ]{0,4})"
            );
          }
          function expand_tab(input) {
            return input.replace(/ {0,3}\t/g, "    ");
          }

          function add(li, loose, inline, nl) {
            if (loose) {
              li.push(["para"].concat(inline));
              return;
            }
            var add_to = li[li.length - 1] instanceof Array && li[li.length - 1][0] == "para" ? li[li.length - 1] : li;
            if (nl && li.length > 1) inline.unshift(nl);
            for (var i = 0; i < inline.length; i++) {
              var what = inline[i],
                is_str = typeof what == "string";
              if (is_str && add_to.length > 1 && typeof add_to[add_to.length - 1] == "string") {
                add_to[add_to.length - 1] += what;
              } else {
                add_to.push(what);
              }
            }
          }

          function get_contained_blocks(depth, blocks) {
            var re = new RegExp("^(" + indent_re + "{" + depth + "}.*?\\n?)*$"),
              replace = new RegExp("^" + indent_re + "{" + depth + "}", "gm"),
              ret = [];
            while (blocks.length > 0) {
              if (re.exec(blocks[0])) {
                var b = blocks.shift(),
                  x = b.replace(replace, "");
                ret.push(mk_block(x, b.trailing, b.lineNumber));
              } else {
                break;
              }
            }
            return ret;
          }

          function paragraphify(s, i, stack) {
            var list = s.list;
            var last_li = list[list.length - 1];
            if (last_li[1] instanceof Array && last_li[1][0] == "para") {
              return;
            }
            if (i + 1 == stack.length) {
              last_li.push(["para"].concat(last_li.splice(1, last_li.length - 1)));
            } else {
              var sublist = last_li.pop();
              last_li.push(["para"].concat(last_li.splice(1, last_li.length - 1)), sublist);
            }
          }

          return function (block, next) {
            var m = block.match(is_list_re);
            if (!m) return undefined;

            function make_list(m) {
              var list = bullet_list.exec(m[2]) ? ["bulletlist"] : ["numberlist"];
              stack.push({ list: list, indent: m[1] });
              return list;
            }

            var stack = [],
              list = make_list(m),
              last_li,
              loose = false,
              ret = [stack[0].list],
              i;

            loose_search: while (true) {
              var lines = block.split(/(?=\n)/);
              var li_accumulate = "";

              tight_search: for (var line_no = 0; line_no < lines.length; line_no++) {
                var nl = "",
                  l = lines[line_no].replace(/^\n/, function (n) {
                    nl = n;
                    return "";
                  });
                var line_re = regex_for_depth(stack.length);
                m = l.match(line_re);
                if (m[1] !== undefined) {
                  if (li_accumulate.length) {
                    add(last_li, loose, this.processInline(li_accumulate), nl);
                    loose = false;
                    li_accumulate = "";
                  }
                  m[1] = expand_tab(m[1]);
                  var wanted_depth = Math.floor(m[1].length / 4) + 1;
                  if (wanted_depth > stack.length) {
                    list = make_list(m);
                    last_li.push(list);
                    last_li = list[1] = ["listitem"];
                  } else {
                    var found = false;
                    for (i = 0; i < stack.length; i++) {
                      if (stack[i].indent != m[1]) continue;
                      list = stack[i].list;
                      stack.splice(i + 1, stack.length - (i + 1));
                      found = true;
                      break;
                    }
                    if (!found) {
                      wanted_depth++;
                      if (wanted_depth <= stack.length) {
                        stack.splice(wanted_depth, stack.length - wanted_depth);
                        list = stack[wanted_depth - 1].list;
                      } else {
                        list = make_list(m);
                        last_li.push(list);
                      }
                    }
                    last_li = ["listitem"];
                    list.push(last_li);
                  }
                  nl = "";
                }
                if (l.length > m[0].length) {
                  li_accumulate += nl + l.substr(m[0].length);
                }
              }

              if (li_accumulate.length) {
                add(last_li, loose, this.processInline(li_accumulate), nl);
                loose = false;
                li_accumulate = "";
              }

              var contained = get_contained_blocks(stack.length, next);
              if (contained.length > 0) {
                forEach(stack, paragraphify, this);
                last_li.push.apply(last_li, this.toTree(contained, []));
              }

              var next_block = (next[0] && next[0].valueOf()) || "";
              if (next_block.match(is_list_re) || next_block.match(/^ /)) {
                block = next.shift();
                var hr = this.dialect.block.horizRule(block, next);
                if (hr) {
                  ret.push.apply(ret, hr);
                  break;
                }
                forEach(stack, paragraphify, this);
                loose = true;
                continue loose_search;
              }
              break;
            }
            return ret;
          };
        })(),

        // ====== 新增：块级 HTML 原始标签 ======
        htmlBlock: function htmlBlock(block, next) {
          var blockTags = /^(address|article|aside|blockquote|details|dialog|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hgroup|hr|li|main|nav|ol|p|pre|section|table|ul|canvas|video|audio|iframe|script|style|noscript)[\s\/>]/i;
          if (!/^\s*</.test(block.valueOf())) return undefined;
          var stripped = block.valueOf().replace(/^\s+/, "");
          var m = stripped.match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
          if (!m) return undefined;
          if (!blockTags.test(stripped)) return undefined;
          return [["html_block", block.valueOf()]];
        },

        blockquote: function blockquote(block, next) {
          if (!block.match(/^>/m)) return undefined;
          var jsonml = [];
          if (block[0] != ">") {
            var lines = block.split(/\n/),
              prev = [],
              line_no = block.lineNumber;
            while (lines.length && lines[0][0] != ">") {
              prev.push(lines.shift());
              line_no++;
            }
            var abutting = mk_block(prev.join("\n"), "\n", block.lineNumber);
            jsonml.push.apply(jsonml, this.processBlock(abutting, []));
            block = mk_block(lines.join("\n"), block.trailing, line_no);
          }
          while (next.length && next[0][0] == ">") {
            var b = next.shift();
            block = mk_block(block + block.trailing + b, b.trailing, block.lineNumber);
          }
          var input = block.replace(/^> ?/gm, ""),
            old_tree = this.tree,
            processedBlock = this.toTree(input, ["blockquote"]),
            attr = extract_attr(processedBlock);
          if (attr && attr.references) {
            delete attr.references;
            if (isEmpty(attr)) {
              processedBlock.splice(1, 1);
            }
          }
          jsonml.push(processedBlock);
          return jsonml;
        },

        referenceDefn: function referenceDefn(block, next) {
          var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;
          if (!block.match(re)) return undefined;
          if (!extract_attr(this.tree)) {
            this.tree.splice(1, 0, {});
          }
          var attrs = extract_attr(this.tree);
          if (attrs.references === undefined) {
            attrs.references = {};
          }
          var b = this.loop_re_over_block(re, block, function (m) {
            if (m[2] && m[2][0] == "<" && m[2][m[2].length - 1] == ">") m[2] = m[2].substring(1, m[2].length - 1);
            var ref = (attrs.references[m[1].toLowerCase()] = {
              href: m[2],
            });
            if (m[4] !== undefined) ref.title = m[4];
            else if (m[5] !== undefined) ref.title = m[5];
          });
          if (b.length) next.unshift(mk_block(b, block.trailing));
          return [];
        },

        // ====== 新增：表格（支持合并） ======
        table: function table(block, next) {
          var bv = block.valueOf();
          var lines = bv.split(/\n/);
          if (lines.length < 2) return undefined;
          if (!/^\s*\|/.test(lines[0])) return undefined;
          if (!/^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?\s*$/.test(lines[1])) return undefined;

          var parseRow = function (line) {
            var s = line.trim();
            if (s.charAt(0) === "|") s = s.substr(1);
            if (s.charAt(s.length - 1) === "|") s = s.substr(0, s.length - 1);
            var cells = s.split("|");
            for (var k = 0; k < cells.length; k++) cells[k] = cells[k].trim();
            return cells;
          };

          var parseAlign = function (line) {
            var cells = parseRow(line);
            return cells.map(function (c) {
              c = c.trim().toLowerCase();
              var l = c.charAt(0) === ":";
              var r = c.charAt(c.length - 1) === ":";
              if (l && r) return "center";
              if (r) return "right";
              if (l) return "left";
              return "";
            });
          };

          var header = parseRow(lines[0]);
          var aligns = parseAlign(lines[1]);
          var bodyRows = [];
          var consumedLen = lines[0].length + 1 + lines[1].length;
          for (var i = 2; i < lines.length; i++) {
            if (!/^\s*\|/.test(lines[i])) break;
            bodyRows.push(parseRow(lines[i]));
            consumedLen += lines[i].length + 1;
          }

          // 构建网格
          var grid = [];
          grid.push(header.map(function (c) { return { text: c, colspan: 1, rowspan: 1, skip: false, header: true }; }));
          for (i = 0; i < bodyRows.length; i++) {
            grid.push(bodyRows[i].map(function (c) {
              return {
                text: c,
                colspan: 1,
                rowspan: 1,
                skip: false,
                header: false,
                mergeRight: c === ">",
                mergeUp: c === "^"
              };
            }));
          }

          // 处理合并
          for (i = 1; i < grid.length; i++) {
            for (var j = 0; j < grid[i].length; j++) {
              var cell = grid[i][j];
              if (cell.mergeRight) {
                var k = j - 1;
                while (k >= 0 && grid[i][k].skip) k--;
                if (k >= 0) {
                  grid[i][k].colspan++;
                  cell.skip = true;
                }
              }
              if (cell.mergeUp) {
                var k = i - 1;
                while (k >= 1 && grid[k][j] && grid[k][j].skip) k--;
                if (k >= 1 && grid[k][j]) {
                  grid[k][j].rowspan++;
                  cell.skip = true;
                } else if (k === 0 && grid[0][j]) {
                  grid[0][j].rowspan++;
                  cell.skip = true;
                }
              }
            }
          }

          // 构建 JsonML
          var tbl = ["table", { class: "WitCatMarkDownTable" }];
          var thead = ["thead", ["tr"]];
          for (j = 0; j < grid[0].length; j++) {
            var hcell = grid[0][j];
            if (hcell.skip) continue;
            var hattrs = {};
            if (aligns[j]) hattrs.align = aligns[j];
            if (hcell.colspan > 1) hattrs.colspan = String(hcell.colspan);
            if (hcell.rowspan > 1) hattrs.rowspan = String(hcell.rowspan);
            thead[1].push(["th", hattrs].concat(this.processInline(hcell.text)));
          }
          tbl.push(thead);

          if (grid.length > 1) {
            var tbody = ["tbody"];
            for (i = 1; i < grid.length; i++) {
              var tr = ["tr"];
              for (j = 0; j < grid[i].length; j++) {
                var bcell = grid[i][j];
                if (bcell.skip) continue;
                var battrs = {};
                if (aligns[j]) battrs.align = aligns[j];
                if (bcell.colspan > 1) battrs.colspan = String(bcell.colspan);
                if (bcell.rowspan > 1) battrs.rowspan = String(bcell.rowspan);
                tr.push(["td", battrs].concat(this.processInline(bcell.text)));
              }
              tbody.push(tr);
            }
            tbl.push(tbody);
          }

          if (consumedLen < block.length) {
            next.unshift(mk_block(block.substr(consumedLen), block.trailing));
          }
          return [tbl];
        },

        // ====== 新增：定义列表 ======
        definitionList: function definitionList(block, next) {
          var lines = block.valueOf().split(/\n/);
          if (lines.length < 2) return undefined;
          if (/^\s*$/.test(lines[0]) || /^\s*[:]/.test(lines[0]) || /^\s{4,}/.test(lines[0])) return undefined;
          if (!/^:\s+/.test(lines[1])) return undefined;

          var dl = ["dl"];
          var i = 0;
          while (i < lines.length) {
            if (lines[i] && !/^\s*$/.test(lines[i]) && !/^\s*:\s+/.test(lines[i])) {
              dl.push(["dt"].concat(this.processInline(lines[i].trim())));
              i++;
              while (i < lines.length && /^:\s+/.test(lines[i])) {
                var defText = lines[i].replace(/^:\s+/, "");
                dl.push(["dd"].concat(this.processInline(defText)));
                i++;
              }
            } else {
              break;
            }
            while (i < lines.length && /^\s*$/.test(lines[i])) i++;
          }

          return [dl];
        },

        para: function para(block, next) {
          return [["para"].concat(this.processInline(block))];
        }
      }
    };

    Markdown.dialects.Gruber.inline = {
      __oneElement__: function oneElement(text, patterns_or_re, previous_nodes) {
        var m,
          res,
          lastIndex = 0;
        patterns_or_re = patterns_or_re || this.dialect.inline.__patterns__;
        var re = new RegExp("([\\s\\S]*?)(" + (patterns_or_re.source || patterns_or_re) + ")");
        m = re.exec(text);
        if (!m) {
          return [text.length, text];
        } else if (m[1]) {
          return [m[1].length, m[1]];
        }
        var res;
        if (m[2] in this.dialect.inline) {
          res = this.dialect.inline[m[2]].call(this, text.substr(m.index), m, previous_nodes || []);
        }
        res = res || [m[2].length, m[2]];
        return res;
      },

      __call__: function inline(text, patterns) {
        var out = [],
          res;
        function add(x) {
          if (typeof x == "string" && typeof out[out.length - 1] == "string") out[out.length - 1] += x;
          else out.push(x);
        }
        while (text.length > 0) {
          res = this.dialect.inline.__oneElement__.call(this, text, patterns, out);
          text = text.substr(res.shift());
          forEach(res, add);
        }
        return out;
      },

      "]": function () {},
      "}": function () {},

      // 扩展的转义字符
      __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-~|>:^]/,

      "\\": function escaped(text) {
        if (this.dialect.inline.__escape__.exec(text)) return [2, text.charAt(1)];
        else return [1, "\\"];
      },

      "![": function image(text) {
        var m = text.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/);
        if (m) {
          if (m[2] && m[2][0] == "<" && m[2][m[2].length - 1] == ">") m[2] = m[2].substring(1, m[2].length - 1);
          m[2] = this.dialect.inline.__call__.call(this, m[2], /\\/)[0];
          var attrs = { alt: m[1], href: m[2] || "" };
          if (m[4] !== undefined) attrs.title = m[4];
          return [m[0].length, ["img", attrs]];
        }
        m = text.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/);
        if (m) {
          return [m[0].length, ["img_ref", { alt: m[1], ref: m[2].toLowerCase(), original: m[0] }]];
        }
        // 引用式图片简写 ![alt][]
        m = text.match(/^!\[(.*?)\]\[\]/);
        if (m) {
          return [m[0].length, ["img_ref", { alt: m[1], ref: m[1].toLowerCase(), original: m[0] }]];
        }
        return [2, "!["];
      },

      "[": function link(text) {
        var orig = String(text);
        var res = Markdown.DialectHelpers.inline_until_char.call(this, text.substr(1), "]");
        if (!res) return [1, "["];
        var consumed = 1 + res[0],
          children = res[1],
          link,
          attrs;
        text = text.substr(consumed);
        var m = text.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/);
        if (m) {
          var url = m[1];
          consumed += m[0].length;
          if (url && url[0] == "<" && url[url.length - 1] == ">") url = url.substring(1, url.length - 1);
          if (!m[3]) {
            var open_parens = 1;
            for (var len = 0; len < url.length; len++) {
              switch (url[len]) {
                case "(":
                  open_parens++;
                  break;
                case ")":
                  if (--open_parens == 0) {
                    consumed -= url.length - len;
                    url = url.substring(0, len);
                  }
                  break;
              }
            }
          }
          url = this.dialect.inline.__call__.call(this, url, /\\/)[0];
          attrs = { href: url || "" };
          if (m[3] !== undefined) attrs.title = m[3];
          link = ["link", attrs].concat(children);
          return [consumed, link];
        }
        m = text.match(/^\s*\[(.*?)\]/);
        if (m) {
          consumed += m[0].length;
          attrs = { ref: (m[1] || String(children)).toLowerCase(), original: orig.substr(0, consumed) };
          link = ["link_ref", attrs].concat(children);
          return [consumed, link];
        }
        // 引用式链接简写 [text][]
        m = text.match(/^\s*\[\]/);
        if (m && children.length) {
          consumed += m[0].length;
          var refLabel = typeof children[0] === "string" ? children[0] : String(children);
          attrs = { ref: refLabel.toLowerCase(), original: orig.substr(0, consumed) };
          link = ["link_ref", attrs].concat(children);
          return [consumed, link];
        }
        if (children.length == 1 && typeof children[0] == "string") {
          attrs = { ref: children[0].toLowerCase(), original: orig.substr(0, consumed) };
          link = ["link_ref", attrs, children[0]];
          return [consumed, link];
        }
        return [1, "["];
      },

      // < 同时处理 autoLink、内联 HTML 标签
      "<": function autoLinkOrHtml(text) {
        var m;
        if ((m = text.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) != null) {
          if (m[3]) {
            return [m[0].length, ["link", { href: "mailto:" + m[3] }, m[3]]];
          } else if (m[2] == "mailto") {
            return [m[0].length, ["link", { href: m[1] }, m[1].substr("mailto:".length)]];
          } else return [m[0].length, ["link", { href: m[1] }, m[1]]];
        }
        // 内联 HTML 标签（含自闭合）
        m = text.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)(\s[^<>]*)?\/?>/);
        if (m) {
          return [m[0].length, ["html_inline", m[0]]];
        }
        return [1, "<"];
      },

      "`": function inlineCode(text) {
        var m = text.match(/(`+)(([\s\S]*?)\1)/);
        if (m && m[2]) return [m[1].length + m[2].length, ["inlinecode", m[3]]];
        else {
          return [1, "`"];
        }
      },

      // ====== 新增：删除线 ~~text~~ ======
      "~~": function strikethrough(text) {
        var m = text.match(/^~~([\s\S]+?)~~/);
        if (!m) return [1, "~"];
        var inner = this.processInline(m[1]);
        return [m[0].length, ["strikethrough"].concat(inner)];
      },

      "  \n": function lineBreak(text) {
        return [3, ["linebreak"]];
      }
    };

    function strong_em(tag, md) {
      var state_slot = tag + "_state",
        other_slot = tag == "strong" ? "em_state" : "strong_state";

      function CloseTag(len) {
        this.len_after = len;
        this.name = "close_" + md;
      }

      return function (text, orig_match) {
        if (this[state_slot][0] == md) {
          this[state_slot].shift();
          return [text.length, new CloseTag(text.length - md.length)];
        } else {
          var other = this[other_slot].slice(),
            state = this[state_slot].slice();
          this[state_slot].unshift(md);
          var res = this.processInline(text.substr(md.length));
          var last = res[res.length - 1];
          var check = this[state_slot].shift();
          if (last instanceof CloseTag) {
            res.pop();
            var consumed = text.length - last.len_after;
            return [consumed, [tag].concat(res)];
          } else {
            this[other_slot] = other;
            this[state_slot] = state;
            return [md.length, md];
          }
        }
      };
    }

    Markdown.dialects.Gruber.inline["**"] = strong_em("strong", "**");
    Markdown.dialects.Gruber.inline["__"] = strong_em("strong", "__");
    Markdown.dialects.Gruber.inline["*"] = strong_em("em", "*");
    Markdown.dialects.Gruber.inline["_"] = strong_em("em", "_");

    Markdown.buildBlockOrder = function (d) {
      var ord = [];
      for (var i in d) {
        if (i == "__order__" || i == "__call__") continue;
        ord.push(i);
      }
      d.__order__ = ord;
    };

    Markdown.buildInlinePatterns = function (d) {
      var patterns = [];
      // 优先匹配较长的模式：按长度降序稳定排序
      var keys = [];
      for (var i in d) {
        if (i.match(/^__.*__$/)) continue;
        keys.push(i);
      }
      keys.sort(function (a, b) { return b.length - a.length; });
      for (var k = 0; k < keys.length; k++) {
        var i = keys[k];
        var l = i.replace(/([\\.*+?|()\[\]{}])/g, "\\$1").replace(/\n/, "\\n");
        patterns.push(i.length == 1 ? l : "(?:" + l + ")");
      }
      patterns = patterns.join("|");
      d.__patterns__ = patterns;
      var fn = d.__call__;
      d.__call__ = function (text, pattern) {
        if (pattern != undefined) {
          return fn.call(this, text, pattern);
        } else {
          return fn.call(this, text, patterns);
        }
      };
    };

    Markdown.DialectHelpers = {};
    Markdown.DialectHelpers.inline_until_char = function (text, want) {
      var consumed = 0,
        nodes = [];
      while (true) {
        if (text.charAt(consumed) == want) {
          consumed++;
          return [consumed, nodes];
        }
        if (consumed >= text.length) {
          return null;
        }
        var res = this.dialect.inline.__oneElement__.call(this, text.substr(consumed));
        consumed += res[0];
        nodes.push.apply(nodes, res.slice(1));
      }
    };

    Markdown.subclassDialect = function (d) {
      function Block() {}
      Block.prototype = d.block;
      function Inline() {}
      Inline.prototype = d.inline;
      return { block: new Block(), inline: new Inline() };
    };

    Markdown.buildBlockOrder(Markdown.dialects.Gruber.block);
    Markdown.buildInlinePatterns(Markdown.dialects.Gruber.inline);

    var isArray = Array.isArray ||
      function (obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
      };

    var forEach;
    if (Array.prototype.forEach) {
      forEach = function (arr, cb, thisp) {
        return arr.forEach(cb, thisp);
      };
    } else {
      forEach = function (arr, cb, thisp) {
        for (var i = 0; i < arr.length; i++) {
          cb.call(thisp || arr, arr[i], i, arr);
        }
      };
    }

    var isEmpty = function (obj) {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;
    };

    function extract_attr(jsonml) {
      return isArray(jsonml) && jsonml.length > 1 && typeof jsonml[1] === "object" && !isArray(jsonml[1])
        ? jsonml[1]
        : undefined;
    }

    markdownExpose.renderJsonML = function (jsonml, options) {
      options = options || {};
      options.root = options.root || false;
      var content = [];
      if (options.root) {
        content.push(render_tree(jsonml));
      } else {
        jsonml.shift();
        if (jsonml.length && typeof jsonml[0] === "object" && !(jsonml[0] instanceof Array)) {
          jsonml.shift();
        }
        while (jsonml.length) {
          content.push(render_tree(jsonml.shift()));
        }
      }
      return content.join("\n\n");
    };

    function escapeHTML(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function render_tree(jsonml) {
      if (typeof jsonml === "string") {
        return escapeHTML(jsonml);
      }
      // 原始 HTML 透传
      if (jsonml[0] === "__html__") {
        return String(jsonml[1] || "");
      }
      var tag = jsonml.shift(),
        attributes = {},
        content = [];
      if (jsonml.length && typeof jsonml[0] === "object" && !(jsonml[0] instanceof Array)) {
        attributes = jsonml.shift();
      }
      while (jsonml.length) {
        content.push(render_tree(jsonml.shift()));
      }
      var tag_attrs = "";
      for (var a in attributes) {
        if (a === "class" || a === "id" || a === "style" || a === "align" || a === "colspan" || a === "rowspan" || a === "href" || a === "src" || a === "alt" || a === "title") {
          tag_attrs += " " + a + '="' + escapeHTML(String(attributes[a])) + '"';
        }
      }
      if (tag == "img" || tag == "br" || tag == "hr") {
        return "<" + tag + tag_attrs + "/>";
      } else {
        return "<" + tag + tag_attrs + ">" + content.join("") + "</" + tag + ">";
      }
    }

    function convert_tree_to_html(tree, references, options) {
      var i;
      options = options || {};
      var jsonml = tree.slice(0);
      if (typeof options.preprocessTreeNode === "function") {
        jsonml = options.preprocessTreeNode(jsonml, references);
      }
      var attrs = extract_attr(jsonml);
      if (attrs) {
        jsonml[1] = {};
        for (i in attrs) {
          jsonml[1][i] = attrs[i];
        }
        attrs = jsonml[1];
      }
      if (typeof jsonml === "string") {
        return jsonml;
      }

      switch (jsonml[0]) {
        case "header":
          jsonml[0] = "h" + jsonml[1].level;
          delete jsonml[1].level;
          break;
        case "bulletlist":
          jsonml[0] = "ul";
          break;
        case "numberlist":
          jsonml[0] = "ol";
          break;
        case "listitem":
          jsonml[0] = "li";
          break;
        case "para":
          jsonml[0] = "p";
          break;
        case "markdown":
          jsonml[0] = "html";
          if (attrs) delete attrs.references;
          break;
        case "code_block":
          jsonml[0] = "pre";
          i = attrs ? 2 : 1;
          var code = ["code"];
          code.push.apply(code, jsonml.splice(i, jsonml.length - i));
          jsonml[i] = code;
          break;
        case "fenced_code":
          var lang = attrs && attrs.language ? attrs.language : "";
          var fcStart = attrs ? 2 : 1;
          var fcContent = jsonml.slice(fcStart).join("");
          var codeAttrs = lang ? { class: "language-" + lang } : {};
          return ["pre", {}, ["code", codeAttrs, escapeHTML(fcContent)]];
        case "inlinecode":
          jsonml[0] = "code";
          break;
        case "html_block":
          var hbStart = attrs ? 2 : 1;
          return ["__html__", jsonml.slice(hbStart).join("")];
        case "html_inline":
          var hiStart = attrs ? 2 : 1;
          return ["__html__", jsonml.slice(hiStart).join("")];
        case "strikethrough":
          jsonml[0] = "del";
          break;
        case "img":
          jsonml[1].src = jsonml[1].href;
          delete jsonml[1].href;
          break;
        case "linebreak":
          jsonml[0] = "br";
          break;
        case "link":
          jsonml[0] = "a";
          break;
        case "link_ref":
          jsonml[0] = "a";
          var ref = references[attrs.ref];
          if (ref) {
            delete attrs.ref;
            attrs.href = ref.href;
            if (ref.title) {
              attrs.title = ref.title;
            }
            delete attrs.original;
          } else {
            return attrs.original;
          }
          break;
        case "img_ref":
          jsonml[0] = "img";
          var ref = references[attrs.ref];
          if (ref) {
            delete attrs.ref;
            attrs.src = ref.href;
            if (ref.title) {
              attrs.title = ref.title;
            }
            delete attrs.original;
          } else {
            return attrs.original;
          }
          break;
      }
      i = 1;
      if (attrs) {
        for (var key in jsonml[1]) {
          i = 2;
          break;
        }
        if (i === 1) {
          jsonml.splice(i, 1);
        }
      }
      for (; i < jsonml.length; ++i) {
        jsonml[i] = convert_tree_to_html(jsonml[i], references, options);
      }
      return jsonml;
    }

    function merge_text_nodes(jsonml) {
      var i = extract_attr(jsonml) ? 2 : 1;
      while (i < jsonml.length) {
        if (typeof jsonml[i] === "string") {
          if (i + 1 < jsonml.length && typeof jsonml[i + 1] === "string") {
            jsonml[i] += jsonml.splice(i + 1, 1)[0];
          } else {
            ++i;
          }
        } else {
          merge_text_nodes(jsonml[i]);
          ++i;
        }
      }
    }
  })();

  // ==================== Prism 代码高亮库部分 ====================
  var Prism = (function () {
    var _self = (typeof window !== 'undefined') ? window : {};
    
    var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
    var uniqueId = 0;
    var plainTextGrammar = {};

    var _ = {
      manual: _self.Prism && _self.Prism.manual,
      disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

      util: {
        encode: function encode(tokens) {
          if (tokens instanceof Token) {
            return new Token(tokens.type, encode(tokens.content), tokens.alias);
          } else if (Array.isArray(tokens)) {
            return tokens.map(encode);
          } else {
            return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
          }
        },

        type: function (o) {
          return Object.prototype.toString.call(o).slice(8, -1);
        },

        objId: function (obj) {
          if (!obj['__id']) {
            Object.defineProperty(obj, '__id', { value: ++uniqueId });
          }
          return obj['__id'];
        },

        clone: function deepClone(o, visited) {
          visited = visited || {};
          var clone; var id;
          switch (_.util.type(o)) {
            case 'Object':
              id = _.util.objId(o);
              if (visited[id]) {
                return visited[id];
              }
              clone = {};
              visited[id] = clone;
              for (var key in o) {
                if (o.hasOwnProperty(key)) {
                  clone[key] = deepClone(o[key], visited);
                }
              }
              return clone;
            case 'Array':
              id = _.util.objId(o);
              if (visited[id]) {
                return visited[id];
              }
              clone = [];
              visited[id] = clone;
              o.forEach(function (v, i) {
                clone[i] = deepClone(v, visited);
              });
              return clone;
            default:
              return o;
          }
        },

        getLanguage: function (element) {
          while (element) {
            var m = lang.exec(element.className);
            if (m) {
              return m[1].toLowerCase();
            }
            element = element.parentElement;
          }
          return 'none';
        },

        setLanguage: function (element, language) {
          element.className = element.className.replace(RegExp(lang, 'gi'), '');
          element.classList.add('language-' + language);
        },

        currentScript: function () {
          if (typeof document === 'undefined') {
            return null;
          }
          if ('currentScript' in document) {
            return document.currentScript;
          }
          try {
            throw new Error();
          } catch (err) {
            var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
            if (src) {
              var scripts = document.getElementsByTagName('script');
              for (var i in scripts) {
                if (scripts[i].src == src) {
                  return scripts[i];
                }
              }
            }
            return null;
          }
        },

        isActive: function (element, className, defaultActivation) {
          var no = 'no-' + className;
          while (element) {
            var classList = element.classList;
            if (classList.contains(className)) {
              return true;
            }
            if (classList.contains(no)) {
              return false;
            }
            element = element.parentElement;
          }
          return !!defaultActivation;
        }
      },

      languages: {
        plain: plainTextGrammar,
        plaintext: plainTextGrammar,
        text: plainTextGrammar,
        txt: plainTextGrammar,

        extend: function (id, redef) {
          var lang = _.util.clone(_.languages[id]);
          for (var key in redef) {
            lang[key] = redef[key];
          }
          return lang;
        },

        insertBefore: function (inside, before, insert, root) {
          root = root || _.languages;
          var grammar = root[inside];
          var ret = {};
          for (var token in grammar) {
            if (grammar.hasOwnProperty(token)) {
              if (token == before) {
                for (var newToken in insert) {
                  if (insert.hasOwnProperty(newToken)) {
                    ret[newToken] = insert[newToken];
                  }
                }
              }
              if (!insert.hasOwnProperty(token)) {
                ret[token] = grammar[token];
              }
            }
          }
          var old = root[inside];
          root[inside] = ret;
          _.languages.DFS(_.languages, function (key, value) {
            if (value === old && key != inside) {
              this[key] = ret;
            }
          });
          return ret;
        },

        DFS: function DFS(o, callback, type, visited) {
          visited = visited || {};
          var objId = _.util.objId;
          for (var i in o) {
            if (o.hasOwnProperty(i)) {
              callback.call(o, i, o[i], type || i);
              var property = o[i];
              var propertyType = _.util.type(property);
              if (propertyType === 'Object' && !visited[objId(property)]) {
                visited[objId(property)] = true;
                DFS(property, callback, null, visited);
              } else if (propertyType === 'Array' && !visited[objId(property)]) {
                visited[objId(property)] = true;
                DFS(property, callback, i, visited);
              }
            }
          }
        }
      },

      plugins: {},

      highlightAll: function (async, callback) {
        _.highlightAllUnder(document, async, callback);
      },

      highlightAllUnder: function (container, async, callback) {
        var env = {
          callback: callback,
          container: container,
          selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
        };
        _.hooks.run('before-highlightall', env);
        env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));
        _.hooks.run('before-all-elements-highlight', env);
        for (var i = 0, element; (element = env.elements[i++]);) {
          _.highlightElement(element, async === true, env.callback);
        }
      },

      highlightElement: function (element, async, callback) {
        var language = _.util.getLanguage(element);
        var grammar = _.languages[language];
        _.util.setLanguage(element, language);
        var parent = element.parentElement;
        if (parent && parent.nodeName.toLowerCase() === 'pre') {
          _.util.setLanguage(parent, language);
        }
        var code = element.textContent;
        var env = {
          element: element,
          language: language,
          grammar: grammar,
          code: code
        };
        function insertHighlightedCode(highlightedCode) {
          env.highlightedCode = highlightedCode;
          _.hooks.run('before-insert', env);
          env.element.innerHTML = env.highlightedCode;
          _.hooks.run('after-highlight', env);
          _.hooks.run('complete', env);
          callback && callback.call(env.element);
        }
        _.hooks.run('before-sanity-check', env);
        parent = env.element.parentElement;
        if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
          parent.setAttribute('tabindex', '0');
        }
        if (!env.code) {
          _.hooks.run('complete', env);
          callback && callback.call(env.element);
          return;
        }
        _.hooks.run('before-highlight', env);
        if (!env.grammar) {
          insertHighlightedCode(_.util.encode(env.code));
          return;
        }
        if (async && _self.Worker) {
          var worker = new Worker(_.filename);
          worker.onmessage = function (evt) {
            insertHighlightedCode(evt.data);
          };
          worker.postMessage(JSON.stringify({
            language: env.language,
            code: env.code,
            immediateClose: true
          }));
        } else {
          insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
        }
      },

      highlight: function (text, grammar, language) {
        var env = {
          code: text,
          grammar: grammar,
          language: language
        };
        _.hooks.run('before-tokenize', env);
        if (!env.grammar) {
          throw new Error('The language "' + env.language + '" has no grammar.');
        }
        env.tokens = _.tokenize(env.code, env.grammar);
        _.hooks.run('after-tokenize', env);
        return Token.stringify(_.util.encode(env.tokens), env.language);
      },

      tokenize: function (text, grammar) {
        var rest = grammar.rest;
        if (rest) {
          for (var token in rest) {
            grammar[token] = rest[token];
          }
          delete grammar.rest;
        }
        var tokenList = new LinkedList();
        addAfter(tokenList, tokenList.head, text);
        matchGrammar(text, tokenList, grammar, tokenList.head, 0);
        return toArray(tokenList);
      },

      hooks: {
        all: {},
        add: function (name, callback) {
          var hooks = _.hooks.all;
          hooks[name] = hooks[name] || [];
          hooks[name].push(callback);
        },
        run: function (name, env) {
          var callbacks = _.hooks.all[name];
          if (!callbacks || !callbacks.length) {
            return;
          }
          for (var i = 0, callback; (callback = callbacks[i++]);) {
            callback(env);
          }
        }
      },

      Token: Token
    };
    _self.Prism = _;

    function Token(type, content, alias, matchedStr) {
      this.type = type;
      this.content = content;
      this.alias = alias;
      this.length = (matchedStr || '').length | 0;
    }

    Token.stringify = function stringify(o, language) {
      if (typeof o == 'string') {
        return o;
      }
      if (Array.isArray(o)) {
        var s = '';
        o.forEach(function (e) {
          s += stringify(e, language);
        });
        return s;
      }
      var env = {
        type: o.type,
        content: stringify(o.content, language),
        tag: 'span',
        classes: ['token', o.type],
        attributes: {},
        language: language
      };
      var aliases = o.alias;
      if (aliases) {
        if (Array.isArray(aliases)) {
          Array.prototype.push.apply(env.classes, aliases);
        } else {
          env.classes.push(aliases);
        }
      }
      _.hooks.run('wrap', env);
      var attributes = '';
      for (var name in env.attributes) {
        attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
      }
      return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    };

    function matchPattern(pattern, pos, text, lookbehind) {
      pattern.lastIndex = pos;
      var match = pattern.exec(text);
      if (match && lookbehind && match[1]) {
        var lookbehindLength = match[1].length;
        match.index += lookbehindLength;
        match[0] = match[0].slice(lookbehindLength);
      }
      return match;
    }

    function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
      for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
          continue;
        }
        var patterns = grammar[token];
        patterns = Array.isArray(patterns) ? patterns : [patterns];
        for (var j = 0; j < patterns.length; ++j) {
          if (rematch && rematch.cause == token + ',' + j) {
            return;
          }
          var patternObj = patterns[j];
          var inside = patternObj.inside;
          var lookbehind = !!patternObj.lookbehind;
          var greedy = !!patternObj.greedy;
          var alias = patternObj.alias;
          if (greedy && !patternObj.pattern.global) {
            var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
            patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
          }
          var pattern = patternObj.pattern || patternObj;
          for (var currentNode = startNode.next, pos = startPos;
            currentNode !== tokenList.tail;
            pos += currentNode.value.length, currentNode = currentNode.next) {
            if (rematch && pos >= rematch.reach) {
              break;
            }
            var str = currentNode.value;
            if (tokenList.length > text.length) {
              return;
            }
            if (str instanceof Token) {
              continue;
            }
            var removeCount = 1;
            var match;
            if (greedy) {
              match = matchPattern(pattern, pos, text, lookbehind);
              if (!match || match.index >= text.length) {
                break;
              }
              var from = match.index;
              var to = match.index + match[0].length;
              var p = pos;
              p += currentNode.value.length;
              while (from >= p) {
                currentNode = currentNode.next;
                p += currentNode.value.length;
              }
              p -= currentNode.value.length;
              pos = p;
              if (currentNode.value instanceof Token) {
                continue;
              }
              for (var k = currentNode;
                k !== tokenList.tail && (p < to || typeof k.value === 'string');
                k = k.next) {
                removeCount++;
                p += k.value.length;
              }
              removeCount--;
              str = text.slice(pos, p);
              match.index -= pos;
            } else {
              match = matchPattern(pattern, 0, str, lookbehind);
              if (!match) {
                continue;
              }
            }
            var from = match.index;
            var matchStr = match[0];
            var before = str.slice(0, from);
            var after = str.slice(from + matchStr.length);
            var reach = pos + str.length;
            if (rematch && reach > rematch.reach) {
              rematch.reach = reach;
            }
            var removeFrom = currentNode.prev;
            if (before) {
              removeFrom = addAfter(tokenList, removeFrom, before);
              pos += before.length;
            }
            removeRange(tokenList, removeFrom, removeCount);
            var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
            currentNode = addAfter(tokenList, removeFrom, wrapped);
            if (after) {
              addAfter(tokenList, currentNode, after);
            }
            if (removeCount > 1) {
              var nestedRematch = {
                cause: token + ',' + j,
                reach: reach
              };
              matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);
              if (rematch && nestedRematch.reach > rematch.reach) {
                rematch.reach = nestedRematch.reach;
              }
            }
          }
        }
      }
    }

    function LinkedList() {
      var head = { value: null, prev: null, next: null };
      var tail = { value: null, prev: head, next: null };
      head.next = tail;
      this.head = head;
      this.tail = tail;
      this.length = 0;
    }

    function addAfter(list, node, value) {
      var next = node.next;
      var newNode = { value: value, prev: node, next: next };
      node.next = newNode;
      next.prev = newNode;
      list.length++;
      return newNode;
    }

    function removeRange(list, node, count) {
      var next = node.next;
      for (var i = 0; i < count && next !== list.tail; i++) {
        next = next.next;
      }
      node.next = next;
      next.prev = node;
      list.length -= i;
    }

    function toArray(list) {
      var array = [];
      var node = list.head.next;
      while (node !== list.tail) {
        array.push(node.value);
        node = node.next;
      }
      return array;
    }

    if (!_self.document) {
      if (!_self.addEventListener) {
        return _;
      }
      if (!_.disableWorkerMessageHandler) {
        _self.addEventListener('message', function (evt) {
          var message = JSON.parse(evt.data);
          var lang = message.language;
          var code = message.code;
          var immediateClose = message.immediateClose;
          _self.postMessage(_.highlight(code, _.languages[lang], lang));
          if (immediateClose) {
            _self.close();
          }
        }, false);
      }
      return _;
    }

    var script = _.util.currentScript();
    if (script) {
      _.filename = script.src;
      if (script.hasAttribute('data-manual')) {
        _.manual = true;
      }
    }

    function highlightAutomaticallyCallback() {
      if (!_.manual) {
        _.highlightAll();
      }
    }

    if (!_.manual) {
      var readyState = document.readyState;
      if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
        document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
      } else {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(highlightAutomaticallyCallback);
        } else {
          window.setTimeout(highlightAutomaticallyCallback, 16);
        }
      }
    }

    return _;
  })();

  // ==================== 扩展主类部分 ====================
  const extensionId = 'WitCatMarkDown';
  let markdownmousedown = {};
  let touchEvent = {};

  class WitCatMarkDownExtension {
    constructor() {
      this.markdownExpose = markdownExpose;
      this.Prism = Prism;
      this.markdownmousedown = markdownmousedown;
      this.touchEvent = touchEvent;
      this.resize = null;
      
      // 新增：存储动态解析规则
      this.dynamicRules = [];
      
      this._initEventListeners();
      this._addStyles();
      this._addScript();
    }

    getInfo() {
      return {
        id: extensionId,
        name: '白猫的 markdown',
        color1: '#1c7321',
        color2: '#114514',
        blocks: [
          {
            opcode: 'create',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建 markdown ID[id]X[x]Y[y]宽[width]高[height]内容 [text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              width: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' },
              height: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: 'wit_cat!!!' }
            }
          },
          {
            opcode: 'set',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 的 [type] 为 [text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              type: { type: Scratch.ArgumentType.STRING, menu: 'types' },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'sets',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 第 [num] 个 [type] 的样式为 [text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, menu: 'settype' },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '{"color":"red"}' }
            }
          },
          {
            opcode: 'imgstyle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown ID[id] 的第 [num] 张图片的宽 [width] 高 [height]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              width: { type: Scratch.ArgumentType.STRING, defaultValue: '100' },
              height: { type: Scratch.ArgumentType.STRING, defaultValue: '100' }
            }
          },
          {
            opcode: 'code',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 第 [num] 个代码框的高亮为 [name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              name: { type: Scratch.ArgumentType.STRING, menu: 'code' }
            }
          },
          {
            opcode: 'ide',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 为 [name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              name: { type: Scratch.ArgumentType.STRING, menu: 'ide' }
            }
          },
          {
            opcode: 'size',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown 大小自适应 [type]',
            arguments: {
              type: { type: Scratch.ArgumentType.STRING, menu: 'typess' }
            }
          },
          {
            opcode: 'setfont',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 的字体为 [name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              name: { type: Scratch.ArgumentType.STRING, defaultValue: 'arial' }
            }
          },
          {
            opcode: 'loadfont',
            blockType: Scratch.BlockType.COMMAND,
            text: '从 [text] 加载字体名 [name]',
            arguments: {
              text: { type: Scratch.ArgumentType.STRING, defaultValue: 'url' },
              name: { type: Scratch.ArgumentType.STRING, defaultValue: 'arial' }
            }
          },
          // 新增积木
          {
            opcode: 'loadRules',
            blockType: Scratch.BlockType.COMMAND,
            text: '动态加载解析规则 [url]',
            arguments: {
              url: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://example.com/rules.json' }
            }
          },
          {
            opcode: 'delete',
            blockType: Scratch.BlockType.COMMAND,
            text: '删除 markdown ID[id]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' }
            }
          },
          {
            opcode: 'deleteall',
            blockType: Scratch.BlockType.COMMAND,
            text: '删除所有 markdown',
            arguments: {}
          },
          {
            opcode: 'get',
            blockType: Scratch.BlockType.REPORTER,
            text: 'markdown ID[id] 的 [type]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              type: { type: Scratch.ArgumentType.STRING, menu: 'type' }
            }
          },
          {
            opcode: 'getwidth',
            blockType: Scratch.BlockType.REPORTER,
            text: '获取内容 [content] 的渲染 [type]',
            arguments: {
              content: { type: Scratch.ArgumentType.STRING, defaultValue: 'witcat' },
              type: { type: Scratch.ArgumentType.STRING, menu: 'width' }
            }
          },
          {
            opcode: 'click',
            blockType: Scratch.BlockType.REPORTER,
            text: '上次点击的元素的 [clickmenu]',
            arguments: {
              clickmenu: { type: Scratch.ArgumentType.STRING, menu: 'clickmenu' }
            }
          },
          {
            opcode: 'touchs',
            blockType: Scratch.BlockType.REPORTER,
            text: '碰到的元素的 [clickmenu]',
            arguments: {
              clickmenu: { type: Scratch.ArgumentType.STRING, menu: 'clickmenu' }
            }
          },
          {
            opcode: 'touch',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '碰到 markdown[id] 第 [number] 个 [type] 元素？',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' }
            }
          },
          {
            opcode: 'settextalign',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id] 第 [num] 个 [type] 为 [text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'all' },
              text: { type: Scratch.ArgumentType.STRING, menu: 'textalign' }
            }
          },
          {
            opcode: 'move',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素偏移 X[x]Y[y]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
            }
          },
          {
            opcode: 'scale',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素缩放 X[x]Y[y]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
            }
          },
          {
            opcode: 'rot',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素旋转 [y]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
            }
          },
          {
            opcode: 'dmove',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素 3D 偏移 X[x]Y[y]Z[z]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              z: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
            }
          },
          {
            opcode: 'drot',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素 3D 旋转 X[x]Y[y]Z[z]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              z: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
            }
          },
          {
            opcode: 'setinsite',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id] 第 [number] 个 [type] 元素的 [input] 设为 [text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              input: { type: Scratch.ArgumentType.STRING, menu: 'setinsite' },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'transition',
            blockType: Scratch.BlockType.COMMAND,
            text: '为 markdown[id] 设置过渡为 [s] 秒的 [timing]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              s: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              timing: { type: Scratch.ArgumentType.STRING, menu: 'timing' }
            }
          },
          {
            opcode: 'docss',
            blockType: Scratch.BlockType.REPORTER,
            text: '📖示例内容',
            arguments: {}
          },
          {
            opcode: 'openDocs',
            blockType: Scratch.BlockType.BUTTON,
            text: '📖拓展教程',
            func: 'openDocs'
          }
        ],
        menus: {
          type: [
            { text: 'X', value: 'x' },
            { text: 'Y', value: 'y' },
            { text: '宽', value: 'width' },
            { text: '高', value: 'height' },
            { text: '内容', value: 'content' },
            { text: '内容高度', value: 'ContentHeight' },
            { text: '纵向滚动位置', value: 'Longitudinal' },
            { text: '内容宽度', value: 'ContentWidth' },
            { text: '横向滚动位置', value: 'Horizontal' },
            { text: 'json', value: 'json' }
          ],
          types: [
            { text: 'X', value: 'x' },
            { text: 'Y', value: 'y' },
            { text: '宽', value: 'width' },
            { text: '高', value: 'height' },
            { text: '内容', value: 'content' },
            { text: '透视', value: 'perspective' },
            { text: '纵向滚动位置', value: 'Longitudinal' },
            { text: '横向滚动位置', value: 'Horizontal' }
          ],
          typess: [
            { text: '启动', value: 'true' },
            { text: '关闭', value: 'false' }
          ],
          code: [
            { text: 'javascript', value: 'language-javascript' },
            { text: 'css', value: 'language-css' },
            { text: 'HTML', value: 'language-html' },
            { text: 'python', value: 'language-python' }
          ],
          ide: [
            { text: '可编辑', value: 'true' },
            { text: '不可编辑', value: 'false' }
          ],
          width: [
            { text: '宽', value: 'width' },
            { text: '高', value: 'height' }
          ],
          clickmenu: [
            { text: 'markdown 来源', value: 'markdown' },
            { text: '类型', value: 'type' },
            { text: '序号', value: 'number' }
          ],
          timing: [
            { text: '线性', value: 'linear' },
            { text: '缓出', value: 'ease-out' },
            { text: '缓入', value: 'ease-in' },
            { text: '缓出入', value: 'ease-in-out' },
            { text: '缓动', value: 'ease' }
          ],
          textalign: [
            { text: '左对齐', value: 'left' },
            { text: '右对齐', value: 'right' }
          ],
          setinsite: [
            { text: '阴影', value: 'shadow' },
            { text: '文字阴影', value: 'textShadow' }
          ],
          settype: [
            { text: '文本', value: 'p' },
            { text: '粗体', value: 'strong' },
            { text: '斜体', value: 'em' },
            { text: '删除线', value: 'del' },
            { text: '大号', value: 'h3' },
            { text: '更大号', value: 'h2' },
            { text: '超大号', value: 'h1' },
            { text: '链接', value: 'a' },
            { text: '代码框', value: 'code' },
            { text: '表格', value: 'table' }
          ]
        }
      };
    }

    _initEventListeners() {
      if (typeof window !== 'undefined') {
        window.addEventListener('mousedown', (e) => {
          this.markdownmousedown = e;
        });
        window.addEventListener('mousemove', (e) => {
          this.touchEvent = e;
        });
      }
    }

    _addStyles() {
      if (typeof document === 'undefined') return;
      
      const style = document.createElement('style');
      style.textContent = `
        h1{ font-size:2.0em; }
        h3{ font-size:1.17em; }
        h5{ font-size:0.83em; }
        h6{ font-size:0.67em; }
        .WitCatMarkDownOut::-webkit-scrollbar{ display: none; }
        .WitCatMarkDown::-webkit-scrollbar{ display: none; }
        .WitCatMarkDown{ color:black; }
        .WitCatMarkDown br{ display: block; height: 0px; }
        .WitCatMarkDown{ transform-origin: 0 0; transform:var(--witcat-markdown-scale); }
        .WitCatMarkDown ul{ padding-inline-start: 40px; list-style:none; }
        .WitCatMarkDown ol{ padding-inline-start: 40px; list-style:auto; }
        .WitCatMarkDown blockquote{ display: block; margin-block-start: 1em; margin-block-end: 1em; margin-inline-start: 40px; margin-inline-end: 40px; }
        .WitCatMarkDownpolier{ display: inline-block; white-space: nowrap; width: 100%; height: 100%; overflow: hidden; position: relative; }
        .WitCatMarkDownpolier button{ background-color: #00000000; color: #1A96E2; position: absolute; right: 0px; bottom: 0px; border-radius: 0.5em; }
        .WitCatMarkDownHide{ background-color: #252525; color: #252525; text-shadow: none; border-radius: 0.5em; }
        .WitCatMarkDownHide:hover{ color: white !important; }
        .WitCatMarkDowng-container { width: 240px; height: 10px; border-radius: 0.5em; background: #eee; }
        .WitCatMarkDowng-progress { width: 50%; height: inherit; border-radius: 0.5em; background: #0f0; }
        .WitCatMarkDownTable{ border: 1px solid black; border-collapse: separate; }
        .WitCatMarkDownTable td, .WitCatMarkDownTable th{ border: 1px solid black; padding: 8px; }
        .WitCatMarkDownTable th{ background: #f4f4f4; font-weight: bold; }
        .WitCatMarkDown del{ text-decoration: line-through; color: #888; }
        .WitCatMarkDown dl{ margin: 1em 0; }
        .WitCatMarkDown dt{ font-weight: bold; margin-top: 0.5em; }
        .WitCatMarkDown dd{ margin-left: 2em; margin-bottom: 0.3em; }
        code[class*=language-], pre[class*=language-] { color: #000; background: 0 0; text-shadow: 0 1px #fff; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 1em; text-align: left; white-space: pre; word-spacing: normal; word-break: normal; word-wrap: normal; line-height: 1.5; -moz-tab-size: 4; -o-tab-size: 4; tab-size: 4; -webkit-hyphens: none; -moz-hyphens: none; -ms-hyphens: none; hyphens: none; }
        code[class*=language-] ::-moz-selection, code[class*=language-]::-moz-selection, pre[class*=language-] ::-moz-selection, pre[class*=language-]::-moz-selection { text-shadow: none; background: #b3d4fc; }
        code[class*=language-] ::selection, code[class*=language-]::selection, pre[class*=language-] ::selection, pre[class*=language-]::selection { text-shadow: none; background: #b3d4fc; }
        @media print { code[class*=language-], pre[class*=language-] { text-shadow: none; } }
        pre[class*=language-] { padding: 1em; margin: .5em 0; overflow: auto; background: #f7f7f7; border-radius: 0.3em; }
        :not(pre)>code[class*=language-], pre[class*=language-] { background: #f7f7f7; }
        :not(pre)>code[class*=language-] { padding: .1em; border-radius: .3em; white-space: normal; }
        .token.cdata, .token.comment, .token.doctype, .token.prolog { color: #708090; }
        .token.punctuation { color: #999; }
        .token.namespace { opacity: .7; }
        .token.boolean, .token.constant, .token.deleted, .token.number, .token.property, .token.symbol, .token.tag { color: #905; }
        .token.attr-name, .token.builtin, .token.char, .token.inserted, .token.selector, .token.string { color: #690; }
        .language-css .token.string, .style .token.string, .token.entity, .token.operator, .token.url { color: #9a6e3a; background: hsla(0, 0%, 100%, .5); }
        .token.atrule, .token.attr-value, .token.keyword { color: #07a; }
        .token.class-name, .token.function { color: #dd4a68; }
        .token.important, .token.regex, .token.variable { color: #e90; }
        .token.bold, .token.important { font-weight: 700; }
        .token.italic { font-style: italic; }
        .token.entity { cursor: help; }
        .token a { color: inherit; }
        span.inline-color-wrapper { background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyIDIiPjxwYXRoIGZpbGw9ImdyYXkiIGQ9Ik0wIDBoMnYySDB6Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0wIDBoMXYxSDB6TTEgMWgxdjFIMXoiLz48L3N2Zz4=); background-position: center; background-size: 110%; display: inline-block; height: 1.333ch; width: 1.333ch; margin: 0 .333ch; box-sizing: border-box; border: 1px solid #fff; outline: 1px solid rgba(0, 0, 0, .5); overflow: hidden; }
        span.inline-color { display: block; height: 120%; width: 120%; }
      `;
      
      if (document.head) {
        document.head.appendChild(style);
      }
    }

    _addScript() {
      if (typeof document === 'undefined') return;
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.textContent = `function showText(a) { if (a.innerText === '展开' || a.innerText === 'more') { a.parentElement.style.height = '100%'; } else if (a.innerText === '收起' || a.innerText === 'fold') { a.parentElement.style.height = (a.parentElement.getAttribute('height')) + 'px'; } a.innerText = a.innerText === 'more' ? 'fold' : a.innerText === 'fold' ? 'more' : a.innerText === '展开' ? '收起' : '展开'; }`;
      
      if (document.body) {
        document.body.appendChild(script);
      }
    }

    _getCanvas() {
      try {
        const renderer = Scratch.renderer;
        if (renderer && renderer.canvas) {
          return renderer.canvas;
        }
      } catch (err) {
        return null;
      }
      return null;
    }

    _getInputParent() {
      try {
        const canvas = this._getCanvas();
        if (canvas && canvas.parentElement) {
          return canvas.parentElement;
        }
      } catch (err) {
        console.error(err);
      }
      return null;
    }

    _clamp(x, min, max) {
      return isNaN(x) ? min : x < min ? min : x > max ? max : x;
    }

    openDocs() {
      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = 'https://www.ccw.site/post/7d129e01-e30a-4d88-92d2-320b555ed0f5';
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        a.click();
      }
    }

    // 新增：应用动态规则
    _applyDynamicRules(text) {
      if (!this.dynamicRules || this.dynamicRules.length === 0) {
        return text;
      }
      let result = String(text);
      this.dynamicRules.forEach(rule => {
        try {
          // rule.pattern 是字符串形式的正则，rule.replacement 是替换内容
          const regex = new RegExp(rule.pattern, 'g');
          result = result.replace(regex, rule.replacement);
        } catch (e) {
          console.warn("WitCatMarkDown Rule Error:", e);
        }
      });
      return result;
    }

    // 新增积木实现
    loadRules(args) {
      const url = String(args.url);
      if (!url) return;
      
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          // 清空旧规则
          this.dynamicRules = [];
          // 解析新规则
          // 预期 data 格式: { "regex_pattern": "replacement_html" }
          for (const pattern in data) {
            if (data.hasOwnProperty(pattern)) {
              this.dynamicRules.push({
                pattern: pattern,
                replacement: data[pattern]
              });
            }
          }
          console.log("WitCatMarkDown: Rules loaded", this.dynamicRules.length);
        })
        .catch(error => {
          console.error("WitCatMarkDown: Failed to load rules", error);
        });
    }

    create(args) {
      const inputParent = this._getInputParent();
      if (!inputParent) return;
      
      const runtime = Scratch.vm.runtime;
      if (!runtime) return;
      
      let x = this._clamp(Number(args.x), 0, runtime.stageWidth);
      let y = this._clamp(Number(args.y), 0, runtime.stageHeight);
      let width = this._clamp(Number(args.width), 0, runtime.stageWidth - x);
      let height = this._clamp(Number(args.height), 0, runtime.stageHeight - y);
      
      x = (x / runtime.stageWidth) * 100;
      y = (y / runtime.stageHeight) * 100;
      width = (width / runtime.stageWidth) * 100;
      height = (height / runtime.stageHeight) * 100;

      let search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (search !== null) {
        inputParent.removeChild(search);
      }
      
      search = document.createElement('div');
      search.id = `WitCatMarkDown${args.id}`;
      search.className = 'WitCatMarkDownOut';
      search.style.overflow = 'auto';
      search.style.webkitUserSelect = 'text';
      search.style.userSelect = 'text';
      search.style.position = 'absolute';
      search.style.left = `${x}%`;
      search.style.top = `${y}%`;
      search.style.width = `${width}%`;
      search.style.height = `${height}%`;
      
      // 应用动态规则后再进行 Markdown 解析
      const processedText = this._applyDynamicRules(String(args.text));
      search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(processedText)}</div>`;
      inputParent.appendChild(search);
      
      if (this.Prism && this.Prism.highlightAll) {
        this.Prism.highlightAll();
      }
    }

    set(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const runtime = Scratch.vm.runtime;
      if (!runtime) return;
      
      const sstyle = search.style;
      switch (args.type) {
        case 'x':
          let x = this._clamp(Number(args.text), 0, runtime.stageWidth);
          x = (x / runtime.stageWidth) * 100;
          sstyle.left = `${x}%`;
          break;
        case 'y':
          let y = this._clamp(Number(args.text), 0, runtime.stageHeight);
          y = (y / runtime.stageHeight) * 100;
          sstyle.top = `${y}%`;
          break;
        case 'width':
          let currentX = (parseFloat(sstyle.left) / 100) * runtime.stageWidth;
          let width = this._clamp(Number(args.text), 0, runtime.stageWidth - currentX);
          width = (width / runtime.stageWidth) * 100;
          sstyle.width = `${width}%`;
          break;
        case 'height':
          let currentY = (parseFloat(sstyle.top) / 100) * runtime.stageHeight;
          let height = this._clamp(Number(args.text), 0, runtime.stageHeight - currentY);
          height = (height / runtime.stageHeight) * 100;
          sstyle.height = `${height}%`;
          break;
        case 'content':
          // 应用动态规则后再进行 Markdown 解析
          const processedText = this._applyDynamicRules(String(args.text));
          search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(processedText)}</div>`;
          if (this.Prism && this.Prism.highlightAll) {
            this.Prism.highlightAll();
          }
          break;
        case 'perspective':
          if (search.firstChild) {
            search.firstChild.style.perspective = `${Number(args.text)}px`;
          }
          break;
        case 'Longitudinal':
          search.scrollTo({ top: Number(args.text) });
          break;
        case 'Horizontal':
          search.scrollTo({ left: Number(args.text) });
          break;
      }
    }

    sets(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search || Number(args.num) <= 0) return;
      
      const target = search.getElementsByTagName(args.type)[Number(args.num) - 1];
      if (!target) return;
      
      try {
        const styles = JSON.parse(args.text);
        const styleKeys = Object.keys(styles);
        let styleString = "";
        styleKeys.forEach(e => {
          if (typeof styles[e] === 'string' && !styles[e].includes("url")) {
            styleString += `${e}:${styles[e]};`;
          }
        });
        target.style.cssText = styleString;
      } catch (e) {
        console.error("WitCatMarkDown", e);
      }
    }

    imgstyle(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const imgs = search.getElementsByTagName('img');
      if (imgs.length > args.num - 1 && args.num > 0) {
        const img = imgs[args.num - 1];
        img.style.width = args.width === '' ? '' : `${args.width}px`;
        img.style.height = args.height === '' ? '' : `${args.height}px`;
      }
    }

    code(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const pres = search.getElementsByTagName('pre');
      if (pres.length > args.num - 1 && args.num > 0) {
        const codeElements = pres[args.num - 1].getElementsByTagName('code');
        Array.from(codeElements).forEach(e => {
          e.className = args.name;
        });
        
        if (this.Prism && this.Prism.highlightAll) {
          this.Prism.highlightAll();
        }
      }
    }

    ide(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      search.setAttribute('contenteditable', args.name);
      search.style.outline = 'none';
    }

    size(args) {
      const canvas = this._getCanvas();
      if (!canvas) return;
      
      if (args.type === 'true') {
        if (!this.resize) {
          this.resize = new ResizeObserver(() => {
            const scale = parseFloat(canvas.offsetWidth) / 360;
            document.documentElement.style.setProperty('--witcat-markdown-scale', `scale(${scale})`);
          });
          this.resize.observe(canvas);
        }
      } else {
        if (this.resize) {
          this.resize.disconnect();
          this.resize = null;
        }
      }
    }

    setfont(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (search) {
        search.style.fontFamily = `"${args.name}"`;
      }
    }

    loadfont(args) {
      const url = String(args.text);
      const name = String(args.name);
      
      if (url.startsWith("data:application/font-woff;")) {
        const font = new FontFace(name, `url(${url})`);
        font.load().then(function(loadedFont) {
          document.fonts.add(loadedFont);
        }).catch(function(error) {
          console.error('Font loading failed:', error);
        });
      } else if (
        url.startsWith('https://m.ccw.site') ||
        url.startsWith('https://m.xiguacity') ||
        url.startsWith('https://static.xiguacity')
      ) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
          document.fonts.add(new FontFace(name, this.response));
        };
        xhr.send();
      } else {
        console.warn('不允许的链接\nDisallowed links');
      }
    }

    getwidth(args) {
      const canvas = this._getCanvas();
      const inputParent = this._getInputParent();
      if (!canvas || !inputParent) return '';
      
      const runtime = Scratch.vm.runtime;
      if (!runtime) return '';
      
      const search = document.createElement('span');
      search.style.position = 'fixed';
      search.className = 'WitCatMarkDown';
      // 注意：getwidth 通常用于预估尺寸，这里也应用规则以保持一致性
      const processedContent = this._applyDynamicRules(String(args.content));
      search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(processedContent)}</div>`;
      
      if (document.body) {
        document.body.appendChild(search);
      }
      
      const cvsw = canvas.offsetWidth;
      const cvsh = canvas.offsetHeight;
      let outw;
      
      switch (args.type) {
        case 'width':
          outw = search.offsetWidth;
          if (document.body) {
            document.body.removeChild(search);
          }
          return outw * (runtime.stageWidth / (cvsw * 0.748));
        case 'height':
          outw = search.offsetHeight;
          if (document.body) {
            document.body.removeChild(search);
          }
          return outw * (runtime.stageHeight / (cvsh * 0.777));
      }
      return '';
    }

    click(args) {
      let out = '';
      if (Object.keys(this.markdownmousedown).length !== 0) {
        const s = document.getElementsByClassName('WitCatMarkDown');
        Array.from(s).forEach((e) => {
          if (e.contains(this.markdownmousedown.target)) {
            switch (args.clickmenu) {
              case 'markdown':
                out = e.parentElement.id.split('WitCatMarkDown')[1] || '';
                break;
              case 'type':
                out = this.markdownmousedown.target.tagName.toLowerCase();
                break;
              case 'number':
                const ss = e.getElementsByTagName(this.markdownmousedown.target.tagName.toLowerCase());
                for (let i = 0; i < ss.length; i++) {
                  if (ss[i] === this.markdownmousedown.target) {
                    out = i + 1;
                    return;
                  }
                }
                break;
            }
          }
        });
      }
      return out;
    }

    touchs(args) {
      let out = '';
      if (Object.keys(this.touchEvent).length !== 0) {
        const s = document.getElementsByClassName('WitCatMarkDown');
        Array.from(s).forEach((e) => {
          if (e.contains(this.touchEvent.target)) {
            switch (args.clickmenu) {
              case 'markdown':
                out = e.parentElement.id.split('WitCatMarkDown')[1] || '';
                break;
              case 'type':
                out = this.touchEvent.target.tagName.toLowerCase();
                break;
              case 'number':
                const ss = e.getElementsByTagName(this.touchEvent.target.tagName.toLowerCase());
                for (let i = 0; i < ss.length; i++) {
                  if (ss[i] === this.touchEvent.target) {
                    out = i + 1;
                    return;
                  }
                }
                break;
            }
          }
        });
      }
      return out;
    }

    touch(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return false;
      
      if (Number(args.number) > 0) {
        const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
        if (ele !== undefined) {
          return Object.keys(this.touchEvent).length !== 0 && this.touchEvent.target === ele;
        }
      } else {
        const ele = search.getElementsByTagName(String(args.type));
        return Object.keys(this.touchEvent).length !== 0 && 
               Array.from(ele).some((e) => e === this.touchEvent.target);
      }
      return false;
    }

    move(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      ele.style.transition = search.style.transition;
      ele.style.display = 'inline-block';
      const regex = /translate\([^,]+px, [^,]+px\)/g;
      ele.style.transform = `${ele.style.transform.replace(regex, '')} translate(${args.x}px,${args.y}px)`;
    }

    scale(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      ele.style.transition = search.style.transition;
      ele.style.display = 'inline-block';
      const regex = /scale\([^,], [^,]\)/g;
      ele.style.transform = `${ele.style.transform.replace(regex, '')} scale(${args.x},${args.y})`;
    }

    rot(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      ele.style.transition = search.style.transition;
      ele.style.display = 'inline-block';
      const regex = /rotate\([^)]+deg\)/g;
      ele.style.transform = `${ele.style.transform.replace(regex, '')} rotate(${args.y}deg)`;
    }

    dmove(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      ele.style.transition = search.style.transition;
      ele.style.display = 'inline-block';
      const regex = /translate3d\([^,]+px, [^,]+px, [^,]+px\)/g;
      ele.style.transform = `${ele.style.transform.replace(regex, '')} translate3d(${args.x}px,${args.y}px,${args.z}px)`;
    }

    drot(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      ele.style.display = 'inline-block';
      ele.style.transform = `${ele.style.transform.replace(/rotateX\([^,]+deg\)/g, '')} rotateX(${args.x}deg)`;
      ele.style.transform = `${ele.style.transform.replace(/rotateY\([^,]+deg\)/g, '')} rotateY(${args.y}deg)`;
      ele.style.transform = `${ele.style.transform.replace(/rotateZ\([^,]+deg\)/g, '')} rotateZ(${args.z}deg)`;
    }

    setinsite(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      const ele = search.getElementsByTagName(String(args.type))[Number(args.number) - 1];
      if (!ele) return;
      
      switch (String(args.input)) {
        case "shadow":
          ele.style.boxShadow = String(args.text);
          break;
        case "textShadow":
          ele.style.textShadow = String(args.text);
          break;
      }
    }

    transition(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      search.style.transition = `all ${args.s}s ${args.timing}`;
    }

    settextalign(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return;
      
      if (String(args.type) === 'all') {
        if (search.firstChild) {
          search.firstChild.style.float = String(args.text);
        }
      } else {
        const ele = search.getElementsByTagName(String(args.type))[Number(args.num) - 1];
        if (ele) {
          ele.style.float = String(args.text);
        }
      }
    }

    get(args) {
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (!search) return '';
      
      return this._getattrib(search, args.type);
    }

    delete(args) {
      const inputParent = this._getInputParent();
      if (!inputParent) return;
      
      const search = document.getElementById(`WitCatMarkDown${args.id}`);
      if (search) {
        inputParent.removeChild(search);
      }
    }

    deleteall() {
      const inputParent = this._getInputParent();
      if (!inputParent) return;
      
      const search = document.getElementsByClassName('WitCatMarkDownOut');
      while (search.length > 0) {
        inputParent.removeChild(search[0]);
      }
    }

    docss() {
      return `# 欢迎使用 Markdown 拓展

这是首次使用 **Markdown 拓展** 自动生成的内容，包含 Markdown 语法和拓展介绍。

## 文本样式

- 加粗：**加粗 1** __加粗 2__
- 斜体：*斜体 1* _斜体 2_
- 删除线：~~这是删除线文本~~
- 换行：在一行末尾加上两个空格  
就像这样

## 引用

> 白猫的 markdown 拓展！！！

## 链接

- 行内链接：[ccw 官网](https://www.ccw.site)
- 引用式链接：[CCW][ccw]
- 简写引用：[ccw][]

[ccw]: https://www.ccw.site "CCW 创作社区"

## 图片

![展示](https://m.xiguacity.cn/avatar/6173f57f48cf8f4796fc860e/dbadfc1c-3ab5-49a2-aa69-01465f3f0738.jpg?x-oss-process=image%2Fresize%2Cs_150%2Fformat%2Cwebp)

## 表格（支持合并）

| 列 1 | 列 2 | 列 3 | 列 4 |
|-----|:---:|----:|-----|
| A   | B   | C   | D   |
| 合并向右 > || E   | F   |
| G   | 合并向下 ^ | H | I |
| J   | ^         | K | L |

## 围栏代码块

\`\`\`javascript
function hello(name) {
  console.log("Hello, " + name + "!");
}
hello("白猫");
\`\`\`

## 定义列表

Markdown
: 一种轻量级标记语言

TurboWarp
: Scratch 的高性能分支
: 支持自定义扩展

## HTML 原始标签

<div style="padding:8px;border:1px dashed #1A96E2;border-radius:6px;background:#f0f8ff;">
这是一段 <b>原始 HTML</b>，可以写 <span style="color:red;">任意样式</span>。
</div>

## 转义字符

\\*这不是斜体\\* 、\\# 这不是标题 、\\| 这不是表格

## 无序列表

- 项目
  - 项目 1
    - 项目 A
    - 项目 B
  - 项目 2

## 有序列表

1. 项目 1
   1. 项目 A
   2. 项目 B
2. 项目 2

## 分割线

***
没错就是这个
***`;
    }

    _getattrib(element, type) {
      if (!(element instanceof HTMLDivElement)) return '';
      
      const runtime = Scratch.vm.runtime;
      if (!runtime) return '';
      
      switch (type) {
        case 'x':
          return (parseFloat(element.style.left) / 100) * runtime.stageWidth;
        case 'y':
          return (parseFloat(element.style.top) / 100) * runtime.stageHeight;
        case 'width':
          return (parseFloat(element.style.width) / 100) * runtime.stageWidth;
        case 'height':
          return (parseFloat(element.style.height) / 100) * runtime.stageHeight;
        case 'content':
          return element.innerText;
        case 'ContentHeight':
          return element.scrollHeight;
        case 'ContentWidth':
          return element.scrollWidth;
        case 'Longitudinal':
          return element.scrollTop;
        case 'Horizontal':
          return element.scrollLeft;
        case 'json':
          return JSON.stringify({
            X: this._getattrib(element, 'x'),
            Y: this._getattrib(element, 'y'),
            width: this._getattrib(element, 'width'),
            height: this._getattrib(element, 'height'),
            content: this._getattrib(element, 'content'),
          });
        default:
          return '';
      }
    }
  }

  // 注册扩展
  Scratch.extensions.register(new WitCatMarkDownExtension());
})(Scratch);

增加KaTeX 支持

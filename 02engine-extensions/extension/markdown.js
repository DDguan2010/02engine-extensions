// @name WitCatMarkDown
// @description 白猫的markdown / Make your text box more colorful (Optimized Version)
// @homepage https://www.ccw.site/student/6173f57f48cf8f4796fc860e
// @author 白猫 @ CCW
// ==/TurboWarp==

(function(Scratch) {
  'use strict';

  /* eslint-disable */
  
  // 工具函数：防抖 (Debounce)
  function _debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // 工具函数：节流 (Throttle)
  function _throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // ==================== Markdown解析器部分 ====================
  let markdownExpose = {};

  (function () {
    
    // 初始化自定义规则数组
    markdownExpose.customRules = [];

    // ======== 解析管线（固定解析 + 自定义规则）========
    markdownExpose.pipeline = [
      { id: 'normalizeNewlines', name: '换行规范化(\\r\\n/\\r -> \\n, \\n转义)', enabled: true },
      { id: 'protectHtmlBlock', name: '[html]块保护(把块内\\n替换为\\uE000)', enabled: true },
      { id: 'protectRowspan', name: '表格Rowspan保护(^^ -> \\uE001)', enabled: true },
      { id: 'customRules', name: '自定义规则(可多条)', enabled: true },
      { id: 'builtinHighlight', name: '内置高亮(==text== -> <mark>)', enabled: true },
      { id: 'builtinSup', name: '内置上标(^text^ -> <sup>)', enabled: true },
      { id: 'builtinSub', name: '内置下标(~text~ -> <sub>)', enabled: true },
      { id: 'restoreRowspan', name: '还原Rowspan(\\uE001 -> ^^)', enabled: true },
      { id: 'autoLineBreak', name: '自动换行(单\\n -> 两空格+\\n)', enabled: true }
    ];

    // 允许从 localStorage 恢复顺序
    try {
      const saved = localStorage.getItem('WitCatMarkDown_pipeline');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length) {
          const map = new Map(markdownExpose.pipeline.map(x => [x.id, x]));
          const merged = [];
          arr.forEach(item => { 
            let id = typeof item === 'string' ? item : item.id;
            let enabled = typeof item === 'object' ? item.enabled : true;
            if (map.has(id)) {
              let step = map.get(id);
              step.enabled = enabled;
              merged.push(step);
            }
          });
          markdownExpose.pipeline.forEach(x => { if (!merged.includes(x)) merged.push(x); });
          markdownExpose.pipeline = merged;
        }
      }
    } catch (e) {}

    function CloseTag(len) {
      this.len_after = len;
      this.name = "close";
    }

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
      this.underline_state = []; 
      this.debug_indent = "";
    });

    markdownExpose.parse = function (source, dialect) {
      var md = new Markdown(dialect);
      return md.toTree(source);
    };
     
    const regexProtectHtml = /\[html\]([\s\S]*?)\[\/html\]/gi;
    const regexRowspan = /\^\^/g;
    const regexHighlight = /==([\s\S]+?)==/g;
    const regexSup = /\^([\s\S]+?)\^/g;
    const regexSub = /~([\s\S]+?)~/g;
    const regexRestoreRowspan = /\uE001/g;
    const regexAutoLine = /([^\n])\n([^\n])/g;

    function witcatPreprocessMarkdownText(source) {
      try {
        if (source === null || source === undefined) return "";
        source = String(source);

        const pipe = markdownExpose.pipeline || [];
        for (let i = 0; i < pipe.length; i++) {
          const step = pipe[i];
          if (!step || step.enabled === false) continue;

          switch (step.id) {
            case 'normalizeNewlines':
              source = source.replace(/(\r\n|\r)/g, "\n");
              source = source.replace(/\\n/g, "\n");
              break;

            case 'protectHtmlBlock':
              source = source.replace(regexProtectHtml, function(match) {
                return match.replace(/\n/g, "\uE000");
              });
              break;

            case 'protectRowspan':
              source = source.replace(regexRowspan, "\uE001");
              break;

            case 'customRules':
              if (markdownExpose.customRules && markdownExpose.customRules.length > 0) {
                for (var r = 0; r < markdownExpose.customRules.length; r++) {
                  var rule = markdownExpose.customRules[r];
                  try {
                    var regex = rule.regex || rule;
                    var replaceStr = rule.replace;
                    if (regex instanceof RegExp) {
                      source = source.replace(regex, replaceStr);
                    }
                  } catch (err) {
                    console.warn('Custom rule replace error:', err);
                  }
                }
              }
              break;

            case 'builtinHighlight':
              source = source.replace(regexHighlight, "<mark>$1</mark>");
              break;

            case 'builtinSup':
              source = source.replace(regexSup, "<sup>$1</sup>");
              break;

            case 'builtinSub':
              source = source.replace(regexSub, "<sub>$1</sub>");
              break;

            case 'restoreRowspan':
              source = source.replace(regexRestoreRowspan, "^^");
              break;

            case 'autoLineBreak':
              if (window.WitCatMarkDownAutoLineBreak !== false) {
                source = source.replace(regexAutoLine, function (_, a, b) {
                  return a + "  \n" + b;
                });
              }
              break;
          }
        }

        return source;
      } catch (e) {
        return String(source);
      }
    }

    markdownExpose.toHTML = function toHTML(source, dialect, options) {
      var input = markdownExpose.toHTMLTree(source, dialect, options);
      return markdownExpose.renderJsonML(input);
    };

    markdownExpose.toHTMLTree = function toHTMLTree(input, dialect, options) {
      if (typeof input === "string") input = witcatPreprocessMarkdownText(input);
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
        htmlBlock: function htmlBlock(block, next) {
           var m = block.match(/^\[html\]([\s\S]*?)\[\/html\]/i);
           if (!m) return undefined;
           var content = m[1].replace(/\uE000/g, "\n");
           var node = [["raw_html", content]];
           if (m[0].length < block.length) {
             next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + count_lines(m[0])));
           }
           return node;
        },

        table: function table(block, next) {
          var lines = block.split('\n');
          if (lines.length < 2) return undefined;

          function splitTableRow(line) {
            if (!line.includes('|')) return null;
            var parts = line.split('|');
            if (parts.length > 0 && parts[0].trim() === '') parts.shift();
            if (parts.length > 0 && parts[parts.length - 1].trim() === '') parts.pop();
            return parts.map(function(s) { return s.trim(); });
          }

          var headers = splitTableRow(lines[0]);
          if (!headers) return undefined;
          
          var separatorLine = lines[1];
          if (!separatorLine.includes('|')) return undefined;
          var separators = splitTableRow(separatorLine);
          if (!separators) return undefined;

          var rawRows = [];
          for (var i = 2; i < lines.length; i++) {
            var rowCells = splitTableRow(lines[i]);
            if (rowCells) {
              rawRows.push(rowCells);
            } else {
              break; 
            }
          }

          var consumedLines = 2 + rawRows.length;
          var tableNode = ['table', { class: 'WitCatMarkDownTable' }];
          var thead = ['thead'];
          var headerRow = ['tr'];
          
          for (var h = 0; h < headers.length; h++) {
             var th = ['th'];
             th.push.apply(th, this.processInline(headers[h]));
             headerRow.push(th);
          }
          thead.push(headerRow);
          tableNode.push(thead);

          var tbody = ['tbody'];
          var activeRowspans = new Array(headers.length).fill(0);

          for (var r = 0; r < rawRows.length; r++) {
            var tr = ['tr'];
            var rowData = rawRows[r];
            var colCount = headers.length;
            var currentCellIdx = 0; 

            for (var c = 0; c < colCount; c++) {
              if (activeRowspans[c] > 0) {
                activeRowspans[c]--; 
                
                if (currentCellIdx < rowData.length) {
                   var cellContent = rowData[currentCellIdx];
                   if (cellContent === '^') {
                      currentCellIdx++;
                   } else {
                      currentCellIdx++; 
                   }
                }
                continue; 
              }

              var text = (currentCellIdx < rowData.length) ? rowData[currentCellIdx] : "";
              currentCellIdx++;

              var colspanMatch = text.match(/^>>(\d+)?$/);
              if (colspanMatch) {
                if (tr.length > 1) { 
                   var lastTd = tr[tr.length - 1];
                   if (lastTd) {
                      if (!lastTd[1]) lastTd[1] = {};
                      var currentSpan = parseInt(lastTd[1].colspan || 1);
                      var addSpan = colspanMatch[1] ? parseInt(colspanMatch[1]) : 1;
                      lastTd[1].colspan = currentSpan + addSpan;
                   }
                }
                continue;
              }

              var rowspanMatch = text.match(/^(.*)\^\^(\d+)?$/);
              if (rowspanMatch) {
                var content = rowspanMatch[1];
                var span = rowspanMatch[2] ? parseInt(rowspanMatch[2]) : 2; 
                
                var td = ['td'];
                if (content) td.push.apply(td, this.processInline(content));
                
                if (!td[1]) td[1] = {};
                td[1].rowspan = span;
                tr.push(td);

                activeRowspans[c] = span - 1;
                continue;
              }

              var td = ['td'];
              td.push.apply(td, this.processInline(text));
              tr.push(td);
            }
            tbody.push(tr);
          }
          tableNode.push(tbody);

          var remaining = lines.slice(consumedLines).join('\n');
          if (remaining) {
            next.unshift(mk_block(remaining, block.trailing, block.lineNumber + consumedLines));
          }

          return [['div', { class: 'WitCatMarkDownTableContainer' }, tableNode]];
        },

        fencedCode: function fencedCode(block, next) {
          var m = block.match(/^```([^\n`]*)\n([\s\S]*?)\n```[ \t]*(?:\n|$)/);
          if (!m) return undefined;
          var info = (m[1] || "").trim();
          var codeText = m[2] || "";
          var attrs = {};
          if (info) {
            var lang = String(info).split(/\s+/)[0];
            if (lang) {
              attrs.lang = lang;
            }
          }
          var node = ["fenced_code_block", attrs, codeText];
          if (m[0].length < block.length) {
            next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + count_lines(m[0])));
          }
          return [node];
        },

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
          var m = block.match(/^(.*)\n([-=])\2\2\2+(?:\n|$)/);
          if (!m) return undefined;
          var level = m[2] === "=" ? 1 : 2;
          var header = ["header", { level: level }, m[1]];
          if (m[0].length < block.length)
            next.unshift(mk_block(block.substr(m[0].length), block.trailing, block.lineNumber + 2));
          return [header];
        },

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

        para: function para(block, next) {
          return [["para"].concat(this.processInline(block))];
        },
      },
    };

    Markdown.dialects.Gruber.block.table = Markdown.dialects.Gruber.block.table;

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

      __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-]/,

      "\\": function escaped(text) {
        if (this.dialect.inline.__escape__.exec(text)) return [2, text.charAt(1)];
        else return [1, "\\"];
      },

      "{": function trigger(text) {
          var m = text.match(/^\{trigger=(\d+(?:\.\d+)?)\}\[(.*?)\]\((.*?)\)/);
          if (m) {
              return [m[0].length, ["button", {
                  class: "wc-trigger-btn",
                  "data-trigger-id": m[3],
                  "data-trigger-interval": m[1]
              }, this.processInline(m[2])]];
          }
          return [1, "{"];
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
        return [2, "!["];
      },

      "[": function linkAndTags(text) {
        
        var m = text.match(/^\[color=([#\w]+)\]([\s\S]*?)\[\/color\]/i);
        if (m) {
          return [m[0].length, ["span", { style: "color:" + m[1] }, this.processInline(m[2])]];
        }

        m = text.match(/^\[bg=([#\w]+)\]([\s\S]*?)\[\/bg\]/i);
        if (m) {
          return [m[0].length, ["span", { style: "background-color:" + m[1] }, this.processInline(m[2])]];
        }

        m = text.match(/^\[size=([\w%.]+)\]([\s\S]*?)\[\/size\]/i);
        if (m) {
          return [m[0].length, ["span", { style: "font-size:" + m[1] }, this.processInline(m[2])]];
        }
        
        m = text.match(/^\[center\]([\s\S]*?)\[\/center\]/i);
        if (m) {
          return [m[0].length, ["div", { style: "text-align:center;display:block;" }, this.processInline(m[1])]];
        }

        m = text.match(/^\[([a-zA-Z][\w-]*)\]([\s\S]*?)\[\/\1\]/i);
        if (m) {
          var tagName = m[1];
          var content = m[2];
          return [m[0].length, ["span", { class: "WitCatTag-" + tagName }, this.processInline(content)]];
        }

        var orig = String(text);
        var res = Markdown.DialectHelpers.inline_until_char.call(this, text.substr(1), "]");
        if (!res) return [1, "["];
        var consumed = 1 + res[0],
          children = res[1],
          link,
          attrs;
        text = text.substr(consumed);
        m = text.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/);
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
        if (children.length == 1 && typeof children[0] == "string") {
          attrs = { ref: children[0].toLowerCase(), original: orig.substr(0, consumed) };
          link = ["link_ref", attrs, children[0]];
          return [consumed, link];
        }
        return [1, "["];
      },

      "<": function autoLink(text) {
        var m;
        if ((m = text.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) != null) {
          if (m[3]) {
            return [m[0].length, ["link", { href: "mailto:" + m[3] }, m[3]]];
          } else if (m[2] == "mailto") {
            return [m[0].length, ["link", { href: m[1] }, m[1].substr("mailto:".length)]];
          } else return [m[0].length, ["link", { href: m[1] }, m[1]]];
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

      "  \n": function lineBreak(text) {
        return [3, ["linebreak"]];
      },

      "_": function underline(text, orig_match) {
        if (this.underline_state[0] == "_") {
          this.underline_state.shift();
          return [text.length, new CloseTag(text.length - "_".length)];
        } else {
          var other = this.em_state.slice(),
            state = this.strong_state.slice();
          this.underline_state.unshift("_");
          var res = this.processInline(text.substr("_".length));
          var last = res[res.length - 1];
          var check = this.underline_state.shift();
          if (last instanceof CloseTag) {
            res.pop();
            var consumed = text.length - last.len_after;
            return [consumed, ["u"].concat(res)]; 
          } else {
            this.em_state = other;
            this.strong_state = state;
            return ["_".length, "_"];
          }
        }
      },

      "-": function strikethrough(text) {
        var m = text.match(/^(-{1})([\s\S]+?)\1/);
        if (m) {
          return [m[0].length, ["s"].concat(this.processInline(m[2]))];
        }
        return [1, "-"];
      },
    };

    function strong_em(tag, md) {
      var state_slot = tag + "_state",
        other_slot = tag == "strong" ? "em_state" : "strong_state";

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
    
    Markdown.buildBlockOrder = function (d) {
      var ord = [];
      for (var i in d) {
        if (i == "__order__" || i == "__call__") continue;
        ord.push(i);
      }
      
      var priority = [
          'htmlBlock',
          'table',
          'fencedCode',
          'code',
          'lists',
          'blockquote',
          'horizRule',
          'atxHeader',
          'setextHeader',
          'referenceDefn',
          'para'
      ];

      ord.sort(function(a, b) {
        var ia = priority.indexOf(a);
        var ib = priority.indexOf(b);
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        return ia - ib;
      });
      d.__order__ = ord;
    };

    Markdown.buildInlinePatterns = function (d) {
      var patterns = [];
      for (var i in d) {
        if (i.match(/^__.*__$/)) continue;
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
        content.push(render_tree(jsonml, false));
      } else {
        jsonml.shift();
        if (jsonml.length && typeof jsonml[0] === "object" && !(jsonml[0] instanceof Array)) {
          jsonml.shift();
        }
        while (jsonml.length) {
          content.push(render_tree(jsonml.shift(), false));
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

    function render_tree(jsonml, inCode) {
      if (typeof jsonml === "string") {
        // 开启不安全 HTML 渲染，但如果处于代码块内部，依然要强制转义，防止代码变成真实 DOM
        return inCode ? escapeHTML(jsonml) : jsonml;
      }
      var tag = jsonml.shift();

      if (tag === "raw_html") {
         return jsonml[0]; 
      }

      var isCode = (tag === "code" || tag === "pre");
      var passInCode = inCode || isCode;

      var attributes = {},
        content = [];
      if (jsonml.length && typeof jsonml[0] === "object" && !(jsonml[0] instanceof Array)) {
        attributes = jsonml.shift();
      }
      while (jsonml.length) {
        content.push(render_tree(jsonml.shift(), passInCode));
      }
      var tag_attrs = "";
      for (var a in attributes) {
        tag_attrs += " " + a + '="' + escapeHTML(attributes[a]) + '"';
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
        case "raw_html":
          return ["raw_html", jsonml[1]];

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
        case "button":
          jsonml[0] = "button";
          break;
        case "code_block":
          jsonml[0] = "pre";
          i = attrs ? 2 : 1;
          var code = ["code"];
          code.push.apply(code, jsonml.splice(i, jsonml.length - i));
          jsonml[i] = code;
          break;

        case "fenced_code_block":
          jsonml[0] = "pre";
          i = attrs ? 2 : 1;
          var fencedCode = ["code"];
          if (attrs && attrs.lang) {
            fencedCode[1] = { class: "language-" + attrs.lang };
            delete attrs.lang;
          }
          fencedCode.push.apply(fencedCode, jsonml.splice(i, jsonml.length - i));
          jsonml[i] = fencedCode;
          break;

        case "inlinecode":
          jsonml[0] = "code";
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
        case "table":
          if (jsonml[0] === "table") {
            var tableContainer = ["div", { class: "WitCatMarkDownTableContainer" }];
            tableContainer.push(jsonml);
            return tableContainer;
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

  // ==================== Prism代码高亮库部分 ====================
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

  window.WitCatMarkDownAutoLineBreak = true;
  window.WitCatMarkDownMathBeautify = true;

  class WitCatMarkDownExtension {
    constructor() {
      this.markdownExpose = markdownExpose;
      this.Prism = Prism;
      this.markdownmousedown = markdownmousedown;
      this.touchEvent = touchEvent;
      this.resize = null;
      this.autoScaleObserver = null;
      this.autoScaleTimer = null;
      
      this._triggerTimestamps = {};
      this._activeTriggerId = null;
      this._activeTriggers = new Set(); 

      this.fileSystem = [
        { name: 'example.md', content: '# Welcome to WitCatMarkDown\nType your markdown here...' }
      ];
      this.currentFileIndex = 0;

      this._initEventListeners();
      this._addStyles();
      this._addScript();
      this._initEditor();
      this._initRulePanel();
    }

    getInfo() {
      return {
        id: extensionId,
        name: '白猫的markdown',
        color1: '#1c7321',
        color2: '#114514',
        blocks: [
          {
            opcode: 'whenTrigger',
            blockType: Scratch.BlockType.HAT,
            text: '当触发器 ID [ID] 被点击',
            isEdgeActivated: true, 
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'event1' }
            }
          },
          {
            opcode: 'setTriggerHTML',
            blockType: Scratch.BlockType.COMMAND,
            text: '自定义ID 为 [ID] 的互交按钮外观html为 [HTML]',
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'myEvent' },
              HTML: { type: Scratch.ArgumentType.STRING, defaultValue: '<b>Click Me</b>' }
            }
          },
          {
            opcode: 'openEditor',
            blockType: Scratch.BlockType.COMMAND,
            text: '打开 markdown 编辑器面板',
          },
          {
            opcode: 'openRuleManager',
            blockType: Scratch.BlockType.COMMAND,
            text: '打开自定义规则管理面板',
          },
          {
            opcode: 'importAllFiles',
            blockType: Scratch.BlockType.COMMAND,
            text: '导入所有文件 [json]',
            arguments: {
              json: { type: Scratch.ArgumentType.STRING, defaultValue: '[]' }
            }
          },
          {
            opcode: 'exportAllFiles',
            blockType: Scratch.BlockType.REPORTER,
            text: '导出所有文件(JSON)',
          },
          {
            opcode: 'createFromFile',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建 markdown ID[id] X[x] Y[y] 宽[width] 高[height] 从文件[filename]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              x: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
              width: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' },
              height: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' },
              filename: {
                type: Scratch.ArgumentType.STRING,
                menu: 'fileList'
              }
            }
          },
          {
            opcode: 'create',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建 markdown ID[id]X[x]Y[y]宽[width]高[height]内容[text]',
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
            text: '设置 markdown ID[id]的[type]为[text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              type: {
                type: Scratch.ArgumentType.STRING,
                menu: 'types'
              },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'addCustomRule',
            blockType: Scratch.BlockType.COMMAND,
            text: '添加自定义规则 匹配[match] 替换为[replace]',
            arguments: {
              match: { type: Scratch.ArgumentType.STRING, defaultValue: '\\[myTag\\](.*?)\\[\\/myTag\\]' },
              replace: { type: Scratch.ArgumentType.STRING, defaultValue: '<span style="color:red">$1</span>' }
            }
          },
          {
            opcode: 'clearCustomRules',
            blockType: Scratch.BlockType.COMMAND,
            text: '清空自定义规则',
          },
          {
            opcode: 'importCustomRulesJSON',
            blockType: Scratch.BlockType.COMMAND,
            text: '导入自定义解析式集json为 [JSON]',
            arguments: {
              JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '[{"match":"foo","replace":"bar"}]' }
            }
          },
          {
            opcode: 'importCustomRulesURL',
            blockType: Scratch.BlockType.COMMAND,
            text: '导入自定义解析式集网址为 [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://example.com/rules.json' }
            }
          },
          {
            opcode: 'sets',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id]第[num]个[type]的样式为[text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: {
                type: Scratch.ArgumentType.STRING,
                menu: 'settype'
              },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '{"color":"red"}' }
            }
          },
          {
            opcode: 'imgstyle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown ID[id]的第[num]张图片的宽[width]高[height]',
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
            text: '设置 markdown ID[id]第[num]个代码框的高亮为[name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'code'
              }
            }
          },
          {
            opcode: 'ide',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id]为[name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              name: {
                type: Scratch.ArgumentType.STRING,
                menu: 'ide'
              }
            }
          },
          {
            opcode: 'size',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown大小自适应[type]',
            arguments: {
              type: {
                type: Scratch.ArgumentType.STRING,
                menu: 'typess'
              }
            }
          },
          {
            opcode: 'autoline',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置自动换行为[enable]',
            arguments: {
              enable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'autoline'
              }
            }
          },
          {
            opcode: 'automath',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置数学符号优化为[enable]',
            arguments: {
              enable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'autoline'
              }
            }
          },
          {
            opcode: 'setfont',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id]的字体为[name]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              name: { type: Scratch.ArgumentType.STRING, defaultValue: 'arial' }
            }
          },
          {
            opcode: 'loadfont',
            blockType: Scratch.BlockType.COMMAND,
            text: '从[text]加载字体名[name]',
            arguments: {
              text: { type: Scratch.ArgumentType.STRING, defaultValue: 'url' },
              name: { type: Scratch.ArgumentType.STRING, defaultValue: 'arial' }
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
            text: 'markdown ID[id]的[type]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              type: {
                type: Scratch.ArgumentType.STRING,
                menu: 'type'
              }
            }
          },
          {
            opcode: 'getwidth',
            blockType: Scratch.BlockType.REPORTER,
            text: '获取内容[content]的渲染[type]',
            arguments: {
              content: { type: Scratch.ArgumentType.STRING, defaultValue: 'witcat' },
              type: {
                type: Scratch.ArgumentType.STRING,
                menu: 'width'
              }
            }
          },
          {
            opcode: 'click',
            blockType: Scratch.BlockType.REPORTER,
            text: '上次点击的元素的[clickmenu]',
            arguments: {
              clickmenu: {
                type: Scratch.ArgumentType.STRING,
                menu: 'clickmenu'
              }
            }
          },
          {
            opcode: 'touchs',
            blockType: Scratch.BlockType.REPORTER,
            text: '碰到的元素的[clickmenu]',
            arguments: {
              clickmenu: {
                type: Scratch.ArgumentType.STRING,
                menu: 'clickmenu'
              }
            }
          },
          {
            opcode: 'touch',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '碰到markdown[id]第[number]个[type]元素?',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' }
            }
          },
          {
            opcode: 'settextalign',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 markdown ID[id]第[num]个[type]为[text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              num: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'all' },
              text: {
                type: Scratch.ArgumentType.STRING,
                menu: 'textalign'
              }
            }
          },
          {
            opcode: 'move',
            blockType: Scratch.BlockType.COMMAND,
            text: 'markdown[id]第[number]个[type]元素偏移X[x]Y[y]',
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
            text: 'markdown[id]第[number]个[type]元素缩放X[x]Y[y]',
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
            text: 'markdown[id]第[number]个[type]元素旋转[y]',
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
            text: 'markdown[id]第[number]个[type]元素3D偏移X[x]Y[y]Z[z]',
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
            text: 'markdown[id]第[number]个[type]元素3D旋转X[x]Y[y]Z[z]',
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
            text: 'markdown[id]第[number]个[type]元素的[input]设为[text]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              number: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              type: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' },
              input: {
                type: Scratch.ArgumentType.STRING,
                menu: 'setinsite'
              },
              text: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
            }
          },
          {
            opcode: 'transition',
            blockType: Scratch.BlockType.COMMAND,
            text: '为markdown[id]设置过渡为[s]秒的[timing]',
            arguments: {
              id: { type: Scratch.ArgumentType.STRING, defaultValue: 'i' },
              s: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' },
              timing: {
                type: Scratch.ArgumentType.STRING,
                menu: 'timing'
              }
            }
          },
          {
            opcode: 'autoscale',
            blockType: Scratch.BlockType.COMMAND,
            text: '表格自动缩放[enable]',
            arguments: {
              enable: {
                type: Scratch.ArgumentType.STRING,
                menu: 'typess'
              }
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
          },{
            opcode: 'openDocs2',
            blockType: Scratch.BlockType.BUTTON,
            text: '📖拓展教程2',
            func: 'openDocs2'
          }
          
        ],
        menus: {
          fileList: {
            acceptReporters: true,
            items: '_getFileMenu'
          },
          autoline: [
            { text: '启用', value: 'true' },
            { text: '禁用', value: 'false' }
          ],
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
            { text: 'markdown来源', value: 'markdown' },
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

    _getFileMenu() {
        if (this.fileSystem.length === 0) {
            return [{ text: '无文件', value: '' }];
        }
        return this.fileSystem.map(f => ({ text: f.name, value: f.name }));
    }

    _initEventListeners() {
      if (typeof window !== 'undefined') {
        window.addEventListener('mousedown', (e) => {
          this.markdownmousedown = e;
        });

        window.addEventListener('mousemove', (e) => {
          this.touchEvent = e;
        });

        window.addEventListener('click', (e) => {
          if (!e || !e.target) return;
          const btn = e.target.closest('.wc-trigger-btn');
          
          if (btn) {
             const id = btn.getAttribute('data-trigger-id');
             const interval = parseFloat(btn.getAttribute('data-trigger-interval') || 0) * 1000;
             const now = Date.now();
             const last = this._triggerTimestamps[id] || 0;
             
             if (now - last >= interval) {
                 this._triggerTimestamps[id] = now;
                 if (Scratch.vm && Scratch.vm.runtime) {
                     this._activeTriggerId = id;
                     this._activeTriggers.add(id); 
                     Scratch.vm.runtime.startHats('WitCatMarkDown_whenTrigger');
                     setTimeout(() => {
                         this._activeTriggerId = null;
                         this._activeTriggers.delete(id);
                     }, 50);
                 }
             }
          }
        });

        window.addEventListener('click', async (e) => {
          try {
            if (!e || !e.target) return;
            var t = e.target;
            if (!(t instanceof HTMLElement)) return;
            if (!t.classList.contains('WitCatMarkDownCopyBtn')) return;

            var pre = t.closest('pre');
            if (!pre) return;

            var codeEl = pre.querySelector('code');
            var text = codeEl ? codeEl.innerText : pre.innerText;

            if (text) {
              text = String(text);
            } else {
              text = '';
            }

            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(text);
              t.setAttribute('data-state', 'copied');
              t.innerText = (t.innerText === 'copy' ? 'copied' : '已复制');
              setTimeout(function () {
                t.setAttribute('data-state', '');
                t.innerText = (t.innerText === 'copied' ? 'copy' : '复制');
              }, 800);
            } else {
              var ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.left = '-9999px';
              ta.style.top = '0';
              document.body.appendChild(ta);
              ta.focus();
              ta.select();
              var ok = false;
              try {
                ok = document.execCommand('copy');
              } catch (err) {
                ok = false;
              }
              document.body.removeChild(ta);
              if (ok) {
                t.setAttribute('data-state', 'copied');
                t.innerText = (t.innerText === 'copy' ? 'copied' : '已复制');
                setTimeout(function () {
                  t.setAttribute('data-state', '');
                  t.innerText = (t.innerText === 'copied' ? 'copy' : '复制');
                }, 800);
              } else {
                t.setAttribute('data-state', 'failed');
                t.innerText = (t.innerText === 'copy' ? 'failed' : '复制失败');
                setTimeout(function () {
                  t.setAttribute('data-state', '');
                  t.innerText = (t.innerText === 'failed' ? 'copy' : '复制');
                }, 800);
              }
            }
          } catch (err) {
            console.error('Copy code failed:', err);
          }
        }, true);

        // 使用防抖优化resize事件，避免高频触发重绘
        window.addEventListener('resize', _debounce(() => {
          this._adjustTables();
        }, 150));

        if (typeof MutationObserver !== 'undefined') {
          // 使用节流优化MutationObserver回调
          const throttledAdjust = _throttle(() => this._adjustTables(), 200);
          this.autoScaleObserver = new MutationObserver((mutations) => {
            let shouldAdjust = false;
            for (const mutation of mutations) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldAdjust = true;
                break;
              }
            }
            if (shouldAdjust) {
              throttledAdjust();
            }
          });
          
          this.autoScaleObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
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
        .WitCatMarkDowng-container { width: 240px; height: 100px; border-radius: 0.5em; background: #eee; }
        .WitCatMarkDowng-progress { width: 50%; height: inherit; border-radius: 0.5em; background: #0f0; }
        
        .wc-editor-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: sans-serif;
        }
        .wc-editor-window {
            width: 90%;
            height: 90%;
            background: #fff;
            border-radius: 8px;
            display: flex;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .wc-editor-sidebar {
            width: 250px;
            background: #f5f5f5;
            border-right: 1px solid #ddd;
            display: flex;
            flex-direction: column;
        }
        .wc-editor-sidebar-header {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            background: #e9e9e9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .wc-editor-file-list {
            flex: 1;
            overflow-y: auto;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .wc-editor-file-item {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        .wc-editor-file-item:hover { background: #e0e0e0; }
        .wc-editor-file-item.active { background: #1A96E2; color: #fff; }
        .wc-editor-file-controls {
            padding: 10px;
            display: flex;
            gap: 5px;
            border-top: 1px solid #ddd;
        }
        .wc-editor-btn {
            padding: 5px 10px;
            border: 1px solid #ccc;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            flex: 1;
            font-size: 12px;
        }
        .wc-editor-btn:hover { background: #f0f0f0; }
        .wc-editor-main {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .wc-editor-toolbar {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            background: #fafafa;
        }
        .wc-editor-toolbar-btn {
            padding: 4px 8px;
            border: 1px solid #ccc;
            background: #fff;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        }
        .wc-editor-toolbar-btn:hover { background: #1A96E2; color: #fff; border-color: #1A96E2; }
        
        .wc-editor-split-view {
            flex: 1;
            display: flex;
            height: 100%;
            overflow: hidden;
        }
        .wc-editor-area {
            width: 50%;
            padding: 15px;
            border: none;
            border-right: 1px solid #ddd;
            resize: none;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.5;
            outline: none;
            transition: background-color 0.2s;
        }
        .wc-editor-preview {
            width: 50%;
            padding: 15px;
            overflow: auto;
            background: #fff;
        }

        .wc-editor-footer {
            padding: 10px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            background: #f9f9f9;
        }
        .wc-file-action { font-size: 10px; cursor: pointer; margin-left: 5px; opacity: 0.7; }
        .wc-file-action:hover { opacity: 1; }

        .wc-rule-window { width: 600px; height: 500px; display: flex; flex-direction: column; padding:0; }
        .wc-rule-header { padding: 10px; background: #e9e9e9; font-weight: bold; border-bottom: 1px solid #ddd; display:flex; justify-content:space-between; }
        .wc-rule-controls { padding: 10px; background: #f9f9f9; border-bottom: 1px solid #ddd; display: flex; gap: 5px; flex-wrap: wrap; }
        .wc-rule-input { padding: 5px; border: 1px solid #ccc; border-radius: 4px; flex: 1; font-family: monospace; }
        .wc-rule-list { flex: 1; overflow-y: auto; padding: 0; margin: 0; list-style: none; background: #fff; }
        .wc-rule-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .wc-rule-item:hover { background: #f5f5f5; }
        .wc-rule-info { flex: 1; overflow: hidden; }
        .wc-rule-match { color: #d32f2f; font-family: monospace; font-weight: bold; }
        .wc-rule-arrow { margin: 0 5px; color: #999; }
        .wc-rule-replace { color: #388e3c; font-family: monospace; }
        .wc-rule-test-area { padding: 10px; border-top: 1px solid #ddd; background: #fafafa; display:flex; flex-direction:column; gap:5px; height: 120px; }
        .wc-rule-test-output { flex:1; border:1px solid #eee; background:#fff; padding:5px; overflow:auto; }

        .wc-trigger-btn {
          cursor: pointer;
          color: #1A96E2;
          text-decoration: none;
          background: #f0f7ff;
          border: 1px solid #1A96E2;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: inherit;
          font-size: 0.9em;
          margin: 0 2px;
          display: inline-block;
          transition: all 0.2s;
        }
        .wc-trigger-btn:hover {
          background: #1A96E2;
          color: white;
        }
        .wc-trigger-btn:active {
          transform: translateY(1px);
        }

        .WitCatMarkDown.auto-linebreak p,
        .WitCatMarkDown.auto-linebreak li,
        .WitCatMarkDown.auto-linebreak td,
        .WitCatMarkDown.auto-linebreak th {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        
        .WitCatMarkDown.no-linebreak p,
        .WitCatMarkDown.no-linebreak li,
        .WitCatMarkDown.no-linebreak td,
        .WitCatMarkDown.no-linebreak th {
          white-space: nowrap;
        }

        .WitCatMarkDown.math-beautify {
          font-variant-numeric: lining-nums;
        }
        .WitCatMarkDown.math-beautify .WitCatMath,
        .WitCatMarkDown.math-beautify .WitCatMathInline {
          font-family: "Cambria Math","STIX Two Math","Latin Modern Math","Times New Roman",serif;
          letter-spacing: 0.02em;
        }
        .WitCatMarkDown.math-beautify sup {
          font-size: 0.75em;
          line-height: 0;
          vertical-align: super;
        }
        .WitCatMarkDown.math-beautify sub {
          font-size: 0.75em;
          line-height: 0;
          vertical-align: sub;
        }
        
        .WitCatMarkDownTableContainer {
          width: 100%;
          margin: 1em 0;
          overflow-x: auto;
          position: relative;
          background: transparent !important;
        }
        
        .WitCatMarkDownTable {
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-collapse: collapse;
          width: auto;
          min-width: 100%;
          table-layout: auto;
          background: transparent !important;
        }
        
        .WitCatMarkDownTable th,
        .WitCatMarkDownTable td {
          border: 1px solid rgba(0, 0, 0, 0.2);
          padding: 8px;
          text-align: left;
          min-width: 60px;
          background: transparent !important;
        }
        
        .WitCatMarkDownTable th {
          background-color: rgba(242, 242, 242, 0.5) !important;
          font-weight: bold;
        }
        
        .WitCatMarkDownTable tr {
          background: transparent !important;
        }
        
        .WitCatMarkDownTable tr:hover {
          background-color: rgba(245, 245, 245, 0.5) !important;
        }
        
        .WitCatMarkDownTable.auto-scaled {
          width: 100% !important;
          table-layout: fixed;
        }
        
        .WitCatMarkDownTable.auto-scaled th,
        .WitCatMarkDownTable.auto-scaled td {
          padding: 12px 16px;
        }
        
        .WitCatMarkDownTableContainer::-webkit-scrollbar {
          height: 8px;
          background: rgba(241, 241, 241, 0.5);
        }
        
        .WitCatMarkDownTableContainer::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.7);
          border-radius: 4px;
        }
        
        .WitCatMarkDownTableContainer::-webkit-scrollbar-thumb:hover {
          background: rgba(85, 85, 85, 0.8);
        }

        code[class*=language-], pre[class*=language-] { color: #000; background: 0 0; text-shadow: 0 1px #fff; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 1em; text-align: left; white-space: pre; word-spacing: normal; word-break: normal; word-wrap: normal; line-height: 1.5; -moz-tab-size: 4; -o-tab-size: 4; tab-size: 4; -webkit-hyphens: none; -moz-hyphens: none; -ms-hyphens: none; hyphens: none; }
        code[class*=language-] ::selection, code[class*=language-]::selection, pre[class*=language-] ::selection, pre[class*=language-]::selection { text-shadow: none; background: #b3d4fc; }
        code[class*=language-] ::selection, code[class*=language-]::selection, pre[class*=language-] ::selection, pre[class*=language-]::-selection { text-shadow: none; background: #b3d4fc; }
        @media print { code[class*=language-], pre[class*=language-] { text-shadow: none; } }
        pre[class*=language-] { padding: 1em; margin: .5em 0; overflow: auto; }
        :not(pre)>code[class*=language-], pre[class*=language-] { background: transparent !important; }
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

        .WitCatMarkDown pre{ position: relative; }
        .WitCatMarkDownCopyBtn{
          position:absolute;
          top:6px;
          right:6px;
          font-size:12px;
          padding:4px 8px;
          border-radius:6px;
          border:1px solid rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.85);
          color:#1A96E2;
          cursor:pointer;
          user-select:none;
        }
        .WitCatMarkDownCopyBtn:hover{
          background: rgba(255,255,255,1);
        }
        .WitCatMarkDownCopyBtn[data-state="copied"]{
          color:#1c7321;
          border-color: rgba(28,115,33,0.35);
        }
        .WitCatMarkDownCopyBtn[data-state="failed"]{
          color:#c00;
          border-color: rgba(204,0,0,0.35);
        }

        .WitCatMarkDown u {
          text-decoration: underline;
        }
        .WitCatMarkDown s {
          text-decoration: line-through;
        }
        .WitCatMarkDownRight {
          display: inline-block;
          float: right;
        }
        .WitCatTag-warning { color: #b45309; font-weight: bold; }
        .WitCatTag-note { color: #2563eb; }
        .WitCatTag-tip { color: #059669; font-style: italic; }
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

    _initEditor() {
        if (typeof document === 'undefined') return;
        
        if (document.getElementById('WitCatEditorPanel')) return;

        const html = `
        <div id="WitCatEditorPanel" class="wc-editor-overlay" style="display: none;">
            <div class="wc-editor-window">
                <div class="wc-editor-sidebar">
                    <div class="wc-editor-sidebar-header">
                        <span>文件列表</span>
                        <input type="file" id="wc-import-file" style="display:none;" accept=".txt,.md">
                        <button class="wc-editor-btn" onclick="document.getElementById('wc-import-file').click()">导入TXT</button>
                    </div>
                    <ul class="wc-editor-file-list" id="wc-file-list"></ul>
                    <div class="wc-editor-file-controls">
                        <button class="wc-editor-btn" id="wc-btn-new">新建</button>
                        <button class="wc-editor-btn" id="wc-btn-copy-md">复制 MD</button>
                    </div>
                </div>
                <div class="wc-editor-main">
                    <div class="wc-editor-toolbar" id="wc-toolbar"></div>
                    <div class="wc-editor-split-view">
                        <textarea class="wc-editor-area" id="wc-editor-textarea" placeholder="在此输入 Markdown... 可以拖入本地图片转Base64"></textarea>
                        <div id="wc-editor-preview" class="WitCatMarkDown wc-editor-preview"></div>
                    </div>
                    <div class="wc-editor-footer">
                        <button class="wc-editor-btn" id="wc-btn-save">保存当前文件</button>
                        <button class="wc-editor-btn" style="background:#fcecec;border-color:#f5c6c6;" id="wc-btn-close">关闭面板</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);

        document.getElementById('wc-btn-close').onclick = () => {
            document.getElementById('WitCatEditorPanel').style.display = 'none';
        };
        
        document.getElementById('wc-btn-new').onclick = () => {
            const name = prompt('文件名:', 'new_file.md');
            if(name) {
                this.fileSystem.push({ name: name, content: '' });
                this.currentFileIndex = this.fileSystem.length - 1;
                this._renderFileList();
                this._loadCurrentFile();
            }
        };

        document.getElementById('wc-btn-save').onclick = () => {
            const content = document.getElementById('wc-editor-textarea').value;
            if(this.fileSystem[this.currentFileIndex]) {
                this.fileSystem[this.currentFileIndex].content = content;
                alert('已保存!');
            }
        };

        document.getElementById('wc-btn-copy-md').onclick = () => {
            const content = document.getElementById('wc-editor-textarea').value;
            navigator.clipboard.writeText(content).then(() => alert('Markdown 内容已复制到剪贴板'));
        };

        document.getElementById('wc-import-file').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.fileSystem.push({ name: file.name, content: e.target.result });
                this.currentFileIndex = this.fileSystem.length - 1;
                this._renderFileList();
                this._loadCurrentFile();
            };
            reader.readAsText(file);
            e.target.value = ''; 
        };

        const textarea = document.getElementById('wc-editor-textarea');
        const preview = document.getElementById('wc-editor-preview');

        // 使用防抖优化预览更新
        const debouncedUpdate = _debounce(() => {
             const content = textarea.value;
             
             if(this.fileSystem[this.currentFileIndex]) {
                 this.fileSystem[this.currentFileIndex].content = content;
             }

             preview.innerHTML = this.markdownExpose.toHTML(content);
             
             this._addCopyButtons(preview);
             this._applyMathBeautify(preview);
             if (window.Prism && window.Prism.highlightAllUnder) {
                 window.Prism.highlightAllUnder(preview);
             }
             this._adjustTables();
        }, 300);

        textarea.addEventListener('input', debouncedUpdate);

        // 拖拽本地图片转 Base64 语法
        textarea.addEventListener('dragover', (e) => {
            e.preventDefault();
            textarea.style.backgroundColor = '#f0f7ff';
        });

        textarea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            textarea.style.backgroundColor = '';
        });

        textarea.addEventListener('drop', (e) => {
            e.preventDefault();
            textarea.style.backgroundColor = '';
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const imgSyntax = `![${file.name}](${base64})`;
                        
                        textarea.value = text.substring(0, start) + imgSyntax + text.substring(end);
                        textarea.selectionStart = textarea.selectionEnd = start + imgSyntax.length;
                        
                        textarea.dispatchEvent(new Event('input'));
                    };
                    reader.readAsDataURL(file);
                }
            }
        });

        // 剪贴板粘贴本地图片转 Base64 语法
        textarea.addEventListener('paste', (e) => {
            if (e.clipboardData && e.clipboardData.items) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        const file = items[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target.result;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const imgSyntax = `![image](${base64})`;
                            
                            textarea.value = text.substring(0, start) + imgSyntax + text.substring(end);
                            textarea.selectionStart = textarea.selectionEnd = start + imgSyntax.length;
                            
                            textarea.dispatchEvent(new Event('input'));
                        };
                        reader.readAsDataURL(file);
                        e.preventDefault();
                        break;
                    }
                }
            }
        });

        let isSyncingLeftScroll = false;
        let isSyncingRightScroll = false;

        textarea.addEventListener('scroll', function() {
            if (!isSyncingLeftScroll) {
                isSyncingRightScroll = true;
                const percentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
                preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
                setTimeout(() => isSyncingRightScroll = false, 50); 
            }
        });

        preview.addEventListener('scroll', function() {
            if (!isSyncingRightScroll) {
                isSyncingLeftScroll = true;
                const percentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
                textarea.scrollTop = percentage * (textarea.scrollHeight - textarea.clientHeight);
                setTimeout(() => isSyncingLeftScroll = false, 50);
            }
        });

        this._initToolbar();
        this._renderFileList();
        this._loadCurrentFile();
    }

    _initRulePanel() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('WitCatRulePanel')) return;

        const html = `
        <div id="WitCatRulePanel" class="wc-editor-overlay" style="display: none;">
            <div class="wc-editor-window wc-rule-window">
                <div class="wc-rule-header">
                    <span>自定义规则管理</span>
                    <button class="wc-editor-btn" style="flex:0 0 50px;background:#fcecec;border-color:#f5c6c6;" onclick="document.getElementById('WitCatRulePanel').style.display='none'">关闭</button>
                </div>
                <div class="wc-rule-controls" style="border-bottom:none;">
                    <span style="font-weight:bold;flex:1;display:flex;align-items:center;">解析顺序(拖动排序)</span>
                    <button class="wc-editor-btn" style="flex:0 0 60px;" id="wc-pipe-reset-btn">重置</button>
                </div>
                <ul id="wc-pipe-list" class="wc-rule-list" style="max-height:160px; border-bottom:1px solid #ddd;"></ul>
                <div class="wc-rule-controls">
                    <input id="wc-rule-match-input" class="wc-rule-input" placeholder="匹配正则 (如 \\[tag\\](.*?)\\[/tag\\])">
                    <input id="wc-rule-replace-input" class="wc-rule-input" placeholder="替换内容 (如 <b>$1</b>)">
                    <button class="wc-editor-btn" style="flex:0 0 60px;" id="wc-rule-add-btn">添加</button>
                </div>
                <div class="wc-rule-controls" style="border-top:none;">
                    <input id="wc-rule-search" class="wc-rule-input" placeholder="搜索规则...">
                    <button class="wc-editor-btn" id="wc-rule-import-btn">导入JSON</button>
                    <button class="wc-editor-btn" id="wc-rule-export-btn">导出JSON</button>
                    <button class="wc-editor-btn" style="background:#fcecec;" id="wc-rule-clear-btn">清空所有</button>
                    <input type="file" id="wc-rule-import-file" style="display:none;" accept=".json">
                </div>
                <ul id="wc-rule-list" class="wc-rule-list"></ul>
                <div class="wc-rule-test-area">
                    <input id="wc-rule-test-input" class="wc-rule-input" placeholder="在此输入测试文本查看效果...">
                    <div id="wc-rule-test-output" class="WitCatMarkDown wc-rule-test-output">预览结果</div>
                </div>
            </div>
        </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);

        const listEl = document.getElementById('wc-rule-list');
        const matchInput = document.getElementById('wc-rule-match-input');
        const replaceInput = document.getElementById('wc-rule-replace-input');
        const searchInput = document.getElementById('wc-rule-search');
        const testInput = document.getElementById('wc-rule-test-input');
        const testOutput = document.getElementById('wc-rule-test-output');
        const pipeListEl = document.getElementById('wc-pipe-list');

        const savePipelineOrder = () => {
          try {
            const dataToSave = this.markdownExpose.pipeline.map(x => ({ id: x.id, enabled: x.enabled }));
            localStorage.setItem('WitCatMarkDown_pipeline', JSON.stringify(dataToSave));
          } catch (e) {}
        };

        const renderPipeline = () => {
          const pipe = this.markdownExpose.pipeline || [];
          pipeListEl.innerHTML = '';

          pipe.forEach((step, index) => {
            const li = document.createElement('li');
            li.className = 'wc-rule-item';
            li.draggable = true;
            li.dataset.index = String(index);
            li.style.cursor = 'grab';

            let extra = '';
            if (step.id === 'customRules') {
              extra = `（${(this.markdownExpose.customRules || []).length}条）`;
            }

            li.innerHTML = `
              <div class="wc-rule-info" style="pointer-events: none;">
                <span class="wc-rule-match">${index + 1}.</span>
                <span style="margin-left:8px; font-family: sans-serif; font-size: 13px;">${step.name}${extra}</span>
              </div>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <span style="font-size:12px;color:#666;">启用</span>
                <input type="checkbox" ${step.enabled === false ? '' : 'checked'}>
              </label>
            `;

            // 启用/禁用
            li.querySelector('input[type="checkbox"]').onchange = (e) => {
              step.enabled = !!e.target.checked;
              savePipelineOrder();
              updateTestPreview();
            };

            // 拖动排序
            li.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', li.dataset.index);
              e.dataTransfer.effectAllowed = 'move';
              li.style.opacity = '0.5';
            });
            li.addEventListener('dragend', (e) => {
              li.style.opacity = '1';
            });
            li.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              li.style.background = '#f0f7ff';
            });
            li.addEventListener('dragleave', (e) => {
              li.style.background = '';
            });
            li.addEventListener('drop', (e) => {
              e.preventDefault();
              li.style.background = '';
              const fromStr = e.dataTransfer.getData('text/plain');
              if(!fromStr) return;
              const from = Number(fromStr);
              const to = Number(li.dataset.index);
              if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;

              const arr = this.markdownExpose.pipeline;
              const item = arr.splice(from, 1)[0];
              arr.splice(to, 0, item);

              savePipelineOrder();
              renderPipeline();
              updateTestPreview();
            });

            pipeListEl.appendChild(li);
          });
        };

        document.getElementById('wc-pipe-reset-btn').onclick = () => {
          if (!confirm('确定重置解析顺序吗？')) return;
          localStorage.removeItem('WitCatMarkDown_pipeline');
          location.reload();
        };

        const renderRules = () => {
            const filter = searchInput.value.toLowerCase();
            listEl.innerHTML = '';
            
            this.markdownExpose.customRules.forEach((rule, index) => {
                const matchStr = rule.regex instanceof RegExp ? rule.regex.source : String(rule.match || rule.regex);
                const replaceStr = rule.replace;

                if (filter && !matchStr.toLowerCase().includes(filter) && !replaceStr.toLowerCase().includes(filter)) {
                    return;
                }

                const li = document.createElement('li');
                li.className = 'wc-rule-item';
                li.innerHTML = `
                    <div class="wc-rule-info">
                        <span class="wc-rule-match">${matchStr.replace(/</g, '&lt;')}</span>
                        <span class="wc-rule-arrow">➜</span>
                        <span class="wc-rule-replace">${replaceStr.replace(/</g, '&lt;')}</span>
                    </div>
                    <button class="wc-editor-btn" style="flex:0 0 40px;margin-left:10px;">删</button>
                `;
                
                li.querySelector('button').onclick = () => {
                    this.markdownExpose.customRules.splice(index, 1);
                    renderRules();
                    renderPipeline();
                    updateTestPreview();
                };

                listEl.appendChild(li);
            });
        };

        document.getElementById('wc-rule-add-btn').onclick = () => {
            const m = matchInput.value;
            const r = replaceInput.value;
            if (!m || !r) {
                alert("请填写匹配正则和替换内容");
                return;
            }
            try {
                new RegExp(m);
                this.addCustomRule({ match: m, replace: r });
                matchInput.value = '';
                replaceInput.value = '';
                renderRules();
                renderPipeline();
                updateTestPreview();
            } catch (e) {
                alert("正则表达式错误: " + e.message);
            }
        };

        searchInput.addEventListener('input', _debounce(renderRules, 200));

        document.getElementById('wc-rule-clear-btn').onclick = () => {
            if(confirm("确定清空所有自定义规则吗？")) {
                this.markdownExpose.customRules = [];
                renderRules();
                renderPipeline();
                updateTestPreview();
            }
        };

        document.getElementById('wc-rule-export-btn').onclick = () => {
            const exportData = this.markdownExpose.customRules.map(r => ({
                match: r.regex instanceof RegExp ? r.regex.source : r.match,
                replace: r.replace
            }));
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {type : 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'witcat_rules.json';
            a.click();
        };

        document.getElementById('wc-rule-import-btn').onclick = () => {
            document.getElementById('wc-rule-import-file').click();
        };

        document.getElementById('wc-rule-import-file').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            if (item.match && item.replace) {
                                this.addCustomRule({ match: item.match, replace: item.replace });
                            }
                        });
                        renderRules();
                        renderPipeline();
                        updateTestPreview();
                        alert(`成功导入 ${data.length} 条规则`);
                    }
                } catch (err) {
                    alert("导入失败: JSON格式错误");
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        };

        const updateTestPreview = _debounce(() => {
            const txt = testInput.value;
            testOutput.innerHTML = this.markdownExpose.toHTML(txt);
        }, 300);
        testInput.addEventListener('input', updateTestPreview);

        renderRules();
        renderPipeline();
    }

    _initToolbar() {
        const toolbar = document.getElementById('wc-toolbar');
        const textarea = document.getElementById('wc-editor-textarea');
        
        const tools = [
            { label: '粗体', pre: '**', suf: '**' },
            { label: '斜体', pre: '*', suf: '*' },
            { label: '下划线', pre: '_', suf: '_' },
            { label: '删除线', pre: '-', suf: '-' },
            { label: 'HTML块', pre: '[html]\n', suf: '\n[/html]' },
            { label: '代码块', pre: '```\n', suf: '\n```' },
            { label: '标签', pre: '[tip]', suf: '[/tip]' },
            { label: '引用', pre: '> ', suf: '' },
            { label: '表格', action: 'table' },
            { label: '列表', pre: '- ', suf: '' },
            { label: '图片', pre: '![描述](', suf: ')' },
            { label: '链接', pre: '[文本](', suf: ')' },
            { label: '分割线', pre: '\n***\n', suf: '' }
        ];

        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = 'wc-editor-toolbar-btn';
            btn.innerText = tool.label;
            btn.onclick = () => {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const selected = text.substring(start, end);

                if (tool.action === 'table') {
                    const tableTemplate = `\n| 标题1 | 标题2 | 标题3 |\n|---|---|---|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n`;
                    textarea.setRangeText(tableTemplate, start, end, 'end');
                } else {
                    textarea.setRangeText(tool.pre + selected + tool.suf, start, end, 'select');
                }
                
                textarea.focus();
                textarea.dispatchEvent(new Event('input'));
            };
            toolbar.appendChild(btn);
        });
    }

    _renderFileList() {
        const list = document.getElementById('wc-file-list');
        list.innerHTML = '';
        this.fileSystem.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'wc-editor-file-item' + (index === this.currentFileIndex ? ' active' : '');
            
            const spanName = document.createElement('span');
            spanName.innerText = file.name;
            spanName.onclick = () => {
                this.currentFileIndex = index;
                this._renderFileList();
                this._loadCurrentFile();
            };

            const divActions = document.createElement('div');
            
            const btnDel = document.createElement('span');
            btnDel.className = 'wc-file-action';
            btnDel.innerText = '❌';
            btnDel.onclick = (e) => {
                e.stopPropagation();
                if(confirm(`删除 ${file.name}?`)) {
                    this.fileSystem.splice(index, 1);
                    if(this.currentFileIndex >= this.fileSystem.length) this.currentFileIndex = Math.max(0, this.fileSystem.length - 1);
                    this._renderFileList();
                    this._loadCurrentFile();
                }
            };

            divActions.appendChild(btnDel);
            li.appendChild(spanName);
            li.appendChild(divActions);
            list.appendChild(li);
        });
    }

    _loadCurrentFile() {
        const textarea = document.getElementById('wc-editor-textarea');
        if (this.fileSystem.length > 0 && this.fileSystem[this.currentFileIndex]) {
            textarea.value = this.fileSystem[this.currentFileIndex].content;
            textarea.disabled = false;
            textarea.dispatchEvent(new Event('input'));
        } else {
            textarea.value = '';
            textarea.disabled = true;
            document.getElementById('wc-editor-preview').innerHTML = '';
        }
    }

    openEditor() {
        const panel = document.getElementById('WitCatEditorPanel');
        if(panel) {
            panel.style.display = 'flex';
            this._renderFileList(); 
            this._loadCurrentFile(); 
        }
    }

    openRuleManager() {
        const panel = document.getElementById('WitCatRulePanel');
        if(panel) {
            panel.style.display = 'flex';
            const searchInput = document.getElementById('wc-rule-search');
            if (searchInput) {
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    }

    importAllFiles(args) {
        try {
            const data = JSON.parse(args.json);
            if (Array.isArray(data)) {
                this.fileSystem = data;
                this.currentFileIndex = 0;
                this._renderFileList();
                this._loadCurrentFile();
            }
        } catch (e) {
            console.error('Import failed', e);
        }
    }

    exportAllFiles() {
        return JSON.stringify(this.fileSystem);
    }

    createFromFile(args) {
        const filename = args.filename;
        const file = this.fileSystem.find(f => f.name === filename);
        const content = file ? file.content : 'File not found';
        
        this.create({
            id: args.id,
            x: args.x,
            y: args.y,
            width: args.width,
            height: args.height,
            text: content
        });
    }

    _adjustTables() {
      try {
        const containers = document.querySelectorAll('.WitCatMarkDownTableContainer');
        if (!containers || !containers.length) return;
        
        // 性能优化：将读取属性和写入属性分离以避免强制同步布局
        const adjustments = [];

        containers.forEach((container) => {
          const table = container.querySelector('.WitCatMarkDownTable');
          if (!table) return;
          
          const containerWidth = container.offsetWidth;
          if (!containerWidth) return;
          
          const tableWidth = table.offsetWidth;
          
          adjustments.push({ table, containerWidth, tableWidth, container });
        });

        adjustments.forEach(({ table, containerWidth, tableWidth }) => {
          if (tableWidth < containerWidth) {
            table.classList.add('auto-scaled');
            table.style.width = '100%';
            
            const firstRow = table.querySelector('tr');
            if (firstRow) {
              const cellCount = firstRow.querySelectorAll('th, td').length;
              if (cellCount > 0) {
                const columnWidth = (100 / cellCount) + '%';
                const cells = table.querySelectorAll('th, td');
                cells.forEach(cell => {
                  cell.style.width = columnWidth;
                });
              }
            }
          } else {
            table.classList.remove('auto-scaled');
            table.style.width = 'auto';
            
            const cells = table.querySelectorAll('th, td');
            cells.forEach(cell => {
              cell.style.width = '';
            });
          }
        });
      } catch (err) {
        console.error('Adjust tables failed:', err);
      }
    }

    _addCopyButtons(container) {
      try {
        if (!container || typeof container.querySelectorAll !== 'function') return;
        var pres = container.querySelectorAll('pre');
        if (!pres || !pres.length) return;
        Array.from(pres).forEach(function (pre) {
          if (!(pre instanceof HTMLElement)) return;
          if (pre.querySelector('.WitCatMarkDownCopyBtn')) return;
          var btn = document.createElement('div');
          btn.className = 'WitCatMarkDownCopyBtn';
          btn.setAttribute('data-state', '');
          btn.innerText = '复制';
          pre.appendChild(btn);
        });
      } catch (err) {
        console.error('Add copy buttons failed:', err);
      }
    }

    _updateLineBreakClass() {
      try {
        const markdownContainers = document.querySelectorAll('.WitCatMarkDown');
        markdownContainers.forEach(container => {
          if (window.WitCatMarkDownAutoLineBreak) {
            container.classList.remove('no-linebreak');
            container.classList.add('auto-linebreak');
          } else {
            container.classList.remove('auto-linebreak');
            container.classList.add('no-linebreak');
          }
        });
      } catch (err) {
        console.error('Update line break class failed:', err);
      }
    }

    _shouldSkipMathNode(node) {
      try {
        if (!node) return true;
        var el = node.nodeType === 1 ? node : node.parentElement;
        if (!el) return true;
        if (el.closest && el.closest('code, pre, kbd, samp, textarea, input')) return true;
        if (el.classList && (el.classList.contains('token'))) return true; 
        return false;
      } catch (e) {
        return true;
      }
    }

    // 预编译正则提高数学符号替换性能
    _mathRegexes = [
        [/!=/g, "≠"], [/>=/g, "≥"], [/<=/g, "≤"], [/->/g, "→"], [/<-/g, "←"], [/<=>/g, "↔"],
        [/\b(infty|infinity)\b/gi, "∞"],
        [/\bpi\b/gi, "π"], [/\btheta\b/gi, "θ"], [/\balpha\b/gi, "α"], [/\bbeta\b/gi, "β"],
        [/\bgamma\b/gi, "γ"], [/\bdelta\b/gi, "δ"], [/\blambda\b/gi, "λ"], [/\bmu\b/gi, "μ"],
        [/\bsigma\b/gi, "σ"], [/\bomega\b/gi, "ω"],
        [/\bsqrt\s*\(/gi, "√("],
        [/(\d|\))\s*\*\s*(\d|\(|[A-Za-z])/g, "$1×$2"],
        [/([A-Za-z]|\))\s*\*\s*(\d|\(|[A-Za-z])/g, "$1·$2"],
        [/(\d+)\s*\/\s*(\d+)/g, "$1÷$2"],
        [/\^2/g, "²"], [/\^3/g, "³"], [/\^1/g, "¹"], [/\^0/g, "⁰"],
        [/\+\-/g, "±"]
    ];

    _beautifyMathText(s) {
      try {
        s = String(s);
        const len = this._mathRegexes.length;
        for (let i = 0; i < len; i++) {
            s = s.replace(this._mathRegexes[i][0], this._mathRegexes[i][1]);
        }
        return s;
      } catch (e) {
        return String(s);
      }
    }

    _applyMathBeautify(container) {
      try {
        if (!container || !container.querySelectorAll) return;
        if (window.WitCatMarkDownMathBeautify !== true) return;

        if (container.classList) {
          container.classList.add('math-beautify');
        }

        var walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              try {
                if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
                if (this._shouldSkipMathNode(node)) return NodeFilter.FILTER_REJECT;
                if (!/[0-9+\-*/^=<>]/.test(node.nodeValue) && !/\b(pi|theta|sqrt|infty|infinity|alpha|beta|gamma|delta|lambda|mu|sigma|omega)\b/i.test(node.nodeValue)) {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              } catch (e) {
                return NodeFilter.FILTER_REJECT;
              }
            }
          },
          false
        );

        var toUpdate = [];
        var n;
        while ((n = walker.nextNode())) {
          toUpdate.push(n);
        }

        for (var i = 0; i < toUpdate.length; i++) {
          var node = toUpdate[i];
          var oldText = node.nodeValue;
          var newText = this._beautifyMathText(oldText);
          if (newText !== oldText) {
            node.nodeValue = newText;
          }
        }
      } catch (err) {
        console.error('Apply math beautify failed:', err);
      }
    }

    _updateMathBeautifyClass() {
      try {
        const markdownContainers = document.querySelectorAll('.WitCatMarkDown');
        markdownContainers.forEach(container => {
          if (window.WitCatMarkDownMathBeautify) {
            container.classList.add('math-beautify');
          } else {
            container.classList.remove('math-beautify');
          }
        });
      } catch (err) {
        console.error('Update math beautify class failed:', err);
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
    openDocs2() {
      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = 'https://learn.ccw.site/article/96ade444-d0e9-4066-8541-eb17d3257f14';
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        a.click();
      }
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
      
      search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(String(args.text))}</div>`;
      inputParent.appendChild(search);

      this._updateLineBreakClass();
      this._updateMathBeautifyClass();

      if (search.firstChild) {
        this._addCopyButtons(search.firstChild);
        this._applyMathBeautify(search.firstChild);
      }
      
      setTimeout(() => {
        this._adjustTables();
      }, 100);
      
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
          search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(String(args.text))}</div>`;

          this._updateLineBreakClass();
          this._updateMathBeautifyClass();

          if (search.firstChild) {
            this._addCopyButtons(search.firstChild);
            this._applyMathBeautify(search.firstChild);
          }

          setTimeout(() => {
            this._adjustTables();
          }, 100);

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

    autoline(args) {
      window.WitCatMarkDownAutoLineBreak = (args.enable === 'true');
      this._updateLineBreakClass();
    }

    automath(args) {
      window.WitCatMarkDownMathBeautify = (args.enable === 'true');
      this._updateMathBeautifyClass();

      if (window.WitCatMarkDownMathBeautify) {
        try {
          const outs = document.querySelectorAll('.WitCatMarkDownOut');
          outs.forEach(out => {
            if (out && out.firstChild) {
              this._applyMathBeautify(out.firstChild);
            }
          });
        } catch (e) {}
      }
    }

    addCustomRule(args) {
       try {
         var regex = new RegExp(String(args.match), 'g');
         this.markdownExpose.customRules.push({
            regex: regex,
            replace: String(args.replace),
            match: String(args.match) 
         });
       } catch (e) {
         console.error("Invalid Regex in addCustomRule", e);
       }
    }

    clearCustomRules() {
       this.markdownExpose.customRules = [];
    }

    importCustomRulesJSON(args) {
        try {
            const data = JSON.parse(args.JSON);
            if (Array.isArray(data)) {
                let count = 0;
                data.forEach(item => {
                    if (item.match && item.replace) {
                        this.addCustomRule({ match: item.match, replace: item.replace });
                        count++;
                    }
                });
                console.log(`Imported ${count} rules from JSON.`);
            }
        } catch (e) {
            console.error('Failed to import rules from JSON:', e);
        }
    }

    importCustomRulesURL(args) {
        return fetch(args.URL)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    let count = 0;
                    data.forEach(item => {
                        if (item.match && item.replace) {
                            this.addCustomRule({ match: item.match, replace: item.replace });
                            count++;
                        }
                    });
                    console.log(`Imported ${count} rules from URL.`);
                }
            })
            .catch(e => {
                console.error('Failed to import rules from URL:', e);
            });
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
          if (!styles[e].includes("url")) {
            styleString += `${e}:${styles[e]};`;
          }
        });
        target.style = styleString;
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
          this.resize = new ResizeObserver(_debounce(() => {
            const scale = parseFloat(canvas.offsetWidth) / 360;
            document.documentElement.style.setProperty('--witcat-markdown-scale', `scale(${scale})`);
          }, 100));
          this.resize.observe(canvas);
        }
      } else {
        if (this.resize) {
          this.resize.disconnect();
          this.resize = null;
        }
      }
    }

    autoscale(args) {
      if (args.enable === 'true') {
        this._adjustTables();
        if (this.autoScaleTimer) {
          clearInterval(this.autoScaleTimer);
        }
        this.autoScaleTimer = setInterval(() => {
          this._adjustTables();
        }, 1000);
      } else {
        if (this.autoScaleTimer) {
          clearInterval(this.autoScaleTimer);
          this.autoScaleTimer = null;
        }
        const tables = document.querySelectorAll('.WitCatMarkDownTable');
        tables.forEach(table => {
          table.classList.remove('auto-scaled');
          table.style.width = 'auto';
          const cells = table.querySelectorAll('th, td');
          cells.forEach(cell => {
            cell.style.width = '';
          });
        });
      }
    }

    whenTrigger(args) {
      return this._activeTriggers.has(String(args.ID));
    }

    setTriggerHTML(args) {
      const id = String(args.ID);
      const html = String(args.HTML);
      const buttons = document.querySelectorAll(`.wc-trigger-btn[data-trigger-id="${id}"]`);
      if (buttons) {
        buttons.forEach(btn => {
          btn.innerHTML = html;
        });
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
      search.innerHTML = `<div class='WitCatMarkDown'>${this.markdownExpose.toHTML(String(args.content))}</div>`;
      
      if (document.body) {
        document.body.appendChild(search);
      }

      this._addCopyButtons(search);
      this._updateMathBeautifyClass();
      this._applyMathBeautify(search);

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

这是首次使用 **Markdown 拓展** 自动生成的内容，包含 Markdown 语法和拓展介绍

## 文本样式

加粗|**加粗1** __加粗2__ （两个下划线） 
斜体|*斜体1*
下划线|_下划线_
***
若你在写常规文本时，需要换行，直接换行是无法成功换行的。
就像这样  
需要换行的话，需要在一行末尾加上两个空格  
就像这样

## 引用

> 白猫的markdown拓展！！！

## 链接

*鼠标点击*打开链接

[ccw 官网](https://www.ccw.site)


## 图片

如下：一个图片

![展示](https://m.xiguacity.cn/avatar/6173f57f48cf8f4796fc860e/dbadfc1c-3ab5-49a2-aa69-01465f3f0738.jpg?x-oss-process=image%2Fresize%2Cs_150%2Fformat%2Cwebp)

*图片可拖动为文件到任意窗口使用*


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

## 任务列表

- [x] A 计划
  - [x] A1 计划
  - [ ] A2 计划
- [ ] B 计划

## 分割线
***
没错就是这个

***
↑是1做
↓是2做
分割线下面是我增加的部分


## 表格

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |
| 王五 | 28   | 广州 |

复杂表格示例：

| 项目 | 数量 | 单价 | 小计 |
|------|------|------|------|
| 苹果 | 5    | ¥3.00 | ¥15.00 |
| 香蕉 | 8    | ¥2.50 | ¥20.00 |
| 橙子 | 12   | ¥4.00 | ¥48.00 |
| **总计** | **25** | | **¥83.00** |

## 代码块

    print("wit_cat!!!")
    print("白猫！！！")
## 新增：围栏代码块（带语言）
\`\`\`python
print("hello fenced code")
\`\`\`

## 数学符号优化示例

- 2*pi*r -> 2·π·r
- sqrt(2) -> √(2)
- a!=b, a>=b, a<=b -> a≠b, a≥b, a≤b
- 3^2 -> 3²
- 1/2 -> 1÷2


- 删除线：-文字-
- 简单标签：[warning]警告内容[/warning]  [note]注释内容[/note]  [tip]提示内容[/tip]

## 交互触发器 

{trigger=0.5}[点击这里触发事件](myEvent)

*点击上方按钮，可以触发【当触发器 ID [myEvent] 被点击】积木*
## 自定义解析 

- 颜色: [color=red]红色文字[/color] [color=#00cc00]Hex颜色[/color]
- 背景: [bg=yellow]高亮背景[/bg]
- 大小: [size=20px]大号文字[/size]
- 居中: [center]居中文字[/center]

## HTML 原生代码块 (危险)
[html]
<div style="background:#eee;padding:10px;border-radius:5px;">
  <button onclick="alert('Hello from WitCatMarkDown!')" style="padding:5px 10px;cursor:pointer;">点击测试 JS</button>
  <span style="color:red;font-weight:bold;margin-left:10px;">这是原生 HTML 渲染！</span>
</div>
[/html]

`;
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

  Scratch.extensions.register(new WitCatMarkDownExtension());
})(Scratch);

class MicroCSVExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.csvData = new Map(); // 存储CSV数据
        this.separator = ','; // CSV分隔符
    }

    getInfo() {
        return {
            id: 'microCSV',
            name: '微CSV',
            color1: '#4CBF4C',
            color2: '#3A9E3A',
            blocks: [
                {
                    opcode: 'createCSV',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '创建一个名为 [NAME] 的CSV',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                },
                {
                    opcode: 'deleteCSV',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '删除一个名为 [NAME] 的CSV',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                },
                {
                    opcode: 'deleteAllCSV',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '删除所有CSV'
                },
                {
                    opcode: 'getAllCSV',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '读取所有的CSV',
                    disableMonitor: true
                },
                {
                    opcode: 'loadFromFile',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '从本地文件读取一个CSV文件，并保存到名为 [NAME] 的CSV中',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                },
                {
                    opcode: 'updateCell',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '修改名为 [NAME] 的CSV的第 [ROW] 行第 [COL] 列为 [VALUE]',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        },
                        ROW: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        COL: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '值'
                        }
                    }
                },
                {
                    opcode: 'getRow',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取第 [ROW] 行的数据',
                    arguments: {
                        ROW: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    disableMonitor: true
                },
                {
                    opcode: 'getColumn',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取第 [COL] 列的数据',
                    arguments: {
                        COL: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    disableMonitor: true
                },
                {
                    opcode: 'getCell',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取第 [ROW] 行第 [COL] 列的数据',
                    arguments: {
                        ROW: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        COL: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'saveToFile',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '以CSV格式保存名为 [NAME] 的CSV文件',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                },
                {
                    opcode: 'setSeparator',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '设置CSV分隔符为 [SEP]',
                    arguments: {
                        SEP: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ','
                        }
                    }
                },
                {
                    opcode: 'getRowCount',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取名为 [NAME] 的CSV的行数',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                },
                {
                    opcode: 'getColumnCount',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '获取名为 [NAME] 的CSV的列数',
                    arguments: {
                        NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '数据表'
                        }
                    }
                }
            ],
            menus: {}
        };
    }

    // 创建一个新的CSV
    createCSV(args) {
        const name = args.NAME.toString();
        if (!this.csvData.has(name)) {
            this.csvData.set(name, []);
        }
    }

    // 删除一个CSV
    deleteCSV(args) {
        const name = args.NAME.toString();
        this.csvData.delete(name);
    }

    // 删除所有CSV
    deleteAllCSV() {
        this.csvData.clear();
    }

    // 获取所有CSV名称
    getAllCSV() {
        const names = Array.from(this.csvData.keys());
        return JSON.stringify(names);
    }

    // 从文件读取CSV
    loadFromFile(args) {
        const name = args.NAME.toString();
        
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.txt';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const rows = content.split('\n').map(row => 
                    row.split(this.separator).map(cell => 
                        cell.trim().replace(/^"|"$/g, '')
                    )
                );
                this.csvData.set(name, rows);
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // 修改单元格
    updateCell(args) {
        const name = args.NAME.toString();
        const row = Math.max(1, Math.floor(args.ROW)) - 1;
        const col = Math.max(1, Math.floor(args.COL)) - 1;
        const value = args.VALUE.toString();
        
        if (!this.csvData.has(name)) {
            this.csvData.set(name, []);
        }
        
        const data = this.csvData.get(name);
        
        // 确保行存在
        while (data.length <= row) {
            data.push([]);
        }
        
        // 确保列存在
        const currentRow = data[row];
        while (currentRow.length <= col) {
            currentRow.push('');
        }
        
        currentRow[col] = value;
        this.csvData.set(name, data);
    }

    // 获取行数据
    getRow(args) {
        const row = Math.max(1, Math.floor(args.ROW)) - 1;
        
        // 查找第一个非空CSV
        for (const [name, data] of this.csvData) {
            if (row < data.length && data[row]) {
                return JSON.stringify(data[row]);
            }
        }
        
        return JSON.stringify([]);
    }

    // 获取列数据
    getColumn(args) {
        const col = Math.max(1, Math.floor(args.COL)) - 1;
        const result = [];
        
        // 查找第一个非空CSV
        for (const [name, data] of this.csvData) {
            for (const row of data) {
                if (col < row.length) {
                    result.push(row[col]);
                }
            }
            if (result.length > 0) break;
        }
        
        return JSON.stringify(result);
    }

    // 获取单元格数据
    getCell(args) {
        const row = Math.max(1, Math.floor(args.ROW)) - 1;
        const col = Math.max(1, Math.floor(args.COL)) - 1;
        
        // 查找第一个非空CSV
        for (const [name, data] of this.csvData) {
            if (row < data.length && data[row] && col < data[row].length) {
                return data[row][col];
            }
        }
        
        return '';
    }

    // 保存为CSV文件
    saveToFile(args) {
        const name = args.NAME.toString();
        
        if (!this.csvData.has(name)) {
            return;
        }
        
        const data = this.csvData.get(name);
        const csvContent = data.map(row => 
            row.map(cell => {
                // 如果包含分隔符或引号，则用引号括起来
                if (cell.includes(this.separator) || cell.includes('"') || cell.includes('\n')) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(this.separator)
        ).join('\n');
        
        // 创建下载链接
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${name}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 设置分隔符
    setSeparator(args) {
        this.separator = args.SEP.toString();
    }

    // 获取行数
    getRowCount(args) {
        const name = args.NAME.toString();
        if (this.csvData.has(name)) {
            return this.csvData.get(name).length;
        }
        return 0;
    }

    // 获取列数
    getColumnCount(args) {
        const name = args.NAME.toString();
        if (this.csvData.has(name)) {
            const data = this.csvData.get(name);
            if (data.length > 0) {
                return data[0].length;
            }
        }
        return 0;
    }
}

// 注册扩展
Scratch.extensions.register(new MicroCSVExtension());
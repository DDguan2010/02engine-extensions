(function(Scratch) {
    'use strict';

    class Scratch3DExtension {
        constructor() {
            this.scene = {
                objects: [],
                nextX: 50,
                nextY: 150,
                gridVisible: false,
                background: '#F0E6FA',
                camera: { zoom: 1, x: 0, y: 0 },
                running: false
            };
            
            this.stage = Scratch.renderer.canvas;
            this.ctx = this.stage.getContext('2d');
            this.animationId = null;
            
            this.redrawAll = this.redrawAll.bind(this);
            this.handleClick = this.handleClick.bind(this);
            
            this.stage.addEventListener('click', this.handleClick);
        }

        getInfo() {
            return {
                id: 'scratch3D',
                name: '3D创意工坊',
                color1: '#9C27B0',
                color2: '#7B1FA2',
                blocks: [
                    {
                        opcode: 'start3D',
                        blockType: Scratch.BlockType.HAT,
                        text: '当3D场景开始',
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'stop3D',
                        blockType: Scratch.BlockType.HAT,
                        text: '当结束画面时',
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'createCube',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建3D立方体 大小 [SIZE] 颜色 [COLOR]',
                        arguments: {
                            SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#64B5F6' }
                        }
                    },
                    {
                        opcode: 'createSphere',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建3D球体 半径 [RADIUS] 颜色 [COLOR]',
                        arguments: {
                            RADIUS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#4FC3F7' }
                        }
                    },
                    {
                        opcode: 'createCylinder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建3D圆柱体 半径 [R] 高度 [H] 颜色 [COLOR]',
                        arguments: {
                            R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 25 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#29B6F6' }
                        }
                    },
                    {
                        opcode: 'createPyramid',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建3D金字塔 底边 [S] 高度 [H] 颜色 [COLOR]',
                        arguments: {
                            S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 70 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#03A9F4' }
                        }
                    },
                    {
                        opcode: 'createBase',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '创建带孔底座 宽度 [W] 高度 [H]',
                        arguments: {
                            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 300 },
                            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 }
                        }
                    },
                    {
                        opcode: 'moveObject',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '移动第 [ID] 个物体 X:[X] Y:[Y]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'rotateObject',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '旋转第 [ID] 个物体 [ANGLE]度',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            ANGLE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
                        }
                    },
                    {
                        opcode: 'scaleObject',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '缩放第 [ID] 个物体 倍数 [SCALE]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            SCALE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1.2 }
                        }
                    },
                    {
                        opcode: 'changeColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '改变第 [ID] 个物体颜色为 [COLOR]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#FF9800' }
                        }
                    },
                    {
                        opcode: 'deleteObject',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '删除第 [ID] 个物体',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'setObjectPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置第 [ID] 个物体位置 X:[X] Y:[Y]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 240 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 180 }
                        }
                    },
                    {
                        opcode: 'setBackground',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置背景颜色 [COLOR]',
                        arguments: {
                            COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: '#F0E6FA' }
                        }
                    },
                    {
                        opcode: 'showGrid',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '显示参考网格'
                    },
                    {
                        opcode: 'hideGrid',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '隐藏参考网格'
                    },
                    {
                        opcode: 'clearAll',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '清除所有3D物体'
                    },
                    {
                        opcode: 'cameraZoom',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '镜头缩放 [ZOOM]',
                        arguments: {
                            ZOOM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1.1 }
                        }
                    },
                    {
                        opcode: 'moveCamera',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '移动镜头 X:[X] Y:[Y]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                        }
                    },
                    {
                        opcode: 'objectCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '物体总数'
                    },
                    {
                        opcode: 'isTouching',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '第 [A] 个物体碰到第 [B] 个物体',
                        arguments: {
                            A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
                        }
                    },
                    {
                        opcode: 'getX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '第 [ID] 个物体的X坐标',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'getY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '第 [ID] 个物体的Y坐标',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'isRunning',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '3D场景是否在运行'
                    },
                    {
                        opcode: 'getObjectType',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '第 [ID] 个物体的类型',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    }
                ],
                menus: {
                    animationTypes: {
                        items: ['bounce', 'rotate', 'pulse', 'slide']
                    }
                }
            };
        }

        start3D() {
            if (this.scene.running) return;
            
            this.scene.running = true;
            this.scene.objects = [];
            this.scene.nextX = 50;
            this.scene.nextY = 150;
            this.scene.camera = { zoom: 1, x: 0, y: 0 };
            
            this.clearCanvas();
            this.animationId = requestAnimationFrame(this.redrawAll);
        }

        stop3D() {
            if (!this.scene.running) return;
            
            this.scene.running = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            
            this.scene.objects = [];
            this.clearCanvas();
        }

        redrawAll() {
            if (!this.scene.running) return;
            
            this.clearCanvas();
            
            if (this.scene.gridVisible) {
                this.drawGrid();
            }
            
            this.ctx.save();
            this.ctx.scale(this.scene.camera.zoom, this.scene.camera.zoom);
            this.ctx.translate(this.scene.camera.x, this.scene.camera.y);
            
            this.scene.objects.forEach((obj, index) => {
                this.drawObject(obj, index);
            });
            
            this.ctx.restore();
            this.animationId = requestAnimationFrame(this.redrawAll);
        }

        clearCanvas() {
            this.ctx.fillStyle = this.scene.background;
            this.ctx.fillRect(0, 0, this.stage.width, this.stage.height);
        }

        updateNextPosition(obj) {
            const spacing = 30;
            const maxWidth = this.stage.width - 150;
            
            let objWidth = 0;
            if (obj.type === 'cube') objWidth = obj.size + spacing;
            else if (obj.type === 'sphere') objWidth = obj.radius * 2 + spacing;
            else if (obj.type === 'cylinder') objWidth = obj.radius * 2 + spacing;
            else if (obj.type === 'pyramid') objWidth = obj.base + spacing;
            else if (obj.type === 'base') objWidth = obj.width + spacing;
            
            this.scene.nextX += objWidth;
            
            if (this.scene.nextX > maxWidth) {
                this.scene.nextX = 50;
                this.scene.nextY += 120;
            }
            
            if (this.scene.nextY > this.stage.height - 100) {
                this.scene.nextY = 150;
            }
        }

        createCube(args) {
            if (!this.scene.running) return;
            
            const obj = {
                type: 'cube',
                id: this.scene.objects.length + 1,
                x: this.scene.nextX,
                y: this.scene.nextY,
                size: Math.max(10, args.SIZE),
                color: args.COLOR,
                rotation: 0,
                scale: 1
            };
            
            this.scene.objects.push(obj);
            this.updateNextPosition(obj);
        }

        createSphere(args) {
            if (!this.scene.running) return;
            
            const obj = {
                type: 'sphere',
                id: this.scene.objects.length + 1,
                x: this.scene.nextX,
                y: this.scene.nextY,
                radius: Math.max(10, args.RADIUS),
                color: args.COLOR,
                rotation: 0,
                scale: 1
            };
            
            this.scene.objects.push(obj);
            this.updateNextPosition(obj);
        }

        createCylinder(args) {
            if (!this.scene.running) return;
            
            const obj = {
                type: 'cylinder',
                id: this.scene.objects.length + 1,
                x: this.scene.nextX,
                y: this.scene.nextY,
                radius: Math.max(10, args.R),
                height: Math.max(20, args.H),
                color: args.COLOR,
                rotation: 0,
                scale: 1
            };
            
            this.scene.objects.push(obj);
            this.updateNextPosition(obj);
        }

        createPyramid(args) {
            if (!this.scene.running) return;
            
            const obj = {
                type: 'pyramid',
                id: this.scene.objects.length + 1,
                x: this.scene.nextX,
                y: this.scene.nextY,
                base: Math.max(10, args.S),
                height: Math.max(10, args.H),
                color: args.COLOR,
                rotation: 0,
                scale: 1
            };
            
            this.scene.objects.push(obj);
            this.updateNextPosition(obj);
        }

        createBase(args) {
            if (!this.scene.running) return;
            
            const obj = {
                type: 'base',
                id: this.scene.objects.length + 1,
                x: this.stage.width / 2,
                y: this.stage.height - Math.max(20, args.H) - 20,
                width: Math.max(100, args.W),
                height: Math.max(20, args.H),
                color: '#64B5F6',
                holes: 5
            };
            
            this.scene.objects.push(obj);
        }

        drawObject(obj, index) {
            this.ctx.save();
            this.ctx.translate(obj.x, obj.y);
            this.ctx.rotate((obj.rotation || 0) * Math.PI / 180);
            this.ctx.scale(obj.scale || 1, obj.scale || 1);
            
            if (obj.selected) {
                this.ctx.strokeStyle = '#FF0000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(-30, -30, 60, 60);
            }
            
            switch(obj.type) {
                case 'cube':
                    this.drawCube(obj);
                    break;
                case 'sphere':
                    this.drawSphere(obj);
                    break;
                case 'cylinder':
                    this.drawCylinder(obj);
                    break;
                case 'pyramid':
                    this.drawPyramid(obj);
                    break;
                case 'base':
                    this.drawBase(obj);
                    break;
            }
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(index + 1, 0, -40);
            
            this.ctx.restore();
        }

        drawCube(obj) {
            const size = obj.size / 2;
            
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(-size, -size, obj.size, obj.size);
            
            this.ctx.fillStyle = this.darken(obj.color, 0.3);
            this.ctx.beginPath();
            this.ctx.moveTo(size, -size);
            this.ctx.lineTo(size + 10, -size - 10);
            this.ctx.lineTo(size + 10, size - 10);
            this.ctx.lineTo(size, size);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.moveTo(-size, size);
            this.ctx.lineTo(-size + 10, size + 10);
            this.ctx.lineTo(size + 10, size + 10);
            this.ctx.lineTo(size, size);
            this.ctx.closePath();
            this.ctx.fill();
        }

        drawSphere(obj) {
            this.ctx.fillStyle = obj.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = this.lighten(obj.color, 0.3);
            this.ctx.beginPath();
            this.ctx.arc(-obj.radius/3, -obj.radius/3, obj.radius/3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        drawCylinder(obj) {
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(-obj.radius, -obj.height/2, obj.radius*2, obj.height);
            
            this.ctx.beginPath();
            this.ctx.ellipse(0, -obj.height/2, obj.radius, obj.radius/3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.ellipse(0, obj.height/2, obj.radius, obj.radius/3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        drawPyramid(obj) {
            const halfBase = obj.base / 2;
            
            this.ctx.fillStyle = obj.color;
            this.ctx.beginPath();
            this.ctx.moveTo(-halfBase, halfBase);
            this.ctx.lineTo(halfBase, halfBase);
            this.ctx.lineTo(0, -obj.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = this.darken(obj.color, 0.2);
            this.ctx.beginPath();
            this.ctx.moveTo(-halfBase, halfBase);
            this.ctx.lineTo(0, -obj.height);
            this.ctx.lineTo(0, halfBase);
            this.ctx.closePath();
            this.ctx.fill();
        }

        drawBase(obj) {
            const halfWidth = obj.width / 2;
            const halfHeight = obj.height / 2;
            
            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(-halfWidth, -halfHeight, obj.width, obj.height);
            
            this.ctx.fillStyle = this.darken(obj.color, 0.5);
            const holeSpacing = obj.width / 6;
            for (let i = 1; i <= 5; i++) {
                this.ctx.beginPath();
                this.ctx.arc(-halfWidth + holeSpacing * i, 0, halfHeight / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        drawGrid() {
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x < this.stage.width; x += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.stage.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y < this.stage.height; y += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.stage.width, y);
                this.ctx.stroke();
            }
        }

        handleClick(event) {
            if (!this.scene.running) return;
            
            const rect = this.stage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / this.scene.camera.zoom - this.scene.camera.x;
            const y = (event.clientY - rect.top) / this.scene.camera.zoom - this.scene.camera.y;
            
            for (let i = this.scene.objects.length - 1; i >= 0; i--) {
                const obj = this.scene.objects[i];
                if (this.isPointInObject(x, y, obj)) {
                    obj.selected = !obj.selected;
                    break;
                }
            }
        }

        isPointInObject(x, y, obj) {
            const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
            return distance < 50;
        }

        moveObject(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects[id].x += args.X;
                this.scene.objects[id].y += args.Y;
            }
        }

        setObjectPosition(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects[id].x = args.X;
                this.scene.objects[id].y = args.Y;
            }
        }

        rotateObject(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects[id].rotation = (this.scene.objects[id].rotation + args.ANGLE) % 360;
            }
        }

        scaleObject(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects[id].scale = args.SCALE;
            }
        }

        changeColor(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects[id].color = args.COLOR;
            }
        }

        deleteObject(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            if (this.scene.objects[id]) {
                this.scene.objects.splice(id, 1);
                this.scene.objects.forEach((obj, index) => {
                    obj.id = index + 1;
                });
            }
        }

        setBackground(args) {
            this.scene.background = args.COLOR;
        }

        showGrid() {
            this.scene.gridVisible = true;
        }

        hideGrid() {
            this.scene.gridVisible = false;
        }

        clearAll() {
            this.scene.objects = [];
            this.scene.nextX = 50;
            this.scene.nextY = 150;
        }

        cameraZoom(args) {
            this.scene.camera.zoom = Math.max(0.1, Math.min(5, args.ZOOM));
        }

        moveCamera(args) {
            this.scene.camera.x += args.X;
            this.scene.camera.y += args.Y;
        }

        objectCount() {
            return this.scene.objects.length;
        }

        isTouching(args) {
            const a = Math.max(0, Math.min(this.scene.objects.length - 1, args.A - 1));
            const b = Math.max(0, Math.min(this.scene.objects.length - 1, args.B - 1));
            
            if (!this.scene.objects[a] || !this.scene.objects[b]) return false;
            
            const objA = this.scene.objects[a];
            const objB = this.scene.objects[b];
            const distance = Math.sqrt(Math.pow(objA.x - objB.x, 2) + Math.pow(objA.y - objB.y, 2));
            
            return distance < 80;
        }

        getX(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            return this.scene.objects[id] ? this.scene.objects[id].x : 0;
        }

        getY(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            return this.scene.objects[id] ? this.scene.objects[id].y : 0;
        }

        getObjectType(args) {
            const id = Math.max(0, Math.min(this.scene.objects.length - 1, args.ID - 1));
            return this.scene.objects[id] ? this.scene.objects[id].type : '';
        }

        isRunning() {
            return this.scene.running;
        }

        darken(color, factor) {
            const hex = color.replace('#', '');
            const num = parseInt(hex, 16);
            const amt = Math.round(2.55 * factor * 100);
            const R = (num >> 16) - amt;
            const G = (num >> 8 & 0x00FF) - amt;
            const B = (num & 0x0000FF) - amt;
            return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
        }

        lighten(color, factor) {
            const hex = color.replace('#', '');
            const num = parseInt(hex, 16);
            const amt = Math.round(2.55 * factor * 100);
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            return `#${(0x1000000 + (R > 255 ? 255 : R) * 0x10000 +
                (G > 255 ? 255 : G) * 0x100 +
                (B > 255 ? 255 : B)).toString(16).slice(1)}`;
        }

        stop() {
            this.scene.running = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.stage.removeEventListener('click', this.handleClick);
        }
    }

    if (typeof Scratch !== 'undefined' && Scratch.extensions) {
        Scratch.extensions.register(new Scratch3DExtension());
    }
})(typeof Scratch !== 'undefined' ? Scratch : {});

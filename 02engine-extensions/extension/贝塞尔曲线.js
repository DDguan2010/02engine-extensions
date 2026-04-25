(function(sc) {
    let vm = sc.vm;
    let runtime = vm.runtime;
    
    let setup = {
        'zh-cn': {
            'bezierCurve': '贝塞尔曲线',
            'addControlPoint': '添加控制点 x: [X] y: [Y]',
            'getControlPoints': '获取所有控制点',
            'clearControlPoints': '删除所有控制点',
            'getBezierValue': '贝塞尔曲线 [PROPERTY] 进度: [PERCENT]% 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'xCoordinate': 'X坐标',
            'yCoordinate': 'Y坐标',
            'tangentAngle': '切线角度'
        },
        'zh-tw': {
            'bezierCurve': '貝塞爾曲線',
            'addControlPoint': '添加控制點 x: [X] y: [Y]',
            'getControlPoints': '獲取所有控制點',
            'clearControlPoints': '刪除所有控制點',
            'getBezierValue': '貝塞爾曲線 [PROPERTY] 進度: [PERCENT]% 起點X: [STARTX] Y: [STARTY] 終點X: [ENDX] Y: [ENDY]',
            'xCoordinate': 'X座標',
            'yCoordinate': 'Y座標',
            'tangentAngle': '切線角度'
        },
        'en': {
            'bezierCurve': 'Bezier Curve',
            'addControlPoint': 'add control point x: [X] y: [Y]',
            'getControlPoints': 'get all control points',
            'clearControlPoints': 'clear all control points',
            'getBezierValue': 'bezier curve [PROPERTY] progress: [PERCENT]% startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'xCoordinate': 'X coordinate',
            'yCoordinate': 'Y coordinate',
            'tangentAngle': 'tangent angle'
        }
    };

    function translate(str) {
        return setup[sc.translate.language] 
            ? setup[sc.translate.language][str] || setup.en[str]
            : setup.en[str];
    }

    class BezierExtension {
        constructor() {
            sc.translate.setup(setup);
            this.controlPoints = {};
        }

        getInfo() {
            return {
                id: 'bezierCurve',
                name: translate('bezierCurve'),
                color1: '#90bcd9',
                color2: '#7ca9c4',
                color3: '#a0c8e6',
                blockIconURI: 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1Mi4wNzU3NyIgaGVpZ2h0PSIzNS41MDc4IiB2aWV3Qm94PSIwLDAsNTIuMDc1NzcsMzUuNTA3OCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIxMy45NjIxMiwtMTYxLjUwMikiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjIxLjQ2MjEyLDE4MC4xMDIyYzAsMCA0LjkwNDE4LC0xMS4zOTA0MSAxMS4xOTY1MiwtMTEuMDk0NTRjNy45NTI2NCwwLjM3Mzk0IDcuMzEzNDUsMTUuODE4MDcgMTMuMjk4OTMsMjAuNTAyMTNjOC44ODIxOCw2LjM0ODQyIDEyLjU4MDMyLC05LjY2ODUxIDEyLjU4MDMyLC05LjY2ODUxIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMTUiLz48cGF0aCBkPSJNMjIxLjQ2MjEyLDE4MC4xMDIyYzAsMCA0LjkwNDE4LC0xMS4zOTA0MSAxMS4xOTY1MiwtMTEuMDk0NTRjNy45NTI2NCwwLjM3Mzk0IDcuMzEzNDUsMTUuODE4MDcgMTMuMjk4OTMsMjAuNTAyMTNjOC44ODIxOCw2LjM0ODQyIDEyLjU4MDMyLC05LjY2ODUxIDEyLjU4MDMyLC05LjY2ODUxIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjoyNi4wMzc4ODQ5OTk5OTQ4NzM6MTguNDk4MDAwNDc1NDc0MzU2LS0+',
                blocks: [
                    {
                        opcode: 'addControlPoint',
                        blockType: 'command',
                        text: translate('addControlPoint'),
                        arguments: {
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getControlPoints',
                        blockType: 'reporter',
                        text: translate('getControlPoints'),
                    },
                    {
                        opcode: 'clearControlPoints',
                        blockType: 'command',
                        text: translate('clearControlPoints'),
                    },
                    {
                        opcode: 'getBezierValue',
                        blockType: 'reporter',
                        text: translate('getBezierValue'),
                        arguments: {
                            PROPERTY: {
                                type: 'string',
                                menu: 'bezierProperty',
                                defaultValue: 'x'
                            },
                            PERCENT: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            STARTX: {
                                type: 'number',
                                defaultValue: 0
                            },
                            STARTY: {
                                type: 'number',
                                defaultValue: 0
                            },
                            ENDX: {
                                type: 'number',
                                defaultValue: 100
                            },
                            ENDY: {
                                type: 'number',
                                defaultValue: 100
                            }
                        }
                    }
                ],
                menus: {
                    bezierProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('xCoordinate'), value: 'x'},
                            {text: translate('yCoordinate'), value: 'y'},
                            {text: translate('tangentAngle'), value: 'angle'}
                        ]
                    }
                }
            };
        }

        _getControlPoints(target) {
            if (!this.controlPoints[target.id]) {
                this.controlPoints[target.id] = [];
            }
            return this.controlPoints[target.id];
        }

        addControlPoint(args, util) {
            const controlPoints = this._getControlPoints(util.target);
            controlPoints.push({ x: args.X, y: args.Y });
        }

        getControlPoints(args, util) {
            const controlPoints = this._getControlPoints(util.target);
            return JSON.stringify(controlPoints);
        }

        clearControlPoints(args, util) {
            this.controlPoints[util.target.id] = [];
        }

        getBezierValue(args, util) {
            const controlPoints = this._getControlPoints(util.target);
            const t = args.PERCENT / 100;
            
            if (args.PROPERTY === 'angle') {
                const scaledPoints = this._scaleControlPoints(controlPoints, args.STARTX, args.STARTY, args.ENDX, args.ENDY);
                const derivativePoints = this._calculateDerivativePoints(scaledPoints);
                const derivative = this._calculateBezierPoint(derivativePoints, t);
                const angle = Math.atan2(derivative.y, derivative.x) * 180 / Math.PI;
                return angle;
            }
            
            const scaledPoints = this._scaleControlPoints(controlPoints, args.STARTX, args.STARTY, args.ENDX, args.ENDY);
            const point = this._calculateBezierPoint(scaledPoints, t);
            
            return args.PROPERTY === 'x' ? point.x : point.y;
        }

        _scaleControlPoints(controlPoints, startX, startY, endX, endY) {
            if (controlPoints.length === 0) {
                return [{x: startX, y: startY}, {x: endX, y: endY}];
            }
            
            return [
                {x: startX, y: startY},
                ...controlPoints,
                {x: endX, y: endY}
            ];
        }

        _calculateBezierPoint(points, t) {
            if (points.length === 1) return points[0];
            const newPoints = [];
            for (let i = 0; i < points.length - 1; i++) {
                newPoints.push({
                    x: (1 - t) * points[i].x + t * points[i + 1].x,
                    y: (1 - t) * points[i].y + t * points[i + 1].y
                });
            }
            return this._calculateBezierPoint(newPoints, t);
        }

        _calculateDerivativePoints(points) {
            const derivativePoints = [];
            const n = points.length - 1;
            for (let i = 0; i < n; i++) {
                derivativePoints.push({
                    x: n * (points[i + 1].x - points[i].x),
                    y: n * (points[i + 1].y - points[i].y)
                });
            }
            return derivativePoints;
        }
    }

    sc.extensions.register(new BezierExtension());
})(Scratch);

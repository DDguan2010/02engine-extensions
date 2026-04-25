// Name: hermiteCurve
// ID: hermiteCurve
// Description: Smooth, controlled motion paths by specifying both position and velocity at start and end points
// Version: 2.0.2
// By: KongMing2403 ("https://m.bilibili.com/space/3493092640426109?spm_id_from=333.33.0.0")

(function(sc) {
    let vm = sc.vm;
    let runtime = vm.runtime;
    
    let setup = {
        'zh-cn': {
            'hermiteCurve': 'Hermite曲线',
            'byAuthor': 'By：空明2403',
            'setHermiteTangent': '设置Hermite[WHICH] x: [X] y: [Y]',
            'hermiteValue': 'Hermite曲线 [PROPERTY] 进度: [PERCENT]% 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'xCoordinate': 'X坐标',
            'yCoordinate': 'Y坐标',
            'tangentAngle': '速度方向',
            'velocity': '速率',
            'acceleration': '加速度',
            'jerk': '急动度',
            'clearHermiteTangents': '清除所有Hermite初/末速度',
            'hermiteTangents': 'Hermite速度信息',
            'startVelocity': '初速度',
            'endVelocity': '末速度',
            'adjustHermiteTangentByAngle': '设置Hermite[WHICH] 方向: [ANGLE]° 大小: [LENGTH]',
            'start': '初速度',
            'end': '末速度',
            'arcLength': '弧长',
            'curvature': '曲率',
            'hermitePath': 'Hermite路径 点数: [POINTS] 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'hermitePathPoint': 'Hermite路径点 [INDEX] 的 [PROPERTY] 点数: [POINTS] 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'pointAtHermiteDistance': 'Hermite距离起点 [DISTANCE] 的点 [PROPERTY] 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'index': '序号',
            'length': '长度',
            'x': 'X',
            'y': 'Y',
            'angle': '角度',
            'distance': '距离',
            'radius': '曲率半径',
            'normal': '法线',
            'normalAngle': '法线角度',
            'normalized': '单位化',
            'unitTangent': '单位速度',
            'unitNormal': '单位法线',
            'tangentVector': '速度',
            'normalVector': '法线',
            'hermiteVector': 'Hermite [VECTOR] [COMPONENT] 进度: [PERCENT]% 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'tangent': '速度',
            'vectorMagnitude': '大小',
            'vectorAngle': '角度',
            'vectorX': 'X分量',
            'vectorY': 'Y分量',
            'unit': '单位',
            'hermiteArcLength': 'Hermite曲线弧长 起点X: [STARTX] Y: [STARTY] 终点X: [ENDX] Y: [ENDY]',
            'distanceFromStart': '到起点距离',
            'distanceToEnd': '到终点距离',
            'hermiteSpline': 'Hermite样条',
            'hermiteSplineSetup': 'Hermite样条设置',
            'addHermiteControlPoint': '添加Hermite控制点 x: [X] y: [Y] 速度x: [VX] 速度y: [VY]',
            'addHermiteControlPointByAngle': '添加Hermite控制点 x: [X] y: [Y] 速度方向: [ANGLE]° 速度大小: [MAG]',
            'insertHermiteControlPoint': '在第[N]个Hermite控制点前插入 x: [X] y: [Y] 速度x: [VX] 速度y: [VY]',
            'insertHermiteControlPointByAngle': '在第[N]个Hermite控制点前插入 x: [X] y: [Y] 速度方向: [ANGLE]° 速度大小: [MAG]',
            'setHermiteControlPoint': '将第[N]个Hermite控制点替换为 x: [X] y: [Y] 速度x: [VX] 速度y: [VY]',
            'setHermiteControlPointByAngle': '将第[N]个Hermite控制点替换为 x: [X] y: [Y] 速度方向: [ANGLE]° 速度大小: [MAG]',
            'setHermiteControlPointVelocity': '设置第[N]个Hermite控制点的速度 x: [VX] y: [VY]',
            'setHermiteControlPointVelocityByAngle': '设置第[N]个Hermite控制点的速度 方向: [ANGLE]° 大小: [MAG]',
            'deleteHermiteControlPoint': '删除第[N]个Hermite控制点',
            'clearHermiteControlPoints': '清空所有Hermite控制点',
            'hermiteControlPoints': '所有Hermite控制点',
            'hermiteControlPoint': '第[N]个Hermite控制点的[PROPERTY]',
            'hermiteControlPointVelocity': '第[N]个Hermite控制点的速度[COMPONENT]',
            'hermiteControlPointCount': 'Hermite控制点数量',
            'hermiteSplinePoint': 'Hermite样条 [TYPE] [PROPERTY] 进度: [T]%',
            'hermiteSplineSegment': 'Hermite样条 [TYPE] [PROPERTY] 段数: [SEGMENT] 局部进度: [LOCALT]%',
            'hermiteSplinePath': 'Hermite样条 [TYPE] 路径 点数: [POINTS]',
            'hermiteSplinePathPoint': 'Hermite样条 [TYPE] 路径点 [INDEX] 的 [PROPERTY] 点数: [POINTS]',
            'pointAtHermiteSplineDistance': 'Hermite样条 [TYPE] 距离起点 [DISTANCE] 的点 [PROPERTY]',
            'hermiteSplineVector': 'Hermite样条 [TYPE] [VECTOR] [COMPONENT] 进度: [T]%',
            'hermiteSplineArcLength': 'Hermite样条 [TYPE] 弧长',
            'cardinalSpline': 'Cardinal样条',
            'cardinalSetup': 'Cardinal样条设置',
            'addCardinalControlPoint': '添加Cardinal控制点 x: [X] y: [Y]',
            'insertCardinalControlPoint': '在第[N]个Cardinal控制点前插入 x: [X] y: [Y]',
            'setCardinalControlPoint': '将第[N]个Cardinal控制点替换为 x: [X] y: [Y]',
            'deleteCardinalControlPoint': '删除第[N]个Cardinal控制点',
            'clearCardinalControlPoints': '清空所有Cardinal控制点',
            'cardinalControlPoints': '所有Cardinal控制点',
            'cardinalControlPoint': '第[N]个Cardinal控制点的[PROPERTY]',
            'cardinalControlPointCount': 'Cardinal控制点数量',
            'cardinalPoint': 'Cardinal样条 [TYPE] [PROPERTY] 进度: [T]% 张力: [TENSION]',
            'cardinalSegment': 'Cardinal样条 [TYPE] [PROPERTY] 段数: [SEGMENT] 局部进度: [LOCALT]% 张力: [TENSION]',
            'cardinalPath': 'Cardinal样条 [TYPE] 路径 点数: [POINTS] 张力: [TENSION]',
            'cardinalPathPoint': 'Cardinal样条 [TYPE] 路径点 [INDEX] 的 [PROPERTY] 点数: [POINTS] 张力: [TENSION]',
            'pointAtCardinalDistance': 'Cardinal样条 [TYPE] 距离起点 [DISTANCE] 的点 [PROPERTY] 张力: [TENSION]',
            'cardinalVector': 'Cardinal样条 [TYPE] [VECTOR] [COMPONENT] 进度: [T]% 张力: [TENSION]',
            'cardinalArcLength': 'Cardinal样条 [TYPE] 弧长 张力: [TENSION]',
            'open': '开放',
            'closed': '闭合',
            'controlPointX': 'X坐标',
            'controlPointY': 'Y坐标',
            'controlPointVX': '速度X',
            'controlPointVY': '速度Y',
            'controlPointVelocityAngle': '速度方向',
            'controlPointVelocityMagnitude': '速度大小'
        },
        'en': {
            'hermiteCurve': 'Hermite Curve',
            'byAuthor': 'By：KongMing2403',
            'setHermiteTangent': 'set Hermite[WHICH] x: [X] y: [Y]',
            'hermiteValue': 'Hermite curve [PROPERTY] progress: [PERCENT]% startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'xCoordinate': 'X coordinate',
            'yCoordinate': 'Y coordinate',
            'tangentAngle': 'velocity direction',
            'velocity': 'speed',
            'acceleration': 'acceleration',
            'jerk': 'jerk',
            'clearHermiteTangents': 'clear all Hermite velocities',
            'hermiteTangents': 'Hermite velocity info',
            'startVelocity': 'start velocity',
            'endVelocity': 'end velocity',
            'adjustHermiteTangentByAngle': 'set Hermite[WHICH] angle: [ANGLE]° magnitude: [LENGTH]',
            'start': 'start velocity',
            'end': 'end velocity',
            'arcLength': 'arc length',
            'curvature': 'curvature',
            'hermitePath': 'Hermite path points: [POINTS] startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'hermitePathPoint': 'Hermite path point [INDEX] [PROPERTY] points: [POINTS] startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'pointAtHermiteDistance': 'Hermite point at distance [DISTANCE] [PROPERTY] startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'index': 'index',
            'length': 'length',
            'x': 'X',
            'y': 'Y',
            'angle': 'angle',
            'distance': 'distance',
            'radius': 'radius of curvature',
            'normal': 'normal',
            'normalAngle': 'normal angle',
            'normalized': 'normalized',
            'unitTangent': 'unit velocity',
            'unitNormal': 'unit normal',
            'tangentVector': 'velocity',
            'normalVector': 'normal',
            'hermiteVector': 'Hermite [VECTOR] [COMPONENT] progress: [PERCENT]% startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'tangent': 'velocity',
            'vectorMagnitude': 'magnitude',
            'vectorAngle': 'angle',
            'vectorX': 'X component',
            'vectorY': 'Y component',
            'unit': 'unit',
            'hermiteArcLength': 'Hermite curve arc length startX: [STARTX] Y: [STARTY] endX: [ENDX] Y: [ENDY]',
            'distanceFromStart': 'distance from start',
            'distanceToEnd': 'distance to end',
            'hermiteSpline': 'Hermite Spline',
            'hermiteSplineSetup': 'Hermite Spline Setup',
            'addHermiteControlPoint': 'add Hermite control point x: [X] y: [Y] vx: [VX] vy: [VY]',
            'addHermiteControlPointByAngle': 'add Hermite control point x: [X] y: [Y] angle: [ANGLE]° magnitude: [MAG]',
            'insertHermiteControlPoint': 'insert Hermite control point before [N] x: [X] y: [Y] vx: [VX] vy: [VY]',
            'insertHermiteControlPointByAngle': 'insert Hermite control point before [N] x: [X] y: [Y] angle: [ANGLE]° magnitude: [MAG]',
            'setHermiteControlPoint': 'set Hermite control point [N] to x: [X] y: [Y] vx: [VX] vy: [VY]',
            'setHermiteControlPointByAngle': 'set Hermite control point [N] to x: [X] y: [Y] angle: [ANGLE]° magnitude: [MAG]',
            'setHermiteControlPointVelocity': 'set Hermite control point [N] velocity to x: [VX] y: [VY]',
            'setHermiteControlPointVelocityByAngle': 'set Hermite control point [N] velocity angle: [ANGLE]° magnitude: [MAG]',
            'deleteHermiteControlPoint': 'delete Hermite control point [N]',
            'clearHermiteControlPoints': 'clear all Hermite control points',
            'hermiteControlPoints': 'all Hermite control points',
            'hermiteControlPoint': 'Hermite control point [N] [PROPERTY]',
            'hermiteControlPointVelocity': 'Hermite control point [N] velocity [COMPONENT]',
            'hermiteControlPointCount': 'number of Hermite control points',
            'hermiteSplinePoint': 'Hermite spline [TYPE] [PROPERTY] progress: [T]%',
            'hermiteSplineSegment': 'Hermite spline [TYPE] [PROPERTY] segment: [SEGMENT] local progress: [LOCALT]%',
            'hermiteSplinePath': 'Hermite spline [TYPE] path points: [POINTS]',
            'hermiteSplinePathPoint': 'Hermite spline [TYPE] path point [INDEX] [PROPERTY] points: [POINTS]',
            'pointAtHermiteSplineDistance': 'Hermite spline [TYPE] point at distance [DISTANCE] [PROPERTY]',
            'hermiteSplineVector': 'Hermite spline [TYPE] [VECTOR] [COMPONENT] progress: [T]%',
            'hermiteSplineArcLength': 'Hermite spline [TYPE] arc length',
            'cardinalSpline': 'Cardinal Spline',
            'cardinalSetup': 'Cardinal Spline Setup',
            'addCardinalControlPoint': 'add Cardinal control point x: [X] y: [Y]',
            'insertCardinalControlPoint': 'insert Cardinal control point before [N] x: [X] y: [Y]',
            'setCardinalControlPoint': 'set Cardinal control point [N] to x: [X] y: [Y]',
            'deleteCardinalControlPoint': 'delete Cardinal control point [N]',
            'clearCardinalControlPoints': 'clear all Cardinal control points',
            'cardinalControlPoints': 'all Cardinal control points',
            'cardinalControlPoint': 'Cardinal control point [N] [PROPERTY]',
            'cardinalControlPointCount': 'number of Cardinal control points',
            'cardinalPoint': 'Cardinal spline [TYPE] [PROPERTY] progress: [T]% tension: [TENSION]',
            'cardinalSegment': 'Cardinal spline [TYPE] [PROPERTY] segment: [SEGMENT] local progress: [LOCALT]% tension: [TENSION]',
            'cardinalPath': 'Cardinal spline [TYPE] path points: [POINTS] tension: [TENSION]',
            'cardinalPathPoint': 'Cardinal spline [TYPE] path point [INDEX] [PROPERTY] points: [POINTS] tension: [TENSION]',
            'pointAtCardinalDistance': 'Cardinal spline [TYPE] point at distance [DISTANCE] [PROPERTY] tension: [TENSION]',
            'cardinalVector': 'Cardinal spline [TYPE] [VECTOR] [COMPONENT] progress: [T]% tension: [TENSION]',
            'cardinalArcLength': 'Cardinal spline [TYPE] arc length tension: [TENSION]',
            'open': 'open',
            'closed': 'closed',
            'controlPointX': 'X coordinate',
            'controlPointY': 'Y coordinate',
            'controlPointVX': 'velocity X',
            'controlPointVY': 'velocity Y',
            'controlPointVelocityAngle': 'velocity angle',
            'controlPointVelocityMagnitude': 'velocity magnitude'
        }
    };

    function translate(str) {
        return setup[sc.translate.language] 
            ? setup[sc.translate.language][str] || setup.en[str]
            : setup.en[str];
    }

    const GAUSS_NODES = [
        -0.906179845938664,
        -0.538469310105683,
        0,
        0.538469310105683,
        0.906179845938664
    ];
    const GAUSS_WEIGHTS = [
        0.236926885056189,
        0.478628670499366,
        0.568888888888889,
        0.478628670499366,
        0.236926885056189
    ];

    class HermiteExtension {
        constructor() {
            sc.translate.setup(setup);
            this.tangents = {};
            this.arcLengthCache = new Map();
            this.hermiteControlPoints = {};
            this.cardinalControlPoints = {};
            this.hermiteArcLengthCache = new Map();
            this.cardinalArcLengthCache = new Map();
            
            this.MAX_CACHE_SIZE = 50;
            this.ARC_LENGTH_TOLERANCE = 1e-4;
        }

        
        _toScratchAngle(angleRad) {
            return 90 - angleRad * 57.29577951308232;
        }

        _fromScratchAngle(scratchDeg) {
            return (90 - scratchDeg) * 0.017453292519943295;
        }

        _getVectorMagnitude(x, y) {
            return Math.sqrt(x * x + y * y);
        }

        _normalizeVector(x, y) {
            const magnitude = this._getVectorMagnitude(x, y);
            if (magnitude === 0) return { x: 0, y: 0 };
            const invMag = 1 / magnitude;
            return { x: x * invMag, y: y * invMag };
        }

        _getNormalVector(x, y) {
            return { x: -y, y: x };
        }

        _angleToComponents(angleDeg, magnitude) {
            const angleRad = this._fromScratchAngle(angleDeg);
            return {
                x: Math.cos(angleRad) * magnitude,
                y: Math.sin(angleRad) * magnitude
            };
        }

        
        _clearCache(target) {
            this.arcLengthCache.clear();
            this.hermiteArcLengthCache.clear();
            this.cardinalArcLengthCache.clear();
        }

        _trimCache(cache, maxSize = 50) {
            if (cache.size > maxSize) {
                const keys = Array.from(cache.keys()).slice(0, Math.floor(maxSize / 2));
                for (const key of keys) {
                    cache.delete(key);
                }
            }
        }

        
        _getTangents(target) {
            if (!this.tangents[target.id]) {
                this.tangents[target.id] = {
                    start: { x: 0, y: 0 },
                    end: { x: 0, y: 0 }
                };
            }
            return this.tangents[target.id];
        }

        _calculatePoint(t, startX, startY, endX, endY, tangents) {
            const t2 = t * t;
            const t3 = t2 * t;
            
            const h00 = 2 * t3 - 3 * t2 + 1;
            const h10 = t3 - 2 * t2 + t;
            const h01 = -2 * t3 + 3 * t2;
            const h11 = t3 - t2;
            
            return {
                x: h00 * startX + h10 * tangents.start.x + h01 * endX + h11 * tangents.end.x,
                y: h00 * startY + h10 * tangents.start.y + h01 * endY + h11 * tangents.end.y
            };
        }

        _calculateDerivative(t, startX, startY, endX, endY, tangents) {
            const t2 = t * t;
            
            const dh00 = 6 * t2 - 6 * t;
            const dh10 = 3 * t2 - 4 * t + 1;
            const dh01 = -6 * t2 + 6 * t;
            const dh11 = 3 * t2 - 2 * t;
            
            return {
                x: dh00 * startX + dh10 * tangents.start.x + dh01 * endX + dh11 * tangents.end.x,
                y: dh00 * startY + dh10 * tangents.start.y + dh01 * endY + dh11 * tangents.end.y
            };
        }

        _calculateSecondDerivative(t, startX, startY, endX, endY, tangents) {
            const d2h00 = 12 * t - 6;
            const d2h10 = 6 * t - 4;
            const d2h01 = -12 * t + 6;
            const d2h11 = 6 * t - 2;
            
            return {
                x: d2h00 * startX + d2h10 * tangents.start.x + d2h01 * endX + d2h11 * tangents.end.x,
                y: d2h00 * startY + d2h10 * tangents.start.y + d2h01 * endY + d2h11 * tangents.end.y
            };
        }

        _calculateThirdDerivative(t, startX, startY, endX, endY, tangents) {
            return {
                x: 12 * startX + 6 * tangents.start.x - 12 * endX + 6 * tangents.end.x,
                y: 12 * startY + 6 * tangents.start.y - 12 * endY + 6 * tangents.end.y
            };
        }

        _speedFunction(t, startX, startY, endX, endY, tangents) {
            const deriv = this._calculateDerivative(t, startX, startY, endX, endY, tangents);
            return Math.sqrt(deriv.x * deriv.x + deriv.y * deriv.y);
        }

        
        _gaussLegendre5(f, a, b) {
            const m = (b - a) * 0.5;
            const c = (a + b) * 0.5;
            let sum = 0;
            
            for (let i = 0; i < 5; i++) {
                const x = c + m * GAUSS_NODES[i];
                sum += GAUSS_WEIGHTS[i] * f(x);
            }
            
            return sum * m;
        }

        _adaptiveGaussArcLength(startX, startY, endX, endY, tangents, tolerance = 1e-4) {
            if (tangents.start.x === 0 && tangents.start.y === 0 && 
                tangents.end.x === 0 && tangents.end.y === 0) {
                const dx = endX - startX;
                const dy = endY - startY;
                return Math.sqrt(dx * dx + dy * dy);
            }

            const key = `${startX},${startY},${endX},${endY},${tangents.start.x},${tangents.start.y},${tangents.end.x},${tangents.end.y}`;
            
            if (this.arcLengthCache.has(key)) {
                return this.arcLengthCache.get(key);
            }

            const f = (t) => this._speedFunction(t, startX, startY, endX, endY, tangents);
            
            const adaptiveIntegral = (a, b, depth) => {
                const whole = this._gaussLegendre5(f, a, b);
                const m = (a + b) * 0.5;
                const left = this._gaussLegendre5(f, a, m);
                const right = this._gaussLegendre5(f, m, b);
                
                const error = Math.abs(left + right - whole);
                
                if (error < tolerance || depth >= 8) {
                    return left + right;
                }
                
                return adaptiveIntegral(a, m, depth + 1) + 
                       adaptiveIntegral(m, b, depth + 1);
            };
            
            const length = adaptiveIntegral(0, 1, 0);
            this.arcLengthCache.set(key, length);
            
            this._trimCache(this.arcLengthCache, 100);
            
            return length;
        }

        _buildArcLengthTable(startX, startY, endX, endY, tangents, steps = 100) {
            const key = `table_${startX},${startY},${endX},${endY},${tangents.start.x},${tangents.start.y},${tangents.end.x},${tangents.end.y}`;
            
            if (this.arcLengthCache.has(key)) {
                return this.arcLengthCache.get(key);
            }
            
            const table = new Array(steps + 1);
            let prevPoint = this._calculatePoint(0, startX, startY, endX, endY, tangents);
            table[0] = { t: 0, length: 0 };
            
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const point = this._calculatePoint(t, startX, startY, endX, endY, tangents);
                const dx = point.x - prevPoint.x;
                const dy = point.y - prevPoint.y;
                const segmentLength = Math.sqrt(dx * dx + dy * dy);
                
                table[i] = { 
                    t, 
                    length: table[i-1].length + segmentLength 
                };
                
                prevPoint = point;
            }
            
            this.arcLengthCache.set(key, table);
            return table;
        }

        _getDistanceFromStart(t, startX, startY, endX, endY, tangents) {
            if (t <= 0) return 0;
            if (t >= 1) return this._adaptiveGaussArcLength(startX, startY, endX, endY, tangents);
            
            const f = (u) => this._speedFunction(u, startX, startY, endX, endY, tangents);
            return this._gaussLegendre5(f, 0, t);
        }

        _getDistanceToEnd(t, startX, startY, endX, endY, tangents) {
            const totalLength = this._adaptiveGaussArcLength(startX, startY, endX, endY, tangents);
            const distanceFromStart = this._getDistanceFromStart(t, startX, startY, endX, endY, tangents);
            return totalLength - distanceFromStart;
        }

        _findTAtDistanceInSegment(targetDistance, startX, startY, endX, endY, tangents) {
            if (targetDistance <= 0) return 0;
            
            const totalLength = this._adaptiveGaussArcLength(startX, startY, endX, endY, tangents);
            if (targetDistance >= totalLength) return 1;
            
            let low = 0, high = 1;
            for (let i = 0; i < 15; i++) {
                const mid = (low + high) * 0.5;
                const length = this._getDistanceFromStart(mid, startX, startY, endX, endY, tangents);
                
                if (length < targetDistance) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            
            return (low + high) * 0.5;
        }

        
        _getHermiteControlPoints(target) {
            if (!this.hermiteControlPoints[target.id]) {
                this.hermiteControlPoints[target.id] = [];
            }
            return this.hermiteControlPoints[target.id];
        }

        _clearHermiteCache(target) {
            this._clearCache(target);
        }

        _getHermiteCacheKey(target, closed) {
            const points = this._getHermiteControlPoints(target);
            let key = target.id + '_' + closed;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                key += '_' + p.x + ',' + p.y + ',' + p.vx + ',' + p.vy;
            }
            return key;
        }

        
        _getHermiteSegment(points, index, closed) {
            const n = points.length;
            
            if (n < 2) return null;
            
            const p1 = points[index];
            const p2 = points[(index + 1) % n];
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            
            const scale = segmentLength > 0 ? segmentLength : 1;
            
            return {
                start: { x: p1.x, y: p1.y },
                end: { x: p2.x, y: p2.y },
                tangentStart: { 
                    x: p1.vx * scale,
                    y: p1.vy * scale
                },
                tangentEnd: { 
                    x: p2.vx * scale,
                    y: p2.vy * scale
                }
            };
        }

        _evaluateHermitePoint(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const t2 = t * t;
            const t3 = t2 * t;
            
            const h00 = 2 * t3 - 3 * t2 + 1;
            const h10 = t3 - 2 * t2 + t;
            const h01 = -2 * t3 + 3 * t2;
            const h11 = t3 - t2;
            
            return {
                x: h00 * segment.start.x + 
                   h10 * segment.tangentStart.x + 
                   h01 * segment.end.x + 
                   h11 * segment.tangentEnd.x,
                y: h00 * segment.start.y + 
                   h10 * segment.tangentStart.y + 
                   h01 * segment.end.y + 
                   h11 * segment.tangentEnd.y
            };
        }

        _evaluateHermiteDerivative(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const t2 = t * t;
            
            const dh00 = 6 * t2 - 6 * t;
            const dh10 = 3 * t2 - 4 * t + 1;
            const dh01 = -6 * t2 + 6 * t;
            const dh11 = 3 * t2 - 2 * t;
            
            return {
                x: dh00 * segment.start.x + 
                   dh10 * segment.tangentStart.x + 
                   dh01 * segment.end.x + 
                   dh11 * segment.tangentEnd.x,
                y: dh00 * segment.start.y + 
                   dh10 * segment.tangentStart.y + 
                   dh01 * segment.end.y + 
                   dh11 * segment.tangentEnd.y
            };
        }

        _evaluateHermiteSecondDerivative(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const d2h00 = 12 * t - 6;
            const d2h10 = 6 * t - 4;
            const d2h01 = -12 * t + 6;
            const d2h11 = 6 * t - 2;
            
            return {
                x: d2h00 * segment.start.x + 
                   d2h10 * segment.tangentStart.x + 
                   d2h01 * segment.end.x + 
                   d2h11 * segment.tangentEnd.x,
                y: d2h00 * segment.start.y + 
                   d2h10 * segment.tangentStart.y + 
                   d2h01 * segment.end.y + 
                   d2h11 * segment.tangentEnd.y
            };
        }

        _getHermiteArcLength(points, target, closed) {
            if (points.length < 2) return 0;
            
            const cacheKey = this._getHermiteCacheKey(target, closed);
            if (this.hermiteArcLengthCache.has(cacheKey)) {
                return this.hermiteArcLengthCache.get(cacheKey);
            }
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            let totalLength = 0;
            
            for (let i = 0; i < segmentCount; i++) {
                const segment = this._getHermiteSegment(points, i, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                totalLength += this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
            }
            
            this.hermiteArcLengthCache.set(cacheKey, totalLength);
            this._trimCache(this.hermiteArcLengthCache);
            
            return totalLength;
        }

        _getHermiteDistanceFromStart(globalT, points, target, closed) {
            if (points.length < 2) return 0;
            if (globalT <= 0) return 0;
            if (globalT >= 1) return this._getHermiteArcLength(points, target, closed);
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            const segmentIndex = Math.floor(globalT * segmentCount);
            const localT = (globalT * segmentCount) - segmentIndex;
            
            let distance = 0;
            
            for (let i = 0; i < segmentIndex; i++) {
                const segment = this._getHermiteSegment(points, i, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                distance += this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
            }
            
            const currentSegment = this._getHermiteSegment(points, segmentIndex, closed);
            if (currentSegment) {
                const hermiteTangents = {
                    start: currentSegment.tangentStart,
                    end: currentSegment.tangentEnd
                };
                distance += this._getDistanceFromStart(
                    localT,
                    currentSegment.start.x, currentSegment.start.y,
                    currentSegment.end.x, currentSegment.end.y,
                    hermiteTangents
                );
            }
            
            return distance;
        }

        _getHermitePointAtGlobalT(globalT, points, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const hermiteSegment = this._getHermiteSegment(points, segment, closed);
            return this._evaluateHermitePoint(localT, hermiteSegment);
        }

        _getHermiteDerivativeAtGlobalT(globalT, points, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const hermiteSegment = this._getHermiteSegment(points, segment, closed);
            return this._evaluateHermiteDerivative(localT, hermiteSegment);
        }

        _getHermiteSecondDerivativeAtGlobalT(globalT, points, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const hermiteSegment = this._getHermiteSegment(points, segment, closed);
            return this._evaluateHermiteSecondDerivative(localT, hermiteSegment);
        }

        _findHermiteTAtDistance(targetDistance, points, target, closed) {
            const totalLength = this._getHermiteArcLength(points, target, closed);
            
            if (targetDistance <= 0) return 0;
            if (targetDistance >= totalLength) return 1;
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let accumulatedLength = 0;
            for (let i = 0; i < segmentCount; i++) {
                const segment = this._getHermiteSegment(points, i, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                const segmentLength = this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
                
                if (targetDistance <= accumulatedLength + segmentLength) {
                    const remainingDistance = targetDistance - accumulatedLength;
                    const localT = this._findTAtDistanceInSegment(
                        remainingDistance,
                        segment.start.x, segment.start.y,
                        segment.end.x, segment.end.y,
                        hermiteTangents
                    );
                    
                    return (i + localT) / segmentCount;
                }
                
                accumulatedLength += segmentLength;
            }
            
            return 1;
        }

        _getHermiteProperty(globalT, points, target, closed, property) {
            if (points.length < 2) return 0;
            
            const point = this._getHermitePointAtGlobalT(globalT, points, closed);
            const derivative = this._getHermiteDerivativeAtGlobalT(globalT, points, closed);
            const secondDerivative = this._getHermiteSecondDerivativeAtGlobalT(globalT, points, closed);
            
            const dx = derivative.x;
            const dy = derivative.y;
            const d2x = secondDerivative.x;
            const d2y = secondDerivative.y;
            const speedSquared = dx * dx + dy * dy;
            
            switch(property) {
                case 'x': return point.x;
                case 'y': return point.y;
                case 'angle': {
                    const mathAngle = Math.atan2(dy, dx);
                    return this._toScratchAngle(mathAngle);
                }
                case 'velocity': return Math.sqrt(speedSquared);
                case 'acceleration': return Math.sqrt(d2x * d2x + d2y * d2y);
                case 'jerk': {
                    const t = globalT;
                    const segment = this._getHermiteSegment(points, Math.floor(globalT * (closed ? points.length : points.length - 1)), closed);
                    if (!segment) return 0;
                    const thirdDeriv = this._calculateThirdDerivative(
                        t,
                        segment.start.x, segment.start.y,
                        segment.end.x, segment.end.y,
                        { start: segment.tangentStart, end: segment.tangentEnd }
                    );
                    return Math.sqrt(thirdDeriv.x * thirdDeriv.x + thirdDeriv.y * thirdDeriv.y);
                }
                case 'curvature': {
                    if (speedSquared < 0.0001) return 0;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    return numerator / denominator;
                }
                case 'radius': {
                    if (speedSquared < 0.0001) return Infinity;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    const curvature = numerator / denominator;
                    if (curvature < 0.0001) return Infinity;
                    return 1 / curvature;
                }
                case 'normalAngle': {
                    const normal = this._getNormalVector(dx, dy);
                    const mathAngle = Math.atan2(normal.y, normal.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'distanceFromStart':
                    return this._getHermiteDistanceFromStart(globalT, points, target, closed);
                case 'distanceToEnd': {
                    const totalLength = this._getHermiteArcLength(points, target, closed);
                    const distanceFromStart = this._getHermiteDistanceFromStart(globalT, points, target, closed);
                    return totalLength - distanceFromStart;
                }
                default: return 0;
            }
        }

        
        _getCardinalControlPoints(target) {
            if (!this.cardinalControlPoints[target.id]) {
                this.cardinalControlPoints[target.id] = [];
            }
            return this.cardinalControlPoints[target.id];
        }

        _clearCardinalCache(target) {
            this._clearCache(target);
        }

        _getCardinalCacheKey(target, tension, closed) {
            const points = this._getCardinalControlPoints(target);
            let key = target.id + '_' + tension + '_' + closed;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                key += '_' + p.x + ',' + p.y;
            }
            return key;
        }

        _getCardinalSegment(points, index, tension, closed) {
            const n = points.length;
            
            if (n < 2) return null;
            if (n === 2) {
                const dx = points[1].x - points[0].x;
                const dy = points[1].y - points[0].y;
                const factor = 1 - tension;
                return {
                    start: points[0],
                    end: points[1],
                    tangentStart: { x: dx * factor, y: dy * factor },
                    tangentEnd: { x: dx * factor, y: dy * factor }
                };
            }
            
            const p1 = points[index];
            const p2 = points[(index + 1) % n];
            
            let p0, p3;
            if (closed) {
                p0 = points[(index - 1 + n) % n];
                p3 = points[(index + 2) % n];
            } else {
                p0 = (index === 0) ? p1 : points[index - 1];
                p3 = (index === n - 2) ? p2 : points[index + 2];
            }
            
            const factor = 1 - tension;
            const tangentStart = {
                x: factor * (p2.x - p0.x),
                y: factor * (p2.y - p0.y)
            };
            const tangentEnd = {
                x: factor * (p3.x - p1.x),
                y: factor * (p3.y - p1.y)
            };
            
            return {
                start: p1,
                end: p2,
                tangentStart,
                tangentEnd
            };
        }

        _evaluateCardinalPoint(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const hermiteTangents = {
                start: segment.tangentStart,
                end: segment.tangentEnd
            };
            
            return this._calculatePoint(
                t,
                segment.start.x, segment.start.y,
                segment.end.x, segment.end.y,
                hermiteTangents
            );
        }

        _evaluateCardinalDerivative(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const hermiteTangents = {
                start: segment.tangentStart,
                end: segment.tangentEnd
            };
            
            return this._calculateDerivative(
                t,
                segment.start.x, segment.start.y,
                segment.end.x, segment.end.y,
                hermiteTangents
            );
        }

        _evaluateCardinalSecondDerivative(t, segment) {
            if (!segment) return { x: 0, y: 0 };
            
            const hermiteTangents = {
                start: segment.tangentStart,
                end: segment.tangentEnd
            };
            
            return this._calculateSecondDerivative(
                t,
                segment.start.x, segment.start.y,
                segment.end.x, segment.end.y,
                hermiteTangents
            );
        }

        _getCardinalArcLength(points, tension, target, closed) {
            if (points.length < 2) return 0;
            
            const cacheKey = this._getCardinalCacheKey(target, tension, closed);
            if (this.cardinalArcLengthCache.has(cacheKey)) {
                return this.cardinalArcLengthCache.get(cacheKey);
            }
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            let totalLength = 0;
            
            for (let i = 0; i < segmentCount; i++) {
                const segment = this._getCardinalSegment(points, i, tension, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                totalLength += this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
            }
            
            this.cardinalArcLengthCache.set(cacheKey, totalLength);
            this._trimCache(this.cardinalArcLengthCache);
            
            return totalLength;
        }

        _getCardinalDistanceFromStart(globalT, points, tension, target, closed) {
            if (points.length < 2) return 0;
            if (globalT <= 0) return 0;
            if (globalT >= 1) return this._getCardinalArcLength(points, tension, target, closed);
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            const segmentIndex = Math.floor(globalT * segmentCount);
            const localT = (globalT * segmentCount) - segmentIndex;
            
            let distance = 0;
            
            for (let i = 0; i < segmentIndex; i++) {
                const segment = this._getCardinalSegment(points, i, tension, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                distance += this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
            }
            
            const currentSegment = this._getCardinalSegment(points, segmentIndex, tension, closed);
            if (currentSegment) {
                const hermiteTangents = {
                    start: currentSegment.tangentStart,
                    end: currentSegment.tangentEnd
                };
                distance += this._getDistanceFromStart(
                    localT,
                    currentSegment.start.x, currentSegment.start.y,
                    currentSegment.end.x, currentSegment.end.y,
                    hermiteTangents
                );
            }
            
            return distance;
        }

        _getCardinalPointAtGlobalT(globalT, points, tension, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const cardinalSegment = this._getCardinalSegment(points, segment, tension, closed);
            return this._evaluateCardinalPoint(localT, cardinalSegment);
        }

        _getCardinalDerivativeAtGlobalT(globalT, points, tension, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const cardinalSegment = this._getCardinalSegment(points, segment, tension, closed);
            return this._evaluateCardinalDerivative(localT, cardinalSegment);
        }

        _getCardinalSecondDerivativeAtGlobalT(globalT, points, tension, closed) {
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let segment, localT;
            
            if (globalT <= 0) {
                segment = 0;
                localT = 0;
            } else if (globalT >= 1) {
                segment = segmentCount - 1;
                localT = 1;
            } else {
                segment = Math.floor(globalT * segmentCount);
                localT = (globalT * segmentCount) - segment;
            }
            
            const cardinalSegment = this._getCardinalSegment(points, segment, tension, closed);
            return this._evaluateCardinalSecondDerivative(localT, cardinalSegment);
        }

        _findCardinalTAtDistance(targetDistance, points, tension, target, closed) {
            const totalLength = this._getCardinalArcLength(points, tension, target, closed);
            
            if (targetDistance <= 0) return 0;
            if (targetDistance >= totalLength) return 1;
            
            const n = points.length;
            const segmentCount = closed ? n : n - 1;
            
            let accumulatedLength = 0;
            for (let i = 0; i < segmentCount; i++) {
                const segment = this._getCardinalSegment(points, i, tension, closed);
                if (!segment) continue;
                
                const hermiteTangents = {
                    start: segment.tangentStart,
                    end: segment.tangentEnd
                };
                const segmentLength = this._adaptiveGaussArcLength(
                    segment.start.x, segment.start.y,
                    segment.end.x, segment.end.y,
                    hermiteTangents
                );
                
                if (targetDistance <= accumulatedLength + segmentLength) {
                    const remainingDistance = targetDistance - accumulatedLength;
                    const localT = this._findTAtDistanceInSegment(
                        remainingDistance,
                        segment.start.x, segment.start.y,
                        segment.end.x, segment.end.y,
                        hermiteTangents
                    );
                    
                    return (i + localT) / segmentCount;
                }
                
                accumulatedLength += segmentLength;
            }
            
            return 1;
        }

        _getCardinalProperty(globalT, points, tension, target, closed, property) {
            if (points.length < 2) return 0;
            
            const point = this._getCardinalPointAtGlobalT(globalT, points, tension, closed);
            const derivative = this._getCardinalDerivativeAtGlobalT(globalT, points, tension, closed);
            const secondDerivative = this._getCardinalSecondDerivativeAtGlobalT(globalT, points, tension, closed);
            
            const dx = derivative.x;
            const dy = derivative.y;
            const d2x = secondDerivative.x;
            const d2y = secondDerivative.y;
            const speedSquared = dx * dx + dy * dy;
            
            switch(property) {
                case 'x': return point.x;
                case 'y': return point.y;
                case 'angle': {
                    const mathAngle = Math.atan2(dy, dx);
                    return this._toScratchAngle(mathAngle);
                }
                case 'velocity': return Math.sqrt(speedSquared);
                case 'curvature': {
                    if (speedSquared < 0.0001) return 0;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    return numerator / denominator;
                }
                case 'radius': {
                    if (speedSquared < 0.0001) return Infinity;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    const curvature = numerator / denominator;
                    if (curvature < 0.0001) return Infinity;
                    return 1 / curvature;
                }
                case 'normalAngle': {
                    const normal = this._getNormalVector(dx, dy);
                    const mathAngle = Math.atan2(normal.y, normal.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'distanceFromStart':
                    return this._getCardinalDistanceFromStart(globalT, points, tension, target, closed);
                case 'distanceToEnd': {
                    const totalLength = this._getCardinalArcLength(points, tension, target, closed);
                    const distanceFromStart = this._getCardinalDistanceFromStart(globalT, points, tension, target, closed);
                    return totalLength - distanceFromStart;
                }
                default: return 0;
            }
        }

        
        setHermiteTangent(args, util) {
            const tangents = this._getTangents(util.target);
            if (args.WHICH === 'start') {
                tangents.start = { x: args.X, y: args.Y };
            } else {
                tangents.end = { x: args.X, y: args.Y };
            }
            this._clearCache(util.target);
        }

        adjustHermiteTangentByAngle(args, util) {
            const tangents = this._getTangents(util.target);
            const angleRad = this._fromScratchAngle(args.ANGLE);
            const length = args.LENGTH;
            
            const tangent = {
                x: Math.cos(angleRad) * length,
                y: Math.sin(angleRad) * length
            };
            
            if (args.WHICH === 'start') {
                tangents.start = tangent;
            } else {
                tangents.end = tangent;
            }
            this._clearCache(util.target);
        }

        getHermiteTangents(args, util) {
            const tangents = this._getTangents(util.target);
            return JSON.stringify({
                start: tangents.start,
                end: tangents.end
            });
        }

        clearHermiteTangents(args, util) {
            this.tangents[util.target.id] = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 }
            };
            this._clearCache(util.target);
        }

        getHermiteValue(args, util) {
            const tangents = this._getTangents(util.target);
            const t = args.PERCENT / 100;
            
            const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            const derivative = this._calculateDerivative(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            const secondDerivative = this._calculateSecondDerivative(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            const thirdDerivative = this._calculateThirdDerivative(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            
            const dx = derivative.x;
            const dy = derivative.y;
            const d2x = secondDerivative.x;
            const d2y = secondDerivative.y;
            const d3x = thirdDerivative.x;
            const d3y = thirdDerivative.y;
            
            const speedSquared = dx * dx + dy * dy;
            const speed = Math.sqrt(speedSquared);
            
            switch(args.PROPERTY) {
                case 'x': return point.x;
                case 'y': return point.y;
                case 'angle': {
                    const mathAngle = Math.atan2(dy, dx);
                    return this._toScratchAngle(mathAngle);
                }
                case 'velocity': return speed;
                case 'acceleration': return Math.sqrt(d2x * d2x + d2y * d2y);
                case 'jerk': return Math.sqrt(d3x * d3x + d3y * d3y);
                case 'curvature': {
                    if (speedSquared < 0.0001) return 0;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    return numerator / denominator;
                }
                case 'radius': {
                    if (speedSquared < 0.0001) return Infinity;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    const curvature = numerator / denominator;
                    if (curvature < 0.0001) return Infinity;
                    return 1 / curvature;
                }
                case 'normalAngle': {
                    const normal = this._getNormalVector(dx, dy);
                    const mathAngle = Math.atan2(normal.y, normal.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'distanceFromStart':
                    return this._getDistanceFromStart(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                case 'distanceToEnd':
                    return this._getDistanceToEnd(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                default: return 0;
            }
        }

        getHermiteArcLength(args, util) {
            const tangents = this._getTangents(util.target);
            return this._adaptiveGaussArcLength(
                args.STARTX, args.STARTY, 
                args.ENDX, args.ENDY, 
                tangents
            );
        }

        getHermiteVector(args, util) {
            const tangents = this._getTangents(util.target);
            const t = args.PERCENT / 100;
            const derivative = this._calculateDerivative(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            
            let vector = { x: 0, y: 0 };
            
            switch(args.VECTOR) {
                case 'tangent': vector = derivative; break;
                case 'normal': vector = this._getNormalVector(derivative.x, derivative.y); break;
                case 'unitTangent': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = normalized;
                    break;
                }
                case 'unitNormal': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = this._getNormalVector(normalized.x, normalized.y);
                    break;
                }
            }
            
            switch(args.COMPONENT) {
                case 'x': return vector.x;
                case 'y': return vector.y;
                case 'angle': {
                    const mathAngle = Math.atan2(vector.y, vector.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'magnitude': return this._getVectorMagnitude(vector.x, vector.y);
                default: return 0;
            }
        }

        pointAtHermiteDistance(args, util) {
            const tangents = this._getTangents(util.target);
            const targetDistance = parseFloat(args.DISTANCE);
            
            // 零速的情况
            if (tangents.start.x === 0 && tangents.start.y === 0 && 
                tangents.end.x === 0 && tangents.end.y === 0) {
                const dx = args.ENDX - args.STARTX;
                const dy = args.ENDY - args.STARTY;
                const totalDistance = Math.sqrt(dx * dx + dy * dy);
                
                if (totalDistance === 0) {
                    if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                        return args.PROPERTY === 'x' ? args.STARTX : args.STARTY;
                    } else if (args.PROPERTY === 'distanceToEnd') {
                        return Math.max(0, totalDistance - targetDistance);
                    }
                    return 0;
                }
                
                let t;
                if (targetDistance <= 0) t = 0;
                else if (targetDistance >= totalDistance) t = 1;
                else t = targetDistance / totalDistance;
                
                if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                    const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                    return args.PROPERTY === 'x' ? point.x : point.y;
                } else if (args.PROPERTY === 'distanceToEnd') {
                    return Math.max(0, totalDistance - targetDistance);
                } else {
                    return this.getHermiteValue({
                        PROPERTY: args.PROPERTY,
                        PERCENT: t * 100,
                        STARTX: args.STARTX,
                        STARTY: args.STARTY,
                        ENDX: args.ENDX,
                        ENDY: args.ENDY
                    }, util);
                }
            }
            
            const table = this._buildArcLengthTable(
                args.STARTX, args.STARTY, 
                args.ENDX, args.ENDY, 
                tangents, 100
            );
            
            const totalLength = table[table.length - 1].length;
            
            if (targetDistance <= 0) {
                const t = 0;
                if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                    const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                    return args.PROPERTY === 'x' ? point.x : point.y;
                } else if (args.PROPERTY === 'distanceToEnd') {
                    return totalLength;
                } else {
                    return this.getHermiteValue({
                        PROPERTY: args.PROPERTY,
                        PERCENT: 0,
                        STARTX: args.STARTX,
                        STARTY: args.STARTY,
                        ENDX: args.ENDX,
                        ENDY: args.ENDY
                    }, util);
                }
            }
            
            if (targetDistance >= totalLength) {
                const t = 1;
                if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                    const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                    return args.PROPERTY === 'x' ? point.x : point.y;
                } else if (args.PROPERTY === 'distanceToEnd') {
                    return 0;
                } else {
                    return this.getHermiteValue({
                        PROPERTY: args.PROPERTY,
                        PERCENT: 100,
                        STARTX: args.STARTX,
                        STARTY: args.STARTY,
                        ENDX: args.ENDX,
                        ENDY: args.ENDY
                    }, util);
                }
            }
            
            let left = 0, right = table.length - 1;
            while (left < right) {
                const mid = Math.floor((left + right) / 2);
                if (table[mid].length < targetDistance) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }
            
            const idx = left;
            const prev = table[idx - 1];
            const next = table[idx];
            const ratio = (targetDistance - prev.length) / (next.length - prev.length);
            const t = prev.t + (next.t - prev.t) * ratio;
            
            if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                return args.PROPERTY === 'x' ? point.x : point.y;
            } else if (args.PROPERTY === 'distanceToEnd') {
                return totalLength - targetDistance;
            } else {
                return this.getHermiteValue({
                    PROPERTY: args.PROPERTY,
                    PERCENT: t * 100,
                    STARTX: args.STARTX,
                    STARTY: args.STARTY,
                    ENDX: args.ENDX,
                    ENDY: args.ENDY
                }, util);
            }
        }

        getHermitePath(args, util) {
            const tangents = this._getTangents(util.target);
            const points = parseInt(args.POINTS);
            const path = new Array(points);
            
            for (let i = 0; i < points; i++) {
                const t = i / (points - 1);
                path[i] = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            }
            
            return JSON.stringify(path);
        }

        getHermitePathPoint(args, util) {
            const tangents = this._getTangents(util.target);
            const points = parseInt(args.POINTS);
            const index = Math.max(1, Math.min(parseInt(args.INDEX), points));
            const t = (index - 1) / (points - 1);
            
            if (args.PROPERTY === 'x' || args.PROPERTY === 'y') {
                const point = this._calculatePoint(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
                return args.PROPERTY === 'x' ? point.x : point.y;
            } else if (args.PROPERTY === 'distanceFromStart') {
                return this._getDistanceFromStart(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            } else if (args.PROPERTY === 'distanceToEnd') {
                return this._getDistanceToEnd(t, args.STARTX, args.STARTY, args.ENDX, args.ENDY, tangents);
            } else {
                return this.getHermiteValue({
                    PROPERTY: args.PROPERTY,
                    PERCENT: t * 100,
                    STARTX: args.STARTX,
                    STARTY: args.STARTY,
                    ENDX: args.ENDX,
                    ENDY: args.ENDY
                }, util);
            }
        }

        
        addHermiteControlPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            points.push({ 
                x: args.X, 
                y: args.Y,
                vx: args.VX,
                vy: args.VY
            });
            this._clearHermiteCache(util.target);
        }

        addHermiteControlPointByAngle(args, util) {
            const { x, y } = this._angleToComponents(args.ANGLE, args.MAG);
            const points = this._getHermiteControlPoints(util.target);
            points.push({ 
                x: args.X, 
                y: args.Y,
                vx: x,
                vy: y
            });
            this._clearHermiteCache(util.target);
        }

        insertHermiteControlPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = Math.max(0, Math.min(parseInt(args.N) - 1, points.length));
            points.splice(index, 0, { 
                x: args.X, 
                y: args.Y,
                vx: args.VX,
                vy: args.VY
            });
            this._clearHermiteCache(util.target);
        }

        insertHermiteControlPointByAngle(args, util) {
            const { x, y } = this._angleToComponents(args.ANGLE, args.MAG);
            const points = this._getHermiteControlPoints(util.target);
            const index = Math.max(0, Math.min(parseInt(args.N) - 1, points.length));
            points.splice(index, 0, { 
                x: args.X, 
                y: args.Y,
                vx: x,
                vy: y
            });
            this._clearHermiteCache(util.target);
        }

        setHermiteControlPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points[index] = { 
                    x: args.X, 
                    y: args.Y,
                    vx: args.VX,
                    vy: args.VY
                };
                this._clearHermiteCache(util.target);
            }
        }

        setHermiteControlPointByAngle(args, util) {
            const { x, y } = this._angleToComponents(args.ANGLE, args.MAG);
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points[index] = { 
                    x: args.X, 
                    y: args.Y,
                    vx: x,
                    vy: y
                };
                this._clearHermiteCache(util.target);
            }
        }

        setHermiteControlPointVelocity(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points[index].vx = args.VX;
                points[index].vy = args.VY;
                this._clearHermiteCache(util.target);
            }
        }

        setHermiteControlPointVelocityByAngle(args, util) {
            const { x, y } = this._angleToComponents(args.ANGLE, args.MAG);
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points[index].vx = x;
                points[index].vy = y;
                this._clearHermiteCache(util.target);
            }
        }

        deleteHermiteControlPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points.splice(index, 1);
                this._clearHermiteCache(util.target);
            }
        }

        clearHermiteControlPoints(args, util) {
            this.hermiteControlPoints[util.target.id] = [];
            this._clearHermiteCache(util.target);
        }

        getHermiteControlPoints(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            return JSON.stringify(points);
        }

        getHermiteControlPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                const point = points[index];
                switch(args.PROPERTY) {
                    case 'x': return point.x;
                    case 'y': return point.y;
                    case 'vx': return point.vx;
                    case 'vy': return point.vy;
                    case 'angle': {
                        const mathAngle = Math.atan2(point.vy, point.vx);
                        return this._toScratchAngle(mathAngle);
                    }
                    case 'magnitude':
                        return this._getVectorMagnitude(point.vx, point.vy);
                    default: return 0;
                }
            }
            return 0;
        }

        getHermiteControlPointVelocity(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                const point = points[index];
                switch(args.COMPONENT) {
                    case 'x': return point.vx;
                    case 'y': return point.vy;
                    case 'angle': {
                        const mathAngle = Math.atan2(point.vy, point.vx);
                        return this._toScratchAngle(mathAngle);
                    }
                    case 'magnitude':
                        return this._getVectorMagnitude(point.vx, point.vy);
                    default: return 0;
                }
            }
            return 0;
        }

        hermiteControlPointCount(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            return points.length;
        }

        getHermiteSplinePoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            const globalT = args.T / 100;
            const closed = args.TYPE === 'closed';
            return this._getHermiteProperty(globalT, points, util.target, closed, args.PROPERTY);
        }

        getHermiteSplineSegment(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const closed = args.TYPE === 'closed';
            const segmentCount = closed ? points.length : points.length - 1;
            const segmentIndex = Math.min(parseInt(args.SEGMENT) - 1, segmentCount - 1);
            const localT = args.LOCALT / 100;
            
            const hermiteSegment = this._getHermiteSegment(points, segmentIndex, closed);
            if (!hermiteSegment) return 0;
            
            const point = this._evaluateHermitePoint(localT, hermiteSegment);
            const derivative = this._evaluateHermiteDerivative(localT, hermiteSegment);
            const secondDerivative = this._evaluateHermiteSecondDerivative(localT, hermiteSegment);
            
            const dx = derivative.x;
            const dy = derivative.y;
            const d2x = secondDerivative.x;
            const d2y = secondDerivative.y;
            const speedSquared = dx * dx + dy * dy;
            
            switch(args.PROPERTY) {
                case 'x': return point.x;
                case 'y': return point.y;
                case 'angle': {
                    const mathAngle = Math.atan2(dy, dx);
                    return this._toScratchAngle(mathAngle);
                }
                case 'velocity': return Math.sqrt(speedSquared);
                case 'acceleration': return Math.sqrt(d2x * d2x + d2y * d2y);
                case 'jerk': {
                    const thirdDeriv = this._calculateThirdDerivative(
                        localT,
                        hermiteSegment.start.x, hermiteSegment.start.y,
                        hermiteSegment.end.x, hermiteSegment.end.y,
                        { start: hermiteSegment.tangentStart, end: hermiteSegment.tangentEnd }
                    );
                    return Math.sqrt(thirdDeriv.x * thirdDeriv.x + thirdDeriv.y * thirdDeriv.y);
                }
                case 'curvature': {
                    if (speedSquared < 0.0001) return 0;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    return numerator / denominator;
                }
                case 'radius': {
                    if (speedSquared < 0.0001) return Infinity;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    const curvature = numerator / denominator;
                    if (curvature < 0.0001) return Infinity;
                    return 1 / curvature;
                }
                case 'normalAngle': {
                    const normal = this._getNormalVector(dx, dy);
                    const mathAngle = Math.atan2(normal.y, normal.x);
                    return this._toScratchAngle(mathAngle);
                }
                default: return 0;
            }
        }

        getHermiteSplinePath(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return JSON.stringify([]);
            
            const numPoints = parseInt(args.POINTS);
            const closed = args.TYPE === 'closed';
            
            const path = new Array(numPoints);
            
            for (let i = 0; i < numPoints; i++) {
                const globalT = i / (numPoints - 1);
                path[i] = this._getHermitePointAtGlobalT(globalT, points, closed);
            }
            
            return JSON.stringify(path);
        }

        getHermiteSplinePathPoint(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const numPoints = parseInt(args.POINTS);
            const index = Math.max(1, Math.min(parseInt(args.INDEX), numPoints));
            const globalT = (index - 1) / (numPoints - 1);
            const closed = args.TYPE === 'closed';
            
            return this._getHermiteProperty(globalT, points, util.target, closed, args.PROPERTY);
        }

        pointAtHermiteSplineDistance(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const targetDistance = parseFloat(args.DISTANCE);
            const closed = args.TYPE === 'closed';
            
            const t = this._findHermiteTAtDistance(targetDistance, points, util.target, closed);
            return this._getHermiteProperty(t, points, util.target, closed, args.PROPERTY);
        }

        getHermiteSplineVector(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const globalT = args.T / 100;
            const closed = args.TYPE === 'closed';
            
            const derivative = this._getHermiteDerivativeAtGlobalT(globalT, points, closed);
            
            let vector = { x: 0, y: 0 };
            
            switch(args.VECTOR) {
                case 'tangent': vector = derivative; break;
                case 'normal': vector = this._getNormalVector(derivative.x, derivative.y); break;
                case 'unitTangent': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = normalized;
                    break;
                }
                case 'unitNormal': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = this._getNormalVector(normalized.x, normalized.y);
                    break;
                }
            }
            
            switch(args.COMPONENT) {
                case 'x': return vector.x;
                case 'y': return vector.y;
                case 'angle': {
                    const mathAngle = Math.atan2(vector.y, vector.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'magnitude': return this._getVectorMagnitude(vector.x, vector.y);
                default: return 0;
            }
        }

        getHermiteSplineArcLength(args, util) {
            const points = this._getHermiteControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const closed = args.TYPE === 'closed';
            return this._getHermiteArcLength(points, util.target, closed);
        }

        
        addCardinalControlPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            points.push({ x: args.X, y: args.Y });
            this._clearCardinalCache(util.target);
        }

        insertCardinalControlPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            const index = Math.max(0, Math.min(parseInt(args.N) - 1, points.length));
            points.splice(index, 0, { x: args.X, y: args.Y });
            this._clearCardinalCache(util.target);
        }

        setCardinalControlPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points[index] = { x: args.X, y: args.Y };
                this._clearCardinalCache(util.target);
            }
        }

        deleteCardinalControlPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                points.splice(index, 1);
                this._clearCardinalCache(util.target);
            }
        }

        clearCardinalControlPoints(args, util) {
            this.cardinalControlPoints[util.target.id] = [];
            this._clearCardinalCache(util.target);
        }

        getCardinalControlPoints(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            return JSON.stringify(points);
        }

        getCardinalControlPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            const index = parseInt(args.N) - 1;
            if (index >= 0 && index < points.length) {
                const point = points[index];
                return args.PROPERTY === 'x' ? point.x : point.y;
            }
            return 0;
        }

        cardinalControlPointCount(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            return points.length;
        }

        getCardinalPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            const tension = parseFloat(args.TENSION);
            const globalT = args.T / 100;
            const closed = args.TYPE === 'closed';
            return this._getCardinalProperty(globalT, points, tension, util.target, closed, args.PROPERTY);
        }

        getCardinalSegment(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const tension = parseFloat(args.TENSION);
            const closed = args.TYPE === 'closed';
            const segmentCount = closed ? points.length : points.length - 1;
            const segmentIndex = Math.min(parseInt(args.SEGMENT) - 1, segmentCount - 1);
            const localT = args.LOCALT / 100;
            
            const cardinalSegment = this._getCardinalSegment(points, segmentIndex, tension, closed);
            if (!cardinalSegment) return 0;
            
            const point = this._evaluateCardinalPoint(localT, cardinalSegment);
            const derivative = this._evaluateCardinalDerivative(localT, cardinalSegment);
            const secondDerivative = this._evaluateCardinalSecondDerivative(localT, cardinalSegment);
            
            const dx = derivative.x;
            const dy = derivative.y;
            const d2x = secondDerivative.x;
            const d2y = secondDerivative.y;
            const speedSquared = dx * dx + dy * dy;
            
            switch(args.PROPERTY) {
                case 'x': return point.x;
                case 'y': return point.y;
                case 'angle': {
                    const mathAngle = Math.atan2(dy, dx);
                    return this._toScratchAngle(mathAngle);
                }
                case 'velocity': return Math.sqrt(speedSquared);
                case 'curvature': {
                    if (speedSquared < 0.0001) return 0;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    return numerator / denominator;
                }
                case 'radius': {
                    if (speedSquared < 0.0001) return Infinity;
                    const numerator = Math.abs(dx * d2y - dy * d2x);
                    const denominator = Math.pow(speedSquared, 1.5);
                    const curvature = numerator / denominator;
                    if (curvature < 0.0001) return Infinity;
                    return 1 / curvature;
                }
                case 'normalAngle': {
                    const normal = this._getNormalVector(dx, dy);
                    const mathAngle = Math.atan2(normal.y, normal.x);
                    return this._toScratchAngle(mathAngle);
                }
                default: return 0;
            }
        }

        getCardinalPath(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return JSON.stringify([]);
            
            const tension = parseFloat(args.TENSION);
            const numPoints = parseInt(args.POINTS);
            const closed = args.TYPE === 'closed';
            
            const path = new Array(numPoints);
            
            for (let i = 0; i < numPoints; i++) {
                const globalT = i / (numPoints - 1);
                path[i] = this._getCardinalPointAtGlobalT(globalT, points, tension, closed);
            }
            
            return JSON.stringify(path);
        }

        getCardinalPathPoint(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const tension = parseFloat(args.TENSION);
            const numPoints = parseInt(args.POINTS);
            const index = Math.max(1, Math.min(parseInt(args.INDEX), numPoints));
            const globalT = (index - 1) / (numPoints - 1);
            const closed = args.TYPE === 'closed';
            
            return this._getCardinalProperty(globalT, points, tension, util.target, closed, args.PROPERTY);
        }

        pointAtCardinalDistance(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const tension = parseFloat(args.TENSION);
            const targetDistance = parseFloat(args.DISTANCE);
            const closed = args.TYPE === 'closed';
            
            const t = this._findCardinalTAtDistance(targetDistance, points, tension, util.target, closed);
            return this._getCardinalProperty(t, points, tension, util.target, closed, args.PROPERTY);
        }

        getCardinalVector(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const tension = parseFloat(args.TENSION);
            const globalT = args.T / 100;
            const closed = args.TYPE === 'closed';
            
            const derivative = this._getCardinalDerivativeAtGlobalT(globalT, points, tension, closed);
            
            let vector = { x: 0, y: 0 };
            
            switch(args.VECTOR) {
                case 'tangent': vector = derivative; break;
                case 'normal': vector = this._getNormalVector(derivative.x, derivative.y); break;
                case 'unitTangent': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = normalized;
                    break;
                }
                case 'unitNormal': {
                    const normalized = this._normalizeVector(derivative.x, derivative.y);
                    vector = this._getNormalVector(normalized.x, normalized.y);
                    break;
                }
            }
            
            switch(args.COMPONENT) {
                case 'x': return vector.x;
                case 'y': return vector.y;
                case 'angle': {
                    const mathAngle = Math.atan2(vector.y, vector.x);
                    return this._toScratchAngle(mathAngle);
                }
                case 'magnitude': return this._getVectorMagnitude(vector.x, vector.y);
                default: return 0;
            }
        }

        getCardinalArcLength(args, util) {
            const points = this._getCardinalControlPoints(util.target);
            if (points.length < 2) return 0;
            
            const tension = parseFloat(args.TENSION);
            const closed = args.TYPE === 'closed';
            return this._getCardinalArcLength(points, tension, util.target, closed);
        }

        getInfo() {
            return {
                id: 'hermiteCurve',
                name: translate('hermiteCurve'),
                color1: '#FFB6C1',
                color2: '#FF69B4',
                color3: '#FF1493',
                blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1OC4yIiBoZWlnaHQ9IjI4Ljk2NzczIiB2aWV3Qm94PSIwLDAsNTguMiwyOC45Njc3MyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIxMC44OTc4MSwtMTY1LjUxNjEzKSI+PGcgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjE4LjM5NzgxLDE4Ni41ODM4NmMwLDAgMjUuODIxNjcsLTIyLjQ4OTc1IDQwLjAyNzY3LC05LjU1OTI3YzMuNDI5NzUsMy4xMjE4IDMuMTcyMzMsOS45NTkyNyAzLjE3MjMzLDkuOTU5MjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIxOC4zOTc4MSwxODYuNTgzODdjMCwwIDI1LjgyMTY3LC0yMi40ODk3NiA0MC4wMjc2NiwtOS41NTkyOGMzLjQyOTc1LDMuMTIxOCAzLjE3MjMzLDkuOTU5MjggMy4xNzIzMyw5Ljk1OTI4IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMjEuNTE4MjYsMTg2LjU4ODg4YzAsMS42NjQgLTEuMzcwMDIsMy4wMTI5NSAtMy4wNjAwMiwzLjAxMjk1Yy0xLjY5LDAgLTMuMDYwMDIsLTEuMzQ4OTUgLTMuMDYwMDIsLTMuMDEyOTVjMCwtMS42NjQgMS4zNzAwMiwtMy4wMTI5NCAzLjA2MDAyLC0zLjAxMjk0YzEuNjksMCAzLjA2MDAyLDEuMzQ4OTQgMy4wNjAwMiwzLjAxMjk0eiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjZmY2NjY2IiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjIxLjIwNzM2LDE4NC45MzU5M2wxNC4zNDI1NiwtOS4xOTc2NyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY2NjY2IiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIyOC4yNzkzNiwxNzMuMTM2MzJsOS41NjY0MSwwLjUwNTc1bC0xLjA4NDAzLDkuMjgwMDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmNjY2NiIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjI5LjEwMjE5MDAwMDAwMDAwNzoxNC40ODM4NjU3NzA4NjQ0MjUtLT4=',
                blocks: [
                    { blockType: Scratch.BlockType.LABEL, text: translate('byAuthor') },
                    
                    { blockType: Scratch.BlockType.LABEL, text: '=== ' + translate('hermiteCurve') + ' ===' },
                    {
                        opcode: 'setHermiteTangent',
                        blockType: 'command',
                        text: translate('setHermiteTangent'),
                        arguments: {
                            WHICH: {
                                type: 'string',
                                menu: 'velocitySelector',
                                defaultValue: 'start'
                            },
                            X: {
                                type: 'number',
                                defaultValue: 114
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 514
                            }
                        }
                    },
                    {
                        opcode: 'adjustHermiteTangentByAngle',
                        blockType: 'command',
                        text: translate('adjustHermiteTangentByAngle'),
                        arguments: {
                            WHICH: {
                                type: 'string',
                                menu: 'velocitySelector',
                                defaultValue: 'start'
                            },
                            ANGLE: {
                                type: 'angle',
                                defaultValue: 24.03
                            },
                            LENGTH: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteTangents',
                        blockType: 'reporter',
                        text: translate('hermiteTangents'),
                    },
                    {
                        opcode: 'clearHermiteTangents',
                        blockType: 'command',
                        text: translate('clearHermiteTangents'),
                    },
                    '---',
                    {
                        opcode: 'getHermiteValue',
                        blockType: 'reporter',
                        text: translate('hermiteValue'),
                        arguments: {
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteProperty',
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
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteArcLength',
                        blockType: 'reporter',
                        text: translate('hermiteArcLength'),
                        arguments: {
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
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteVector',
                        blockType: 'reporter',
                        text: translate('hermiteVector'),
                        arguments: {
                            VECTOR: {
                                type: 'string',
                                menu: 'vectorType',
                                defaultValue: 'tangent'
                            },
                            COMPONENT: {
                                type: 'string',
                                menu: 'vectorComponent',
                                defaultValue: 'magnitude'
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
                                defaultValue: 0
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'pointAtHermiteDistance',
                        blockType: 'reporter',
                        text: translate('pointAtHermiteDistance'),
                        arguments: {
                            DISTANCE: {
                                type: 'number',
                                defaultValue: 50
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteProperty',
                                defaultValue: 'x'
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
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getHermitePath',
                        blockType: 'reporter',
                        text: translate('hermitePath'),
                        arguments: {
                            POINTS: {
                                type: 'number',
                                defaultValue: 10,
                                min: 2,
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
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getHermitePathPoint',
                        blockType: 'reporter',
                        text: translate('hermitePathPoint'),
                        arguments: {
                            INDEX: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteProperty',
                                defaultValue: 'x'
                            },
                            POINTS: {
                                type: 'number',
                                defaultValue: 10,
                                min: 2,
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
                                defaultValue: 0
                            }
                        }
                    },
                    '---',
                    { blockType: Scratch.BlockType.LABEL, text: '=== ' + translate('hermiteSplineSetup') + ' ===' },
                    {
                        opcode: 'addHermiteControlPoint',
                        blockType: 'command',
                        text: translate('addHermiteControlPoint'),
                        arguments: {
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VX: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VY: {
                                type: 'number',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'addHermiteControlPointByAngle',
                        blockType: 'command',
                        text: translate('addHermiteControlPointByAngle'),
                        arguments: {
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            ANGLE: {
                                type: 'angle',
                                defaultValue: 0
                            },
                            MAG: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'insertHermiteControlPoint',
                        blockType: 'command',
                        text: translate('insertHermiteControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VX: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VY: {
                                type: 'number',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'insertHermiteControlPointByAngle',
                        blockType: 'command',
                        text: translate('insertHermiteControlPointByAngle'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            ANGLE: {
                                type: 'angle',
                                defaultValue: 0
                            },
                            MAG: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'setHermiteControlPoint',
                        blockType: 'command',
                        text: translate('setHermiteControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VX: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VY: {
                                type: 'number',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'setHermiteControlPointByAngle',
                        blockType: 'command',
                        text: translate('setHermiteControlPointByAngle'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            X: {
                                type: 'number',
                                defaultValue: 0
                            },
                            Y: {
                                type: 'number',
                                defaultValue: 0
                            },
                            ANGLE: {
                                type: 'angle',
                                defaultValue: 0
                            },
                            MAG: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'setHermiteControlPointVelocity',
                        blockType: 'command',
                        text: translate('setHermiteControlPointVelocity'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            VX: {
                                type: 'number',
                                defaultValue: 0
                            },
                            VY: {
                                type: 'number',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'setHermiteControlPointVelocityByAngle',
                        blockType: 'command',
                        text: translate('setHermiteControlPointVelocityByAngle'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            ANGLE: {
                                type: 'angle',
                                defaultValue: 0
                            },
                            MAG: {
                                type: 'number',
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'deleteHermiteControlPoint',
                        blockType: 'command',
                        text: translate('deleteHermiteControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            }
                        }
                    },
                    {
                        opcode: 'clearHermiteControlPoints',
                        blockType: 'command',
                        text: translate('clearHermiteControlPoints'),
                    },
                    {
                        opcode: 'getHermiteControlPoints',
                        blockType: 'reporter',
                        text: translate('hermiteControlPoints'),
                    },
                    {
                        opcode: 'getHermiteControlPoint',
                        blockType: 'reporter',
                        text: translate('hermiteControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteControlPointProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteControlPointVelocity',
                        blockType: 'reporter',
                        text: translate('hermiteControlPointVelocity'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            COMPONENT: {
                                type: 'string',
                                menu: 'vectorComponent',
                                defaultValue: 'magnitude'
                            }
                        }
                    },
                    {
                        opcode: 'hermiteControlPointCount',
                        blockType: 'reporter',
                        text: translate('hermiteControlPointCount'),
                    },
                    '---',
                    { blockType: Scratch.BlockType.LABEL, text: '=== ' + translate('hermiteSpline') + ' ===' },
                    {
                        opcode: 'getHermiteSplinePoint',
                        blockType: 'reporter',
                        text: translate('hermiteSplinePoint'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            T: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteSplineProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteSplineSegment',
                        blockType: 'reporter',
                        text: translate('hermiteSplineSegment'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            SEGMENT: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            LOCALT: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteSplineProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteSplinePath',
                        blockType: 'reporter',
                        text: translate('hermiteSplinePath'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            POINTS: {
                                type: 'number',
                                defaultValue: 20,
                                min: 2,
                                max: 200
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteSplinePathPoint',
                        blockType: 'reporter',
                        text: translate('hermiteSplinePathPoint'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            INDEX: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteSplineProperty',
                                defaultValue: 'x'
                            },
                            POINTS: {
                                type: 'number',
                                defaultValue: 20,
                                min: 2,
                                max: 200
                            }
                        }
                    },
                    {
                        opcode: 'pointAtHermiteSplineDistance',
                        blockType: 'reporter',
                        text: translate('pointAtHermiteSplineDistance'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            DISTANCE: {
                                type: 'number',
                                defaultValue: 50
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'hermiteSplineProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteSplineVector',
                        blockType: 'reporter',
                        text: translate('hermiteSplineVector'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            T: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            VECTOR: {
                                type: 'string',
                                menu: 'vectorType',
                                defaultValue: 'tangent'
                            },
                            COMPONENT: {
                                type: 'string',
                                menu: 'vectorComponent',
                                defaultValue: 'magnitude'
                            }
                        }
                    },
                    {
                        opcode: 'getHermiteSplineArcLength',
                        blockType: 'reporter',
                        text: translate('hermiteSplineArcLength'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            }
                        }
                    },
                    '---',
                    { blockType: Scratch.BlockType.LABEL, text: '=== ' + translate('cardinalSetup') + ' ===' },
                    {
                        opcode: 'addCardinalControlPoint',
                        blockType: 'command',
                        text: translate('addCardinalControlPoint'),
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
                        opcode: 'insertCardinalControlPoint',
                        blockType: 'command',
                        text: translate('insertCardinalControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
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
                        opcode: 'setCardinalControlPoint',
                        blockType: 'command',
                        text: translate('setCardinalControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
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
                        opcode: 'deleteCardinalControlPoint',
                        blockType: 'command',
                        text: translate('deleteCardinalControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            }
                        }
                    },
                    {
                        opcode: 'clearCardinalControlPoints',
                        blockType: 'command',
                        text: translate('clearCardinalControlPoints'),
                    },
                    {
                        opcode: 'getCardinalControlPoints',
                        blockType: 'reporter',
                        text: translate('cardinalControlPoints'),
                    },
                    {
                        opcode: 'getCardinalControlPoint',
                        blockType: 'reporter',
                        text: translate('cardinalControlPoint'),
                        arguments: {
                            N: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'controlPointProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'cardinalControlPointCount',
                        blockType: 'reporter',
                        text: translate('cardinalControlPointCount'),
                    },
                    '---',
                    { blockType: Scratch.BlockType.LABEL, text: '=== ' + translate('cardinalSpline') + ' ===' },
                    {
                        opcode: 'getCardinalPoint',
                        blockType: 'reporter',
                        text: translate('cardinalPoint'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            T: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'cardinalProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getCardinalSegment',
                        blockType: 'reporter',
                        text: translate('cardinalSegment'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            SEGMENT: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            LOCALT: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'cardinalProperty',
                                defaultValue: 'x'
                            }
                        }
                    },
                    {
                        opcode: 'getCardinalPath',
                        blockType: 'reporter',
                        text: translate('cardinalPath'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            POINTS: {
                                type: 'number',
                                defaultValue: 20,
                                min: 2,
                                max: 200
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            }
                        }
                    },
                    {
                        opcode: 'getCardinalPathPoint',
                        blockType: 'reporter',
                        text: translate('cardinalPathPoint'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            INDEX: {
                                type: 'number',
                                defaultValue: 1,
                                min: 1
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'cardinalProperty',
                                defaultValue: 'x'
                            },
                            POINTS: {
                                type: 'number',
                                defaultValue: 20,
                                min: 2,
                                max: 200
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            }
                        }
                    },
                    {
                        opcode: 'pointAtCardinalDistance',
                        blockType: 'reporter',
                        text: translate('pointAtCardinalDistance'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            DISTANCE: {
                                type: 'number',
                                defaultValue: 50
                            },
                            PROPERTY: {
                                type: 'string',
                                menu: 'cardinalProperty',
                                defaultValue: 'x'
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            }
                        }
                    },
                    {
                        opcode: 'getCardinalVector',
                        blockType: 'reporter',
                        text: translate('cardinalVector'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            T: {
                                type: 'number',
                                defaultValue: 50,
                                min: 0,
                                max: 100
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            },
                            VECTOR: {
                                type: 'string',
                                menu: 'vectorType',
                                defaultValue: 'tangent'
                            },
                            COMPONENT: {
                                type: 'string',
                                menu: 'vectorComponent',
                                defaultValue: 'magnitude'
                            }
                        }
                    },
                    {
                        opcode: 'getCardinalArcLength',
                        blockType: 'reporter',
                        text: translate('cardinalArcLength'),
                        arguments: {
                            TYPE: {
                                type: 'string',
                                menu: 'splineType',
                                defaultValue: 'open'
                            },
                            TENSION: {
                                type: 'number',
                                defaultValue: 0.5,
                                min: 0,
                                max: 1
                            }
                        }
                    }
                ],
                menus: {
                    hermiteProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('xCoordinate'), value: 'x'},
                            {text: translate('yCoordinate'), value: 'y'},
                            {text: translate('tangentAngle'), value: 'angle'},
                            {text: translate('velocity'), value: 'velocity'},
                            {text: translate('acceleration'), value: 'acceleration'},
                            {text: translate('jerk'), value: 'jerk'},
                            {text: translate('curvature'), value: 'curvature'},
                            {text: translate('radius'), value: 'radius'},
                            {text: translate('normalAngle'), value: 'normalAngle'},
                            {text: translate('distanceFromStart'), value: 'distanceFromStart'},
                            {text: translate('distanceToEnd'), value: 'distanceToEnd'}
                        ]
                    },
                    hermiteSplineProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('xCoordinate'), value: 'x'},
                            {text: translate('yCoordinate'), value: 'y'},
                            {text: translate('tangentAngle'), value: 'angle'},
                            {text: translate('velocity'), value: 'velocity'},
                            {text: translate('acceleration'), value: 'acceleration'},
                            {text: translate('jerk'), value: 'jerk'},
                            {text: translate('curvature'), value: 'curvature'},
                            {text: translate('radius'), value: 'radius'},
                            {text: translate('normalAngle'), value: 'normalAngle'},
                            {text: translate('distanceFromStart'), value: 'distanceFromStart'},
                            {text: translate('distanceToEnd'), value: 'distanceToEnd'}
                        ]
                    },
                    hermiteControlPointProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('controlPointX'), value: 'x'},
                            {text: translate('controlPointY'), value: 'y'},
                            {text: translate('controlPointVX'), value: 'vx'},
                            {text: translate('controlPointVY'), value: 'vy'},
                            {text: translate('controlPointVelocityAngle'), value: 'angle'},
                            {text: translate('controlPointVelocityMagnitude'), value: 'magnitude'}
                        ]
                    },
                    cardinalProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('xCoordinate'), value: 'x'},
                            {text: translate('yCoordinate'), value: 'y'},
                            {text: translate('tangentAngle'), value: 'angle'},
                            {text: translate('velocity'), value: 'velocity'},
                            {text: translate('curvature'), value: 'curvature'},
                            {text: translate('radius'), value: 'radius'},
                            {text: translate('normalAngle'), value: 'normalAngle'},
                            {text: translate('distanceFromStart'), value: 'distanceFromStart'},
                            {text: translate('distanceToEnd'), value: 'distanceToEnd'}
                        ]
                    },
                    splineType: {
                        acceptReporters: true,
                        items: [
                            {text: translate('open'), value: 'open'},
                            {text: translate('closed'), value: 'closed'}
                        ]
                    },
                    velocitySelector: {
                        acceptReporters: true,
                        items: [
                            {text: translate('startVelocity'), value: 'start'},
                            {text: translate('endVelocity'), value: 'end'}
                        ]
                    },
                    vectorType: {
                        acceptReporters: true,
                        items: [
                            {text: translate('tangentVector'), value: 'tangent'},
                            {text: translate('normalVector'), value: 'normal'},
                            {text: translate('unitTangent'), value: 'unitTangent'},
                            {text: translate('unitNormal'), value: 'unitNormal'}
                        ]
                    },
                    vectorComponent: {
                        acceptReporters: true,
                        items: [
                            {text: translate('vectorMagnitude'), value: 'magnitude'},
                            {text: translate('vectorAngle'), value: 'angle'},
                            {text: translate('vectorX'), value: 'x'},
                            {text: translate('vectorY'), value: 'y'}
                        ]
                    },
                    controlPointProperty: {
                        acceptReporters: true,
                        items: [
                            {text: translate('controlPointX'), value: 'x'},
                            {text: translate('controlPointY'), value: 'y'}
                        ]
                    }
                }
            };
        }
    }

    sc.extensions.register(new HermiteExtension());
})(Scratch);
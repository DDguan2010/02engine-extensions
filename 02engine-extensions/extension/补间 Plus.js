//本扩展的所有算法均由DeepSeek完成
//不然作者一个xxs根本写不出这么复杂的算法

//AGPL协议

/**
 * Scratch 扩展：kmsTween
 * 版权所有 © 2025 诸葛孔明
 *
 * 本程序是自由软件：你可以根据自由软件基金会发布的 GNU Affero 通用公共许可证第三版，
 * 或（由你选择）任何更新版本的规定，重新发布和/或修改本程序。
 *
 * 本程序发布的目的是希望它有用，但不作任何担保；甚至没有适销性或特定用途适用性的暗示担保。
 * 更多详情请参见 GNU Affero 通用公共许可证。
 *
 * 你应当已经随本程序收到了一份 GNU Affero 通用公共许可证副本。
 * 如果没有，请访问 <https://www.gnu.org/licenses/>.
 */

(function(sc){
    let vm = sc.vm
    let runtime = vm.runtime
    let setup = {
        'zh-cn': {
            'Tween+':'补间+',
            'Calculate the curve x1[x1] y1[y1] x2[x2] y2[y2] animation progress when the time is [time]% with the accuracy of [accuracy]':'计算曲线x1[x1] y1[y1] x2[x2] y2[y2] 时间为[time]%时动画的进度 精度[accuracy]',
            'Calculate the time when animation progress reaches [progress]% for curve x1[x1] y1[y1] x2[x2] y2[y2] with the accuracy of [accuracy]':'计算曲线x1[x1] y1[y1] x2[x2] y2[y2] 进度达到[progress]%时的时间 精度[accuracy]'
        },
        'en': {
            'Tween+':'Tween+',
            'Calculate the curve x1[x1] y1[y1] x2[x2] y2[y2] animation progress when the time is [time]% with the accuracy of [accuracy]':'Calculate the curve x1[x1] y1[y1] x2[x2] y2[y2] animation progress when the time is [time]% with the accuracy of [accuracy]',
            'Calculate the time when animation progress reaches [progress]% for curve x1[x1] y1[y1] x2[x2] y2[y2] with the accuracy of [accuracy]':'Calculate the time when animation progress reaches [progress]% for curve x1[x1] y1[y1] x2[x2] y2[y2] with the accuracy of [accuracy]'
        }
    }
    function translate() {
        return setup[sc.translate.language]
            ? (setup[sc.translate.language][arguments[0]] || setup.en[arguments[0]])
            : (sc.translate.language == 'zh-tw'? setup['zh-cn'][arguments[0]] : setup.en[arguments[0]])
    }
    class temp {
        constructor() {
            sc.translate.setup(setup)
        }
        getInfo() {
            return {
                id: 'kmsTween',
                name: translate('Tween+'),
                color1:'#0a2639',
                color2:'#196090',
                color3:'#3498db',
                blocks: [
                    {
                        opcode:'progress',
                        blockType: 'reporter',
                        text: translate('Calculate the curve x1[x1] y1[y1] x2[x2] y2[y2] animation progress when the time is [time]% with the accuracy of [accuracy]'),
                        arguments:{
                            x1:{
                                type:'number',
                                defaultValue:0
                            },
                            y1:{
                                type:'number',
                                defaultValue:0
                            },
                            x2:{
                                type:'number',
                                defaultValue:1
                            },
                            y2:{
                                type:'number',
                                defaultValue:1
                            },
                            time:{
                                type:'number',
                                defaultValue:50
                            },
                            accuracy:{
                                type:'number',
                                defaultValue:0.01
                            }
                        }
                    },
                    {
                        opcode:'inverseProgress',
                        blockType: 'reporter',
                        text: translate('Calculate the time when animation progress reaches [progress]% for curve x1[x1] y1[y1] x2[x2] y2[y2] with the accuracy of [accuracy]'),
                        arguments:{
                            x1:{
                                type:'number',
                                defaultValue:0
                            },
                            y1:{
                                type:'number',
                                defaultValue:0
                            },
                            x2:{
                                type:'number',
                                defaultValue:1
                            },
                            y2:{
                                type:'number',
                                defaultValue:1
                            },
                            progress:{
                                type:'number',
                                defaultValue:50
                            },
                            accuracy:{
                                type:'number',
                                defaultValue:0.01
                            }
                        }
                    }
                ],
                menus: {
                   
                }
            }
        }
        progress(args) {
            // 解构获取参数：两个控制点(x1,y1)和(x2,y2)，时间百分比(0-100)，精度阈值
            let {x1, y1, x2, y2, time, accuracy} = args
            
            /* 
            * 时间标准化处理：
            * 将0-100%的输入时间转换为0-1范围的小数
            * 例如50% → 0.5
            */
            time = time / 100    
            
            // 边界条件处理：当时间在起点或终点时直接返回对应值
            if(time >= 1) return 1  // 动画已结束
            if(time <= 0) return 0  // 动画未开始
            
            /* 
            * 二分查找初始化：
            * low/high定义搜索范围，mid初始猜测为标准化后的时间值
            * 这种初始化对线性变化情况最优
            */
            let low = 0
            let high = 1
            let mid = time
            
            /* 
            * 二分查找核心循环：
            * 最多迭代100次寻找满足精度要求的解
            * 实际通常10-20次迭代即可收敛
            */
            for(let i = 0; i < 100; i++) {
                /*
                * 三次贝塞尔曲线x坐标计算：
                * 公式分解为三部分：
                * 1. 3*x1*t*(1-t)^2 → 第一个控制点的影响
                * 2. 3*x2*t^2*(1-t) → 第二个控制点的影响 
                * 3. t^3 → 终点的影响
                * 使用Math.pow确保运算优先级正确
                */
                let x = 3 * x1 * mid * Math.pow(1 - mid, 2) + 
                        3 * x2 * Math.pow(mid, 2) * (1 - mid) + 
                        Math.pow(mid, 3)

                // 精度检查：当前x值与目标时间的差值小于精度阈值则终止
                if(Math.abs(x - time) < accuracy) break
                
                /* 
                * 搜索范围调整：
                * 当前x值小于目标时间 → 需要增大mid值
                * 当前x值大于目标时间 → 需要减小mid值
                */
                if(x < time) {
                    low = mid  // 提升搜索下限
                } else {
                    high = mid // 降低搜索上限
                }
                
                // 计算新的中点
                mid = (low + high) / 2
            }
            
            /* 
            * 最终进度计算：
            * 使用找到的mid值计算y坐标（动画进度）
            * 公式结构与x坐标相同，但使用y1,y2控制点坐标
            */
            return 3 * y1 * mid * Math.pow(1 - mid, 2) + 
                   3 * y2 * Math.pow(mid, 2) * (1 - mid) + 
                   Math.pow(mid, 3)
        }
        
        inverseProgress(args) {
            // 解构参数：两个控制点坐标，目标进度(0-100)，精度阈值
            let {x1, y1, x2, y2, progress, accuracy} = args
            
            /* 
            * 进度标准化处理：
            * 将0-100%的输入进度转换为0-1范围的小数
            */
            progress = progress / 100
            
            // 边界条件处理
            if(progress >= 1) return 100  // 进度100%对应时间100%
            if(progress <= 0) return 0    // 进度0%对应时间0%
            
            /* 
            * 二分查找初始化：
            * 在0-1范围内搜索对应的时间参数t
            */
            let low = 0
            let high = 1
            let mid = progress
            
            /* 
            * 二分查找核心循环：
            * 寻找使y(t)≈progress的t值
            */
            for(let i = 0; i < 100; i++) {
                // 计算当前mid对应的进度值y
                let y = 3 * y1 * mid * Math.pow(1 - mid, 2) + 
                         3 * y2 * Math.pow(mid, 2) * (1 - mid) + 
                         Math.pow(mid, 3)
                
                // 检查是否达到所需精度
                if(Math.abs(y - progress) < accuracy) break
                
                // 调整搜索范围
                if(y < progress) {
                    low = mid  // 当前进度不足，需要增大mid
                } else {
                    high = mid // 当前进度超限，需要减小mid
                }
                
                mid = (low + high) / 2
            }
            
            /* 
            * 最终时间计算：
            * 使用找到的mid值计算实际时间x坐标
            */
            let time = 3 * x1 * mid * Math.pow(1 - mid, 2) + 
                       3 * x2 * Math.pow(mid, 2) * (1 - mid) + 
                       Math.pow(mid, 3)
            
            return time
        }
    }
    
    sc.extensions.register(new temp())
})(Scratch)
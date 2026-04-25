// Scratch评分拓展核心代码
(function(Scratch) {
    'use strict';

    // 定义全局变量：评分上限（默认10）、用户评分结果
    let ratingMax = 10;
    let userRating = 0;

    // 创建评分弹窗的核心函数
    function createRatingPopup() {
        // 先移除已存在的弹窗（避免重复）
        const oldPopup = document.getElementById('scratch-rating-popup');
        if (oldPopup) oldPopup.remove();

        // 1. 创建弹窗容器
        const popup = document.createElement('div');
        popup.id = 'scratch-rating-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            z-index: 9999;
            text-align: center;
        `;

        // 2. 创建标题
        const title = document.createElement('h3');
        title.textContent = '请为本次体验评分';
        title.style.margin = '0 0 20px 0';
        popup.appendChild(title);

        // 3. 创建五角星容器
        const starsContainer = document.createElement('div');
        starsContainer.id = 'rating-stars';
        starsContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            margin-bottom: 20px;
        `;

        // 4. 生成对应数量的五角星
        for (let i = 1; i <= ratingMax; i++) {
            const star = document.createElement('span');
            star.className = 'rating-star';
            star.dataset.rating = i;
            star.style.cssText = `
                font-size: 30px;
                color: #ddd;
                transition: color 0.2s ease;
            `;
            star.textContent = '★';

            // 鼠标悬浮：点亮当前及之前的星星
            star.addEventListener('mouseover', () => {
                const allStars = document.querySelectorAll('.rating-star');
                allStars.forEach(s => {
                    s.style.color = Number(s.dataset.rating) <= i ? '#ffd700' : '#ddd';
                });
            });

            // 鼠标离开：恢复已选中的星星状态
            star.addEventListener('mouseout', () => {
                const allStars = document.querySelectorAll('.rating-star');
                allStars.forEach(s => {
                    s.style.color = Number(s.dataset.rating) <= userRating ? '#ffd700' : '#ddd';
                });
            });

            // 点击星星：确认评分
            star.addEventListener('click', () => {
                userRating = i;
                const allStars = document.querySelectorAll('.rating-star');
                allStars.forEach(s => {
                    s.style.color = Number(s.dataset.rating) <= i ? '#ffd700' : '#ddd';
                });
            });

            starsContainer.appendChild(star);
        }
        popup.appendChild(starsContainer);

        // 5. 创建确认按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认评分';
        confirmBtn.style.cssText = `
            padding: 8px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        confirmBtn.addEventListener('click', () => {
            popup.remove(); // 关闭弹窗
        });
        popup.appendChild(confirmBtn);

        // 6. 将弹窗添加到页面
        document.body.appendChild(popup);
    }

    // 定义Scratch拓展
    class RatingExtension {
        // 拓展元信息（必填）
        getInfo() {
            return {
                id: 'scratchRatingExtension', // 唯一ID
                name: '星级评分', // 拓展名称（显示在Scratch中）
                blocks: [
                    // 积木1：设置评分上限（1-5颗星）
                    {
                        opcode: 'setRatingMax',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '设置评分上限为 [MAX] 颗星',
                        arguments: {
                            MAX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5 // 默认值
                            }
                        }
                    },
                    // 积木2：弹出评分弹窗并返回评分
                    {
                        opcode: 'showRatingPopup',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '弹出评分弹窗并获取评分'
                    },
                    // 积木3：获取最后一次评分结果（辅助积木）
                    {
                        opcode: 'getLastRating',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取最后一次评分结果'
                    }
                ]
            };
        }

        // 积木1的实现：设置评分上限
        setRatingMax(args) {
            const max = Number(args.MAX);
            // 限制范围：1-5颗星
            if (max >= 1 && max <= 5) {
                ratingMax = max;
            } else {
                // 超出范围则提示并设为默认值
                alert('评分上限只能设置为1-5颗星！');
                ratingMax = 5;
            }
            userRating = 0; // 重置评分
        }

        // 积木2的实现：弹出弹窗并返回评分
        showRatingPopup() {
            userRating = 0; // 重置评分
            createRatingPopup(); // 创建弹窗
            // 返回最终评分（这里用异步确保用户操作后返回，简化版可直接返回，实际可优化）
            return new Promise(resolve => {
                const checkRating = setInterval(() => {
                    const popup = document.getElementById('scratch-rating-popup');
                    if (!popup) { // 弹窗关闭则返回评分
                        clearInterval(checkRating);
                        resolve(userRating);
                    }
                }, 100);
            });
        }

        // 积木3的实现：获取最后一次评分
        getLastRating() {
            return userRating;
        }
    }

    // 注册拓展到Scratch
    Scratch.extensions.register(new RatingExtension());
})(Scratch);
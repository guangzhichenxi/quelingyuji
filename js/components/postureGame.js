// Posture game functionality

/**
 * 初始化坐姿游戏
 */
export function initPostureGame() {
    // 游戏状态
    const gameState = {
        position: 0,
        score: 0,
        items: 0,
        progress: 0,
        goodPosture: false,
        gameActive: false,
        gamePaused: false,
        goodPostureTime: 0,
        medalsEarned: 0,
        cameraFacingMode: 'user'
    };
    
    // DOM 元素
    const cameraFeed = document.getElementById('camera-feed');
    const postureStatus = document.getElementById('postureStatus');
    const positionDisplay = document.getElementById('position');
    const itemsDisplay = document.getElementById('items');
    const scoreDisplay = document.getElementById('score');
    const goodTimeDisplay = document.getElementById('goodTime');
    const player = document.getElementById('player');
    const cameraBtn = document.getElementById('cameraBtn');
    const flipBtn = document.getElementById('flipBtn');
    const resetBtn = document.getElementById('resetBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const homeBtn = document.getElementById('homeBtn');
    const medalMessage = document.getElementById('medalMessage');
    const gridCells = document.querySelectorAll('.grid-cell');
    
    // 初始化摄像头
    async function initCamera(facingMode = 'user') {
        try {
            // 检查浏览器是否支持摄像头
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持摄像头功能，请使用 Chrome、Edge 或 Firefox 浏览器');
            }
            
            if (cameraFeed && cameraFeed.srcObject) {
                cameraFeed.srcObject.getTracks().forEach(track => track.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            if (cameraFeed) {
                cameraFeed.srcObject = stream;
                if (cameraBtn) {
                    cameraBtn.innerHTML = '<i class="fas fa-camera-slash"></i> 关闭摄像头';
                }
                if (postureStatus) {
                    postureStatus.textContent = "摄像头已开启，开始检测坐姿...";
                    postureStatus.className = "posture-status good-posture";
                }
                gameState.cameraFacingMode = facingMode;
                
                // 开始坐姿检测计时
                startPostureTimer();
            }
        } catch (err) {
            console.error("摄像头访问错误:", err);
            
            let errorMsg = "无法访问摄像头";
            
            // 根据错误类型给出具体提示
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMsg = "⚠️ 摄像头权限被拒绝 - 请点击地址栏🔒图标，允许摄像头权限，然后刷新页面";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMsg = "⚠️ 未找到摄像头设备 - 请确保您的设备有可用的摄像头";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMsg = "⚠️ 摄像头被其他程序占用 - 请关闭其他使用摄像头的程序";
            } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                errorMsg = "⚠️ 摄像头不支持请求的参数";
            } else if (err.name === 'TypeError') {
                errorMsg = "⚠️ 浏览器不支持摄像头 - 请使用 Chrome、Edge 或 Firefox 浏览器";
            } else {
                errorMsg = `⚠️ ${err.message}`;
            }
            
            if (postureStatus) {
                postureStatus.textContent = errorMsg;
                postureStatus.className = "posture-status bad-posture";
            }
        }
    }
    
    // 翻转摄像头
    if (flipBtn) {
        flipBtn.addEventListener('click', function() {
            const newMode = gameState.cameraFacingMode === 'user' ? 'environment' : 'user';
            initCamera(newMode);
        });
    }
    
    // 开始坐姿计时
    function startPostureTimer() {
        gameState.goodPostureTime = 0;
        const timer = setInterval(() => {
            if (!cameraFeed || !cameraFeed.srcObject || gameState.gamePaused) return;
            
            // 模拟姿势检测 - 70%概率良好姿势
            const isGoodPosture = Math.random() < 0.7;
            if (isGoodPosture) {
                if (postureStatus) {
                    postureStatus.textContent = "✓ 坐姿正确！继续保持";
                    postureStatus.className = "posture-status good-posture";
                }
                gameState.goodPostureTime++;
                if (goodTimeDisplay) {
                    goodTimeDisplay.textContent = `${gameState.goodPostureTime}s`;
                }
                
                // 每5秒奖励一枚奖牌
                if (gameState.goodPostureTime > 0 && gameState.goodPostureTime % 5 === 0) {
                    awardMedal();
                }
            } else {
                if (postureStatus) {
                    postureStatus.textContent = "✗ 坐姿不正确！请调整坐姿";
                    postureStatus.className = "posture-status bad-posture";
                }
            }
        }, 1000);
    }
    
    // 奖励奖牌
    function awardMedal() {
        if (gameState.medalsEarned < 5) {
            gameState.medalsEarned++;
            const medal = document.getElementById(`medal${gameState.medalsEarned}`);
            if (medal) {
                medal.classList.add('active');
            }
            
            // 显示奖牌消息
            if (medalMessage) {
                medalMessage.classList.add('show');
                setTimeout(() => {
                    medalMessage.classList.remove('show');
                }, 3000);
            }
            
            // 添加积分
            gameState.score += 20;
            if (scoreDisplay) {
                scoreDisplay.textContent = gameState.score;
            }
        }
    }
    
    // 模拟姿势检测和游戏进度
    function simulateGame() {
        if (!gameState.gameActive || gameState.gamePaused) return;
        
        // 随机模拟良好姿势（70%概率）
        const isGoodPosture = Math.random() < 0.7;
        if (isGoodPosture) {
            if (!gameState.goodPosture) {
                gameState.goodPosture = true;
            }
            
            // 更新进度
            gameState.progress += 2;
            if (gameState.progress > 100) gameState.progress = 100;
            
            // 当进度达到100%时
            if (gameState.progress >= 100) {
                movePlayer();
                gameState.progress = 0;
            }
        } else {
            gameState.goodPosture = false;
            gameState.progress = 0;
        }
        
        setTimeout(simulateGame, 500);
    }
    
    // 移动玩家角色
    function movePlayer() {
        gameState.position++;
        gameState.score += 10;
        
        // 更新网格高亮
        gridCells.forEach((cell, index) => {
            if (index < gameState.position) {
                cell.style.background = 'rgba(255, 255, 255, 0.8)';
                cell.style.color = '#2a9d8f';
                cell.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            }
        });
        
        // 30%几率收集物品
        if (Math.random() < 0.3) {
            gameState.items++;
            gameState.score += 5;
            if (itemsDisplay) {
                itemsDisplay.textContent = gameState.items;
            }
        }
        
        if (positionDisplay) {
            positionDisplay.textContent = gameState.position;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = gameState.score;
        }
        
        // 更新角色位置
        const mapContent = document.querySelector('.map-content');
        if (mapContent) {
            const mapWidth = mapContent.offsetWidth;
            const maxPosition = 20;
            const positionPercentage = Math.min(gameState.position / maxPosition, 1);
            const newPosition = 40 + (mapWidth - 160) * positionPercentage;
            if (player) {
                player.style.left = `${newPosition}px`;
            }
            
            // 检查是否到达终点
            if (gameState.position >= maxPosition) {
                endGame();
            }
        }
    }
    
    // 结束游戏
    function endGame() {
        gameState.gameActive = false;
        if (postureStatus) {
            postureStatus.textContent = "🎉 恭喜你完成游戏！";
            postureStatus.className = "posture-status good-posture";
        }
        
        // 显示最终得分消息
        if (medalMessage) {
            medalMessage.innerHTML = `<i class="fas fa-trophy"></i> 游戏完成！得分: ${gameState.score}`;
            medalMessage.style.color = '#ffd166';
            medalMessage.classList.add('show');
            setTimeout(() => {
                medalMessage.classList.remove('show');
            }, 5000);
        }
    }
    
    // 重置游戏
    function resetGame() {
        gameState.position = 0;
        gameState.score = 0;
        gameState.items = 0;
        gameState.progress = 0;
        gameState.gameActive = false;
        gameState.gamePaused = false;
        gameState.goodPostureTime = 0;
        if (positionDisplay) positionDisplay.textContent = "0";
        if (itemsDisplay) itemsDisplay.textContent = "0";
        if (scoreDisplay) scoreDisplay.textContent = "0";
        if (goodTimeDisplay) goodTimeDisplay.textContent = "0s";
        if (player) player.style.left = "40px";
        if (postureStatus) {
            postureStatus.textContent = "游戏已重置";
            postureStatus.className = "posture-status";
        }
        
        // 重置网格样式
        gridCells.forEach(cell => {
            cell.style.background = 'rgba(233, 196, 106, 0.6)';
            cell.style.color = '#6d4c1d';
            cell.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.3)';
        });
        
        // 重置奖牌
        gameState.medalsEarned = 0;
        for (let i = 1; i <= 5; i++) {
            const medal = document.getElementById(`medal${i}`);
            if (medal) {
                medal.classList.remove('active');
            }
        }
    }
    
    // 摄像头控制
    if (cameraBtn) {
        cameraBtn.addEventListener('click', function() {
            if (cameraFeed && cameraFeed.srcObject) {
                cameraFeed.srcObject.getTracks().forEach(track => track.stop());
                cameraFeed.srcObject = null;
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> 开启摄像头';
                if (postureStatus) {
                    postureStatus.textContent = "摄像头已关闭";
                    postureStatus.className = "posture-status";
                }
                gameState.gameActive = false;
            } else {
                initCamera();
            }
        });
    }
    
    // 重置游戏
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
    
    // 暂停游戏
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (!gameState.gameActive) return;
            gameState.gamePaused = !gameState.gamePaused;
            if (gameState.gamePaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续游戏';
                if (postureStatus) {
                    postureStatus.textContent = "游戏已暂停";
                }
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停游戏';
                if (postureStatus) {
                    postureStatus.textContent = "游戏继续！检测坐姿中...";
                }
            }
        });
    }
    
    // 返回首页
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            // This would need to be imported or handled differently in a modular setup
            // showPage('cover');
            resetGame();
        });
    }
    
    // 初始化游戏状态
    resetGame();
}

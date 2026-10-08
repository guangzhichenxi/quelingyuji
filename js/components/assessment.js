// Assessment functionality

/**
 * 初始化评估功能
 */
export function initAssessment() {
    // VAS量表交互
    const vasSliderAssessment = document.getElementById('vasSliderAssessment');
    const vasValueAssessment = document.getElementById('vasValueAssessment');
    const vasEmojiAssessment = document.getElementById('vasEmojiAssessment');
    const painDescription = document.getElementById('painDescription');
    
    if (vasSliderAssessment) {
        vasSliderAssessment.addEventListener('input', function() {
            const value = parseFloat(this.value);
            vasValueAssessment.textContent = value;
            
            // 更新表情
            if (value <= 2) {
                vasEmojiAssessment.textContent = '😊';
                painDescription.textContent = "无痛";
                painDescription.style.color = "#4caf50";
            } else if (value <= 4) {
                vasEmojiAssessment.textContent = '🙂';
                painDescription.textContent = "轻度疼痛";
                painDescription.style.color = "#8bc34a";
            } else if (value <= 6) {
                vasEmojiAssessment.textContent = '😐';
                painDescription.textContent = "中度疼痛";
                painDescription.style.color = "#ff9800";
            } else if (value <= 8) {
                vasEmojiAssessment.textContent = '😣';
                painDescription.textContent = "重度疼痛";
                painDescription.style.color = "#ff5722";
            } else {
                vasEmojiAssessment.textContent = '😫';
                painDescription.textContent = "剧烈疼痛";
                painDescription.style.color = "#f44336";
            }
            
            // 更新表情位置
            const sliderWidth = this.offsetWidth;
            const thumbPosition = (value / 10) * sliderWidth;
            vasEmojiAssessment.style.left = thumbPosition + 'px';
        });
    }
    
    // 特殊检查选择
    document.querySelectorAll('.test-card').forEach(card => {
        // 添加移动端支持
        const handleClick = function(e) {
            // 阻止事件冒泡
            e.stopPropagation();
            e.preventDefault(); // 阻止移动端默认行为
            
            // 获取测试项类型和标题
            const testType = this.getAttribute('data-test');
            const testTitle = this.querySelector('h4').textContent;
            
            // 显示视频指导
            showVideoModal(testType, testTitle);
            
            const resultElement = this.querySelector('.test-result');
            
            // 切换测试结果
            if (resultElement.textContent === '未测试') {
                resultElement.textContent = '阴性';
                resultElement.style.color = '#4caf50';
            } else if (resultElement.textContent === '阴性') {
                resultElement.textContent = '阳性';
                resultElement.style.color = '#f44336';
            } else {
                resultElement.textContent = '未测试';
                resultElement.style.color = '';
            }
        };
        
        // 同时绑定 click 和 touchstart 事件
        card.addEventListener('click', handleClick);
        card.addEventListener('touchstart', handleClick, { passive: false });
    });
    
    // NDI量表选项选择
    document.querySelectorAll('.scale-option').forEach(option => {
        option.addEventListener('click', function() {
            // 获取当前选项所在的题目组
            const scaleItem = this.closest('.scale-item');
            if (scaleItem) {
                // 移除同一题目中其他选项的选中状态
                scaleItem.querySelectorAll('.scale-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                // 添加当前选项的选中状态
                this.classList.add('selected');
            }
        });
    });
    
    // 颈椎活动度检测
    initRomDetection();
    
    // 初始化P2P连接和治疗方案功能
    initP2PTreatmentPlan();
    
    // 绑定提交按钮事件
    bindSubmitButton();
}

/**
 * 初始化颈椎活动度检测功能
 */
function initRomDetection() {
    const romVideo = document.getElementById('rom-video');
    const romStatus = document.getElementById('romStatus');
    const romStartBtn = document.getElementById('romStartBtn');
    const romStopBtn = document.getElementById('romStopBtn');
    const romSlider = document.getElementById('romSlider');
    const romValue = document.getElementById('romValue');
    const romFeedback = document.getElementById('romFeedback');
    const romEmoji = romFeedback.querySelector('.rom-emoji');
    
    let romInterval;
    let romAngle = 0;
    
    // 开始检测
    if (romStartBtn) {
        romStartBtn.addEventListener('click', async function() {
            try {
                // 检查浏览器是否支持摄像头
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('您的浏览器不支持摄像头功能，请使用 Chrome、Edge 或 Firefox 浏览器');
                }
                
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" }
                });
                romVideo.srcObject = stream;
                romStatus.textContent = "检测中...请缓慢活动颈部";
                romStartBtn.disabled = true;
                romStopBtn.disabled = false;
                
                // 模拟活动度检测
                romAngle = 0;
                if (romSlider) romSlider.value = 0;
                if (romValue) romValue.textContent = "活动度: 0°";
                if (romEmoji) romEmoji.textContent = "😊";
                if (romFeedback) romFeedback.querySelector('div').textContent = "请开始活动您的颈部";
                
                romInterval = setInterval(() => {
                    // 模拟角度增加
                    romAngle += Math.random() * 5;
                    if (romAngle > 100) romAngle = 100;
                    if (romSlider) romSlider.value = romAngle;
                    if (romValue) romValue.textContent = `活动度: ${Math.round(romAngle)}°`;
                    
                    // 更新反馈
                    if (romFeedback) {
                        if (romAngle < 20) {
                            if (romEmoji) romEmoji.textContent = "😊";
                            romFeedback.querySelector('div').textContent = "继续，您可以做得更好！";
                        } else if (romAngle < 50) {
                            if (romEmoji) romEmoji.textContent = "🙂";
                            romFeedback.querySelector('div').textContent = "很好，继续保持！";
                        } else if (romAngle < 80) {
                            if (romEmoji) romEmoji.textContent = "😃";
                            romFeedback.querySelector('div').textContent = "非常棒！接近正常范围了";
                        } else {
                            if (romEmoji) romEmoji.textContent = "🎉";
                            romFeedback.querySelector('div').textContent = "完美！您的活动度非常好";
                        }
                    }
                }, 300);
            } catch (err) {
                console.error("摄像头访问错误:", err);
                
                let errorMsg = "无法访问摄像头";
                
                // 根据错误类型给出具体提示
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMsg = "⚠️ 摄像头权限被拒绝\n\n请点击地址栏左侧的🔒图标，允许摄像头权限，然后刷新页面";
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMsg = "⚠️ 未找到摄像头设备\n\n请确保您的设备有可用的摄像头";
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    errorMsg = "⚠️ 摄像头被其他程序占用\n\n请关闭其他使用摄像头的程序";
                } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                    errorMsg = "⚠️ 摄像头不支持请求的参数";
                } else if (err.name === 'TypeError') {
                    errorMsg = "⚠️ 浏览器不支持摄像头\n\n请使用 Chrome、Edge 或 Firefox 浏览器";
                } else {
                    errorMsg = `⚠️ ${err.message}`;
                }
                
                if (romStatus) {
                    romStatus.innerHTML = errorMsg.replace(/\n/g, '<br>');
                    romStatus.style.color = '#f44336';
                    romStatus.style.fontSize = '14px';
                    romStatus.style.lineHeight = '1.6';
                }
            }
        });
    }
    
    // 停止检测
    if (romStopBtn) {
        romStopBtn.addEventListener('click', function() {
            if (romVideo && romVideo.srcObject) {
                romVideo.srcObject.getTracks().forEach(track => track.stop());
                romVideo.srcObject = null;
            }
            if (romInterval) clearInterval(romInterval);
            if (romStatus) romStatus.textContent = "检测已停止";
            if (romStartBtn) romStartBtn.disabled = false;
            if (romStopBtn) romStopBtn.disabled = true;
            
            // 显示最终结果
            if (romFeedback) {
                let feedback = "";
                if (romAngle < 30) {
                    feedback = "活动度严重受限，建议咨询专业医师";
                } else if (romAngle < 60) {
                    feedback = "活动度中度受限，需要加强康复训练";
                } else if (romAngle < 80) {
                    feedback = "活动度轻度受限，接近正常范围";
                } else {
                    feedback = "活动度正常，继续保持良好习惯";
                }
                romFeedback.querySelector('div').textContent = feedback;
            }
        });
    }
}

/**
 * 显示视频模态框
 * @param {string} testType - 测试项类型
 * @param {string} testTitle - 测试项标题
 */
function showVideoModal(testType, testTitle) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    const modalTitle = document.querySelector('.video-modal-title');
    
    if (!modal || !iframe) {
        console.error('模态框或 iframe 元素未找到！');
        return;
    }
    
    // 不同测试项对应不同的视频（目前都使用同一个视频，后期可替换）
    const videoLibrary = {
        // 肆力检查
        'flexion': {
            url: 'BV1ciqhBSEiq',
            aid: '115728262892285',
            cid: '34772158165',
            title: '前屈肌力检查'
        },
        'extension': {
            url: 'BV1y3qaBRE1v',
            aid: '115728145449509',
            cid: '34771896375',
            title: '后伸肌力检查'
        },
        'left_flexion': {
            url: 'BV1WK4y1d7kZ',
            aid: '930455861',
            cid: '335748048',
            title: '左侧屈肆力测试指导'
        },
        'right_flexion': {
            url: 'BV1WK4y1d7kZ',
            aid: '930455861',
            cid: '335748048',
            title: '右侧屈肆力测试指导'
        },
        // 特殊检查
        'spurling': {
            url: 'BV1WK4y1d7kZ',
            aid: '930455861',
            cid: '335748048',
            title: 'Spurling试验演示'
        },
        'arm_pull': {
            url: 'BV1ekm1BMEF1',
            aid: '115722927801595',
            cid: '34752891643',
            title: '臂丛牵拉试验演示'
        },
        'foramen_compression': {
            url: 'BV1CVqaBWEaT',
            aid: '115728128672998',
            cid: '34771895058',
            title: '椎间孔挤压试验演示'
        },
        'hoffman': {
            url: 'BV1WK4y1d7kZ',
            aid: '930455861',
            cid: '335748048',
            title: '霍夫曼征检查演示'
        }
    };
    
    // 获取对应视频信息
    const videoInfo = videoLibrary[testType] || videoLibrary['flexion'];
    
    // 更新模态框标题
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-play-circle"></i> ${videoInfo.title}`;
    }
    
    // 设置视频源（Bilibili 视频）
    const videoUrl = `//player.bilibili.com/player.html?isOutside=true&aid=${videoInfo.aid}&bvid=${videoInfo.url}&cid=${videoInfo.cid}&p=1&autoplay=1&high_quality=1&danmaku=0`;
    iframe.src = videoUrl;
    
    // 显示模态框
    modal.classList.add('active');
    
    // 关闭按钮事件
    const closeBtn = document.getElementById('closeVideoModal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            closeVideoModal();
        };
    }
    
    // 点击背景关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    };
    
    // ESC 键关闭
    const escapeHandler = function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideoModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * 关闭视频模态框
 */
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    
    // 隐藏模态框
    modal.classList.remove('active');
    
    // 停止视频播放
    iframe.src = '';
}

/**
 * 初始化P2P治疗方案功能
 */
function initP2PTreatmentPlan() {
    // 创建治疗方案模态框
    createTreatmentModal();
    
    // 获取提交按钮
    const submitBtn = document.getElementById('submitAssessmentBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleAssessmentSubmit);
    }
}

/**
 * 创建治疗方案模态框
 */
function createTreatmentModal() {
    // 检查模态框是否已存在
    if (document.getElementById('treatmentModal')) {
        return;
    }
    
    // 创建模态框HTML
    const modalHTML = `
        <div id="treatmentModal" class="treatment-modal">
            <div class="treatment-modal-content">
                <div class="treatment-modal-header">
                    <h2 class="treatment-modal-title">AI个性化治疗方案</h2>
                    <button class="treatment-modal-close" id="closeTreatmentModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="treatment-modal-body">
                    <div id="treatmentContent">
                        <div class="loading-indicator">
                            <div class="spinner"></div>
                            <p>正在生成个性化治疗方案，请稍候...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 绑定关闭事件
    document.getElementById('closeTreatmentModal').addEventListener('click', closeTreatmentModal);
    
    // 点击背景关闭
    document.getElementById('treatmentModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTreatmentModal();
        }
    });
}

/**
 * 处理评估提交
 */
function handleAssessmentSubmit() {
    // 收集评估数据
    const assessmentData = collectAssessmentData();
    
    // 显示治疗方案模态框
    showTreatmentModal();
    
    // 通过P2P发送数据到AI服务端
    sendAssessmentDataToAI(assessmentData);
}

/**
 * 绑定提交按钮事件
 */
function bindSubmitButton() {
    const submitBtn = document.getElementById('submitAssessmentBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认提交行为
            
            // 收集评估数据
            const assessmentData = collectAssessmentData();
            
            // 跳转到治疗方案页面，传递评估数据
            const dataParam = encodeURIComponent(JSON.stringify(assessmentData));
            window.location.href = `treatment-chat.html?data=${dataParam}`;
        });
    }
}

/**
 * 收集评估数据
 */
function collectAssessmentData() {
    // 收集VAS数据
    const vasValue = document.getElementById('vasValueAssessment')?.textContent || '未测试';
    
    // 收集特殊检查数据
    const specialTests = [];
    document.querySelectorAll('.test-card').forEach(card => {
        const testName = card.querySelector('h4').textContent;
        const result = card.querySelector('.test-result').textContent;
        specialTests.push({ name: testName, result: result });
    });
    
    // 收集颈椎活动度数据
    const romValue = document.getElementById('romValue')?.textContent || '未测试';
    
    // 收集NDI量表数据
    const ndiScores = [];
    const scaleItems = document.querySelectorAll('.scale-item');
    scaleItems.forEach((item, index) => {
        const question = item.querySelector('.scale-question')?.textContent || `题目${index + 1}`;
        const selectedOption = item.querySelector('.scale-option.selected');
        const answer = selectedOption ? selectedOption.textContent : '未选择';
        const score = selectedOption ? Array.from(item.querySelectorAll('.scale-option')).indexOf(selectedOption) : -1;
        ndiScores.push({ question, answer, score });
    });
    
    return {
        vas: vasValue,
        specialTests: specialTests,
        rom: romValue,
        ndi: ndiScores,
        timestamp: new Date().toISOString()
    };
}

/**
 * 显示治疗方案模态框
 */
function showTreatmentModal() {
    const modal = document.getElementById('treatmentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * 关闭治疗方案模态框
 */
function closeTreatmentModal() {
    const modal = document.getElementById('treatmentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 通过P2P发送评估数据到AI服务端
 */
function sendAssessmentDataToAI(data) {
    // 这里应该通过P2P连接发送数据
    // 为了简化，我们使用WebSocket连接到信令服务器
    try {
        // 动态加载Socket.IO客户端库
        if (typeof io === 'undefined') {
            // 创建script标签引入Socket.IO
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = function() {
                // 加载完成后建立连接
                establishConnection(data);
            };
            script.onerror = function() {
                console.error('Socket.IO客户端库加载失败');
                displayTreatmentPlan({ 
                    error: '连接错误', 
                    message: '无法加载通信组件，请检查网络设置' 
                });
            };
            document.head.appendChild(script);
        } else {
            // 如果已经加载了Socket.IO，直接建立连接
            establishConnection(data);
        }
    } catch (error) {
        console.error('P2P连接错误:', error);
        displayTreatmentPlan({ 
            error: '连接错误', 
            message: '无法建立连接，请检查网络设置' 
        });
    }
}

/**
 * 建立Socket.IO连接
 */
function establishConnection(data) {
    try {
        // 创建WebSocket连接到信令服务器
        // 部署到云服务器后，将 localhost 改为服务器IP或域名
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : `http://${window.location.hostname}:3001`;
        
        const socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000
        });
        
        console.log('正在连接到服务器:', serverUrl);
        
        // 连接成功后发送数据
        socket.on('connect', () => {
            console.log('已连接到信令服务器');
            
            // 加入房间
            socket.emit('join-room', 'ai-service-room', 'frontend');
            
            // 发送评估数据
            socket.emit('assessment-data', data, 'ai-service-room');
        });
        
        // 接收治疗方案
        socket.on('treatment-plan', (plan) => {
            displayTreatmentPlan(plan);
            // 关闭连接
            socket.close();
        });
        
        // 连接错误处理
        socket.on('connect_error', (error) => {
            console.error('连接信令服务器失败:', error);
            displayTreatmentPlan({ 
                error: '连接失败', 
                message: '无法连接到AI服务，请稍后重试' 
            });
        });
        
        // 连接超时处理
        setTimeout(() => {
            if (!socket.connected) {
                console.error('连接信令服务器超时');
                displayTreatmentPlan({ 
                    error: '连接超时', 
                    message: '连接AI服务超时，请稍后重试' 
                });
                socket.close();
            }
        }, 10000);
    } catch (error) {
        console.error('建立连接时发生错误:', error);
        displayTreatmentPlan({ 
            error: '连接错误', 
            message: '无法建立连接，请检查网络设置' 
        });
    }
}

/**
 * 显示治疗方案
 */
function displayTreatmentPlan(plan) {
    const contentDiv = document.getElementById('treatmentContent');
    
    if (!contentDiv) return;
    
    if (plan.error) {
        // 显示错误信息
        let errorMessage = plan.message;
        
        // 如果是服务端内部错误，提供更友好的提示
        if (errorMessage.includes('unexpected internal error')) {
            errorMessage = 'AI服务暂时不可用，请稍后重试。如果问题持续存在，请联系技术支持。';
        }
        
        contentDiv.innerHTML = `
            <div class="error-message">
                <h3><i class="fas fa-exclamation-triangle"></i> 生成治疗方案失败</h3>
                <p>${errorMessage}</p>
            </div>
            <button class="start-btn" onclick="closeTreatmentModal()" style="margin-top: 20px;">
                关闭
            </button>
        `;
    } else {
        // 显示治疗方案
        contentDiv.innerHTML = `
            <div class="treatment-plan-section">
                <h3><i class="fas fa-stethoscope"></i> 诊断结果</h3>
                <p>${plan.diagnosis || '暂无诊断结果'}</p>
            </div>
            
            <div class="treatment-plan-section">
                <h3><i class="fas fa-pills"></i> 治疗建议</h3>
                <ul>
                    ${plan.treatments ? plan.treatments.map(t => `<li>${t}</li>`).join('') : '<li>暂无治疗建议</li>'}
                </ul>
            </div>
            
            <div class="treatment-plan-section">
                <h3><i class="fas fa-dumbbell"></i> 康复训练计划</h3>
                <ul>
                    ${plan.exercises ? plan.exercises.map(e => `<li>${e}</li>`).join('') : '<li>暂无康复训练计划</li>'}
                </ul>
            </div>
            
            <div class="treatment-plan-section">
                <h3><i class="fas fa-info-circle"></i> 注意事项</h3>
                <ul>
                    ${plan.precautions ? plan.precautions.map(p => `<li>${p}</li>`).join('') : '<li>暂无注意事项</li>'}
                </ul>
            </div>
            
            <button class="start-btn" onclick="closeTreatmentModal()" style="margin-top: 20px;">
                确认并关闭
            </button>
        `;
    }
}

/**
 * 初始化豆包AI对话框
 */
function initDoubaoChat() {
    // 获取提交按钮和对话框元素
    const submitBtn = document.getElementById('submitAssessmentBtn');
    const chatContainer = document.getElementById('doubaoChatContainer');
    
    if (submitBtn && chatContainer) {
        // 点击提交按钮时显示对话框
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认提交行为
            
            // 隐藏提交按钮
            submitBtn.style.display = 'none';
            
            // 显示豆包AI对话框
            chatContainer.style.display = 'block';
            
            // 聚焦到输入框
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.focus();
            }
            
            // 初始化P2P连接
            initChatP2PConnection();
        });
    }
}

/**
 * 初始化聊天P2P连接
 */
function initChatP2PConnection() {
    try {
        // 动态加载Socket.IO客户端库
        if (typeof io === 'undefined') {
            // 创建script标签引入Socket.IO
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = function() {
                // 加载完成后建立连接
                establishChatConnection();
            };
            script.onerror = function() {
                console.error('Socket.IO客户端库加载失败');
                addMessageToChat('ai', '连接失败：无法加载通信组件');
            };
            document.head.appendChild(script);
        } else {
            // 如果已经加载了Socket.IO，直接建立连接
            establishChatConnection();
        }
    } catch (error) {
        console.error('P2P连接错误:', error);
        addMessageToChat('ai', '连接错误：无法建立连接，请检查网络设置');
    }
}

/**
 * 建立聊天Socket.IO连接
 */
function establishChatConnection() {
    try {
        // 部署到云服务器后，将 localhost 改为服务器IP或域名
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : `http://${window.location.hostname}:3001`;
        
        // 创建WebSocket连接到信令服务器
        const socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000
        });
        
        console.log('正在连接到服务器:', serverUrl);
        
        // 保存socket连接到全局变量
        window.chatSocket = socket;
        
        // 连接成功后加入房间
        socket.on('connect', () => {
            console.log('已连接到信令服务器');
            socket.emit('join-room', 'ai-service-room', 'frontend-chat');
        });
        
        // 接收聊天回复
        socket.on('chat-response', (response) => {
            if (response.error) {
                addMessageToChat('ai', `错误：${response.message}`);
            } else {
                addMessageToChat('ai', response);
            }
            
            // 移除加载指示器
            removeLoadingIndicator();
        });
        
        // 连接错误处理
        socket.on('connect_error', (error) => {
            console.error('连接信令服务器失败:', error);
            addMessageToChat('ai', '连接失败：无法连接到AI服务，请稍后重试');
        });
        
        // 绑定发送按钮事件
        bindSendButton();
        
        // 绑定回车键发送
        bindEnterKey();
        
    } catch (error) {
        console.error('建立连接时发生错误:', error);
        addMessageToChat('ai', '连接错误：无法建立连接，请检查网络设置');
    }
}

/**
 * 绑定发送按钮事件
 */
function bindSendButton() {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (sendButton && userInput && chatMessages) {
        sendButton.addEventListener('click', function() {
            const message = userInput.value.trim();
            if (message) {
                // 显示用户消息
                addMessageToChat('user', message);
                
                // 清空输入框
                userInput.value = '';
                
                // 显示加载指示器
                showLoadingIndicator();
                
                // 通过P2P连接发送消息到AI服务端
                if (window.chatSocket && window.chatSocket.connected) {
                    window.chatSocket.emit('chat-message', message, 'ai-service-room');
                } else {
                    addMessageToChat('ai', '错误：未连接到AI服务，请刷新页面重试');
                    removeLoadingIndicator();
                }
            }
        });
    }
}

/**
 * 绑定回车键发送
 */
function bindEnterKey() {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('sendButton').click();
            }
        });
    }
}

/**
 * 添加消息到聊天窗口
 */
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.wordWrap = 'break-word';
    
    if (role === 'user') {
        messageDiv.style.background = '#e3f2fd';
        messageDiv.style.marginLeft = '20%';
    } else {
        messageDiv.style.background = '#f1f8e9';
        messageDiv.style.marginRight = '20%';
    }
    
    messageDiv.innerHTML = content;
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 显示加载指示器
 */
function showLoadingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'message ai-message';
    loadingDiv.style.marginBottom = '10px';
    loadingDiv.style.padding = '10px';
    loadingDiv.style.borderRadius = '8px';
    loadingDiv.style.background = '#f1f8e9';
    loadingDiv.style.marginRight = '20%';
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在思考中...';
    chatMessages.appendChild(loadingDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 移除加载指示器
 */
function removeLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}


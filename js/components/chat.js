// Chat functionality

/**
 * 初始化聊天功能
 */
export function initChat() {
    const expertsContainer = document.getElementById('expertsContainer');
    const startConsultBtn = document.getElementById('startConsultBtn');
    const chatContainer = document.getElementById('chatContainer');
    const chatExpertAvatar = document.getElementById('chatExpertAvatar');
    const chatExpertName = document.getElementById('chatExpertName');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    let selectedExpert = null;
    let socket = null;
    let currentConsultation = null;
    
    console.log('chat.js 初始化开始');
    
    // 连接到信令服务器
    connectToServer();
    
    // 监听页面切换，当切换到专家问诊页面时重新请求专家列表
    const expertPage = document.getElementById('expertPage');
    if (expertPage) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (expertPage.classList.contains('active')) {
                        console.log('专家问诊页面激活，请求在线专家列表');
                        if (socket && socket.connected) {
                            socket.emit('get-online-experts');
                        }
                    }
                }
            });
        });
        
        observer.observe(expertPage, { attributes: true });
    }
    
    /**
     * 连接到信令服务器
     */
    function connectToServer() {
        console.log('正在连接到信令服务器...');
        
        try {
            // 部署到云服务器后，将 localhost 改为服务器IP或域名
            const serverUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001' 
                : `http://${window.location.hostname}:3001`;
            
            socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 10000
            });
            
            console.log('正在连接到服务器:', serverUrl);
            
            // 连接成功
            socket.on('connect', () => {
                console.log('已连接到信令服务器, socket.id:', socket.id);
                // 请求获取在线专家列表
                console.log('发送 get-online-experts 请求');
                socket.emit('get-online-experts');
            });
            
            // 接收在线专家列表
            socket.on('online-experts-list', (expertsList) => {
                console.log('=== 收到在线专家列表 ===');
                console.log('专家数量:', expertsList ? expertsList.length : 0);
                console.log('专家详情:', expertsList);
                displayOnlineExperts(expertsList);
            });
            
            // 咨询已建立
            socket.on('consultation-established', (data) => {
                console.log('咨询已建立:', data);
                currentConsultation = data;
                
                // 更新聊天界面专家信息
                if (chatExpertAvatar) {
                    chatExpertAvatar.textContent = data.expertInfo.avatarChar;
                }
                if (chatExpertName) {
                    chatExpertName.textContent = data.expertInfo.name + ' - ' + data.expertInfo.title;
                }
                
                // 显示聊天界面
                const formContainer = document.querySelector('#expertPage .form-container');
                if (formContainer) {
                    formContainer.style.display = 'none';
                }
                if (chatContainer) {
                    chatContainer.style.display = 'flex';
                }
                
                // 添加欢迎消息
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="message expert">
                            <p>您好！我是${data.expertInfo.name}，${data.expertInfo.title}，很高兴为您服务。请问有什么可以帮您的？</p>
                        </div>
                    `;
                }
            });
            
            // 接收咨询消息
            socket.on('consultation-message', (data) => {
                console.log('收到咨询消息:', data);
                
                if (chatMessages) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${data.senderType}`;
                    messageDiv.innerHTML = `<p>${data.message}</p>`;
                    chatMessages.appendChild(messageDiv);
                    
                    // 滚动到底部
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
            
            // 咨询已结束
            socket.on('consultation-ended', (data) => {
                console.log('咨询已结束:', data);
                
                if (chatMessages) {
                    const endMessage = document.createElement('div');
                    endMessage.className = 'message system';
                    endMessage.innerHTML = `<p style="text-align: center; color: #999;">咨询已结束</p>`;
                    chatMessages.appendChild(endMessage);
                }
                
                // 禁用输入框
                if (chatInput) {
                    chatInput.disabled = true;
                    chatInput.placeholder = '咨询已结束';
                }
                if (sendMessageBtn) {
                    sendMessageBtn.disabled = true;
                }
            });
            
            // 接收问卷请求
            socket.on('receive-questionnaire', (data) => {
                console.log('收到问卷请求:', data);
                
                // 显示专家消息
                if (chatMessages) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message expert';
                    messageDiv.innerHTML = `<p>${data.message}</p>`;
                    chatMessages.appendChild(messageDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                
                // 显示问卷界面
                showQuestionnaireModal(data.consultationId);
            });
            
            // 咨询错误
            socket.on('consultation-error', (data) => {
                console.error('咨询错误:', data);
                alert(data.message || '发起咨询失败，请重试');
            });
            
            // 连接错误
            socket.on('connect_error', (error) => {
                console.error('连接失败:', error);
                if (expertsContainer) {
                    expertsContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #999;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                            <p>无法连接到服务器</p>
                            <p style="font-size: 0.9rem;">请确保服务器已启动</p>
                        </div>
                    `;
                }
            });
            
        } catch (error) {
            console.error('连接错误:', error);
        }
    }
    
    /**
     * 显示在线专家列表
     */
    function displayOnlineExperts(expertsList) {
        if (!expertsContainer) return;
        
        if (!expertsList || expertsList.length === 0) {
            expertsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-user-slash" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>当前暂无在线专家</p>
                    <p style="font-size: 0.9rem;">请稍后再试</p>
                </div>
            `;
            return;
        }
        
        expertsContainer.innerHTML = '';
        
        expertsList.forEach(expert => {
            const expertCard = document.createElement('div');
            expertCard.className = 'expert-card';
            
            // 如果专家忙碌，添加disabled类和禁用状态
            if (expert.isBusy) {
                expertCard.classList.add('disabled');
                expertCard.style.opacity = '0.6';
                expertCard.style.cursor = 'not-allowed';
            } else {
                expertCard.dataset.id = expert.id;
                expertCard.dataset.expertInfo = JSON.stringify(expert);
            }
            
            expertCard.innerHTML = `
                <div class="expert-avatar">${expert.avatarChar}</div>
                <h3 class="expert-name">${expert.name}</h3>
                <div class="expert-title">${expert.title}</div>
                <div class="expert-experience">${expert.specialty || expert.experience}</div>
                <div class="expert-status" style="background: ${expert.isBusy ? '#dc3545' : '#28a745'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; margin-top: 10px;">
                    <i class="fas fa-circle" style="font-size: 0.6rem; margin-right: 5px;"></i>${expert.isBusy ? '忙碌中' : '在线中'}
                </div>
            `;
            
            expertsContainer.appendChild(expertCard);
        });
        
        console.log('已显示', expertsList.length, '位在线专家');
    }
    
    // 专家卡片点击
    if (expertsContainer) {
        expertsContainer.addEventListener('click', function(e) {
            const card = e.target.closest('.expert-card');
            if (!card) return;
            
            // 如果专家忙碌，不允许选择
            if (card.classList.contains('disabled')) {
                alert('该专家正在咨询中，请选择其他专家或稍后再试');
                return;
            }
            
            // 移除之前的选择
            document.querySelectorAll('.expert-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // 设置当前选择
            card.classList.add('selected');
            selectedExpert = JSON.parse(card.dataset.expertInfo);
            
            if (startConsultBtn) {
                startConsultBtn.disabled = false;
            }
            
            console.log('已选择专家:', selectedExpert.name);
        });
    }
    
    // 开始咨询
    if (startConsultBtn) {
        startConsultBtn.addEventListener('click', function() {
            if (!selectedExpert) {
                alert('请先选择一位专家');
                return;
            }
            
            if (!socket || !socket.connected) {
                alert('未连接到服务器，请刷新页面重试');
                return;
            }
            
            console.log('发起咨询请求，专家:', selectedExpert.name);
            
            // 发送咨询请求
            socket.emit('request-consultation', {
                expertId: selectedExpert.id,
                patientInfo: {
                    id: socket.id,
                    name: '患者' + Math.floor(Math.random() * 1000),
                    timestamp: new Date().toISOString()
                }
            });
        });
    }
    
    // 发送消息
    function sendMessage() {
        if (!chatInput) return;
        const message = chatInput.value.trim();
        if (!message) return;
        
        if (!currentConsultation) {
            alert('咨询未建立，请刷新页面重试');
            return;
        }
        
        // 添加用户消息到界面
        if (chatMessages) {
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `<p>${message}</p>`;
            chatMessages.appendChild(userMessage);
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // 清空输入框
        chatInput.value = '';
        
        // 通过socket发送消息
        if (socket && socket.connected) {
            socket.emit('consultation-message', {
                roomId: currentConsultation.roomId,
                message: message,
                senderType: 'patient'
            });
            console.log('已发送消息:', message);
        } else {
            console.error('Socket未连接，消息发送失败');
        }
    }
    
    // 发送按钮点击
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // 输入框回车发送
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    /**
     * 显示问卷模态框
     */
    function showQuestionnaireModal(consultationId) {
        // 隐藏聊天界面，显示问卷页面
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        // 获取问卷页面
        const questionnairePage = document.getElementById('questionnairePage');
        if (questionnairePage) {
            // 显示问卷页面
            questionnairePage.classList.add('active');
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 绑定问卷提交事件
            bindQuestionnaireSubmit(consultationId);
        }
    }
    
    /**
     * 绑定问卷提交
     */
    function bindQuestionnaireSubmit(consultationId) {
        const submitBtn = document.getElementById('submitQuestionnaireBtn');
        
        if (submitBtn) {
            // 移除旧的事件监听器
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
            
            // 添加新的事件监听器
            newSubmitBtn.addEventListener('click', function() {
                submitQuestionnaireResults(consultationId);
            });
        }
    }
    
    /**
     * 提交问卷结果
     */
    function submitQuestionnaireResults(consultationId) {
        // 收集问卷数据
        const results = {};
        
        // 基本信息
        results['姓名'] = document.getElementById('patientName')?.value || '未填写';
        results['年龄'] = document.getElementById('patientAge')?.value || '未填写';
        results['性别'] = document.querySelector('input[name="gender"]:checked')?.value || '未选择';
        results['职业'] = document.getElementById('occupation')?.value || '未填写';
        
        // 症状信息
        const symptoms = [];
        document.querySelectorAll('input[name="symptoms"]:checked').forEach(checkbox => {
            symptoms.push(checkbox.value);
        });
        results['主要症状'] = symptoms.length > 0 ? symptoms.join('、') : '无';
        
        results['症状持续时间'] = document.getElementById('duration')?.value || '未填写';
        results['疼痛程度'] = document.getElementById('painLevel')?.value || '未选择';
        
        // 生活习惯
        results['工作性质'] = document.getElementById('workType')?.value || '未填写';
        results['每天低头时长'] = document.getElementById('screenTime')?.value || '未填写';
        results['运动频率'] = document.getElementById('exercise')?.value || '未填写';
        results['睡眠质量'] = document.getElementById('sleepQuality')?.value || '未填写';
        
        console.log('问卷结果:', results);
        
        // 发送到服务器
        if (socket && socket.connected && currentConsultation) {
            socket.emit('submit-questionnaire', {
                roomId: currentConsultation.roomId,
                consultationId: consultationId,
                results: results
            });
            
            // 显示成功提示
            alert('问卷已提交，谢谢您的配合！');
            
            // 返回聊天界面
            const questionnairePage = document.getElementById('questionnairePage');
            if (questionnairePage) {
                questionnairePage.classList.remove('active');
            }
            
            if (chatContainer) {
                chatContainer.style.display = 'flex';
            }
            
            // 在聊天界面显示提交成功消息
            if (chatMessages) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message user';
                messageDiv.innerHTML = '<p>已提交问卷</p>';
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            alert('连接已断开，无法提交问卷');
        }
    }
}

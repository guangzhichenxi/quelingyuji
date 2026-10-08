// Treatment functionality

/**
 * 初始化治疗方案功能
 */
export function initTreatment() {
    // 治疗标签切换
    document.querySelectorAll('.treatment-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 更新标签状态
            document.querySelectorAll('.treatment-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // 更新内容显示
            document.querySelectorAll('.treatment-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`${tabId}Content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 从服务器加载案例
    loadCasesFromServer();
}

/**
 * 从服务器加载案例
 */
function loadCasesFromServer() {
    // 部署到云服务器后，将 localhost 改为服务器IP或域名
    const serverUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : `http://${window.location.hostname}:3001`;
    
    // 获取socket实例（从全局或者创建新的）
    const socket = window.io ? window.io(serverUrl) : null;
    
    console.log('正在连接到服务器:', serverUrl);
    
    if (!socket) {
        console.error('无法连接到服务器，使用LocalStorage后备方案');
        renderCasesListFromLocalStorage();
        return;
    }
    
    socket.on('connect', () => {
        console.log('已连接到服务器，请求案例列表');
        socket.emit('get-cases');
    });
    
    socket.on('cases-list', (cases) => {
        console.log(`收到服务器案例: ${cases.length} 个`);
        renderCasesList(cases);
    });
    
    socket.on('case-added', (newCase) => {
        console.log('新案例添加:', newCase);
        // 重新请求列表
        socket.emit('get-cases');
    });
    
    socket.on('case-deleted', (caseId) => {
        console.log('案例已删除:', caseId);
        // 重新请求列表
        socket.emit('get-cases');
    });
}

/**
 * 从LocalStorage读取案例
 */
function getCasesFromLocalStorage(filters = {}) {
    let cases = JSON.parse(localStorage.getItem('rehabilitationCases') || '[]');
    
    // 根据筛选条件过滤
    if (filters.type) {
        cases = cases.filter(c => c.type === filters.type);
    }
    if (filters.tag) {
        cases = cases.filter(c => c.tag && c.tag.includes(filters.tag));
    }
    
    // 按创建时间倒序排列（最新的在前）
    cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return cases;
}

/**
 * 渲染案例列表（从服务器数据）
 */
function renderCasesList(cases) {
    // 获取案例容器
    const casesContainer = document.querySelector('.cases-grid');
    if (!casesContainer) return;
    
    // 清空容器
    casesContainer.innerHTML = '';
    
    // 如果没有案例，显示提示
    if (!cases || cases.length === 0) {
        casesContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999; grid-column: 1 / -1;">
                <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin: 0 0 10px 0; color: #666;">暂无康复案例</h3>
                <p style="margin: 0;">专家保存的案例将在此展示</p>
            </div>
        `;
        return;
    }
    
    // 按创建时间倒序排列（最新的在前）
    const sortedCases = [...cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 遍历案例，创建卡片
    sortedCases.forEach(caseData => {
        const caseCard = createCaseCard(caseData);
        casesContainer.appendChild(caseCard);
    });
    
    console.log(`已渲染 ${cases.length} 个来自服务器的案例`);
}

/**
 * 后备方案：从LocalStorage渲染案例
 */
function renderCasesListFromLocalStorage() {
    // 获取案例容器
    const casesContainer = document.querySelector('.cases-grid');
    if (!casesContainer) return;
    
    // 读取所有案例
    const cases = getCasesFromLocalStorage();
    
    // 清空容器
    casesContainer.innerHTML = '';
    
    // 如果没有案例，显示提示
    if (cases.length === 0) {
        casesContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999; grid-column: 1 / -1;">
                <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin: 0 0 10px 0; color: #666;">暂无康复案例</h3>
                <p style="margin: 0;">专家保存的案例将在此展示</p>
            </div>
        `;
        return;
    }
    
    // 遍历案例，创建卡片
    cases.forEach(caseData => {
        const caseCard = createCaseCard(caseData);
        casesContainer.appendChild(caseCard);
    });
    
    console.log(`已渲染 ${cases.length} 个来自LocalStorage的案例`);
}

/**
 * 创建案例卡片（与静态案例格式一致）
 */
function createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = 'case-card';
    
    // 格式化日期
    const date = new Date(caseData.createdAt);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 格式化康复方案
    const treatmentList = Array.isArray(caseData.treatment) 
        ? caseData.treatment.map(t => `<li>${t}</li>`).join('') 
        : `<li>${caseData.treatment}</li>`;
    
    card.innerHTML = `
        <div class="case-header">
            <i class="fas fa-user case-icon"></i>
            <h3 class="case-title">${caseData.name} - ${caseData.diagnosis}</h3>
        </div>
        <div class="case-content">
            <div class="case-img">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="case-details">
                <p><strong>年龄：</strong>${caseData.age}</p>
                <p><strong>职业：</strong>${caseData.occupation}</p>
                <p><strong>症状：</strong>${caseData.symptoms}</p>
                <p><strong>诊断：</strong>${caseData.diagnosis}</p>
                <p><strong>康复方案：</strong></p>
                <ul>
                    ${treatmentList}
                </ul>
                <p><strong>康复效果：</strong>${caseData.result}</p>
                <div class="case-tag">${caseData.type}</div>
                ${caseData.tag ? `<div class="case-tag">${caseData.tag}</div>` : ''}
                ${caseData.createdBy ? `<div class="case-tag" style="background: #e3f2fd; color: #1976d2;">专家：${caseData.createdBy}</div>` : ''}
                <div class="case-tag" style="background: #f3e5f5; color: #7b1fa2;">${formattedDate}</div>
            </div>
        </div>
    `;
    
    return card;
}

// 导出删除案例函数（供开发者使用）
window.deleteCase = function(caseId) {
    if (confirm('确定要删除这个案例吗？')) {
        let cases = JSON.parse(localStorage.getItem('rehabilitationCases') || '[]');
        cases = cases.filter(c => c.id !== caseId);
        localStorage.setItem('rehabilitationCases', JSON.stringify(cases));
        renderCasesList();
        alert('案例已删除');
    }
};

// 导出重新渲染函数（供其他模块调用）
export function refreshCasesList() {
    renderCasesList();
}

// Page management functionality

import { showPage } from '../utils/helpers.js';

/**
 * 初始化页面管理器
 */
export function initPageManager() {
    // 启动按钮
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            showPage('nav');
        });
    }
    
    // 导航卡片点击
    document.querySelectorAll('.nav-card').forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });
    
    // 底部导航点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });
}

// Education detail pages management

import { showPage } from '../utils/helpers.js';

/**
 * 初始化康复学院详情页功能
 */
export function initEducation() {
    // 为详情卡片添加点击事件
    const detailCards = document.querySelectorAll('[data-detail]');
    
    detailCards.forEach(card => {
        const detailLink = card.querySelector('.detail-link');
        if (detailLink) {
            detailLink.addEventListener('click', function(e) {
                e.preventDefault();
                const detailType = card.dataset.detail;
                showDetailPage(detailType);
            });
        }
    });
    
    // 返回按钮事件
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showPage('education');
        });
    });
}

/**
 * 显示详情页
 */
function showDetailPage(type) {
    const pageMap = {
        'spineStructure': 'spineStructure',
        'nerveVascular': 'nerveVascular'
    };
    
    const pageName = pageMap[type];
    if (pageName) {
        showPage(pageName);
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


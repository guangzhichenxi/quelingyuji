// Main application entry point

import { initPageManager } from './components/pageManager.js';
import { initQuestionnaire } from './components/questionnaire.js';
import { initAssessment } from './components/assessment.js';
import { initTreatment } from './components/treatment.js';
import { initPostureGame } from './components/postureGame.js';
import { initChat } from './components/chat.js';
import { initEducation } from './components/education.js';
import { initBottomNavigation, showPage } from './utils/helpers.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initPageManager();
    initQuestionnaire();
    initAssessment();
    initTreatment();
    initChat();
    initEducation();
    initBottomNavigation();
    
    // Initialize posture game when the posture page is accessed
    const postureNavCard = document.querySelector('.nav-card[data-page="posture"]');
    if (postureNavCard) {
        postureNavCard.addEventListener('click', function() {
            setTimeout(initPostureGame, 300);
        });
    }
    
    // 处理URL hash变化，用于页面跳转后的正确显示
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const pageId = hash.substring(1); // 移除 # 前缀
            // 如果是页面ID（以Page结尾），则显示对应页面
            if (pageId.endsWith('Page')) {
                const pageName = pageId.replace('Page', '');
                showPage(pageName);
            }
        } else {
            // 如果没有hash，默认显示封面页
            showPage('cover');
        }
    }
    
    // 页面加载时处理hash
    handleHashChange();
    
    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);
    
    console.log('颈椎康复助手应用已初始化');
});

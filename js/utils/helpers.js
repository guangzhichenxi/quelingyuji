// Utility functions

/**
 * 显示指定页面并隐藏其他页面
 * @param {string} pageId - 要显示的页面ID
 */
export function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示指定页面
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新底部导航激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        }
    });
}

/**
 * 初始化底部导航点击事件
 */
export function initBottomNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });
}

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(seconds) {
    return `${seconds}秒`;
}

/**
 * 随机选择数组中的元素
 * @param {Array} array - 输入数组
 * @returns {*} 数组中的随机元素
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 服务器配置工具
 * 自动获取正确的服务器地址
 */

/**
 * 获取信令服务器URL
 * @returns {string} 服务器URL
 */
export function getSignalingServerUrl() {
    // 方法1：检查当前URL的hostname
    const hostname = window.location.hostname;
    
    // 方法2：检查当前URL的protocol
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    
    // 如果是localhost或127.0.0.1，使用本地地址
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        console.log('[服务器配置] 检测到本地环境');
        return 'http://localhost:3001';
    }
    
    // 否则使用当前访问的服务器地址
    const serverUrl = `${protocol}//${hostname}:3001`;
    console.log('[服务器配置] 检测到云服务器环境:', serverUrl);
    
    return serverUrl;
}

/**
 * 测试服务器连接
 * @param {string} url 服务器URL
 * @returns {Promise<boolean>}
 */
export async function testServerConnection(url) {
    try {
        const response = await fetch(`${url}/socket.io/`, {
            method: 'GET',
            mode: 'no-cors'
        });
        return true;
    } catch (error) {
        console.error('[服务器配置] 连接测试失败:', error);
        return false;
    }
}

/**
 * 打印调试信息
 */
export function printDebugInfo() {
    console.log('=== 服务器配置调试信息 ===');
    console.log('当前页面URL:', window.location.href);
    console.log('hostname:', window.location.hostname);
    console.log('protocol:', window.location.protocol);
    console.log('port:', window.location.port);
    console.log('信令服务器URL:', getSignalingServerUrl());
    console.log('========================');
}


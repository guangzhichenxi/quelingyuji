import { io } from 'socket.io-client';
import https from 'https';
import os from 'os';

// 获取服务器地址
function getServerUrl() {
  // 检查环境变量
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }
  
  // 默认使用 localhost（本地测试）
  return 'http://localhost:3001';
}

const SERVER_URL = getServerUrl();
console.log('AI服务端将连接到:', SERVER_URL);

// 连接到信令服务器
const socket = io(SERVER_URL);

// 添加连接事件监听器
socket.on('connect', () => {
  console.log('AI服务端已连接到信令服务器，Socket ID:', socket.id);
  // 加入AI房间
  socket.emit('join-room', AI_ROOM_ID, 'ai-service');
  console.log('已发送加入房间请求:', AI_ROOM_ID);
});

// 添加连接错误监听器
socket.on('connect_error', (error) => {
  console.error('AI服务端连接错误:', error);
});

// 添加断开连接监听器
socket.on('disconnect', (reason) => {
  console.log('AI服务端断开连接，原因:', reason);
});

// 监听房间加入确认
socket.on('room-joined', (roomId, userId) => {
  console.log('AI服务端已加入房间:', roomId, '用户ID:', userId);
});

console.log('AI服务端Socket.IO客户端已初始化');

// 豆包API配置 - 使用新的API端点
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;

if (!DOUBAO_API_KEY) {
  console.error('缺少必需的环境变量 DOUBAO_API_KEY');
  process.exit(1);
}
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 房间ID（AI服务端固定房间）
const AI_ROOM_ID = 'ai-service-room';

// 添加一个测试函数来验证连接
setInterval(() => {
  if (socket.connected) {
    console.log('AI服务端保持连接状态，Socket ID:', socket.id);
  } else {
    console.log('AI服务端连接已断开');
  }
}, 30000); // 每30秒检查一次连接状态

// 监听评估数据
socket.on('assessment-data', async (data, roomId) => {
  console.log('=== 收到评估数据事件 ===');
  console.log('评估数据:', data);
  console.log('房间ID:', roomId);
  console.log('数据类型:', typeof data);
  
  // 验证roomId是否存在
  if (!roomId) {
    console.error('错误：缺少房间ID');
    socket.emit('treatment-plan', {
      error: '系统错误',
      message: '缺少房间ID，无法生成治疗方案'
    });
    return;
  }
  
  // 验证数据是否存在
  if (!data) {
    console.error('错误：缺少评估数据');
    socket.emit('treatment-plan', {
      error: '生成治疗方案失败',
      message: '缺少评估数据'
    }, roomId);
    return;
  }
  
  console.log('评估数据详情:', JSON.stringify(data, null, 2));
  
  try {
    // 生成治疗方案
    console.log('开始调用生成治疗方案函数');
    const treatmentPlan = await generateTreatmentPlan(data);
    
    console.log('生成的治疗方案:', treatmentPlan);
    
    // 发送治疗方案回房间，确保传递roomId参数
    console.log('发送治疗方案到房间:', roomId);
    socket.emit('treatment-plan', treatmentPlan, roomId);
    console.log('治疗方案发送完成');
  } catch (error) {
    console.error('生成治疗方案失败:', error);
    socket.emit('treatment-plan', {
      error: '生成治疗方案失败',
      message: error.message
    }, roomId);
  }
});

// 监听聊天消息
socket.on('chat-message', async (message, roomId) => {
  console.log('收到聊天消息:', message, '房间ID:', roomId);
  
  // 验证roomId是否存在
  if (!roomId) {
    console.error('错误：缺少房间ID');
    socket.emit('chat-response', {
      error: '系统错误',
      message: '缺少房间ID，无法发送回复'
    });
    return;
  }
  
  try {
    // 调用豆包API生成回复
    const response = await callDoubaoAPIForChat(message);
    
    // 发送回复回房间，确保传递roomId参数
    socket.emit('chat-response', response, roomId);
  } catch (error) {
    console.error('生成回复失败:', error);
    socket.emit('chat-response', {
      error: '生成回复失败',
      message: error.message
    }, roomId);
  }
});

// 生成治疗方案函数
async function generateTreatmentPlan(assessmentData) {
  console.log('开始生成治疗方案，评估数据:', assessmentData);
  
  // 发送开始处理消息
  socket.emit('treatment-process', '开始分析评估数据...', AI_ROOM_ID);
  
  // 检查评估数据是否有效
  if (!assessmentData || typeof assessmentData !== 'object') {
    throw new Error('无效的评估数据格式');
  }
  
  // 构造豆包API请求
  const prompt = `根据以下颈椎病评估数据生成个性化的治疗方案：
  
  评估数据：
  ${JSON.stringify(assessmentData, null, 2)}
  
  请提供：
  1. 诊断结果
  2. 治疗建议
  3. 康复训练计划
  4. 注意事项
  `;
  
  console.log('构造的提示词:', prompt);
  
  // 发送正在构造请求消息
  socket.emit('treatment-process', '正在构造AI请求...', AI_ROOM_ID);
  
  // 准备请求数据 - 使用与官方示例兼容的格式
  const requestData = JSON.stringify({
    model: "ep-20251123222355-zm9ft", // 使用你提供的模型参数
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
    temperature: 0.7
  });
  
  console.log('准备发送的请求数据:', requestData);
  
  // 添加重试机制
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试第 ${attempt} 次调用API`);
      socket.emit('treatment-process', `第 ${attempt} 次调用AI模型...`, AI_ROOM_ID);
      const result = await callDoubaoAPI(requestData);
      socket.emit('treatment-process', '治疗方案生成完成！', AI_ROOM_ID);
      console.log('API调用成功，返回结果:', result);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`第 ${attempt} 次尝试失败:`, error.message);
      socket.emit('treatment-process', `第 ${attempt} 次调用失败: ${error.message}`, AI_ROOM_ID);
      
      // 如果不是服务端内部错误，不重试
      if (!error.message.includes('unexpected internal error')) {
        throw error;
      }
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`API服务端持续出现内部错误，已重试${maxRetries}次。请稍后重试: ${error.message}`);
      }
      
      // 等待一段时间再重试
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  throw lastError;
}

// 为聊天调用豆包API的函数
async function callDoubaoAPIForChat(userMessage) {
  // 构造豆包API请求
  const prompt = `你是一个专业的颈椎康复助手，用户问：${userMessage}。请提供专业、简洁、有用的回复。`;
  
  // 准备请求数据 - 使用与官方示例兼容的格式
  const requestData = JSON.stringify({
    model: "ep-20251123222355-zm9ft", // 使用你提供的模型参数
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      }
    ],
    temperature: 0.7
  });
  
  return await callDoubaoAPI(requestData);
}

// 调用豆包API的函数
function callDoubaoAPI(requestData) {
  // 发送HTTP请求到豆包API
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    const req = https.request(DOUBAO_API_URL, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('API响应数据:', data); // 调试信息
          const response = JSON.parse(data);
          if (response.choices && response.choices.length > 0) {
            // 处理可能的多种内容类型
            const message = response.choices[0].message;
            if (typeof message.content === 'string') {
              // 纯文本响应
              resolve(message.content);
            } else if (Array.isArray(message.content)) {
              // 多媒体内容响应
              // 提取所有文本内容
              const textContents = message.content
                .filter(item => item.type === 'text')
                .map(item => item.text);
              resolve(textContents.join('\n'));
            } else {
              // 其他格式
              resolve(JSON.stringify(message.content));
            }
          } else if (response.error) {
            // 处理API错误响应
            reject(new Error(`API错误: ${response.error.message || '未知错误'}`));
          } else {
            // 处理意外的响应格式
            console.log('意外的API响应格式:', response);
            reject(new Error('API返回格式不正确'));
          }
        } catch (error) {
          console.error('解析API响应失败:', error);
          console.log('原始响应数据:', data);
          reject(new Error(`解析API响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`网络请求失败: ${error.message}`));
    });
    
    req.write(requestData);
    req.end();
  });
}

console.log('AI服务端启动中...');

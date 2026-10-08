import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// 配置CORS - 允许所有来源
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// Socket.IO服务器 - 配置CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 房间管理
const rooms = new Map();

// 在线专家管理
const onlineExperts = new Map(); // key: expertId, value: { expertInfo, socketId }

// 专家-病人会话管理
const consultations = new Map(); // key: consultationId, value: { expertId, patientId, roomId }

// 案例库管理
const casesFilePath = path.join(__dirname, 'cases.json');
let casesDatabase = [];

// 启动时加载案例数据
function loadCases() {
  try {
    if (fs.existsSync(casesFilePath)) {
      const data = fs.readFileSync(casesFilePath, 'utf8');
      casesDatabase = JSON.parse(data);
      console.log(`已加载 ${casesDatabase.length} 个案例`);
    } else {
      console.log('案例文件不存在，创建新文件');
      casesDatabase = [];
      saveCases();
    }
  } catch (error) {
    console.error('加载案例数据失败:', error);
    casesDatabase = [];
  }
}

// 保存案例到文件
function saveCases() {
  try {
    fs.writeFileSync(casesFilePath, JSON.stringify(casesDatabase, null, 2), 'utf8');
    console.log(`案例已保存，共 ${casesDatabase.length} 个`);
  } catch (error) {
    console.error('保存案例数据失败:', error);
  }
}

// 服务器启动时加载案例
loadCases();

// 广播专家列表给所有客户端
function broadcastExpertsList() {
  const expertsList = Array.from(onlineExperts.values()).map(expert => ({
    id: expert.id,
    name: expert.name,
    title: expert.title,
    specialty: expert.specialty,
    experience: expert.experience,
    avatarChar: expert.avatarChar,
    online: true,
    isBusy: expert.isBusy || false  // 是否忙碌中
  }));
  
  io.emit('online-experts-list', expertsList);
  console.log(`已广播专家列表，共 ${expertsList.length} 位专家`);
}

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 用户加入房间
  socket.on('join-room', (roomId, userId) => {
    console.log('用户', userId, '加入房间', roomId);
    
    // 将用户加入房间
    socket.join(roomId);
    
    // 记录房间信息
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    
    // 通知房间内其他用户
    socket.to(roomId).emit('user-joined', userId);
    
    // 向用户发送加入房间确认
    socket.emit('room-joined', roomId, userId);
  });

  // 接收评估数据
  socket.on('assessment-data', (data, roomId) => {
    console.log('=== 接收评估数据 ===');
    console.log('评估数据:', data);
    console.log('房间ID:', roomId);
    console.log('数据类型:', typeof data);
    
    // 验证roomId是否存在
    if (roomId) {
      console.log('转发评估数据到房间:', roomId);
      socket.to(roomId).emit('assessment-data', data, roomId);
    } else {
      console.log('错误：评估数据缺少房间ID');
    }
  });

  // 发送治疗方案
  socket.on('treatment-plan', (plan, roomId) => {
    console.log('转发治疗方案到房间:', roomId);
    console.log('治疗方案内容:', plan);
    // 确保roomId存在再转发
    if (roomId) {
      socket.to(roomId).emit('treatment-plan', plan, roomId);
    } else {
      console.log('错误：治疗方案缺少房间ID');
    }
  });

  // 发送聊天消息
  socket.on('chat-message', (message, roomId) => {
    console.log('转发聊天消息到房间:', roomId, '消息内容:', message);
    // 确保roomId存在再转发
    if (roomId) {
      socket.to(roomId).emit('chat-message', message, roomId);
    } else {
      console.log('错误：聊天消息缺少房间ID');
    }
  });

  // 发送聊天回复
  socket.on('chat-response', (response, roomId) => {
    console.log('转发聊天回复到房间:', roomId);
    // 确保roomId存在再转发
    if (roomId) {
      socket.to(roomId).emit('chat-response', response);
    } else {
      // 如果没有roomId，尝试广播给所有连接（仅用于调试）
      console.log('警告：聊天回复缺少房间ID，广播给所有连接');
      io.emit('chat-response', response);
    }
  });

  // 发送治疗方案生成过程消息
  socket.on('treatment-process', (message, roomId) => {
    console.log('转发治疗方案生成过程消息到房间:', roomId, '消息内容:', message);
    // 确保roomId存在再转发
    if (roomId) {
      socket.to(roomId).emit('treatment-process', message);
    } else {
      console.log('错误：治疗方案生成过程消息缺少房间ID');
    }
  });

  // 专家上线
  socket.on('expert-online', (expertInfo) => {
    console.log('=== 专家上线 ===');
    console.log('专家信息:', expertInfo);
    
    // 保存专家信息和socket ID
    onlineExperts.set(expertInfo.id, {
      ...expertInfo,
      socketId: socket.id,
      onlineTime: new Date().toISOString(),
      isBusy: false,  // 初始状态为空闲
      currentConsultationId: null
    });
    
    console.log('当前在线专家数量:', onlineExperts.size);
    
    // 广播在线专家列表给所有客户端
    broadcastExpertsList();
    
    // 确认专家上线
    socket.emit('expert-online-success', {
      success: true,
      expertId: expertInfo.id,
      message: '上线成功'
    });
  });
  
  // 专家下线
  socket.on('expert-offline', (expertId) => {
    console.log('=== 专家下线 ===');
    console.log('专家ID:', expertId);
    
    if (onlineExperts.has(expertId)) {
      onlineExperts.delete(expertId);
      console.log('专家已下线，当前在线专家数量:', onlineExperts.size);
      
      // 广播更新后的在线专家列表
      broadcastExpertsList();
    }
  });
  
  // 病人请求咨询
  socket.on('request-consultation', (data) => {
    console.log('=== 病人请求咨询 ===');
    console.log('请求数据:', data);
    
    const { expertId, patientInfo } = data;
    
    // 检查专家是否在线
    if (!onlineExperts.has(expertId)) {
      socket.emit('consultation-error', {
        error: '专家不在线',
        message: '该专家当前不在线，请选择其他专家'
      });
      return;
    }
    
    // 检查专家是否忙碌
    const expert = onlineExperts.get(expertId);
    if (expert.isBusy) {
      socket.emit('consultation-error', {
        error: '专家忙碌中',
        message: '该专家正在咨询中，请选择其他专家或稍后再试'
      });
      return;
    }
    
    // 创建咨询会话
    const consultationId = 'consult_' + Date.now();
    const roomId = 'room_' + consultationId;
    
    consultations.set(consultationId, {
      consultationId,
      expertId,
      patientId: socket.id,
      patientInfo,
      roomId,
      startTime: new Date().toISOString()
    });
    
    // 设置专家为忙碌状态
    expert.isBusy = true;
    expert.currentConsultationId = consultationId;
    onlineExperts.set(expertId, expert);
    
    // 广播更新后的专家列表（包含忙碌状态）
    broadcastExpertsList();
    
    // 让病人和专家加入同一个房间
    socket.join(roomId);
    
    const expertSocket = io.sockets.sockets.get(expert.socketId);
    
    if (expertSocket) {
      expertSocket.join(roomId);
      
      // 通知专家有新的咨询请求
      expertSocket.emit('new-consultation-request', {
        consultationId,
        roomId,
        patientInfo,
        timestamp: new Date().toISOString()
      });
    }
    
    // 通知病人咨询已建立
    socket.emit('consultation-established', {
      consultationId,
      roomId,
      expertInfo: {
        id: expert.id,
        name: expert.name,
        title: expert.title,
        specialty: expert.specialty,
        avatarChar: expert.avatarChar
      }
    });
    
    console.log(`咨询会话已建立: ${consultationId}, 专家 ${expert.name} 已设为忙碌`);
  });
  
  // 专家-病人聊天消息
  socket.on('consultation-message', (data) => {
    console.log('=== 咨询消息 ===');
    console.log('消息数据:', data);
    
    const { roomId, message, senderType } = data; // senderType: 'expert' or 'patient'
    
    if (roomId) {
      // 转发消息到房间内的其他人
      socket.to(roomId).emit('consultation-message', {
        message,
        senderType,
        timestamp: new Date().toISOString()
      });
      
      console.log('消息已转发到房间:', roomId);
    } else {
      console.log('错误：消息缺少房间ID');
    }
  });
  
  // 专家发送问卷
  socket.on('send-questionnaire', (data) => {
    console.log('=== 专家发送问卷 ===');
    console.log('问卷数据:', data);
    
    const { roomId, consultationId, message } = data;
    
    if (roomId) {
      // 转发问卷请求到病人
      socket.to(roomId).emit('receive-questionnaire', {
        consultationId,
        message,
        timestamp: new Date().toISOString()
      });
      
      console.log('问卷请求已转发到病人');
    } else {
      console.log('错误：问卷请求缺少房间ID');
    }
  });
  
  // 病人提交问卷结果
  socket.on('submit-questionnaire', (data) => {
    console.log('=== 病人提交问卷 ===');
    console.log('问卷结果:', data);
    
    const { roomId, consultationId, results } = data;
    
    if (roomId) {
      // 转发问卷结果到专家
      socket.to(roomId).emit('questionnaire-result', {
        consultationId,
        results,
        timestamp: new Date().toISOString()
      });
      
      console.log('问卷结果已转发到专家');
    } else {
      console.log('错误：问卷结果缺少房间ID');
    }
  });
  
  // 结束咨询
  socket.on('end-consultation', (consultationId) => {
    console.log('=== 结束咨询 ===');
    console.log('咨询ID:', consultationId);
    
    if (consultations.has(consultationId)) {
      const consultation = consultations.get(consultationId);
      const { roomId, expertId } = consultation;
      
      // 恢复专家状态为空闲
      if (onlineExperts.has(expertId)) {
        const expert = onlineExperts.get(expertId);
        expert.isBusy = false;
        expert.currentConsultationId = null;
        onlineExperts.set(expertId, expert);
        console.log(`专家 ${expert.name} 已恢复为空闲状态`);
        
        // 广播更新后的专家列表
        broadcastExpertsList();
      }
      
      // 通知房间内所有人咨询已结束
      io.to(roomId).emit('consultation-ended', {
        consultationId,
        endTime: new Date().toISOString()
      });
      
      // 删除咨询记录
      consultations.delete(consultationId);
      console.log('咨询已结束');
    }
  });
  
  // 获取在线专家列表
  socket.on('get-online-experts', () => {
    console.log('=== 获取在线专家列表 ===');
    
    const expertsList = Array.from(onlineExperts.values()).map(expert => ({
      id: expert.id,
      name: expert.name,
      title: expert.title,
      specialty: expert.specialty,
      experience: expert.experience,
      avatarChar: expert.avatarChar,
      online: true,
      isBusy: expert.isBusy || false  // 是否忙碌中
    }));
    
    socket.emit('online-experts-list', expertsList);
    console.log('已发送在线专家列表，共', expertsList.length, '位专家');
  });

  // ========== 案例管理 ==========
  
  // 专家保存案例
  socket.on('save-case', (caseData) => {
    console.log('=== 专家保存案例 ===');
    console.log('案例数据:', caseData);
    
    // 添加到数据库
    casesDatabase.push(caseData);
    
    // 保存到文件
    saveCases();
    
    // 告知专家保存成功
    socket.emit('case-saved', {
      success: true,
      caseId: caseData.id,
      message: '案例已成功保存到服务器'
    });
    
    // 广播新案例给所有客户端
    io.emit('case-added', caseData);
    
    console.log(`案例已保存，当前总数: ${casesDatabase.length}`);
  });
  
  // 获取所有案例
  socket.on('get-cases', () => {
    console.log('=== 获取所有案例 ===');
    socket.emit('cases-list', casesDatabase);
    console.log(`已发送 ${casesDatabase.length} 个案例`);
  });
  
  // 删除案例
  socket.on('delete-case', (caseId) => {
    console.log('=== 删除案例 ===');
    console.log('案例ID:', caseId);
    
    const index = casesDatabase.findIndex(c => c.id === caseId);
    if (index !== -1) {
      casesDatabase.splice(index, 1);
      saveCases();
      
      // 通知所有客户端
      io.emit('case-deleted', caseId);
      socket.emit('case-delete-success', { success: true, caseId });
      
      console.log(`案例已删除，剩余: ${casesDatabase.length}`);
    } else {
      socket.emit('case-delete-error', { success: false, message: '案例不存在' });
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    
    // 检查是否是专家断开连接
    for (const [expertId, expert] of onlineExperts.entries()) {
      if (expert.socketId === socket.id) {
        console.log('专家断开连接:', expert.name);
        onlineExperts.delete(expertId);
        
        // 广播更新后的在线专家列表
        const expertsList = Array.from(onlineExperts.values()).map(e => ({
          id: e.id,
          name: e.name,
          title: e.title,
          specialty: e.specialty,
          experience: e.experience,
          avatarChar: e.avatarChar,
          online: true
        }));
        
        io.emit('online-experts-list', expertsList);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`信令服务器运行在端口 ${PORT}`);
});

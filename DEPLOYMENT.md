# 颈椎康复系统 - 云服务器部署指南

## 📋 修改清单

已完成所有localhost硬编码修改，代码会自动适配本地和云服务器环境：

### ✅ 已修改的文件：
1. `treatment-chat.html` - 治疗方案和AI对话页面
2. `js/components/assessment.js` - 评估页面（2处）
3. `js/components/chat.js` - 专家问诊页面
4. `js/components/treatment.js` - 案例库页面
5. `expert-chat.html` - 专家工作台
6. `expert-login.html` - 专家登录页面
7. `ai-service.mjs` - AI服务端（支持环境变量）

---

## 🚀 完整部署步骤

### 1️⃣ 上传所有文件到服务器

```bash
# 方式1：使用scp
scp -r d:\quelingyuji\qlyj/* root@你的服务器IP:/path/to/qlyj/

# 方式2：使用FTP工具（FileZilla、WinSCP等）
```

### 2️⃣ SSH连接到服务器

```bash
ssh root@你的服务器IP
cd /path/to/qlyj
```

### 3️⃣ 安装依赖（首次部署）

```bash
npm install
```

### 4️⃣ 启动服务

#### A. 启动信令服务器（端口3001）

```bash
# 停止旧进程
pkill -f "node signaling-server.mjs"

# 启动新进程
nohup node signaling-server.mjs > signaling.log 2>&1 &

# 查看日志
tail -f signaling.log
```

**应该看到：**
```
案例文件不存在，创建新文件
案例已保存，共 0 个
信令服务器运行在端口 3001
```

#### B. 启动AI服务端

```bash
# 停止旧进程
pkill -f "node ai-service.mjs"

# 启动新进程（默认连接localhost:3001，因为在同一台服务器）
nohup node ai-service.mjs > ai.log 2>&1 &

# 查看日志
tail -f ai.log
```

**应该看到：**
```
AI服务端将连接到: http://localhost:3001
AI服务端已连接到信令服务器，Socket ID: xxxxx
已发送加入房间请求: ai-service-room
AI服务端已加入房间: ai-service-room
```

#### C. 启动Web服务器（端口8080）

```bash
# 方式1：使用Python（推荐）
nohup python3 -m http.server 8080 > web.log 2>&1 &

# 方式2：使用Node.js http-server
npm install -g http-server
nohup http-server -p 8080 > web.log 2>&1 &
```

### 5️⃣ 开放防火墙端口

#### 阿里云/腾讯云控制台：
1. 进入"安全组"设置
2. 添加入站规则：
   - 端口 3001（TCP）- Socket.IO信令服务器
   - 端口 8080（TCP）- Web服务器

#### Linux防火墙（如果启用了firewalld）：
```bash
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload
```

### 6️⃣ 验证服务运行

```bash
# 检查进程
ps aux | grep node
ps aux | grep python

# 检查端口
netstat -tlnp | grep 3001
netstat -tlnp | grep 8080

# 查看日志
tail -f signaling.log
tail -f ai.log
tail -f web.log
```

---

## 🧪 测试访问

### 病人端：
```
http://你的服务器IP:8080/index.html
```

### 专家登录：
```
http://你的服务器IP:8080/expert-login.html
```

### 测试功能：

1. **评估和AI对话**：
   - 访问病人端 → 点击"评估"
   - 完成评估 → 点击"提交评估"
   - 应该能看到"正在生成个性化治疗方案..."
   - AI对话应该正常工作

2. **专家问诊**：
   - 访问专家登录页面 → 注册/登录
   - 病人端选择专家 → 开始咨询
   - 专家端应该收到咨询请求
   - 双方可以正常对话

3. **案例库**：
   - 专家保存案例
   - 病人端查看案例库
   - 应该能看到专家保存的案例

---

## 🔍 故障排查

### 问题1：无法连接到AI服务

**症状：** "生成治疗方案失败 - 无法连接到AI服务"

**解决：**
```bash
# 检查AI服务是否运行
ps aux | grep ai-service

# 查看AI服务日志
tail -f ai.log

# 检查是否连接到信令服务器
# 应该看到：AI服务端已连接到信令服务器
```

### 问题2：专家无法上线

**症状：** "连接服务器失败"

**解决：**
```bash
# 检查信令服务器是否运行
ps aux | grep signaling-server
netstat -tlnp | grep 3001

# 检查防火墙
firewall-cmd --list-ports

# 浏览器F12查看控制台错误
```

### 问题3：浏览器缓存问题

**症状：** 代码更新了但还是旧的

**解决：**
```
Ctrl + F5（强制刷新）
或
Ctrl + Shift + Delete（清除缓存）
```

### 问题4：端口被占用

**症状：** "Address already in use"

**解决：**
```bash
# 查找占用端口的进程
lsof -i :3001
lsof -i :8080

# 杀死进程
kill -9 <进程ID>
```

---

## 📊 服务管理命令

### 查看所有服务状态
```bash
ps aux | grep -E "signaling-server|ai-service|http.server"
```

### 重启所有服务
```bash
# 停止所有服务
pkill -f "node signaling-server.mjs"
pkill -f "node ai-service.mjs"
pkill -f "python3 -m http.server"

# 启动所有服务
nohup node signaling-server.mjs > signaling.log 2>&1 &
nohup node ai-service.mjs > ai.log 2>&1 &
nohup python3 -m http.server 8080 > web.log 2>&1 &
```

### 查看实时日志
```bash
# 多窗口同时查看
tail -f signaling.log
tail -f ai.log

# 或使用tmux/screen分屏
```

---

## ⚠️ 注意事项

1. **端口一致性**：
   - 信令服务器：3001
   - Web服务器：8080
   - 不要修改这些端口，代码会自动适配

2. **启动顺序**：
   - 先启动信令服务器（3001）
   - 再启动AI服务端
   - 最后启动Web服务器（8080）

3. **环境适配**：
   - 本地测试：访问 localhost → 自动连接 localhost:3001
   - 云服务器：访问 IP/域名 → 自动连接 IP/域名:3001
   - 无需手动配置服务器地址

4. **持久化运行**：
   - 使用 `nohup` 后台运行
   - 服务器重启后需要重新启动服务
   - 建议配置为系统服务（systemd）

---

## 🎯 一键部署脚本（可选）

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "停止旧服务..."
pkill -f "node signaling-server.mjs"
pkill -f "node ai-service.mjs"
pkill -f "python3 -m http.server"

echo "启动信令服务器..."
nohup node signaling-server.mjs > signaling.log 2>&1 &
sleep 2

echo "启动AI服务端..."
nohup node ai-service.mjs > ai.log 2>&1 &
sleep 2

echo "启动Web服务器..."
nohup python3 -m http.server 8080 > web.log 2>&1 &

echo "检查服务状态..."
ps aux | grep -E "signaling-server|ai-service|http.server"

echo "部署完成！"
echo "访问地址：http://$(hostname -I | awk '{print $1}'):8080"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ 部署完成检查清单

- [ ] 信令服务器运行中（端口3001）
- [ ] AI服务端运行中且已连接
- [ ] Web服务器运行中（端口8080）
- [ ] 防火墙端口已开放
- [ ] 浏览器可以访问首页
- [ ] 评估功能正常，能生成治疗方案
- [ ] AI对话功能正常
- [ ] 专家登录功能正常
- [ ] 专家问诊功能正常
- [ ] 案例库功能正常

全部 ✅ 即部署成功！🎉


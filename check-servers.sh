#!/bin/bash

echo "======================================"
echo "  颈椎康复系统 - 服务器状态检查"
echo "======================================"
echo ""

echo "1. 检查Node.js进程..."
echo "--------------------------------------"
ps aux | grep node | grep -v grep

echo ""
echo "2. 检查端口监听..."
echo "--------------------------------------"
echo "信令服务器 (3001端口):"
netstat -tlnp | grep 3001 || echo "❌ 端口3001未监听"

echo ""
echo "Web服务器 (8080端口):"
netstat -tlnp | grep 8080 || echo "❌ 端口8080未监听"

echo ""
echo "3. 检查日志文件..."
echo "--------------------------------------"
if [ -f signaling.log ]; then
    echo "信令服务器最新日志："
    tail -5 signaling.log
else
    echo "❌ signaling.log 文件不存在"
fi

echo ""
if [ -f ai.log ]; then
    echo "AI服务端最新日志："
    tail -5 ai.log
else
    echo "❌ ai.log 文件不存在"
fi

echo ""
echo "4. 诊断建议..."
echo "--------------------------------------"

# 检查信令服务器
if ! netstat -tlnp 2>/dev/null | grep -q 3001; then
    echo "⚠️  信令服务器未运行，请执行："
    echo "   nohup node signaling-server.mjs > signaling.log 2>&1 &"
fi

# 检查AI服务
if ! ps aux | grep -v grep | grep -q "ai-service.mjs"; then
    echo "⚠️  AI服务端未运行，请执行："
    echo "   nohup node ai-service.mjs > ai.log 2>&1 &"
fi

# 检查Web服务器
if ! netstat -tlnp 2>/dev/null | grep -q 8080; then
    echo "⚠️  Web服务器未运行，请执行："
    echo "   nohup python3 -m http.server 8080 > web.log 2>&1 &"
fi

echo ""
echo "======================================"
echo "  检查完成"
echo "======================================"


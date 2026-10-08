# 开发指南

## 项目概述

颈椎康复助手是一个综合性的颈椎康复管理系统，提供专业评估、个性化治疗方案和实时姿势监测功能。本项目采用现代化的前端开发技术，具有良好的模块化结构。

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome 图标库
- Google Fonts 字体库

## 项目结构

```
tanchishe/
├── index.html          # 主页面
├── README.md           # 项目说明文档
├── package.json        # 项目配置和依赖
├── .gitignore          # Git忽略文件配置
├── css/                # 样式文件
│   ├── main.css        # 全局样式
│   └── components/     # 组件样式
│       ├── header.css
│       ├── navigation.css
│       ├── forms.css
│       └── game.css
├── js/                 # JavaScript 文件
│   ├── main.js         # 应用程序入口
│   ├── components/     # 组件逻辑
│   │   ├── pageManager.js
│   │   ├── questionnaire.js
│   │   ├── assessment.js
│   │   ├── treatment.js
│   │   ├── postureGame.js
│   │   └── chat.js
│   └── utils/          # 工具函数
│       └── helpers.js
├── assets/             # 静态资源
│   └── images/         # 图片资源
└── docs/               # 文档资料
```

## 开发环境设置

### 必需工具

1. 现代代码编辑器（推荐 VS Code）
2. 现代浏览器（Chrome, Firefox, Safari等）
3. Node.js (可选，用于开发服务器)

### 启动开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 或者监听文件变化的开发服务器
npm run dev
```

开发服务器将运行在 http://localhost:8080，并具有自动刷新功能。

## 代码规范

### HTML 规范

1. 使用语义化标签
2. 保持良好的缩进（2个空格）
3. 属性值使用双引号
4. 自闭合标签要闭合（如 `<img />`）

### CSS 规范

1. 使用语义化的类名
2. 遵循 BEM 命名规范（块-元素-修饰符）
3. 使用 CSS 自定义属性（变量）管理主题色
4. 保持良好的注释

### JavaScript 规范

1. 使用 ES6+ 语法特性
2. 遵循函数式编程原则
3. 保持组件的单一职责
4. 使用 JSDoc 注释函数和类
5. 使用 const/let 替代 var

## 模块系统

本项目使用 ES6 模块系统进行代码组织：

### 导出模块

```javascript
// utils/helpers.js
export function showPage(pageId) {
    // 实现代码
}

export function formatTime(seconds) {
    // 实现代码
}
```

### 导入模块

```javascript
// js/main.js
import { showPage, formatTime } from './utils/helpers.js';
```

## 添加新功能

### 1. 创建样式文件

在 `css/components/` 目录下创建新的 CSS 文件：

```css
/* css/components/newFeature.css */
.new-feature {
    /* 样式代码 */
}
```

在 `index.html` 中引入新样式文件：

```html
<link rel="stylesheet" href="css/components/newFeature.css">
```

### 2. 创建JavaScript模块

在 `js/components/` 目录下创建新的 JavaScript 文件：

```javascript
// js/components/newFeature.js
export function initNewFeature() {
    // 功能实现
}

export function anotherFunction() {
    // 另一个功能
}
```

### 3. 在主文件中导入和初始化

在 `js/main.js` 中导入并初始化新模块：

```javascript
// js/main.js
import { initNewFeature } from './components/newFeature.js';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化新功能
    initNewFeature();
});
```

### 4. 添加HTML结构

在 `index.html` 中添加相应的HTML结构：

```html
<!-- 在适当位置添加 -->
<div id="newFeaturePage" class="app-page">
    <div class="new-feature">
        <!-- 新功能的HTML结构 -->
    </div>
</div>
```

## 组件设计原则

### 单一职责原则

每个组件应该只负责一个特定的功能：

```javascript
// 好的例子
// pageManager.js - 专门负责页面管理
export function initPageManager() {
    // 页面切换逻辑
}

// questionnaire.js - 专门负责问卷功能
export function initQuestionnaire() {
    // 问卷逻辑
}
```

### 可复用性

组件应该设计为可复用的：

```javascript
// utils/helpers.js
export function showPage(pageId) {
    // 通用的页面显示函数
}

export function formatTime(seconds) {
    // 通用的时间格式化函数
}
```

## 调试技巧

### 1. 使用浏览器开发者工具

- 查看控制台错误信息
- 检查网络请求
- 调试JavaScript代码
- 审查元素样式

### 2. 添加调试信息

```javascript
console.log('调试信息:', variable);
console.error('错误信息:', error);
```

### 3. 使用断点调试

在浏览器开发者工具中设置断点，逐步执行代码。

## 性能优化

### 1. 减少DOM操作

```javascript
// 避免频繁的DOM操作
// 不好的做法
for (let i = 0; i < 1000; i++) {
    document.getElementById('list').innerHTML += '<li>Item ' + i + '</li>';
}

// 好的做法
let html = '';
for (let i = 0; i < 1000; i++) {
    html += '<li>Item ' + i + '</li>';
}
document.getElementById('list').innerHTML = html;
```

### 2. 事件委托

```javascript
// 使用事件委托处理多个相似元素的事件
document.getElementById('container').addEventListener('click', function(e) {
    if (e.target.classList.contains('button')) {
        // 处理按钮点击
    }
});
```

## 测试

### 手动测试

1. 在不同浏览器中测试功能
2. 在不同设备上测试响应式设计
3. 测试各种用户交互场景

### 自动化测试

（本项目暂未集成自动化测试框架，建议后续添加）

## 部署

### 静态部署

本项目为纯静态网站，可直接部署到任何支持静态文件托管的服务：

1. GitHub Pages
2. Netlify
3. Vercel
4. 传统Web服务器

### 构建优化

（本项目暂未使用构建工具，建议后续添加Webpack或Vite等构建工具）

## 常见问题

### 1. 模块无法加载

检查：
- 文件路径是否正确
- 是否在服务器环境下运行（ES6模块需要服务器环境）
- 文件扩展名是否正确

### 2. 样式未生效

检查：
- CSS文件是否正确引入
- 类名是否匹配
- 是否有样式优先级问题

### 3. 功能未执行

检查：
- JavaScript文件是否正确引入
- 是否在DOMContentLoaded事件中初始化
- 控制台是否有错误信息

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

本项目采用 MIT 许可证。

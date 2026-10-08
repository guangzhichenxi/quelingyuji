# 颈椎康复助手

一个综合性的颈椎康复管理系统，提供专业评估、个性化治疗方案和实时姿势监测功能。

## 功能特性

- 健康问卷评估
- 颈椎功能评定
- 个性化治疗方案
- 坐姿实时监测游戏
- 专家在线咨询
- 康复案例库

## 技术架构

- 前端：HTML5, CSS3, JavaScript (ES6+模块化)
- 响应式设计，支持移动端和桌面端
- 模块化结构，易于维护和扩展

## 项目结构

```
tanchishe/
├── index.html          # 主页面
├── README.md           # 项目说明文档
├── package.json        # 项目配置和依赖
├── .gitignore          # Git忽略文件配置
├── css/                # 样式文件
│   ├── main.css        # 主样式文件
│   └── components/     # 组件样式
│       ├── header.css
│       ├── navigation.css
│       ├── forms.css
│       └── game.css
├── js/                 # JavaScript 文件
│   ├── main.js         # 主入口文件
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

## 安装和运行

### 前置要求
- 现代浏览器（Chrome 63+, Edge 79+, Firefox 60+, Safari 11.1+）
- Node.js 14+ 和 npm 6+（可选，仅用于开发服务器）

### 运行方式

#### 方式一：直接打开（推荐）
直接双击 `index.html` 或在浏览器中打开即可。

**注意**：Chrome 可能因 CORS 策略限制 ES6 模块加载，建议使用方式二。

#### 方式二：使用 npm 开发服务器
```bash
# 安装依赖
npm install

# 启动服务器（自动打开浏览器）
npm start

# 开发模式（支持热重载）
npm run dev
```
访问 http://localhost:8080

### AI 服务配置

`ai-service.mjs` 通过环境变量读取豆包 API 密钥，仓库中不保存真实凭据：

```powershell
$env:DOUBAO_API_KEY="你的豆包 API Key"
node ai-service.mjs
```

可参考 `.env.example` 配置变量。请勿将 `.env` 或真实密钥提交到 Git。

#### 方式三：使用 Python 服务器（无需 Node.js）
```bash
# Python 3.x
cd qlyj
python -m http.server 8080
```
访问 http://localhost:8080

### 功能要求
- **摄像头功能**：需通过 HTTPS 或 localhost 访问（file:// 不支持）
- **ES6 模块**：使用本地服务器可避免 CORS 问题

## 模块说明

### CSS 模块
- `main.css`: 全局样式和通用组件样式
- `header.css`: 头部样式
- `navigation.css`: 导航和页面切换样式
- `forms.css`: 表单和评估相关样式
- `game.css`: 坐姿检测游戏样式

### JavaScript 模块
- `main.js`: 应用程序入口，负责初始化所有组件
- `components/pageManager.js`: 页面管理和导航
- `components/questionnaire.js`: 健康问卷功能
- `components/assessment.js`: 康复评定功能
- `components/treatment.js`: 治疗方案功能
- `components/postureGame.js`: 坐姿检测游戏
- `components/chat.js`: 专家咨询聊天功能
- `utils/helpers.js`: 通用工具函数

## 开发指南

### 添加新功能
1. 在 `css/components/` 中创建对应的样式文件
2. 在 `js/components/` 中创建对应的JavaScript模块
3. 在 `main.js` 中导入并初始化新模块
4. 在 `index.html` 中添加相应的HTML结构

### 代码规范
- 使用ES6模块系统
- 遵循函数式编程原则
- 保持组件的单一职责
- 使用语义化的HTML和CSS类名

## 部署指南

### 使用 Vercel 部署（推荐）

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署项目
```bash
cd d:\quelingyuji\qlyj
vercel --prod
```

或使用 npm 命令：
```bash
npm run deploy
```

#### 4. 自动部署（可选）
- 将代码推送到 GitHub
- 在 Vercel 官网导入项目
- 每次推送自动部署

### 其他部署选项

**GitHub Pages**
```bash
git push origin master
# 在仓库设置中启用 GitHub Pages
```

**Netlify**
- 拖放项目文件夹到 Netlify
- 或连接 Git 仓库自动部署

**自己的服务器**
- 上传所有文件到服务器
- 配置 Nginx/Apache 指向项目目录
- 配置 SSL 证书（摄像头功能必需）


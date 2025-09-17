# Coze Studio 前端开发使用指南

这是 Coze Studio 前端开发的完整使用文档，提供从环境搭建到功能开发的详细指导。

## 📋 目录
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [开发流程](#开发流程)
- [核心模块](#核心模块)
- [常用命令](#常用命令)
- [开发规范](#开发规范)
- [调试指南](#调试指南)
- [常见问题](#常见问题)

## 🔧 环境要求

### 必需环境
- **Node.js**: >= 21.0.0
- **PNPM**: 8.15.8
- **Rush**: 5.147.1
- **操作系统**: macOS / Linux / Windows

### 推荐开发工具
- VS Code + TypeScript 扩展
- Chrome DevTools
- Git

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
# 克隆项目
git clone https://github.com/coze-dev/coze-studio.git
cd coze-studio

# 安装前端依赖（必须在项目根目录运行）
rush update
```

### 2. 启动开发环境

#### 方式一：完整 Docker 环境（推荐新手）
```bash
# 启动完整 Docker 环境
cd docker
cp .env.example .env
docker compose up -d

# 访问 http://localhost:8888
```

#### 方式二：混合开发环境（推荐开发者）
```bash
# 启动中间件服务（MySQL、Redis等）
make middleware

# 启动后端服务（本地）
make server

# 启动前端开发服务器（支持热更新）
cd frontend/apps/coze-studio
npm run dev

# 访问 http://localhost:8080（开发环境）
```

### 3. 验证安装
访问对应端口，看到 Coze Studio 登录界面即表示安装成功。

## 🏗️ 项目架构

### 整体架构
```
frontend/
├── apps/coze-studio/      # 主应用（Level 4）
├── packages/              # 核心包集合
│   ├── arch/             # 基础架构层（Level 1）
│   ├── common/           # 通用组件层（Level 2）
│   ├── agent-ide/        # AI 智能体 IDE（Level 3）
│   ├── workflow/         # 工作流引擎（Level 3）
│   ├── studio/           # 工作室功能（Level 3）
│   ├── foundation/       # 基础设施
│   ├── components/       # UI 组件库
│   ├── data/            # 数据层
│   └── project-ide/     # 项目 IDE
├── config/               # 配置文件
└── infra/               # 基础设施工具
```

### 依赖层级关系
- **Level 1（arch）**: 最底层，提供基础架构
- **Level 2（common）**: 通用组件和工具
- **Level 3**: 业务功能模块
- **Level 4（apps）**: 应用入口

### 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.8.2 | 类型系统 |
| Rsbuild | 1.1.0 | 构建工具 |
| Zustand | 4.4.7 | 状态管理 |
| React Router | 6.11.1 | 路由管理 |
| Tailwind CSS | 3.3.3 | 样式框架 |
| Vitest | 3.0.5 | 测试框架 |

## 🔄 开发流程

### 1. 创建新功能
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 确定功能应该放在哪个包中
# - 业务功能 → agent-ide/workflow/studio
# - 通用组件 → common
# - UI 组件 → components
# - 基础工具 → arch

# 3. 修改代码并测试
npm run test

# 4. 构建验证
rush build
```

### 2. 开发新组件
```bash
# 进入对应的包目录
cd frontend/packages/[target-package]

# 安装包级依赖（如需要）
npm install [dependency]

# 开发完成后，在根目录测试
cd ../..
rush build
```

### 3. 添加新依赖
```bash
# 在具体包中添加依赖
cd frontend/packages/[package-name]
npm install [dependency]

# 更新 Rush 依赖图
cd ../..
rush update
```

## 📦 核心模块

### Agent IDE（智能体开发环境）
```
packages/agent-ide/
├── agent-publish/        # 智能体发布
├── entry-adapter/        # 入口适配器
├── layout-adapter/       # 布局适配器
├── prompt/              # 提示词编辑器
├── tool/                # 工具配置
└── workflow/            # 工作流集成
```

**主要功能**：
- 智能体创建和编辑
- 提示词管理
- 工具配置
- 发布管理

### Workflow（工作流引擎）
```
packages/workflow/
├── fabric-canvas/       # 画布渲染引擎
├── nodes/              # 节点组件库
├── sdk/                # 工作流 SDK
├── playground-adapter/ # 调试运行环境
└── runtime/            # 运行时
```

**主要功能**：
- 可视化工作流编辑
- 节点拖拽和连接
- 工作流执行和调试
- 自定义节点开发

### Architecture（基础架构）
```
packages/arch/
├── bot-api/            # API 接口层
├── bot-hooks/          # React Hooks
├── foundation-sdk/     # 基础 SDK
├── i18n/              # 国际化
├── coze-design/       # UI 设计系统
└── web-context/       # Web 上下文
```

**主要功能**：
- API 调用封装
- 通用 Hooks
- 国际化支持
- 设计系统

### Foundation（基础设施）
```
packages/foundation/
├── account-adapter/    # 账户适配器
├── global/            # 全局状态
├── layout/            # 布局组件
└── space-ui-base/     # 空间 UI 基础
```

## 🛠️ 常用命令

### Rush 命令（在项目根目录）
```bash
# 安装/更新依赖
rush update

# 构建所有包
rush build

# 构建特定包
rush rebuild -o @coze-studio/app

# 运行所有测试
rush test

# 代码检查
rush lint

# 清理构建缓存
rush purge
```

### 开发命令（在 apps/coze-studio 目录）
```bash
# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test

# 测试覆盖率
npm run test:cov

# 代码检查
npm run lint
```

### Make 命令（在项目根目录）
```bash
# 构建前端
make fe

# 启动后端服务
make server

# 启动中间件服务
make middleware

# 完整开发环境
make debug

# Docker 完整环境
make web
```

## 📝 开发规范

### 代码规范
```typescript
// 1. 使用 TypeScript 严格模式
// 2. 遵循 ESLint 规则
// 3. 使用 Prettier 格式化

// 组件命名：PascalCase
export const UserProfile: React.FC<Props> = () => {
  return <div>...</div>;
};

// 文件命名：kebab-case
// user-profile.tsx
// user-profile.test.tsx
// user-profile.stories.tsx
```

### 目录结构规范
```
packages/your-package/
├── src/                 # 源码目录
│   ├── components/      # 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   └── index.ts        # 导出文件
├── __tests__/          # 测试文件
├── package.json        # 包配置
├── README.md          # 说明文档
└── tsconfig.json      # TypeScript 配置
```

### 提交规范
```bash
# 使用 Rush 提交（推荐）
rush commit

# 提交格式：
# feat: 新功能
# fix: 修复
# docs: 文档
# style: 格式
# refactor: 重构
# test: 测试
```

## 🐛 调试指南

### 前端调试
```bash
# 1. 开启开发服务器
cd frontend/apps/coze-studio
npm run dev

# 2. 使用 Chrome DevTools
# - Sources 面板查看源码
# - Console 面板查看日志
# - Network 面板查看网络请求

# 3. React DevTools
# 安装 React Developer Tools 扩展
```

### API 调试
```bash
# 1. 查看 API 文档
# 访问 http://localhost:8080/api/docs

# 2. 使用 Network 面板
# 查看请求和响应数据

# 3. 后端日志
# 在启动 make server 的终端查看日志
```

### 构建问题调试
```bash
# 1. 清理缓存
rush purge
rush update

# 2. 单独构建问题包
cd packages/problem-package
npm run build

# 3. 查看详细错误信息
npm run build -- --verbose
```

## ❓ 常见问题

### Q: rush update 失败
```bash
# A: 清理缓存后重试
rm -rf node_modules
rm -rf common/temp
rush update
```

### Q: 热更新不生效
```bash
# A: 检查文件监听限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Q: 端口冲突
```bash
# A: 修改端口或停止冲突服务
lsof -i :8080
kill -9 [PID]

# 或修改 rsbuild.config.ts 中的端口配置
```

### Q: 类型错误
```bash
# A: 检查 TypeScript 配置
npx tsc --noEmit
# 确保引用了正确的类型定义
```

### Q: 包依赖问题
```bash
# A: 重建依赖图
rush update --recheck
rush rebuild
```

## 📚 扩展阅读

- [Rush.js 官方文档](https://rushjs.io/)
- [Rsbuild 配置指南](https://rsbuild.dev/)
- [React 18 特性介绍](https://react.dev/)
- [TypeScript 最佳实践](https://www.typescriptlang.org/)
- [Zustand 状态管理](https://github.com/pmndrs/zustand)

## 🤝 贡献指南

欢迎参与 Coze Studio 前端开发！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解详细的贡献指南。

---

**最后更新**: 2024-09-16
**文档版本**: v1.0.0
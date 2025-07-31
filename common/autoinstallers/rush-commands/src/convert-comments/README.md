# 中文备注转换为英文 - 项目概览

## 📖 项目简介

本项目是一个TypeScript命令行工具，用于自动将代码仓库中的中文注释翻译为英文。通过调用OpenAI API，实现高质量的代码注释翻译，同时保持原有的代码格式和结构。

## 🎯 功能特性

- ✅ **智能文件扫描**：自动识别Git仓库中的源码文件
- ✅ **多语言支持**：支持TypeScript、JavaScript、Go、Markdown等文件格式
- ✅ **精确注释解析**：准确定位和提取不同语言的注释内容
- ✅ **高质量翻译**：集成OpenAI API，提供专业的翻译服务
- ✅ **格式保持**：保持原有的缩进、换行和注释结构
- ✅ **安全备份**：自动创建文件备份，支持回滚操作
- ✅ **并发处理**：支持并发翻译，提高处理效率
- ✅ **详细报告**：生成完整的处理报告和统计信息
- ✅ **函数式设计**：采用FP编程范式，代码简洁易维护

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 基本使用

```bash
# 翻译指定目录下的所有支持文件
ai-translate --root ./src

# 指定文件扩展名
ai-translate --root ./src --exts ts,js,go

# 仅分析不修改（预览模式）
ai-translate --root ./src --dry-run

# 详细输出模式
ai-translate --root ./src --verbose
```

### 配置OpenAI API

```bash
# 通过环境变量设置
export OPENAI_API_KEY=your-api-key

# 或通过命令行参数
ai-translate --root ./src --openai-key your-api-key
```

## 📁 项目结构

```
src/convert-comments/
├── 📄 requirements.md           # 需求文档
├── 📄 implementation-plan.md    # 实现方案
├── 📄 technical-specification.md # 技术规格
├── 📄 README.md                # 项目概览（本文件）
├── 📦 index.ts                 # 主入口文件
├── 🗂️ cli/                     # 命令行接口
│   ├── command.ts              # Commander.js命令定义
│   └── config.ts               # 配置管理
├── 🗂️ modules/                 # 核心功能模块
│   ├── file-scan.ts            # 文件扫描模块
│   ├── chinese-detection.ts    # 中文检测模块
│   ├── translation.ts          # 翻译服务模块
│   ├── file-replacement.ts     # 文件替换模块
│   └── report.ts               # 报告生成模块
├── 🗂️ utils/                   # 工具函数
│   ├── git.ts                  # Git操作工具
│   ├── language.ts             # 编程语言识别
│   ├── chinese.ts              # 中文字符检测
│   └── fp.ts                   # 函数式编程工具
├── 🗂️ types/                   # TypeScript类型定义
│   ├── index.ts                # 主要类型定义
│   └── config.ts               # 配置类型
└── 🗂️ __tests__/               # 测试文件
    ├── unit/                   # 单元测试
    └── integration/            # 集成测试
```

## 🔧 核心模块

### 1. 文件扫描模块 (FileScanModule)
- 调用Git命令获取仓库文件列表
- 根据扩展名过滤目标文件
- 识别编程语言类型

### 2. 中文检测模块 (ChineseDetectionModule)
- 解析不同语言的注释语法
- 识别包含中文字符的注释
- 提取注释的精确位置信息

### 3. 翻译服务模块 (TranslationModule)
- 调用OpenAI API进行翻译
- 处理翻译错误和重试机制
- 优化翻译提示词和上下文

### 4. 文件替换模块 (FileReplacementModule)
- 精确替换文件中的中文注释
- 保持代码格式和缩进
- 实现备份和回滚机制

### 5. 报告生成模块 (ReportModule)
- 收集处理过程的统计信息
- 生成详细的处理报告
- 支持多种输出格式

## ⚡ 技术亮点

### 函数式编程范式
采用纯函数设计和不可变数据结构：
```typescript
const processRepository = pipe(
  getGitTrackedFiles,
  asyncMap(readFile),
  asyncFilter(hasChineseComments),
  asyncMap(extractChineseComments),
  asyncMap(translateComments),
  asyncMap(applyTranslations),
  generateReport
);
```

### 性能优化
- **并发控制**：使用Semaphore控制API调用频率
- **缓存机制**：避免重复翻译相同内容
- **增量处理**：仅处理修改过的文件
- **流式处理**：支持大文件分块处理

### 错误处理
- **Result模式**：使用函数式错误处理
- **重试机制**：自动重试失败的API调用
- **部分失败**：支持部分文件失败时继续处理

## 🛠️ 开发指南

### 环境准备

1. **Node.js 环境**：建议使用 Node.js 16+
2. **TypeScript**：项目使用TypeScript开发
3. **OpenAI API Key**：需要有效的OpenAI API密钥

### 开发流程

1. **安装依赖**
```bash
npm install
```

2. **开发模式运行**
```bash
npm run dev
```

3. **运行测试**
```bash
npm test
```

4. **构建项目**
```bash
npm run build
```

### 贡献指南

1. **Fork 项目**到自己的GitHub账号
2. **创建功能分支**：`git checkout -b feature/new-feature`
3. **提交更改**：`git commit -am 'Add new feature'`
4. **推送分支**：`git push origin feature/new-feature`
5. **创建 Pull Request**

### 代码规范

- **TypeScript严格模式**：启用所有严格类型检查
- **ESLint规则**：遵循项目ESLint配置
- **Prettier格式化**：保持代码格式一致
- **单元测试**：新功能需要对应的单元测试

## 📋 命令行参数

### 必需参数
- `--root, -r <directory>`：需要处理的根目录

### 可选参数
- `--exts, -e <extensions>`：文件扩展名，如 "ts,js,go,md"
- `--openai-key <key>`：OpenAI API密钥
- `--model <model>`：OpenAI模型名称（默认：gpt-3.5-turbo）
- `--dry-run`：仅分析不实际修改文件
- `--backup`：创建文件备份（默认启用）
- `--verbose, -v`：详细输出模式
- `--output <file>`：报告输出文件路径

### 使用示例

```bash
# 基本使用
ai-translate --root ./src --exts ts,js

# 预览模式（不修改文件）
ai-translate --root ./src --dry-run --verbose

# 使用GPT-4模型
ai-translate --root ./src --model gpt-4

# 生成JSON格式报告
ai-translate --root ./src --output report.json
```

## 🔍 配置文件

支持使用配置文件来管理默认设置：

```json
{
  "translation": {
    "model": "gpt-3.5-turbo",
    "maxRetries": 3,
    "timeout": 30000,
    "concurrency": 3
  },
  "processing": {
    "defaultExtensions": ["ts", "js", "go", "md"],
    "createBackup": true,
    "outputFormat": "console"
  },
  "git": {
    "ignorePatterns": ["node_modules/**", ".git/**", "dist/**"],
    "includeUntracked": false
  }
}
```

## 📊 输出报告

处理完成后会生成详细的统计报告：

```
📊 翻译处理报告
==================
总文件数: 45
处理成功: 42
跳过文件: 3
翻译注释: 128
错误数量: 0
处理时间: 45.32秒

✅ 处理完成，无错误
```

## ⚠️ 注意事项

### API限制
- OpenAI API有调用频率限制，建议合理设置并发数量
- 长时间运行可能消耗较多API配额

### 翻译质量
- 自动翻译可能不够准确，建议人工审核重要注释
- 提供dry-run模式预览翻译结果

### 文件安全
- 默认创建备份文件，避免意外损失
- 建议在版本控制环境下使用

## 🔗 相关文档

- [需求文档](./requirements.md) - 详细的功能需求说明
- [实现方案](./implementation-plan.md) - 整体架构和设计方案
- [技术规格](./technical-specification.md) - 详细的技术实现规格

## 📞 问题反馈

如有问题或建议，请通过以下方式联系：

- 创建 GitHub Issue
- 提交 Pull Request
- 发送邮件至开发团队

---

**Happy Coding! 🎉**

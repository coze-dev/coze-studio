# 中文备注转换为英文 - 实现方案

## 项目概述

基于需求文档，本项目需要实现一个TypeScript脚本，用于将代码仓库内的中文备注自动转换为英文备注。

## 核心模块设计

### 1. 文件扫描模块 (FileScanModule)

```typescript
interface FileScanConfig {
  root: string;
  extensions: string[];
}

interface SourceFile {
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'go' | 'markdown' | 'other';
}
```

**功能职责：**
- 调用git命令获取仓库所有源码文件
- 根据文件扩展名过滤目标文件
- 读取文件内容并识别编程语言类型

**核心函数：**
- `getGitTrackedFiles(root: string): Promise<string[]>`
- `filterFilesByExtensions(files: string[], extensions: string[]): string[]`
- `readSourceFiles(filePaths: string[]): Promise<SourceFile[]>`

### 2. 中文检测模块 (ChineseDetectionModule)

```typescript
interface ChineseComment {
  content: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  type: 'single-line' | 'multi-line' | 'documentation';
}

interface FileWithComments {
  file: SourceFile;
  chineseComments: ChineseComment[];
}
```

**功能职责：**
- 解析不同语言的注释语法
- 识别包含中文字符的注释
- 提取注释的精确位置信息

**核心函数：**
- `detectChineseInComments(file: SourceFile): ChineseComment[]`
- `parseCommentsByLanguage(content: string, language: string): Comment[]`
- `containsChinese(text: string): boolean`

### 3. 翻译服务模块 (TranslationModule)

```typescript
interface TranslationConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  timeout: number;
}

interface TranslationResult {
  original: string;
  translated: string;
  confidence: number;
}
```

**功能职责：**
- 调用OpenAI API进行翻译
- 处理翻译错误和重试
- 保持代码注释的格式和结构

**核心函数：**
- `translateComment(comment: string, context?: string): Promise<TranslationResult>`
- `batchTranslate(comments: string[]): Promise<TranslationResult[]>`
- `createTranslationPrompt(comment: string, language: string): string`

### 4. 文件替换模块 (FileReplacementModule)

```typescript
interface ReplacementOperation {
  file: string;
  replacements: Array<{
    start: number;
    end: number;
    original: string;
    replacement: string;
  }>;
}
```

**功能职责：**
- 精确替换文件中的中文注释
- 保持代码格式和缩进
- 创建备份机制

**核心函数：**
- `replaceCommentsInFile(file: SourceFile, replacements: ReplacementOperation): Promise<void>`
- `createBackup(filePath: string): Promise<string>`
- `applyReplacements(content: string, replacements: Replacement[]): string`

### 5. 报告生成模块 (ReportModule)

```typescript
interface ProcessingReport {
  totalFiles: number;
  processedFiles: number;
  translatedComments: number;
  errors: Error[];
  duration: number;
  details: FileProcessingDetail[];
}

interface FileProcessingDetail {
  file: string;
  commentCount: number;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
}
```

**功能职责：**
- 记录处理过程中的统计信息
- 生成详细的处理报告
- 记录错误和异常情况

## 命令行接口设计

### 主命令

```bash
ai-translate --root <directory> --exts <extensions> [options]
```

### 参数说明

- `--root, -r <directory>`: 需要处理的根目录（必填）
- `--exts, -e <extensions>`: 文件扩展名数组，如 "ts,js,go,md"（可选，默认处理所有文本文件）
- `--openai-key <key>`: OpenAI API密钥（可选，也可通过环境变量提供）
- `--model <model>`: OpenAI模型名称（可选，默认gpt-3.5-turbo）
- `--dry-run`: 仅分析不实际修改文件（可选）
- `--backup`: 创建文件备份（可选，默认启用）
- `--verbose, -v`: 详细输出模式（可选）
- `--output <file>`: 报告输出文件（可选）

## 技术实现细节

### 1. 函数式编程范式

采用FP风格，主要体现在：
- 纯函数设计：无副作用的数据转换
- 不可变数据结构：使用immutable.js或原生不可变操作
- 函数组合：通过pipe和compose构建处理流水线
- 错误处理：使用Either/Maybe模式处理异常

### 2. 异步处理策略

```typescript
// 使用函数式风格的异步处理管道
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

### 3. 错误处理机制

- 使用Result类型封装成功/失败状态
- 实现重试机制处理网络错误
- 记录详细的错误日志和上下文
- 支持部分失败的情况下继续处理

### 4. 性能优化

- 并发处理：合理控制并发数量避免API限制
- 缓存机制：避免重复翻译相同内容
- 增量处理：仅处理修改过的文件
- 流式处理：大文件分块处理

## 项目结构

```
src/convert-comments/
├── index.ts                 # 主入口文件
├── cli/
│   ├── command.ts          # Commander.js命令定义
│   └── config.ts           # 配置管理
├── modules/
│   ├── file-scan.ts        # 文件扫描模块
│   ├── chinese-detection.ts # 中文检测模块
│   ├── translation.ts      # 翻译服务模块
│   ├── file-replacement.ts # 文件替换模块
│   └── report.ts          # 报告生成模块
├── utils/
│   ├── git.ts             # Git操作工具
│   ├── language.ts        # 编程语言识别
│   ├── chinese.ts         # 中文字符检测
│   └── fp.ts             # 函数式编程工具
├── types/
│   ├── index.ts           # 类型定义
│   └── config.ts          # 配置类型
└── __tests__/
    ├── unit/              # 单元测试
    └── integration/       # 集成测试
```

## 依赖包选择

### 核心依赖
- `commander`: 命令行接口
- `openai`: OpenAI API客户端
- `simple-git`: Git操作
- `ramda` 或 `lodash/fp`: 函数式编程工具

### 开发依赖
- `typescript`: TypeScript编译器
- `@types/node`: Node.js类型定义
- `jest`: 测试框架
- `prettier`: 代码格式化
- `eslint`: 代码检查

## 开发阶段规划

### 阶段1：基础框架搭建
1. 项目初始化和依赖安装
2. TypeScript配置和构建脚本
3. 命令行接口框架
4. 基础类型定义

### 阶段2：核心功能实现
1. 文件扫描模块
2. 中文检测模块
3. 翻译服务模块
4. 文件替换模块

### 阶段3：完善和优化
1. 报告生成模块
2. 错误处理和重试机制
3. 性能优化
4. 单元测试和集成测试

### 阶段4：发布准备
1. 文档完善
2. 使用示例
3. 打包和发布脚本
4. CI/CD配置

## 使用示例

```bash
# 基本使用
ai-translate --root ./src --exts ts,js,go

# 仅分析不修改
ai-translate --root ./src --dry-run

# 指定OpenAI配置
ai-translate --root ./src --openai-key sk-... --model gpt-4

# 生成详细报告
ai-translate --root ./src --verbose --output report.json
```

## 质量保证

### 测试策略
- 单元测试：覆盖所有核心函数
- 集成测试：端到端流程验证
- 性能测试：大型仓库处理能力
- 安全测试：API密钥保护

### 代码质量
- TypeScript严格模式
- ESLint规则检查
- Prettier代码格式化
- 代码覆盖率要求>90%

## 风险和缓解措施

### 主要风险
1. **API配额限制**：OpenAI API调用频率限制
2. **翻译质量**：自动翻译可能不够准确
3. **文件损坏**：替换操作可能破坏文件
4. **性能问题**：大型仓库处理时间过长

### 缓解措施
1. 实现智能重试和降级机制
2. 提供人工审核和修正功能
3. 强制备份和回滚机制
4. 并发控制和进度显示

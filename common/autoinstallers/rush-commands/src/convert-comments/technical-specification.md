# 中文备注转换为英文 - 技术规格说明

## 1. 文件扫描模块详细设计

### 1.1 Git文件获取

```typescript
import simpleGit from 'simple-git';

/**
 * 获取Git仓库中的所有已跟踪文件
 */
export const getGitTrackedFiles = async (root: string): Promise<string[]> => {
  const git = simpleGit(root);
  const files = await git.raw(['ls-files']);
  return files
    .split('\n')
    .filter(Boolean)
    .map(file => path.resolve(root, file));
};
```

### 1.2 文件扩展名过滤

```typescript
/**
 * 根据扩展名过滤文件
 */
export const filterFilesByExtensions = (
  files: string[],
  extensions: string[]
): string[] => {
  if (extensions.length === 0) {
    // 默认支持的文本文件扩展名
    const defaultExtensions = ['.ts', '.js', '.jsx', '.tsx', '.go', '.md', '.txt', '.json'];
    return files.filter(file =>
      defaultExtensions.some(ext => file.endsWith(ext))
    );
  }

  return files.filter(file =>
    extensions.some(ext => file.endsWith(`.${ext}`))
  );
};
```

### 1.3 编程语言识别

```typescript
export const detectLanguage = (filePath: string): SourceFileLanguage => {
  const ext = path.extname(filePath).toLowerCase();

  const languageMap: Record<string, SourceFileLanguage> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.go': 'go',
    '.md': 'markdown',
    '.txt': 'text',
    '.json': 'json'
  };

  return languageMap[ext] || 'other';
};
```

## 2. 中文检测模块详细设计

### 2.1 注释解析器

```typescript
interface CommentPattern {
  single: RegExp;
  multiStart: RegExp;
  multiEnd: RegExp;
}

const commentPatterns: Record<string, CommentPattern> = {
  typescript: {
    single: /\/\/(.*)$/gm,
    multiStart: /\/\*/g,
    multiEnd: /\*\//g
  },
  javascript: {
    single: /\/\/(.*)$/gm,
    multiStart: /\/\*/g,
    multiEnd: /\*\//g
  },
  go: {
    single: /\/\/(.*)$/gm,
    multiStart: /\/\*/g,
    multiEnd: /\*\//g
  },
  markdown: {
    single: /<!--(.*)-->/g,
    multiStart: /<!--/g,
    multiEnd: /-->/g
  }
};
```

### 2.2 中文字符检测

```typescript
/**
 * 检测文本是否包含中文字符
 */
export const containsChinese = (text: string): boolean => {
  // Unicode范围：中日韩统一表意文字
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
  return chineseRegex.test(text);
};

/**
 * 提取文本中的中文部分
 */
export const extractChineseParts = (text: string): string[] => {
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]+/g;
  return text.match(chineseRegex) || [];
};
```

### 2.3 注释位置定位

```typescript
export const parseComments = (content: string, language: string): ParsedComment[] => {
  const pattern = commentPatterns[language];
  if (!pattern) return [];

  const comments: ParsedComment[] = [];
  const lines = content.split('\n');

  // 解析单行注释
  lines.forEach((line, index) => {
    const match = pattern.single.exec(line);
    if (match && containsChinese(match[1])) {
      comments.push({
        content: match[1].trim(),
        startLine: index + 1,
        endLine: index + 1,
        startColumn: match.index,
        endColumn: match.index + match[0].length,
        type: 'single-line'
      });
    }
  });

  // 解析多行注释
  const multiLineComments = parseMultiLineComments(content, pattern);
  comments.push(...multiLineComments);

  return comments;
};
```

## 3. 翻译服务模块详细设计

### 3.1 OpenAI API集成

```typescript
import OpenAI from 'openai';

export class TranslationService {
  private openai: OpenAI;
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
  }

  async translateComment(
    comment: string,
    context?: TranslationContext
  ): Promise<TranslationResult> {
    const prompt = this.createTranslationPrompt(comment, context);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional code comment translator. Translate Chinese comments to English while preserving the original meaning and code formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const translated = response.choices[0]?.message?.content?.trim();
      if (!translated) {
        throw new Error('Empty translation response');
      }

      return {
        original: comment,
        translated,
        confidence: this.calculateConfidence(response)
      };
    } catch (error) {
      throw new TranslationError(`Translation failed: ${error.message}`, comment);
    }
  }
}
```

### 3.2 翻译提示词优化

```typescript
private createTranslationPrompt(
  comment: string,
  context?: TranslationContext
): string {
  const basePrompt = `
Translate the following Chinese code comment to English:

Chinese comment: "${comment}"

Requirements:
1. Keep the same tone and style
2. Preserve any code-related terminology
3. Maintain brevity and clarity
4. Return only the translated text without quotes
`;

  if (context) {
    return basePrompt + `
Context:
- File type: ${context.language}
- Function/Variable name: ${context.nearbyCode}
- Comment type: ${context.commentType}
`;
  }

  return basePrompt;
}
```

### 3.3 批量翻译优化

```typescript
export const batchTranslate = async (
  comments: ChineseComment[],
  service: TranslationService,
  concurrency: number = 3
): Promise<TranslationResult[]> => {
  const semaphore = new Semaphore(concurrency);

  return Promise.all(
    comments.map(async (comment) => {
      await semaphore.acquire();
      try {
        return await service.translateComment(comment.content);
      } finally {
        semaphore.release();
      }
    })
  );
};
```

## 4. 文件替换模块详细设计

### 4.1 精确位置替换

```typescript
export const applyReplacements = (
  content: string,
  replacements: Replacement[]
): string => {
  // 按位置倒序排列，避免替换后位置偏移
  const sortedReplacements = replacements.sort((a, b) => b.start - a.start);

  let result = content;

  for (const replacement of sortedReplacements) {
    const before = result.substring(0, replacement.start);
    const after = result.substring(replacement.end);
    result = before + replacement.replacement + after;
  }

  return result;
};
```

### 4.2 备份机制

```typescript
export const createBackup = async (filePath: string): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;

  await fs.copyFile(filePath, backupPath);
  return backupPath;
};

export const restoreFromBackup = async (
  originalPath: string,
  backupPath: string
): Promise<void> => {
  await fs.copyFile(backupPath, originalPath);
  await fs.unlink(backupPath);
};
```

### 4.3 格式保持

```typescript
/**
 * 保持注释的原始缩进和格式
 */
export const preserveCommentFormat = (
  originalComment: string,
  translatedComment: string,
  commentType: CommentType
): string => {
  const originalLines = originalComment.split('\n');
  const translatedLines = translatedComment.split('\n');

  if (commentType === 'single-line') {
    // 保持单行注释的前缀空格
    const leadingSpaces = originalComment.match(/^(\s*)/)?.[1] || '';
    return leadingSpaces + translatedComment.trim();
  }

  if (commentType === 'multi-line') {
    // 保持多行注释的对齐
    return translatedLines
      .map((line, index) => {
        const originalLine = originalLines[index];
        if (originalLine) {
          const leadingSpaces = originalLine.match(/^(\s*)/)?.[1] || '';
          return leadingSpaces + line.trim();
        }
        return line;
      })
      .join('\n');
  }

  return translatedComment;
};
```

## 5. 报告生成模块详细设计

### 5.1 统计数据收集

```typescript
export class ReportCollector {
  private stats: ProcessingStats = {
    totalFiles: 0,
    processedFiles: 0,
    translatedComments: 0,
    skippedFiles: 0,
    errors: [],
    startTime: Date.now(),
    endTime: 0
  };

  private fileDetails: Map<string, FileProcessingDetail> = new Map();

  recordFileStart(filePath: string): void {
    this.stats.totalFiles++;
    this.fileDetails.set(filePath, {
      file: filePath,
      commentCount: 0,
      status: 'processing',
      startTime: Date.now()
    });
  }

  recordFileComplete(filePath: string, commentCount: number): void {
    const detail = this.fileDetails.get(filePath);
    if (detail) {
      detail.status = 'success';
      detail.commentCount = commentCount;
      detail.endTime = Date.now();
      this.stats.processedFiles++;
      this.stats.translatedComments += commentCount;
    }
  }

  recordError(filePath: string, error: Error): void {
    const detail = this.fileDetails.get(filePath);
    if (detail) {
      detail.status = 'error';
      detail.errorMessage = error.message;
      detail.endTime = Date.now();
    }
    this.stats.errors.push({ file: filePath, error: error.message });
  }
}
```

### 5.2 报告格式化

```typescript
export const generateReport = (
  collector: ReportCollector,
  format: 'json' | 'markdown' | 'console' = 'console'
): string => {
  const stats = collector.getStats();

  switch (format) {
    case 'json':
      return JSON.stringify(stats, null, 2);

    case 'markdown':
      return generateMarkdownReport(stats);

    case 'console':
    default:
      return generateConsoleReport(stats);
  }
};

const generateConsoleReport = (stats: ProcessingStats): string => {
  const duration = (stats.endTime - stats.startTime) / 1000;

  return `
📊 翻译处理报告
==================
总文件数: ${stats.totalFiles}
处理成功: ${stats.processedFiles}
跳过文件: ${stats.skippedFiles}
翻译注释: ${stats.translatedComments}
错误数量: ${stats.errors.length}
处理时间: ${duration.toFixed(2)}秒

${stats.errors.length > 0 ? '❌ 错误详情:\n' + stats.errors.map(e => `  ${e.file}: ${e.error}`).join('\n') : '✅ 处理完成，无错误'}
`;
};
```

## 6. 函数式编程工具

### 6.1 基础FP工具

```typescript
export const pipe = <T>(...fns: Function[]) => (value: T) =>
  fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Function[]) => (value: T) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

export const curry = (fn: Function) => (...args: any[]) =>
  args.length >= fn.length
    ? fn(...args)
    : (...more: any[]) => curry(fn)(...args, ...more);
```

### 6.2 异步处理工具

```typescript
export const asyncMap = curry(
  async <T, U>(fn: (item: T) => Promise<U>, items: T[]): Promise<U[]> =>
    Promise.all(items.map(fn))
);

export const asyncFilter = curry(
  async <T>(predicate: (item: T) => Promise<boolean>, items: T[]): Promise<T[]> => {
    const results = await Promise.all(items.map(predicate));
    return items.filter((_, index) => results[index]);
  }
);

export const asyncReduce = curry(
  async <T, U>(
    fn: (acc: U, item: T) => Promise<U>,
    initial: U,
    items: T[]
  ): Promise<U> => {
    let result = initial;
    for (const item of items) {
      result = await fn(result, item);
    }
    return result;
  }
);
```

### 6.3 错误处理

```typescript
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = <E>(error: E): Result<never, E> => ({ success: false, error });

export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<Result<T>> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};
```

## 7. 配置管理

### 7.1 配置文件结构

```typescript
interface AppConfig {
  translation: {
    apiKey: string;
    model: string;
    maxRetries: number;
    timeout: number;
    concurrency: number;
  };
  processing: {
    defaultExtensions: string[];
    createBackup: boolean;
    outputFormat: 'json' | 'markdown' | 'console';
  };
  git: {
    ignorePatterns: string[];
    includeUntracked: boolean;
  };
}
```

### 7.2 配置加载

```typescript
export const loadConfig = async (configPath?: string): Promise<AppConfig> => {
  const defaultConfig: AppConfig = {
    translation: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-3.5-turbo',
      maxRetries: 3,
      timeout: 30000,
      concurrency: 3
    },
    processing: {
      defaultExtensions: ['ts', 'js', 'go', 'md'],
      createBackup: true,
      outputFormat: 'console'
    },
    git: {
      ignorePatterns: ['node_modules/**', '.git/**', 'dist/**'],
      includeUntracked: false
    }
  };

  if (configPath && await fs.access(configPath).then(() => true).catch(() => false)) {
    const userConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return deepMerge(defaultConfig, userConfig);
  }

  return defaultConfig;
};
```

## 8. 性能优化策略

### 8.1 并发控制

```typescript
export class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    const next = this.waiting.shift();
    if (next) {
      this.permits--;
      next();
    }
  }
}
```

### 8.2 缓存机制

```typescript
export class TranslationCache {
  private cache = new Map<string, TranslationResult>();
  private hashFn = (text: string) => crypto.createHash('md5').update(text).digest('hex');

  get(comment: string): TranslationResult | undefined {
    const key = this.hashFn(comment);
    return this.cache.get(key);
  }

  set(comment: string, result: TranslationResult): void {
    const key = this.hashFn(comment);
    this.cache.set(key, result);
  }

  async save(filePath: string): Promise<void> {
    const data = Object.fromEntries(this.cache);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async load(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      this.cache = new Map(Object.entries(data));
    } catch {
      // 缓存文件不存在或损坏，忽略
    }
  }
}
```

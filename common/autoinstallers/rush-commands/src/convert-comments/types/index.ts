/**
 * 源文件语言类型
 */
export type SourceFileLanguage =
  | 'typescript'
  | 'javascript'
  | 'go'
  | 'markdown'
  | 'text'
  | 'json'
  | 'yaml'
  | 'toml'
  | 'ini'
  | 'shell'
  | 'python'
  | 'css'
  | 'html'
  | 'xml'
  | 'php'
  | 'ruby'
  | 'rust'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'thrift'
  | 'other';

/**
 * 注释类型
 */
export type CommentType = 'single-line' | 'multi-line' | 'documentation';

/**
 * 源文件信息
 */
export interface SourceFile {
  path: string;
  content: string;
  language: SourceFileLanguage;
}

/**
 * 多行注释上下文信息
 */
export interface MultiLineContext {
  isPartOfMultiLine: boolean;
  originalComment: ParsedComment;
  lineIndexInComment: number;
  totalLinesInComment: number;
}

/**
 * 中文注释信息
 */
export interface ChineseComment {
  content: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  type: CommentType;
  multiLineContext?: MultiLineContext;
}

/**
 * 包含中文注释的文件
 */
export interface FileWithComments {
  file: SourceFile;
  chineseComments: ChineseComment[];
}

/**
 * 翻译结果
 */
export interface TranslationResult {
  original: string;
  translated: string;
  confidence: number;
}

/**
 * 翻译上下文
 */
export interface TranslationContext {
  language: string;
  nearbyCode?: string;
  commentType: CommentType;
}

/**
 * 替换操作
 */
export interface Replacement {
  start: number;
  end: number;
  original: string;
  replacement: string;
}

/**
 * 文件替换操作
 */
export interface ReplacementOperation {
  file: string;
  replacements: Replacement[];
}

/**
 * 文件处理详情
 */
export interface FileProcessingDetail {
  file: string;
  commentCount: number;
  status: 'processing' | 'success' | 'error' | 'skipped';
  errorMessage?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * 处理统计信息
 */
export interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  translatedComments: number;
  skippedFiles: number;
  errors: Array<{ file: string; error: string }>;
  startTime: number;
  endTime: number;
}

/**
 * 处理报告
 */
export interface ProcessingReport {
  stats: ProcessingStats;
  details: FileProcessingDetail[];
  duration: number;
}

/**
 * 文件扫描配置
 */
export interface FileScanConfig {
  root: string;
  extensions: string[];
  ignorePatterns: string[];
  includeUntracked: boolean;
}

/**
 * 解析的注释
 */
export interface ParsedComment {
  content: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  type: CommentType;
}

/**
 * 注释模式配置
 */
export interface CommentPattern {
  single: RegExp;
  multiStart: RegExp;
  multiEnd: RegExp;
}

/**
 * 函数式编程结果类型
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 翻译错误
 */
export class TranslationError extends Error {
  constructor(
    message: string,
    public originalComment: string,
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

/**
 * 翻译配置
 */
export interface TranslationConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sourceLanguage: string;
  targetLanguage: string;
  maxRetries: number;
  timeout: number;
  concurrency: number;
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
 * 处理配置
 */
export interface ProcessingConfig {
  defaultExtensions: string[];
  outputFormat: 'json' | 'markdown' | 'console';
}

/**
 * Git配置
 */
export interface GitConfig {
  ignorePatterns: string[];
  includeUntracked: boolean;
}

/**
 * 应用配置
 */
export interface AppConfig {
  translation: TranslationConfig;
  processing: ProcessingConfig;
  git: GitConfig;
}

/**
 * 命令行选项
 */
export interface CliOptions {
  root: string;
  exts?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  dryRun?: boolean;
  verbose?: boolean;
  output?: string;
  config?: string;
}

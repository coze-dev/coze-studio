/**
 * translation configuration
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
 * File Scan Configuration
 */
export interface FileScanConfig {
  root: string;
  extensions: string[];
  ignorePatterns: string[];
  includeUntracked: boolean;
}

/**
 * handle configuration
 */
export interface ProcessingConfig {
  defaultExtensions: string[];
  outputFormat: 'json' | 'markdown' | 'console';
}

/**
 * Git Configuration
 */
export interface GitConfig {
  ignorePatterns: string[];
  includeUntracked: boolean;
}

/**
 * application configuration
 */
export interface AppConfig {
  translation: TranslationConfig;
  processing: ProcessingConfig;
  git: GitConfig;
}

/**
 * command line options
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

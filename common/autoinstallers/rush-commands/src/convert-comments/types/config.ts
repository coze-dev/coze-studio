/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

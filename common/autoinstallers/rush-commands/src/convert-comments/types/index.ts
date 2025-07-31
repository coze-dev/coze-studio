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
 * Source file language type
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
 * comment type
 */
export type CommentType = 'single-line' | 'multi-line' | 'documentation';

/**
 * source file information
 */
export interface SourceFile {
  path: string;
  content: string;
  language: SourceFileLanguage;
}

/**
 * multiline comment context information
 */
export interface MultiLineContext {
  isPartOfMultiLine: boolean;
  originalComment: ParsedComment;
  lineIndexInComment: number;
  totalLinesInComment: number;
}

/**
 * Chinese annotation information
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
 * Files containing Chinese annotations
 */
export interface FileWithComments {
  file: SourceFile;
  chineseComments: ChineseComment[];
}

/**
 * translation result
 */
export interface TranslationResult {
  original: string;
  translated: string;
  confidence: number;
}

/**
 * translation context
 */
export interface TranslationContext {
  language: string;
  nearbyCode?: string;
  commentType: CommentType;
}

/**
 * replace operation
 */
export interface Replacement {
  start: number;
  end: number;
  original: string;
  replacement: string;
}

/**
 * file replacement operation
 */
export interface ReplacementOperation {
  file: string;
  replacements: Replacement[];
}

/**
 * Document processing details
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
 * Processing statistics
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
 * processing report
 */
export interface ProcessingReport {
  stats: ProcessingStats;
  details: FileProcessingDetail[];
  duration: number;
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
 * Parsed annotations
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
 * Comment mode configuration
 */
export interface CommentPattern {
  single: RegExp;
  multiStart: RegExp;
  multiEnd: RegExp;
}

/**
 * Functional programming result type
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * translation error
 */
export class TranslationError extends Error {
  constructor(message: string, public originalComment: string) {
    super(message);
    this.name = 'TranslationError';
  }
}

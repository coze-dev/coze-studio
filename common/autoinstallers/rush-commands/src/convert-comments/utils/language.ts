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

import { SourceFileLanguage, CommentPattern } from '../types/index';

/**
 * Identify programming languages by file extension
 */
export const detectLanguage = (filePath: string): SourceFileLanguage => {
  const ext = filePath.toLowerCase().split('.').pop();

  const languageMap: Record<string, SourceFileLanguage> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    go: 'go',
    md: 'markdown',
    txt: 'text',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'ini',
    config: 'ini',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    py: 'python',
    css: 'css',
    scss: 'css',
    sass: 'css',
    less: 'css',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    java: 'java',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    cxx: 'cpp',
    cc: 'cpp',
    hpp: 'cpp',
    cs: 'csharp',
    thrift: 'thrift',
  };

  return languageMap[ext || ''] || 'other';
};

/**
 * Filter files by file extension
 */
export const filterFilesByExtensions = (
  files: string[],
  extensions: string[],
): string[] => {
  if (extensions.length === 0) {
    // Default supported text file extensions
    const defaultExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.go',
      '.md',
      '.txt',
      '.json',
      '.yaml',
      '.yml',
      '.toml',
      '.ini',
      '.conf',
      '.config',
      '.sh',
      '.bash',
      '.zsh',
      '.fish',
      '.py',
      '.css',
      '.scss',
      '.sass',
      '.less',
      '.html',
      '.htm',
      '.xml',
      '.php',
      '.rb',
      '.rs',
      '.java',
      '.c',
      '.h',
      '.cpp',
      '.cxx',
      '.cc',
      '.hpp',
      '.cs',
      '.thrift',
    ];
    return files.filter(file =>
      defaultExtensions.some(ext => file.toLowerCase().endsWith(ext)),
    );
  }

  return files.filter(file => {
    const lowerFile = file.toLowerCase();
    return extensions.some(ext => {
      const lowerExt = ext.toLowerCase();
      // If the extension is already numbered, use it directly; otherwise, add a dot.
      const extWithDot = lowerExt.startsWith('.') ? lowerExt : `.${lowerExt}`;
      return lowerFile.endsWith(extWithDot);
    });
  });
};

/**
 * Obtain comment modes for different programming languages
 */
export const getCommentPatterns = (
  language: SourceFileLanguage,
): CommentPattern | null => {
  const commentPatterns: Record<SourceFileLanguage, CommentPattern> = {
    typescript: {
      single: /(?:^|[^:])\s*\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    javascript: {
      single: /(?:^|[^:])\s*\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    go: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    markdown: {
      single: /<!--(.*)-->/g,
      multiStart: /<!--/g,
      multiEnd: /-->/g,
    },
    text: {
      single: /^(.*)$/gm, // Every line of a text file can be a comment
      multiStart: /^/g,
      multiEnd: /$/g,
    },
    json: {
      single: /\/\/(.*)$/gm, // JSON usually doesn't support comments, but some tools do
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    yaml: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // YAML does not support multi-line comments
      multiEnd: /^$/g,
    },
    toml: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // TOML does not support multi-line comments
      multiEnd: /^$/g,
    },
    ini: {
      single: /[;#](.*)$/gm, // INI file support; and #as comments
      multiStart: /^$/g, // INI does not support multi-line comments
      multiEnd: /^$/g,
    },
    shell: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // Shell scripts do not support multi-line comments
      multiEnd: /^$/g,
    },
    python: {
      single: /#(.*)$/gm,
      multiStart: /"""[\s\S]*?$/gm, // Python docstring
      multiEnd: /[\s\S]*?"""/gm,
    },
    css: {
      single: /^$/g, // CSS does not support single-line comments
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    html: {
      single: /^$/g, // HTML does not support single-line comments
      multiStart: /<!--/g,
      multiEnd: /-->/g,
    },
    xml: {
      single: /^$/g, // XML does not support single-line comments
      multiStart: /<!--/g,
      multiEnd: /-->/g,
    },
    php: {
      single: /(?:\/\/|#)(.*)$/gm, // PHP supports//and #as single-line comments
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    ruby: {
      single: /#(.*)$/gm,
      multiStart: /=begin/g,
      multiEnd: /=end/g,
    },
    rust: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    java: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    c: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    cpp: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    csharp: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    thrift: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
    other: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g,
    },
  };

  return commentPatterns[language] || null;
};

/**
 * Check if the file supports processing
 */
export const isSupportedFile = (filePath: string): boolean => {
  const language = detectLanguage(filePath);
  return language !== 'other';
};

/**
 * Get the MIME type of the file (used to determine whether it is a text file)
 */
export const isTextFile = (filePath: string): boolean => {
  const textExtensions = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.go',
    '.md',
    '.txt',
    '.json',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.html',
    '.htm',
    '.xml',
    '.yaml',
    '.yml',
    '.toml',
    '.ini',
    '.conf',
    '.config',
    '.sh',
    '.bash',
    '.zsh',
    '.fish',
    '.py',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.hpp',
    '.cs',
    '.php',
    '.rb',
    '.rs',
    '.kt',
    '.swift',
    '.dart',
    '.scala',
    '.thrift',
  ];

  return textExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
};

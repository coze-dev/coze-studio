import { SourceFileLanguage, CommentPattern } from '../types/index';

/**
 * 根据文件扩展名识别编程语言
 */
export const detectLanguage = (filePath: string): SourceFileLanguage => {
  const ext = filePath.toLowerCase().split('.').pop();

  const languageMap: Record<string, SourceFileLanguage> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'go': 'go',
    'md': 'markdown',
    'txt': 'text',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'ini',
    'config': 'ini',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'py': 'python',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'less': 'css',
    'html': 'html',
    'htm': 'html',
    'xml': 'xml',
    'php': 'php',
    'rb': 'ruby',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'h': 'c',
    'cpp': 'cpp',
    'cxx': 'cpp',
    'cc': 'cpp',
    'hpp': 'cpp',
    'cs': 'csharp'
  };

  return languageMap[ext || ''] || 'other';
};

/**
 * 根据文件扩展名过滤文件
 */
export const filterFilesByExtensions = (
  files: string[],
  extensions: string[]
): string[] => {
  if (extensions.length === 0) {
    // 默认支持的文本文件扩展名
    const defaultExtensions = [
      '.ts', '.tsx', '.js', '.jsx', '.go', '.md', '.txt', '.json',
      '.yaml', '.yml', '.toml', '.ini', '.conf', '.config',
      '.sh', '.bash', '.zsh', '.fish', '.py', '.css', '.scss', '.sass', '.less',
      '.html', '.htm', '.xml', '.php', '.rb', '.rs', '.java', '.c', '.h',
      '.cpp', '.cxx', '.cc', '.hpp', '.cs'
    ];
    return files.filter(file =>
      defaultExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
  }

  return files.filter(file => {
    const lowerFile = file.toLowerCase();
    return extensions.some(ext => {
      const lowerExt = ext.toLowerCase();
      // 如果扩展名已经有点号，直接使用；否则添加点号
      const extWithDot = lowerExt.startsWith('.') ? lowerExt : `.${lowerExt}`;
      return lowerFile.endsWith(extWithDot);
    });
  });
};

/**
 * 获取不同编程语言的注释模式
 */
export const getCommentPatterns = (language: SourceFileLanguage): CommentPattern | null => {
  const commentPatterns: Record<SourceFileLanguage, CommentPattern> = {
    typescript: {
      single: /(?:^|[^:])\s*\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    javascript: {
      single: /(?:^|[^:])\s*\/\/(.*)$/gm,
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
    },
    text: {
      single: /^(.*)$/gm, // 文本文件每行都可能是注释
      multiStart: /^/g,
      multiEnd: /$/g
    },
    json: {
      single: /\/\/(.*)$/gm, // JSON通常不支持注释，但一些工具支持
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    yaml: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // YAML不支持多行注释
      multiEnd: /^$/g
    },
    toml: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // TOML不支持多行注释
      multiEnd: /^$/g
    },
    ini: {
      single: /[;#](.*)$/gm, // INI文件支持 ; 和 # 作为注释
      multiStart: /^$/g, // INI不支持多行注释
      multiEnd: /^$/g
    },
    shell: {
      single: /#(.*)$/gm,
      multiStart: /^$/g, // Shell脚本不支持多行注释
      multiEnd: /^$/g
    },
    python: {
      single: /#(.*)$/gm,
      multiStart: /"""[\s\S]*?$/gm, // Python docstring
      multiEnd: /[\s\S]*?"""/gm
    },
    css: {
      single: /^$/g, // CSS不支持单行注释
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    html: {
      single: /^$/g, // HTML不支持单行注释
      multiStart: /<!--/g,
      multiEnd: /-->/g
    },
    xml: {
      single: /^$/g, // XML不支持单行注释
      multiStart: /<!--/g,
      multiEnd: /-->/g
    },
    php: {
      single: /(?:\/\/|#)(.*)$/gm, // PHP支持 // 和 # 作为单行注释
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    ruby: {
      single: /#(.*)$/gm,
      multiStart: /=begin/g,
      multiEnd: /=end/g
    },
    rust: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    java: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    c: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    cpp: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    csharp: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    },
    other: {
      single: /\/\/(.*)$/gm,
      multiStart: /\/\*/g,
      multiEnd: /\*\//g
    }
  };

  return commentPatterns[language] || null;
};

/**
 * 检查文件是否支持处理
 */
export const isSupportedFile = (filePath: string): boolean => {
  const language = detectLanguage(filePath);
  return language !== 'other';
};

/**
 * 获取文件的MIME类型（用于判断是否为文本文件）
 */
export const isTextFile = (filePath: string): boolean => {
  const textExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.go', '.md', '.txt', '.json',
    '.css', '.scss', '.sass', '.less', '.html', '.htm', '.xml',
    '.yaml', '.yml', '.toml', '.ini', '.conf', '.config',
    '.sh', '.bash', '.zsh', '.fish', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs',
    '.php', '.rb', '.rs', '.kt', '.swift', '.dart', '.scala'
  ];

  return textExtensions.some(ext =>
    filePath.toLowerCase().endsWith(ext)
  );
};

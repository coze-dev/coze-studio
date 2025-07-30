import {
  Replacement,
  ReplacementOperation,
  SourceFile,
  ChineseComment,
  TranslationResult,
} from '../types/index';
import { tryCatch } from '../utils/fp';


/**
 * 检查字符串是否包含中文字符
 */
const containsChinese = (text: string): boolean => {
  return /[\u4e00-\u9fff]/.test(text);
};

/**
 * 保持注释的原始格式，支持逐行翻译多行注释
 */
export const preserveCommentFormat = (
  originalComment: string,
  translatedComment: string,
  commentType: 'single-line' | 'multi-line',
): string => {
  if (commentType === 'single-line') {
    // 保持单行注释的前缀空格和注释符 - 支持多种语言
    let match = originalComment.match(/^(\s*\/\/\s*)/); // JavaScript/TypeScript style
    if (match) {
      return match[1] + translatedComment.trim();
    }
    
    match = originalComment.match(/^(\s*#\s*)/); // Shell/Python/YAML style
    if (match) {
      return match[1] + translatedComment.trim();
    }
    
    match = originalComment.match(/^(\s*;\s*)/); // Some config files
    if (match) {
      return match[1] + translatedComment.trim();
    }
    
    // 如果无法识别，尝试从原始内容推断
    if (originalComment.includes('#')) {
      const hashMatch = originalComment.match(/^(\s*#\s*)/);
      return (hashMatch ? hashMatch[1] : '# ') + translatedComment.trim();
    }
    
    // 默认使用 JavaScript 风格
    return '// ' + translatedComment.trim();
  }

  if (commentType === 'multi-line') {
    const lines = originalComment.split('\n');
    
    if (lines.length === 1) {
      // 单行多行注释 /* ... */ 或 /** ... */
      const startMatch = originalComment.match(/^(\s*\/\*\*?\s*)/);
      const endMatch = originalComment.match(/(\s*\*\/\s*)$/);
      
      let prefix = '/* ';
      let suffix = ' */';
      
      if (startMatch) {
        prefix = startMatch[1];
      }
      
      if (endMatch) {
        suffix = endMatch[1];
      }
      
      return prefix + translatedComment.trim() + suffix;
    } else {
      // 多行注释 - 需要逐行处理
      return processMultiLineComment(originalComment, translatedComment);
    }
  }

  return translatedComment;
};

/**
 * 处理多行注释，逐行翻译含中文的行，保持其他行原样
 */
export const processMultiLineComment = (
  originalComment: string,
  translatedContent: string,
): string => {
  const originalLines = originalComment.split('\n');
  
  // 提取每行的注释内容（去除 /** * 等前缀）
  const extractedLines = originalLines.map(line => {
    // 匹配不同类型的注释行
    if (line.match(/^\s*\/\*\*?\s*/)) {
      // 开始行: /** 或 /*
      return { prefix: line.match(/^\s*\/\*\*?\s*/)![0], content: line.replace(/^\s*\/\*\*?\s*/, '') };
    } else if (line.match(/^\s*\*\/\s*$/)) {
      // 结束行: */
      return { prefix: line.match(/^\s*\*\/\s*$/)![0], content: '' };
    } else if (line.match(/^\s*\*\s*/)) {
      // 中间行: * content
      const match = line.match(/^(\s*\*\s*)(.*)/);
      return { prefix: match![1], content: match![2] };
    } else {
      // 其他情况
      return { prefix: '', content: line };
    }
  });
  
  // 收集需要翻译的行
  const linesToTranslate = extractedLines
    .map((line, index) => ({ index, content: line.content }))
    .filter(item => containsChinese(item.content));
  
  // 如果没有中文内容，返回原始注释
  if (linesToTranslate.length === 0) {
    return originalComment;
  }
  
  // 解析翻译结果 - 假设翻译服务按顺序返回翻译后的行
  const translatedLines = translatedContent.split('\n');
  const translations = new Map<number, string>();
  
  // 将翻译结果映射到对应的行
  linesToTranslate.forEach((item, transIndex) => {
    if (transIndex < translatedLines.length) {
      translations.set(item.index, translatedLines[transIndex].trim());
    }
  });
  
  // 重建注释，保持原始结构
  return extractedLines
    .map((line, index) => {
      if (translations.has(index)) {
        // 使用翻译内容，保持原始前缀
        return line.prefix + translations.get(index);
      } else {
        // 保持原样
        return originalLines[index];
      }
    })
    .join('\n');
};

/**
 * 创建替换操作
 */
export const createReplacements = (
  file: SourceFile,
  comments: ChineseComment[],
  translations: TranslationResult[],
): Replacement[] => {
  const replacements: Replacement[] = [];

  comments.forEach((comment, index) => {
    const translation = translations[index];
    if (!translation) return;

    if (comment.multiLineContext?.isPartOfMultiLine) {
      // 处理多行注释中的单行
      const replacement = createMultiLineReplacement(file, comment, translation);
      if (replacement) {
        replacements.push(replacement);
      }
    } else {
      // 处理普通注释（单行注释或整个多行注释）
      const replacement = createRegularReplacement(file, comment, translation);
      if (replacement) {
        replacements.push(replacement);
      }
    }
  });

  return replacements;
};

/**
 * 为多行注释中的单行创建替换操作
 */
const createMultiLineReplacement = (
  file: SourceFile,
  comment: ChineseComment,
  translation: TranslationResult,
): Replacement | null => {
  const lines = file.content.split('\n');
  const lineIndex = comment.startLine - 1;
  
  if (lineIndex >= lines.length) return null;
  
  const originalLine = lines[lineIndex];
  
  // 查找这一行中中文内容的位置
  const cleanedContent = comment.content;
  
  // 更精确地查找中文内容在原始行中的位置
  const commentContentRegex = new RegExp(cleanedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const contentMatch = originalLine.match(commentContentRegex);
  
  if (!contentMatch) {
    return null;
  }
  
  const chineseStart = contentMatch.index!;
  const chineseEnd = chineseStart + contentMatch[0].length;
  
  // 计算在整个文件中的位置
  let start = 0;
  for (let i = 0; i < lineIndex; i++) {
    start += lines[i].length + 1; // +1 for newline
  }
  start += chineseStart;
  
  const end = start + (chineseEnd - chineseStart);
  
  return {
    start,
    end,
    original: originalLine.substring(chineseStart, chineseEnd),
    replacement: translation.translated,
  };
};

/**
 * 为普通注释创建替换操作
 */
const createRegularReplacement = (
  file: SourceFile,
  comment: ChineseComment,
  translation: TranslationResult,
): Replacement | null => {
  const lines = file.content.split('\n');
  const startLineIndex = comment.startLine - 1;
  const endLineIndex = comment.endLine - 1;

  // 计算原始注释在文件中的精确位置
  let start = 0;
  for (let i = 0; i < startLineIndex; i++) {
    start += lines[i].length + 1; // +1 for newline
  }
  start += comment.startColumn;

  let end = start;
  if (comment.startLine === comment.endLine) {
    // 同一行
    end = start + (comment.endColumn - comment.startColumn);
  } else {
    // 跨行 - 重新计算end位置
    end = 0;
    for (let i = 0; i < endLineIndex; i++) {
      end += lines[i].length + 1; // +1 for newline
    }
    end += comment.endColumn;
  }

  // 获取原始注释文本
  const originalText = file.content.substring(start, end);

  // 应用格式保持
  const formattedTranslation = preserveCommentFormat(
    originalText,
    translation.translated,
    comment.type === 'documentation' ? 'multi-line' : comment.type,
  );

  return {
    start,
    end,
    original: originalText,
    replacement: formattedTranslation,
  };
};

/**
 * 应用替换操作到文本内容
 */
export const applyReplacements = (
  content: string,
  replacements: Replacement[],
): string => {
  // 按位置倒序排列，避免替换后位置偏移
  const sortedReplacements = [...replacements].sort(
    (a, b) => b.start - a.start,
  );

  let result = content;

  for (const replacement of sortedReplacements) {
    const before = result.substring(0, replacement.start);
    const after = result.substring(replacement.end);
    result = before + replacement.replacement + after;
  }

  return result;
};

/**
 * 替换文件中的注释
 */
export const replaceCommentsInFile = async (
  file: SourceFile,
  operation: ReplacementOperation,
): Promise<{ success: boolean; error?: string }> => {
  return tryCatch(async () => {
    const fs = await import('fs/promises');

    // 应用替换
    const newContent = applyReplacements(
      file.content,
      operation.replacements,
    );

    // 写入文件
    await fs.writeFile(file.path, newContent, 'utf-8');

    return { success: true };
  }).then(result => {
    if (result.success) {
      return result.data;
    } else {
      return {
        success: false,
        error:
          result.error instanceof Error
            ? result.error.message
            : String(result.error),
      };
    }
  });
};

/**
 * 批量替换多个文件
 */
export const batchReplaceFiles = async (
  operations: ReplacementOperation[],
): Promise<
  Array<{
    file: string;
    success: boolean;
    error?: string;
  }>
> => {
  const results = await Promise.allSettled(
    operations.map(async operation => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(operation.file, 'utf-8');
      const sourceFile: SourceFile = {
        path: operation.file,
        content,
        language: 'other', // 临时值，实际应该检测
      };

      const result = await replaceCommentsInFile(
        sourceFile,
        operation,
      );
      return { file: operation.file, ...result };
    }),
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        file: operations[index].file,
        success: false,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      };
    }
  });
};

/**
 * 验证替换操作
 */
export const validateReplacements = (
  content: string,
  replacements: Replacement[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 检查位置是否有效
  replacements.forEach((replacement, index) => {
    if (replacement.start < 0 || replacement.end > content.length) {
      errors.push(`Replacement ${index}: Invalid position range`);
    }

    if (replacement.start >= replacement.end) {
      errors.push(
        `Replacement ${index}: Start position must be less than end position`,
      );
    }

    // 检查原文是否匹配
    const actualText = content.substring(replacement.start, replacement.end);
    if (actualText !== replacement.original) {
      errors.push(`Replacement ${index}: Original text mismatch`);
    }
  });

  // 检查是否有重叠
  const sortedReplacements = [...replacements].sort(
    (a, b) => a.start - b.start,
  );
  for (let i = 0; i < sortedReplacements.length - 1; i++) {
    const current = sortedReplacements[i];
    const next = sortedReplacements[i + 1];

    if (current.end > next.start) {
      errors.push(
        `Overlapping replacements at positions ${current.start}-${current.end} and ${next.start}-${next.end}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
};

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

import {
  Replacement,
  ReplacementOperation,
  SourceFile,
  ChineseComment,
  TranslationResult,
} from '../types/index';
import { tryCatch } from '../utils/fp';


/**
 * Check if string contains Chinese characters
 */
const containsChinese = (text: string): boolean => {
  return /[\u4e00-\u9fff]/.test(text);
};

/**
 * Maintain the original format of comments and support line-by-line translation of multi-line comments
 */
export const preserveCommentFormat = (
  originalComment: string,
  translatedComment: string,
  commentType: 'single-line' | 'multi-line',
): string => {
  if (commentType === 'single-line') {
    // Keep single-line comments prefixed with spaces and comment characters - supports multiple languages
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
    
    // If not recognized, try to infer from the original content
    if (originalComment.includes('#')) {
      const hashMatch = originalComment.match(/^(\s*#\s*)/);
      return (hashMatch ? hashMatch[1] : '# ') + translatedComment.trim();
    }
    
    // JavaScript style is used by default
    return '// ' + translatedComment.trim();
  }

  if (commentType === 'multi-line') {
    const lines = originalComment.split('\n');
    
    if (lines.length === 1) {
      // Single-line multi-line comment/*... */or/**... */
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
      // Multi-line comments - requires line-by-line processing
      return processMultiLineComment(originalComment, translatedComment);
    }
  }

  return translatedComment;
};

/**
 * Process multi-line comments, translate lines containing Chinese line by line, and keep other lines as they are
 */
export const processMultiLineComment = (
  originalComment: string,
  translatedContent: string,
): string => {
  const originalLines = originalComment.split('\n');
  
  // Extract comments for each line (remove prefixes such as /** * )other prefixes)
  const extractedLines = originalLines.map(line => {
    Match different types of comment linesifferent types of comment lines
    if (line.match(/^\s*\/\*\*?\s*/)) {
      // Start line:/** or/*
      return { prefix: line.match(/^\s*\/\*\*?\s*/)![0], content: line.replace(/^\s*\/\*\*?\s*/, '') };
    } else if (line.match(/^\s*\*\/\s*$/)) {
      // End line: */
      return { prefix: line.match(/^\s*\*\/\s*$/)![0], content: '' };
    } else if (line.match(/^\s*\*\s*/)) {
      // Middle line: * content
      const match = line.match(/^(\s*\*\s*)(.*)/);
      return { prefix: match![1], content: match![2] };
    } else {
      // Other situations
      return { prefix: '', content: line };
    }
  });
  
  // Collect lines that need to be translated
  const linesToTranslate = extractedLines
    .map((line, index) => ({ index, content: line.content }))
    .filter(item => containsChinese(item.content));
  
  // If there is no Chinese content, return the original comment
  if (linesToTranslate.length === 0) {
    return originalComment;
  }
  
  // Parse translation results - assuming the translation service returns translated rows in order
  const translatedLines = translatedContent.split('\n');
  const translations = new Map<number, string>();
  
  // Map the translation result to the corresponding line
  linesToTranslate.forEach((item, transIndex) => {
    if (transIndex < translatedLines.length) {
      translations.set(item.index, translatedLines[transIndex].trim());
    }
  });
  
  // Rebuild the annotation, maintaining the original structure
  return extractedLines
    .map((line, index) => {
      if (translations.has(index)) {
        // Use translated content, keeping the original prefix
        return line.prefix + translations.get(index);
      } else {
        // Leave it as it is
        return originalLines[index];
      }
    })
    .join('\n');
};

/**
 * Create replacement operation
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
      // Handling single lines in multi-line comments
      const replacement = createMultiLineReplacement(file, comment, translation);
      if (replacement) {
        replacements.push(replacement);
      }
    } else {
      // Processing normal comments (single-line comments or entire multi-line comments)
      const replacement = createRegularReplacement(file, comment, translation);
      if (replacement) {
        replacements.push(replacement);
      }
    }
  });

  return replacements;
};

/**
 * Create a replacement operation for a single line in a multi-line comment
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
  
  // Find the location of Chinese content in this line
  const cleanedContent = comment.content;
  
  // Find the position of Chinese content in the original line more accurately
  const commentContentRegex = new RegExp(cleanedContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const contentMatch = originalLine.match(commentContentRegex);
  
  if (!contentMatch) {
    return null;
  }
  
  const chineseStart = contentMatch.index!;
  const chineseEnd = chineseStart + contentMatch[0].length;
  
  // Calculate the position in the entire file
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
 * Create a replacement operation for a normal comment
 */
const createRegularReplacement = (
  file: SourceFile,
  comment: ChineseComment,
  translation: TranslationResult,
): Replacement | null => {
  const lines = file.content.split('\n');
  const startLineIndex = comment.startLine - 1;
  const endLineIndex = comment.endLine - 1;

  // Calculate the exact location of the original comment in the file
  let start = 0;
  for (let i = 0; i < startLineIndex; i++) {
    start += lines[i].length + 1; // +1 for newline
  }
  start += comment.startColumn;

  let end = start;
  if (comment.startLine === comment.endLine) {
    // same line
    end = start + (comment.endColumn - comment.startColumn);
  } else {
    // Interline recalculation of end position
    end = 0;
    for (let i = 0; i < endLineIndex; i++) {
      end += lines[i].length + 1; // +1 for newline
    }
    end += comment.endColumn;
  }

  // Get original comment text
  const originalText = file.content.substring(start, end);

  // application format retention
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
 * Apply a replacement operation to text content
 */
export const applyReplacements = (
  content: string,
  replacements: Replacement[],
): string => {
  // Arrange in reverse order to avoid position shift after replacement
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
 * Replace comments in the file
 */
export const replaceCommentsInFile = async (
  file: SourceFile,
  operation: ReplacementOperation,
): Promise<{ success: boolean; error?: string }> => {
  return tryCatch(async () => {
    const fs = await import('fs/promises');

    // Application Replacement
    const newContent = applyReplacements(
      file.content,
      operation.replacements,
    );

    // Write file
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
 * Batch replacement of multiple files
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
        language: 'other', // Temporary value, which should actually be checked
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
 * Verify replacement operation
 */
export const validateReplacements = (
  content: string,
  replacements: Replacement[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if the location is valid
  replacements.forEach((replacement, index) => {
    if (replacement.start < 0 || replacement.end > content.length) {
      errors.push(`Replacement ${index}: Invalid position range`);
    }

    if (replacement.start >= replacement.end) {
      errors.push(
        `Replacement ${index}: Start position must be less than end position`,
      );
    }

    // Check if the original text matches
    const actualText = content.substring(replacement.start, replacement.end);
    if (actualText !== replacement.original) {
      errors.push(`Replacement ${index}: Original text mismatch`);
    }
  });

  // Check for overlap
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

import {
  SourceFile,
  ChineseComment,
  ParsedComment,
  FileWithComments,
  CommentType,
  MultiLineContext
} from '../types/index';
import { getCommentPatterns } from '../utils/language';
import { containsChinese, cleanCommentText } from '../utils/chinese';

/**
 * 检查指定位置是否在字符串字面量内部
 */
const isInsideStringLiteral = (line: string, position: number): boolean => {
  let insideDoubleQuote = false;
  let insideSingleQuote = false;
  let insideBacktick = false;
  let escapeNext = false;

  for (let i = 0; i < position; i++) {
    const char = line[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !insideSingleQuote && !insideBacktick) {
      insideDoubleQuote = !insideDoubleQuote;
    } else if (char === "'" && !insideDoubleQuote && !insideBacktick) {
      insideSingleQuote = !insideSingleQuote;
    } else if (char === '`' && !insideDoubleQuote && !insideSingleQuote) {
      insideBacktick = !insideBacktick;
    }
  }

  return insideDoubleQuote || insideSingleQuote || insideBacktick;
};

/**
 * 解析单行注释
 */
const parseSingleLineComments = (
  content: string,
  pattern: RegExp,
  language?: string,
): ParsedComment[] => {
  const comments: ParsedComment[] = [];
  const lines = content.split('\n');

  // 添加安全检查
  const maxLines = 5000; // 降低到5000行
  if (lines.length > maxLines) {
    console.warn(`⚠️  文件行数过多 (${lines.length}行)，跳过单行注释解析`);
    return comments;
  }

  lines.forEach((line, index) => {
    pattern.lastIndex = 0; // 重置正则表达式索引
    let match: RegExpExecArray | null;

    // 查找所有匹配，但只保留不在字符串内的
    let matchCount = 0;
    const maxMatches = 100; // 限制每行最多匹配100次
    let lastIndex = 0;
    
    while ((match = pattern.exec(line)) !== null) {
      // 防止无限循环的多重保护
      matchCount++;
      if (matchCount > maxMatches) {
        console.warn(`⚠️  单行匹配次数过多，中断处理: ${line.substring(0, 50)}...`);
        break;
      }
      
      // 检查 lastIndex 是否前进，防止无限循环
      if (pattern.global) {
        if (pattern.lastIndex <= lastIndex) {
          // 如果 lastIndex 没有前进，手动前进一位避免无限循环
          pattern.lastIndex = lastIndex + 1;
          if (pattern.lastIndex >= line.length) {
            break;
          }
        }
        lastIndex = pattern.lastIndex;
      }
      
      if (match[1]) {
        const commentContent = match[1];
        let commentStartIndex = match.index!;
        let commentLength = 2; // 默认为 //

        // 根据语言确定注释符号
        if (
          language === 'yaml' ||
          language === 'toml' ||
          language === 'shell' ||
          language === 'python' ||
          language === 'ruby'
        ) {
          commentStartIndex = line.indexOf('#', match.index!);
          commentLength = 1; // # 长度为 1
        } else if (language === 'ini') {
          // INI 文件可能使用 # 或 ;
          const hashIndex = line.indexOf('#', match.index!);
          const semicolonIndex = line.indexOf(';', match.index!);
          if (
            hashIndex >= 0 &&
            (semicolonIndex < 0 || hashIndex < semicolonIndex)
          ) {
            commentStartIndex = hashIndex;
            commentLength = 1;
          } else if (semicolonIndex >= 0) {
            commentStartIndex = semicolonIndex;
            commentLength = 1;
          }
        } else if (language === 'php') {
          // PHP 可能使用 // 或 #
          const slashIndex = line.indexOf('//', match.index!);
          const hashIndex = line.indexOf('#', match.index!);
          if (slashIndex >= 0 && (hashIndex < 0 || slashIndex < hashIndex)) {
            commentStartIndex = slashIndex;
            commentLength = 2;
          } else if (hashIndex >= 0) {
            commentStartIndex = hashIndex;
            commentLength = 1;
          }
        } else {
          // JavaScript/TypeScript/Go/Java/C/C++/C# style
          commentStartIndex = line.indexOf('//', match.index!);
          commentLength = 2;
        }

        const startColumn = commentStartIndex;
        const endColumn = startColumn + commentLength + commentContent.length;

        // 检查注释开始位置是否在字符串内部
        if (
          commentStartIndex >= 0 &&
          !isInsideStringLiteral(line, commentStartIndex)
        ) {
          comments.push({
            content: commentContent,
            startLine: index + 1,
            endLine: index + 1,
            startColumn,
            endColumn,
            type: 'single-line',
          });
        }
      }

      // 防止无限循环
      if (!pattern.global) break;
    }
  });

  return comments;
};

/**
 * 解析多行注释
 */
const parseMultiLineComments = (
  content: string,
  startPattern: RegExp,
  endPattern: RegExp,
): ParsedComment[] => {
  const comments: ParsedComment[] = [];
  const lines = content.split('\n');
  let inComment = false;
  let commentStart: { line: number; column: number } | null = null;
  let commentLines: string[] = [];

  // 添加安全检查
  const maxLines = 5000; // 降低到5000行
  if (lines.length > maxLines) {
    console.warn(`⚠️  文件行数过多 (${lines.length}行)，跳过多行注释解析`);
    return comments;
  }

  // 添加处理计数器，防止无限循环
  let processedLines = 0;
  const maxProcessedLines = 10000;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // 防止无限处理
    processedLines++;
    if (processedLines > maxProcessedLines) {
      console.warn(`⚠️  处理行数超限，中断解析`);
      break;
    }

    if (!inComment) {
      startPattern.lastIndex = 0;
      const startMatch = startPattern.exec(line);

      if (startMatch && !isInsideStringLiteral(line, startMatch.index!)) {
        inComment = true;
        commentStart = { line: lineIndex + 1, column: startMatch.index! };

        // 检查是否在同一行结束
        endPattern.lastIndex = startMatch.index! + startMatch[0].length;
        const endMatch = endPattern.exec(line);

        if (endMatch) {
          // 单行多行注释
          const commentContent = line.substring(
            startMatch.index! + startMatch[0].length,
            endMatch.index!,
          );

          comments.push({
            content: commentContent,
            startLine: lineIndex + 1,
            endLine: lineIndex + 1,
            startColumn: startMatch.index!,
            endColumn: endMatch.index! + endMatch[0].length,
            type: 'multi-line',
          });

          inComment = false;
          commentStart = null;
        } else {
          // 多行注释开始
          const commentContent = line.substring(
            startMatch.index! + startMatch[0].length,
          );
          commentLines = [commentContent];
        }
      }
    } else {
      // 在多行注释中
      endPattern.lastIndex = 0;
      const endMatch = endPattern.exec(line);

      if (endMatch) {
        // 多行注释结束
        const commentContent = line.substring(0, endMatch.index!);
        commentLines.push(commentContent);


        comments.push({
          content: commentLines.join('\n'),
          startLine: commentStart!.line,
          endLine: lineIndex + 1,
          startColumn: commentStart!.column,
          endColumn: endMatch.index! + endMatch[0].length,
          type: 'multi-line',
        });

        inComment = false;
        commentStart = null;
        commentLines = [];
      } else {
        // 继续多行注释
        commentLines.push(line);
      }
    }
  }

  return comments;
};

/**
 * 解析文件中的所有注释
 */
export const parseComments = (file: SourceFile): ParsedComment[] => {
  const patterns = getCommentPatterns(file.language);
  if (!patterns) return [];

  const singleLineComments = parseSingleLineComments(
    file.content,
    patterns.single,
    file.language,
  );
  const multiLineComments = parseMultiLineComments(
    file.content,
    patterns.multiStart,
    patterns.multiEnd,
  );

  return [...singleLineComments, ...multiLineComments];
};

/**
 * 过滤包含中文的注释，对多行注释进行逐行处理
 */
export const filterChineseComments = (
  comments: ParsedComment[],
  language?: string,
): ChineseComment[] => {
  const result: ChineseComment[] = [];
  
  for (const comment of comments) {
    if (comment.type === 'multi-line' && comment.content.includes('\n')) {
      // 多行注释：逐行处理
      const multiLineResults = processMultiLineCommentForChinese(comment, language);
      result.push(...multiLineResults);
    } else if (containsChinese(comment.content)) {
      // 单行注释或单行多行注释
      result.push({
        ...comment,
        content: cleanCommentText(
          comment.content,
          comment.type === 'documentation' ? 'multi-line' : comment.type,
          language,
        ),
      });
    }
  }
  
  return result;
};

/**
 * 处理多行注释，提取含中文的行作为独立的注释单元
 */
const processMultiLineCommentForChinese = (
  comment: ParsedComment,
  language?: string,
): ChineseComment[] => {
  const lines = comment.content.split('\n');
  const result: ChineseComment[] = [];
  
  lines.forEach((line, lineIndex) => {
    const cleanedLine = cleanCommentText(line, 'multi-line', language);
    
    if (containsChinese(cleanedLine)) {
      // 计算这一行在原始文件中的位置
      const actualLineNumber = comment.startLine + lineIndex;
      
      // 创建一个表示这一行的注释对象
      const lineComment: ChineseComment = {
        content: cleanedLine,
        startLine: actualLineNumber,
        endLine: actualLineNumber,
        startColumn: 0, // 这个值需要更精确计算，但对于多行注释内的行处理暂时用0
        endColumn: line.length,
        type: 'multi-line',
        // 添加多行注释的元数据，用于后续处理
        multiLineContext: {
          isPartOfMultiLine: true,
          originalComment: comment,
          lineIndexInComment: lineIndex,
          totalLinesInComment: lines.length
        }
      };
      
      result.push(lineComment);
    }
  });
  
  return result;
};

/**
 * 检测文件中的中文注释
 */
export const detectChineseInFile = (file: SourceFile): ChineseComment[] => {
  try {
    // 简单防护：跳过大文件
    if (file.content.length > 500000) {
      // 500KB
      console.warn(
        `⚠️  跳过大文件: ${file.path} (${file.content.length} 字符)`,
      );
      return [];
    }

    // 简单防护：跳过行数过多的文件
    const lines = file.content.split('\n');
    if (lines.length > 10000) {
      console.warn(`⚠️  跳过多行文件: ${file.path} (${lines.length} 行)`);
      return [];
    }

    const allComments = parseComments(file);
    return filterChineseComments(allComments, file.language);
  } catch (error) {
    console.error(`❌ 文件处理失败: ${file.path} - ${error}`);
    return [];
  }
};

/**
 * 批量检测多个文件中的中文注释
 */
export const detectChineseInFiles = (files: SourceFile[]): FileWithComments[] => {
  const results: FileWithComments[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.path.split('/').pop() || file.path;

    console.log(`🔍 检测进度: ${i + 1}/${files.length} (当前: ${fileName})`);

    try {
      const chineseComments = detectChineseInFile(file);

      if (chineseComments.length > 0) {
        results.push({
          file,
          chineseComments,
        });
      }

      console.log(
        `✅ 完成: ${fileName} (找到 ${chineseComments.length} 条中文注释)`,
      );
    } catch (error) {
      console.error(`❌ 处理文件失败: ${fileName} - ${error}`);
      // 继续处理其他文件
      continue;
    }
  }

  return results;
};

/**
 * 获取注释统计信息
 */
export const getCommentStats = (files: SourceFile[]): {
  totalFiles: number;
  filesWithComments: number;
  totalComments: number;
  chineseComments: number;
  commentsByType: Record<CommentType, number>;
} => {
  let totalComments = 0;
  let chineseComments = 0;
  let filesWithComments = 0;
  const commentsByType: Record<CommentType, number> = {
    'single-line': 0,
    'multi-line': 0,
    'documentation': 0
  };

  files.forEach(file => {
    const allComments = parseComments(file);
    const chineseCommentsInFile = filterChineseComments(allComments, file.language);

    if (chineseCommentsInFile.length > 0) {
      filesWithComments++;
    }

    totalComments += allComments.length;
    chineseComments += chineseCommentsInFile.length;

    chineseCommentsInFile.forEach(comment => {
      commentsByType[comment.type]++;
    });
  });

  return {
    totalFiles: files.length,
    filesWithComments,
    totalComments,
    chineseComments,
    commentsByType
  };
};

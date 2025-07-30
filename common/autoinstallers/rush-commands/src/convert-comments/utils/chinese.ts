/**
 * 中文字符的Unicode范围正则表达式
 */
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const CHINESE_EXTRACT_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]+/g;

/**
 * 检测文本是否包含中文字符
 */
export const containsChinese = (text: string): boolean => {
  return CHINESE_REGEX.test(text);
};

/**
 * 提取文本中的中文部分
 */
export const extractChineseParts = (text: string): string[] => {
  return text.match(CHINESE_EXTRACT_REGEX) || [];
};

/**
 * 计算文本中中文字符的数量
 */
export const countChineseCharacters = (text: string): number => {
  const matches = text.match(CHINESE_EXTRACT_REGEX);
  if (!matches) return 0;

  return matches.reduce((count, match) => count + match.length, 0);
};

/**
 * 检测文本是否主要由中文组成
 */
export const isPrimarilyChinese = (text: string, threshold: number = 0.5): boolean => {
  const totalLength = text.length;
  if (totalLength === 0) return false;

  const chineseLength = countChineseCharacters(text);
  return chineseLength / totalLength >= threshold;
};

/**
 * 清理注释文本，移除注释符号和多余空格
 */
export const cleanCommentText = (
  text: string, 
  commentType: 'single-line' | 'multi-line', 
  language?: string
): string => {
  let cleaned = text;

  if (commentType === 'single-line') {
    // 根据语言类型移除不同的单行注释符号
    switch (language) {
      case 'yaml':
      case 'toml':
      case 'shell':
      case 'python':
      case 'ruby':
        cleaned = cleaned.replace(/^#\s*/, '');
        break;
      case 'ini':
        cleaned = cleaned.replace(/^[;#]\s*/, '');
        break;
      case 'php':
        cleaned = cleaned.replace(/^(?:\/\/|#)\s*/, '');
        break;
      default:
        // JavaScript/TypeScript/Go/Java/C/C++/C# style
        cleaned = cleaned.replace(/^\/\/\s*/, '');
    }
  } else if (commentType === 'multi-line') {
    // 根据语言类型移除不同的多行注释符号
    switch (language) {
      case 'html':
      case 'xml':
      case 'markdown':
        cleaned = cleaned.replace(/^<!--\s*/, '').replace(/\s*-->$/, '');
        break;
      case 'python':
        cleaned = cleaned.replace(/^"""\s*/, '').replace(/\s*"""$/, '');
        break;
      case 'ruby':
        cleaned = cleaned.replace(/^=begin\s*/, '').replace(/\s*=end$/, '');
        break;
      default:
        // JavaScript/TypeScript/Go/Java/C/C++/C#/CSS style
        cleaned = cleaned.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '');
        // 移除每行开头的 * 符号
        cleaned = cleaned.replace(/^\s*\*\s?/gm, '');
    }
  }

  // 移除多余的空格和换行
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * 验证翻译结果是否有效
 */
export const isValidTranslation = (original: string, translated: string): boolean => {
  // 基本验证
  if (!translated || translated.trim().length === 0) {
    return false;
  }

  // 检查是否还包含中文（可能翻译失败）
  if (containsChinese(translated)) {
    return false;
  }

  // 检查长度是否合理（翻译后的文本不应该比原文长太多）
  if (translated.length > original.length * 3) {
    return false;
  }

  return true;
};

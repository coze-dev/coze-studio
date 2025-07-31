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
 * Unicode Range Regular Expressions for Chinese Characters
 */
const CHINESE_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const CHINESE_EXTRACT_REGEX =
  /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]+/g;

/**
 * Detect whether the text contains Chinese characters
 */
export const containsChinese = (text: string): boolean => {
  return CHINESE_REGEX.test(text);
};

/**
 * Extract the Chinese part of the text
 */
export const extractChineseParts = (text: string): string[] => {
  return text.match(CHINESE_EXTRACT_REGEX) || [];
};

/**
 * Count the number of Chinese characters in a text
 */
export const countChineseCharacters = (text: string): number => {
  const matches = text.match(CHINESE_EXTRACT_REGEX);
  if (!matches) return 0;

  return matches.reduce((count, match) => count + match.length, 0);
};

/**
 * Detect whether the text is mainly composed of Chinese
 */
export const isPrimarilyChinese = (
  text: string,
  threshold: number = 0.5,
): boolean => {
  const totalLength = text.length;
  if (totalLength === 0) return false;

  const chineseLength = countChineseCharacters(text);
  return chineseLength / totalLength >= threshold;
};

/**
 * Clean up comment text, remove comment symbols and extra spaces
 */
export const cleanCommentText = (
  text: string,
  commentType: 'single-line' | 'multi-line',
  language?: string,
): string => {
  let cleaned = text;

  if (commentType === 'single-line') {
    // Remove different single-line comment symbols based on language type
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
    // Remove different multi-line comment symbols based on language type
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
        // Remove the * symbol at the beginning of each line
        cleaned = cleaned.replace(/^\s*\*\s?/gm, '');
    }
  }

  // Remove extra spaces and newlines
  cleaned = cleaned.trim();

  return cleaned;
};

/**
 * Verify whether the translation result is valid.
 */
export const isValidTranslation = (
  original: string,
  translated: string,
): boolean => {
  // basic verification
  if (!translated || translated.trim().length === 0) {
    return false;
  }

  // Check if Chinese is also included (translation may fail)
  if (containsChinese(translated)) {
    return false;
  }

  // Check if the length is reasonable (the translated text should not be much longer than the original).
  if (translated.length > original.length * 3) {
    return false;
  }

  return true;
};

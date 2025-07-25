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
 * html白名单，防止XSS攻击
 */

// 默认允许的HTML标签白名单
const DEFAULT_ALLOWED_TAGS = [
  'img',
  'table',
  'colgroup',
  'col',
  'tbody',
  'thead',
  'tfoot',
  'tr',
  'td',
  'th',
  'br',
  'p',
];

/**
 * 转义HTML，只允许白名单中的标签
 * @param unsafe 不安全的HTML字符串
 * @param allowedTags 允许的HTML标签数组，默认为DEFAULT_ALLOWED_TAGS
 * @returns 转义后的HTML字符串
 */
export function escapeHtml(
  unsafe: string,
  allowedTags: string[] = DEFAULT_ALLOWED_TAGS,
): string {
  if (!unsafe) {
    return '';
  }

  // 构建正则表达式模式
  const allowedTagsPattern = allowedTags.join('|');
  const tagRegex = new RegExp(
    `<(?!(${allowedTagsPattern})\\b[^>]*>|\\/(?:${allowedTagsPattern})>)`,
    'g',
  );

  return unsafe.replace(tagRegex, '&lt;');
}

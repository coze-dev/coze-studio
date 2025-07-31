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
 * HTML whitelist to prevent XSS attacks
 */

// Whitelist of HTML tags allowed by default
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
 * Escape HTML, allowing only whitelisted tags
 * @param unsafe HTML string
 * @Param allowedTags Array of HTML tags allowed, default to DEFAULT_ALLOWED_TAGS
 * @Returns the escaped HTML string
 */
export function escapeHtml(
  unsafe: string,
  allowedTags: string[] = DEFAULT_ALLOWED_TAGS,
): string {
  if (!unsafe) {
    return '';
  }

  // Building regular expression patterns
  const allowedTagsPattern = allowedTags.join('|');
  const tagRegex = new RegExp(
    `<(?!(${allowedTagsPattern})\\b[^>]*>|\\/(?:${allowedTagsPattern})>)`,
    'g',
  );

  return unsafe.replace(tagRegex, '&lt;');
}

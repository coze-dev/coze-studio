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

import ImageFail from '../assets/image-fail.png';

export const transSliceContentOutput = (
  content: string,
  ignoreImg = false,
): string => {
  /**
   * 1. Handling img tags
   * 2. Remove redundant div/span/br tags
   */
  const imgPattern = /<img.*?(?:>|\/>)/gi;
  const divSPattern = /<div[^>]*>/g;
  const divEPattern = /<\/div>/g;
  const spanSPattern = /<span[^>]*>/g;
  const spanEPattern = /<\/span>/g;
  let newContent = content
    .replace(divSPattern, '\n')
    .replace(divEPattern, '')
    .replace(spanSPattern, '')
    .replace(spanEPattern, '')
    .replace(/<br>/g, '\n');
  if (!ignoreImg) {
    newContent = newContent.replaceAll(imgPattern, v => {
      const toeKeyPattern = /data-tos-key=[\'\"]?([^\'\"]*)[\'\"]?/i;
      const srcPattern = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
      const tosKeyMatches = v.match(toeKeyPattern);
      const srcMatches = v.match(srcPattern);
      if (tosKeyMatches?.[1]) {
        return `<img src="" data-tos-key="${tosKeyMatches?.[1]}" >`;
      }
      return `<img src="${srcMatches?.[1] || ''}" >`;
    });
  }
  return newContent;
};

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const LIMIT_SIZE = 20 * 1024 * 1024;
export const isValidSize = (size: number) => LIMIT_SIZE > size;

export const transSliceContentInput = (content: string): string => {
  const newContent = content.replaceAll('\n', '<br>');
  return newContent;
};

export const transSliceContentInputWithSave = (content: string) => {
  // Replace < br > with\ n
  const contentWithNewLine = content.replace(/<br>/g, '\n');

  // Replace < span > with empty
  const finalContent = contentWithNewLine
    .replace(/<span>/g, '')
    .replace(/<\/span>/g, '');
  return finalContent;
};

export const imageOnLoad = (e: Event) => {
  if (e.target) {
    (e.target as HTMLImageElement).style.width = 'auto';
    (e.target as HTMLImageElement).style.height = 'auto';
    (e.target as HTMLImageElement).style.background = 'transparent';
  }
};

export const imageOnError = (e: Event) => {
  if (e.target) {
    (e.target as HTMLImageElement).src = ImageFail;
  }
};

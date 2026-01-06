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

// 将数字转换成百分数, 向上取整
export const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) {
    return '-';
  }

  let formatted = '';
  if (num >= 10000) {
    formatted = (num / 10000).toFixed(1);
    // 如果小数点后一位是0，则移除小数点和0
    if (formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    // 添加w并返回结果
    formatted = `${formatted}w`;
  } else {
    formatted = num.toString();
  }

  return formatted;
};

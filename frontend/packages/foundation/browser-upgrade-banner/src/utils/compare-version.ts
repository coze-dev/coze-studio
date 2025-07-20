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
 
export function compareVersion(version1: string, version2: string): number {
  // 将版本号字符串分割成数字数组，这里使用map(Number)确保转换为数字类型
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  // 计算出最长的版本号长度
  const maxLength = Math.max(parts1.length, parts2.length);

  // 逐个比较版本号中的每个部分
  for (let i = 0; i < maxLength; i++) {
    // 如果某个版本号在这个位置没有对应的数字，则视为0
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;

    // 比较两个版本号的当前部分
    if (part1 > part2) {
      return 1;
    }
    if (part1 < part2) {
      return -1;
    }
  }

  // 如果所有部分都相等，则版本号相等
  return 0;
}

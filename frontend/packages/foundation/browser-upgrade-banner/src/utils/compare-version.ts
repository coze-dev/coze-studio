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
  // Split the version number string into an array of numbers, here use map (Number) to ensure conversion to numeric type
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  // Calculate the longest version length
  const maxLength = Math.max(parts1.length, parts2.length);

  // Compare each part of the version number one by one
  for (let i = 0; i < maxLength; i++) {
    // If a version number does not have a corresponding number at this position, it is treated as 0.
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;

    // Compare the current parts of two version numbers
    if (part1 > part2) {
      return 1;
    }
    if (part1 < part2) {
      return -1;
    }
  }

  // If all parts are equal, then the version numbers are equal
  return 0;
}

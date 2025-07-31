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

export enum Size {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
}
const sizeB = 1024;
const sizeKB = 1024 * sizeB;
const sizeMB = 1024 * sizeKB;
const sizeGB = 1024 * sizeMB;

export const formatFixed = (v: number) => v.toFixed(2);

export const formatSize = (v: number): string => {
  if (v > 0 && v < sizeB) {
    return `${formatFixed(v)}${Size.B}`;
  } else if (v < sizeKB) {
    return `${formatFixed(v / sizeB)}${Size.KB}`;
  } else if (v < sizeMB) {
    return `${formatFixed(v / sizeKB)}${Size.MB}`;
  } else if (v < sizeGB) {
    return `${formatFixed(v / sizeMB)}${Size.MB}`;
  }
  return `${formatFixed(v / sizeMB)}${Size.MB}`;
};

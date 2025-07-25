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
 
export const getRangeDirection = (range: Range) => {
  const position = range.compareBoundaryPoints(Range.START_TO_END, range);

  if (position === 0) {
    return 'none'; // 选区起点和终点相同，即没有选择文本
  }

  return position === -1 ? 'backward' : 'forward';
};

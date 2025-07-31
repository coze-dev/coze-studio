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

import { LineShowResult, type LineData } from './types';

// eslint-disable-next-line complexity
export function getLineShowResult<Data extends LineData>({
  level,
  data,
}: {
  level: number;
  data: Data;
}): Array<LineShowResult> {
  const isRootWithChildren = level === 0 && (data.children || []).length > 0;
  const isRootWithoutChildren =
    level === 0 && (data.children || []).length === 0;
  const isChildWithChildren = level > 0 && (data.children || []).length > 0;
  const isChildWithoutChildren =
    level > 0 && (data.children || []).length === 0;
  const res: Array<LineShowResult> = (data.helpLineShow || []).map(item =>
    item ? LineShowResult.HelpLineBlock : LineShowResult.EmptyBlock,
  );

  if (isRootWithChildren) {
    res.push(LineShowResult.RootWithChildren);
  } else if (!isRootWithoutChildren) {
    // The root node does not need a display line, only non-root nodes need auxiliary lines.
    if (isChildWithChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChildWithChildren);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChildWithChildren);
      } else {
        res.push(LineShowResult.FullChildWithChildren);
      }
    } else if (isChildWithoutChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChild);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChild);
      } else {
        res.push(LineShowResult.FullChild);
      }
    }
  }
  return res;
}

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

import type { TreeNodeCustomData } from '../../custom-tree-node/type';

/**
 * Supplementary readonly metas
 */
export const addReadOnlyData = (params: {
  treeData: TreeNodeCustomData[];
  data: TreeNodeCustomData[];
  isBatch: boolean;
}): TreeNodeCustomData[] => {
  const { treeData, data, isBatch } = params;
  // Batch added to data [0] .children
  if (isBatch) {
    const readonlyMetas = treeData?.[0].children?.filter(d => d.readonly);
    if (readonlyMetas?.length) {
      const [one, ...rest] = data;
      return [
        {
          ...one,
          children: [
            ...(one.children ?? []),
            ...readonlyMetas,
          ] as TreeNodeCustomData[],
        },
        ...rest,
      ];
    }
    // Single processing data
  } else {
    const readonlyMetas = treeData?.filter(d => d.readonly);
    if (readonlyMetas?.length) {
      return [...data, ...readonlyMetas];
    }
  }
  return data;
};

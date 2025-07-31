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

import { useState, useEffect, type MutableRefObject } from 'react';

import { type Tree } from '@coze-arch/bot-semi';

import { type ExpressionEditorTreeNode } from '@/expression-editor';

import { generateUniqueId, getSearchValue, useLatest } from '../../shared';
import { type InterpolationContent } from './types';

// Force the Tree component to re-render after the data update
function useTreeRefresh(filteredVariableTree: ExpressionEditorTreeNode[]) {
  const [treeRefreshKey, setTreeRefreshKey] = useState('');

  useEffect(() => {
    setTreeRefreshKey(generateUniqueId());
  }, [filteredVariableTree]);

  return treeRefreshKey;
}

// Search after the Tree component is re-rendered
// eslint-disable-next-line max-params
function useTreeSearch(
  treeRefreshKey: string,
  treeRef: MutableRefObject<Tree | null>,
  interpolationContent: InterpolationContent | undefined,
  callback: () => void,
) {
  const interpolationContentRef = useLatest(interpolationContent);

  useEffect(() => {
    if (treeRef.current && interpolationContentRef.current) {
      const searchValue = getSearchValue(
        interpolationContentRef.current.textBefore,
      );
      treeRef.current.search(searchValue);
      callback();
    }
  }, [treeRefreshKey, interpolationContent]);
}

export { useTreeRefresh, useTreeSearch };

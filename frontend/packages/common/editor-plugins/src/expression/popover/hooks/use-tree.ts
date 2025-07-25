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

import { generateUniqueId, getSearchValue, useLatest } from '../../shared';
import { type ExpressionEditorTreeNode } from '../../core';
import { type CompletionContext } from './types';

// 在数据更新后，强制 Tree 组件重新渲染
function useTreeRefresh(filteredVariableTree: ExpressionEditorTreeNode[]) {
  const [treeRefreshKey, setTreeRefreshKey] = useState('');

  useEffect(() => {
    setTreeRefreshKey(generateUniqueId());
  }, [filteredVariableTree]);

  return treeRefreshKey;
}

// Tree 组件重新渲染后进行搜索
// eslint-disable-next-line max-params
function useTreeSearch(
  treeRefreshKey: string,
  treeRef: MutableRefObject<Tree | null>,
  context: CompletionContext | undefined,
  callback: () => void,
) {
  const contextRef = useLatest(context);

  useEffect(() => {
    if (treeRef.current && contextRef.current) {
      const searchValue = getSearchValue(contextRef.current.textBefore);
      treeRef.current.search(searchValue);
      callback();
    }
  }, [treeRefreshKey, context]);
}

export { useTreeRefresh, useTreeSearch };

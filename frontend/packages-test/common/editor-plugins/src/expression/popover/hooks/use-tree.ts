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

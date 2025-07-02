import { useState, useEffect, type MutableRefObject } from 'react';

import { type Tree } from '@coze-arch/bot-semi';

import { type ExpressionEditorTreeNode } from '@/expression-editor';

import { generateUniqueId, getSearchValue, useLatest } from '../../shared';
import { type InterpolationContent } from './types';

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

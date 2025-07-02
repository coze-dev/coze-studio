import { useMemo } from 'react';

import { type ExpressionEditorTreeNode } from '@/expression-editor';

import { getSearchValue } from '../../shared';
import { type InterpolationContent } from './types';

function useFilteredVariableTree(
  interpolationContent: InterpolationContent | undefined,
  prunedVariableTree: ExpressionEditorTreeNode[],
) {
  return useMemo(() => {
    if (!prunedVariableTree) {
      return [];
    }

    if (!interpolationContent) {
      return prunedVariableTree;
    }

    const searchValue = getSearchValue(interpolationContent.textBefore);

    return prunedVariableTree.filter(variable =>
      variable.label.startsWith(searchValue),
    );
  }, [interpolationContent, prunedVariableTree]);
}

export { useFilteredVariableTree };

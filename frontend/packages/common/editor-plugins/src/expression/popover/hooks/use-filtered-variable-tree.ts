import { useMemo } from 'react';

import { getSearchValue } from '../../shared';
import { type ExpressionEditorTreeNode } from '../../core';
import { type CompletionContext } from './types';

function useFilteredVariableTree(
  context: CompletionContext | undefined,
  drilledVariableTree: ExpressionEditorTreeNode[],
) {
  return useMemo(() => {
    if (!drilledVariableTree) {
      return [];
    }

    if (!context) {
      return drilledVariableTree;
    }

    const searchValue = getSearchValue(context.textBefore);

    return drilledVariableTree.filter(variable =>
      variable.label.startsWith(searchValue),
    );
  }, [context, drilledVariableTree]);
}

export { useFilteredVariableTree };

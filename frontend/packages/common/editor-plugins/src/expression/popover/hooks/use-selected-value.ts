import { useMemo } from 'react';

import { ExpressionEditorParserBuiltin } from '../../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../../core';

function useSelectedValue(
  interpolationText: string | undefined,
  variableTree: ExpressionEditorTreeNode[],
) {
  return useMemo(() => {
    if (!interpolationText) {
      return;
    }

    const segments =
      ExpressionEditorParserBuiltin.toSegments(interpolationText);

    if (!segments) {
      return;
    }

    const treeBrach = ExpressionEditorTreeHelper.matchTreeBranch({
      tree: variableTree,
      segments,
    });

    if (!treeBrach) {
      return;
    }

    return treeBrach[treeBrach.length - 1];
  }, [interpolationText, variableTree]);
}

export { useSelectedValue };

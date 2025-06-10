import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@flow-lang-sdk/editor/preset-expression';

import { ExpressionEditorParserBuiltin } from '@/expression-editor/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '@/expression-editor';

import { type InterpolationContent } from './types';

function usePrunedVariableTree(
  editor: ExpressionEditorAPI | undefined,
  variableTree: ExpressionEditorTreeNode[],
  interpolationContent: InterpolationContent | undefined,
): ExpressionEditorTreeNode[] {
  return useMemo(() => {
    if (!editor || !interpolationContent) {
      return [];
    }

    const segments = ExpressionEditorParserBuiltin.toSegments(
      interpolationContent.textBefore,
    );

    if (!segments) {
      return [];
    }

    const prunedVariableTree = ExpressionEditorTreeHelper.pruning({
      tree: variableTree,
      segments,
    });

    return prunedVariableTree;
  }, [editor, variableTree, interpolationContent]);
}

export { usePrunedVariableTree };

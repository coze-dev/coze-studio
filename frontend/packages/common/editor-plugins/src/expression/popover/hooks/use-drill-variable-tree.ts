import { useMemo } from 'react';

import { type EditorAPI as ExpressionEditorAPI } from '@flow-lang-sdk/editor/preset-expression';

import { ExpressionEditorParserBuiltin } from '../../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../../core';
import { type CompletionContext } from './types';

function useDrillVariableTree(
  editor: ExpressionEditorAPI | undefined,
  variableTree: ExpressionEditorTreeNode[],
  context: CompletionContext | undefined,
): ExpressionEditorTreeNode[] {
  return useMemo(() => {
    if (!editor || !context) {
      return [];
    }

    const segments = ExpressionEditorParserBuiltin.toSegments(
      context.textBefore,
    );

    if (!segments) {
      return [];
    }

    const prunedVariableTree = ExpressionEditorTreeHelper.pruning({
      tree: variableTree,
      segments,
    });

    return prunedVariableTree;
  }, [editor, variableTree, context]);
}

export { useDrillVariableTree };

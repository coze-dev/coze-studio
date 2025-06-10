import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';

import { ExpressionEditorParserBuiltin } from '../../core/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '../../core';
import { type CompletionContext } from './types';

function isEmpty(value: unknown) {
  return !value || !Array.isArray(value) || value.length === 0;
}

function useEmptyContent(
  fullVariableTree: ExpressionEditorTreeNode[] | undefined,
  variableTree: ExpressionEditorTreeNode[] | undefined,
  context: CompletionContext | undefined,
) {
  return useMemo(() => {
    if (!context) {
      return;
    }

    if (isEmpty(fullVariableTree)) {
      if (context.textBefore === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }
      return;
    }

    if (isEmpty(variableTree)) {
      if (context.text === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }

      const segments = ExpressionEditorParserBuiltin.toSegments(
        context.textBefore,
      );

      if (!segments) {
        return;
      }

      const matchTreeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
        tree: fullVariableTree ?? [],
        segments,
      });
      const isMatchedButEmpty = matchTreeBranch && matchTreeBranch.length !== 0;

      if (isMatchedButEmpty) {
        return I18n.t('workflow_variable_refer_no_sub_variable');
      }

      return;
    }
    return;
  }, [fullVariableTree, variableTree, context]);
}

export { useEmptyContent };

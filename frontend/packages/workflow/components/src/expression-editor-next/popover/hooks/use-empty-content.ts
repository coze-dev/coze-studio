import { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';

import { ExpressionEditorParserBuiltin } from '@/expression-editor/parser';
import {
  ExpressionEditorTreeHelper,
  type ExpressionEditorTreeNode,
} from '@/expression-editor';

import { type InterpolationContent } from './types';

function isEmpty(value: unknown) {
  return !value || !Array.isArray(value) || value.length === 0;
}

function useEmptyContent(
  fullVariableTree: ExpressionEditorTreeNode[] | undefined,
  variableTree: ExpressionEditorTreeNode[] | undefined,
  interpolationContent: InterpolationContent | undefined,
) {
  return useMemo(() => {
    if (!interpolationContent) {
      return;
    }

    if (isEmpty(fullVariableTree)) {
      if (interpolationContent.textBefore === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }
      return;
    }

    if (isEmpty(variableTree)) {
      if (interpolationContent.text === '') {
        return I18n.t('workflow_variable_refer_no_input');
      }

      const segments = ExpressionEditorParserBuiltin.toSegments(
        interpolationContent.textBefore,
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
  }, [fullVariableTree, variableTree, interpolationContent]);
}

export { useEmptyContent };

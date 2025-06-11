import { useMemo } from 'react';

import {
  type ExpressionEditorTreeNode,
  ExpressionEditorTreeHelper,
} from '@coze-workflow/components';
import { useWorkflowNode } from '@coze-workflow/base';

import { useNodeAvailableVariablesWithNode } from '../../hooks';
import { convertInputs } from './utils/convert-inputs';

const useInputs = (): {
  name: string;
  keyPath?: string[];
}[] => {
  const workflowNode = useWorkflowNode();
  const inputs = workflowNode?.inputParameters ?? [];
  return convertInputs(inputs);
};

export const useVariableTree = (): ExpressionEditorTreeNode[] => {
  const variables = useNodeAvailableVariablesWithNode();
  const inputs = useInputs();
  const availableVariables = ExpressionEditorTreeHelper.findAvailableVariables({
    variables,
    inputs,
  });
  const variableTree =
    ExpressionEditorTreeHelper.createVariableTree(availableVariables);
  return variableTree;
};

export const useParseText = (
  text?: string | (() => string),
): string | undefined =>
  useMemo((): string | undefined => {
    if (!text) {
      return;
    }
    if (typeof text === 'string') {
      return text;
    }
    if (typeof text === 'function') {
      return text();
    }
    return;
  }, [text]);

/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react';

import {
  type ExpressionEditorTreeNode,
  ExpressionEditorTreeHelper,
} from '@coze-workflow/components';
import { useWorkflowNode } from '@coze-workflow/base';

import { convertInputs } from '@/form-extensions/setters/expression-editor/utils/convert-inputs';
import { useNodeAvailableVariablesWithNode } from '@/form-extensions/hooks';

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

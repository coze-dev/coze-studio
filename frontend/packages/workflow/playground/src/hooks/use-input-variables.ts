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

import { useState } from 'react';

import { useThrottleEffect } from 'ahooks';
import { ExpressionEditorTreeHelper } from '@coze-workflow/components';
import {
  type InputVariable,
  useWorkflowNode,
  type ViewVariableType,
} from '@coze-workflow/base';

import { useNodeAvailableVariablesWithNode } from '../form-extensions/hooks';

const useInputs = (): {
  name: string;
  id?: string;
  keyPath?: string[];
}[] => {
  const workflowNode = useWorkflowNode();
  const inputs = (
    (workflowNode?.inputParameters || []) as {
      name: string;
      input: {
        content: {
          keyPath: string[];
        };
      };
    }[]
  ).map(i => ({
    ...i,
    keyPath: [...(i.input?.content?.keyPath || [])], // Deep copy
  }));
  return inputs;
};

export const useInputVariables = (props?: {
  needNullName?: boolean;
  needNullType?: boolean;
}) => {
  const { needNullName = true, needNullType = false } = props ?? {};
  const availableVariables = useNodeAvailableVariablesWithNode();
  const inputs = useInputs();
  const inputsWithVariables = ExpressionEditorTreeHelper.findAvailableVariables(
    {
      variables: availableVariables,
      inputs,
    },
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _variables = inputsWithVariables.map((v, i) => ({
    name: v.name,
    id: inputs[i].id,
    type: v.variable?.type as ViewVariableType,
    index: i,
  }));

  const [variables, setVariables] = useState<InputVariable[]>();

  useThrottleEffect(
    () => {
      setVariables(
        _variables.filter(
          v =>
            (needNullName ? true : !!v.name) &&
            (needNullType ? true : !!v.type),
        ),
      );
    },
    [
      _variables.map(d => `${d.name}${d.type}`).join(''),
      needNullName,
      needNullType,
    ],
    {
      wait: 300,
    },
  );

  return variables;
};

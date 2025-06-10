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
    keyPath: [...(i.input?.content?.keyPath || [])], // 深拷贝一份
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

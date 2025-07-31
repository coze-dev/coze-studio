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

import isFunction from 'lodash-es/isFunction';
import { isNil } from 'lodash-es';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import {
  type InputValueVO,
  type RefExpressionContent,
  ValueExpressionType,
  ViewVariableType,
  StandardNodeType,
  isUserInputStartParams,
  useWorkflowNode,
  ValueExpression,
  type VariableTypeDTO,
  type VariableMetaDTO,
} from '@coze-workflow/base';

import { useAvailableNodeVariables } from '../hooks/use-available-node-variables';
import { type VariableTagProps } from './variable-tag-list';
/** Check if the form value is illegal. If required is set, but there is no relevant value, return true. */
const checkInvalid = (
  inputDef: VariableMetaDTO | undefined,
  input: ValueExpression,
) => {
  let invalid = false;
  // Make invalid judgments only for required parameters
  if (inputDef?.required) {
    if (input?.type === ValueExpressionType.REF) {
      // The reference must exist in the keypath array
      invalid = !input?.content?.keyPath?.length;
    } else if (input?.type === ValueExpressionType.LITERAL) {
      // The specified value must contain content
      invalid = input?.content === '' || isNil(input?.content);
    }
  }
  return invalid;
};

export function useInputParametersVariableTags(
  inputParameters: InputValueVO[] | Record<string, InputValueVO['input']> = [],
): VariableTagProps[] {
  const node = useCurrentEntity();
  const variableService = useAvailableNodeVariables(node);
  const { registry } = useWorkflowNode();

  // The inputParameters of some templates in the back end are set to null, and the logic of the default assignment [] will not be reached at this time.
  // It will cause the following related methods to report an error, such as Object.entries (inputParameters), here is a bottom line
  if (!inputParameters) {
    return [];
  }

  if (!Array.isArray(inputParameters)) {
    inputParameters = Object.entries(inputParameters).map(([name, input]) => ({
      name,
      input,
    }));
  }

  const variableTags = inputParameters.map(
    ({ name, input }): VariableTagProps => {
      if (isFunction(registry?.meta?.getInputVariableTag)) {
        return registry?.meta?.getInputVariableTag(name, input, {
          variableService,
          node,
        });
      }

      let viewType: ViewVariableType | undefined;
      // Whether the variable is valid, it is valid by default
      let invalid = false;

      if (input?.rawMeta?.type) {
        viewType = input?.rawMeta?.type;
        // To refer to the parameters of the variable, you need to determine whether the variable exists to confirm that it is valid
        if (input && ValueExpression.isRef(input)) {
          const variable = variableService.getWorkflowVariableByKeyPath(
            (input?.content as RefExpressionContent)?.keyPath,
            { node, checkScope: true },
          );
          invalid = !variable;
        } else if (input && ValueExpression.isLiteral(input)) {
          invalid = input?.content === '' || isNil(input?.content);
        }
      } else if (input?.type === ValueExpressionType.LITERAL) {
        viewType = input?.rawMeta?.type || ViewVariableType.String;
      } else if (input?.type === ValueExpressionType.REF) {
        const variable = variableService.getWorkflowVariableByKeyPath(
          (input?.content as RefExpressionContent)?.keyPath,
          { node, checkScope: true },
        );

        viewType = variable?.viewType;
      }

      if (node.flowNodeType === StandardNodeType.SubWorkflow) {
        const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
        const detail = nodeData?.getNodeData<StandardNodeType.SubWorkflow>();
        const inputDef = detail?.inputsDefinition?.find(
          v => v.name === name,
        ) as VariableMetaDTO;
        invalid = checkInvalid(inputDef, input);

        // Parameter definition for subprocesses, preferentially using the type of parameter definition
        if (inputDef) {
          viewType = variableUtils.DTOTypeToViewType(
            inputDef.type as VariableTypeDTO,
            {
              arrayItemType: inputDef?.schema?.type,
              assistType: inputDef?.schema?.assistType,
            },
          );
        }
      }

      // Special handling for plug-in nodes
      if (node.flowNodeType === StandardNodeType.Api) {
        const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
        const detail = nodeData?.getNodeData<StandardNodeType.Api>();
        const inputDef = detail?.inputs?.find(
          v => v.name === name,
        ) as VariableMetaDTO;

        // If a parameter definition exists, the type of the parameter definition is preferred
        if (inputDef) {
          viewType = variableUtils.DTOTypeToViewType(inputDef.type, {
            arrayItemType: inputDef?.schema?.type,
            assistType: inputDef?.schema?.assistType,
          });
        }

        invalid = checkInvalid(inputDef, input);
      }

      // For BOT_USER_INPUT variables, set the default value type
      if (isUserInputStartParams(name) && !viewType) {
        viewType = ViewVariableType.String;
      }

      return {
        label: name,
        type: viewType,
        invalid,
      };
    },
  );

  return variableTags;
}

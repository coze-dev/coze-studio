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
/** 查看表单值是否非法，如果设置了必填，但是没有相关值，则返回 true */
const checkInvalid = (
  inputDef: VariableMetaDTO | undefined,
  input: ValueExpression,
) => {
  let invalid = false;
  // 只针对必填参数做 invalid 判断
  if (inputDef?.required) {
    if (input?.type === ValueExpressionType.REF) {
      // 引用必须存在 keypath 数组
      invalid = !input?.content?.keyPath?.length;
    } else if (input?.type === ValueExpressionType.LITERAL) {
      // 指定值必须存在 content
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

  // 后端有部分模板的 inputParameters 设置成了 null，此时不会走到默认赋值 [] 的逻辑
  // 会导致下边相关方法报错，例如 Object.entries(inputParameters)，这里做个兜底
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
      // 变量是否有效，默认有效
      let invalid = false;

      if (input?.rawMeta?.type) {
        viewType = input?.rawMeta?.type;
        // 引用变量的参数，需要判断变量是否存在，来确认有效
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

        // 子流程的参数定义，优先使用参数定义的类型
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

      // 针对插件节点特殊处理
      if (node.flowNodeType === StandardNodeType.Api) {
        const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
        const detail = nodeData?.getNodeData<StandardNodeType.Api>();
        const inputDef = detail?.inputs?.find(
          v => v.name === name,
        ) as VariableMetaDTO;

        // 如果存在参数定义，优先使用参数定义的类型
        if (inputDef) {
          viewType = variableUtils.DTOTypeToViewType(inputDef.type, {
            arrayItemType: inputDef?.schema?.type,
            assistType: inputDef?.schema?.assistType,
          });
        }

        invalid = checkInvalid(inputDef, input);
      }

      // 针对 BOT_USER_INPUT 变量，设置默认值类型
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

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
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  generateInputJsonSchema,
  variableUtils,
} from '@coze-workflow/variable';
import { generateField } from '@coze-workflow/test-run-next';
import {
  ValueExpressionType,
  type VariableMetaDTO,
  ViewVariableType,
} from '@coze-workflow/base';

/**
 * 将结构化的 input 转化为 Field
 * fork from packages/workflow/playground/src/components/test-run/utils/generate-test-form-fields.ts
 * 在全量前需要及时观测两者变动
 */

export const generateInputToField = (
  data: any,
  { node }: { node: WorkflowNodeEntity },
) => {
  if (data.input.type === ValueExpressionType.OBJECT_REF) {
    const dtoMeta = variableUtils.inputValueToDTO(
      data,
      node.context.variableService,
      { node },
    );
    const jsonSchema = generateInputJsonSchema(
      (dtoMeta || {}) as VariableMetaDTO,
      (v: any) => ({
        name: v?.name,
        ...(v?.input || {}),
      }),
    );
    return generateField({
      type: ViewVariableType.Object,
      title: data.title || data.label || data.name,
      name: data.name,
      description: data.description,
      required: data?.required,
      validateJsonSchema: jsonSchema,
      extra: {
        ['x-dto-meta']: dtoMeta,
      },
    });
  }

  const workflowVariable =
    node.context.variableService.getWorkflowVariableByKeyPath(
      data.input.content.keyPath,
      { node },
    );

  const viewVariable = workflowVariable?.viewMeta;
  const type: ViewVariableType =
    variableUtils.getValueExpressionViewType(
      data.input,
      node.context.variableService,
      { node },
    ) || ViewVariableType.String;
  const dtoMeta: VariableMetaDTO | undefined =
    variableUtils.getValueExpressionDTOMeta(
      data.input,
      node.context.variableService,
      { node },
    );

  const jsonSchema = generateInputJsonSchema(
    (dtoMeta || {}) as VariableMetaDTO,
  );
  return generateField({
    title: data.title || data.label || data.name,
    name: data.name,
    type,
    required: data?.required,
    description: data.description,
    validateJsonSchema: jsonSchema,
    /**
     * 部分创建变量的位置可以设置变量的默认值
     * 在引用变量的位置，通过 meta 拿到默认值作为表单默认值
     */
    defaultValue: viewVariable?.defaultValue,
    extra: {
      ['x-dto-meta']: dtoMeta,
    },
  });
};

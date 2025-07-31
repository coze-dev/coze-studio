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
 * Transform structured inputs into Fields
 * fork from packages/workflow/playground/src/components/test-run/utils/generate-test-form-fields.ts
 * It is necessary to observe the changes of the two in time before the full amount.
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
     * The location where the variable is partially created can set the default value of the variable
     * In the position of the reference variable, get the default value as the form default value through meta
     */
    defaultValue: viewVariable?.defaultValue,
    extra: {
      ['x-dto-meta']: dtoMeta,
    },
  });
};

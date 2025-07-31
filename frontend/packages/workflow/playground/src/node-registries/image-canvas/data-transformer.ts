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

import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import {
  variableUtils,
  type WorkflowVariableService,
} from '@coze-workflow/variable';
import {
  type InputValueDTO,
  type InputValueVO,
  type NodeDataDTO,
  type ValueExpression,
  type ValueExpressionDTO,
} from '@coze-workflow/base';

import { type FormData } from './types';
import { OUTPUTS } from './constants';

export const initialValue = {
  width: 1920,
  height: 1080,
  objects: [],
  backgroundColor: '#ffffffff',
  background: '#ffffffff',
  version: '6.0.0-rc2',
};

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: NodeDataDTO,
  context: NodeFormContext,
) => {
  if (!value) {
    return {
      inputs: {
        inputParameters: [],
        canvasSchema: JSON.stringify(initialValue),
      },
      outputs: OUTPUTS,
    };
  }
  if (value?.inputs?.inputParameters) {
    const { variableService } = context.playgroundContext;
    const variableDTOToVO = (
      dto?: ValueExpressionDTO,
    ): ValueExpression | undefined =>
      dto
        ? variableUtils?.valueExpressionToVO(
            dto,
            variableService as WorkflowVariableService,
          )
        : undefined;

    value.inputs.inputParameters = value.inputs.inputParameters.map(d => ({
      ...d,
      input: variableDTOToVO(d.input),
    })) as unknown as InputValueDTO[];
  }
  return value;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (
  value: FormData,
  context: NodeFormContext,
): NodeDataDTO => {
  if (value?.inputs?.inputParameters) {
    const { variableService } = context.playgroundContext;

    const variableVOToDTO = (
      name: string,
      vo: ValueExpression,
      id: string,
    ): InputValueDTO =>
      ({
        name,
        input: variableUtils.valueExpressionToDTO(
          vo as unknown as ValueExpression,
          variableService as WorkflowVariableService,
          {
            node: context?.node,
          },
        ),
        id,
      } as unknown as InputValueDTO);
    value.inputs.inputParameters = value.inputs.inputParameters.map(d =>
      variableVOToDTO(
        d.name ?? '',
        d.input,
        (d as unknown as { id: string }).id,
      ),
    ) as unknown as InputValueVO[];
  }
  return value as unknown as NodeDataDTO;
};

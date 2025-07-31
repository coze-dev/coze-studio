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

import { omit } from 'lodash-es';
import { nodeUtils } from '@coze-workflow/nodes';
import {
  type ValueExpression,
  type NodeDataDTO,
  ValueExpressionType,
} from '@coze-workflow/base';

import { getInputIsEmpty } from '../trigger-upsert/utils';
import { type FormData } from './types';
import { OUTPUTS } from './constants';

export const createTransformOnInit =
  outputs => (value: NodeDataDTO, context) => {
    if (!value) {
      return {
        inputs: {
          inputParameters: {
            triggerId: {
              type: ValueExpressionType.LITERAL,
            },
            userId: {
              type: ValueExpressionType.LITERAL,
            },
          },
        },
        outputs,
      };
    }
    const { inputs } = value;
    const inputParameters = {};

    (inputs?.inputParameters ?? []).forEach(item => {
      inputParameters[item.name as string] = nodeUtils.refExpressionDTOToVO(
        item,
        context,
      );
    });
    return {
      ...(value ?? {}),
      outputs: value?.outputs ?? outputs,
      inputs: {
        ...omit(value.inputs ?? {}, ['inputParameters']),
        inputParameters,
      },
    };
  };

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = createTransformOnInit(OUTPUTS);

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData, context): NodeDataDTO => {
  const { inputs, ...rest } = value;
  return {
    ...rest,
    inputs: {
      ...omit(value.inputs ?? {}, ['inputParameters']),
      inputParameters: Object.entries(inputs.inputParameters ?? {})
        .filter(([k, v]) => !!getInputIsEmpty(v))
        .map(([k, v]) => ({
          name: k,
          input: nodeUtils.refExpressionToValueDTO(
            v as unknown as ValueExpression,
            context,
          )?.input,
        })),
    },
  } as unknown as NodeDataDTO;
};

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

import { get, set } from 'lodash-es';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { VariableTypeDTO } from '@coze-workflow/base';

import { type FormData, type NodeDataDTO, TerminatePlan } from './types';

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: NodeDataDTO,
  { playgroundContext }: NodeFormContext,
) => {
  const { isChatflow } = playgroundContext.globalState;

  const finalValue = {
    ...value,
    inputs: {
      ...value?.inputs,
      content: get(value, 'inputs.content.value.content') as string | undefined,
    },
  };
  // Set the initial value of each field
  if (typeof finalValue.inputs.inputParameters === 'undefined') {
    set(finalValue, 'inputs.inputParameters', [{ name: 'output' }]);
  }
  if (typeof finalValue.inputs.streamingOutput === 'undefined') {
    set(finalValue, 'inputs.streamingOutput', isChatflow);
  }
  if (typeof finalValue.inputs.terminatePlan === 'undefined') {
    set(
      finalValue,
      'inputs.terminatePlan',
      isChatflow
        ? TerminatePlan.UseAnswerContent
        : TerminatePlan.ReturnVariables,
    );
  }
  return finalValue;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData) => {
  const nodeMeta = get(value, 'nodeMeta');
  const { terminatePlan, inputParameters, streamingOutput, content } =
    value.inputs ?? {};
  if (terminatePlan === TerminatePlan.ReturnVariables) {
    return {
      nodeMeta,
      inputs: {
        terminatePlan,
        inputParameters,
      },
    };
  }
  return {
    nodeMeta,
    inputs: {
      terminatePlan,
      streamingOutput,
      inputParameters,
      content: {
        type: VariableTypeDTO.string,
        value: {
          type: 'literal',
          content,
        },
      },
    },
  };
};

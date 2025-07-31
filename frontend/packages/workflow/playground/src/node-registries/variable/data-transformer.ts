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

import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import { ViewVariableType } from '@coze-workflow/nodes';
import { type InputValueDTO, type InputValueVO } from '@coze-workflow/base';

import { ModeValue } from './constants';

export function transformOnInit(value, context) {
  const { playgroundContext } = context;
  const { variableService } = playgroundContext;
  const { inputs = {}, outputs = [], nodeMeta } = value || {};

  const { mode = ModeValue.Set, inputParameters = [] } = inputs;

  // Processing input parameters
  const formattedInputParameters: InputValueVO[] = [];
  inputParameters.forEach(input => {
    if (!input) {
      return;
    }
    formattedInputParameters.push(
      variableUtils.inputValueToVO(input, variableService),
    );
  });

  const isSetMode = mode === ModeValue.Set;

  // Processing output parameters
  const formattedOutputs =
    outputs.length > 0
      ? outputs
      : [
          {
            key: nanoid(),
            name: isSetMode ? 'isSuccess' : '',
            type: isSetMode
              ? ViewVariableType.Boolean
              : ViewVariableType.String,
          },
        ];

  return {
    nodeMeta,
    mode,
    inputParameters: formattedInputParameters,
    outputs: formattedOutputs,
  };
}

export function transformOnSubmit(value, context) {
  const { playgroundContext, node } = context;
  const { variableService } = playgroundContext;

  const { nodeMeta, mode, inputParameters, outputs } = value;

  // Processing input parameters
  const formattedInputParameters: InputValueDTO[] = [];
  inputParameters.forEach(input => {
    if (!input) {
      return;
    }
    const inputValue = variableUtils.inputValueToDTO(input, variableService, {
      node,
    }) as InputValueDTO;
    formattedInputParameters.push(inputValue);
  });

  return {
    nodeMeta,
    inputs: {
      mode,
      inputParameters: formattedInputParameters,
    },
    outputs,
  };
}

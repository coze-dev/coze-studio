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

import { variableUtils } from '@coze-workflow/variable';
import { type NodeDataDTO, type VariableMetaDTO } from '@coze-workflow/base';

import { type FormData } from './types';
import { createDefaultOutputs } from './constants';

export const transformOnInit = (value: NodeDataDTO) => {
  const outputMetas = value?.outputs?.map(output =>
    variableUtils.dtoMetaToViewMeta(output as VariableMetaDTO),
  );
  const outputs =
    outputMetas && outputMetas.length > 0
      ? outputMetas.slice(0, 1)
      : createDefaultOutputs();

  if (outputs[0]) {
    outputs[0].name = 'output';
  }

  return {
    ...(value ?? {}),
    outputs,
  };
};

export const transformOnSubmit = (value: FormData): NodeDataDTO => {
  const outputs = (value.outputs?.length ? value.outputs : createDefaultOutputs())
    .slice(0, 1)
    .map(output =>
      variableUtils.viewMetaToDTOMeta({
        ...output,
        name: 'output',
      }),
    );

  return {
    ...value,
    outputs,
  } as unknown as NodeDataDTO;
};

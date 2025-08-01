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

import omit from 'lodash-es/omit';
import { type NodeDataDTO, type InputValueVO } from '@coze-workflow/base';

interface FormData {
  inputParameters: InputValueVO[];
}

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData): NodeDataDTO => {
  const formattedValue: Record<string, unknown> = {
    ...value,
    inputs: {
      inputParameters: value?.inputParameters || [],
    },
  };

  return omit(formattedValue, ['inputParameters']) as unknown as NodeDataDTO;
};

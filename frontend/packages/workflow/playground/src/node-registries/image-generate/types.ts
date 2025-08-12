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

import { type ViewVariableType, type InputValueVO } from '@coze-workflow/base';

export interface FormData {
  inputs: {
    modelSetting: ModelSetting;
    references: Reference[];
    prompt: {
      prompt: string;
      negative_prompt: string;
    };
    inputParameters: InputValueVO[];
  };
  outputs: Output[] | (() => Output[]);
}

export interface ModelSetting {
  model: number;
  custom_ratio: {
    width: number;
    height: number;
  };
  ddim_steps: number;
}

export interface Reference {
  preprocessor?: number;
  url?: string;
  weight?: number;
}

export interface Output {
  key: string;
  name: string;
  type: ViewVariableType;
}

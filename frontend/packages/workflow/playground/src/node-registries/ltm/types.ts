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

import {
  type ViewVariableMeta,
  type InputValueVO,
  type InputValueDTO,
  type VariableMetaDTO,
} from '@coze-workflow/base';

import type { NodeMeta } from '@/typing';

export interface FormData {
  nodeMeta: NodeMeta;
  inputs: {
    inputParameters: InputValueVO[];
    historySetting: {
      enableChatHistory: boolean;
      chatHistoryRound: number;
    };
  };
  outputs: ViewVariableMeta[];
}

export interface DTOData<
  InputType = InputValueDTO,
  OutputType = VariableMetaDTO,
> {
  nodeMeta: NodeMeta;
  inputs: {
    inputParameters?: InputType[];
  };
  outputs: OutputType[];
}

export type DTODataWhenInit = DTOData<InputValueVO, ViewVariableMeta>;

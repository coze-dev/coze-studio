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
  type InputValueVO,
  type InputValueDTO,
  type ValueExpressionDTO,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';

export enum TerminatePlan {
  ReturnVariables = 'returnVariables',
  UseAnswerContent = 'useAnswerContent',
}

export type FormData = {
  inputs: {
    inputParameters: InputValueVO[];
    terminatePlan?: TerminatePlan;
    streamingOutput?: boolean;
    content?: string;
  };
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export interface NodeDataDTO {
  inputs: {
    inputParameters?: InputValueDTO[];
    terminatePlan?: TerminatePlan;
    streamingOutput?: boolean;
    content?: ValueExpressionDTO;
  };
}

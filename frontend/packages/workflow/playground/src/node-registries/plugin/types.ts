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

import { type ApiNodeDetailDTO } from '@coze-workflow/nodes';
import {
  type InputValueVO,
  type ViewVariableMeta,
  type VariableMetaDTO,
  type InputValueDTO,
  type BatchVO,
  type BatchDTO,
  type ValueExpression,
} from '@coze-workflow/base';

import type { NodeMeta, SettingOnErrorDTO, SettingOnErrorVO } from '@/typing';

// The type corresponding to the input parameter, but it should be noted that the value of the custom extended field does not necessarily have to be the ValueExpression type
export type InputParametersMap = Record<string, ValueExpression>;

/** Front-end form structure, back-end data structure reference ApiNodeDataDTO */
export interface ApiNodeFormData {
  nodeMeta: NodeMeta;
  inputs: {
    apiParam: InputValueDTO[];
    inputDefs?: ApiNodeDetailDTO['inputs'][];
    inputParameters?: InputParametersMap;
    batch?: BatchVO;
    batchMode?: string;
    settingOnError?: SettingOnErrorDTO;
  };
  outputs: ViewVariableMeta[];
  settingOnError?: SettingOnErrorVO;
}

/**
 * Plug-in node data part structure definition
 */
export interface ApiNodeDTOData<
  InputType = InputValueDTO,
  OutputType = VariableMetaDTO,
> {
  nodeMeta: NodeMeta;
  inputs: {
    apiParam: InputValueDTO[];
    inputDefs?: ApiNodeDetailDTO['inputs'][];
    inputParameters?: InputType[];
    batch?: BatchDTO & { batchEnable: boolean };
    batchMode?: string;
    settingOnError?: SettingOnErrorDTO;
  };
  outputs: OutputType[];
}

/**
 * Plug-in node data part structure definition, data structure after workflow-json-format transformation
 * - outputs converted from VariableMetaDTO to ViewVariableMeta
 * - Inputs.inputParameters converted from BlockInput to InputValueVO
 */
export type ApiNodeDTODataWhenOnInit = ApiNodeDTOData<
  InputValueVO,
  ViewVariableMeta
>;

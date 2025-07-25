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

// 输入参数对应的类型，不过需要注意的是，自定义扩展的字段，值不一定是 ValueExpression 类型
export type InputParametersMap = Record<string, ValueExpression>;

/** 前端表单结构，后端数据结构参考 ApiNodeDataDTO */
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
 * 插件节点数据部分结构定义
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
 * 插件节点数据部分结构定义，经过 workflow-json-format 转换后的数据结构
 * - outputs 从 VariableMetaDTO 转换为 ViewVariableMeta
 * - inputs.inputParameters 从 BlockInput 转换为 InputValueVO
 */
export type ApiNodeDTODataWhenOnInit = ApiNodeDTOData<
  InputValueVO,
  ViewVariableMeta
>;

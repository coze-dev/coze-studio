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
  type ViewVariableMeta,
  type VariableMetaDTO,
  type InputValueDTO,
  type BatchVO,
  type BatchDTO,
  type ValueExpression,
  type ReleasedWorkflow,
  type WorkflowDetailInfoData,
  type DTODefine,
} from '@coze-workflow/base';

import type { NodeMeta, SettingOnErrorDTO, SettingOnErrorVO } from '@/typing';

export interface FormData {
  inputs: { inputParameters: InputValueVO[] };
}

interface BaseInputsOutputsType {
  inputs: DTODefine.InputVariableDTO[]; // name, type, schema, required, description
  outputs: VariableMetaDTO[];
}

export interface Identifier {
  workflowId: string;
  workflowVersion: string;
}

export type SubWorkflowDetailDTO =
  | (ReleasedWorkflow & BaseInputsOutputsType)
  | (WorkflowDetailInfoData & BaseInputsOutputsType);

// 输入参数对应的类型，不过需要注意的是，自定义扩展的字段，值不一定是 ValueExpression 类型
export type InputParametersMap = Record<string, ValueExpression>;

/** 子流程节点前端表单结构 */
export interface SubWorkflowNodeFormData {
  nodeMeta: NodeMeta;
  inputs: {
    inputDefs?: SubWorkflowDetailDTO['inputs'][]; // name, required, type, defaultValue, schema...
    inputParameters?: InputParametersMap;
    batch?: BatchVO;
    batchMode?: string;
    settingOnError?: SettingOnErrorDTO;
    workflowId?: string;
    workflowVersion?: string;
  };
  outputs: ViewVariableMeta[];
  settingOnError?: SettingOnErrorVO;
}

/**
 * 子流程节点数据部分结构定义
 */
export interface SubWorkflowNodeDTOData<
  InputType = InputValueDTO,
  OutputType = VariableMetaDTO,
> {
  nodeMeta: NodeMeta;
  inputs: {
    // 一个例子：
    // {
    //   "input": {},
    //   "name": "obj",
    //   "required": false,
    //   "schema": [
    //     {
    //       "name": "arr_str",
    //       "required": false,
    //       "schema": {
    //         "type": "string"
    //       },
    //       "type": "list"
    //     },
    //     {
    //       "name": "int",
    //       "required": false,
    //       "type": "integer"
    //     }
    //   ],
    //   "type": "object"
    // }
    inputDefs?: SubWorkflowDetailDTO['inputs'][];
    inputParameters?: InputType[];
    batch?: BatchDTO & { batchEnable: boolean };
    batchMode?: string;
    settingOnError?: SettingOnErrorDTO;

    // 一些额外附加参数
    spaceId?: string;
    type?: number;
    workflowId?: string;
    workflowVersion?: string;
  };
  outputs: OutputType[];
}

/**
 * 子流程节点数据部分结构定义，经过 workflow-json-format 转换后的数据结构
 * - outputs 从 VariableMetaDTO 转换为 ViewVariableMeta
 * - inputs.inputParameters 从 BlockInput 转换为 InputValueVO
 */
export type SubWorkflowNodeDTODataWhenOnInit = SubWorkflowNodeDTOData<
  InputValueVO,
  ViewVariableMeta
>;

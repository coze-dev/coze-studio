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
  type NodeDataDTO,
  type ViewVariableMeta,
  type BlockInput,
  type VariableMetaDTO,
} from '@coze-workflow/base';

import { type StringMethod } from './constants';

export interface NodeMeta {
  title: string;
  icon: string;
  subTitle: string;
  description: string;
  mainColor: string;
}

/** 选项 */
export interface DelimiterOption {
  label: string;
  value: string;
  isDefault: boolean;
}

/** 表单基本数据 */
export interface FormData {
  method: StringMethod;
  inputParameters: InputValueVO[];
  nodeMeta: NodeMeta;
  outputs: ViewVariableMeta[];
}

/** 字符串分割模式表单数据 */
export interface DelimiterModeFormData extends FormData {
  delimiter: {
    value: string[];
    options: DelimiterOption[];
  };
}

/** 字符串拼接模式表单数据 */
export interface ConcatModeFormData extends FormData {
  concatChar: {
    value: string;
    options: DelimiterOption[];
  };
  concatResult: string;
}

/** 后端数据结构 */
export interface BackendData extends NodeDataDTO {
  nodeMeta: NodeMeta;
  inputs: NodeDataDTO['inputs'] & {
    // 分割参数
    method?: StringMethod;
    splitParams?: BlockInput[];

    // 拼接参数
    concatParams?: BlockInput[];
  };
  outputs: VariableMetaDTO[];
}

/** 中间数据结构，这个数据结构会将变量结构转化成后端结构 */
export interface DataBeforeFormat {
  inputs: BackendData['inputs'] & {
    // 这个会被 workflow-json-format 进一步处理，见 formatNodeOnSubmit 方法
    inputParameters?: InputValueVO[];
  };
  nodeMeta: NodeMeta;

  // 这个会被 workflow-json-format 进一步处理，见 formatNodeOnSubmit 方法
  outputs: ViewVariableMeta[];
}

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

/** option */
export interface DelimiterOption {
  label: string;
  value: string;
  isDefault: boolean;
}

/** form basic data */
export interface FormData {
  method: StringMethod;
  inputParameters: InputValueVO[];
  nodeMeta: NodeMeta;
  outputs: ViewVariableMeta[];
}

/** String split mode form data */
export interface DelimiterModeFormData extends FormData {
  delimiter: {
    value: string[];
    options: DelimiterOption[];
  };
}

/** String Splice mode form data */
export interface ConcatModeFormData extends FormData {
  concatChar: {
    value: string;
    options: DelimiterOption[];
  };
  concatResult: string;
}

/** backend data structure */
export interface BackendData extends NodeDataDTO {
  nodeMeta: NodeMeta;
  inputs: NodeDataDTO['inputs'] & {
    // segmentation parameter
    method?: StringMethod;
    splitParams?: BlockInput[];

    // Splicing parameters
    concatParams?: BlockInput[];
  };
  outputs: VariableMetaDTO[];
}

/** Intermediate data structure, which converts the variable structure into a back-end structure */
export interface DataBeforeFormat {
  inputs: BackendData['inputs'] & {
    // This will be handled further workflow-json-format, see formatNodeOnSubmit method
    inputParameters?: InputValueVO[];
  };
  nodeMeta: NodeMeta;

  // This will be handled further workflow-json-format, see formatNodeOnSubmit method
  outputs: ViewVariableMeta[];
}

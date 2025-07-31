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
  type FeishuBaseConfig,
  type InputComponent,
  type InputConfig,
  type OutputSubComponent,
  type OutputSubComponentItem,
} from '@coze-arch/bot-api/connector_api';

export type OutputSubComponentItemFe = Omit<
  OutputSubComponentItem,
  'output_type'
> & {
  output_type: number | undefined;
};

export type BaseOutputStructLineType = OutputSubComponentItemFe & {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- frontend private usage
  _id: string;
};

export type OutputSubComponentFe = Omit<OutputSubComponent, 'item_list'> & {
  item_list?: BaseOutputStructLineType[];
};

export type FeishuBaseConfigFe = Omit<
  FeishuBaseConfig,
  'output_sub_component' | 'input_config'
> & {
  output_sub_component: OutputSubComponentFe;
  input_config: InputConfigFe[];
};

export interface InputComponentSelectOption {
  name: string;
  id: string;
}

export type InputComponentFe = Omit<InputComponent, 'choice'> & {
  choice: InputComponentSelectOption[];
};

export type InputConfigFe = Omit<InputConfig, 'input_component'> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- .
  _id: string;
  input_component: InputComponentFe;
};

export type SaveConfigPayload = Pick<
  FeishuBaseConfig,
  'output_type' | 'output_sub_component' | 'input_config'
>;

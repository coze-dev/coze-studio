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

import { type InputValueVO, type ValueExpression } from '@coze-workflow/base';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { type LiteralValueType } from '@/form-extensions/components/literal-value-input';

import { type ChangeMode } from './constants';

export type DefaultValueType = LiteralValueType;

export type TreeNodeCustomData = TreeNodeData & {
  name: string;
  // row unique value
  key: string;
  // Formed fields
  field: string;
  // Is it the first item?
  isFirst: boolean;
  // Is it the last item?
  isLast: boolean;
  // Is there only one item of data?
  isSingle: boolean;
  // The nesting level of the item, starting at 0
  level: number;
  // Fields displayed by the auxiliary line
  helpLineShow: Array<boolean>;
  children?: Array<TreeNodeCustomData>;
  // Variable value
  input?: ValueExpression;
  // input parameter
  inputParameters?: InputValueVO[];
};

export interface CustomTreeNodeFuncRef {
  data: TreeNodeCustomData;
  level: number;
  readonly: boolean;
  // General change method
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  // Customized type change method, mainly used for custom rendering
  // Add child item
  onAppend: () => void;
  // Delete this item
  onDelete: () => void;
  // Delete all children under this item
  onDeleteChildren: () => void;
  // The internal call method when the type changes, mainly used to delete all children when converting from the class Object type to other types
  onSelectChange: (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => void;
}

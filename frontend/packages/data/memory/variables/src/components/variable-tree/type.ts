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

import { type CSSProperties } from 'react';

import { type Variable, type ViewVariableType } from '@/store';

import { type ChangeMode } from './components/custom-tree-node/constants';

export interface RecursedParamDefinition {
  name?: string;
  /** The Tree component requires each node to have a key, and the key is not suitable for assignment in any way such as name (before and after). Finally, the interface conversion layer provides a random key at one time. */
  fieldRandomKey?: string;
  desc?: string;
  type: ViewVariableType;
  children?: RecursedParamDefinition[];
}

export type TreeNodeCustomData = Variable;

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
  // The internal call method when the type changes, mainly used to delete all children when converting from the class Object type to other types
  onSelectChange: (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => void;
}

export type WithCustomStyle<T = object> = {
  className?: string;
  style?: CSSProperties;
} & T;

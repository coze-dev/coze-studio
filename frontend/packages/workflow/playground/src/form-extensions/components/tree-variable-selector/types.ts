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

import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { type VariableMetaWithNode } from '../../typings';

export type VariableTreeDataNode = VariableMetaWithNode & {
  label: string;
  value: string;
  isTop?: boolean;
  parent?: VariableTreeDataNode;
  disabled?: boolean;
  children?: Array<VariableTreeDataNode>;
};

export type RenderDisplayVarName = (params: {
  meta?: VariableMetaWithNode | null;
  path?: string[];
}) => string;

export type CustomFilterVar = (params: {
  meta?: VariableMetaWithNode | null;
  path?: string[];
}) => boolean;

export interface ITreeNodeData extends TreeNodeData {
  groupId?: string;
}

export enum SelectType {
  Option = 'option',
  Tree = 'tree',
}

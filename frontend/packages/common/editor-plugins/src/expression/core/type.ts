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

import { type ViewVariableType as VariableType } from '../variable-types';
import type { ExpressionEditorSegmentType } from './constant';

export type ExpressionEditorSegment<
  T extends ExpressionEditorSegmentType = ExpressionEditorSegmentType,
> = {
  [ExpressionEditorSegmentType.ObjectKey]: {
    type: ExpressionEditorSegmentType.ObjectKey;
    index: number;
    objectKey: string;
  };
  [ExpressionEditorSegmentType.ArrayIndex]: {
    type: ExpressionEditorSegmentType.ArrayIndex;
    index: number;
    arrayIndex: number;
  };
  [ExpressionEditorSegmentType.EndEmpty]: {
    type: ExpressionEditorSegmentType.EndEmpty;
    index: number;
  };
}[T];

export interface Variable {
  key: string;
  type: VariableType;
  name: string;
  children?: Variable[];
  // user-defined node name display
  label?: string;
}

export interface ExpressionEditorTreeNode extends TreeNodeData {
  label: string;
  value: string;
  key: string;
  keyPath?: string[];
  variable?: Variable;
  children?: ExpressionEditorTreeNode[];
  parent?: ExpressionEditorTreeNode;
}

export interface ExpressionEditorParseData {
  content: {
    line: string;
    inline: string;
    reachable: string;
    unreachable: string;
  };
  offset: {
    line: number;
    inline: number;
    lastStart: number;
    firstEnd: number;
  };
  segments: {
    inline?: ExpressionEditorSegment[];
    reachable: ExpressionEditorSegment[];
  };
}

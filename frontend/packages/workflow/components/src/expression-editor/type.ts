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

import type { CompositionEventHandler } from 'react';

import type { BaseElement, BaseRange } from 'slate';
import {
  type StandardNodeType,
  type ViewVariableMeta,
} from '@coze-workflow/base';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

import type {
  ExpressionEditorEvent,
  ExpressionEditorSegmentType,
  ExpressionEditorSignal,
} from './constant';

export type ExpressionEditorEventParams<T extends ExpressionEditorEvent> = {
  [ExpressionEditorEvent.Change]: {
    lines: ExpressionEditorLine[];
    value: string;
  };
  [ExpressionEditorEvent.Select]: {
    content: string;
    offset: number;
    path: number[];
  };
  [ExpressionEditorEvent.Dispose]: undefined;
  [ExpressionEditorEvent.CompositionStart]: {
    event: CompositionEventHandler<HTMLDivElement>;
  };
}[T];

export type ExpressionEditorEventDisposer = () => void;

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

export interface ExpressionEditorVariable extends ViewVariableMeta {
  nodeTitle?: string;
  nodeId?: string;
  nodeType?: StandardNodeType;
}

export interface ExpressionEditorTreeNode extends TreeNodeData {
  label: string;
  value: string;
  key: string;
  keyPath?: string[];
  variable?: ExpressionEditorVariable;
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

export interface ExpressionEditorLine extends BaseElement {
  type: ExpressionEditorSignal.Line;
  children: {
    text: string;
  }[];
}

export interface ExpressionEditorValidateData {
  start: number;
  end: number;
  valid: boolean;
  message?: string;
}

export interface ExpressionEditorRange extends BaseRange {
  type:
    | ExpressionEditorSignal.Valid
    | ExpressionEditorSignal.Invalid
    | ExpressionEditorSignal.SelectedValid
    | ExpressionEditorSignal.SelectedInvalid;
}

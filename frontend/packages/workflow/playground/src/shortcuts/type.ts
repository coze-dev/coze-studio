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

import type {
  WorkflowEdgeJSON,
  WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import type { NodeData } from '@coze-workflow/nodes';
import type { ValueOf, WorkflowMode } from '@coze-workflow/base';

import type { WORKFLOW_CLIPBOARD_TYPE, WORKFLOW_EXPORT_TYPE } from './constant';

export interface WorkflowClipboardData {
  type: typeof WORKFLOW_CLIPBOARD_TYPE;
  json: WorkflowClipboardJSON;
  source: WorkflowClipboardSource;
  bounds: WorkflowClipboardRect;
}

export interface WorkflowExportData {
  type: typeof WORKFLOW_EXPORT_TYPE;
  json: WorkflowClipboardJSON;
  source: WorkflowClipboardSource;
}

export interface WorkflowClipboardJSON {
  nodes: WorkflowClipboardNodeJSON[];
  edges: WorkflowEdgeJSON[];
}

export interface WorkflowClipboardSource {
  workflowId: string;
  flowMode: WorkflowMode;
  spaceId: string;
  host: string;
  isDouyin: boolean;
}

export interface WorkflowClipboardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowClipboardNodeTemporary {
  externalData?: ValueOf<NodeData>;
  bounds: WorkflowClipboardRect;
}

export interface WorkflowClipboardNodeJSON extends WorkflowNodeJSON {
  blocks?: WorkflowClipboardNodeJSON[];
  // eslint-disable-next-line @typescript-eslint/naming-convention -- _temp are internal fields, not exposed
  _temp: WorkflowClipboardNodeTemporary;
}

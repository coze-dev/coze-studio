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

import { type TreeProps } from '../tree';
import { type DataSource } from '../../typings/graph';
import { type SpanTypeConfigMap } from '../../typings/config';

export type TraceTreeProps = {
  dataSource: DataSource;
  spaceId?: string;
  selectedSpanId?: string;
  spanTypeConfigMap?: SpanTypeConfigMap;
} & Pick<
  TreeProps,
  | 'indentDisabled'
  | 'lineStyle'
  | 'globalStyle'
  | 'onSelect'
  | 'onClick'
  | 'onMouseMove'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'className'
>;

export interface SpanDetail {
  isCozeWorkflowNode: boolean;
  workflowLevel: number; // Workflow Hierarchy
  workflowVersion?: string; // Parent node passes through to sub-node
}

export interface WorkflowJumpParams {
  workflowID: string;
  executeID?: string;
  workflowNodeID?: string;
  workflowVersion?: string;
  subExecuteID?: string;
}

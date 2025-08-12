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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeRegistry } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { NODE_V2_TYPES, NODES_V2 } from '@/nodes-v2/constants';

export const isNodeV2registry = (registry: WorkflowNodeRegistry) =>
  NODES_V2.some(r => NODE_V2_TYPES.includes(registry.type));

export const isNodeV2 = (node: FlowNodeEntity) =>
  NODE_V2_TYPES.includes(node.flowNodeType);

export const getNodeV2Registry = (nodeType: StandardNodeType) =>
  NODES_V2.find(r => r.type === nodeType);

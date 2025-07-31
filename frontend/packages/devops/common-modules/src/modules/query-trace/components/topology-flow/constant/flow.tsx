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

import { type EdgeProps } from 'reactflow';

import { SpanCategory } from '@coze-arch/bot-api/ob_query_api';

import { CommonNode } from '../custom-nodes';
import { CommonEdge } from '../custom-edges';
import { NodeEdgeCategory } from '.';

export const CUSTOM_NODES = {
  [SpanCategory.Unknown]: CommonNode,
  [SpanCategory.Start]: CommonNode,
  [SpanCategory.Agent]: CommonNode,
  [SpanCategory.LLMCall]: CommonNode,
  [SpanCategory.Workflow]: CommonNode,
  [SpanCategory.WorkflowStart]: CommonNode,
  [SpanCategory.WorkflowEnd]: CommonNode,
  [SpanCategory.Plugin]: CommonNode,
  [SpanCategory.Knowledge]: CommonNode,
  [SpanCategory.Code]: CommonNode,
  [SpanCategory.Condition]: CommonNode,
  [SpanCategory.Card]: CommonNode,
  [SpanCategory.Message]: CommonNode,
  [SpanCategory.Loop]: CommonNode,
  [SpanCategory.LongTermMemory]: CommonNode,
};

export const CUSTOM_EDGES: Record<NodeEdgeCategory, React.FC<EdgeProps>> = {
  [NodeEdgeCategory.Common]: CommonEdge,
};

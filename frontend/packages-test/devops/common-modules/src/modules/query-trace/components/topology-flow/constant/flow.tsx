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

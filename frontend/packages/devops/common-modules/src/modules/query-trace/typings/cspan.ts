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

import {
  type Span,
  type AttrUserInput,
  type AttrInvokeAgent,
  type AttrCode,
  type AttrCodeBatch,
  type AttrCondition,
  type AttrKnowledge,
  type AttrLLMBatchCall,
  type AttrLLMCall,
  type AttrPluginTool,
  type AttrPluginToolBatch,
  type AttrRestartAgent,
  type AttrSwitchAgent,
  type AttrWorkflow,
  type AttrWorkflowEnd,
  type SpanCategory,
  type SpanType,
  type SpanStatus,
  type AttrChain,
  type AttrWorkflowMessage,
  type AttrCard,
  type AttrWorkflowLLMCall,
  type AttrWorkflowCode,
  type AttrWorkflowCodeBatch,
  type AttrWorkflowCondition,
  type AttrWorkflowKnowledge,
  type AttrWorkflowLLMBatchCall,
  type AttrWorkflowPluginTool,
  type AttrWorkflowPluginToolBatch,
  type AttrBWStart,
  type AttrBWEnd,
  type AttrBWBatch,
  type AttrBWLoop,
  type AttrBWCondition,
  type AttrBWLLM,
  type AttrBWParallel,
  type AttrBWScript,
  type AttrBWVariable,
  type AttrBWCallFlow,
  type AttrBWConnector,
  type AttrHook,
} from '@coze-arch/bot-api/ob_query_api';

type CSpanCommonProp = Pick<
  Span,
  'trace_id' | 'id' | 'parent_id' | 'name' | 'type' | 'status'
> & {
  start_time: number; // The default is Int64, which is inconvenient to use
  latency: number; // The default is Int64, which is inconvenient to use
  category?: SpanCategory; // Empty only when Meta fails to load
  input_tokens_sum?: number; // Extended field to store the sum of sub-node input_tokens
  output_tokens_sum?: number; // Extended field to store the sum of sub-node output_tokens
};

type GenCSpan<T> = CSpanCommonProp & {
  extra?: T;
};

export type CSpanAttrUserInput = GenCSpan<AttrUserInput>;
export type CSpanAttrInvokeAgent = GenCSpan<AttrInvokeAgent>;
export type CSpanAttrRestartAgent = GenCSpan<AttrRestartAgent>;
export type CSpanAttrSwitchAgent = GenCSpan<AttrSwitchAgent>;
export type CSpanAttrLLMCall = GenCSpan<AttrLLMCall>;
export type CSpanAttrWorkflowLLMCall = GenCSpan<AttrWorkflowLLMCall>;
export type CSpanAttrLLMBatchCall = GenCSpan<AttrLLMBatchCall>;
export type CSpanAttrWorkflowLLMBatchCall = GenCSpan<AttrWorkflowLLMBatchCall>;
export type CSpanAttrWorkflow = GenCSpan<AttrWorkflow>;
export type CSpanAttrWorkflowEnd = GenCSpan<AttrWorkflowEnd>;
export type CSpanAttrCode = GenCSpan<AttrCode>;
export type CSpanAttrWorkflowCode = GenCSpan<AttrWorkflowCode>;
export type CSpanAttrCodeBatch = GenCSpan<AttrCodeBatch>;
export type CSpanAttrWorkflowCodeBatch = GenCSpan<AttrWorkflowCodeBatch>;
export type CSpanAttrCondition = GenCSpan<AttrCondition>;
export type CSpanAttrWorkflowCondition = GenCSpan<AttrWorkflowCondition>;
export type CSpanAttrPluginTool = GenCSpan<AttrPluginTool>;
export type CSpanAttrWorkflowPluginTool = GenCSpan<AttrWorkflowPluginTool>;
export type CSpanAttrPluginToolBatch = GenCSpan<AttrPluginToolBatch>;
export type CSpanAttrWorkflowPluginToolBatch =
  GenCSpan<AttrWorkflowPluginToolBatch>;
export type CSpanAttrKnowledge = GenCSpan<AttrKnowledge>;
export type CSpanAttrWorkflowKnowledge = GenCSpan<AttrWorkflowKnowledge>;
export type CSpanAttrChain = GenCSpan<AttrChain>;
export type CSpanAttrCard = GenCSpan<AttrCard>;
export type CSpanAttrWorkflowMessage = GenCSpan<AttrWorkflowMessage>;
export type CSpanAttrHook = GenCSpan<AttrHook>;
export type CSpanAttrBWStart = GenCSpan<AttrBWStart>;
export type CSpanAttrBWEnd = GenCSpan<AttrBWEnd>;
export type CSpanAttrBWBatch = GenCSpan<AttrBWBatch>;
export type CSpanAttrBWLoop = GenCSpan<AttrBWLoop>;
export type CSpanAttrBWCondition = GenCSpan<AttrBWCondition>;
export type CSpanAttrBWLLM = GenCSpan<AttrBWLLM>;
export type CSpanAttrBWParallel = GenCSpan<AttrBWParallel>;
export type CSpanAttrBWScript = GenCSpan<AttrBWScript>;
export type CSpanAttrBWVariable = GenCSpan<AttrBWVariable>;
export type CSpanAttrBWCallFlow = GenCSpan<AttrBWCallFlow>;
export type CSpanAttrBWConnector = GenCSpan<AttrBWConnector>;

export type CSpanSingle =
  | CSpanAttrUserInput
  | CSpanAttrInvokeAgent
  | CSpanAttrRestartAgent
  | CSpanAttrSwitchAgent
  | CSpanAttrLLMCall
  | CSpanAttrLLMBatchCall
  | CSpanAttrWorkflow
  | CSpanAttrWorkflowEnd
  | CSpanAttrCode
  | CSpanAttrCodeBatch
  | CSpanAttrCondition
  | CSpanAttrPluginTool
  | CSpanAttrPluginToolBatch
  | CSpanAttrKnowledge
  | CSpanAttrChain
  | CSpanAttrCard
  | CSpanAttrWorkflowMessage
  | CSpanAttrWorkflowLLMCall
  | CSpanAttrWorkflowLLMBatchCall
  | CSpanAttrWorkflowCode
  | CSpanAttrWorkflowCodeBatch
  | CSpanAttrWorkflowCondition
  | CSpanAttrWorkflowPluginTool
  | CSpanAttrWorkflowPluginToolBatch
  | CSpanAttrWorkflowKnowledge
  | CSpanAttrHook
  | CSpanAttrBWStart
  | CSpanAttrBWEnd
  | CSpanAttrBWBatch
  | CSpanAttrBWLoop
  | CSpanAttrBWCondition
  | CSpanAttrBWLLM
  | CSpanAttrBWParallel
  | CSpanAttrBWScript
  | CSpanAttrBWVariable
  | CSpanAttrBWCallFlow
  | CSpanAttrBWConnector;

export type CSpanSingleForBatch =
  | CSpanAttrLLMBatchCall
  | CSpanAttrWorkflowLLMBatchCall
  | CSpanAttrCodeBatch
  | CSpanAttrWorkflowCodeBatch
  | CSpanAttrPluginToolBatch
  | CSpanAttrWorkflowPluginToolBatch;

export type CSPanBatch = CSpanCommonProp & {
  spans: CSpanSingleForBatch[];
  workflow_node_id?: string;
};

export type CSpan = CSpanSingle | CSPanBatch;

type AttrUserInputExtra = Partial<CSpanAttrUserInput['extra']> & {
  dialog_round?: number;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
};

export type CTrace = Omit<CSpanAttrUserInput, 'extra' | 'status'> & {
  status?: SpanStatus;
  extra?: AttrUserInputExtra;
};

export type SpanCategoryMeta = Record<SpanCategory, SpanType[] | undefined>;

/** key: SpanCategory */
export type SpanCategoryMap = Record<number, SpanCategory>;

export enum StreamingOutputStatus {
  OPEN = 'open',
  CLOSE = 'close',
  UNDEFINED = 'undefined',
}

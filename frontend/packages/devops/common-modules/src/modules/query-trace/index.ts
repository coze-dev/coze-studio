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

export { default as TraceFlamethread } from './components/trace-flamethread';
export { default as TraceTree } from './components/trace-tree';
export { default as TopologyFlow } from './components/topology-flow';
export {
  default as Flamethread,
  type InteractionEventHandler,
} from './components/flamethread';
export { default as Tree, type MouseEventParams } from './components/tree';
export { useSpanTransform } from './hooks/use-span-transform';
// Parameter types for Tree and FlamethRead
export { DataSourceTypeEnum } from './typings/graph';

export {
  // useSpanTransform related types
  type SpanCategoryMeta,
  // useSpanTransform generated custom spans
  type CSpan,
  type CTrace,
  type CSpanSingle,
  type CSPanBatch,
  type CSpanAttrUserInput,
  type CSpanAttrInvokeAgent,
  type CSpanAttrRestartAgent,
  type CSpanAttrSwitchAgent,
  type CSpanAttrLLMCall,
  type CSpanAttrLLMBatchCall,
  type CSpanAttrWorkflow,
  type CSpanAttrWorkflowEnd,
  type CSpanAttrCode,
  type CSpanAttrCodeBatch,
  type CSpanAttrCondition,
  type CSpanAttrPluginTool,
  type CSpanAttrPluginToolBatch,
  type CSpanAttrKnowledge,
  type CSpanAttrChain,
  StreamingOutputStatus,
} from './typings/cspan';

export {
  spanTypeConfigMap,
  botEnvConfigMap,
  spanCategoryConfigMap,
  streamingOutputStatusConfigMap,
} from './config/cspan';

export {
  isBatchSpanType,
  isVisibleSpan,
  checkIsBatchBasicCSpan,
  getTokens,
  getSpanProp,
} from './utils/cspan';

export { span2CSpan } from './utils/cspan-transform';

export { fieldItemHandlers, type FieldItem } from './utils/field-item-handler';

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
  SpanCategory,
  SpanStatus,
  SpanType,
} from '@coze-arch/bot-api/ob_query_api';
import {
  SpanCategoryConfigMap,
  SpanStatusConfigMap,
  SpanTypeConfigMap,
} from '../typings/config';
import { I18n } from '@coze-arch/i18n';
import { StreamingOutputStatus } from '../typings/cspan';

export const spanTypeConfigMap: SpanTypeConfigMap = {
  [SpanType.Unknown]: {
    label: I18n.t('analytic_query_subtype_value_unknown'),
  },
  [SpanType.UserInput]: {
    label: I18n.t('analytic_query_subtype_value_userinput'),
  },
  [SpanType.UserInputV2]: {
    label: I18n.t('analytic_query_subtype_value_userinput'),
  },
  [SpanType.ThirdParty]: {
    label: I18n.t('analytic_query_subtype_value_thirdparty'),
  },
  [SpanType.ScheduledTasks]: {
    label: I18n.t('analytic_query_subtype_value_scheduledtasks'),
  },
  [SpanType.OpenDialog]: {
    label: I18n.t('analytic_query_subtype_value_opendialog'),
  },
  [SpanType.InvokeAgent]: {
    label: I18n.t('analytic_query_subtype_value_invokeagent'),
  },
  [SpanType.RestartAgent]: {
    label: I18n.t('analytic_query_subtype_value_restartagent'),
  },
  [SpanType.SwitchAgent]: {
    label: I18n.t('analytic_query_subtype_value_switchagent'),
  },
  [SpanType.LLMCall]: {
    label: I18n.t('analytic_query_subtype_value_llmcall'),
  },
  [SpanType.LLMBatchCall]: {
    label: I18n.t('analytic_query_subtype_value_llmbatchcall'),
  },
  [SpanType.Workflow]: {
    label: I18n.t('analytic_query_subtype_value_workflow'),
  },
  [SpanType.WorkflowStart]: {
    label: I18n.t('analytic_query_subtype_value_workflowstart'),
  },
  [SpanType.WorkflowEnd]: {
    label: I18n.t('analytic_query_subtype_value_workflowend'),
  },
  [SpanType.PluginTool]: {
    label: I18n.t('analytic_query_subtype_value_plugintool'),
  },
  [SpanType.PluginToolBatch]: {
    label: I18n.t('analytic_query_subtype_value_plugintoolbatch'),
  },
  [SpanType.Knowledge]: {
    label: I18n.t('analytic_query_subtype_value_knowledge'),
  },
  [SpanType.Code]: {
    label: I18n.t('analytic_query_subtype_value_code'),
  },
  [SpanType.CodeBatch]: {
    label: I18n.t('analytic_query_subtype_value_codebatch'),
  },
  [SpanType.Condition]: {
    label: I18n.t('analytic_query_subtype_value_condition'),
  },
  [SpanType.Card]: {
    label: I18n.t('analytic_query_subtype_value_card'),
  },
  [SpanType.WorkflowMessage]: {
    label: I18n.t('analytic_query_subtype_value_workflow_message'),
  },

  [SpanType.WorkflowLLMCall]: {
    label: I18n.t('analytic_query_subtype_value_llmcall'),
  },
  [SpanType.WorkflowLLMBatchCall]: {
    label: I18n.t('analytic_query_subtype_value_llmbatchcall'),
  },
  [SpanType.WorkflowCode]: {
    label: I18n.t('analytic_query_subtype_value_code'),
  },
  [SpanType.WorkflowCodeBatch]: {
    label: I18n.t('analytic_query_subtype_value_codebatch'),
  },
  [SpanType.WorkflowCondition]: {
    label: I18n.t('analytic_query_subtype_value_condition'),
  },
  [SpanType.WorkflowPluginTool]: {
    label: I18n.t('analytic_query_subtype_value_plugintool'),
  },
  [SpanType.WorkflowPluginToolBatch]: {
    label: I18n.t('analytic_query_subtype_value_plugintoolbatch'),
  },
  [SpanType.WorkflowKnowledge]: {
    label: I18n.t('analytic_query_subtype_value_knowledge'),
  },
  [SpanType.Chain]: {},
  // specific business
  [SpanType.Hook]: {
    label: I18n.t('analytics_query_invoke', {
      name: 'Hook',
    }),
  },
  [SpanType.BWStart]: { label: 'BWStart' },
  [SpanType.BWEnd]: { label: 'BWEnd' },
  [SpanType.BWBatch]: { label: 'BWBatch' },
  [SpanType.BWLoop]: { label: 'BWLoop' },
  [SpanType.BWCondition]: { label: 'BWCondition' },
  [SpanType.BWLLM]: { label: 'BWLLM' },
  [SpanType.BWParallel]: { label: 'BWParallel' },
  [SpanType.BWScript]: { label: 'BWScript' },
  [SpanType.BWVariable]: { label: 'BWVariable' },
  [SpanType.BWCallFlow]: { label: 'BWCallFlow' },
  [SpanType.BWConnector]: { label: 'BWConnector' },
};

export const spanCategoryConfigMap: SpanCategoryConfigMap = {
  [SpanCategory.Unknown]: {
    label: I18n.t('analytic_query_type_value_unknown'),
  },
  [SpanCategory.Start]: {
    label: I18n.t('analytic_query_type_value_start'),
  },
  [SpanCategory.Agent]: {
    label: I18n.t('analytic_query_type_value_agent'),
  },
  [SpanCategory.LLMCall]: {
    label: I18n.t('analytic_query_type_value_llmcall'),
  },
  [SpanCategory.Workflow]: {
    label: I18n.t('analytic_query_type_value_workflow'),
  },
  [SpanCategory.WorkflowStart]: {
    label: I18n.t('analytic_query_type_value_workflowstart'),
  },
  [SpanCategory.WorkflowEnd]: {
    label: I18n.t('analytic_query_type_value_workflowend'),
  },
  [SpanCategory.Plugin]: {
    label: I18n.t('analytic_query_type_value_plugin'),
  },
  [SpanCategory.Knowledge]: {
    label: I18n.t('analytic_query_type_value_knowledge'),
  },
  [SpanCategory.Code]: {
    label: I18n.t('analytic_query_type_value_code'),
  },
  [SpanCategory.Condition]: {
    label: I18n.t('analytic_query_type_value_condition'),
  },
  [SpanCategory.Card]: {
    label: I18n.t('analytic_query_type_value_card'),
  },
  [SpanCategory.Message]: {
    label: I18n.t('analytic_query_type_value_message'),
  },
  [SpanCategory.Variable]: {
    label: I18n.t('analytics_query_type_variable'),
  },
  [SpanCategory.Hook]: {
    label: 'Hook',
  },
  [SpanCategory.Batch]: {
    label: 'Batch',
  },
  [SpanCategory.Loop]: {
    label: 'Loop',
  },
  [SpanCategory.Parallel]: {
    label: 'Parallel',
  },
  [SpanCategory.Script]: {
    label: 'Script',
  },
  [SpanCategory.CallFlow]: {
    label: 'CallFlow',
  },
  [SpanCategory.Connector]: {
    label: 'Connector',
  },
};

export const spanStatusConfigMap: SpanStatusConfigMap = {
  [SpanStatus.Unknown]: {
    label: I18n.t('analytic_query_status_unknown'),
  },
  [SpanStatus.Success]: {
    label: I18n.t('analytic_query_status_success'),
  },
  [SpanStatus.Error]: {
    label: I18n.t('analytic_query_status_error'),
  },
  [SpanStatus.Broken]: {
    label: I18n.t('analytic_query_status_broken'),
  },
};

export const streamingOutputStatusConfigMap: Record<
  StreamingOutputStatus,
  { label?: string } | undefined
> = {
  [StreamingOutputStatus.OPEN]: {
    label: I18n.t('analytic_streaming_output_status_open'),
  },
  [StreamingOutputStatus.CLOSE]: {
    label: I18n.t('analytic_streaming_output_status_close'),
  },
  [StreamingOutputStatus.UNDEFINED]: {},
};

export const botEnvConfigMap: Record<string, { label?: string } | undefined> = {
  '0': {
    label: I18n.t('analytic_query_env_value_botmakerdebug'),
  },
  '1': {
    label: I18n.t('analytic_query_env_value_realuser'),
  },
};

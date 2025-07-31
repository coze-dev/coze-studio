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
import { I18n } from '@coze-arch/i18n';

import { type FunctionCallLog, type BaseLog, type Log } from '../types';
import { LogType } from '../constants';
import {
  type FunctionCallDetail,
  parseFunctionCall,
} from './parse-function-call';

export function generateLLMOutput(
  logs: Log[],
  responseExtra: Record<string, unknown>,
  node?: FlowNodeEntity,
) {
  const {
    reasoning_content: reasoningContent,
    fc_called_detail: fcCalledDetail,
  } = responseExtra;
  if (reasoningContent) {
    const reasoningLog: BaseLog = {
      type: LogType.Reasoning,
      label: I18n.t('workflow_250217_01'),
      data: reasoningContent,
      copyTooltip: I18n.t('workflow_detail_title_testrun_copyoutput'),
    };
    logs.push(reasoningLog);
  }

  if (fcCalledDetail) {
    const reasoningLog: FunctionCallLog = parseFunctionCall(
      fcCalledDetail as FunctionCallDetail,
      node,
    );
    logs.push(reasoningLog);
  }
}

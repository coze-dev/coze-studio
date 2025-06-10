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

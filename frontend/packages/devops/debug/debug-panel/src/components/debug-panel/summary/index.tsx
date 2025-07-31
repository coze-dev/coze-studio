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

import copy from 'copy-to-clipboard';
import classNames from 'classnames';
import { logger } from '@coze-arch/logger';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { UIToast } from '@coze-arch/bot-semi';
import { SpanStatus } from '@coze-arch/bot-api/debugger_api';

import { NodeDescriptionWithFullLine } from '../common';
import { fieldHandlers } from '../../../utils/field-item';
import { type TargetOverallSpanInfo } from '../../../typings';
import { useDebugPanelStore } from '../../../store';
import { useTraceCols } from '../../../hooks/use-trace-cols';
import { SPAN_STATUS_CONFIG_MAP } from '../../../consts/span';

import s from './index.module.less';

interface PanelSummaryProps {
  targetOverallSpanInfo: TargetOverallSpanInfo;
}

export const PanelSummary = (props: PanelSummaryProps) => {
  const { targetOverallSpanInfo } = props;
  const {
    basicInfo: { botId, userID, spaceID },
  } = useDebugPanelStore();

  const {
    span,
    output,
    span: { status, latency, input_tokens_sum = 0, output_tokens_sum = 0 },
  } = targetOverallSpanInfo;

  const { icon, label, className } = SPAN_STATUS_CONFIG_MAP[status];

  const { traceCols } = useTraceCols({ span });

  const handleFeedback = () => {
    try {
      const feedbackMsg = [
        `Logid: ${fieldHandlers.log_id(span).value}`,
        `UID: ${userID}`,
        `Botid: ${botId}`,
        `StartTime: ${fieldHandlers.start_time(span).value}`,
        `EndTime: ${fieldHandlers.end_time(span).value}`,
        status === SpanStatus.Error && `ErrorMsg:${output}`,
        `\n${I18n.t('debug_copy_suggestion')}`,
      ]
        .filter(Boolean)
        .join('\n');

      copy(feedbackMsg);
      UIToast.success({
        content: I18n.t('debug_copy_success'),
      });

      sendTeaEvent(EVENT_NAMES.click_debug_panel_feedback_button, {
        bot_id: botId ?? '',
        space_id: spaceID ?? '',
        host: window.location.host,
      });
    } catch (error) {
      logger.error({
        eventName: 'fail_to_copy_debug_info',
        error: error as Error,
      });
      UIToast.error(I18n.t('copy_failed'));
    }
  };
  return (
    <>
      <div className={s['summary-title-container']}>
        <div className={s['summary-title-container-data']}>
          {I18n.t('query_latency', {
            duration: latency,
          })}
          ms｜
          {I18n.t('query_tokens_number', {
            number: input_tokens_sum + output_tokens_sum,
          })}
        </div>
        <div
          className={classNames(s['summary-title-container-tag'], s[className])}
        >
          {icon}
          {I18n.t(label as I18nKeysNoOptionsType)}
        </div>
        <Button
          onClick={handleFeedback}
          className="ml-2"
          color="highlight"
          size="small"
        >
          {I18n.t('debug_copy_report')}
        </Button>
      </div>
      <NodeDescriptionWithFullLine cols={traceCols} />
    </>
  );
};

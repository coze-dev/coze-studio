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

/* eslint-disable @coze-arch/max-line-per-function */
import { type RefObject, useRef, useState } from 'react';

import classNames from 'classnames';
import { VerboseMsgType } from '@coze-common/chat-core';
import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import { Tag, Typography } from '@coze-arch/coze-design';
import { MockHitStatus } from '@coze-arch/bot-api/debugger_api';

import { isVerboseContent } from '../../../utils/verbose';
import { safeJSONParse } from '../../../utils/safe-json-parse';
import { getMessageUniqueKey } from '../../../utils/message';
import {
  MessageUnitRole,
  type MockHitInfo,
  type FunctionCallMessageUnit,
} from '../../../utils/fucntion-call/types';
import { getMessageTimeCost } from '../../../utils/fucntion-call/function-message-unit';
import { useShowBackGround } from '../../../hooks/public/use-show-bgackground';
import { useChatAreaContext } from '../../../hooks/context/use-chat-area-context';
import { type PreferenceContextInterface } from '../../../context/preference/types';
import { usePreference } from '../../../context/preference';
import {
  CollapsePanelWithHeader,
  type CollapsePanelWithHeaderRef,
} from './collapse-panel-with-header';

import s from './index.module.less';

export interface FunctionCallMessagesCollapseProps {
  messageUnits: FunctionCallMessageUnit[];
  isRelatedChatComplete: boolean;
  isMessageFromOngoingChat: boolean;
  isFakeInterruptAnswer: boolean;
}

const getUnitMessageId = (messageUnit: FunctionCallMessageUnit) =>
  getMessageUniqueKey(messageUnit.llmOutput);

const getBackgroundColorByTheme = (
  theme: PreferenceContextInterface['theme'],
) => {
  if (theme === 'home') {
    return 'bg-[var(--coz-mg-card)]';
  }
  if (theme === 'debug' || theme === 'store') {
    return 'bg-[var(--coz-mg-primary)]';
  }
  exhaustiveCheckSimple(theme);
  return 'bg-[var(--coz-mg-primary)]';
};

export const FunctionCallMessagesCollapse: React.FC<
  FunctionCallMessagesCollapseProps
> = props => {
  const {
    messageUnits,
    isMessageFromOngoingChat,
    isRelatedChatComplete,
    isFakeInterruptAnswer,
  } = props;
  const [isTopLevelOpen, setOpen] = useState(false);
  const latestUnit = messageUnits.at(-1);
  const controlledItemRef = useRef<CollapsePanelWithHeaderRef>(null);
  const { configs } = useChatAreaContext();
  const { showFunctionCallDetail = true } = configs ?? {};
  const { theme } = usePreference();
  const onOpenChange = (v: boolean) => {
    if (v) {
      controlledItemRef.current?.open();
    }
    setOpen(v);
  };

  const getTotalTime = () => {
    const timeGroup = messageUnits.reduce(
      (prev, cur) => {
        if (cur.role === MessageUnitRole.DATA_SET) {
          const time = Number(cur.time) || 0;
          prev.dataSet += time;
          prev.total += time;
        }
        if (cur.role === MessageUnitRole.VERBOSE) {
          const time = Number(cur.time) || 0;

          const content = safeJSONParse(cur.llmOutput.content);
          if (isVerboseContent(content)) {
            /** Time-consuming for jump and long-term memory statistics */
            if (content.msg_type === VerboseMsgType.LONG_TERM_MEMORY) {
              prev.longTerm += time;
            } else {
              prev.jump += time;
            }
          }

          prev.total += time;
        }
        if (cur.role === MessageUnitRole.TOOL) {
          const llmTime = Number(getMessageTimeCost(cur.llmOutput.extra_info));
          const toolTime =
            Number(getMessageTimeCost(cur.apiResponse?.extra_info)) || 0;
          const totalTime = llmTime + toolTime;
          prev.total += totalTime;
          prev.llm += llmTime;
          prev.tool += toolTime;
        }
        return prev;
      },
      { total: 0, llm: 0, tool: 0, dataSet: 0, jump: 0, longTerm: 0 },
    );
    const { tool, total, llm, dataSet, jump, longTerm } = timeGroup;
    const timeList = [
      {
        label: I18n.t('debug_area_time_label_llm'),
        value: llm,
      },
      {
        label: I18n.t('debug_area_time_label_plugin'),
        value: tool,
      },
      {
        label: I18n.t('debug_area_time_label_dataset'),
        value: dataSet,
      },
      {
        label: I18n.t('agentflow_jump_running_process_jump_time'),
        value: jump,
      },
      {
        label: I18n.t('timecapsule_1228_001'),
        value: longTerm,
      },
    ].filter(v => v.value);
    return `${total.toFixed(1)}s（${timeList
      .map(t => `${t.label} ${t.value.toFixed(1)}s`)
      .join('｜')}）`;
  };

  const isAllFunctionCallSuccess = !messageUnits.find(
    unit => unit.apiResponse?.extra_info.plugin_status === '1',
  );

  const hitMockSet = messageUnits.some(unit => {
    const mockHitInfo = safeJSONParse(
      unit.apiResponse?.extra_info.mock_hit_info ?? '{}',
    );
    return typeof mockHitInfo === 'object'
      ? (mockHitInfo as MockHitInfo).hitStatus === MockHitStatus.Success
      : false;
  });

  if (!latestUnit) {
    throw new Error('empty FunctionCall messageList');
  }

  const showBackground = useShowBackGround();

  return (
    <CollapsePanelWithHeader
      messageUnit={latestUnit}
      isTopLevelOfTheNestedPanel
      isPanelOpen={isTopLevelOpen}
      isLatestFunctionCallOfRelatedChat={false}
      isMessageFromOngoingChat={isMessageFromOngoingChat}
      isRelatedChatComplete={isRelatedChatComplete}
      isRelatedChatAllFunctionCallSuccess={isAllFunctionCallSuccess}
      onOpenChange={onOpenChange}
      isFakeInterruptAnswer={isFakeInterruptAnswer}
      className={classNames(
        s['main-collapse'],
        [getBackgroundColorByTheme(theme), 'rounded-normal'],
        !isTopLevelOpen && 'h-48px',
        showBackground && '!coz-bg-image-bots',
      )}
      expandable={showFunctionCallDetail}
      hitMockSet={hitMockSet}
    >
      {messageUnits.map((unit, index) => {
        let targetRef: RefObject<CollapsePanelWithHeaderRef> | undefined =
          void 0;

        if (!isRelatedChatComplete && index === messageUnits.length - 1) {
          targetRef = controlledItemRef;
        }
        return (
          <CollapsePanelWithHeader
            isTopLevelOfTheNestedPanel={false}
            isRelatedChatAllFunctionCallSuccess={isAllFunctionCallSuccess}
            key={getUnitMessageId(unit)}
            ref={targetRef}
            isPanelOpen={isTopLevelOpen ? void 0 : false}
            messageUnit={unit}
            isLatestFunctionCallOfRelatedChat={
              index === messageUnits.length - 1
            }
            isRelatedChatComplete={isRelatedChatComplete}
            isFakeInterruptAnswer={isFakeInterruptAnswer}
            isMessageFromOngoingChat={isMessageFromOngoingChat}
            expandable={showFunctionCallDetail}
          />
        );
      })}
      {isRelatedChatComplete ? (
        <Tag
          color="green"
          className="my-4px mx-12px"
          data-testid="chat-area.fncall.bot_preview_run_completed"
        >
          <Typography.Text
            className="text-[12px] leading-[16px] font-normal coz-fg-hglt-green"
            ellipsis={{
              showTooltip: {
                opts: {
                  content: getTotalTime(),
                  style: { wordBreak: 'break-word' },
                  position: 'topRight',
                  arrowPointAtCenter: false,
                },
              },
            }}
          >
            {I18n.t('bot_preview_run_completed')} {getTotalTime()}
          </Typography.Text>
        </Tag>
      ) : null}
      {!isMessageFromOngoingChat && !isRelatedChatComplete && (
        <Tag
          color="primary"
          data-testid="chat-area.fncall.bot_preview_run_terminated"
          className="my-4px mx-12px"
        >
          {I18n.t('bot_preview_run_terminated')}
        </Tag>
      )}
    </CollapsePanelWithHeader>
  );
};

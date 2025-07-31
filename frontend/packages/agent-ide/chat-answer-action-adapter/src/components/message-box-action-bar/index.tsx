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

import { useEffect, useRef } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';
import { useHover } from 'ahooks';
import { useChatBackgroundState } from '@coze-studio/bot-detail-store';
import {
  type ComponentTypesMap,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import {
  CopyTextMessage,
  DeleteMessage,
  RegenerateMessage,
  QuoteMessage,
} from '@coze-common/chat-answer-action';
import { I18n } from '@coze-arch/i18n';
import { Space, UITag } from '@coze-arch/bot-semi';

import s from './index.module.less';

const LOG_ID_TIME_PREFIX_DIGITS = 14;

export const isQueryWithinOneWeek = (logId: string) => {
  const logIdTimeString = logId.slice(0, LOG_ID_TIME_PREFIX_DIGITS);
  const logIdTime = dayjs(logIdTimeString, 'YYYYMMDDHHmmss');
  if (!logIdTime.isValid()) {
    return false;
  }
  const oneWeekAgoTime = dayjs().subtract(1, 'week');
  // The last 6 days, starting from 0:00
  return logIdTime.isAfter(oneWeekAgoTime, 'day');
};

const VerticalDivider = () => <div className={s['vertical-divider']} />;

const ActionBarWithMultiActions = () => {
  const { message, meta } = useMessageBoxContext();
  const ref = useRef<HTMLDivElement>(null);
  const hover = useHover(ref);

  const { role, type } = message;
  const { time_cost, token } = message.extra_info;

  const isLatestGroupAnswer = meta?.isFromLatestGroup;

  const isTrigger = type === 'task_manual_trigger';
  const isUserMessage = role === 'user';
  const { showBackground, backgroundModeClassName: buttonClass } =
    useChatBackgroundState();

  const isEmptyTimeCost = time_cost === '';
  const isEmptyToken = token === '';

  const isTimeCostAndTokenNotEmpty = !isEmptyTimeCost && !isEmptyToken;
  const isShowVerticalDivider = isTimeCostAndTokenNotEmpty || isTrigger;

  return (
    <>
      <div
        className={classNames(
          s['message-info'],
          isUserMessage && s['message-info-user-message-only'],
        )}
        ref={ref}
      >
        <div
          data-testid="chat-area.answer-action.left-content"
          className={classNames(
            s['message-info-text'],
            'coz-fg-secondary',
            showBackground && '!coz-fg-images-secondary',
          )}
        >
          <>
            {!isTrigger && !isEmptyTimeCost && (
              <Space spacing={4}>
                <div>{time_cost}s</div>
              </Space>
            )}
            {isTrigger ? (
              <Space spacing={4}>
                <UITag color="cyan">
                  {I18n.t('platfrom_trigger_dialog_trigge_icon')}
                </UITag>
              </Space>
            ) : null}
            {isShowVerticalDivider ? <VerticalDivider /> : null}
            {!isEmptyToken && (
              <div>
                <Space spacing={4}>
                  <div>{token} Tokens</div>
                </Space>
              </div>
            )}
          </>
        </div>
        {hover || isLatestGroupAnswer || isUserMessage ? (
          <Space
            spacing={4}
            data-testid="chat-area.answer-action.right-content"
          >
            <CopyTextMessage className={buttonClass} />
            <QuoteMessage className={buttonClass} />
            <RegenerateMessage className={buttonClass} />
            <DeleteMessage className={classNames(buttonClass)} />
          </Space>
        ) : null}
      </div>
    </>
  );
};

/**
 * Footer with title
 * 1. Intermediate message, used to display the intermediate call status of Plugin and workflow
 */
const ActionBarWithTitle = () => {
  const { message } = useMessageBoxContext();

  const { message_title } = message.extra_info;
  const { showBackground } = useChatBackgroundState();

  return (
    <div className={s['message-info']}>
      <div
        className={classNames(
          s['message-info-text'],
          'coz-fg-secondary',
          showBackground && '!coz-fg-images-secondary',
        )}
      >
        {message_title}
      </div>
    </div>
  );
};

export const MessageBoxActionBarAdapter: ComponentTypesMap['messageActionBarFooter'] =
  ({ refreshContainerWidth }) => {
    const { message, meta } = useMessageBoxContext();

    const isLastMessage = meta.isGroupLastMessage;
    const messageTitle = message?.extra_info.message_title;

    useEffect(() => {
      refreshContainerWidth();
    }, []);

    if (isLastMessage) {
      return <ActionBarWithMultiActions />;
    }

    if (messageTitle) {
      return <ActionBarWithTitle />;
    }

    return null;
  };

MessageBoxActionBarAdapter.displayName = 'MessageBoxActionBar';

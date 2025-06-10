import { useEffect, useRef } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';
import { useHover } from 'ahooks';
import { useDebugStore } from '@coze-agent-ide/space-bot/store';
import { messageSource } from '@coze-common/chat-core';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Space, UITag } from '@coze-arch/bot-semi';
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
import { IconCozDebug } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

import s from './index.module.less';

const LOG_ID_TIME_PREFIX_DIGITS = 14;

export const isQueryWithinOneWeek = (logId: string) => {
  const logIdTimeString = logId.slice(0, LOG_ID_TIME_PREFIX_DIGITS);
  const logIdTime = dayjs(logIdTimeString, 'YYYYMMDDHHmmss');
  if (!logIdTime.isValid()) {
    return false;
  }
  const oneWeekAgoTime = dayjs().subtract(1, 'week');
  // 最近 6 天，从 0 点开始
  return logIdTime.isAfter(oneWeekAgoTime, 'day');
};

const VerticalDivider = () => <div className={s['vertical-divider']} />;

const ActionBarWithMultiActions =
  // eslint-disable-next-line complexity
  () => {
    const { message, meta } = useMessageBoxContext();
    const ref = useRef<HTMLDivElement>(null);
    const hover = useHover(ref);

    const { role, type, source } = message;
    const { time_cost, token, log_id } = message.extra_info;

    const isLatestGroupAnswer = meta?.isFromLatestGroup;

    const isTrigger = type === 'task_manual_trigger';
    const isUserMessage = role === 'user';
    const isAsyncResult = source === messageSource.AsyncResult;
    const { showBackground, backgroundModeClassName: buttonClass } =
      useChatBackgroundState();

    const { setIsDebugPanelShow, setCurrentDebugQueryId } = useDebugStore();

    const handleDebug = () => {
      if (isQueryWithinOneWeek(log_id ?? '')) {
        sendTeaEvent(EVENT_NAMES.open_debug_panel, {
          path: 'msg_debug',
        });
        setCurrentDebugQueryId(log_id ?? '');
        setIsDebugPanelShow(true);
      }
    };

    const isEmptyTimeCost = time_cost === '';
    const isEmptyToken = token === '';

    const isTimeCostAndTokenNotEmpty = !isEmptyTimeCost && !isEmptyToken;
    const isShowVerticalDivider = isTimeCostAndTokenNotEmpty || isTrigger;
    const isShowDebugButton =
      (FEATURE_ENABLE_MSG_DEBUG || isQueryWithinOneWeek(log_id ?? '')) &&
      !isTrigger &&
      !isAsyncResult;

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
              {/* coze 隐藏Debug */}
              {isShowDebugButton ? (
                <Tooltip content={I18n.t('message_tool_debug')}>
                  <IconButton
                    size="small"
                    icon={<IconCozDebug className="w-[14px] h-[14px]" />}
                    color="secondary"
                    onClick={handleDebug}
                    className={classNames(buttonClass)}
                  />
                </Tooltip>
              ) : null}
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
 * 带有标题的footer
 * 1、中间消息，用于展示Plugin、workflow的中间调用状态
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

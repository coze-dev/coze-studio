import type ChatCore from '@coze-common/chat-core';
import { type GetHistoryMessageResponse } from '@coze-common/chat-core';
import { RateLimit } from '@coze-common/chat-area-utils';
import type { Reporter } from '@coze-arch/logger';

import { type LoadMoreEnvTools } from '../../../service/load-more/load-more-env-tools';
import { fixHistoryMessageList } from '../../../service/fix-message/fix-history-message-list';
import { getReportError, ReportEventNames } from '../../../report-events';
import { type SystemLifeCycleService } from '../../../plugin/life-cycle';
import { type IgnoreMessageType } from '../../../context/chat-area-context/type';
import {
  LOAD_MORE_CALL_GET_HISTORY_LIST_EXCEED_RATE_DELAY,
  LOAD_MORE_CALL_GET_HISTORY_LIST_LIMIT,
  LOAD_MORE_CALL_GET_HISTORY_LIST_TIME_WINDOW,
  MESSAGE_LIST_SIZE,
} from '../../../constants/message';

export const getLoadRequest = ({
  reporter,
  getChatCore,
  ignoreMessageConfigList,
  lifeCycleService,
}: {
  reporter: Reporter;
  getChatCore: () => ChatCore;
  ignoreMessageConfigList: IgnoreMessageType[];
  lifeCycleService: SystemLifeCycleService;
}) => {
  const request = getLoadRequestRaw({
    reporter,
    getChatCore,
    ignoreMessageConfigList,
    lifeCycleService,
  });

  const limiter = new RateLimit(request, {
    limit: LOAD_MORE_CALL_GET_HISTORY_LIST_LIMIT,
    timeWindow: LOAD_MORE_CALL_GET_HISTORY_LIST_TIME_WINDOW,
    onLimitDelay: LOAD_MORE_CALL_GET_HISTORY_LIST_EXCEED_RATE_DELAY,
  });
  return limiter.invoke;
};

const getLoadRequestRaw =
  ({
    reporter,
    getChatCore,
    ignoreMessageConfigList,
    lifeCycleService,
  }: {
    reporter: Reporter;
    getChatCore: () => ChatCore;
    ignoreMessageConfigList: IgnoreMessageType[];
    lifeCycleService: SystemLifeCycleService;
  }): LoadMoreEnvTools['loadRequest'] =>
  async ({ count, cursor, loadDirection }) => {
    try {
      const chatCore = getChatCore();

      const ctx = {
        count: count ?? MESSAGE_LIST_SIZE,
        cursor,
        load_direction: loadDirection,
      };
      const modifyCtx =
        await lifeCycleService.message.onBeforeGetMessageHistoryList({ ctx });

      const data = await chatCore.getHistoryMessage(modifyCtx);

      const fixedMessageLitData: GetHistoryMessageResponse = {
        ...data,
        message_list: fixHistoryMessageList({
          historyMessageList: data.message_list,
          reporter,
          ignoreMessageConfigList,
        }),
      };

      reporter.successEvent({ eventName: ReportEventNames.GetMessageList });
      return fixedMessageLitData;
    } catch (e) {
      reporter.errorEvent({
        eventName: ReportEventNames.GetMessageList,
        ...getReportError(e),
      });
      throw e;
    }
  };

import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash-es';
import { type Reporter } from '@coze-arch/logger';

import { type Message } from '../store/types';
import { ReportEventNames } from '../report-events/report-event-names';

export const getRegenerateMessage = ({
  userMessage,
  reporter,
}: {
  userMessage: Message;
  reporter: Reporter;
}) => {
  const clonedMessage = cloneDeep(userMessage);
  const hasLocalMessageId = Boolean(clonedMessage.extra_info.local_message_id);
  const isFromHistory = Boolean(clonedMessage._fromHistory);
  if (hasLocalMessageId) {
    return clonedMessage;
  }

  if (!isFromHistory) {
    reporter.event({
      eventName: ReportEventNames.NonHistoricalMessageWithoutLocalId,
    });
  }

  clonedMessage.extra_info.local_message_id = nanoid();

  return clonedMessage;
};

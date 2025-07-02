import { messageSource, taskType } from '@coze-common/chat-core';
import { type Message, type MessageMeta } from '@coze-common/chat-area';

import { getIsLastGroup } from './get-is-last-group';

export const getShowBotTriggerButton = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- .
  message: { source, extra_info },
  meta,
  latestSectionId,
}: {
  message: Pick<Message, 'source' | 'extra_info'>;
  meta: Pick<MessageMeta, 'isFromLatestGroup' | 'sectionId'>;
  latestSectionId: string;
}) =>
  source === messageSource.TaskManualTrigger &&
  extra_info.task_type === taskType.PresetTask &&
  getIsLastGroup({ meta, latestSectionId });

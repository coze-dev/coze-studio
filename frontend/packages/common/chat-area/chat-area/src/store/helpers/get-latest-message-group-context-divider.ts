import { type Message, type MessageGroup } from '../types';
import { markGroupShowContextDivider } from './mark-group-context-divider';

export const updateLatestMessageGroupContextDivider = ({
  messageGroupList,
  latestSectionId,
  messageList,
}: {
  messageGroupList: MessageGroup[];
  latestSectionId: string;
  messageList: Message[];
}) => {
  const latestMessageGroup = messageGroupList.at(0);
  if (!latestMessageGroup) {
    return;
  }
  markGroupShowContextDivider({
    group: latestMessageGroup,
    isShow: latestMessageGroup.sectionId !== latestSectionId,
    messages: messageList,
  });
};

import { type MessageMeta } from '@coze-common/chat-area';

export const getIsLastGroup = ({
  meta: { isFromLatestGroup, sectionId },
  latestSectionId,
}: {
  meta: Pick<MessageMeta, 'isFromLatestGroup' | 'sectionId'>;
  latestSectionId: string;
}) => isFromLatestGroup && sectionId === latestSectionId;

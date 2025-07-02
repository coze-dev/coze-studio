import {
  getIsNotificationMessage,
  useLatestSectionId,
  useMessageBoxContext,
} from '@coze-common/chat-area';

export const useIsFinalAnswerMessageInLastGroup = () => {
  const { meta } = useMessageBoxContext();

  const latestSectionId = useLatestSectionId();

  return (
    meta.isGroupLastAnswerMessage &&
    meta.isFromLatestGroup &&
    meta.sectionId === latestSectionId
  );
};

export const useIsNotificationMessage = () => {
  const { message } = useMessageBoxContext();
  return getIsNotificationMessage(message);
};

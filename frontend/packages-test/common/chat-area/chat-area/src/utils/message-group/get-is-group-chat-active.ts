import { type WaitingState, WaitingPhase } from '../../store/waiting';

export const getIsGroupChatActive = ({
  waiting,
  sending,
  groupId,
}: Pick<WaitingState, 'waiting' | 'sending'> & { groupId: string }) => {
  const isFormalWaiting =
    waiting?.replyId === groupId && waiting.phase === WaitingPhase.Formal;

  if (!sending) {
    return isFormalWaiting;
  }

  const isSending =
    sending.message_id === groupId ||
    sending?.extra_info.local_message_id === groupId;

  return isFormalWaiting || isSending;
};

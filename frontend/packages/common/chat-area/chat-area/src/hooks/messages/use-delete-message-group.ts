import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../context/use-chat-area-context';
import { deleteMessageGroupById } from '../../utils/message-group/message-group';
import { useChatActionLockService } from '../../context/chat-action-lock';

// 正在上传中的文件消息、图片消息被删除 需要清除副作用 &
export const useDeleteMessageGroup = () => {
  const context = useChatAreaContext();
  const storeSet = useChatAreaStoreSet();
  const chatActionLockService = useChatActionLockService();

  return (groupId: string) =>
    deleteMessageGroupById(groupId, {
      ...context,
      storeSet,
      chatActionLockService,
    });
};

import { type MessageMeta } from '../types';
import {
  getIsAsyncResultMessage,
  getIsTriggerMessage,
  getIsVisibleMessageMeta,
} from '../../utils/message';
import { type ChatAreaConfigs } from '../../context/chat-area-context/type';

/**
 * 从前向后扫描 meta，实际效果是从下向上（逆序展示）；
 * 若当前条与上条 role 相同，当前条隐藏 avatar
 */
export const scanAndUpdateHideAvatar = (
  metaList: MessageMeta[],
  configs: Partial<ChatAreaConfigs>,
) => {
  const visibleMessageMeta = metaList.filter(meta =>
    getIsVisibleMessageMeta(meta, configs),
  );
  if (visibleMessageMeta.length <= 1) {
    return;
  }

  if (configs.groupUserMessage) {
    scanAndUpdateHideAvatarForOther(visibleMessageMeta);
  } else {
    scanAndUpdateHideAvatarForDebug(visibleMessageMeta);
  }
};

export const scanAndUpdateHideAvatarForOther = (metaList: MessageMeta[]) => {
  for (let i = 0; i < metaList.length - 1; i++) {
    const later = metaList[i];
    const earlier = metaList[i + 1];
    if (!later || !earlier) {
      continue;
    }

    if (later.role !== earlier.role) {
      continue;
    }

    if (later.role !== 'assistant') {
      continue;
    }

    if (later.sectionId !== earlier.sectionId) {
      continue;
    }

    // 推送的任务消息单独成组，展示头像
    if (getIsTriggerMessage(later)) {
      continue;
    }

    if (getIsAsyncResultMessage(later)) {
      continue;
    }
    later.hideAvatar = true;
  }
};

export const scanAndUpdateHideAvatarForDebug = (metaList: MessageMeta[]) => {
  for (let i = 0; i < metaList.length - 1; i++) {
    const later = metaList[i];
    const earlier = metaList[i + 1];
    if (!later || !earlier) {
      continue;
    }

    if (later.role !== earlier.role) {
      continue;
    }

    if (later.role === 'user') {
      continue;
    }

    if (later.role !== 'assistant') {
      continue;
    }

    if (later.replyId !== earlier.replyId) {
      continue;
    }

    later.hideAvatar = true;
  }
};

import { type SendMessageOptions } from '@coze-common/chat-core';
import { type SendTextMessagePayload } from '@coze-common/chat-uikit-shared';

import { useMethodCommonDeps } from '../../context/use-method-common-deps';
import { toastBySendMessageResult } from '../../../utils/message';
import type { TextMessage } from '../../../store/types';
import { type SendMessagePayload } from '../../../service/send-message';
import { type MethodCommonDeps } from '../../../plugin/types';
import type { SendMessageFrom } from '../../../context/chat-area-context/chat-area-callback';
import { getSendNewMessageImplement } from './new-message';

const getCreateTextMessageImplement =
  (deps: MethodCommonDeps) =>
  (payload: SendTextMessagePayload): TextMessage => {
    const { storeSet } = deps;
    const { useSectionIdStore, useGlobalInitStore } = storeSet;
    const chatCore = useGlobalInitStore.getState().getChatCore();
    const { latestSectionId } = useSectionIdStore.getState();
    return chatCore.createTextMessage(
      {
        payload: {
          text: payload.text,
          mention_list: payload.mentionList,
        },
      },
      {
        section_id: latestSectionId,
      },
    );
  };

/**
 * 发送文本消息，需要初始化成功后使用
 */
export const useSendTextMessage = () => {
  const deps = useMethodCommonDeps();
  return getSendTextMessageImplement(deps);
};

export const getSendTextMessageImplement =
  (deps: MethodCommonDeps) =>
  async (
    payload: SendMessagePayload,
    from: SendMessageFrom,
    options?: SendMessageOptions,
  ) => {
    const createTextMessage = getCreateTextMessageImplement(deps);
    const sendMessage = getSendNewMessageImplement(deps);
    const unsentMessage = createTextMessage(payload);
    if (payload.audioFile) {
      deps.storeSet.useFileStore.getState().addAudioFile({
        localMessageId: unsentMessage.extra_info.local_message_id,
        audioFile: payload.audioFile,
      });
    }
    const result = await sendMessage(unsentMessage, from, options);
    toastBySendMessageResult(result);
  };

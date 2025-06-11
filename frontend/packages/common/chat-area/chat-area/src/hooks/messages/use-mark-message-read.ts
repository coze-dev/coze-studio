import { useMemo, useRef } from 'react';

import { useReporter } from '../public/common';
import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import type { Message } from '../../store/types';
import { MarkReadHelper, MarkReadService } from '../../service/mark-read';
import { usePreference } from '../../context/preference';
import { useMarkReadService } from '../../context/after-init-service';

export const usePrepareMarkMessageReadService = () => {
  const reporter = useReporter();
  const { useMessageIndexStore, useGlobalInitStore } = useChatAreaStoreSet();

  const helperRef = useRef<MarkReadHelper | null>(null);
  helperRef.current = new MarkReadHelper({
    getEnvInfo: () => ({
      conversationId: useGlobalInitStore.getState().conversationId,
      currentReadIndex: useMessageIndexStore.getState().readIndex,
    }),
    reporter,
    updateIndex: useMessageIndexStore.getState().updateIndex,
  });

  const controller = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- 哥,指定有
    () => new MarkReadService(() => helperRef.current!),
    [],
  );
  return controller;
};

/**
 * UI 组件用这个,进行消息已读上报.
 * 遵守 `enableMarkRead` (默认为 false)配置
 */
export const useMarkMessageRead = () => {
  const markReadService = useMarkReadService();
  const { enableMarkRead } = usePreference();
  const reported = useRef(false);
  const { useMessageIndexStore } = useChatAreaStoreSet();
  const reportMarkRead = (
    message: Pick<
      Message,
      'message_id' | 'source' | 'content' | 'message_index'
    >,
  ) => {
    if (
      !enableMarkRead ||
      useMessageIndexStore.getState().ignoreIndexAndHistoryMessages
    ) {
      return;
    }

    const index = message.message_index;
    if (reported.current || index === undefined) {
      return;
    }
    markReadService.requireMarkRead(index);
    reported.current = true;
  };

  return reportMarkRead;
};

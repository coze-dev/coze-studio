/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- brother, specify yes
    () => new MarkReadService(() => helperRef.current!),
    [],
  );
  return controller;
};

/**
 * The UI component uses this to read and report the message.
 * Comply with'enableMarkRead ' (default false) configuration
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

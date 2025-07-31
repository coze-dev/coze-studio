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

import { useEffect, useRef } from 'react';

import { useImperativeLayoutEffect } from '@coze-common/chat-hooks';
import {
  type ClearMessageContextProps,
  ContentType,
  type Message,
} from '@coze-common/chat-core';

import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../context/use-chat-area-context';
import { getNewConversationDomId } from '../../utils/get-new-conversation-dom-id';
import { fixMessageStruct } from '../../service/fix-message/fix-message-struct';
import { ReportEventNames, getReportError } from '../../report-events';
import { useLoadMoreClient } from '../../context/load-more';
import { useChatActionLockService } from '../../context/chat-action-lock';
import { useStopResponding } from './use-stop-responding';

const DELAY_TIME = 150;
/**
 * Clear session context
 */

export const useClearContext = () => {
  const { reporter, eventCallback, lifeCycleService } = useChatAreaContext();

  const {
    useGlobalInitStore,
    useSectionIdStore,
    useSuggestionsStore,
    useMessagesStore,
    useSelectionStore,
  } = useChatAreaStoreSet();

  const { setLatestSectionId } = useSectionIdStore();
  const { loadEagerly } = useLoadMoreClient();
  const addMessages = useMessagesStore(state => state.addMessages);
  const chatActionLockService = useChatActionLockService();
  const stopResponding = useStopResponding();
  const chatCore = useGlobalInitStore(state => state.getChatCore());
  const clearSuggestions = useSuggestionsStore(state => state.clearSuggestions);

  const latestOnboardingId = useSelectionStore(state =>
    state.onboardingIdList?.at(-1),
  );

  const requireScrollIntoView = useImperativeLayoutEffect(() => {
    const dom = document.getElementById(
      getNewConversationDomId(latestOnboardingId),
    );
    dom?.scrollIntoView();
  });
  const taskIdRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(
    () => () => {
      if (!taskIdRef.current) {
        return;
      }

      clearTimeout(taskIdRef.current);
    },
    [],
  );

  return async () => {
    if (chatActionLockService.globalAction.getIsLock('clearContext')) {
      return;
    }
    try {
      chatActionLockService.globalAction.lock('clearContext', null);
      await loadEagerly();
      const clearMessageContextParams: Pick<
        ClearMessageContextProps,
        'insert_history_message_list'
      > = {
        insert_history_message_list: [],
      };

      const newClearMessageContextParams =
        eventCallback?.onClearContextBefore?.(clearMessageContextParams);

      const processedClearMessageContextParams =
        await lifeCycleService.command.onBeforeClearContext({
          ctx: newClearMessageContextParams ?? clearMessageContextParams,
        });

      await stopResponding();
      const res = await chatCore.clearMessageContext(
        processedClearMessageContextParams,
      );
      if (!res) {
        throw new Error('fail to get clearMessageContext res');
      }

      const { new_section_id, new_section_message_list } = res;
      setLatestSectionId(new_section_id);
      clearSuggestions();

      if (new_section_message_list?.length) {
        addMessages(
          new_section_message_list.map((msg: Message<ContentType>) =>
            fixMessageStruct(msg, reporter),
          ),
          { toLatest: true },
        );
      }

      const hasCardMessage = new_section_message_list?.some(
        (msg: Message<ContentType>) => msg.content_type === ContentType.Card,
      );

      /**
       * TODO: Temporary Solutions
       * The reason for the problem is that the loading of Card is asynchronous and cannot be covered by layoutEffect;
       * Temporary solution: use setTimeout to solve the phenomenon first
       * Long-term plan: The card is required to provide the rendered eventCallback, and the rendered events are scrolled by collecting the rendered events
       */
      if (hasCardMessage) {
        const taskId = setTimeout(() => {
          requireScrollIntoView();
        }, DELAY_TIME);

        taskIdRef.current = taskId;
      } else {
        requireScrollIntoView();
      }

      reporter.event({ eventName: ReportEventNames.ClearContext });
      eventCallback?.onClearContextAfter?.();
      await lifeCycleService.command.onAfterClearContext();
    } catch (e) {
      eventCallback?.onClearContextError?.();
      await lifeCycleService.command.onClearContextError();
      reporter.errorEvent({
        eventName: ReportEventNames.ClearContext,
        ...getReportError(e),
      });
    } finally {
      chatActionLockService.globalAction.unlock('clearContext');
    }
  };
};

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

import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';

import {
  isAnswerFinishVerboseMessage,
  isAllFinishVerboseMessage,
} from '../utils/verbose';
import { type MessageIdStruct, type Message } from './types';

export type WaitingStoreStateAction = WaitingState & WaitingAction;

export interface Responding {
  /** The original message, the reply_id */
  replyId: string;
  /** Reply to the message message_id
   * Function call execution interval: [function_call (index = n), tool_response (index = n + 1) ] tmd
   * Responding interval: function call & type = answer not is_finish
   */
  response: {
    id: string;
    type: Message['type'];
    index: Message['index'];
    streamPlugin: {
      streamUuid: string;
    } | null;
  }[];
}

export const enum WaitingPhase {
  /** Regular process, no suggestions */
  Formal = 'formal',
  /** Generating suggestions */
  Suggestion = 'suggestion',
}

export interface Waiting {
  /** Question message_id */
  replyId: string;
  /** Question local_message_id */
  questionLocalMessageId?: string;
  phase: WaitingPhase;
}

/**
 * Complete process: send - > ack -- > function call - > tool response - > answer is_finish - > follow_up - > pullingStatus settled
 *           |_sending_|___________________waiting__phase:formal_______________|_______waiting__phase:suggestion_____|
 *                            |___________________responding___________________|
 */
export interface WaitingState {
  /**
   * From start to send message to send successfully (received to ack)
   */
  sending: MessageIdStruct | null;
  /**
   * Waiting &! responding shows [...] Loading
   * Waiting interval: [query sent, type = answer is_finish]
   */
  waiting: Waiting | null;
  /**
   * Generating reply now.
   * Life: [Received reply, reply is_finish]
   */
  responding: Responding | null;
}

interface WaitingAction {
  startSending: (messageIdStruct: MessageIdStruct) => void;
  clearSending: () => void;
  startWaiting: (message: Message) => void;
  updateWaiting: (message: Message) => void;
  updateResponding: (message: Message) => void;
  updateRespondingByImmer: (
    updater: (waitingState: WaitingState) => void,
  ) => void;
  /** Note that if you need a responsive effect, you need to execute it directly in the useStore selector, otherwise it will not trigger render. */
  getIsOnlyWaitingSuggestions: () => boolean;
  clearAllUnsettledUnconditionally: () => void;
  clearUnsettledByReplyId: (replyId: string) => void;
  clearWaitingStore: () => void;
  getIsSending: () => boolean;
  getIsWaiting: (phase: WaitingPhase) => boolean;
  getIsResponding: () => boolean;
}

export const findRespondRecord = (
  message: Message,
  response: Responding['response'],
) => response.find(i => i.id === message.message_id);

const findRespondByIndex = (idx: number, response: Responding['response']) =>
  response.findIndex(i => i.index === idx);

export const getResponse = (
  message: Message,
): Responding['response'][number] => ({
  index: message.index,
  type: message.type,
  id: message.message_id,
  streamPlugin: message.extra_info.stream_plugin_running
    ? {
        streamUuid: message.extra_info.stream_plugin_running,
      }
    : null,
});

export const createWaitingStore = (mark: string) => {
  const useWaitingStore = createWithEqualityFn<WaitingState & WaitingAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        sending: null,
        waiting: null,
        responding: null,
        startSending: messageIdStruct =>
          set({ sending: messageIdStruct }, false, 'startSending'),
        clearSending: () => set({ sending: null }, false, 'clearSending'),
        getIsOnlyWaitingSuggestions: () => {
          const { waiting } = get();
          return waiting?.phase === WaitingPhase.Suggestion;
        },
        startWaiting: message =>
          set(
            {
              waiting: {
                replyId: message.message_id,
                questionLocalMessageId: message.extra_info?.local_message_id,
                phase: WaitingPhase.Formal,
              },
            },
            false,
            'setWaitingId',
          ),
        updateWaiting: message => {
          const { reply_id } = message;
          if (get().waiting?.replyId !== reply_id) {
            return;
          }
          if (isAnswerFinishVerboseMessage(message)) {
            set(
              produce<WaitingState>(state => {
                // It has been checked above, and it will not go here.
                if (!state.waiting) {
                  throw new Error('is not in waiting');
                }
                state.waiting.phase = WaitingPhase.Suggestion;
              }),
              false,
              'updateWaiting',
            );
          }
        },
        updateResponding: message => {
          set(
            produce<WaitingState>(state => {
              updateRespondingInImmer(state, message);
            }),
            false,
            'updateResponding',
          );
        },
        updateRespondingByImmer: updater => {
          set(
            produce<WaitingState>(state => updater(state)),
            false,
            'updateRespondingByImmer',
          );
        },
        clearUnsettledByReplyId: replyId => {
          set(
            produce<WaitingState>(state => {
              if (state.waiting?.replyId === replyId) {
                state.waiting = null;
              }
              if (state.responding?.replyId === replyId) {
                state.responding = null;
              }
            }),
            false,
            'clearAllUnsettledByReplyId',
          );
        },
        clearAllUnsettledUnconditionally: () => {
          set(
            produce<WaitingState>(state => {
              state.waiting = null;
              state.responding = null;
              state.sending = null;
            }),
            false,
            'clearAllUnsettledUnconditionally',
          );
        },
        clearWaitingStore: () => {
          set({
            sending: null,
            waiting: null,
            responding: null,
          });
        },
        getIsSending: () => !!get().sending,
        getIsWaiting: (phase: WaitingPhase) => get().waiting?.phase === phase,
        getIsResponding: () => !!get().responding,
      })),
      {
        name: `botStudio.ChatAreaWaiting.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useWaitingStore;
};

export type WaitingStore = ReturnType<typeof createWaitingStore>;

const isAnswerMessageFinish = (message: Message) =>
  message.type === 'answer' && message.is_finish;

const updateRespondingInImmer = (state: WaitingState, message: Message) => {
  const { responding } = state;
  const isAllFinish = isAllFinishVerboseMessage(message);

  if (!responding) {
    // type=answer & is_finish
    if (isAllFinish) {
      return;
    }

    // Only tool_response is an exception (interrupt scenario returns the first tool_response, just return directly)
    if (message.type === 'tool_response') {
      return;
    }

    // Enter
    state.responding = {
      replyId: message.reply_id,
      response: [getResponse(message)],
    };
    return;
  }

  const currentReplyId = responding.replyId;
  if (currentReplyId !== message.reply_id) {
    console.error(
      `updateRespondingInImmer not match reply id, income: ${message.reply_id}, record: ${responding?.replyId}`,
    );
    return;
  }

  // Answer end, interrupt finish package terminates reply state
  if (isAllFinish) {
    state.responding = null;
    return;
  }

  // Processing answer not completed
  if (message.type === 'answer') {
    const record = findRespondRecord(message, responding.response);
    if (!record) {
      responding.response.push(getResponse(message));
    }
  }

  if (isAnswerMessageFinish(message)) {
    const record = findRespondRecord(message, responding.response);
    if (!record) {
      return;
    }
    const index = responding.response.indexOf(record);
    if (index >= 0) {
      responding.response.splice(index, 1);
    }
  }

  if (message.type === 'tool_response') {
    handleToolResponseMessage({
      responding,
      message,
    });
    return;
  }

  if (message.type === 'function_call') {
    responding.response.push(getResponse(message));
    return;
  }
};
const handleToolResponseMessage = ({
  responding,
  message,
}: {
  responding: Responding;
  message: Message;
}) => {
  // TODO: Temporarily display loading according to ordinary plugins.
  handleNormalPluginMessage({ responding, message });
  // //plugin related news
  // if (isNormalPlugin(message)) {
  //   handleNormalPluginMessage({ responding, message });
  //   return;
  // }
  // //3. End of streaming plugin
  // if (isStreamPluginFinish(message)) {
  //   handleStreamPluginMessage({ responding, message });
  // }
};
const handleNormalPluginMessage = ({
  responding,
  message,
}: {
  responding: Responding;
  message: Message;
}) => {
  const curIndex = message.index;
  if (typeof curIndex !== 'number') {
    console.error(`unexpected empty index of ${message.type} ${message.index}`);
    return;
  }
  const targetIndex = curIndex - 1;
  const functionCallIndex = findRespondByIndex(
    targetIndex,
    responding.response,
  );
  if (functionCallIndex < 0) {
    console.error(
      `updateRespondingInImmer: cannot find related function call , expect index ${targetIndex}`,
    );
    return;
  }
  responding.response.splice(functionCallIndex, 1);
};

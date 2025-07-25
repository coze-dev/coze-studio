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
  /** 原消息，即 reply_id */
  replyId: string;
  /** 回复的消息 message_id
   * function call 执行区间：[function_call(index=n), tool_response(index=n+1)] tmd
   * responding 区间：function call & type=answer not is_finish
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
  /** 常规流程,不含 suggestion */
  Formal = 'formal',
  /** 生成 suggestion 中 */
  Suggestion = 'suggestion',
}

export interface Waiting {
  /** 问题 message_id */
  replyId: string;
  /** 问题 local_message_id */
  questionLocalMessageId?: string;
  phase: WaitingPhase;
}

/**
 * 完整过程: send ->  ack --> function call -> tool response -> answer is_finish -> follow_up -> pullingStatus settled
 *           |_sending_|___________________waiting__phase:formal_______________|_______waiting__phase:suggestion_____|
 *                            |___________________responding___________________|
 */
export interface WaitingState {
  /**
   * 从开始发送消息到发送成功（接受到 ack）
   */
  sending: MessageIdStruct | null;
  /**
   * waiting & !responding 则展示 [...] 加载中
   * waiting 区间：[query sent, type=answer is_finish]
   */
  waiting: Waiting | null;
  /**
   * 正在生成回复中
   * life: [接受到回复, 回复 is_finish]
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
  /** 注意如果需要响应式效果，需要在 useStore selector 里直接执行，否则不会触发 render */
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
                // 上面检查过了，不会走到这里
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

    // 只有 tool_response 为异常(中断场景返回第一条为tool_response，直接return即可)
    if (message.type === 'tool_response') {
      return;
    }

    // 录入
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

  // answer结束、中断finish包都终止回复状态
  if (isAllFinish) {
    state.responding = null;
    return;
  }

  // 处理 answer 未完成
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
  // TODO: 暂时都按照普通插件展示loading
  handleNormalPluginMessage({ responding, message });
  // // 插件相关的消息
  // if (isNormalPlugin(message)) {
  //   handleNormalPluginMessage({ responding, message });
  //   return;
  // }
  // // 3、流式插件结束
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

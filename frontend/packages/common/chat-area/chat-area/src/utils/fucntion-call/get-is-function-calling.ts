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

import { sliceArrayByIndexRange } from '../array';
import { type Message } from '../../store/types';

const searchSide = 15;

export const getIsFunctionCalling = (
  index: number,
  messageList: Message[],
): boolean => {
  const message = messageList[index];
  if (!message) {
    throw new Error(`cannot find message of index: ${index}`);
  }
  if (message._fromHistory) {
    return false;
  }
  if (message.type !== 'function_call') {
    return false;
  }
  const functionCallFinished = getIsFinishedFunctionCallCached(
    message,
    index,
    messageList,
  );
  return !functionCallFinished;
};

/**
 * - message id is uuid
 * - Once in the finished function call state, it is impossible to move out
 * - No need to clean up
 */
const finishedFunctionCallMessageMap = new Map<
  string,
  {
    isFinish: boolean;
    isStreamPlugin: boolean;
    streamPlugin: { streamUuid: string } | null;
  }
>();

const getIsFinishedFunctionCallCached = (
  message: Message,
  index: number,
  messageList: Message[],
): boolean => {
  const { message_id } = message;
  if (finishedFunctionCallMessageMap.get(message_id)?.isFinish) {
    return true;
  }
  updateFinishFunctionCallMessageMap(message, index, messageList);

  return !!finishedFunctionCallMessageMap.get(message_id)?.isFinish;
};

/** @deprecated only via cached access */
const updateFinishFunctionCallMessageMap = (
  message: Message,
  index: number,
  messageList: Message[],
) => {
  const functionCallIndex = message.index;
  if (typeof functionCallIndex !== 'number') {
    console.error('function call message without index', message);
    return;
  }
  const targetIndex = functionCallIndex + 1;
  const searchItems = sliceArrayByIndexRange(messageList, index, searchSide);
  searchItems.find(item => {
    const isTargetResponse =
      item.reply_id === message.reply_id &&
      (item.extra_info?.call_id === message.extra_info?.call_id ||
        item.index === targetIndex) &&
      item.type === 'tool_response';
    // TODO: Temporarily display loading according to ordinary plugins.
    if (isTargetResponse) {
      finishedFunctionCallMessageMap.set(message.message_id, {
        isFinish: true,
        isStreamPlugin: false,
        streamPlugin: null,
      });
    }
  });
};

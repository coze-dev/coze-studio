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

import { isObject } from 'lodash-es';
import {
  type VerboseContent,
  VerboseMsgType,
  FinishReasonType,
  type AnswerFinishVerboseData,
} from '@coze-common/chat-core';

import {
  type VerboseContentData,
  type Message,
  type KnowledgeRecallSlice,
} from '../store/types';
import { safeJSONParseV2 } from './safe-json-parse';

export type VerboseDataMaps = {
  [VerboseMsgType.STREAM_PLUGIN_FINISH]: {
    uuid: string;
    tool_output_content: string;
  };
  [VerboseMsgType.GENERATE_ANSWER_FINISH]: AnswerFinishVerboseData;
} & {
  [key in Exclude<
    VerboseMsgType,
    [VerboseMsgType.STREAM_PLUGIN_FINISH, VerboseMsgType.GENERATE_ANSWER_FINISH]
  >]: unknown;
};

export interface VerboseContentObj<T extends VerboseMsgType> {
  msg_type: T;
  data: string;
  dataObj: VerboseDataMaps[T] | null;
}

export const isVerboseMessage = (message: Message) =>
  message.type === 'verbose';

export const isVerboseMessageType = (
  message: Message,
  type: VerboseMsgType,
) => {
  if (!isVerboseMessage(message)) {
    return false;
  }
  const { content } = message;
  const verboseContent = safeJSONParseV2<VerboseContent>(content, null).value;
  if (!verboseContent) {
    return false;
  }
  return verboseContent.msg_type === type;
};

export const isVerboseContent = (value: unknown): value is VerboseContent =>
  isObject(value) && 'msg_type' in value && 'data' in value;

export function isVerboseContentData(
  value: unknown,
): value is VerboseContentData {
  return isObject(value);
}

/**
 * @Deprecated This structure is wrong, keep it for now to avoid affecting the line
 */
export const isKnowledgeRecallVerboseContentDeprecated = (
  value: unknown,
): value is {
  verbose_type: string;
  chunks: KnowledgeRecallSlice[];
} =>
  isObject(value) &&
  'verbose_type' in value &&
  'chunks' in value &&
  value.verbose_type === 'knowledge';

export const isKnowledgeRecallVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.KNOWLEDGE_RECALL;

/**
 * Is it an interrupt authorization message, note no required_action?. submit_tool_outputs?. tool_calls class behavior require_info interrupt is not rendered!!!
 * @param message
 */
export const isRequireInfoInterruptMessage = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.INTERRUPT) &&
  message.required_action?.submit_tool_outputs?.tool_calls?.some(
    item => item.type === 'require_info',
  );

/**
 * Determine if the answer is all over
 * @param message
 * At present, there may be a finish package in a group. If you need to filter out the interrupt scene through finish_reason, you will get the finish that answers all the ends.
 */
export const isAnswerFinishVerboseMessage = (message: Message) => {
  const res = getVerboseContentObj<VerboseMsgType.GENERATE_ANSWER_FINISH>(
    message.content,
  );

  return (
    isVerboseMessageType(message, VerboseMsgType.GENERATE_ANSWER_FINISH) &&
    res?.dataObj?.finish_reason !== FinishReasonType.INTERRUPT
  );
};

/**
 * Determine whether the answer is non-aborted
 * @param message
 * At present, finish_reason = 1 interrupt in a group, function_call copy may not be the "operation suspension" expressed by the business, but may be a custom "to be replied".
 * There may be verbose packages where required_action submit_tool_outputs tool_call type === 'reply_message' for "to reply"
 */
export const isFakeInterruptVerboseMessage = (message: Message) =>
  message?.required_action?.submit_tool_outputs?.tool_calls?.some(
    item => item.type === 'reply_message',
  );
/**
 * Determine whether it is generate_answer_finish package, currently including interrupt and answer all over
 * @param message
 */
export const isAllFinishVerboseMessage = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.GENERATE_ANSWER_FINISH);

/**
 * Whether the response to the streaming plugin ends verbose
 * @param message
 */
export const isStreamPluginFinish = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.STREAM_PLUGIN_FINISH);

/**
 * Is it a jump node?
 * @param message
 */
export const isJumpToVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.JUMP_TO);
export const isJumpToVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.JUMP_TO;

/**
 * Is it a backtracking node?
 * @param message
 */
export const isBackwardsVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.BACK_WORD);
export const isBackwardsVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.BACK_WORD;

/**
 * Is it a long-term memory node?
 * @param message
 */
export const isLongTermMemoryVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.LONG_TERM_MEMORY);
export const isLongTermMemoryVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.LONG_TERM_MEMORY;

/**
 * Get verbose content
 */
export const getVerboseContentObj = <T extends keyof VerboseDataMaps>(
  content: string,
): VerboseContentObj<T> | null => {
  const verboseContent = safeJSONParseV2<VerboseContent>(content, null).value;
  if (!verboseContent) {
    return null;
  }
  const { msg_type, data } = verboseContent;
  if (!data) {
    return {
      msg_type: msg_type as T,
      data: '',
      dataObj: null,
    };
  }
  const dataObj = safeJSONParseV2<VerboseDataMaps[T]>(data, null).value;
  return {
    msg_type: msg_type as T,
    data: '',
    dataObj: dataObj as VerboseDataMaps[T],
  };
};

/**
 * Filter Verbose messages based on configuration config
 */
export const filterVerboseMessageByVerboseMessageConfig = (
  message: Message,
  verboseMessageConfig: {
    ignoreJumpToAgentMessage: boolean;
    ignoreLongTermMemoryMessage: boolean;
    ignoreBackwardsMessage: boolean;
  },
) => {
  const verboseConfig = verboseMessageConfig;
  const ignoreChecks = {
    ignoreJumpToAgentMessage: isJumpToVerbose,
    ignoreLongTermMemoryMessage: isLongTermMemoryVerbose,
    ignoreBackwardsMessage: isBackwardsVerbose,
  };

  for (const [ignoreCondition, checkFunction] of Object.entries(ignoreChecks)) {
    if (
      verboseConfig[ignoreCondition as keyof typeof ignoreChecks] &&
      checkFunction(message)
    ) {
      return true;
    }
  }
  return false;
};

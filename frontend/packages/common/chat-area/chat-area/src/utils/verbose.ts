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
 * @deprecated 这个结构是错的 暂时保留避免影响线上
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
 * 是否为中断授权消息，注意没有required_action?.submit_tool_outputs?.tool_calls内类行为require_info的interrupt不渲染！！！
 * @param message
 */
export const isRequireInfoInterruptMessage = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.INTERRUPT) &&
  message.required_action?.submit_tool_outputs?.tool_calls?.some(
    item => item.type === 'require_info',
  );

/**
 * 判断回答是否全部结束
 * @param message
 * 目前一个group内可能会有finish包，需要通过finish_reason过滤掉中断场景的，拿到的就是回答全部结束的finish
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
 * 判断回答是否非运行中止
 * @param message
 * 目前一个group内finish_reason = 1 打断，function_call 文案可能不是业务表示的“运行中止”，可能是自定义的“待回复”
 * 可能会有verbose包，其中 required_action.submit_tool_outputs.tool_call内 type === 'reply_message'代表  “待回复”
 */
export const isFakeInterruptVerboseMessage = (message: Message) =>
  message?.required_action?.submit_tool_outputs?.tool_calls?.some(
    item => item.type === 'reply_message',
  );
/**
 * 判断是否为generate_answer_finish包，目前包括中断和回答全部结束
 * @param message
 */
export const isAllFinishVerboseMessage = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.GENERATE_ANSWER_FINISH);

/**
 * 是否是流式插件的response结束verbose
 * @param message
 */
export const isStreamPluginFinish = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.STREAM_PLUGIN_FINISH);

/**
 * 是否是跳转节点
 * @param message
 */
export const isJumpToVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.JUMP_TO);
export const isJumpToVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.JUMP_TO;

/**
 * 是否是回溯节点
 * @param message
 */
export const isBackwardsVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.BACK_WORD);
export const isBackwardsVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.BACK_WORD;

/**
 * 是否是长期记忆节点
 * @param message
 */
export const isLongTermMemoryVerbose = (message: Message) =>
  isVerboseMessageType(message, VerboseMsgType.LONG_TERM_MEMORY);
export const isLongTermMemoryVerboseContent = (value: unknown) =>
  isVerboseContent(value) && value.msg_type === VerboseMsgType.LONG_TERM_MEMORY;

/**
 * 获取verbose的content
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
 * 根据配置config，过滤Verbose消息
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

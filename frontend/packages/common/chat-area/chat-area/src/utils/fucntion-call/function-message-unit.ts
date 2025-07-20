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
 
import { VerboseMsgType } from '@coze-common/chat-core';

import {
  getVerboseContentObj,
  isStreamPluginFinish,
  isVerboseContent,
  isKnowledgeRecallVerboseContentDeprecated,
} from '../verbose';
import { safeJSONParse } from '../safe-json-parse';
import { primitiveExhaustiveCheck } from '../exhaustive-check';
import type { Message } from '../../store/types';
import {
  type FunctionCallMessageUnit,
  type MessageExt,
  MessageUnitRole,
} from './types';

export const getMessageTimeCost = (ext?: MessageExt) => ext?.time_cost;
export const getMessageUnitsByFunctionCallMessageList = (
  functionCallMessageList: Message[],
) => {
  // 生成messageUnits
  const messageUnits = functionCallMessageList
    .map((m, i) => {
      const role = getRoleByMessage(m);
      if (!role) {
        return null;
      }
      return {
        role,
        llmOutput: m,
        // 后续统一走id对匹配
        callId: m.extra_info.call_id,
        // TODO：【该方式为兜底，后续逐渐下掉，都用id匹配】消息顺序倒序,response消息在前一位。
        apiIndexMark: role === MessageUnitRole.TOOL ? i - 1 : undefined,
        time: getMessageTimeCost(m.extra_info),
      };
    })
    .filter(Boolean) as FunctionCallMessageUnit[];

  // 根据tool_response修改messageUnits
  const modifiedMessageUnits = functionCallMessageList.reduceRight(
    (acc, message, index) => {
      modifyMessageUnitByToolResponseMessage(message, acc, index);
      return acc;
    },
    messageUnits,
  );

  // 接收到的消息是倒叙，需要正序渲染
  return modifiedMessageUnits.reverse();
};

//根据message获取对应的role
const getRoleByMessage = (message: Message) => {
  const { type, content } = message;

  if (type === 'knowledge') {
    return MessageUnitRole.DATA_SET;
  }
  if (type === 'function_call') {
    return MessageUnitRole.TOOL;
  }

  if (type !== 'verbose') {
    return;
  }

  const parsedContent = safeJSONParse(content);

  if (!isVerboseContent(parsedContent)) {
    /**
     * 这是遗留的错误 verbose 数据, 暂时保留使得线上功能正常
     */
    if (isKnowledgeRecallVerboseContentDeprecated(parsedContent)) {
      return MessageUnitRole.DATA_SET;
    }
    return;
  }

  const { msg_type } = parsedContent;
  if (msg_type === VerboseMsgType.HOOK_CALL) {
    return MessageUnitRole.HOOKS;
  }
  if (msg_type === VerboseMsgType.KNOWLEDGE_RECALL) {
    return MessageUnitRole.DATA_SET;
  }

  /** 需要渲染的verbose协议 */
  if (
    msg_type === VerboseMsgType.JUMP_TO ||
    msg_type === VerboseMsgType.BACK_WORD ||
    msg_type === VerboseMsgType.LONG_TERM_MEMORY
  ) {
    return MessageUnitRole.VERBOSE;
  }

  /**
   * 不对这两个 verbose 消息做任何处理
   */
  if (
    msg_type === VerboseMsgType.GENERATE_ANSWER_FINISH ||
    msg_type === VerboseMsgType.STREAM_PLUGIN_FINISH ||
    msg_type === VerboseMsgType.INTERRUPT
  ) {
    return;
  }

  primitiveExhaustiveCheck(msg_type);

  return;
};

// index+1、streamId兜底匹配function_call，兼容场景：普通场景、流式插件
const findTargetToolUnit = (
  messageUnits: FunctionCallMessageUnit[],
  index: number,
  streamUuid?: string,
) =>
  messageUnits.find<FunctionCallMessageUnit>(
    (unit): unit is FunctionCallMessageUnit =>
      unit.role === MessageUnitRole.TOOL &&
      (streamUuid
        ? unit.streamUuid === streamUuid
        : unit.apiIndexMark === index),
  );
// function_call通用匹配机制，id对匹配
const findTargetFunctionCall = (
  messageUnits: FunctionCallMessageUnit[],
  id?: string,
) =>
  messageUnits.find<FunctionCallMessageUnit>(
    (unit): unit is FunctionCallMessageUnit =>
      unit.role === MessageUnitRole.TOOL && unit.callId === id,
  );

// 匹配function_call id，将tool_response中的id与其进行匹配，并更新插件结果
const handelMatchCallId = (
  message: Message,
  messageUnits: FunctionCallMessageUnit[],
) => {
  const targetToolUnit = findTargetFunctionCall(
    messageUnits,
    message.extra_info.call_id,
  );
  if (!targetToolUnit) {
    return;
  }
  targetToolUnit.apiResponse = message;
  targetToolUnit.isFinish = true;
  targetToolUnit.time = (
    Number(targetToolUnit.time ?? '0') +
    Number(getMessageTimeCost(message.extra_info) ?? '0')
  ).toFixed(1);
  return;
};

/** 处理tool_response结果，找到对应的function调用，并将其插入输出结果
 *  场景：id对匹配、index+1普通匹配、流式插件verbose匹配
 */
const modifyMessageUnitByToolResponseMessage = (
  message: Message,
  messageUnits: FunctionCallMessageUnit[],
  index: number,
) => {
  // 插件相关的消息
  // p0、优先匹配function call_id
  if (isHaveFunctionId(message)) {
    handelMatchCallId(message, messageUnits);
    return;
  }
  // 1、非流式插件
  if (isNormalPlugin(message)) {
    // 获取 targetToolUnit
    const targetToolUnit = findTargetToolUnit(messageUnits, index);
    if (!targetToolUnit) {
      return;
    }
    targetToolUnit.apiResponse = message;
    targetToolUnit.isFinish = true;
    targetToolUnit.time = (
      Number(targetToolUnit.time ?? '0') +
      Number(getMessageTimeCost(message.extra_info) ?? '0')
    ).toFixed(1);
    return;
  }
  // 2、流式插件开始
  if (isStreamPluginRunning(message)) {
    // 获取 targetToolUnit
    const targetToolUnit = findTargetToolUnit(messageUnits, index);
    if (!targetToolUnit) {
      return;
    }
    targetToolUnit.streamUuid = message.extra_info.stream_plugin_running;
    targetToolUnit.apiResponse = message;
    return;
  }
  // 2、流式插件结束
  if (isStreamPluginFinish(message)) {
    const messageContentObj =
      getVerboseContentObj<VerboseMsgType.STREAM_PLUGIN_FINISH>(
        message.content,
      );
    if (!messageContentObj) {
      return;
    }
    const { dataObj } = messageContentObj;
    if (!dataObj) {
      return;
    }
    const { tool_output_content, uuid } = dataObj;
    // 获取 targetToolUnit
    const targetToolUnit = findTargetToolUnit(messageUnits, index, uuid);
    if (!targetToolUnit) {
      return;
    }
    targetToolUnit.isFinish = true;
    targetToolUnit.apiResponse = {
      ...message,
      content: tool_output_content,
    };
    targetToolUnit.time = (
      Number(targetToolUnit.time ?? '0') +
      Number(getMessageTimeCost(message.extra_info) ?? '0')
    ).toFixed(1);
  }
};

// 是否是流式插件
export function isStreamPlugin(message: Message): boolean {
  return isStreamPluginRunning(message) || isStreamPluginFinish(message);
}

export function isStreamPluginRunning(message: Message): boolean {
  return (
    message.type === 'tool_response' &&
    !!message.extra_info.stream_plugin_running
  );
}

export function isNormalPlugin(message: Message): boolean {
  return message.type === 'tool_response' && !isStreamPlugin(message);
}

// 是否有function_call id做匹配
export function isHaveFunctionId(message: Message): boolean {
  return message.type === 'tool_response' && !!message.extra_info.call_id;
}

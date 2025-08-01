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
  // Generate messageUnits
  const messageUnits = functionCallMessageList
    .map((m, i) => {
      const role = getRoleByMessage(m);
      if (!role) {
        return null;
      }
      return {
        role,
        llmOutput: m,
        // Follow-up unified ID pair matching
        callId: m.extra_info.call_id,
        // TODO: [This method is to cover the bottom, and then gradually drop it, all use id matching] The message order is reversed, and the response message is in the first place.
        apiIndexMark: role === MessageUnitRole.TOOL ? i - 1 : undefined,
        time: getMessageTimeCost(m.extra_info),
      };
    })
    .filter(Boolean) as FunctionCallMessageUnit[];

  // Modify messageUnits according to tool_response
  const modifiedMessageUnits = functionCallMessageList.reduceRight(
    (acc, message, index) => {
      modifyMessageUnitByToolResponseMessage(message, acc, index);
      return acc;
    },
    messageUnits,
  );

  // The received message is a flashback and needs to be rendered in order.
  return modifiedMessageUnits.reverse();
};

//Get the corresponding role according to the message
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
     * This is the legacy error verbose data, temporarily retained to make the online function normal
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

  /** Verbose protocol to render */
  if (
    msg_type === VerboseMsgType.JUMP_TO ||
    msg_type === VerboseMsgType.BACK_WORD ||
    msg_type === VerboseMsgType.LONG_TERM_MEMORY
  ) {
    return MessageUnitRole.VERBOSE;
  }

  /**
   * Do nothing with these two verbose messages
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

// Index + 1, streamId bottom matching function_call, compatible scenes: ordinary scenes, streaming plug-ins
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
// function_call universal matching mechanism, id pair matching
const findTargetFunctionCall = (
  messageUnits: FunctionCallMessageUnit[],
  id?: string,
) =>
  messageUnits.find<FunctionCallMessageUnit>(
    (unit): unit is FunctionCallMessageUnit =>
      unit.role === MessageUnitRole.TOOL && unit.callId === id,
  );

// Match function_call id, match the id in the tool_response with it, and update the plugin results
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

/** Process tool_response result, find the corresponding function call, and insert it into the output
 *  Scenario: ID pair matching, index + 1 normal matching, streaming plug-in verbose matching
 */
const modifyMessageUnitByToolResponseMessage = (
  message: Message,
  messageUnits: FunctionCallMessageUnit[],
  index: number,
) => {
  // Plugin related news
  // P0, priority matching function call_id
  if (isHaveFunctionId(message)) {
    handelMatchCallId(message, messageUnits);
    return;
  }
  // 1. Non-streaming plugins
  if (isNormalPlugin(message)) {
    // Get target ToolUnit
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
  // 2. Start streaming plugins
  if (isStreamPluginRunning(message)) {
    // Get target ToolUnit
    const targetToolUnit = findTargetToolUnit(messageUnits, index);
    if (!targetToolUnit) {
      return;
    }
    targetToolUnit.streamUuid = message.extra_info.stream_plugin_running;
    targetToolUnit.apiResponse = message;
    return;
  }
  // 2. End of streaming plugin
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
    // Get target ToolUnit
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

// Is it a streaming plugin?
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

// Is there a function_call ID match?
export function isHaveFunctionId(message: Message): boolean {
  return message.type === 'tool_response' && !!message.extra_info.call_id;
}

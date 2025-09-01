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

import { type MessageGroup, type Message } from '../../store/types';
import { getMessageUniqueKey } from '../message';

/**
 * 修复消息组中缺失的 userMessageId
 * 这个函数会尝试从消息列表中找到对应的用户消息并修复 userMessageId
 */
export const fixUserMessageIdInGroup = (
  messageGroup: MessageGroup,
  messages: Message[],
): MessageGroup => {
  const { memberSet, groupId } = messageGroup;
  
  // 如果 userMessageId 已经存在且有效，直接返回
  if (memberSet.userMessageId && memberSet.userMessageId !== '') {
    return messageGroup;
  }
  
  // 尝试查找属于这个组的用户消息
  const userMessages = messages.filter(msg => {
    // 检查是否是用户消息
    if (msg.role !== 'user') {
      return false;
    }
    
    // 检查是否属于这个消息组
    // 1. 通过 reply_id 匹配
    if (msg.reply_id === groupId) {
      return true;
    }
    
    // 2. 通过 message_id 匹配（有些情况下 groupId 就是用户消息的 ID）
    if (msg.message_id === groupId) {
      return true;
    }
    
    // 3. 检查是否和组内的其他消息有关联
    const answerMessages = memberSet.llmAnswerMessageIdList || [];
    for (const answerId of answerMessages) {
      const answerMsg = messages.find(m => 
        m.message_id === answerId || 
        m.extra_info?.local_message_id === answerId
      );
      if (answerMsg && answerMsg.reply_id === msg.message_id) {
        return true;
      }
    }
    
    return false;
  });
  
  if (userMessages.length > 0) {
    // 使用找到的第一个用户消息
    const userMessage = userMessages[0];
    const userMessageId = getMessageUniqueKey(userMessage);
    
    return {
      ...messageGroup,
      memberSet: {
        ...memberSet,
        userMessageId,
      },
    };
  }
  
  // 如果还是找不到，保持原样
  return messageGroup;
};

/**
 * 批量修复消息组列表中的 userMessageId
 */
export const fixUserMessageIdsInGroups = (
  messageGroups: MessageGroup[],
  messages: Message[],
): MessageGroup[] => {
  return messageGroups.map(group => fixUserMessageIdInGroup(group, messages));
};
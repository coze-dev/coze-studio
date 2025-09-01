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

/**
 * 调试消息组问题
 */
export const debugMessageGroup = (
  messageGroup: MessageGroup | undefined,
  messages: Message[],
  context: string = '',
) => {
  if (!messageGroup) {
    console.error(`[MessageGroup Debug ${context}] MessageGroup is undefined`);
    return;
  }

  const { memberSet, groupId } = messageGroup;
  
  console.group(`[MessageGroup Debug ${context}]`);
  console.log('GroupId:', groupId);
  console.log('UserMessageId:', memberSet.userMessageId);
  console.log('LLM Answer Messages:', memberSet.llmAnswerMessageIdList);
  console.log('Function Call Messages:', memberSet.functionCallMessageIdList);
  console.log('Follow Up Messages:', memberSet.followUpMessageIdList);
  
  // 查找用户消息
  const userMessages = messages.filter(msg => msg.role === 'user');
  console.log('All User Messages in store:', userMessages.map(msg => ({
    message_id: msg.message_id,
    reply_id: msg.reply_id,
    type: msg.type,
    content_preview: msg.content?.substring(0, 50),
  })));
  
  // 查找可能属于这个组的用户消息
  const relatedUserMessages = userMessages.filter(msg => 
    msg.reply_id === groupId || 
    msg.message_id === groupId ||
    memberSet.llmAnswerMessageIdList.some(answerId => {
      const answerMsg = messages.find(m => m.message_id === answerId);
      return answerMsg && answerMsg.reply_id === msg.message_id;
    })
  );
  
  console.log('Related User Messages:', relatedUserMessages.map(msg => ({
    message_id: msg.message_id,
    reply_id: msg.reply_id,
    type: msg.type,
  })));
  
  console.groupEnd();
};

/**
 * 调试所有消息组
 */
export const debugAllMessageGroups = (
  messageGroups: MessageGroup[],
  messages: Message[],
) => {
  console.group('[MessageGroup Debug ALL]');
  console.log('Total Message Groups:', messageGroups.length);
  console.log('Total Messages:', messages.length);
  
  messageGroups.forEach((group, index) => {
    debugMessageGroup(group, messages, `Group ${index}`);
  });
  
  console.groupEnd();
};
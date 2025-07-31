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

import { merge } from 'lodash-es';
import { ContentType, messageSource } from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';
import { type ChatMessage } from '@coze-arch/bot-api/developer_api';

import { safeJSONParse } from '../../utils/safe-json-parse';
import { modifyFileMessagePercentAndStatus } from '../../utils/modify-file-message-percent-and-status';
import { convertMessageSource, getIsFileMessage } from '../../utils/message';
import { FileStatus, type Message } from '../../store/types';
import { SERVER_MESSAGE_REPLY_ID_PLACEHOLDER_VALUES } from '../../constants/message';
import { fixImageMessage } from './fix-image-message';

// The data returned by the backend interface is inconsistent with the core SDK
// Smooth here
export const fixMessageStruct = (
  message: ChatMessage,
  reporter: Reporter,
): Message => {
  const defaultChatMessage: Message = {
    role: 'assistant',
    type: 'answer',
    content: '',
    reasoning_content: '',
    content_type: ContentType.Text,
    message_id: '',
    reply_id: '',
    section_id: '',
    // todo: fixme
    // @ts-expect-error fixme
    extra_info: {
      local_message_id: '',
      input_tokens: '',
      output_tokens: '',
      token: '',
      plugin_status: '',
      time_cost: '',
      workflow_tokens: '',
      bot_state: '',
      plugin_request: '',
      tool_name: '',
      plugin: '',
    },
    /** Normal, interrupted state, used when pulling the message list, this field is not available when chat is running. */
    /** interrupt position */
    broken_pos: 9999999,
    sender_id: '',
    mention_list: [],
    content_obj: safeJSONParse(message.content),
    is_finish: true,
  };

  const convertedMessage = {
    ...message,
    ...(message.source === undefined
      ? {}
      : {
          source: convertMessageSource(message.source),
        }),
  };
  const res = merge(defaultChatMessage, convertedMessage);

  mutateFixMessageReplyId(res);

  const fixedMessage = fixImageMessage(res, reporter);

  if (getIsFileMessage(fixedMessage)) {
    return modifyFileMessagePercentAndStatus(fixedMessage, {
      percent: 100,
      status: FileStatus.Success,
    });
  }

  return fixedMessage;
};

export const markHistoryMessage = (message: Message): Message => {
  const res: Message = {
    ...message,
    _fromHistory: true,
  };
  return res;
};

const mutateFixNoticeMessageReplyId = (message: Message) => {
  if (message.source !== messageSource.Notice) {
    return;
  }
  if (!SERVER_MESSAGE_REPLY_ID_PLACEHOLDER_VALUES.includes(message.reply_id)) {
    return;
  }
  message.reply_id = `notice_${message.message_id}`;
};

const mutateFixAsyncResultReplyId = (message: Message) => {
  if (message.source !== messageSource.AsyncResult) {
    return;
  }
  message.reply_id = `async-result_${message.message_id}`;
};
const mutateFixTaskTriggerMessageReplyId = (message: Message) => {
  if (
    message.source !== messageSource.TaskManualTrigger &&
    message.type !== 'task_manual_trigger'
  ) {
    return;
  }
  message.reply_id = `task_manual_trigger_${message.message_id}`;
};

const mutateFixMessageReplyId = (message: Message) => {
  mutateFixNoticeMessageReplyId(message);
  mutateFixAsyncResultReplyId(message);
  mutateFixTaskTriggerMessageReplyId(message);
};

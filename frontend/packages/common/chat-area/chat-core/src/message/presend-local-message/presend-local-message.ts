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
 
/**
 * 暴露预发送消息实例，预发送消息用于创建消息后上屏，消息格式和Message<T>一致
 */

import {
  type Message,
  type MessageInfoRole,
  type ContentType,
  type MessageType,
  type MessageStatus,
  type MessageContent,
  type ChunkRaw,
  type LocalMessageStatus,
} from '../types';

export class PreSendLocalMessage<T extends ContentType> implements Message<T> {
  bot_id?: string;
  preset_bot?: string;
  user?: string;
  // TODO: fix me
  // @ts-expect-error should be fixed
  extra_info: Message<T>['extra_info'] = {
    local_message_id: '',
    input_tokens: '', // 用户 query 消耗的 token
    output_tokens: '', // llm 输出消耗的 token
    token: '', // 总的 token 消耗
    plugin_status: 'success', // "success" or "fail"
    time_cost: '', // 中间调用过程的时间
    workflow_tokens: '',
    bot_state: '', // {   bot_id?: string;agent_id?: string;agent_name?: string; }
    plugin_request: '', // plugin 请求的参数
    tool_name: '', // 调用的 plugin 下具体的 api 名称
    plugin: '', // 调用的 plugin 名称
  };
  index?: number; // message在一次 response 的排序
  is_finish?: boolean; // 消息状态
  section_id: string; // 消息属于的上下文id
  content_type: ContentType;
  debug_messages?: ChunkRaw[];
  content: string;
  content_obj: MessageContent<T>;
  file_upload_result?: 'success' | 'fail'; // 文件上传状态
  role: MessageInfoRole;
  type: MessageType;
  message_status?: MessageStatus;
  message_id: string;
  reply_id: string;
  local_message_status?: LocalMessageStatus;
  mention_list: { id: string }[];

  constructor(props: Message<T>) {
    const {
      bot_id,
      preset_bot,
      extra_info: { local_message_id },
      content_type,
      content,
      content_obj,
      role,
      type,
      message_status,
      message_id,
      reply_id,
      user,
      section_id,
      local_message_status,
      mention_list,
      file_upload_result,
    } = props;
    this.bot_id = bot_id;
    this.preset_bot = preset_bot;
    this.user = user;
    this.extra_info.local_message_id = local_message_id;
    this.content_type = content_type;
    this.content = content;
    this.content_obj = content_obj;
    this.file_upload_result = undefined;
    this.role = role;
    this.type = type;
    this.message_status = message_status;
    this.message_id = message_id;
    this.reply_id = reply_id;
    this.section_id = section_id;
    this.local_message_status = local_message_status || 'unsent';
    this.mention_list = mention_list;
    this.file_upload_result = file_upload_result;
  }

  static create<T extends ContentType>(props: Message<T>) {
    return new PreSendLocalMessage(props);
  }
}

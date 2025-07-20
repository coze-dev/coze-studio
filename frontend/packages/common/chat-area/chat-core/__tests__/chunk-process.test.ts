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
 
import Mock from 'mockjs';

import { ContentType, type ChunkRaw, type Message } from '../src/message/types';
import { ChunkProcessor } from '../src/message';

const random = Mock.Random;
random.extend({
  random_type() {
    const type = [
      'answer',
      'function_call',
      'tool_response',
      'follow_up',
      'ack',
      'question',
    ];
    return this.pick(type);
  },
  random_content_type() {
    const contentType = [
      'text',
      'link',
      'music',
      'video',
      'card',
      'image',
      'file',
      'tako',
      'custom',
    ];
    return this.pick(contentType);
  },
  random_message_status() {
    const status = ['available', 'broken'];
    return this.pick(status);
  },
});
const randomChunkRawList: ChunkRaw[] = Mock.mock({
  'array|20-60': [
    {
      index: '@integer(0)',
      seq_id: '@integer(0)',
      is_finish: '@boolean',
      message: {
        role: 'assistant',
        type: '@RANDOM_TYPE',
        section_id: '@string',
        content_type: '@RANDOM_CONTENT_TYPE',
        content: '@string',
        reasoning_content: '@string',
        message_status: '@RANDOM_MESSAGE_STATUS',
        message_id: '@string', // 后端消息 id, 可能有多条回复
        reply_id: '999999999', // 回复 id，query的messageId
        extra_info: {
          local_message_id: '88888888888', // 前端消息 id, 用于预发送消息体更新
        },
      },
    },
  ],
}).array;

describe('消息接收测试', () => {
  it('chunkProcessor', () => {
    const botID = random.string();
    const presetBot = random.string();

    const firstTextChunk = randomChunkRawList.find(
      chunkRaw => chunkRaw.message.content_type === ContentType.Text,
    );

    const mergedContent = randomChunkRawList.reduce((prev, current) => {
      if (current.message.message_id === firstTextChunk?.message.message_id) {
        return prev + current.message.content;
      }
      return prev;
    }, '');
    const mergedReasoningContent = randomChunkRawList.reduce(
      (prev, current) => {
        if (current.message.message_id === firstTextChunk?.message.message_id) {
          return prev + current.message.reasoning_content;
        }
        return prev;
      },
      '',
    );
    const lastChunkRaw: ChunkRaw = {
      index: 999,
      seq_id: 998,
      is_finish: true,
      message: {
        message_id: firstTextChunk?.message.message_id ?? '',
        role: 'assistant',
        type: 'answer',
        section_id: random.string(),
        content_type: ContentType.Text,
        content: 'I am the last!!!',
        reasoning_content: 'I am the last!!!',
        reply_id: firstTextChunk?.message.reply_id ?? '',
        extra_info: {
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
          local_message_id:
            firstTextChunk?.message.extra_info.local_message_id ?? '',
        },
        message_status: 'available',
      },
    };
    const chunkProcessor = new ChunkProcessor({
      bot_id: botID,
      preset_bot: presetBot,
      enableDebug: true,
    });
    const allChunkRaw = randomChunkRawList.concat([lastChunkRaw]);
    allChunkRaw.forEach(chunkRaw => {
      chunkProcessor.addChunkAndProcess(chunkRaw, {
        logId: '123',
      });
    });
    const expectMessage: Message<ContentType.Text> = {
      bot_id: botID,
      preset_bot: presetBot,
      role: lastChunkRaw.message.role,
      type: lastChunkRaw.message.type,
      index: lastChunkRaw.index,
      is_finish: lastChunkRaw.is_finish,
      content_type: lastChunkRaw.message.content_type,
      content: mergedContent + lastChunkRaw.message.content,
      reasoning_content:
        mergedReasoningContent + lastChunkRaw.message.reasoning_content,
      reply_id: lastChunkRaw.message.reply_id,
      content_obj: mergedContent + lastChunkRaw.message.content,
      message_status: lastChunkRaw.message.message_status,
      message_id: lastChunkRaw.message.message_id,
      logId: '123',
      debug_messages: allChunkRaw.filter(
        chunk => chunk.message.message_id === lastChunkRaw.message.message_id,
      ),
      extra_info: lastChunkRaw.message.extra_info,
      section_id: lastChunkRaw.message.section_id,
      mention_list: [],
    };
    expect(
      chunkProcessor.getProcessedMessageByChunk(lastChunkRaw),
    ).toStrictEqual(expectMessage);
  });
});

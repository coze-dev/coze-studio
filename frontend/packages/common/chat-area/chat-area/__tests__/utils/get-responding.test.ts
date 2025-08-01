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

import { ContentType, type Message } from '@coze-common/chat-core';

import { getResponse } from '../../src/store/waiting';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

const llmMessage: Message<ContentType> = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: ContentType.Text,
  message_id: '7392514629399953443',
  reply_id: '7392514612706705443',
  section_id: '7380292213265317928',
  extra_info: {
    local_message_id: '',
    input_tokens: '1055',
    output_tokens: '0',
    token: '1055',
    plugin_status: '',
    time_cost: '',
    workflow_tokens: '',
    bot_state:
      '{"bot_id":"7326859717089804315","agent_name":"意图识别","agent_id":"7386916906693410825","awaiting":"7386916906693410825"}',
    plugin_request: '',
    tool_name: '',
    plugin: '',
    mock_hit_info: '',
    log_id: '2024071716121849EA05C1D7C3036CEE60',
    message_title: '',
    stream_plugin_running: '',
    new_section_id: '',
    remove_query_id: '',
    execute_display_name: '',
    task_type: '',
    call_id: '',
  },
  mention_list: [],
  sender_id: '7326859717089804315',
  content_time: 1721203942447,
  message_index: '384',
  source: 0,
  is_finish: false,
  index: 1,
};

describe('get responding should be correct', () => {
  it('get response', () => {
    const expectedResponse = {
      index: llmMessage.index,
      type: llmMessage.type,
      id: llmMessage.message_id,
      streamPlugin: llmMessage.extra_info.stream_plugin_running
        ? {
            streamUuid: llmMessage.extra_info.stream_plugin_running,
          }
        : null,
    };

    expect(getResponse(llmMessage)).toStrictEqual(expectedResponse);
  });

  it('get response null', () => {
    const expectedResponse = {
      index: llmMessage.index,
      type: llmMessage.type,
      id: llmMessage.message_id,
      streamPlugin: null,
    };

    expect(getResponse(llmMessage)).toStrictEqual(expectedResponse);
  });
});

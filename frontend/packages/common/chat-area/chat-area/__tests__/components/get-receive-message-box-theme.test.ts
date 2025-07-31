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

import { getReceiveMessageBoxTheme } from '../../src/utils/components/get-receive-message-box-theme';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MockContentType = {
  Text: 'text',
  Link: 'link',
  Music: 'music',
  Video: 'video',
  Card: 'card',
  Image: 'image',
  File: 'file',
  Tako: 'tako',
  Custom: 'custom',
  Mix: 'mix',
};

vi.mock('@coze-common/chat-core', () => ({
  ContentType: {
    Text: 'text',
    Link: 'link',
    Music: 'music',
    Video: 'video',
    Card: 'card',
    Image: 'image',
    File: 'file',
    Tako: 'tako',
    Custom: 'custom',
    Mix: 'mix',
  },
}));

const cardMessage: any = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: MockContentType.Card,
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
const followUpMessage: any = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: MockContentType.Card,
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

const imageMessage: any = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: MockContentType.Image,
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

const answerMessage: any = {
  role: 'assistant',
  type: 'answer',
  content: 'Hello',
  content_obj: 'Hello',
  content_type: MockContentType.Text,
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

describe('get receive message box theme should be correct', () => {
  it('get border theme', () => {
    const theme = getReceiveMessageBoxTheme({
      message: imageMessage,
      bizTheme: 'home',
      onParseReceiveMessageBoxTheme: undefined,
    });

    expect(theme).toBe('border');
  });

  it('get none theme', () => {
    const noneTheme1 = getReceiveMessageBoxTheme({
      message: cardMessage,
      bizTheme: 'home',
      onParseReceiveMessageBoxTheme: undefined,
    });
    const noneTheme2 = getReceiveMessageBoxTheme({
      message: followUpMessage,
      bizTheme: 'home',
      onParseReceiveMessageBoxTheme: undefined,
    });
    expect(noneTheme1).toBe('none');

    expect(noneTheme2).toBe('none');
  });

  it('enable uikit coze design', () => {
    const whiteTheme2 = getReceiveMessageBoxTheme({
      message: answerMessage,
      bizTheme: 'home',
      onParseReceiveMessageBoxTheme: undefined,
    });

    expect(whiteTheme2).toBe('whiteness');

    const greyTheme = getReceiveMessageBoxTheme({
      message: answerMessage,
      bizTheme: 'debug',
      onParseReceiveMessageBoxTheme: undefined,
    });
    expect(greyTheme).toBe('grey');
  });

  it('custom', () => {
    const custom = getReceiveMessageBoxTheme({
      message: answerMessage,
      bizTheme: 'home',
      onParseReceiveMessageBoxTheme: () => 'color-border-card',
    });

    expect(custom).toBe('color-border-card');
  });
});

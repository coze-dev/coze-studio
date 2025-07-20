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
 
import { findRespondRecord, type Responding } from '../../src/store/waiting';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: {
    /** 跳转节点 */
    JUMP_TO: 'multi_agents_jump_to_agent',
    /** 回溯节点 */
    BACK_WORD: 'multi_agents_backwards',
    /** 长期记忆节点 */
    LONG_TERM_MEMORY: 'time_capsule_recall',
    /** finish answer*/
    GENERATE_ANSWER_FINISH: 'generate_answer_finish',
    /** 流式插件调用状态 */
    STREAM_PLUGIN_FINISH: 'stream_plugin_finish',
    /** 知识库召回 */
    KNOWLEDGE_RECALL: 'knowledge_recall',
    /** 中断消息：目前只用于地理位置授权 */
    INTERRUPT: 'interrupt',
    /** hooks调用 */
    HOOK_CALL: 'hook_call',
  },
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('@coze-common/chat-uikit', () => ({
  MentionList: vi.fn(),
}));

vi.mock('@coze-arch/bot-md-box-adapter', () => ({
  MdBoxLazy: vi.fn(),
}));

vi.stubGlobal('IS_DEV_MODE', false);

describe('findRespondRecord', () => {
  it('find', () => {
    const response: Responding['response'] = [
      {
        id: '1',
        type: 'ack',
        index: 1,
        streamPlugin: {
          streamUuid: '1',
        },
      },
    ];

    // @ts-expect-error -- aa
    const r = findRespondRecord({ message_id: '1' }, response);

    expect(r).toStrictEqual(response[0]);
  });
});

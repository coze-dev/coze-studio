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
    /** jump node */
    JUMP_TO: 'multi_agents_jump_to_agent',
    /** backtracking node */
    BACK_WORD: 'multi_agents_backwards',
    /** long-term memory node */
    LONG_TERM_MEMORY: 'time_capsule_recall',
    /** finish answer*/
    GENERATE_ANSWER_FINISH: 'generate_answer_finish',
    /** Streaming plugin call status */
    STREAM_PLUGIN_FINISH: 'stream_plugin_finish',
    /** knowledge base recall */
    KNOWLEDGE_RECALL: 'knowledge_recall',
    /** Interrupt message: Currently only used for geolocation authorization */
    INTERRUPT: 'interrupt',
    /** Hooks call */
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

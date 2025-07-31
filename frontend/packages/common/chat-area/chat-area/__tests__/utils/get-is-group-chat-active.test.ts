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

import { getIsGroupChatActive } from '../../src/utils/message-group/get-is-group-chat-active';
import { WaitingPhase } from '../../src/store/waiting';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
}));

it('get active correct', () => {
  const res1 = getIsGroupChatActive({
    waiting: null,
    sending: {
      message_id: '123',
      extra_info: {
        local_message_id: '',
      },
    },
    groupId: '123',
  });

  expect(res1).toBeTruthy();

  const res2 = getIsGroupChatActive({
    waiting: null,
    sending: {
      message_id: '',
      extra_info: {
        local_message_id: '123',
      },
    },
    groupId: '321',
  });
  expect(res2).toBeFalsy();

  const res3 = getIsGroupChatActive({
    waiting: {
      replyId: '999',
      phase: WaitingPhase.Suggestion,
    },
    sending: null,

    groupId: '999',
  });
  expect(res3).toBeFalsy();

  const res4 = getIsGroupChatActive({
    waiting: {
      replyId: '123123',
      phase: WaitingPhase.Formal,
    },
    sending: null,

    groupId: '999',
  });
  expect(res4).toBeFalsy();

  const res5 = getIsGroupChatActive({
    waiting: {
      replyId: '999',
      phase: WaitingPhase.Formal,
    },
    sending: null,

    groupId: '999',
  });
  expect(res5).toBeTruthy();
});

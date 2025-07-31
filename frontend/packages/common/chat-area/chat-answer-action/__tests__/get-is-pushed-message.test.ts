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

import { getIsPushedMessage } from '../src/utils/get-is-pushed-message';

vi.mock('@coze-common/chat-area', () => ({
  getIsTriggerMessage: (param: any) =>
    param.type === 'task_manual_trigger' || param.source === 1,

  getIsNotificationMessage: (param: any) => param.source === 2,
  getIsAsyncResultMessage: (param: any) => param.source === 3,
}));

it('getIsPushedMessageCorrectly', () => {
  const res1 = getIsPushedMessage({ type: 'answer', source: 0 });
  const res2 = getIsPushedMessage({ type: 'answer', source: 3 });
  const res3 = getIsPushedMessage({ type: 'answer', source: 1 });
  const res4 = getIsPushedMessage({ type: 'task_manual_trigger', source: 0 });
  const res5 = getIsPushedMessage({ type: 'answer', source: 2 });
  expect(res1).toBeFalsy();
  expect(res2).toBeTruthy();
  expect(res3).toBeTruthy();
  expect(res4).toBeTruthy();
  expect(res5).toBeTruthy();
});

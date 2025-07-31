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

import { getShowRegenerate } from '../src/utils/get-show-regenerate';

vi.mock('@coze-common/chat-area', () => ({
  getIsTriggerMessage: (param: any) =>
    param.type === 'task_manual_trigger' || param.source === 1,
  getIsNotificationMessage: (param: any) => param.source === 2,
  getIsAsyncResultMessage: (param: any) => param.source === 3,
}));

it('getShowRegenerateCorrectly', () => {
  const res1 = getShowRegenerate({
    message: { type: 'answer', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res2 = getShowRegenerate({
    message: { type: 'ack', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res3 = getShowRegenerate({
    message: { type: 'answer', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '321',
  });
  const res4 = getShowRegenerate({
    message: { type: 'task_manual_trigger', source: 0 },
    meta: { isFromLatestGroup: true, sectionId: '321' },
    latestSectionId: '321',
  });
  const res5 = getShowRegenerate({
    message: { type: 'answer', source: 2 },
    meta: { isFromLatestGroup: false, sectionId: '321' },
    latestSectionId: '321',
  });
  expect(res1).toBeTruthy();
  expect(res2).toBeTruthy();
  expect(res3).toBeFalsy();
  expect(res4).toBeFalsy();
  expect(res5).toBeFalsy();
});

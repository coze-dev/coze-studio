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

import { getIsLastGroup } from '../src/utils/get-is-last-group';

it('getIsLastGroupCorrectly', () => {
  const res1 = getIsLastGroup({
    meta: { isFromLatestGroup: false, sectionId: '123' },
    latestSectionId: '123',
  });
  const res2 = getIsLastGroup({
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res3 = getIsLastGroup({
    meta: { isFromLatestGroup: true, sectionId: '321' },
    latestSectionId: '123',
  });
  const res4 = getIsLastGroup({
    meta: { isFromLatestGroup: false, sectionId: '321' },
    latestSectionId: '123',
  });
  expect(res1).toBeFalsy();
  expect(res2).toBeTruthy();
  expect(res3).toBeFalsy();
  expect(res4).toBeFalsy();
});

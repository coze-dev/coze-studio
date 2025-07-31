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

import { BotPageFromEnum } from '@coze-arch/bot-typings/common';

import { getBotDetailIsReadonlyByState } from '../../src/utils/get-read-only';
import { useBotDetailStoreSet } from '../../src/store/index';
import { EditLockStatus } from '../../src/store/collaboration';

describe('useModelStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('getBotDetailIsReadonlyByState', () => {
    const overall = {
      editable: true,
      isPreview: false,
      editLockStatus: EditLockStatus.Offline,
      pageFrom: BotPageFromEnum.Bot,
    };

    expect(
      getBotDetailIsReadonlyByState({ ...overall, editable: false }),
    ).toBeTruthy();
    expect(
      getBotDetailIsReadonlyByState({ ...overall, isPreview: true }),
    ).toBeTruthy();
    expect(
      getBotDetailIsReadonlyByState({
        ...overall,
        editLockStatus: EditLockStatus.Lose,
      }),
    ).toBeTruthy();
  });
});

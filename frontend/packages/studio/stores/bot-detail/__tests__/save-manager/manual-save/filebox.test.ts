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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ItemType } from '@coze-arch/bot-api/developer_api';

import { useBotSkillStore } from '../../../src/store/bot-skill';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';
import { saveFileboxMode } from '../../../src/save-manager/manual-save/filebox';

vi.mock('../../../src/save-manager/utils/save-fetcher', () => ({
  saveFetcher: vi.fn((fn, itemType) => fn()),
  updateBotRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

vi.mock('../../../src/store/bot-skill', () => ({
  useBotSkillStore: {
    getState: vi.fn(),
  },
}));

describe('filebox save manager', () => {
  const mockFilebox = {
    mode: 'read',
    files: [{ id: 'file-1', name: 'test.txt' }],
  };

  const mockTransformVo2Dto = {
    filebox: vi.fn(filebox => filebox),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useBotSkillStore.getState as any).mockReturnValue({
      filebox: mockFilebox,
      transformVo2Dto: mockTransformVo2Dto,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should correctly save filebox mode', async () => {
    const newMode = 'read';
    await saveFileboxMode(newMode as any);

    expect(saveFetcher).toHaveBeenCalledWith(
      expect.any(Function),
      ItemType.TABLE,
    );
    expect(updateBotRequest).toHaveBeenCalledWith({
      filebox_info: mockFilebox,
    });
  });

  it('should handle errors thrown by saveFetcher', async () => {
    (saveFetcher as any).mockImplementation(() => Promise.resolve());

    await saveFileboxMode('read' as any);
    expect(saveFetcher).toHaveBeenCalled();
  });
});

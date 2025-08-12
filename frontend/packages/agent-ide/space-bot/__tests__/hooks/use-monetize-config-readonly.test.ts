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

import { vi, describe, it, expect, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { userStoreService } from '@coze-studio/user-store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';

import { useMonetizeConfigReadonly } from '../../src/hook/use-monetize-config-readonly';

vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    useUserInfo: vi.fn(),
  },
}));
vi.mock('@coze-studio/bot-detail-store', () => ({
  useBotDetailIsReadonly: vi.fn(),
}));
vi.mock('@coze-studio/bot-detail-store/bot-info', () => ({
  useBotInfoStore: vi.fn(),
}));
describe('use monetize config readonly', () => {
  // mock returned user id
  (userStoreService.useUserInfo as unknown as Mock).mockReturnValue({
    user_id_str: '114',
  });

  it('bot detail 只读 & 是作者本人 -> 只读', () => {
    (useBotInfoStore as unknown as Mock).mockReturnValueOnce('114');
    (useBotDetailIsReadonly as unknown as Mock).mockReturnValueOnce(true);
    const {
      result: { current: isReadonly },
    } = renderHook(() => useMonetizeConfigReadonly());
    expect(isReadonly).toBe(true);
  });

  it('bot detail 可编辑 & 是作者本人 -> 可编辑', () => {
    (useBotInfoStore as unknown as Mock).mockReturnValueOnce('114');
    (useBotDetailIsReadonly as unknown as Mock).mockReturnValueOnce(false);
    const {
      result: { current: isReadonly },
    } = renderHook(() => useMonetizeConfigReadonly());
    expect(isReadonly).toBe(false);
  });

  it('bot detail 只读 & 不是作者本人 -> 只读', () => {
    (useBotInfoStore as unknown as Mock).mockReturnValueOnce('514');
    (useBotDetailIsReadonly as unknown as Mock).mockReturnValueOnce(true);
    const {
      result: { current: isReadonly },
    } = renderHook(() => useMonetizeConfigReadonly());
    expect(isReadonly).toBe(true);
  });

  it('bot detail 可编辑 & 不是作者本人 -> 只读', () => {
    (useBotInfoStore as unknown as Mock).mockReturnValueOnce('514');
    (useBotDetailIsReadonly as unknown as Mock).mockReturnValueOnce(false);
    const {
      result: { current: isReadonly },
    } = renderHook(() => useMonetizeConfigReadonly());
    expect(isReadonly).toBe(true);
  });
});

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

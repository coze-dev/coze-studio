import { type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';

import { useSpaceList } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: vi.fn(),
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should return correct state from useSpaceList & useRefreshSpaces', async () => {
    const mockSpaceList = [
      {
        id: '1',
        name: 'Space 1',
      },
    ];
    useSpaceStore.getState = vi.fn();
    const mockFetchSpaces = vi.fn().mockResolvedValue([]);
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: mockFetchSpaces,
    });
    vi.mocked(useSpaceStore).mockReturnValue([]);
    const { result, waitForNextUpdate } = renderHook(() => useSpaceList(true));
    expect(result.current.spaces).toEqual([]);
    expect(result.current.loading).toEqual(true);
    vi.mocked(useSpaceStore).mockReturnValue(mockSpaceList);
    await waitForNextUpdate();
    expect(result.current.spaces).toEqual(mockSpaceList);
    expect(result.current.loading).toBe(false);
  });
});

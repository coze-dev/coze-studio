import { type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';

import { useRefreshSpaces } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set loading to true and fetch spaces when refresh is true', async () => {
    const mockFetchSpaces = vi.fn().mockResolvedValue([]);
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: mockFetchSpaces,
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      useRefreshSpaces(true),
    );
    expect(result.current).toBe(true);
    expect(mockFetchSpaces).toHaveBeenCalledTimes(1);

    await waitForNextUpdate();

    expect(result.current).toBe(false);
  });

  it('should set loading to false when refresh is false and spaces are already initialized', () => {
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: vi.fn(),
    });

    const { result } = renderHook(() => useRefreshSpaces(false));

    expect(result.current).toBe(false);
  });

  it('should set loading to false when refresh is undefined and spaces are already initialized', () => {
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: vi.fn(),
    });

    const { result } = renderHook(() => useRefreshSpaces());

    expect(result.current).toBe(false);
  });
});

import { renderHook } from '@testing-library/react-hooks';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';

import { useSpace } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: vi.fn(),
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpaceStore.getState = vi.fn().mockReturnValue({
      fetchSpaces: vi.fn(),
      inited: true,
    });
  });
  it('should return current space when id matches', () => {
    const mockSpaceList = [
      {
        id: '1',
        name: 'Space 1',
      },
      {
        id: '2',
        name: 'Space 2',
      },
    ];
    vi.mocked(useSpaceStore).mockImplementation(callback =>
      callback({
        spaceList: mockSpaceList,
      }),
    );

    const { result } = renderHook(() => useSpace('1'));
    expect(result.current.space).toEqual(mockSpaceList[0]);
  });
});

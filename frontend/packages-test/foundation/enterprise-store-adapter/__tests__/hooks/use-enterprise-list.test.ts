import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';

import { useEnterpriseStore } from '../../src/stores/enterprise';
import { useEnterpriseList } from '../../src/hooks/use-enterprise-list';

// Mock the enterprise store
vi.mock('../../src/stores/enterprise', () => ({
  useEnterpriseStore: vi.fn(),
}));

describe('useEnterpriseList', () => {
  const mockEnterpriseList = [
    { id: 'enterprise-1', name: 'Enterprise 1' },
    { id: 'enterprise-2', name: 'Enterprise 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        enterpriseList: {
          enterprise_info_list: mockEnterpriseList,
        },
      }),
    );
  });

  it('should return enterprise list from store', () => {
    const { result } = renderHook(() => useEnterpriseList());

    expect(result.current).toEqual(mockEnterpriseList);
  });

  it('should return empty array when store has no enterprise list', () => {
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        enterpriseList: {},
      }),
    );

    const { result } = renderHook(() => useEnterpriseList());

    expect(result.current).toEqual([]);
  });
});

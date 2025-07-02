import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';

import { useEnterpriseStore } from '../../src/stores/enterprise';
import { useCheckEnterpriseExist } from '../../src/hooks/use-check-enterprise-exist';

// Mock the enterprise store
vi.mock('../../src/stores/enterprise', () => ({
  useEnterpriseStore: vi.fn(),
}));

describe('useCheckEnterpriseExist', () => {
  const mockIsEnterpriseExist = true;

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        isEnterpriseExist: mockIsEnterpriseExist,
      }),
    );
  });

  it('should return enterprise exist status and check function', () => {
    const { result } = renderHook(() => useCheckEnterpriseExist());

    expect(result.current).toEqual({
      checkEnterpriseExist: expect.any(Function),
      checkEnterpriseExistLoading: false,
      isEnterpriseExist: mockIsEnterpriseExist,
    });
  });

  it('should return false when enterprise does not exist', () => {
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        isEnterpriseExist: false,
      }),
    );

    const { result } = renderHook(() => useCheckEnterpriseExist());

    expect(result.current.isEnterpriseExist).toBe(false);
  });
});

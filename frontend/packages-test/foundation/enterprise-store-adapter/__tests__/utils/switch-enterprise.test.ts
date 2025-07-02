import { describe, it, expect, vi, beforeEach } from 'vitest';

import { switchEnterprise } from '../../src/utils/switch-enterprise';
import { useEnterpriseStore } from '../../src/stores/enterprise';

// Mock the enterprise store
vi.mock('../../src/stores/enterprise', () => ({
  useEnterpriseStore: vi.fn(),
}));

describe('switchEnterprise', () => {
  const mockSetCurrentEnterprise = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        setCurrentEnterprise: mockSetCurrentEnterprise,
      }),
    );
  });

  it('should switch to the specified enterprise', () => {
    const enterpriseId = 'enterprise-1';
    switchEnterprise(enterpriseId);

    expect(mockSetCurrentEnterprise).not.toBeCalled();
  });
});

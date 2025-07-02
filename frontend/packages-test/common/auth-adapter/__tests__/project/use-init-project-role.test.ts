import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { ProjectRoleType, useProjectAuthStore } from '@coze-common/auth';

import { useInitProjectRole } from '../../src/project/use-init-project-role';

// Mock the auth store
vi.mock('@coze-common/auth', () => ({
  useProjectAuthStore: vi.fn(),
  ProjectRoleType: {
    Owner: 'owner',
  },
}));

describe('useInitProjectRole', () => {
  const mockIsReady = {
    'project-1': true,
    'project-2': true,
  };
  const mockSetIsReady = vi.fn();
  const mockSetRoles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectAuthStore as any).mockImplementation((selector: any) =>
      selector({
        setIsReady: mockSetIsReady,
        setRoles: mockSetRoles,
        isReady: mockIsReady,
      }),
    );
  });

  it('should initialize project role and set ready state', () => {
    const spaceId = 'space-1';
    const projectId = 'project-1';
    const { result } = renderHook(() => useInitProjectRole(spaceId, projectId));

    console.log('result', result.current);
    console.log('mockIsReady', mockIsReady);

    // 验证是否调用了 setRoles 和 setIsReady
    expect(mockSetRoles).toHaveBeenCalledWith(projectId, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId, true);

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it('should handle multiple project IDs correctly', () => {
    const testSpaceId = 'space-1';
    const projectId1 = 'project-1';
    const projectId2 = 'project-2';

    const { rerender } = renderHook(
      ({ spaceId, projectId }) => useInitProjectRole(spaceId, projectId),
      {
        initialProps: { spaceId: testSpaceId, projectId: projectId1 },
      },
    );

    expect(mockSetRoles).toHaveBeenCalledWith(projectId1, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId1, true);

    // 重新渲染，使用新的 projectId
    rerender({ spaceId: testSpaceId, projectId: projectId2 });

    expect(mockSetRoles).toHaveBeenCalledWith(projectId2, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId2, true);
  });
});

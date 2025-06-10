import { renderHook } from '@testing-library/react-hooks';
import { AuthStatus } from '@coze-arch/idl/developer_api';

import { useNormalPlatformController } from '@/hook/publish-platform-setting/use-normal-platform-controller';

vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    useUserAuthInfo: vi.fn().mockReturnValue([
      {
        id: 'id',
        name: 'name',
        icon: 'icon',
        auth_status: AuthStatus.Authorized,
      },
      {
        id: 'id',
        name: 'name',
        icon: 'icon',
        auth_status: AuthStatus.Unauthorized,
      },
    ]),
    getUserAuthInfos: vi
      .fn()
      .mockResolvedValueOnce(0)
      .mockRejectedValueOnce(-1),
  },
}));

describe('useNormalPlatformController', () => {
  it('useNormalPlatformController should return userAuthInfos', () => {
    const { result } = renderHook(() => useNormalPlatformController());

    expect(result.current.userAuthInfos.length).toEqual(2);
  });

  it('useNormalPlatformController should return revokeSuccess', async () => {
    const { result } = renderHook(() => useNormalPlatformController());

    await result.current.revokeSuccess();

    await result.current.revokeSuccess();
  });
});

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

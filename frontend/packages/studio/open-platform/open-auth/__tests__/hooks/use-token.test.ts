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

import { renderHook, act } from '@testing-library/react-hooks';

import {
  useGetPATList,
  useCreatePAT,
  useUpdatePAT,
  useDeletePAT,
  usePATPermission,
} from '@/hooks/pat/use-token';

vi.mock('@coze-arch/bot-api', () => ({
  patPermissionApi: {
    ListPersonalAccessTokensByCreator: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {
          personal_access_tokens: [
            {
              id: 'id',
              name: 'name',
              created_at: 0,
              updated_at: 0,
              last_used_at: 0,
              expire_at: 0,
            },
          ],
        },
      }),
    ListPersonalAccessTokens: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          personal_access_tokens: [
            {
              id: '2124658667281',
              name: 'Secret token--480-c',
              created_at: 1711697638,
              updated_at: 1711697638,
              last_used_at: -1,
              expire_at: 1711699200,
            },
          ],
        },
        msg: '',
      }),
    CreatePersonalAccessTokenAndPermission: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          token: 'pat',
          personal_access_token: {
            id: '2106243199900',
            name: 'Secret token',
            created_at: 1712668504,
            updated_at: 1712668504,
            last_used_at: -1,
            expire_at: 1712754904,
          },
        },
        msg: '',
      }),
    UpdatePersonalAccessTokenAndPermission: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {},
        msg: '',
      }),
    DeletePersonalAccessTokenAndPermission: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {},
        msg: '',
      }),
    GetPersonalAccessTokenAndPermission: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          personal_access_token: {
            id: '2196515701286',
            name: 'Secret token',
            created_at: 1711946476,
            updated_at: 1711946476,
            last_used_at: -1,
            expire_at: -1,
          },
          workspace_permission: {
            option: 2,
            permission_list: [
              {
                resource_type: 'Bot',
                actions: ['chat'],
              },
            ],
          },
        },
        msg: '',
      }),
    ListPersonalAccessTokenSupportPermissions: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          permission_list: [
            {
              resource_type: 'Bot',
              actions: ['chat'],
            },
          ],
        },
        msg: '',
      }),
  },
  PlaygroundApi: {
    GetSpaceListV2: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          bot_space_list: [
            {
              description: 'Personal Space',
              hide_operation: false,
              icon_url: 'https://placehold.co/460x460?text=placeholder-1',
              id: '7304535597841317932',
              name: 'Personal',
              role_type: 1,
              space_type: 1,
            },
            {
              description: 'Public',
              hide_operation: true,
              icon_url: 'https://placehold.co/460x460?text=placeholder-1',
              id: '7293504662404071468',
              name: 'Public',
              role_type: 3,
              space_type: 2,
            },
          ],
        },
        msg: '',
      }),
  },
  developerBackendApi: {
    GetPermissionList: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValue({
        code: 0,
        data: {
          data: [
            {
              childrens: [
                {
                  childrens: [],
                  create_time: '2024-05-06 12:03:11',
                  description: 'Bot相关聊天',
                  display_name: '',
                  key: 'chat',
                  parent_id: '7365730459227013164',
                  permission_id: '7365731956782284844',
                  update_time: '2024-05-06 12:03:11',
                },
              ],
              create_time: '2024-05-06 11:57:38',
              description: 'Bot相关',
              display_name: '',
              key: 'Bot',
              parent_id: '0',
              permission_id: '7365730459227013164',
              update_time: '2024-05-06 14:08:16',
            },
          ],
        },
        msg: '',
      }),
  },
}));

vi.mock('@coze-arch/bot-flags', () => ({
  getFlags: vi.fn(),
}));
vi.mock('../../src/utils/time.ts', () => ({
  getExpireAt: vi.fn(() => '-'),
}));
vi.mock('@coze-arch/coze-design', () => ({}));
vi.mock('@coze-studio/bot-detail-store', () => ({
  initBotDetailStore: vi.fn(),
  useBotDetailStoreSet: {
    clear: vi.fn(),
  },
}));
vi.mock('@flow-foundation/enterprise', () => ({
  useEnterpriseStore: () => ({
    isCurrentEnterpriseInit: true,
  }),
  useCurrentEnterpriseInfo: vi.fn(),
  useEnterpriseList: vi.fn(),
}));

describe('useGetPATList', () => {
  it('get pat list error', () => {
    const { result } = renderHook(() => useGetPATList({}));
    expect(result.current.loading).toEqual(false);
    act(() => result.current.fetchData());
    expect(result.current.loading).toEqual(true);
  });

  it('get pat list success', () => {
    const { result } = renderHook(() => useGetPATList({}));
    expect(result.current.loading).toEqual(false);
    act(() => result.current.fetchData());
    expect(result.current.dataSource).toEqual([]);
    expect(result.current.loading).toEqual(true);
  });
});

describe('useCreatePAT', () => {
  const createValue = {
    name: 'Secret token',
    duration_day: '1',
    workspace_permission: {
      option: 2,
      permission_list: [{ resource_type: 'Bot', actions: ['chat'] }],
    },
  };
  it('create error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCreatePAT());
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runCreate(createValue));
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
  });

  it('create success', async () => {
    const { result, waitForValueToChange } = renderHook(() => useCreatePAT());
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runCreate(createValue));
    await waitForValueToChange(() => result.current.successData);
    expect(result.current.successData?.token).toEqual('pat');
    expect(result.current.loading).toEqual(false);
  });
});

describe('useUpdatePAT', () => {
  const updateValue = {
    id: 'id',
    name: 'Secret token',
    workspace_permission: {
      option: 2,
      permission_list: [{ resource_type: 'Bot', actions: ['chat'] }],
    },
  };

  const successHandle = vi.fn();
  it('update error', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useUpdatePAT({ successHandle }),
    );
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runUpdate(updateValue));
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
  });

  it('update success', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useUpdatePAT({ successHandle }),
    );
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runUpdate(updateValue));
    await waitForValueToChange(() => result.current.loading);
    expect(result.current.loading).toEqual(false);
  });
});

describe('useDeletePAT', () => {
  const successHandle = vi.fn();
  it('delete error', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDeletePAT({ successHandle }),
    );
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runDelete('id'));
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
  });

  it('delete success', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useDeletePAT({ successHandle }),
    );
    expect(result.current.loading).toEqual(false);
    act(() => result.current.runDelete('id'));
    await waitForValueToChange(() => result.current.loading);
    expect(result.current.loading).toEqual(false);
  });
});

describe('usePATPermission', () => {
  let id = '1';
  it('get user pat permission error', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePATPermission({ patId: id }),
    );
    await waitForNextUpdate();
    expect(result.current.patPermission).toEqual(undefined);
  });

  it('get user pat permission success', async () => {
    const { result, rerender, waitForValueToChange } = renderHook(() =>
      usePATPermission({ patId: id }),
    );

    rerender({ patId: '2' });
    await waitForValueToChange(() => result.current.patPermission);
    expect(result.current.patPermission?.personal_access_token?.name).toEqual(
      'Secret token',
    );
    id = '';
    rerender({ patId: '' });
    expect(result.current.patPermission).toEqual(undefined);
  });
});

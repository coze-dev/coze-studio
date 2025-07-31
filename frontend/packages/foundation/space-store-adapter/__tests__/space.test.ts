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

import { SpaceType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { useSpaceStore, defaultState } from '../src/space';

vi.mock('@coze-arch/bot-flags', () => ({
  getFlags: vi.fn(),
}));

vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(),
}));

// FIXME changed to mock on demand
vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUserAuthList: vi
      .fn()
      .mockResolvedValueOnce({ data: [{ foo: 1 }] })
      .mockRejectedValueOnce('error'),
    ExitSpace: vi
      .fn()
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 1 }),
    TransferSpace: vi
      .fn()
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 1 }),
  },
  PlaygroundApi: {
    GetSpaceListV2: vi
      .fn()
      // .mockResolvedValueOnce({ code: 0 })
      // .mockResolvedValueOnce({ code: 1 })
      // .mockResolvedValueOnce({ code: 0 })
      // .mockResolvedValueOnce({ code: 0 })
      // Mock missing personal store & & poll failed
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 0 })

      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({
        code: 0,
        data: {
          bot_space_list: [
            {
              id: '123',
              app_ids: null,
              name: 'Personal',
              description: 'Personal',
              icon_url:
                'https://lf16-alice-tos-sign.oceanapi-i18n.com/obj/ocean-cloud-tos-sg/FileBizType.BIZ_BOT_SPACE/personal.png?lk3s=50ccb0c5\u0026x-expires=1707120346\u0026x-signature=vvsdzfbTwD2qIYxXa%2BcjGo1H%2Beg%3D',
              space_type: 1,
              connectors: [
                {
                  id: '123',
                  name: 'Cici',
                  icon: 'FileBizType.BIZ_BOT_ICON/7269764022575842322_1700191555077003149.jpg',
                  connector_status: 0,
                },
              ],
              hide_operation: false,
            },
          ],
          has_personal_space: true,
          team_space_num: 0,
        },
      })
      .mockRejectedValueOnce(new Error()),
    SaveSpaceV2: vi
      .fn()
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 1 }),
    DeleteSpaceV2: vi.fn(),
    ExitSpaceV2: vi.fn(),
    TransferSpaceV2: vi
      .fn()
      .mockResolvedValueOnce({ code: 0 })
      .mockResolvedValueOnce({ code: 1 }),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  reporter: {
    errorEvent: vi.fn(),
  },
}));

describe('useSpaceStore', () => {
  it('should init with default state', () => {
    const state = useSpaceStore.getState();
    expect(state).toMatchObject(defaultState);
  });

  it('reset', () => {
    useSpaceStore.setState({
      space: {
        id: '1',
      },
    });
    useSpaceStore.getState().reset();
    expect(useSpaceStore.getState()).toMatchObject(defaultState);
  });

  it('getSpaceId', () => {
    expect(() => useSpaceStore.getState().getSpaceId()).throw();
    useSpaceStore.setState({
      space: {
        id: '1',
      },
    });
    expect(useSpaceStore.getState().getSpaceId()).toBe('1');
  });

  it('getPersonalSpaceID', () => {
    expect(useSpaceStore.getState().getPersonalSpaceID()).toBeUndefined();

    useSpaceStore.setState({
      spaces: {
        ...useSpaceStore.getState().spaces,
        bot_space_list: [
          { id: '1', space_type: SpaceType.Personal },
          { id: '2', space_type: SpaceType.Team },
        ],
      },
    });

    expect(useSpaceStore.getState().getPersonalSpaceID()).toBe('1');
  });

  it('checkSpaceID', () => {
    expect(useSpaceStore.getState().checkSpaceID('')).toBe(false);

    useSpaceStore.setState({
      spaces: {
        ...useSpaceStore.getState().spaces,
        bot_space_list: [{ id: '1' }],
      },
    });
    expect(useSpaceStore.getState().checkSpaceID('1')).toBe(true);
  });

  it('setSpace', () => {
    useSpaceStore.getState().setSpace('');
    expect(useSpaceStore.getState().space).toEqual({ id: '' });

    useSpaceStore.setState({
      spaces: {
        ...useSpaceStore.getState().spaces,
        bot_space_list: [{ id: '1' }],
      },
    });

    useSpaceStore.getState().setSpace('1');

    expect(useSpaceStore.getState().space).toEqual({ id: '1' });

    useSpaceStore.setState({
      spaces: {
        ...useSpaceStore.getState().spaces,
        bot_space_list: [{ id: '2' }],
      },
    });

    expect(() => useSpaceStore.getState().setSpace('1')).toThrow(
      'can not find space: ',
    );
  });

  it('createSpace', async () => {
    const res = await useSpaceStore.getState().createSpace({} as any);
    expect(res).toBeUndefined();

    expect(useSpaceStore.getState().createSpace({} as any)).rejects.toThrow(
      'create error:',
    );
  });

  it('exitSpace', async () => {
    const mockExitSpace = vi.mocked(PlaygroundApi.ExitSpaceV2);
    mockExitSpace.mockResolvedValueOnce({ code: 0, msg: '' });
    const res = await useSpaceStore.getState().exitSpace({} as any);
    expect(res).toBeUndefined();
  });

  it('deleteSpace', async () => {
    const mockDeleteSpace = vi.mocked(PlaygroundApi.DeleteSpaceV2);
    mockDeleteSpace.mockResolvedValueOnce({ code: 0, msg: '' });
    const res = await useSpaceStore.getState().deleteSpace('');
    expect(res).toBeUndefined();
  });

  it('fetchSpaces', async () => {
    useSpaceStore.setState({
      createSpace: vi.fn(),
    });
    await useSpaceStore.getState().fetchSpaces();
    expect(useSpaceStore.getState().spaces).toEqual({
      bot_space_list: [],
      has_personal_space: true,
      team_space_num: 0,
      max_team_space_num: 3,
    });

    const prePromise = useSpaceStore.getState().fetchSpaces(true);
    await useSpaceStore.getState().fetchSpaces();
    await prePromise;
    const expectedValue = {
      bot_space_list: [
        {
          id: '123',
          app_ids: null,
          name: 'Personal',
          description: 'Personal',
          icon_url:
            'https://lf16-alice-tos-sign.oceanapi-i18n.com/obj/ocean-cloud-tos-sg/FileBizType.BIZ_BOT_SPACE/personal.png?lk3s=50ccb0c5\u0026x-expires=1707120346\u0026x-signature=vvsdzfbTwD2qIYxXa%2BcjGo1H%2Beg%3D',
          space_type: 1,
          connectors: [
            {
              id: '123',
              name: 'Cici',
              icon: 'FileBizType.BIZ_BOT_ICON/7269764022575842322_1700191555077003149.jpg',
              connector_status: 0,
            },
          ],
          hide_operation: false,
        },
      ],
      has_personal_space: true,
      team_space_num: 0,
      max_team_space_num: 3,
    };
    expect(useSpaceStore.getState().spaces).toEqual(expectedValue);
    expect(useSpaceStore.getState().createSpace).toHaveBeenCalledTimes(2);

    expect(useSpaceStore.getState().fetchSpaces()).rejects.toThrow();
  });
});

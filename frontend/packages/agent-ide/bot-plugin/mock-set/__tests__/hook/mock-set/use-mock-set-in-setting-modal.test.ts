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

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { SpaceType } from '@coze-arch/bot-api/developer_api';

import { useMockSetInSettingModalController } from '../../../src/hook/use-mock-set-in-setting-modal';
vi.stubGlobal('IS_PROD', false);
vi.mock('@coze-arch/bot-api', () => ({
  debuggerApi: {
    BindMockSet: vi.fn().mockResolvedValue(null),
    GetMockSetUsageInfo: vi.fn().mockResolvedValue({ usersUsageCount: 0 }),
    MGetMockSet: vi
      .fn()
      .mockResolvedValueOnce({ mockSets: [] })
      .mockResolvedValue({
        mockSets: [
          {
            createTimeInSec: '1717510112',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '',
            id: '7376649762918891521',
            mockRuleQuantity: 1,
            name: 'getNews mockset84',
            schemaIncompatible: false,
            updateTimeInSec: '1718180157',
          },
          {
            createTimeInSec: '1718179289',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: 'getNews mockset76',
            id: '7379523858379833345',
            mockRuleQuantity: 1,
            name: 'getNews mockset76',
            schemaIncompatible: false,
            updateTimeInSec: '1718179317',
          },
          {
            createTimeInSec: '1717596210',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '这是一个描述',
            id: '7377019552296599553',
            mockRuleQuantity: 1,
            name: 'getNews mockset51',
            schemaIncompatible: false,
            updateTimeInSec: '1717596219',
          },
          {
            createTimeInSec: '1717586096',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '',
            id: '7376976111470641153',
            mockRuleQuantity: 1,
            name: 'getNews mockset44',
            schemaIncompatible: false,
            updateTimeInSec: '1717586102',
          },
          {
            createTimeInSec: '1717422094',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '',
            id: '7376271731066929153',
            mockRuleQuantity: 8,
            name: 'getNews mockset74',
            schemaIncompatible: false,
            updateTimeInSec: '1717448382',
          },
          {
            createTimeInSec: '1717424229',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '',
            id: '7376280897617657858',
            mockRuleQuantity: 3,
            name: 'getNews mockset80',
            schemaIncompatible: false,
            updateTimeInSec: '1717424242',
          },
          {
            createTimeInSec: '1717423923',
            creator: {
              ID: '1735475817351321',
              avatarUrl:
                'https://p3-passport.byteacctimg.com/obj/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png',
              name: 'minalwws8888',
            },
            description: '',
            id: '7376279584485933058',
            mockRuleQuantity: 1,
            name: 'getNews mockset93',
            schemaIncompatible: false,
            updateTimeInSec: '1717423928',
          },
        ],
      }),
    MGetMockSetBinding: vi
      .fn()
      .mockResolvedValueOnce({ mockSetBindings: [], mockSetDetails: {} })
      .mockResolvedValue({
        mockSetBindings: [
          {
            bizCtx: {
              bizSpaceID: '7313780910216708140',
              connectorID: '10000010',
              connectorUID: '1735475817351321',
              ext: {
                mockSubjectInfo:
                  '{"componentID":"7373521805258047532","componentType":10001,"parentComponentID":"7373521805258014764","parentComponentType":10000}',
              },
              trafficCallerID: '7340867364105633836',
              trafficScene: 10000,
            },
            mockSetID: '7376649762918891521',
            mockSubject: {
              componentID: '7373521805258047532',
              componentType: 10001,
              parentComponentID: '7373521805258014764',
              parentComponentType: 10000,
            },
          },
        ],
        mockSetDetails: {
          '7376649762918891521': {
            createTimeInSec: '1717510112',
            creator: {
              ID: '1735475817351321',
            },
            description: '',
            id: '7376649762918891521',
            mockRuleQuantity: 1,
            mockSubject: {
              componentID: '7373521805258047532',
              componentType: 10001,
              parentComponentID: '7373521805258014764',
              parentComponentType: 10000,
            },
            name: 'getNews mockset84',
            schemaIncompatible: false,
            updateTimeInSec: '1718180157',
          },
        },
      }),
    DeleteMockSet: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: vi.fn().mockReturnValue(SpaceType.Personal),
}));

vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    useUserInfo: vi.fn().mockReturnValue({
      user_id_str: 'test-user-id',
    }),
  },
}));

vi.mock('@/util', () => ({
  getEnvironment: vi.fn(),
  getMockSubjectInfo: vi.fn(),
  getPluginInfo: vi.fn().mockReturnValue({
    spaceID: 'spaceID',
    toolID: 'toolID',
    pluginID: 'pluginID',
  }),
  getUsedScene: vi.fn(),
  isCurrent: vi.fn().mockReturnValue(true),
  MockTrafficEnabled: {
    DISABLE: 0,
    ENABLE: 1,
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    createLoggerWith: vi.fn(),
    error: vi.fn(),
  },
  reporter: {
    createReporterWithPreset: vi.fn(),
  },
}));

const mockProps = {
  bindSubjectInfo: {
    componentID: 'test-subject-id',
    componentType: 10001,
    parentComponentID: 'parentComponentID',
    parentComponentType: 10000,
  },
  bizCtx: {
    connectorID: 'connectorID',
    connectorUID: 'connectorUID',
    trafficScene: 10000,
    trafficCallerID: 'trafficCallerID',
    bizSpaceID: 'bizSpaceID',
  },
};

describe('useMockSetInSettingModalController', () => {
  it('should initialize correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMockSetInSettingModalController(mockProps),
    );

    await waitForNextUpdate();

    expect(result.current.isEnabled).toBeFalsy(); // The initial state should be not enabled
    expect(result.current.mockSetData).toEqual([]); // The initial mockSetData should be an empty array
  });

  it('should act export action', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMockSetInSettingModalController(mockProps),
    );

    await waitForNextUpdate();

    expect(result.current.isEnabled).toBeTruthy(); // If there is selected mock data, it will be automatically enabled
    expect(result.current.mockSetData.length).toEqual(7); // mockSetData is 7.

    act(() => result.current.doSetCreateModal(true));
    expect(result.current.showCreateModal).toBeTruthy(); // Open Create modal

    act(() => result.current.doHandleView({ id: 'record-id' })); // Click to view

    act(() => result.current.doEnabled()); // close
    expect(result.current.isEnabled).toBeFalsy(); // disable

    act(() => result.current.doSetDeleteId('record-id')); // delete
    expect(result.current.deleteRenderTitle).toBe(
      'Translated: delete_the_mockset {}',
    ); // The deleted title should be displayed after deletion.

    act(() => result.current.doConfirmDelete()); // Confirm deletion

    act(() => result.current.doChangeMock({ id: 'change-mock' })); // Modify mock
    expect(result.current.selectedMockSet).toStrictEqual({ id: 'change-mock' }); // After modifying the mock, the new mock should be displayed.
  });
});

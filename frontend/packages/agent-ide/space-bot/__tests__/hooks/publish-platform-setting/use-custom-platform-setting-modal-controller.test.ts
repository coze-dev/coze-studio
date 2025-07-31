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

import { useCustomPlatformSettingModalController } from '@/hook/publish-platform-setting/use-custom-platform-setting-modal-controller';

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useIsCurrentPersonalEnterprise: () => true,
  useCurrentEnterpriseRoles: () => [],
  useCurrentEnterpriseInfo: () => ({ enterprise_id: 'personal' }),
}));

vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    GetSpaceListV2: vi.fn().mockResolvedValue({
      data: {
        bot_space_list: [
          {
            app_ids: [],
            connectors: [
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
              {
                icon: '',
                id: '',
                name: '测试渠道02',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
            ],
            description: 'Personal Space',
            hide_operation: false,
            icon_url: '',
            id: '',
            name: '个人空间',
            role_type: 1,
            space_mode: 0,
            space_type: 1,
          },
          {
            app_ids: [],
            connectors: [
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
              {
                icon: '',
                id: '',
                name: '测试渠道03测试渠道03',
              },
            ],
            description: 'This is a description for liwei_1019',
            hide_operation: false,
            icon_url: '',
            id: '',
            name: 'liwei_1019',
            role_type: 1,
            space_mode: 0,
            space_type: 2,
          },
          {
            app_ids: [],
            connectors: [
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
            ],
            description: '',
            hide_operation: false,
            icon_url: '',
            id: '',
            name: 'LYH的boe测试团队',
            role_type: 3,
            space_mode: 0,
            space_type: 2,
          },
          {
            app_ids: [],
            connectors: [
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
            ],
            description: '',
            hide_operation: false,
            icon_url: '',
            id: '',
            name: 'ByteDance Demo',
            role_type: 3,
            space_mode: 0,
            space_type: 2,
          },
          {
            app_ids: [],
            connectors: [
              {
                icon: '',
                id: '',
                name: '豆包',
              },
              {
                icon: '',
                id: '',
                name: '飞书',
              },
              {
                icon: '',
                id: '',
                name: '微信客服',
              },
              {
                icon: '',
                id: '',
                name: '【即将下线】微信公众号（服务号）',
              },
              {
                icon: '',
                id: '',
                name: 'Web SDK',
              },
              {
                icon: '',
                id: '',
                name: '掘金',
              },
              {
                icon: '',
                id: '',
                name: 'Bot Store',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
              {
                icon: '',
                id: '',
                name: '飞书多维表格',
              },
              {
                icon: '',
                id: '',
                name: '测试渠道03测试渠道03',
              },
              {
                icon: '',
                id: '',
                name: 'Bot as API',
              },
            ],
            description: '',
            hide_operation: false,
            icon_url: '',
            id: '',
            name: 'liwei_1019_v2',
            role_type: 1,
            space_mode: 0,
            space_type: 2,
          },
        ],
      },
    }),
  },
  patPermissionApi: {
    ListAppMeta: vi.fn().mockResolvedValue({
      data: {
        apps: [
          {
            appid: '',
            app_owner_id: '',
            name: 'showcase渠道',
            description: 'showcase渠道',
            created_at: 1722240368,
            app_type: 'Connector',
            declared_permission: [],
            client_id: '',
            status: 'Active',
            certificated: 'Noncertificated',
            connector: {
              connector_id: '',
            },
          },
          {
            appid: '',
            app_owner_id: '',
            name: 'OauthApp',
            description: 'OauthApp',
            created_at: 1721987816,
            app_type: 'Connector',
            declared_permission: [
              {
                resource_type: 'Connector',
                actions: ['botChat', 'WorkflowTest', 'botEdit', 'botPublish'],
              },
            ],
            client_id: '',
            status: 'Active',
            certificated: 'Noncertificated',
            connector: {
              connector_id: '',
            },
          },
          {
            appid: '',
            app_owner_id: '',
            name: '1019的测试应用',
            description: '1019的测试应用',
            created_at: 1721812683,
            app_type: 'Normal',
            declared_permission: [
              {
                resource_type: 'Bot',
                actions: ['chat', 'getMetadata'],
              },
            ],
            client_id: '',
            status: 'Active',
            certificated: 'Noncertificated',
            connector: {
              connector_id: '',
            },
          },
        ],
      },
    }),
  },
  connectorApi: {
    CreateConnector: vi.fn().mockResolvedValue({ code: 0 }),
    UpdateConnector: vi.fn().mockResolvedValue({ code: 0 }),
    DeleteConnector: vi.fn().mockResolvedValue({ code: 0 }),
  },
}));

describe('useCustomPlatformSettingModalController', () => {
  it('useCustomPlatformSettingModalController fetch data should be right', async () => {
    const onOk = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useCustomPlatformSettingModalController(onOk),
    );

    await waitForNextUpdate();

    expect(result.current.oauthOptionsList.length).toBe(3);
    expect(result.current.spaceOptionList.length).toBe(5);
    expect(result.current.isLoadingOauthDatasource).toBeFalsy();
    expect(result.current.isLoadingSpace).toBeFalsy();
  });

  it('useCustomPlatformSettingModalController create & update & delete should be right', async () => {
    const onOk = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useCustomPlatformSettingModalController(onOk),
    );

    await waitForNextUpdate();

    expect(result.current.isIdle).toBeTruthy();

    await result.current.doCreate({});
    await result.current.doUpdate({});
    await result.current.doDel({ id: 'id' });

    expect(onOk).toBeCalledTimes(3);
  });

  it('useCustomPlatformSettingModalController copy should be right', async () => {
    const onOk = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useCustomPlatformSettingModalController(onOk),
    );

    await waitForNextUpdate();

    expect(result.current.isIdle).toBeTruthy();

    result.current.doCopy('id');
  });
});

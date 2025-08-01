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

import { useOauthSettingModalController } from '@/hook/publish-platform-setting/use-oauth-setting-modal-controller';

vi.mock('@coze-arch/bot-api', () => ({
  connectorApi: {
    GetOauthConfigSchema: vi.fn().mockResolvedValue({
      oauth_schema: {
        title_text: '填写自定义渠道 oauth 配置信息',
        start_text:
          '按照[**自定义渠道配置流程**](https://www.coze.cn/docs/guides/isv_connector)配置并注册自定义渠道，支持 Bot 发布至自定义渠道',
        schema_area: {
          schema_list: [
            {
              type: 'string',
              rules: [
                {
                  required: true,
                  message: '跳转地址 必填',
                },
              ],
              placeholder: '请输入跳转地址',
              name: 'redirect_url',
              title: '跳转地址',
              component: 'Input',
              enums: [],
            },
            {
              component: 'Input',
              enums: [],
              type: 'string',
              rules: [
                {
                  message: '获取 token 地址 必填',
                  required: true,
                },
              ],
              placeholder: '请输入获取 token 地址',
              name: 'access_token_url',
              title: '获取 token 地址',
            },
            {
              component: 'Input',
              enums: [],
              type: 'string',
              rules: [
                {
                  message: '获取用户信息地址 必填',
                  required: true,
                },
              ],
              placeholder: '',
              name: 'user_info_url',
              title: '获取用户信息地址',
            },
            {
              enums: [],
              type: 'string',
              rules: [
                {
                  message: 'APP ID 必填',
                  required: true,
                },
              ],
              placeholder: '请输入APP ID',
              name: 'app_id',
              title: 'APP ID',
              component: 'Input',
            },
            {
              name: 'app_secret',
              title: 'APP 密钥',
              component: 'Input',
              enums: [],
              type: 'string',
              rules: [
                {
                  message: 'APP 密钥 必填',
                  required: true,
                },
              ],
              placeholder: '请输入APP 密钥',
            },
            {
              component: 'InputNumber',
              enums: [],
              type: 'string',
              rules: [],
              placeholder: '',
              name: 'input_number_test',
              title: 'input_number_test',
            },
            {
              name: 'select_test',
              title: 'select_test',
              component: 'Select',
              enums: [
                {
                  label: 'label_1',
                  value: 'value_1',
                },
                {
                  label: 'label_2',
                  value: 'value_2',
                },
              ],
              type: 'string',
              rules: [],
              placeholder: '',
            },
            {
              placeholder: '',
              name: 'radio_test',
              title: 'radio_test',
              component: 'Radio',
              enums: [
                {
                  label: 'label_1',
                  value: 'value_1',
                },
                {
                  label: 'label_2',
                  value: 'value_2',
                },
              ],
              type: 'string',
              rules: [],
            },
            {
              name: 'Checkbox_test',
              title: 'Checkbox_test',
              component: 'Checkbox',
              enums: [
                {
                  label: 'label_1',
                  value: 'value_1',
                },
                {
                  label: 'label_2',
                  value: 'value_2',
                },
              ],
              type: 'string',
              rules: [],
              placeholder: '',
            },
            {
              enums: [],
              type: 'string',
              rules: [
                {
                  pattern: '^\\S(.*\\S)?$',
                  message: '请检查输入前后是否有空格',
                },
              ],
              placeholder: '',
              name: 'no_space_input',
              title: '前后不能有空格',
              component: 'Input',
            },
            {
              name: 'max_ten_words',
              title: '最大 10 个字符',
              component: 'Input',
              enums: [],
              type: 'string',
              rules: [
                {
                  max: 10,
                  message: '最大 10 个字符',
                },
              ],
              placeholder: '',
            },
          ],
          title_text: '填写 oauth 配置信息',
          description: '',
          step_order: 1,
        },
        copy_link_area: {},
      },
    }),
    UpdateOauthConfig: vi.fn().mockResolvedValue({ code: 0 }),
  },
}));

describe('useOauthSettingModalController', () => {
  it('useOauthSettingModalController fetch form config should be right', async () => {
    const onOk = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useOauthSettingModalController(
        {
          target: 'oauth',
          action: 'update',
        },
        onOk,
      ),
    );

    await waitForNextUpdate();

    expect(result.current.isOauthConfigLoading).toBeFalsy();
    expect(result.current.oauthFormItemConfigs.length).toBe(11);
    expect(result.current.oauthModalTitle).toBe('填写 oauth 配置信息');
  });

  it('useOauthSettingModalController update action should be right', async () => {
    const onOk = vi.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useOauthSettingModalController(
        {
          target: 'oauth',
          action: 'update',
        },
        onOk,
      ),
    );

    await waitForNextUpdate();

    expect(result.current.isOauthConfigLoading).toBeFalsy();
    expect(result.current.oauthFormItemConfigs.length).toBe(11);
    expect(result.current.oauthModalTitle).toBe('填写 oauth 配置信息');

    await result.current.doUpdate({});

    expect(onOk).toBeCalled();
  });
});

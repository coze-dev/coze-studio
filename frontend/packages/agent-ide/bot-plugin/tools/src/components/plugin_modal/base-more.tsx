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

/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import {
  UIFormInput,
  UIFormSelect,
  UIFormTextArea,
  Typography,
  Toast,
  Form,
  Tooltip,
} from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import {
  APIMethod,
  type PluginMetaInfo,
  AuthorizationType,
  PluginToolAuthType,
  type APIExtend,
  PluginType,
  type UpdateAPIRequest,
  type UpdateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { InfoPopover } from '../info_popover';
import { ERROR_CODE } from './types';
import { methodType } from './config';

import s from './index.module.less';

const { Option } = UIFormSelect;

export interface UseBaseInfoRequest {
  pluginId: string;
  pluginMeta: PluginMetaInfo;
  apiId?: string;
  step?: number;
  baseInfo?: {
    name?: string;
    desc?: string;
    path?: string;
    method?: APIMethod;
    api_extend?: APIExtend;
    function_name?: string;
  };
  showSecurityCheckFailedMsg?: boolean;
  setShowSecurityCheckFailedMsg?: Dispatch<SetStateAction<boolean>>;
  showModal: boolean;
  disabled: boolean;
  editVersion?: number;
  pluginType?: PluginType;
  spaceId?: string;
  onSuccess?: (params: UpdateAPIResponse) => void;
}

export interface UseBaseInfoReturnValue {
  submitBaseInfo: () => Promise<boolean>;
  baseInfoNode: JSX.Element;
}

export const useBaseMore = ({
  pluginId,
  pluginMeta,
  apiId = '',
  baseInfo = {},
  showModal,
  disabled,
  showSecurityCheckFailedMsg,
  setShowSecurityCheckFailedMsg,
  editVersion,
  pluginType,
  onSuccess,
}: UseBaseInfoRequest): UseBaseInfoReturnValue => {
  const { url: pluginUrl } = pluginMeta;
  const formRef = useRef<Form>(null);
  useEffect(() => {
    formRef.current?.formApi.setValues({
      path: baseInfo.path,
      method: baseInfo.method || APIMethod.GET,
      function_name: baseInfo.function_name,
      auth_mode: baseInfo.api_extend?.auth_mode || PluginToolAuthType.Required,
    });
  }, [
    baseInfo.path,
    showModal,
    disabled,
    pluginMeta,
    baseInfo.method,
    baseInfo.function_name,
    baseInfo.api_extend?.auth_mode,
  ]);

  // Submit basic information
  const submitBaseInfo = async () => {
    const status = await formRef.current?.formApi
      .validate()
      .then(() => true)
      .catch(() => false);
    if (!status || !apiId) {
      return false;
    }

    let baseResData;
    const formValues = formRef.current?.formApi.getValues();
    const params: UpdateAPIRequest = {
      api_id: apiId,
      plugin_id: pluginId,
      path: formValues.path,
      method: formValues.method,
      api_extend: {
        auth_mode: formValues.auth_mode,
      },
      edit_version: editVersion,
      function_name: formValues.function_name,
    };
    try {
      baseResData = await PluginDevelopApi.UpdateAPI(params, {
        __disableErrorToast: true,
      });
      onSuccess?.(baseResData);
      return true;
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      const { code, msg } = error;
      if (Number(code) === ERROR_CODE.SAFE_CHECK) {
        setShowSecurityCheckFailedMsg?.(true);
      } else {
        Toast.error({
          content: withSlardarIdButton(msg),
        });
      }
      return false;
    }
  };

  const changeVal = () => {
    if (showSecurityCheckFailedMsg) {
      setShowSecurityCheckFailedMsg?.(false);
    }
  };

  return {
    submitBaseInfo,
    baseInfoNode: (
      <>
        <Form<Record<string, unknown>>
          showValidateIcon={false}
          ref={formRef}
          disabled={disabled}
          className={s['base-info-form']}
        >
          {() =>
            disabled ? (
              <>
                {pluginType === PluginType.LOCAL && (
                  <Form.Slot
                    label={{
                      text: I18n.t('create_local_plugin_basic_tool_function'),
                      required: true,
                    }}
                  >
                    {baseInfo.function_name ?? '-'}
                  </Form.Slot>
                )}
                {pluginType === PluginType.PLUGIN && (
                  <>
                    <Form.Slot
                      label={{
                        text: I18n.t('Create_newtool_s1_url'),
                        required: true,
                      }}
                    >
                      {String(pluginUrl) + baseInfo.path}
                    </Form.Slot>
                    <Form.Slot
                      label={{
                        text: I18n.t('Create_newtool_s1_method'),
                        required: true,
                        extra: <InfoPopover data={methodType} />,
                      }}
                    >
                      {API_METHOD_LABEL_MAP[baseInfo?.method || APIMethod.GET]}
                    </Form.Slot>
                  </>
                )}
                {pluginMeta?.auth_type?.includes(AuthorizationType.OAuth) ? (
                  <Form.Slot
                    label={{
                      text: I18n.t('plugin_edit_tool_oauth_enabled_title'),
                      required: true,
                      extra: (
                        <Tooltip
                          content={I18n.t(
                            'plugin_edit_tool_oauth_enabled_title_hover_tip',
                          )}
                        >
                          <IconInfo
                            style={{ color: 'rgba(28, 29, 35, 0.35)' }}
                          />
                        </Tooltip>
                      ),
                    }}
                  >
                    {
                      API_MODE_LABEL_MAP[
                        baseInfo.api_extend?.auth_mode ||
                          PluginToolAuthType.Required
                      ]
                    }
                  </Form.Slot>
                ) : null}
              </>
            ) : (
              <>
                {pluginType === PluginType.LOCAL && (
                  <UIFormTextArea
                    className={s['textarea-single-line']}
                    field="function_name"
                    label={I18n.t('create_local_plugin_basic_tool_function')}
                    placeholder={I18n.t(
                      'create_local_plugin_basic_tool_function_input_placeholder',
                    )}
                    rows={1}
                    trigger={['blur', 'change']}
                    maxCount={30}
                    maxLength={30}
                    rules={[
                      {
                        required: true,
                        message: I18n.t(
                          'create_local_plugin_basic_warning_no_tool_function_entered',
                        ),
                      },
                    ]}
                    onChange={changeVal}
                  />
                )}
                {pluginType === PluginType.PLUGIN && (
                  <>
                    <UIFormInput
                      field="path"
                      label={{
                        text: I18n.t('Create_newtool_s1_url'),
                      }}
                      trigger={['blur', 'change']}
                      addonBefore={
                        <div className={s['plugin-url-prefix']}>
                          <Typography.Text
                            ellipsis={{
                              showTooltip: {
                                type: 'tooltip',
                                opts: {
                                  content: pluginUrl,
                                  style: {
                                    wordBreak: 'break-word',
                                  },
                                },
                              },
                            }}
                          >
                            {pluginUrl}
                          </Typography.Text>
                        </div>
                      }
                      style={{ width: '100%' }}
                      className={s['plugin-url-input']}
                      placeholder={I18n.t('Create_newtool_s1_url_empty')}
                      rules={[
                        {
                          required: true,
                          message: I18n.t('Create_newtool_s1_url_error2'),
                        },
                        {
                          pattern: /^\//,
                          message: I18n.t('Create_newtool_s1_url_error1'),
                        },
                        {
                          // eslint-disable-next-line no-control-regex
                          pattern: /^[\x00-\x7F]+$/,
                          message: I18n.t('tool_new_S1_URL_error'),
                        },
                      ]}
                    ></UIFormInput>
                    <UIFormSelect
                      field="method"
                      initValue={APIMethod.GET}
                      label={{
                        text: I18n.t('Create_newtool_s1_method'),
                        extra: <InfoPopover data={methodType} />,
                      }}
                      showClear
                      trigger={['blur', 'change']}
                      style={{ width: '100%', borderRadius: '8px' }}
                      placeholder={I18n.t(
                        'workflow_detail_condition_pleaseselect',
                      )}
                      rules={[
                        {
                          required: true,
                          message: I18n.t(
                            'workflow_detail_condition_pleaseselect',
                          ),
                        },
                      ]}
                    >
                      {[
                        APIMethod.GET,
                        APIMethod.POST,
                        APIMethod.PUT,
                        APIMethod.DELETE,
                        APIMethod.PATCH,
                      ].map(method => (
                        <Option value={method} key={method}>
                          {API_METHOD_LABEL_MAP[method]}
                        </Option>
                      ))}
                    </UIFormSelect>
                    {pluginMeta?.auth_type?.includes(
                      AuthorizationType.OAuth,
                    ) ? (
                      <UIFormSelect
                        field="auth_mode"
                        initValue={PluginToolAuthType.Required}
                        label={{
                          text: I18n.t('plugin_edit_tool_oauth_enabled_title'),
                          extra: (
                            <Tooltip
                              content={I18n.t(
                                'plugin_edit_tool_oauth_enabled_title_hover_tip',
                              )}
                            >
                              <IconInfo
                                style={{ color: 'rgba(28, 29, 35, 0.35)' }}
                              />
                            </Tooltip>
                          ),
                        }}
                        showClear
                        trigger={['blur', 'change']}
                        style={{ width: '100%', borderRadius: '8px' }}
                        placeholder={I18n.t(
                          'workflow_detail_condition_pleaseselect',
                        )}
                        rules={[
                          {
                            required: true,
                            message: I18n.t(
                              'workflow_detail_condition_pleaseselect',
                            ),
                          },
                        ]}
                      >
                        {[
                          PluginToolAuthType.Required,
                          PluginToolAuthType.Supported,
                          PluginToolAuthType.Disable,
                        ].map(mode => (
                          <Option value={mode} key={mode}>
                            {API_MODE_LABEL_MAP[mode]}
                          </Option>
                        ))}
                      </UIFormSelect>
                    ) : null}
                  </>
                )}
              </>
            )
          }
        </Form>
      </>
    ),
  };
};

const API_METHOD_LABEL_MAP: Record<APIMethod, string> = {
  [APIMethod.GET]: I18n.t('Create_newtool_s1_method_get'),
  [APIMethod.POST]: I18n.t('Create_newtool_s1_method_post'),
  [APIMethod.PUT]: I18n.t('Create_newtool_s1_method_put'),
  [APIMethod.DELETE]: I18n.t('Create_newtool_s1_method_delete'),
  [APIMethod.PATCH]: I18n.t('Create_tool_s1_method_patch_name'),
};

const API_MODE_LABEL_MAP: Record<PluginToolAuthType, string> = {
  [PluginToolAuthType.Required]: I18n.t(
    'plugin_edit_tool_oauth_enabled_status_auth_required',
  ),
  [PluginToolAuthType.Supported]: I18n.t(
    'plugin_edit_tool_oauth_enabled_status_auth_optional',
  ),
  [PluginToolAuthType.Disable]: I18n.t(
    'plugin_edit_tool_oauth_enabled_status_auth_disabled',
  ),
};

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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useRef, useState } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { UIModal, UIButton, Space, Form, UIToast } from '@coze-arch/bot-semi';
import { IconInfoCircle } from '@coze-arch/bot-icons';
import {
  ParameterLocation,
  PluginType,
  type PluginMetaInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, PluginDevelopApi } from '@coze-arch/bot-api';
import { PictureUpload } from '@coze-common/biz-components/picture-upload';
import { type OauthTccOpt } from '@coze-studio/plugin-shared';

import { getRegisterInfo } from '../utils';
import { ERROR_CODE, INITIAL_PLUGIN_REPORT_PARAMS } from '../const';
import { PluginDocs } from '../../plugin-docs';
import { type AuthOption, findAuthTypeItem, getAuthOptions } from './utils';
import { type ConfirmFormProps } from './interface';
import {
  AuthTypeField,
  ExtItems,
  HeaderListField,
  PluginDescField,
  PluginNameField,
  PluginUrlField,
  ServiceField,
} from './fields';

import s from './index.module.less';

interface PluginInfoConfirmProps {
  visible: boolean;
  importInfo?: {
    metaInfo?: PluginMetaInfo;
    aiPlugin?: string;
    openAPI?: string;
    extra?: {
      reportParams?: ParamsTypeDefine[EVENT_NAMES.create_plugin_front];
    };
  };
  disabled?: boolean;
  onCancel?: () => void;
  onSuccess?: (pluginInfo?: { plugin_id?: string }) => void;
  onError?: () => void;
  projectId?: string;
}

const INITIAL_FORM_VALUES = {
  headerList: [{ name: 'User-Agent', value: 'Coze/1.0' }],
};

/**
File import plugin confirmation information pop-up window, currently very similar to ordinary creation and import, the call interface is different.
At present, I feel that this confirmation form is not very friendly, and I am not sure about the optimization form in the future, so a new separate file is created to prevent contamination of bot-form-edit.
*/

// eslint-disable-next-line complexity
export const PluginInfoConfirm: React.FC<PluginInfoConfirmProps> = props => {
  const {
    onCancel,
    importInfo,
    visible,
    onSuccess,
    disabled = false,
    projectId,
  } = props;

  const [authOption, setAuthOption] = useState<AuthOption[]>([]);
  // Compliance audit results
  const [isValidCheckResult, setIsValidCheckResult] = useState(true);

  const [extItems, setExtItems] = useState<OauthTccOpt[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const header = importInfo?.metaInfo?.common_params?.[4] || [];
  const initialFormValues = importInfo
    ? { ...importInfo?.metaInfo, headerList: header || [] }
    : INITIAL_FORM_VALUES;

  const formApi = useRef<FormApi<ConfirmFormProps>>();

  const formStateValues = formApi.current?.getFormState()?.values;

  const spaceId = useSpaceStore(store => store.space.id);

  useEffect(() => {
    (async () => {
      const res = await DeveloperApi.GetOAuthSchema();
      const authOptions = getAuthOptions(res?.oauth_schema);
      setAuthOption(authOptions);
    })();
  }, []);

  useEffect(() => {
    if (importInfo) {
      //update plugin
      setExtItems(
        findAuthTypeItem(
          authOption,
          importInfo.metaInfo?.auth_type?.at(-1) || 0,
        )?.items || [],
      );
    } else {
      setExtItems([]);
    }
  }, [authOption, importInfo]);

  // eslint-disable-next-line complexity
  const confirmBtn = async () => {
    await formApi.current?.validate();
    const formValues = formApi.current?.getValues();

    if (!formValues) {
      return;
    }

    const { openAPI, aiPlugin } = getEditRegisterInfo(formValues);

    try {
      setSubmitting(true);
      const { data } = await PluginDevelopApi.RegisterPlugin(
        {
          ai_plugin: aiPlugin,
          openapi: openAPI,
          plugin_type: PluginType.PLUGIN,
          client_id: formValues?.client_id,
          client_secret: formValues?.client_secret,
          service_token: formValues?.service_token,
          import_from_file: true,
          space_id: spaceId,
          project_id: projectId,
        },
        {
          __disableErrorToast: true,
        },
      );

      UIToast.success(I18n.t('plugin_imported_successfully'));

      onCancel?.();
      await onSuccess?.({ plugin_id: data?.plugin_id });

      sendTeaEvent(EVENT_NAMES.create_plugin_front, {
        ...(importInfo?.extra?.reportParams || INITIAL_PLUGIN_REPORT_PARAMS),
        status: 0,
      });
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      const { code, msg } = error;
      sendTeaEvent(EVENT_NAMES.create_plugin_front, {
        ...(importInfo?.extra?.reportParams || INITIAL_PLUGIN_REPORT_PARAMS),
        status: 1,
        error_message: msg,
      });
      if (Number(code) === ERROR_CODE.SAFE_CHECK) {
        setIsValidCheckResult(false);
      } else {
        UIToast.error({
          content: withSlardarIdButton(msg),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getEditRegisterInfo = (formValues: ConfirmFormProps) => {
    const { headerList, plugin_uri = [], ...extraValues } = formValues;
    const json: Record<string, string> = {};
    extItems?.forEach(item => {
      if (item.key in formValues) {
        // @ts-expect-error -- linter-disable-autofix
        json[item.key] = formValues[item.key];
      }
    });

    const metaParams: PluginMetaInfo = {
      ...extraValues,
      oauth_info: JSON.stringify(json),
      icon: { uri: plugin_uri[0]?.uid },
      common_params: {
        [ParameterLocation.Header]: formValues?.headerList || [],
        [ParameterLocation.Body]: [],
        [ParameterLocation.Path]: [],
        [ParameterLocation.Query]: [],
      },
    };

    const params = getRegisterInfo(metaParams, {
      openAPI: importInfo?.openAPI,
      aiPlugin: importInfo?.aiPlugin,
    });

    return params;
  };

  useEffect(() => {
    if (!isValidCheckResult) {
      setIsValidCheckResult(true);
    }
  }, [formStateValues?.name || formStateValues?.desc]);

  return (
    <>
      {visible ? (
        <UIModal
          type="action-small"
          title={I18n.t('confirm_plugin_information')}
          visible={visible}
          onCancel={() => onCancel?.()}
          footer={
            !disabled && (
              <div>
                {!isValidCheckResult && (
                  <div className={s['error-msg-box']}>
                    <span className={s['error-msg']}>
                      {I18n.t('plugin_create_modal_safe_error')}
                    </span>
                  </div>
                )}
                <div>
                  <UIButton
                    type="tertiary"
                    onClick={() => {
                      onCancel?.();
                    }}
                  >
                    {I18n.t('create_plugin_modal_button_cancel')}
                  </UIButton>
                  <UIButton
                    type="primary"
                    theme="solid"
                    loading={submitting}
                    onClick={() => {
                      confirmBtn();
                    }}
                  >
                    {I18n.t('create_plugin_modal_button_confirm')}
                  </UIButton>
                </div>
              </div>
            )
          }
        >
          <Form<typeof initialFormValues>
            // @ts-expect-error -- linter-disable-autofix
            getFormApi={api => (formApi.current = api)}
            showValidateIcon={false}
            initValues={{ ...(initialFormValues || {}) }}
            className={s['upload-form']}
          >
            {({ values }) => (
              <>
                {/* plugin avatar */}
                <PictureUpload
                  noLabel
                  disabled={disabled}
                  fieldClassName={s['upload-field']}
                  field="plugin_uri"
                  iconType={IconType.Plugin}
                  fileBizType={FileBizType.BIZ_PLUGIN_ICON}
                />
                {/* Plugin Name/Plugin Description/Plugin URL */}
                <PluginNameField disabled={disabled} />
                <PluginDescField disabled={disabled} />
                <PluginUrlField disabled={true} />
                {/* Plugin Header */}
                <HeaderListField disabled={disabled} />
                {/* Authorization method */}
                <AuthTypeField
                  disabled={disabled}
                  authOption={authOption}
                  onChange={val => {
                    setExtItems(
                      findAuthTypeItem(authOption, val?.at(-1))?.items || [],
                    );
                  }}
                />
                {/* Authorization method-Service */}
                {values.auth_type.at(-1) === 1 && (
                  <ServiceField disabled={disabled} />
                )}
                <ExtItems disabled={disabled} extItems={extItems} />
                {/* agreement */}
                {!disabled && (
                  <Space spacing={8} className={s['footer-draft']}>
                    <IconInfoCircle
                      style={{
                        fontSize: '16px',
                        color: '#4D53E8',
                      }}
                    />
                    <span>
                      {I18n.t('plugin_create_draft_desc')}
                      <PluginDocs />
                    </span>
                  </Space>
                )}
              </>
            )}
          </Form>
        </UIModal>
      ) : null}
    </>
  );
};

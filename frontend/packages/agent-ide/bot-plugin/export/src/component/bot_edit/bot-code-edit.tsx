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

import { useState, useEffect, type ReactNode } from 'react';

import classNames from 'classnames';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIButton, UIModal, Toast, Space } from '@coze-arch/bot-semi';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { Editor } from '../editor';

import s from './index.module.less';

export interface CreatePluginProps {
  visible: boolean;
  isCreate?: boolean;
  editInfo?: PluginInfoProps;
  disabled?: boolean;
  onCancel?: () => void;
  onSuccess?: (pluginId?: string) => void;
  actions?: ReactNode;
  projectId?: string;
}

const INDENTATION_SPACES = 2;
const EDITOR_HEIGHT_MAX = 560;

export const CreateCodePluginModal: React.FC<CreatePluginProps> = props => {
  const {
    isCreate = true,
    onCancel,
    editInfo,
    visible,
    onSuccess,
    disabled = false,
    actions,
    projectId,
  } = props;

  const [aiPlugin, setAiPlugin] = useState<string | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [serviceToken, setServiceToken] = useState<string | undefined>();
  const [openApi, setOpenApi] = useState<string | undefined>();

  useEffect(() => {
    /** Reset pop-up data every time you open it */
    if (visible) {
      //Format json
      const desc = JSON.stringify(
        safeJSONParse(editInfo?.code_info?.plugin_desc),
        null,
        INDENTATION_SPACES,
      );
      setAiPlugin(desc || '');
      setOpenApi(editInfo?.code_info?.openapi_desc || '');
      setClientId(editInfo?.code_info?.client_id);
      setClientSecret(editInfo?.code_info?.client_secret);
      setServiceToken(editInfo?.code_info?.service_token);
    }
  }, [visible]);

  const registerPlugin = async () => {
    const params = {
      ai_plugin: aiPlugin,
      client_id: clientId,
      client_secret: clientSecret,
      service_token: serviceToken,
      openapi: openApi,
    };
    let res;
    if (isCreate) {
      res = await PluginDevelopApi.RegisterPlugin({
        ...params,
        project_id: projectId,
        space_id: useSpaceStore.getState().getSpaceId(),
      });
    } else {
      await PluginDevelopApi.UpdatePlugin({
        ...params,
        plugin_id: editInfo?.plugin_id,
        edit_version: editInfo?.edit_version,
      });
    }

    Toast.success({
      content: isCreate
        ? I18n.t('register_success')
        : I18n.t('Plugin_update_success'),
      showClose: false,
    });
    onSuccess?.(res?.data?.plugin_id);
    onCancel?.();
  };

  return (
    <UIModal
      fullScreen
      className="full-screen-modal"
      title={
        <div className={s['bot-code-edit-title-action']}>
          <span>
            {isCreate ? I18n.t('plugin_create') : I18n.t('plugin_Update')}
          </span>
          <div>{actions}</div>
        </div>
      }
      visible={visible}
      onCancel={() => onCancel?.()}
      footer={
        !disabled ? (
          <Space>
            <UIButton type="tertiary" onClick={() => onCancel?.()}>
              {I18n.t('Cancel')}
            </UIButton>
            <UIButton type="primary" onClick={registerPlugin}>
              {I18n.t('Confirm')}
            </UIButton>
          </Space>
        ) : null
      }
      maskClosable={false}
    >
      <div className={classNames(s.flex)}>
        <div className={classNames(s['plugin-height'], s.flex5)}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, borderRight: '1px solid rgb(215,218,221)' }}>
              <div className={s.title}>
                {I18n.t('ai_plugin_(fill_in_json)_*')}
              </div>
              <Editor
                dataTestID="create-plugin-code-editor-json"
                disabled={disabled}
                theme="tomorrow"
                mode="json"
                height={EDITOR_HEIGHT_MAX}
                value={aiPlugin}
                useValidate={false}
                onChange={e => setAiPlugin(e)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className={s.title}>
                {I18n.t('openapi_(fill_in_yaml)_*')}
              </div>
              <Editor
                dataTestID="create-plugin-code-editor-yaml"
                disabled={disabled}
                theme="tomorrow"
                mode="yaml"
                height={EDITOR_HEIGHT_MAX}
                value={openApi}
                useValidate={false}
                onChange={e => setOpenApi(e)}
              />
            </div>
          </div>
        </div>
      </div>
    </UIModal>
  );
};

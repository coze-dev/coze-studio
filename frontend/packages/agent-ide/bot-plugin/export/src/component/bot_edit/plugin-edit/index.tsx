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

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';
import {
  checkOutPluginContext,
  unlockOutPluginContext,
  usePluginStore,
} from '@coze-studio/bot-plugin-store';

import {
  CreateFormPluginModal,
  type CreatePluginFormProps,
} from '../bot-form-edit';
import {
  CreateCodePluginModal,
  type CreatePluginProps,
} from '../bot-code-edit';
import { ImportToolModal, type ImportToolModalProps } from '../../file-import';

import styles from './index.module.less';

export const useBotCodeEditInPlugin = ({
  modalProps,
}: {
  modalProps: Pick<CreatePluginProps, 'onSuccess'>;
}) => {
  const { pluginInfo, canEdit, unlockPlugin, wrapWithCheckLock } =
    usePluginStore(
      useShallow(store => ({
        pluginInfo: store.pluginInfo,
        canEdit: store.canEdit,
        unlockPlugin: store.unlockPlugin,
        wrapWithCheckLock: store.wrapWithCheckLock,
      })),
    );
  const [showCodePluginModel, setShowCodePluginModel] = useState(false);
  const [editable, setEditable] = useState(false);

  const action = useMemo(() => {
    if (!canEdit) {
      return null;
    }

    return (
      <div className={styles.actions}>
        {editable ? (
          <UIButton
            onClick={() => {
              setEditable(false);
              unlockPlugin();
            }}
          >
            {I18n.t('Cancel')}
          </UIButton>
        ) : (
          <UIButton
            theme="solid"
            onClick={wrapWithCheckLock(() => setEditable(true))}
          >
            {I18n.t('Edit')}
          </UIButton>
        )}
      </div>
    );
  }, [editable, canEdit]);

  useEffect(() => {
    if (showCodePluginModel) {
      setEditable(false);
    }
  }, [showCodePluginModel]);

  const modal = (
    <CreateCodePluginModal
      {...modalProps}
      isCreate={false}
      visible={showCodePluginModel}
      onCancel={() => {
        setShowCodePluginModel(false);
        unlockPlugin();
      }}
      disabled={!editable || !canEdit}
      editInfo={pluginInfo}
      actions={action}
    />
  );

  return { modal, setShowCodePluginModel };
};

export const useBotCodeEditOutPlugin = ({
  modalProps,
}: {
  modalProps: Pick<CreatePluginProps, 'onSuccess'>;
}) => {
  const [pluginInfo, setPluginInfo] = useState<PluginInfoProps>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editable, setEditable] = useState(false);
  const [disableEdit, setDisableEdit] = useState(false);
  const pluginId = pluginInfo?.plugin_id || '';

  const action = useMemo(() => {
    if (disableEdit) {
      return null;
    }

    return (
      <div className={styles.actions}>
        {editable ? (
          <UIButton
            onClick={() => {
              setEditable(false);
              unlockOutPluginContext(pluginId);
            }}
          >
            {I18n.t('Cancel')}
          </UIButton>
        ) : (
          <UIButton
            theme="solid"
            onClick={async () => {
              const isLocked = await checkOutPluginContext(pluginId);

              if (isLocked) {
                return;
              }

              setEditable(true);
            }}
          >
            {I18n.t('Edit')}
          </UIButton>
        )}
      </div>
    );
  }, [editable, pluginId, disableEdit]);

  useEffect(() => {
    if (modalVisible) {
      setEditable(false);
    }
  }, [modalVisible]);

  const modal = (
    <CreateCodePluginModal
      {...modalProps}
      editInfo={pluginInfo}
      isCreate={false}
      visible={modalVisible}
      onCancel={() => {
        setModalVisible(false);
        if (!disableEdit) {
          unlockOutPluginContext(pluginId);
        }
      }}
      disabled={!editable}
      actions={action}
    />
  );

  const open = useCallback(async (id: string, disable: boolean) => {
    const res = await PluginDevelopApi.GetPluginInfo({
      plugin_id: id || '',
    });
    setPluginInfo({
      plugin_id: id,
      code_info: {
        plugin_desc: res.code_info?.plugin_desc,
        /** yaml */
        openapi_desc: res.code_info?.openapi_desc,
        client_id: res.code_info?.client_id,
        client_secret: res.code_info?.client_secret,
        service_token: res.code_info?.service_token,
      },
    });
    setDisableEdit(disable);
    setModalVisible(true);
  }, []);

  return { modal, open };
};

export const useBotFormEditInPlugin = ({
  modalProps,
}: {
  modalProps: Pick<CreatePluginFormProps, 'onSuccess'>;
}) => {
  const { pluginInfo, canEdit, unlockPlugin } = usePluginStore(store => ({
    pluginInfo: store.pluginInfo,
    canEdit: store.canEdit,
    unlockPlugin: store.unlockPlugin,
  }));
  const [showFormPluginModel, setShowFormPluginModel] = useState(false);

  const modal = (
    <CreateFormPluginModal
      {...modalProps}
      isCreate={false}
      visible={showFormPluginModel}
      editInfo={pluginInfo}
      onCancel={() => {
        unlockPlugin();
        setShowFormPluginModel(false);
      }}
      disabled={!canEdit}
    />
  );

  return {
    modal,
    setShowFormPluginModel,
  };
};

export const useImportToolInPlugin = ({
  modalProps,
}: {
  modalProps: Pick<ImportToolModalProps, 'onSuccess'>;
}) => {
  const { pluginInfo, unlockPlugin } = usePluginStore(store => ({
    pluginInfo: store.pluginInfo,
    unlockPlugin: store.unlockPlugin,
  }));
  const [showImportToolModal, setShowImportToolModal] = useState(false);

  const modal = (
    <ImportToolModal
      {...modalProps}
      pluginInfo={{
        pluginID: pluginInfo?.plugin_id,
        pluginName: pluginInfo?.meta_info?.name,
        pluginUrl: pluginInfo?.meta_info?.url,
        pluginDesc: pluginInfo?.meta_info?.desc,
        editVersion: pluginInfo?.edit_version,
      }}
      visible={showImportToolModal}
      onCancel={() => {
        unlockPlugin();
        setShowImportToolModal(false);
      }}
    />
  );

  return {
    modal,
    setShowImportToolModal,
  };
};

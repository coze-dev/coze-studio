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

import { type MutableRefObject, useEffect, useState, Fragment } from 'react';

import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info'; // Keep if botId is needed directly
import {
  PictureUpload,
  type UploadValue,
} from '@coze-common/biz-components/picture-upload';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  FileBizType,
  IconType,
  type DraftBot,
} from '@coze-arch/bot-api/developer_api';
import {
  useAgentPersistence,
  useAgentFormManagement,
  AgentInfoForm,
} from '@coze-agent-ide/space-bot/hook';
export interface CreateAgentEntityProps {
  onBefore?: () => void;
  onError?: () => void;
  /** Return Promise only if you need the onSuccess callback to block the pop-up window from closing automatically. */
  onSuccess?: (
    botId?: string,
    spaceId?: string,
    extra?: {
      botName?: string;
      botAvatar?: string;
      botDesc?: string;
    },
  ) => void | Promise<void>;
  botInfoRef?: MutableRefObject<DraftBot | undefined>;
  mode: 'update' | 'add';
  showSpace?: boolean;
  /**
   * Pass this parameter when you need to control externally which space to create the bot in
   * Only suitable for creating
   */
  spaceId?: string;
  /**
   * Navigation bar
   * Button in the upper right corner of the space workspace
   * */
  bizCreateFrom?: 'navi' | 'space';
}

const getPictureUploadInitValue = (
  botInfo?: Partial<DraftBot>,
): UploadValue | undefined => {
  if (!botInfo?.icon_url) {
    return;
  }
  return [
    {
      url: botInfo.icon_url || '',
      uid: botInfo.icon_uri || '',
    },
  ];
};

export const useCreateOrUpdateAgent = ({
  botInfoRef,
  onBefore,
  onSuccess,
  onError,
  mode,
  showSpace = false, // Not displayed by default
  spaceId: outerSpaceId,
  bizCreateFrom,
}: CreateAgentEntityProps) => {
  const [visible, setVisible] = useState(false);

  const botId = useBotInfoStore(state => state.botId);
  const {
    space: { id: spaceId, hide_operation },
    spaces: { bot_space_list: list },
  } = useSpaceStore();

  const {
    formRef,
    isOkButtonDisable,
    checkErr,
    errMsg,
    confirmDisabled,
    setCheckErr,
    setErrMsg,
    handleFormValuesChange,
    getValues,
    resetFormState,
  } = useAgentFormManagement({ initialBotInfo: botInfoRef?.current });

  const {
    loading: persistenceLoading,
    handleCreateBot,
    handleUpdateBot,
  } = useAgentPersistence({
    mode,
    botId,
    currentSpaceId: spaceId,
    outerSpaceId,
    getValues,
    onSuccess,
    onError,
    onBefore,
    setVisible,
    setCheckErr,
    setErrMsg,
    bizCreateFrom,
    showSpace,
  });

  useEffect(() => {
    if (visible) {
      useSpaceStore
        .getState()
        .fetchSpaces()
        .then(res => {
          if (!formRef.current?.formApi?.getValues()?.spaceId) {
            formRef.current?.formApi?.setValue(
              'spaceId',
              hide_operation
                ? res?.bot_space_list?.[0].id
                : spaceId ?? res?.bot_space_list?.[0].id,
            );
          }
        });
    }
    if (visible) {
      resetFormState();
    }
  }, [visible]);

  /**
   * @Param _ open source version does not support this parameter
   */
  const startEdit = (_?: boolean) => {
    setVisible(true);
  };

  const formInitialValues = botInfoRef?.current || {};
  return {
    startEdit,
    modal: (
      <Fragment>
        <Modal
          data-testid="bot.ide.bot_creator.create_bot_modal"
          visible={visible}
          maskClosable={false}
          onCancel={() => {
            setVisible(false);
          }}
          title={
            mode === 'add'
              ? I18n.t('bot_list_create')
              : I18n.t('bot_edit_title')
          }
          okText={I18n.t('Confirm')}
          cancelText={I18n.t('Cancel')}
          okButtonProps={{
            disabled: isOkButtonDisable || confirmDisabled,
            loading: persistenceLoading,
          }}
          footer={null}
          keepDOM={false}
          icon={null}
          onOk={() => {
            mode === 'add' ? handleCreateBot() : handleUpdateBot();
          }}
        >
          <AgentInfoForm
            ref={formRef}
            mode={mode}
            showSpace={showSpace}
            initialValues={formInitialValues}
            spacesList={list || []}
            currentSpaceId={outerSpaceId || spaceId}
            hideOperation={hide_operation}
            checkErr={checkErr}
            errMsg={errMsg}
            onValuesChange={handleFormValuesChange}
            slot={
              <PictureUpload
                accept=".jpeg,.jpg,.png,.gif"
                label={I18n.t('bot_edit_profile_pircture')}
                field="bot_uri"
                initValue={getPictureUploadInitValue(formInitialValues)}
                rules={[{ required: true }]}
                fileBizType={FileBizType.BIZ_BOT_ICON}
                iconType={IconType.Bot}
              />
            }
          />
        </Modal>
      </Fragment>
    ),
  };
};

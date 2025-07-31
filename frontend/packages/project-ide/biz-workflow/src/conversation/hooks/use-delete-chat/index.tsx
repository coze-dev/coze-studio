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

import React, { useMemo, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozChat } from '@coze-arch/coze-design/icons';
import { Modal, Select, Typography, Toast } from '@coze-arch/coze-design';
import {
  type Workflow,
  type ProjectConversation,
} from '@coze-arch/bot-api/workflow_api';
import { workflowApi } from '@coze-arch/bot-api';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

import { DEFAULT_UNIQUE_ID, DEFAULT_CONVERSATION_NAME } from '../../constants';

import s from './index.module.less';

const { Text } = Typography;

// eslint-disable-next-line @coze-arch/max-line-per-function
export const useDeleteChat = ({
  staticList,
  manualRefresh,
  setActivateChat,
}: {
  staticList: ProjectConversation[];
  manualRefresh: () => void;
  setActivateChat: (_chat: ProjectConversation | undefined) => void;
}) => {
  const { spaceId, projectId } = useIDEGlobalStore(store => ({
    spaceId: store.spaceId,
    projectId: store.projectId,
  }));
  const [visible, setVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [replace, setReplace] = useState<Workflow[]>([]);
  const [chat, setChat] = useState<ProjectConversation | undefined>(undefined);
  // key：workflowId，value：conversationId
  const [rebindReplace, setRebindReplace] = useState<Record<string, string>>(
    {},
  );

  const optionList = staticList
    .filter(item => item.unique_id !== chat?.unique_id)
    .map(item => ({
      label: (
        <Text style={{ width: '100%' }} ellipsis={{ showTooltip: true }}>
          {item.conversation_name}
        </Text>
      ),
      value: item.unique_id,
      conversationId: item.conversation_id,
    }));

  /**
   * To an external check, used as a replace request
   */
  const handleDelete = async (_chat?: ProjectConversation) => {
    setChat(_chat);
    const res = await workflowApi.DeleteProjectConversationDef({
      space_id: spaceId,
      project_id: projectId,
      check_only: true,
      unique_id: _chat?.unique_id || '',
    });

    if (res.need_replace) {
      setReplace(res.need_replace);
      const rebindInit = {};
      res.need_replace.forEach(_replace => {
        if (_replace.workflow_id) {
          rebindInit[_replace.workflow_id] = DEFAULT_CONVERSATION_NAME;
        }
      });
      setRebindReplace(rebindInit);
    } else {
      setReplace([]);
    }

    setVisible(true);
  };

  const handleModalOk = async () => {
    setDeleteLoading(true);
    try {
      const res = await workflowApi.DeleteProjectConversationDef({
        space_id: spaceId,
        project_id: projectId,
        unique_id: chat?.unique_id || '',
        replace: rebindReplace,
      });

      if (res.success) {
        setReplace([]);
        setVisible(false);
        Toast.success(I18n.t('wf_chatflow_112'));
        // Refresh the list after successful deletion
        manualRefresh();
        setActivateChat(undefined);
      } else {
        Toast.error(I18n.t('wf_chatflow_151'));
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectChange = (
    workflowId?: string,
    conversationName?: string,
  ) => {
    if (workflowId && conversationName) {
      const newBind = {
        ...rebindReplace,
        [workflowId]: conversationName,
      };
      setRebindReplace(newBind);
    }
  };

  const modalDom = useMemo(() => {
    const dom = (
      <div className={s['rebind-chat']}>
        <div className={s['rebind-title']}>{I18n.t('wf_chatflow_53')}</div>
        <div className={s['rebind-desc']}>{I18n.t('wf_chatflow_54')}</div>
        {replace.map(item => {
          const { name } = item;
          return (
            <div className={s['rebind-item']}>
              <IconCozChat className={s['rebind-icon']} />
              <Text
                ellipsis={{ showTooltip: true }}
                className={s['rebind-text']}
              >
                {name}
              </Text>
              <Select
                dropdownClassName={s['rebind-select']}
                style={{ width: '50%' }}
                dropdownStyle={{ width: 220 }}
                size="small"
                defaultValue={DEFAULT_UNIQUE_ID}
                optionList={optionList}
                onChange={value => {
                  const selectItem = staticList.find(
                    option => option.unique_id === value,
                  );
                  handleSelectChange(
                    item.workflow_id,
                    selectItem?.conversation_name,
                  );
                }}
              />
            </div>
          );
        })}
      </div>
    );
    return (
      <Modal
        visible={visible}
        width={480}
        type="dialog"
        title={I18n.t('wf_chatflow_51')}
        className={s.modal}
        okText={I18n.t('wf_chatflow_55')}
        cancelText={I18n.t('wf_chatflow_56')}
        onCancel={() => setVisible(false)}
        okButtonColor="red"
        okButtonProps={{
          loading: deleteLoading,
        }}
        onOk={handleModalOk}
      >
        <div className={s['content-container']}>
          <div className={s['content-text']}>{I18n.t('wf_chatflow_52')}</div>
          {replace?.length ? dom : null}
        </div>
      </Modal>
    );
  }, [chat, replace, visible, optionList]);

  return {
    handleDelete,
    modalDom,
  };
};

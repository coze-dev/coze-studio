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

import { Element } from 'react-scroll';
import { useLocation } from 'react-router-dom';
import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type ProjectConversation,
  CreateEnv,
} from '@coze-arch/bot-api/workflow_api';
import {
  CONVERSATION_URI,
  getURIPathByPathname,
} from '@coze-project-ide/framework';

import { StaticChatList } from '../static-chat-list';
import {
  useCreateChat,
  useUpdateChat,
  useDeleteChat,
  useBatchDelete,
  useConversationListWithConnector,
} from '../hooks';
import { DynamicChatList } from '../dynamic-chat-list';
import { ErrorCode, MAX_INPUT_LEN } from '../constants';
import { ChatHistory } from '../chat-history';
import { EditInput } from './edit-input';

import styles from './index.module.less';

interface ConversationContentProps {
  connectorId: string;
  createEnv: CreateEnv;
  canEdit?: boolean;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const ConversationContent: React.FC<ConversationContentProps> = ({
  connectorId,
  createEnv,
  canEdit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Create pop-up window at the top
  const [inputVisible, setInputVisible] = useState(false);
  const [activateChat, setActivateChat] = useState<
    ProjectConversation | undefined
  >();
  const { pathname } = useLocation();

  const { staticList, dynamicList, fetch } = useConversationListWithConnector({
    connector_id: connectorId,
    create_env: createEnv,
  });

  const { loading: createLoading, handleCreateChat } = useCreateChat({
    manualRefresh: () => fetch(),
  });
  const { handleUpdateChat, loading: updateLoading } = useUpdateChat({
    manualRefresh: () => fetch(),
  });
  const { handleDelete, modalDom } = useDeleteChat({
    staticList,
    manualRefresh: () => fetch(),
    setActivateChat,
  });

  const handleSelectChat = useCallback((chatItem?: ProjectConversation) => {
    setActivateChat(chatItem);
  }, []);
  const { batchDelete } = useBatchDelete({
    connectorId,
    createEnv,
    manualRefresh: () => fetch(),
    setActivateChat,
  });

  useEffect(() => {
    // Initialize the selected interface to return data. conversationId may be 0 to display empty
    if (!activateChat && staticList?.length) {
      handleSelectChat(staticList[0]);
    }
  }, [staticList]);

  const handleCreateInput = useCallback(() => {
    setInputVisible(true);
  }, []);

  const handleValidateName = (_input: string) => {
    if (_input?.length > MAX_INPUT_LEN) {
      return ErrorCode.EXCEED_MAX_LENGTH;
    }
    if (staticList.some(item => item.conversation_name === _input)) {
      return ErrorCode.DUPLICATE;
    }
    return undefined;
  };

  const handleCreateSession = async (input?: string, error?: ErrorCode) => {
    if (!input) {
      setInputVisible(false);
      return;
    }
    if (!error) {
      await handleCreateChat(input);
    }
    setInputVisible(false);
  };

  const conversationName = useMemo(() => {
    if (
      createEnv !== CreateEnv.Draft &&
      activateChat?.release_conversation_name
    ) {
      return activateChat?.release_conversation_name;
    }
    return activateChat?.conversation_name || '';
  }, [createEnv, activateChat]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.scrollIntoView();
    }
  }, [inputVisible]);

  const renderCreateInput = () =>
    inputVisible ? (
      <EditInput
        ref={inputRef}
        loading={createLoading}
        onBlur={handleCreateSession}
        onValidate={handleValidateName}
      />
    ) : null;

  useEffect(() => {
    // Determine whether the session page is displayed, and achieve the effect of refreshing the list when switching tabs
    const value = getURIPathByPathname(pathname);
    if (value && CONVERSATION_URI.displayName === value) {
      fetch();
    }
  }, [pathname]);

  useEffect(() => {
    fetch();
    setActivateChat(undefined);
  }, [connectorId, createEnv]);

  return (
    <div className={styles['page-container']}>
      <div className={styles['chat-list-container']}>
        <div className={styles.title}>{I18n.t('wf_chatflow_101')}</div>
        <div className={styles.description}>
          {createEnv === CreateEnv.Release
            ? I18n.t('wf_chatflow_102')
            : I18n.t('workflow_chatflow_testrun_conversation_des')}
        </div>
        <div className={styles['new-list']} id="conversation-list">
          <Element name="static" />
          <StaticChatList
            canEdit={canEdit}
            list={staticList}
            activateChat={activateChat}
            updateLoading={updateLoading}
            onUpdate={handleUpdateChat}
            onDelete={handleDelete}
            onValidate={handleValidateName}
            onSelectChat={handleSelectChat}
            renderCreateInput={renderCreateInput}
            handleCreateInput={handleCreateInput}
          />
          <Element name="dynamic" />
          <DynamicChatList
            list={dynamicList}
            canEdit={canEdit}
            activateChat={activateChat}
            onDelete={handleDelete}
            onBatchDelete={batchDelete}
            onSelectChat={handleSelectChat}
          />
        </div>
      </div>
      <div className={styles['chat-area']}>
        <ChatHistory
          createEnv={createEnv}
          connectorId={connectorId}
          conversationId={activateChat?.conversation_id}
          conversationName={conversationName}
        />
      </div>
      {modalDom}
    </div>
  );
};

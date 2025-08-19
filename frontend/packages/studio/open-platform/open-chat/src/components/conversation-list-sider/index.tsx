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

/* eslint-disable complexity */
import {
  Fragment,
  type ReactNode,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { IconCozSideNav } from '@coze-arch/coze-design/icons';
import { Input, Modal, SideSheet } from '@coze-arch/coze-design';
import { type Conversation } from '@coze/api';

import { useChatAppStore } from '../studio-open-chat/store';
import {
  useConversationList,
  useGroupedConversations,
} from '../studio-open-chat/hooks/use-conversation-list';
import {
  ConversationList,
  type ConversationListSiderRef,
} from './conversation-list';

import s from './index.module.less';

export const ConversationListSider = forwardRef<
  Pick<ConversationListSiderRef, 'getConversationInfo'>,
  {
    children: ReactNode;
  }
>(({ children }, ref) => {
  const conversationListRef = useRef<ConversationListSiderRef>(null);
  const { currentConversationInfo, updateConversations, cozeApi } =
    useChatAppStore(
      useShallow(state => ({
        currentConversationInfo: state.currentConversationInfo,
        updateConversations: state.updateConversations,
        cozeApi: state.cozeApi,
      })),
    );

  const { loading, conversations, hasMore, loadMore } = useConversationList();

  const groupedConversations = useGroupedConversations(conversations);

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState<{
    visible: boolean;
    type: 'rename' | 'delete';
    conversation: Conversation;
  } | null>(null);

  const handleOpenRenameModal = (conversation: Conversation) => {
    setModalInfo({
      visible: true,
      type: 'rename',
      conversation,
    });
  };

  const handleOpenDeleteModal = (conversation: Conversation) => {
    setModalInfo({
      visible: true,
      type: 'delete',
      conversation,
    });
  };

  const handleUpdateConversationName = async (conversation: Conversation) => {
    try {
      const res = (await cozeApi?.put(`/v1/conversations/${conversation.id}`, {
        name: conversation.name,
      })) as {
        data: Conversation;
        code: number;
      };
      if (res.code !== 0) {
        return;
      }
      await updateConversations([res.data], 'update');
    } catch (error) {
      console.error(error);
    }
  };

  useImperativeHandle(ref, () => ({
    getConversationInfo: () => {
      if (conversationListRef.current) {
        return conversationListRef.current.getConversationInfo();
      }
      return undefined;
    },
  }));

  const handleModalOk = async () => {
    if (!modalInfo) {
      return;
    }
    setIsModalLoading(true);
    try {
      if (modalInfo?.type === 'rename') {
        await handleUpdateConversationName(modalInfo.conversation);
      } else {
        if (modalInfo.conversation.id === currentConversationInfo?.id) {
          if (
            await conversationListRef.current?.handleDeleteConversation(
              modalInfo.conversation,
            )
          ) {
            await conversationListRef.current?.handleCreateConversation();
          }
        } else {
          await conversationListRef.current?.handleDeleteConversation(
            modalInfo.conversation,
          );
        }
      }
      setIsModalLoading(false);
      setModalInfo(null);
    } catch (error) {
      console.error(error);
      setIsModalLoading(false);
    }
  };

  return (
    <div className={s['conversations-container']}>
      {currentConversationInfo?.conversationListVisible &&
      currentConversationInfo?.isLargeWidth ? (
        <ConversationList
          ref={conversationListRef}
          onRename={handleOpenRenameModal}
          onDelete={handleOpenDeleteModal}
          loading={loading}
          groupedConversations={groupedConversations}
          conversations={conversations}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      ) : null}

      <Fragment key={currentConversationInfo?.id}>{children}</Fragment>

      <SideSheet
        visible={
          currentConversationInfo?.conversationListVisible &&
          !currentConversationInfo?.isLargeWidth
        }
        closeIcon={<IconCozSideNav />}
        closable={false}
        closeOnEsc={false}
        maskClosable={false}
        getPopupContainer={() =>
          document.querySelector('.coze-chat-sdk') as HTMLElement
        }
        placement="left"
        width={320}
        className={s['conversations-side-sheet']}
        headerStyle={{
          display: 'none',
        }}
        bodyStyle={{
          padding: 0,
          height: '100%',
        }}
      >
        <ConversationList
          ref={conversationListRef}
          onRename={handleOpenRenameModal}
          onDelete={handleOpenDeleteModal}
          loading={loading}
          groupedConversations={groupedConversations}
          conversations={conversations}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </SideSheet>
      <Modal
        getPopupContainer={() =>
          document.querySelector('.coze-chat-sdk') as HTMLElement
        }
        okButtonProps={{
          loading: isModalLoading,
        }}
        visible={modalInfo?.visible}
        onCancel={() => setModalInfo(null)}
        title={
          modalInfo?.type === 'delete'
            ? I18n.t('web_sdk_delete_conversation', {}, '删除会话')
            : I18n.t('web_sdk_rename_conversation', {}, '重命名会话')
        }
        onOk={handleModalOk}
        okText={
          modalInfo?.type === 'delete'
            ? I18n.t('web_sdk_delete', {}, '删除')
            : I18n.t('web_sdk_confirm', {}, '确定')
        }
        cancelText={I18n.t('web_sdk_cancel', {}, '取消')}
        okButtonColor={modalInfo?.type === 'delete' ? 'red' : 'brand'}
        closable={false}
        maskClosable={false}
        style={{
          maxWidth: '80%',
        }}
      >
        {modalInfo?.type === 'rename' ? (
          <Input
            placeholder={I18n.t(
              'web_sdk_conversation_placeholder',
              {},
              '请输入会话名称',
            )}
            value={modalInfo.conversation.name}
            maxLength={100}
            onChange={value =>
              setModalInfo({
                ...modalInfo,
                conversation: {
                  ...modalInfo.conversation,
                  name: value,
                },
              })
            }
          />
        ) : (
          <span className={s['conversations-list-delete-modal-text']}>
            {I18n.t(
              'web_sdk_conversation_delete_content',
              {},
              '删除后，会话将无法恢复，确认要删除吗？',
            )}
          </span>
        )}
      </Modal>
    </div>
  );
});

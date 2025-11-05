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

import {
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozSideNav } from '@coze-arch/coze-design/icons';
import { Button, IconButton, Spin, Toast } from '@coze-arch/coze-design';
import { type Conversation } from '@coze/api';

import {
  type ConversationSort,
  type SortedConversationItem,
} from '@/types/conversations';
import { Layout } from '@/types/client';
import { useUserInfo } from '@/components/studio-open-chat/hooks';

import {
  PcConversationItem,
  MobileConversationItem,
} from '../conversation-item';
import { type ChatState } from '../../studio-open-chat/store/store';
import { useChatAppProps, useChatAppStore } from '../../studio-open-chat/store';

import s from './index.module.less';

export interface ConversationListSiderRef {
  getConversationInfo: () =>
    | {
        conversationId: string;
        sectionId?: string;
      }
    | undefined;
  handleCreateConversation: () => Promise<void>;
  handleDeleteConversation: (conversation: Conversation) => Promise<Boolean>;
}

export const ConversationList = forwardRef<
  ConversationListSiderRef,
  {
    onRename: (conversation: Conversation) => void;
    onDelete: (conversation: Conversation) => void;
    loading: boolean;
    groupedConversations: Map<ConversationSort, SortedConversationItem[]>;
    conversations: Conversation[];
    hasMore: boolean;
    loadMore: () => Promise<void>;
  }
>(
  (
    {
      onRename,
      onDelete,
      loading,
      groupedConversations,
      conversations,
      hasMore,
      loadMore,
    },
    ref,
  ) => {
    const {
      currentConversationInfo,
      updateCurrentConversationInfo,
      cozeApi,
      updateConversations,
    } = useChatAppStore(
      useShallow(state => ({
        currentConversationInfo: state.currentConversationInfo,
        updateCurrentConversationInfo: state.updateCurrentConversationInfo,
        cozeApi: state.cozeApi,
        updateConversations: state.updateConversations,
      })),
    );

    const userInfo = useUserInfo();

    const conversationRef = useRef<ChatState['currentConversationInfo']>();
    const [addLoading, setAddLoading] = useState(false);
    const {
      layout,
      chatConfig: { bot_id: botId, auth: { connectorId } = {} },
    } = useChatAppProps();

    const isMobile = useMemo(() => layout === Layout.MOBILE, [layout]);

    const listContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleCreateConversation = async () => {
      if (!currentConversationInfo) {
        return;
      }
      try {
        const res = await cozeApi?.conversations.create({
          bot_id: botId,
          // @ts-expect-error: 有这个属性，但是 openapi 没有暴露
          connector_id: connectorId,
          user_id: IS_OPEN_SOURCE ? userInfo?.id : undefined,
        });
        if (res?.id) {
          conversationRef.current = {
            ...currentConversationInfo,
            id: res.id,
            last_section_id: res.last_section_id,
          };
          updateConversations([res], 'add');
          updateCurrentConversationInfo({
            ...currentConversationInfo,
            ...res,
            name: '',
          });
          Toast.info({
            content: I18n.t('web_sdk_create_conversation', {}, '已创建新会话'),
            showClose: false,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleConversationChange = (conversation: Conversation) => {
      if (
        !currentConversationInfo ||
        conversation.id === currentConversationInfo?.id
      ) {
        return;
      }
      const c = {
        ...currentConversationInfo,
        ...conversation,
        id: conversation.id,
        sectionId: conversation.last_section_id,
      };
      conversationRef.current = c;
      updateCurrentConversationInfo(c);
    };

    const handleDeleteConversation = async (conversation: Conversation) => {
      try {
        const res = (await cozeApi?.delete(
          `/v1/conversations/${conversation.id}`,
        )) as {
          code: number;
        };
        if (res.code !== 0) {
          return false;
        }
        await updateConversations([conversation], 'remove');
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    };

    useImperativeHandle(ref, () => ({
      getConversationInfo: () => {
        if (conversationRef.current) {
          return {
            conversationId: conversationRef.current.id,
            sectionId: conversationRef.current.last_section_id,
          };
        } else if (conversations.length > 0) {
          return {
            conversationId: conversations[0].id,
            sectionId: conversations[0].last_section_id,
          };
        }
        return undefined;
      },
      handleCreateConversation,
      handleDeleteConversation,
    }));

    useEffect(() => {
      const observer = new IntersectionObserver(
        entries => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !loading) {
            loadMore();
          }
        },
        {
          root: listContainerRef.current,
          rootMargin: '100px',
          threshold: 0.01,
        },
      );

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => {
        if (loadMoreRef.current) {
          observer.unobserve(loadMoreRef.current);
        }
      };
    }, [hasMore, loading, loadMore]);

    return (
      <div className={s.conversations}>
        <div className={s['conversations-header']}>
          <span className={s['conversations-header-title']}>
            {I18n.t('web_sdk_conversation_history', {}, '会话历史')}
          </span>
          <IconButton
            color="secondary"
            onClick={() => {
              if (currentConversationInfo) {
                updateCurrentConversationInfo({
                  ...currentConversationInfo,
                  conversationListVisible: false,
                });
              }
            }}
            icon={<IconCozSideNav width="18px" height="18px" />}
          />
        </div>
        <Button
          size="large"
          icon={<IconCozPlus />}
          iconPosition="left"
          color="highlight"
          className={s['conversations-create-button']}
          onClick={async () => {
            setAddLoading(true);
            await handleCreateConversation();
            setAddLoading(false);
          }}
          loading={addLoading}
        >
          {I18n.t('web_sdk_add_new_conversation', {}, '创建新会话')}
        </Button>
        <div ref={listContainerRef} className={s['conversations-list']}>
          {Array.from(groupedConversations.entries()).map(
            ([sort, conversationList]) => (
              <div key={sort} className={s['conversations-list-group']}>
                {conversationList.map((conversation, index) =>
                  isMobile ? (
                    <MobileConversationItem
                      isActive={conversation.id === currentConversationInfo?.id}
                      key={conversation.id}
                      item={conversation}
                      shouldDisplayTime={index === 0}
                      onConversationChange={handleConversationChange}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ) : (
                    <PcConversationItem
                      isActive={conversation.id === currentConversationInfo?.id}
                      key={conversation.id}
                      item={conversation}
                      shouldDisplayTime={index === 0}
                      onConversationChange={handleConversationChange}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ),
                )}
              </div>
            ),
          )}
          <div ref={loadMoreRef} style={{ height: '10px', flexShrink: 0 }} />
          {loading ? (
            <Spin
              style={{
                width: '100%',
              }}
            ></Spin>
          ) : null}
        </div>
      </div>
    );
  },
);

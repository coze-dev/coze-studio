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

import { useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import dayjs from 'dayjs';
import { type Conversation, type ListConversationReq } from '@coze/api';

import {
  ConversationSort,
  type SortedConversationItem,
} from '@/types/conversations';

import { type ChatState } from '../store/store';
import { useChatAppProps, useChatAppStore } from '../store';
import { useUserInfo } from './use-user-info';
import { usePaginationRequest } from './use-pagination-request';

// 扩展ListConversationReq类型以满足PaginationParams约束
type ExtendedListConversationReq = ListConversationReq & {
  sort_field: 'created_at' | 'updated_at';
  user_id?: string; // 开源专有
  [key: string]: unknown;
};

interface UseConversationListParams {
  pageSize?: number;
  initialPageNum?: number;
  order?: ExtendedListConversationReq['sort_field'];
}

interface UseConversationListReturn {
  conversations: Conversation[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useConversationList = (
  conversationListParams?: UseConversationListParams,
): UseConversationListReturn => {
  const {
    pageSize = 20,
    initialPageNum = 1,
    order = 'updated_at',
  } = conversationListParams ?? {};
  const {
    chatConfig: { bot_id: botId, auth: { connectorId } = {} },
  } = useChatAppProps();

  const {
    cozeApiSdk,
    currentConversationInfo,
    updateCurrentConversationInfo,
    conversations,
    updateConversations,
  } = useChatAppStore(
    useShallow(state => ({
      cozeApiSdk: state.cozeApi,
      conversations: state.conversations,
      updateCurrentConversationInfo: state.updateCurrentConversationInfo,
      currentConversationInfo: state.currentConversationInfo,
      updateConversations: state.updateConversations,
    })),
  );

  const userInfo = useUserInfo();

  const { data, hasMore, loadMore, loading } = usePaginationRequest<
    Conversation,
    ExtendedListConversationReq
  >({
    requestFn: async params => {
      if (!cozeApiSdk || !botId) {
        return { data: [], has_more: false };
      }
      try {
        const result = await cozeApiSdk.conversations.list(params);
        return {
          data: result.conversations,
          has_more: result.has_more,
        };
      } catch (e) {
        console.error(e);
        return { data: [], has_more: false };
      }
    },
    requestParams: {
      bot_id: botId,
      connector_id: connectorId,
      sort_field: order,
      user_id: IS_OPEN_SOURCE ? userInfo?.id : undefined,
    },
    pageSize,
    initialPageNum,
    autoLoad: !!cozeApiSdk && !!botId,
  });

  useEffect(() => {
    if (data) {
      updateConversations(data, 'replace');
    }
  }, [data]);

  useEffect(() => {
    if (!currentConversationInfo && data.length > 0) {
      const chatContainer = document.querySelector('.coze-chat-sdk');
      let info: ChatState['currentConversationInfo'] = {
        ...data[0],
        conversationListVisible: false,
        isLargeWidth: false,
      };
      if (chatContainer && (chatContainer as HTMLElement).offsetWidth >= 780) {
        info = {
          ...info,
          conversationListVisible: true,
          isLargeWidth: true,
        };
      }
      updateCurrentConversationInfo(info);
    }
  }, [currentConversationInfo, data]);

  return {
    conversations,
    loading,
    hasMore,
    loadMore,
  };
};

export const useGroupedConversations = (conversations: Conversation[]) => {
  const sortedConversations: SortedConversationItem[] = useMemo(() => {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const thirtyDays = 30 * oneDay;

    const newConversationList = conversations
      .map(item => {
        const dateString = item.updated_at || item.created_at || 0;
        const date = dayjs.unix(Number(dateString)).toDate();
        const diff = today.getTime() - date.getTime();

        if (today.toLocaleDateString() === date.toLocaleDateString()) {
          return {
            ...item,
            sort: ConversationSort.Today,
          };
        } else if (diff < thirtyDays) {
          return {
            ...item,
            sort: ConversationSort.In30days,
          };
        } else {
          return {
            ...item,
            sort: ConversationSort.Others,
          };
        }
      })
      .sort((a, b) => {
        if (a.sort !== b.sort) {
          return a.sort - b.sort;
        } else {
          return (
            dayjs.unix(Number(b.updated_at || b.created_at || 0)).valueOf() -
            dayjs.unix(Number(a.updated_at || a.created_at || 0)).valueOf()
          );
        }
      });

    return newConversationList;
  }, [conversations]);

  const groupedConversations = useMemo(() => {
    const groups = new Map<ConversationSort, SortedConversationItem[]>();
    sortedConversations.forEach(conversation => {
      if (!groups.has(conversation.sort)) {
        groups.set(conversation.sort, []);
      }
      groups.get(conversation.sort)?.push(conversation);
    });
    return groups;
  }, [sortedConversations]);

  return groupedConversations;
};

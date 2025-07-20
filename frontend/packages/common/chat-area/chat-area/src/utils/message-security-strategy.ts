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
 
import { type Reporter } from '@coze-arch/logger';

import { type Message } from '../store/types';
import { type ChatActionLockService } from '../service/chat-action-lock';
import { type SystemLifeCycleService } from '../plugin/life-cycle';
import { type StoreSet } from '../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../context/chat-area-context/chat-area-callback';
import { deleteMessageGroupById } from './message-group/message-group';

type NewSectionIdStruct = { replyId: string; newSectionId: string } | null;

interface ExecuteStrategyAction {
  deleteMessageGroupByUserMessageId: (userMessageId: string) => Promise<void>;
  setNewSectionIdStruct: (params: NewSectionIdStruct) => void;
  getNewSectionIdStruct: () => NewSectionIdStruct;
  checkNewSectionIdValid: (replyId: string) => boolean;
  updateStoreSectionId: () => void;
}

type SecurityStrategyData = Pick<Message, 'reply_id'> & {
  extra_info: Pick<Message['extra_info'], 'remove_query_id' | 'new_section_id'>;
};

interface SecurityStrategy {
  execute: (
    data: SecurityStrategyData,
    payload: {
      action: ExecuteStrategyAction;
    },
  ) => Promise<void>;
}

/**
 * 命中策略会删除这个 messageGroup
 * 服务端主动删除, 前端更新视图
 */
class DeleteMessageGroupStrategy implements SecurityStrategy {
  execute: SecurityStrategy['execute'] = async (message, { action }) => {
    const { remove_query_id } = message.extra_info;
    if (!remove_query_id) {
      return;
    }
    /**
     * 用户发送的消息 id 会等同于对应的 groupId
     */
    await action.deleteMessageGroupByUserMessageId(remove_query_id);
  };
}

/**
 * 命中这个策略会清空上下文
 * 服务端主动清空上下文, 前端更新 section_id 并更新视图
 */
class SetNewSectionIdStrategy implements SecurityStrategy {
  execute: SecurityStrategy['execute'] = (message, { action }) => {
    const { new_section_id } = message.extra_info;
    if (!new_section_id) {
      return Promise.resolve();
    }
    action.setNewSectionIdStruct({
      replyId: message.reply_id,
      newSectionId: new_section_id,
    });
    return Promise.resolve();
  };
}

class UpdateStoreSectionIdStrategy implements SecurityStrategy {
  execute: (
    data: SecurityStrategyData,
    payload: { action: ExecuteStrategyAction },
  ) => Promise<void> = (message, { action }) => {
    if (!action.getNewSectionIdStruct()) {
      return Promise.resolve();
    }

    /**
     * 用户连续发送消息时 上一轮的对话会被直接打断不会走到 success 等状态 直接进入新一轮对话的 pulling
     * 有必要在更新时检查下 new_section_id 的时效性
     */
    if (!action.checkNewSectionIdValid(message.reply_id)) {
      action.setNewSectionIdStruct(null);
      return Promise.resolve();
    }

    action.updateStoreSectionId();
    action.setNewSectionIdStruct(null);
    return Promise.resolve();
  };
}

class CombineStrategy implements SecurityStrategy {
  private strategyList: SecurityStrategy[] = [];
  constructor(...strategyList: SecurityStrategy[]) {
    this.strategyList = strategyList;
  }
  execute: SecurityStrategy['execute'] = async (...props) => {
    await Promise.all(
      this.strategyList.map(strategy => strategy.execute(...props)),
    );
    return;
  };
}

export const clearUserMessageAndContextStrategy = new CombineStrategy(
  new DeleteMessageGroupStrategy(),
  new SetNewSectionIdStrategy(),
);

export const updateStoreSectionIdStrategy = new UpdateStoreSectionIdStrategy();

export class SecurityStrategyContext {
  private action: ExecuteStrategyAction;
  private strategy: SecurityStrategy | undefined;
  private newSectionIdStruct: NewSectionIdStruct = null;
  constructor({
    storeSet,
    reporter,
    eventCallback,
    lifeCycleService,
    chatActionLockService,
  }: {
    storeSet: StoreSet;
    reporter: Reporter;
    eventCallback?: ChatAreaEventCallback;
    lifeCycleService: SystemLifeCycleService;
    chatActionLockService: ChatActionLockService;
  }) {
    const {
      useMessagesStore,
      useWaitingStore,
      useSuggestionsStore,
      useMessageMetaStore,
      useSectionIdStore,
      useGlobalInitStore,
    } = storeSet;
    this.action = {
      deleteMessageGroupByUserMessageId: async userMessageId => {
        const { getMessageGroupByUserMessageId } = useMessagesStore.getState();
        const targetGroup = getMessageGroupByUserMessageId(userMessageId);
        if (!targetGroup) {
          return;
        }
        return deleteMessageGroupById(targetGroup.groupId, {
          storeSet: {
            useMessageMetaStore,
            useMessagesStore,
            useSuggestionsStore,
            useWaitingStore,
            useGlobalInitStore,
          },
          reporter,
          eventCallback,
          lifeCycleService,
          chatActionLockService,
        });
      },
      setNewSectionIdStruct: params => {
        this.newSectionIdStruct = params;
      },
      getNewSectionIdStruct: () => this.newSectionIdStruct,
      checkNewSectionIdValid: inputReplyId =>
        this.newSectionIdStruct?.replyId === inputReplyId,
      updateStoreSectionId: () => {
        if (!this.newSectionIdStruct?.newSectionId) {
          return;
        }
        useSectionIdStore
          .getState()
          .setLatestSectionId(this.newSectionIdStruct.newSectionId);
      },
    };
  }

  setStrategy = (strategy: SecurityStrategy) => {
    this.strategy = strategy;
    return this;
  };

  executeStrategy = (data: SecurityStrategyData) =>
    this.strategy?.execute(data, { action: this.action });
}

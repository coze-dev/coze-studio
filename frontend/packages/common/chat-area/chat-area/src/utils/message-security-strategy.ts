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
 * The hit policy will delete this messageGroup.
 * Server level active delete, front-end update view
 */
class DeleteMessageGroupStrategy implements SecurityStrategy {
  execute: SecurityStrategy['execute'] = async (message, { action }) => {
    const { remove_query_id } = message.extra_info;
    if (!remove_query_id) {
      return;
    }
    /**
     * The message id sent by the user will be equivalent to the corresponding groupId.
     */
    await action.deleteMessageGroupByUserMessageId(remove_query_id);
  };
}

/**
 * Hitting this policy will clear the context
 * Server level actively clears context, frontend updates section_id and updates view
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
     * When the user continuously sends messages, the previous round of conversation will be directly interrupted, and will not go to a state such as success, directly entering a new round of conversation pulling
     * It is necessary to check the timeliness of the new_section_id when updating
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

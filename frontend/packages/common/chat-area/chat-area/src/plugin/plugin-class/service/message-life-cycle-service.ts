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
  type OnBeforeReceiveMessageContext,
  type OnBeforeProcessReceiveMessageContext,
  type OnBeforeMessageGroupListUpdateContext,
  type OnAfterSendMessageContext,
  type OnBeforeSendMessageContext,
  type OnBeforeDeleteMessageContext,
  type OnAfterProcessReceiveMessageContext,
  type OnAfterDeleteMessageContext,
  type OnDeleteMessageErrorContext,
  type OnBeforeGetMessageHistoryListContext,
  type OnBeforeAppendSenderMessageIntoStore,
  type OnAfterAppendSenderMessageIntoStore,
  type OnBeforeDistributeMessageIntoMemberSetContent,
  type OnMessagePullingErrorContext,
  type OnMessagePullingSuccessContext,
  type OnSendMessageErrorContext,
} from '../../types/plugin-class/message-life-cycle';
import {
  ReadonlyLifeCycleService,
  WriteableLifeCycleService,
} from './life-cycle-service';

/**
 * ! Hope you noticed that the context information for the lifecycle is placed in ctx
 * ! If the judgment is just context, please pay attention to the convergence into ctx and do not add new parameters
 * ! Please pay attention here when CodeReview.
 */
export abstract class ReadonlyMessageLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * Before sending a message
   */
  onBeforeSendMessage?(ctx: OnBeforeSendMessageContext): Promise<void> | void;
  /**
   * After sending the message
   */
  onAfterSendMessage?(ctx: OnAfterSendMessageContext): Promise<void> | void;
  /**
   * Failed to send message
   */
  onSendMessageError?(ctx: OnSendMessageErrorContext): Promise<void> | void;
  /**
   * When processing a message, before starting processing (before message filtering)
   */
  onBeforeReceiveMessage?(ctx: OnBeforeReceiveMessageContext): void;
  /**
   * When processing a message, before starting processing
   */
  onBeforeProcessReceiveMessage?(
    ctx: OnBeforeProcessReceiveMessageContext,
  ): void;
  /**
   * Processing message groups
   */
  onBeforeMessageGroupListUpdate?(
    ctx: OnBeforeMessageGroupListUpdateContext,
  ): void;
  /**
   * When receiving the message after processing
   */
  onAfterProcessReceiveMessage?(ctx: OnAfterProcessReceiveMessageContext): void;
  /**
   * Before deleting the message
   */
  onBeforeDeleteMessage?(
    ctx: OnBeforeDeleteMessageContext,
  ): Promise<void> | void;
  /**
   * After deleting the message
   */
  onAfterDeleteMessage?(ctx: OnAfterDeleteMessageContext): Promise<void> | void;
  /**
   * Failed to delete message
   */
  onDeleteMessageError?(ctx: OnDeleteMessageErrorContext): Promise<void> | void;
  /**
   * Before getting chat history
   */
  onBeforeGetMessageHistoryList?(
    ctx: OnBeforeGetMessageHistoryListContext,
  ): Promise<void> | void;
  /**
   * Before the sender message enters the Store (before the fake message is displayed on the screen)
   */
  onBeforeAppendSenderMessageIntoStore?(
    ctx: OnBeforeAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * After the sender message enters the Store (after the fake message is uploaded to the screen)
   */
  onAfterAppendSenderMessageIntoStore?(
    ctx: OnAfterAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * MemberSet classification
   */
  onBeforeDistributeMessageIntoMemberSet?(
    ctx: OnBeforeDistributeMessageIntoMemberSetContent,
  ): void;
  /**
   * Message pull status error
   */
  onMessagePullingError?(ctx: OnMessagePullingErrorContext): void;
  /**
   * Message pull flow status successful
   */
  onMessagePullingSuccess?(ctx: OnMessagePullingSuccessContext): void;
}

export abstract class WriteableMessageLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * Before sending a message
   */
  onBeforeSendMessage?(
    ctx: OnBeforeSendMessageContext,
  ): Promise<OnBeforeSendMessageContext> | OnBeforeSendMessageContext;
  /**
   * After sending the message
   */
  onAfterSendMessage?(ctx: OnAfterSendMessageContext): Promise<void> | void;
  /**
   * Failed to send message
   */
  onSendMessageError?(ctx: OnSendMessageErrorContext): Promise<void> | void;
  /**
   * When processing a message, before starting processing (before message filtering)
   */
  onBeforeReceiveMessage?(ctx: OnBeforeReceiveMessageContext): void;
  /**
   * When processing a message, before starting processing
   */
  onBeforeProcessReceiveMessage?(
    ctx: OnBeforeProcessReceiveMessageContext,
  ): OnBeforeProcessReceiveMessageContext;
  /**
   * Process message groups and update data
   */
  onBeforeMessageGroupListUpdate?(
    ctx: OnBeforeMessageGroupListUpdateContext,
  ): OnBeforeMessageGroupListUpdateContext;
  /**
   * When receiving the message after processing
   */
  onAfterProcessReceiveMessage?(ctx: OnAfterProcessReceiveMessageContext): void;
  /**
   * Before deleting the message
   */
  onBeforeDeleteMessage?(
    ctx: OnBeforeDeleteMessageContext,
  ): Promise<void> | void;
  /**
   * After deleting the message
   */
  onAfterDeleteMessage?(ctx: OnAfterDeleteMessageContext): Promise<void> | void;
  /**
   * Failed to delete message
   */
  onDeleteMessageError?(ctx: OnDeleteMessageErrorContext): Promise<void> | void;
  /**
   * Before getting chat history
   */
  onBeforeGetMessageHistoryList?(
    ctx: OnBeforeGetMessageHistoryListContext,
  ):
    | Promise<OnBeforeGetMessageHistoryListContext>
    | OnBeforeGetMessageHistoryListContext;
  /**
   * Before the sender message enters the Store (before the fake message is displayed on the screen)
   * @param ctx
   */
  onBeforeAppendSenderMessageIntoStore?(
    ctx: OnBeforeAppendSenderMessageIntoStore,
  ):
    | Promise<OnBeforeAppendSenderMessageIntoStore>
    | OnBeforeAppendSenderMessageIntoStore;
  /**
   * After the sender message enters the Store (after the fake message is uploaded to the screen)
   */
  onAfterAppendSenderMessageIntoStore?(
    ctx: OnAfterAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * MemberSet classification
   */
  onBeforeDistributeMessageIntoMemberSet?(
    ctx: OnBeforeDistributeMessageIntoMemberSetContent,
  ): OnBeforeDistributeMessageIntoMemberSetContent;
  /**
   * Message pull status error
   */
  onMessagePullingError?(ctx: OnMessagePullingErrorContext): void;
  /**
   * Message pull flow status successful
   */
  onMessagePullingSuccess?(ctx: OnMessagePullingSuccessContext): void;
}

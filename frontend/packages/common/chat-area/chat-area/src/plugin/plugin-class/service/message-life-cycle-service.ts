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
 * ! 希望你注意到生命周期的上下文信息都放在ctx中
 * ! 如果判断只是上下文，请你注意收敛到ctx中，请勿增加新的参数
 * ! CodeReview的时候辛苦也注重一下这里
 */
export abstract class ReadonlyMessageLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * 发送消息之前
   */
  onBeforeSendMessage?(ctx: OnBeforeSendMessageContext): Promise<void> | void;
  /**
   * 发送消息之后
   */
  onAfterSendMessage?(ctx: OnAfterSendMessageContext): Promise<void> | void;
  /**
   * 发送消息失败
   */
  onSendMessageError?(ctx: OnSendMessageErrorContext): Promise<void> | void;
  /**
   * 处理某条消息的时候开始处理之前(消息过滤之前)
   */
  onBeforeReceiveMessage?(ctx: OnBeforeReceiveMessageContext): void;
  /**
   * 处理某条消息的时候开始处理之前
   */
  onBeforeProcessReceiveMessage?(
    ctx: OnBeforeProcessReceiveMessageContext,
  ): void;
  /**
   * 处理消息组
   */
  onBeforeMessageGroupListUpdate?(
    ctx: OnBeforeMessageGroupListUpdateContext,
  ): void;
  /**
   * 接收消息处理之后的时候
   */
  onAfterProcessReceiveMessage?(ctx: OnAfterProcessReceiveMessageContext): void;
  /**
   * 删除消息之前
   */
  onBeforeDeleteMessage?(
    ctx: OnBeforeDeleteMessageContext,
  ): Promise<void> | void;
  /**
   * 删除消息之后
   */
  onAfterDeleteMessage?(ctx: OnAfterDeleteMessageContext): Promise<void> | void;
  /**
   * 删除消息失败
   */
  onDeleteMessageError?(ctx: OnDeleteMessageErrorContext): Promise<void> | void;
  /**
   * 获取历史消息之前
   */
  onBeforeGetMessageHistoryList?(
    ctx: OnBeforeGetMessageHistoryListContext,
  ): Promise<void> | void;
  /**
   * 发送者消息进入Store之前（假消息上屏前）
   */
  onBeforeAppendSenderMessageIntoStore?(
    ctx: OnBeforeAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * 发送者消息进入Store之后（假消息上屏后）
   */
  onAfterAppendSenderMessageIntoStore?(
    ctx: OnAfterAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * MemberSet分类
   */
  onBeforeDistributeMessageIntoMemberSet?(
    ctx: OnBeforeDistributeMessageIntoMemberSetContent,
  ): void;
  /**
   * 消息拉流状态错误
   */
  onMessagePullingError?(ctx: OnMessagePullingErrorContext): void;
  /**
   * 消息拉流状态成功
   */
  onMessagePullingSuccess?(ctx: OnMessagePullingSuccessContext): void;
}

export abstract class WriteableMessageLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * 发送消息之前
   */
  onBeforeSendMessage?(
    ctx: OnBeforeSendMessageContext,
  ): Promise<OnBeforeSendMessageContext> | OnBeforeSendMessageContext;
  /**
   * 发送消息之后
   */
  onAfterSendMessage?(ctx: OnAfterSendMessageContext): Promise<void> | void;
  /**
   * 发送消息失败
   */
  onSendMessageError?(ctx: OnSendMessageErrorContext): Promise<void> | void;
  /**
   * 处理某条消息的时候开始处理之前(消息过滤之前)
   */
  onBeforeReceiveMessage?(ctx: OnBeforeReceiveMessageContext): void;
  /**
   * 处理某条消息的时候开始处理之前
   */
  onBeforeProcessReceiveMessage?(
    ctx: OnBeforeProcessReceiveMessageContext,
  ): OnBeforeProcessReceiveMessageContext;
  /**
   * 处理消息组并更新数据
   */
  onBeforeMessageGroupListUpdate?(
    ctx: OnBeforeMessageGroupListUpdateContext,
  ): OnBeforeMessageGroupListUpdateContext;
  /**
   * 接收消息处理之后的时候
   */
  onAfterProcessReceiveMessage?(ctx: OnAfterProcessReceiveMessageContext): void;
  /**
   * 删除消息之前
   */
  onBeforeDeleteMessage?(
    ctx: OnBeforeDeleteMessageContext,
  ): Promise<void> | void;
  /**
   * 删除消息之后
   */
  onAfterDeleteMessage?(ctx: OnAfterDeleteMessageContext): Promise<void> | void;
  /**
   * 删除消息失败
   */
  onDeleteMessageError?(ctx: OnDeleteMessageErrorContext): Promise<void> | void;
  /**
   * 获取历史消息之前
   */
  onBeforeGetMessageHistoryList?(
    ctx: OnBeforeGetMessageHistoryListContext,
  ):
    | Promise<OnBeforeGetMessageHistoryListContext>
    | OnBeforeGetMessageHistoryListContext;
  /**
   * 发送者消息进入Store之前（假消息上屏前）
   * @param ctx
   */
  onBeforeAppendSenderMessageIntoStore?(
    ctx: OnBeforeAppendSenderMessageIntoStore,
  ):
    | Promise<OnBeforeAppendSenderMessageIntoStore>
    | OnBeforeAppendSenderMessageIntoStore;
  /**
   * 发送者消息进入Store之后（假消息上屏后）
   */
  onAfterAppendSenderMessageIntoStore?(
    ctx: OnAfterAppendSenderMessageIntoStore,
  ): Promise<void> | void;
  /**
   * MemberSet分类
   */
  onBeforeDistributeMessageIntoMemberSet?(
    ctx: OnBeforeDistributeMessageIntoMemberSetContent,
  ): OnBeforeDistributeMessageIntoMemberSetContent;
  /**
   * 消息拉流状态错误
   */
  onMessagePullingError?(ctx: OnMessagePullingErrorContext): void;
  /**
   * 消息拉流状态成功
   */
  onMessagePullingSuccess?(ctx: OnMessagePullingSuccessContext): void;
}

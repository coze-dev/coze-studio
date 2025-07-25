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
  type OnOnboardingSelectChangeContext,
  type OnBeforeClearContextContext,
  type OnSelectionChangeContext,
  type OnImageClickContext,
  type OnStopRespondingErrorContext,
  type OnInputPasteContext,
  type OnLinkElementContext,
  type OnImageElementContext,
  type OnAfterStopRespondingContext,
  type OnMessageLinkClickContext,
} from '../../types/plugin-class/command-life-cycle';
import {
  ReadonlyLifeCycleService,
  WriteableLifeCycleService,
} from './life-cycle-service';

/**
 * ! 希望你注意到生命周期的上下文信息都放在ctx中
 * ! 如果判断只是上下文，请你注意收敛到ctx中，请勿增加新的参数
 * ! CodeReview的时候辛苦也注重一下这里
 */
export abstract class ReadonlyCommandLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * 清除历史消息之前
   */
  onBeforeClearHistory?(): Promise<void> | void;
  /**
   * 清除历史消息之后
   */
  onAfterClearHistory?(): Promise<void> | void;
  /**
   * 清除上下文之前
   */
  onBeforeClearContext?(ctx: OnBeforeClearContextContext): Promise<void> | void;
  /**
   * 清除上下文之后
   */
  onAfterClearContext?(): Promise<void> | void;
  /**
   * 清除上下文失败
   */
  onClearContextError?(): Promise<void> | void;
  /**
   * 停止响应之前
   */
  onBeforeStopResponding?(): Promise<void> | void;
  /**
   * 停止响应之后
   */
  onAfterStopResponding?(): Promise<void> | void;
  /**
   * 停止响应失败
   */
  onStopRespondingError?(
    ctx: OnStopRespondingErrorContext,
  ): Promise<void> | void;
  /**
   * 开场白选中事件
   */
  onOnboardingSelectChange?(
    ctx: OnOnboardingSelectChangeContext,
  ): Promise<void> | void;
  /**
   * input点击事件
   */
  onInputClick?(): Promise<void> | void;
  /**
   * selection store数据发生变化
   */
  onSelectionChange?(ctx: OnSelectionChangeContext): Promise<void> | void;
  /**
   * 图片点击事件
   */
  onImageClick?(ctx: OnImageClickContext): Promise<void> | void;
  /**
   * 输入框粘贴事件
   */
  onInputPaste?(ctx: OnInputPasteContext): Promise<void> | void;
  /**
   * 滚动事件处理
   */
  onViewScroll?(): void;
  /**
   * 卡片类型的链接鼠标移入（包括图片）按照 CardBuilder 开发者的意思，后续只要是类似场景都复用这个
   */
  onCardLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * 卡片类型的链接鼠标移出（包括图片）按照 CardBuilder 开发者的意思，后续只要是类似场景都复用这个
   */
  onCardLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * MdBox类型的图片鼠标移入
   */
  onMdBoxImageElementMouseEnter?(ctx: OnImageElementContext): void;
  /**
   * MdBox类型的图片鼠标移出
   */
  onMdBoxImageElementMouseLeave?(ctx: OnImageElementContext): void;
  /**
   * MdBox类型的Link鼠标移入
   */
  onMdBoxLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * MdBox类型的Link鼠标移出
   */
  onMdBoxLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * Link 点击
   */
  onMessageLinkClick?(ctx: Omit<OnMessageLinkClickContext, 'event'>): void;
}

export abstract class WriteableCommandLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * 清除历史消息之前
   */
  onBeforeClearHistory?(): Promise<void> | void;
  /**
   * 清除历史消息之后
   */
  onAfterClearHistory?(): Promise<void> | void;
  /**
   * 清除上下文之前
   */
  onBeforeClearContext?(
    ctx: OnBeforeClearContextContext,
  ): Promise<OnBeforeClearContextContext> | OnBeforeClearContextContext;
  /**
   * 清除上下文之后
   */
  onAfterClearContext?(): Promise<void> | void;
  /**
   * 清除上下文失败
   */
  onClearContextError?(): Promise<void> | void;
  /**
   * 停止响应之前
   */
  onBeforeStopResponding?(): Promise<void> | void;
  /**
   * 停止响应之后
   */
  onAfterStopResponding?(
    ctx: OnAfterStopRespondingContext,
  ): Promise<void> | void;
  /**
   * 停止响应失败
   */
  onStopRespondingError?(
    ctx: OnStopRespondingErrorContext,
  ): Promise<void> | void;
  /**
   * 开场白选中事件
   */
  onOnboardingSelectChange?(
    ctx: OnOnboardingSelectChangeContext,
  ): Promise<void> | void;
  /**
   * input点击事件
   */
  onInputClick?(): Promise<void> | void;
  /**
   * selection store数据发生变化
   */
  onSelectionChange?(ctx: OnSelectionChangeContext): Promise<void> | void;
  /**
   * 图片点击事件
   */
  onImageClick?(ctx: OnImageClickContext): Promise<void> | void;
  /**
   * 输入框粘贴事件
   */
  onInputPaste?(ctx: OnInputPasteContext): Promise<void> | void;
  /**
   * 滚动事件处理
   */
  onViewScroll?(): void;
  /**
   * 卡片类型的链接鼠标移入（包括图片）按照 CardBuilder 开发者的意思，后续只要是类似场景都复用这个
   */
  onCardLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * 卡片类型的链接鼠标移出（包括图片）按照 CardBuilder 开发者的意思，后续只要是类似场景都复用这个
   */
  onCardLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * MdBox类型的图片鼠标移入
   */
  onMdBoxImageElementMouseEnter?(ctx: OnImageElementContext): void;
  /**
   * MdBox类型的图片鼠标移出
   */
  onMdBoxImageElementMouseLeave?(ctx: OnImageElementContext): void;
  /**
   * MdBox类型的Link鼠标移入
   */
  onMdBoxLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * MdBox类型的Link鼠标移出
   */
  onMdBoxLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * Link 点击
   */
  onMessageLinkClick?(ctx: OnMessageLinkClickContext): void;
}

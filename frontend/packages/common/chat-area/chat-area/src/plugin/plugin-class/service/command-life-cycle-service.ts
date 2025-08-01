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
 * ! Hope you noticed that the context information for the lifecycle is placed in ctx
 * ! If the judgment is just context, please pay attention to the convergence into ctx and do not add new parameters
 * ! Please pay attention here when CodeReview.
 */
export abstract class ReadonlyCommandLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  /**
   * Before clearing chat history
   */
  onBeforeClearHistory?(): Promise<void> | void;
  /**
   * After clearing the chat history
   */
  onAfterClearHistory?(): Promise<void> | void;
  /**
   * Before clearing the context
   */
  onBeforeClearContext?(ctx: OnBeforeClearContextContext): Promise<void> | void;
  /**
   * After clearing the context
   */
  onAfterClearContext?(): Promise<void> | void;
  /**
   * Failed to clear context
   */
  onClearContextError?(): Promise<void> | void;
  /**
   * Before stopping responding
   */
  onBeforeStopResponding?(): Promise<void> | void;
  /**
   * After stopping responding
   */
  onAfterStopResponding?(): Promise<void> | void;
  /**
   * Stop response failed
   */
  onStopRespondingError?(
    ctx: OnStopRespondingErrorContext,
  ): Promise<void> | void;
  /**
   * Opening remarks Selected events
   */
  onOnboardingSelectChange?(
    ctx: OnOnboardingSelectChangeContext,
  ): Promise<void> | void;
  /**
   * Input click event
   */
  onInputClick?(): Promise<void> | void;
  /**
   * Selection store data changes
   */
  onSelectionChange?(ctx: OnSelectionChangeContext): Promise<void> | void;
  /**
   * image click event
   */
  onImageClick?(ctx: OnImageClickContext): Promise<void> | void;
  /**
   * Text box paste event
   */
  onInputPaste?(ctx: OnInputPasteContext): Promise<void> | void;
  /**
   * rolling event handling
   */
  onViewScroll?(): void;
  /**
   * The link of the card type is moved by mouse (including pictures). According to the meaning of the CardBuilder developers, this will be reused in the future as long as it is a similar scene.
   */
  onCardLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * The link of the card type is moved out with the mouse (including pictures). According to the meaning of the CardBuilder developers, this will be reused in the future as long as it is a similar scene.
   */
  onCardLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * MdBox type image mouse in
   */
  onMdBoxImageElementMouseEnter?(ctx: OnImageElementContext): void;
  /**
   * MdBox type image mouse out
   */
  onMdBoxImageElementMouseLeave?(ctx: OnImageElementContext): void;
  /**
   * MdBox Type Link Mouse In
   */
  onMdBoxLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * MdBox type Link mouse out
   */
  onMdBoxLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * Link Click
   */
  onMessageLinkClick?(ctx: Omit<OnMessageLinkClickContext, 'event'>): void;
}

export abstract class WriteableCommandLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  /**
   * Before clearing chat history
   */
  onBeforeClearHistory?(): Promise<void> | void;
  /**
   * After clearing the chat history
   */
  onAfterClearHistory?(): Promise<void> | void;
  /**
   * Before clearing the context
   */
  onBeforeClearContext?(
    ctx: OnBeforeClearContextContext,
  ): Promise<OnBeforeClearContextContext> | OnBeforeClearContextContext;
  /**
   * After clearing the context
   */
  onAfterClearContext?(): Promise<void> | void;
  /**
   * Failed to clear context
   */
  onClearContextError?(): Promise<void> | void;
  /**
   * Before stopping responding
   */
  onBeforeStopResponding?(): Promise<void> | void;
  /**
   * After stopping responding
   */
  onAfterStopResponding?(
    ctx: OnAfterStopRespondingContext,
  ): Promise<void> | void;
  /**
   * Stop response failed
   */
  onStopRespondingError?(
    ctx: OnStopRespondingErrorContext,
  ): Promise<void> | void;
  /**
   * Opening remarks Selected events
   */
  onOnboardingSelectChange?(
    ctx: OnOnboardingSelectChangeContext,
  ): Promise<void> | void;
  /**
   * Input click event
   */
  onInputClick?(): Promise<void> | void;
  /**
   * Selection store data changes
   */
  onSelectionChange?(ctx: OnSelectionChangeContext): Promise<void> | void;
  /**
   * image click event
   */
  onImageClick?(ctx: OnImageClickContext): Promise<void> | void;
  /**
   * Text box paste event
   */
  onInputPaste?(ctx: OnInputPasteContext): Promise<void> | void;
  /**
   * rolling event handling
   */
  onViewScroll?(): void;
  /**
   * The link of the card type is moved by mouse (including pictures). According to the meaning of the CardBuilder developers, this will be reused in the future as long as it is a similar scene.
   */
  onCardLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * The link of the card type is moved out with the mouse (including pictures). According to the meaning of the CardBuilder developers, this will be reused in the future as long as it is a similar scene.
   */
  onCardLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * MdBox type image mouse in
   */
  onMdBoxImageElementMouseEnter?(ctx: OnImageElementContext): void;
  /**
   * MdBox type image mouse out
   */
  onMdBoxImageElementMouseLeave?(ctx: OnImageElementContext): void;
  /**
   * MdBox Type Link Mouse In
   */
  onMdBoxLinkElementMouseEnter?(ctx: OnLinkElementContext): void;
  /**
   * MdBox type Link mouse out
   */
  onMdBoxLinkElementMouseLeave?(ctx: OnLinkElementContext): void;
  /**
   * Link Click
   */
  onMessageLinkClick?(ctx: OnMessageLinkClickContext): void;
}

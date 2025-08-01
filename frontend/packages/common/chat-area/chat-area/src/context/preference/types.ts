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

import { type UiKitChatInputButtonConfig } from '@coze-common/chat-uikit';
import { type SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';
import {
  type Layout,
  type UiKitChatInputButtonStatus,
} from '@coze-common/chat-uikit-shared';

export type NewMessageInterruptScenario = 'replying' | 'suggesting' | 'never';

export interface ProviderPassThroughPreference {
  /** Enable bidirectional loading mechanism */
  enableTwoWayLoad: boolean;
  /** Enable read report capability */
  enableMarkRead: boolean;
  showUserExtendedInfo: boolean;
  /** Enable image dynamic adaptability */
  enableImageAutoSize: boolean;
  /**
   * Used to calculate the width of the image size (manually passed in, manually passed in)
   */
  imageAutoSizeContainerWidth: number | undefined;
  /** Activate paste upload capability */
  enablePasteUpload: boolean;
  /**
   * Text box read-only
   */
  isInputReadonly: boolean;
  /**
   * Enable drag and drop upload
   */
  enableDragUpload: boolean;
  /** enable user interlock capability */
  enableChatActionLock?: boolean;
  /**
   * Is the opening statement optional?
   */
  enableSelectOnboarding: boolean;
  /**
   * Configure button status in text box
   */
  uikitChatInputButtonStatus: Partial<UiKitChatInputButtonStatus>;
  /**
   * Prologue display mode: wrap, random
   */
  onboardingSuggestionsShowMode: SuggestedQuestionsShowMode;
  /**
   * Is the background cover displayed?
   */
  showBackground: boolean;
  /**
   * Customize the wait state of the stop reply button
   */
  stopRespondOverrideWaiting: boolean | undefined;
}

/**
 * @Deprecated NOTICE: Do not add attributes here, then gradually replace them with ProviderPassThroughPreference
 */
export interface PreferenceContextInterface {
  /**
   * Can interrupt and send new session scenarios
   * - replying: after sending, the reply process can be interrupted
   * - suggesting: reply completed, can be interrupted in generating suggestions
   * - never: never interrupt
   */
  newMessageInterruptScenario: NewMessageInterruptScenario;
  /**
   * Whether to enable Message Answer Actions
   */
  enableMessageBoxActionBar: boolean;
  /**
   * Whether to start selecting mode
   */
  selectable: boolean;
  /**
   * Clear whether the context shows clear lines
   */
  showClearContextDivider: boolean;
  /**
   * message list width
   */
  messageWidth: string;
  /**
   * Is it read-only?
   */
  readonly: boolean;
  /**
   *
   */
  uiKitChatInputButtonConfig: Partial<UiKitChatInputButtonConfig>;
  /**
   * UIKit button status
   * @Deprecated -- please use this property in the Provider
   */
  uikitChatInputButtonStatus: Partial<UiKitChatInputButtonStatus>;
  /**
   * Theme Style
   */
  theme: 'debug' | 'store' | 'home';
  /**
   * Enable multimodal upload mode
   * Users can upload files to display above the Input area
   * Documents and text can be sent simultaneously
   */
  enableMultimodalUpload: boolean;
  /**
   * The user sends a message immediately after uploading the file
   * Documents and text cannot be sent at the same time
   */
  enableLegacyUpload: boolean;
  /** Start the mentioned function, currently used by coze home\ @bot */
  enableMention: boolean;
  /** Maximum number of files that can be uploaded */
  fileLimit: number;
  /**
   * Whether to display the Input area
   */
  showInputArea: boolean;

  /**
   * Whether to show the opening message
   */
  showOnboardingMessage: boolean;
  /**
   * Is the opening statement centered?
   */
  isOnboardingCentered: boolean;
  /**
   * Whether to show, stop replying
   */
  showStopRespond: boolean;

  /**
   * Whether to force the opening statement message to be displayed (skip the default opening statement page)
   */
  forceShowOnboardingMessage: boolean;

  /**
   * layout
   */
  layout: Layout;

  /**
   * Whether to force the stop reply button to be displayed
   */
  stopRespondOverrideWaiting: boolean | undefined;
}

export type AllChatAreaPreference = PreferenceContextInterface &
  ProviderPassThroughPreference;

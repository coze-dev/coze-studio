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
  type ClipboardEventHandler,
  type PropsWithChildren,
  type ReactNode,
  type ComponentType,
  type FocusEventHandler,
} from 'react';

import { type IChatInputCopywritingConfig } from '../copywriting';
import { type Layout } from '../common';
import { type UploadType } from '../../constants/file';
import { type InputNativeCallbacks } from './input-native-callbacks';
import {
  type AudioRecordEvents,
  type AudioRecordOptions,
  type AudioRecordProps,
} from './audio-record';

export type InputMode = 'input' | 'audio';

export type MentionList = { id: string }[];

export interface SendTextMessagePayload {
  text: string;
  mentionList: MentionList;
}
export interface SendFileMessagePayload {
  file: File;
  mentionList: MentionList;
}

export interface UiKitChatInputButtonStatus {
  isSendButtonDisabled: boolean;
  isClearHistoryButtonDisabled: boolean;
  isClearContextButtonDisabled: boolean;
  isMoreButtonDisabled: boolean;
}

export interface UiKitChatInputButtonConfig {
  isSendButtonVisible: boolean;
  isClearHistoryButtonVisible: boolean;
  isMoreButtonVisible: boolean;
  isClearContextButtonVisible: boolean;
}

export interface SendButtonProps {
  isDisabled?: boolean;
  tooltipContent?: ReactNode;
  onClick: () => void;
  layout?: Layout;
}

// export type InputMode = 'input' | 'audio';

export interface IChatInputProps {
  /**
   * Submit process
   * User action trigger event - > execute submit - > execute clear text box content
   * @Returns false block submit process
   */
  onBeforeSubmit?: () => boolean;
  /**
   * Input focus event callback
   */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * Input blur event callback
   */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * Send Message Event Callback
   */
  onSendMessage?: (payload: SendTextMessagePayload) => void;

  /**
   * Clear context event callback
   */
  onClearContext?: () => void;

  /**
   * Clear historical event callback
   */
  onClearHistory?: () => void;

  /**
   * Upload event callback
   * @param uploadType [IMAGE = 0 FILE = 1]
   * @param file
   * @returns void
   */
  onUpload?: (uploadType: UploadType, payload: SendFileMessagePayload) => void;

  /**
   * Is the entire text box component read-only (including buttons)
   */
  isReadonly?: boolean;

  /**
   * Text box read-only
   */
  isInputReadonly?: boolean;

  /**
   * copywriting configuration
   */
  copywritingConfig?: IChatInputCopywritingConfig;

  /**
   * Left Slot
   */
  leftActions?: ReactNode;

  /**
   * Right Slot
   */
  rightActions?: ReactNode;

  /**
   * Custom send button
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  CustomSendButton?: ComponentType<SendButtonProps>;

  /**
   * Top Slot
   */
  addonTop?: ReactNode;
  /**
   * Left Slot
   */
  addonLeft?: ReactNode;
  /**
   * The entire textarea top slot, the MentionList goes here
   */
  aboveOutside?: ReactNode;

  /**
   * Built-in button grey out
   */
  buildInButtonStatus?: Partial<UiKitChatInputButtonStatus>;

  /**
   * Built-in button configuration
   */
  buildInButtonConfig?: Partial<UiKitChatInputButtonConfig>;
  /**
   * Text box click event
   * @returns void
   */
  onInputClick?: () => void;
  /**
   * @deprecated no consumption
   */
  className?: string;
  /**
   * The classname of the outer container
   */
  wrapperClassName?: string;
  /**
   * In addition to the text in the text box, the user also enters other content that can be sent
   * The purpose is to adapt the file message and send the requirements at the same time
   */
  hasOtherContentToSend?: boolean;

  /**
   * layout
   */
  layout: Layout;

  /**
   * Whether the number of uploadable files exceeds
   */
  isFileCountExceedsLimit: (fileCount: number) => boolean;
  inputTooltip?: ComponentType<PropsWithChildren>;
  /**
   * Is it background cover mode?
   */
  showBackground?: boolean;
  /**
   * Limit the number of files
   */
  limitFileCount?: number;
  /**
   * Callback for paste events
   */
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  inputNativeCallbacks?: InputNativeCallbacks;
  audioRecordEvents?: AudioRecordEvents;
  audioRecordState?: AudioRecordProps;
  audioRecordOptions?: AudioRecordOptions;
  inputMode?: InputMode;
  onInputModeChange?: (mode: InputMode) => void;
}

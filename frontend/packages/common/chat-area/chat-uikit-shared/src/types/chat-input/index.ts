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
   * submit 过程
   * 用户操作触发事件 -> 执行 submit -> 执行清空输入框内容
   * @returns false 阻止 submit 流程
   */
  onBeforeSubmit?: () => boolean;
  /**
   * input focus 事件回调
   */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * input blur 事件回调
   */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /**
   * 发送消息Message事件回调
   */
  onSendMessage?: (payload: SendTextMessagePayload) => void;

  /**
   * 清除上下文事件回调
   */
  onClearContext?: () => void;

  /**
   * 清除历史事件回调
   */
  onClearHistory?: () => void;

  /**
   * 上传事件回调
   * @param uploadType 上传类型 [IMAGE=0 FILE=1]
   * @param file 文件
   * @returns void
   */
  onUpload?: (uploadType: UploadType, payload: SendFileMessagePayload) => void;

  /**
   * 整个输入框组件是否只读（包括按钮）
   */
  isReadonly?: boolean;

  /**
   * 输入框是否只读
   */
  isInputReadonly?: boolean;

  /**
   * 文案配置
   */
  copywritingConfig?: IChatInputCopywritingConfig;

  /**
   * 左侧插槽
   */
  leftActions?: ReactNode;

  /**
   * 右侧插槽
   */
  rightActions?: ReactNode;

  /**
   * 自定义发送按钮
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  CustomSendButton?: ComponentType<SendButtonProps>;

  /**
   * 顶部插槽
   */
  addonTop?: ReactNode;
  /**
   * 左侧插槽
   */
  addonLeft?: ReactNode;
  /**
   * 整个 textarea 顶部插槽，mentionList 放在这里
   */
  aboveOutside?: ReactNode;

  /**
   * 内置按钮置灰状态
   */
  buildInButtonStatus?: Partial<UiKitChatInputButtonStatus>;

  /**
   * 内置按钮配置
   */
  buildInButtonConfig?: Partial<UiKitChatInputButtonConfig>;
  /**
   * 输入框点击事件
   * @returns void
   */
  onInputClick?: () => void;
  /**
   * @deprecated 废弃不消费
   */
  className?: string;
  /**
   * 外容器的 classname
   */
  wrapperClassName?: string;
  /**
   * 除了输入框中的文字 用户也输入了别的可以发送的内容
   * 目的是适配文件消息同时发送需求
   */
  hasOtherContentToSend?: boolean;

  /**
   * 布局方式
   */
  layout: Layout;

  /**
   * 可上传文件是否超过数量
   */
  isFileCountExceedsLimit: (fileCount: number) => boolean;
  inputTooltip?: ComponentType<PropsWithChildren>;
  /**
   * 是否是背景图模式
   */
  showBackground?: boolean;
  /**
   * 限制文件数量
   */
  limitFileCount?: number;
  /**
   * 粘贴事件的回调
   */
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  inputNativeCallbacks?: InputNativeCallbacks;
  audioRecordEvents?: AudioRecordEvents;
  audioRecordState?: AudioRecordProps;
  audioRecordOptions?: AudioRecordOptions;
  inputMode?: InputMode;
  onInputModeChange?: (mode: InputMode) => void;
}

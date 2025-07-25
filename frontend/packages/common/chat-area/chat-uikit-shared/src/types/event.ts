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
 
import { type MouseEvent } from 'react';

import { type SendMessageOptions } from '@coze-common/chat-core';

import { type IMessage } from './common';

export interface IEventCallbacksParams<T = Record<string, unknown>> {
  message: IMessage;
  extra: T;
}

export interface LinkEventData {
  url: string;
  parsedUrl: URL;
  exts: {
    // type: LinkType;
    wiki_link?: string;
  };
}

export type IOnLinkClickParams = IEventCallbacksParams<LinkEventData>;

export type IOnImageClickParams = IEventCallbacksParams<{
  url: string;
}>;

export type IOnCancelUploadParams = IEventCallbacksParams;

export type IOnRetryUploadParams = IEventCallbacksParams;

export type IOnSuggestionClickParams = IEventCallbacksParams<{
  text: string;
  mentionList: { id: string }[];
}>;

export type IOnMessageRetryParams = IEventCallbacksParams;

export type IOnCopyUploadParams = IEventCallbacksParams<{ fileIndex?: number }>;

export type IOnCardSendMsg = IEventCallbacksParams<{
  msg: string;
  mentionList: { id: string }[];
  options?: SendMessageOptions;
}>;
export type IOnCardUpdateStatus = IEventCallbacksParams;

export interface MouseEventProps {
  element: HTMLElement;
  link: string;
}

export type IEventCallbacks = Partial<{
  // 点击 md 中链接的回调函数
  onLinkClick: (
    params: IOnLinkClickParams,
    event: MouseEvent<Element, globalThis.MouseEvent>,
  ) => void;
  // 图片点击事件响应
  onImageClick: (params: IOnImageClickParams) => void;
  // 取消上传事件响应
  onCancelUpload: (params: IOnCancelUploadParams) => void;
  // 恢复上传事件响应
  onRetryUpload: (params: IOnRetryUploadParams) => void;
  // 拷贝文件链接
  onCopyUpload: (params: IOnCopyUploadParams) => void;
  // 重新发送
  onMessageRetry: (params: IOnMessageRetryParams) => void;
  // 点击卡片按钮的事件响应
  onCardSendMsg: (params: IOnCardSendMsg) => void;
  // 更新卡片状态
  onCardUpdateStatus: (params: IOnCardUpdateStatus) => void;
  onCardLinkElementEnter?: (params: MouseEventProps) => void;
  onCardLinkElementLeave?: (params: MouseEventProps) => void;
  onMdBoxLinkElementEnter?: (params: MouseEventProps) => void;
  onMdBoxLinkElementLeave?: (params: MouseEventProps) => void;
  onMdBoxImageElementEnter?: (params: MouseEventProps) => void;
  onMdBoxImageElementLeave?: (params: MouseEventProps) => void;
}>;

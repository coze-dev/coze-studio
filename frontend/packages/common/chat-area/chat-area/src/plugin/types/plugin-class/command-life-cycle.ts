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

import { type ClipboardEvent, type MouseEvent } from 'react';

import { type ClearMessageContextParams } from '@coze-common/chat-core';

import { type StopRespondingErrorScene } from '../../constants/life-cycle-context';
import { type Message } from '../../../store/types';
import {
  type SelectionChangeParams,
  type OnboardingSelectChangeParams,
} from '../../../context/chat-area-context/chat-area-callback';

export type OnBeforeClearContextContext = ClearMessageContextParams;

export interface OnOnboardingSelectChangeContext {
  selected: OnboardingSelectChangeParams;
  isAlreadyHasSelect: boolean;
  content: string;
}

export type OnSelectionChangeContext = SelectionChangeParams;

export interface OnImageClickContext {
  url: string;
}

export interface OnStopRespondingErrorContext {
  scene: StopRespondingErrorScene;
}

export interface OnInputPasteContext {
  // original event
  event: ClipboardEvent<HTMLTextAreaElement>;
}

export interface OnLinkElementContext {
  element: HTMLElement;
  link: string;
}

export interface OnImageElementContext {
  element: HTMLElement;
  link: string;
}

export interface OnAfterStopRespondingContext {
  brokenReplyId: string;
  brokenFlattenMessageGroup: Message[] | null;
}

export interface OnMessageLinkClickContext {
  url: string;
  parsedUrl: URL;
  exts: {
    // type: LinkType;
    wiki_link?: string;
  };
  event: MouseEvent<Element, globalThis.MouseEvent>;
}

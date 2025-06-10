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
  // 原始事件
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

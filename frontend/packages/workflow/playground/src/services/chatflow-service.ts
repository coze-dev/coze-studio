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

import { injectable } from 'inversify';
import { type IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { Emitter, type Event } from '@flowgram-adapter/common';

/**
 * Chatflow testrun item info
 */
export interface SelectItem {
  name: string;
  value: string;
  avatar: string;
  type: IntelligenceType;
}

export interface ConversationItem {
  label: string;
  value: string;
  conversationId: string;
}

@injectable()
export class ChatflowService {
  selectItem?: SelectItem;
  selectConversationItem?: ConversationItem;

  onSelectItemChangeEmitter = new Emitter<SelectItem | undefined>();
  onSelectItemChange: Event<SelectItem | undefined> =
    this.onSelectItemChangeEmitter.event;

  onSelectConversationItemChangeEmitter = new Emitter<
    ConversationItem | undefined
  >();
  onSelectConversationItemChange: Event<ConversationItem | undefined> =
    this.onSelectConversationItemChangeEmitter.event;

  setSelectItem(selectItem?: SelectItem) {
    this.selectItem = selectItem;
    this.onSelectItemChangeEmitter.fire(selectItem);
  }

  setSelectConversationItem(conversationItem?: ConversationItem) {
    this.selectConversationItem = conversationItem;
    this.onSelectConversationItemChangeEmitter.fire(conversationItem);
  }
}

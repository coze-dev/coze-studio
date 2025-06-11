import { injectable } from 'inversify';
import { type IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { Emitter, type Event } from '@flowgram-adapter/common';

/**
 * chatflow testrun 选中的 item 信息
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

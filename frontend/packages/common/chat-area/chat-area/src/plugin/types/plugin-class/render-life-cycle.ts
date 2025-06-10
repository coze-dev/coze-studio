import { type ContentType } from '@coze-common/chat-core';
import { type InsertedElementItem } from '@coze-arch/bot-md-box';

import { type CustomComponent } from '../plugin-component';
import { type MessageMeta, type Message } from '../../../store/types';

export interface OnTextContentRenderingContext {
  insertedElements: InsertedElementItem[] | undefined;
  message: Message;
}

export interface OnMessageBoxRenderContext {
  /**
   * 动态注入的自定义渲染组件
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention -- 符合预期的命名
  MessageBox?: CustomComponent['MessageBox'];
  /**
   * 消息体
   */
  message: Message<ContentType>;
  /**
   * Meta
   */
  meta: MessageMeta;
}

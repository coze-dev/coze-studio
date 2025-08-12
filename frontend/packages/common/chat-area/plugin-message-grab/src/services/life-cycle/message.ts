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

import { getOriginContentText } from '@coze-common/text-grab';
import {
  ContentType,
  type OnBeforeAppendSenderMessageIntoStore,
  WriteableMessageLifeCycleService,
  type OnAfterAppendSenderMessageIntoStore,
} from '@coze-common/chat-area';

import {
  EventNames,
  type GrabPluginBizContext,
} from '../../types/plugin-biz-context';

export class GrabMessageLifeCycleService extends WriteableMessageLifeCycleService<GrabPluginBizContext> {
  onBeforeAppendSenderMessageIntoStore(
    ctx: OnBeforeAppendSenderMessageIntoStore,
  ) {
    const { quoteContent, updateQuoteContentMapByImmer } =
      this.pluginInstance.pluginBizContext.storeSet.useQuoteStore.getState();

    if (!quoteContent || ctx.from === 'shortcut') {
      return ctx;
    }

    const originMessage = ctx.message;

    const newContent = {
      item_list: [
        {
          type: 'text',
          text: originMessage.content,
        },
      ],
      refer_items: [] as unknown[],
    };

    newContent.refer_items.push({
      type: ContentType.Text,
      text: getOriginContentText(quoteContent),
    });

    const newMessage = {
      ...originMessage,
      content_type: ContentType.Mix,
      content: JSON.stringify(newContent),
      content_obj: newContent,
    };

    updateQuoteContentMapByImmer(quoteContentMap => {
      const localMessageId = newMessage.extra_info.local_message_id;
      if (!quoteContentMap[localMessageId]) {
        quoteContentMap[localMessageId] = quoteContent;
      }
    });

    return {
      ...ctx,
      message: newMessage,
    };
  }

  onAfterAppendSenderMessageIntoStore(
    ctx: OnAfterAppendSenderMessageIntoStore,
  ) {
    if (ctx.from === 'shortcut') {
      return;
    }

    const { storeSet } = this.pluginInstance.pluginBizContext;
    const { updateQuoteVisible, updateQuoteContent } =
      storeSet.useQuoteStore.getState();
    updateQuoteVisible(false);
    updateQuoteContent(null);

    return;
  }

  onAfterProcessReceiveMessage() {
    const { emit } = this.pluginInstance.pluginBizContext.eventCenter;
    emit(EventNames.OnMessageUpdate);
  }
}

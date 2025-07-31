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

import { useShallow } from 'zustand/react/shallow';
import {
  PluginName,
  useWriteablePlugin,
  type CustomTextMessageInnerTopSlot,
} from '@coze-common/chat-area';

import { type GrabPluginBizContext } from '../../types/plugin-biz-context';
import { RemoteQuoteInnerTopSlot } from './remote-slot';
import { LocalQuoteInnerTopSlot } from './local-slot';

export const QuoteMessageInnerTopSlot: CustomTextMessageInnerTopSlot = ({
  message,
}) => {
  const localMessageId = message.extra_info.local_message_id;

  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  const { useQuoteStore } = plugin.pluginBizContext.storeSet;

  // Preference is given to locally mapped
  const hasLocal = useQuoteStore(
    useShallow(state => !!state.quoteContentMap[localMessageId]),
  );

  if (hasLocal) {
    return <LocalQuoteInnerTopSlot message={message} />;
  }

  return <RemoteQuoteInnerTopSlot message={message} />;
};

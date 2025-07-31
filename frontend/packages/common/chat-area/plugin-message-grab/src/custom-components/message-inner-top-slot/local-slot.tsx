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

import { QuoteNode } from '../quote-node';
import { type GrabPluginBizContext } from '../../types/plugin-biz-context';
import { QuoteTopUI } from './quote-top-ui';

export const LocalQuoteInnerTopSlot: CustomTextMessageInnerTopSlot = ({
  message,
}) => {
  const localMessageId = message.extra_info.local_message_id;

  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  const { useQuoteStore } = plugin.pluginBizContext.storeSet;

  // Preference is given to locally mapped
  const localNodeList = useQuoteStore(
    useShallow(state => state.quoteContentMap[localMessageId]),
  );

  if (localNodeList) {
    return (
      <QuoteTopUI>
        <QuoteNode nodeList={localNodeList} theme="white" />
      </QuoteTopUI>
    );
  }

  return null;
};

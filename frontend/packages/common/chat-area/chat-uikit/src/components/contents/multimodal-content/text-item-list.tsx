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

import { type ReactNode, type FC } from 'react';

import { type TextMixItem } from '@coze-common/chat-core';
import { type GetBotInfo, type IMessage } from '@coze-common/chat-uikit-shared';

import { PlainTextContent } from '../plain-text-content';
import { typeSafeMessageBoxInnerVariants } from '../../../variants/message-box-inner-variants';
import { isTextMixItem } from '../../../utils/multimodal';

export interface TextItemListProps {
  textItemList: TextMixItem[];
  renderTextContentAddonTop: ReactNode;
  message: IMessage;
  showBackground: boolean;
  getBotInfo: GetBotInfo;
  isContentLoading: boolean | undefined;
}

export const TextItemList: FC<TextItemListProps> = ({
  textItemList,
  renderTextContentAddonTop,
  message,
  showBackground,
  getBotInfo,
  isContentLoading,
}) => (
  <>
    {textItemList.map(item => {
      if (isTextMixItem(item)) {
        const TextContentAddonTop = renderTextContentAddonTop;
        const isTextAndMentionedEmpty =
          !item.text && !message.mention_list.at(0);

        if (isTextAndMentionedEmpty) {
          return null;
        }

        return (
          /**
           * TODO: Since the current design does not support one message to render multiple content, you need to borrow the text bubble background color of the sent message.
           * Currently only users can send multimodal messages
           */
          <div
            className={typeSafeMessageBoxInnerVariants({
              color: 'primary',
              border: null,
              tight: false,
              showBackground,
            })}
            style={{ width: 'fit-content' }}
            key={item.text}
          >
            {TextContentAddonTop}
            <PlainTextContent
              isContentLoading={isContentLoading}
              content={item.text}
              mentioned={message.mention_list.at(0)}
              getBotInfo={getBotInfo}
            />
          </div>
        );
      }
    })}
  </>
);

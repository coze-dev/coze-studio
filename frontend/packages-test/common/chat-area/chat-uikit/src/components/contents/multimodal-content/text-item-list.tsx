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
           * TODO: 由于目前设计不支持一条 message 渲染多个 content 这里需要借用一下发送消息的文字气泡背景色
           * 目前只有用户才能发送 multimodal 消息
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

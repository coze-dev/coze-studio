import { type MouseEvent, type FC, useRef } from 'react';

import { type ImageOptions } from '@coze-arch/bot-md-box';
import {
  type IOnImageClickParams,
  type IOnLinkClickParams,
  type IBaseContentProps,
  type MdBoxProps,
} from '@coze-common/chat-uikit-shared';

import { CozeLink } from '../../md-box-slots/link';
import { CozeImage } from '../../md-box-slots/coze-image';
import { LazyCozeMdBox } from '../../common/coze-md-box/lazy';
import { isText } from '../../../utils/is-text';
import './index.less';

export type IMessageContentProps = IBaseContentProps & {
  onImageClick?: (params: IOnImageClickParams) => void;
  mdBoxProps?: MdBoxProps;
  enableAutoSizeImage?: boolean;
  imageOptions?: ImageOptions;
  onLinkClick?: (
    params: IOnLinkClickParams,
    event: MouseEvent<Element, globalThis.MouseEvent>,
  ) => void;
};

export const TextContent: FC<IMessageContentProps> = props => {
  const {
    message,
    readonly,
    onImageClick,
    onLinkClick,
    mdBoxProps,
    enableAutoSizeImage,
    imageOptions,
  } = props;
  const MdBoxLazy = LazyCozeMdBox;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { content } = message;

  if (!isText(content)) {
    return null;
  }

  const isStreaming = !message.is_finish;
  const text = content.slice(0, message.broken_pos ?? Infinity);

  return (
    <div
      className="chat-uikit-text-content"
      data-testid="bot.ide.chat_area.message.text-answer-message-content"
      ref={contentRef}
      data-grab-mark={message.message_id}
      data-grab-source={message.source}
    >
      <MdBoxLazy
        markDown={text}
        autoFixSyntax={{ autoFixEnding: isStreaming }}
        showIndicator={isStreaming}
        smooth={isStreaming}
        imageOptions={{ forceHttps: true, ...imageOptions }}
        eventCallbacks={{
          onImageClick: (e, eventData) => {
            eventData.src &&
              onImageClick?.({
                message,
                extra: { url: eventData.src },
              });
          },
          onLinkClick: (e, eventData) => {
            onLinkClick?.(
              {
                message,
                extra: { ...eventData },
              },
              e,
            );

            if (readonly) {
              e.preventDefault();
              e.stopPropagation();
            }
          },
        }}
        {...mdBoxProps}
        slots={{
          Image: enableAutoSizeImage ? CozeImage : undefined,
          Link: CozeLink,
          ...mdBoxProps?.slots,
        }}
      ></MdBoxLazy>
    </div>
  );
};

TextContent.displayName = 'TextContent';

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

import { type MouseEvent, type FC, useRef } from 'react';

import {
  type IOnImageClickParams,
  type IOnLinkClickParams,
  type IBaseContentProps,
  type MdBoxProps,
} from '@coze-common/chat-uikit-shared';
import { Image } from '@coze-arch/bot-md-box-adapter/slots';
import { type ImageOptions } from '@coze-arch/bot-md-box-adapter';

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
        imageOptions={{ forceHttps: !IS_OPEN_SOURCE, ...imageOptions }}
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
          Image: enableAutoSizeImage ? CozeImage : Image,
          Link: CozeLink,
          ...mdBoxProps?.slots,
        }}
      ></MdBoxLazy>
    </div>
  );
};

TextContent.displayName = 'TextContent';

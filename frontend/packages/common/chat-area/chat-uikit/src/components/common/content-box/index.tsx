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

import {
  type IEventCallbacks,
  ContentBoxType,
  type MdBoxProps,
  type GetBotInfo,
  type Layout,
  type IContentConfigs,
  type IMessage,
} from '@coze-common/chat-uikit-shared';
import { ContentType } from '@coze-common/chat-core';

import { TextContent } from '../../contents/text-content';
import { SingleImageContentWithAutoSize } from '../../contents/single-image-content/auto-size';
import { SingleImageContent } from '../../contents/single-image-content';
import { SimpleFunctionContent } from '../../contents/simple-function-content';
import { PlainTextContent } from '../../contents/plain-text-content';
import { MultimodalContent } from '../../contents/multimodal-content';
import { ImageContent } from '../../contents/image-content';
import { FileContent } from '../../contents/file-content';
import { isImage } from '../../../utils/is-image';
import { defaultEnable } from '../../../utils/default-enable';
import { MESSAGE_TYPE_VALID_IN_TEXT_LIST } from '../../../constants/content-box';

export interface EnhancedContentConfig {
  rule: (params: {
    message: IMessage;
    contentType: ContentType;
    contentConfigs: IContentConfigs | undefined;
  }) => boolean;
  render: (params: {
    message: IMessage;
    eventCallbacks: IEventCallbacks | undefined;
    contentConfigs: IContentConfigs | undefined;
    options: {
      isCardDisabled?: boolean;
      isContentLoading?: boolean;
      showBackground: boolean;
      readonly?: boolean;
    };
  }) => ReactNode;
}

export interface IContentBoxProps {
  /**
   * Message body content of the Core SDK
   */
  message: IMessage;
  /**
   * event callback object
   */
  eventCallbacks?: IEventCallbacks;
  /**
   * Content of the card configuration
   */
  contentConfigs?: IContentConfigs;
  /**
   * Is it read-only?
   */
  readonly?: boolean;
  getBotInfo: GetBotInfo;
  layout: Layout;
  /**
   * In mix mode, slot the text card
   */
  multimodalTextContentAddonTop?: ReactNode;
  showBackground: boolean;
  /**
   * Enable the ability to automatically adapt pictures
   */
  enableAutoSizeImage?: boolean;

  /**
   * mdBox configuration
   */
  mdBoxProps?: MdBoxProps;
  /**
   * Is the card status disabled?
   */
  isCardDisabled?: boolean;
  isContentLoading?: boolean;
  enhancedContentConfigList?: EnhancedContentConfig[];
}

// eslint-disable-next-line complexity, @coze-arch/max-line-per-function, @coze-arch/max-line-per-function
export const ContentBox: FC<IContentBoxProps> = props => {
  const {
    message,
    contentConfigs,
    readonly,
    getBotInfo,
    layout,
    showBackground,
    enableAutoSizeImage,
    isCardDisabled,
    isContentLoading,
    enhancedContentConfigList,
  } = props;
  /**
   * Content Enable Configuration Start
   */
  const isTextEnable = defaultEnable(
    contentConfigs?.[ContentBoxType.TEXT]?.enable,
  );
  const isImageEnable = defaultEnable(
    contentConfigs?.[ContentBoxType.IMAGE]?.enable,
  );
  const isFileEnable = contentConfigs?.[ContentBoxType.FILE]?.enable;

  const isSimpleFunctionEnable =
    contentConfigs?.[ContentBoxType.SIMPLE_FUNCTION]?.enable;
  /**
   * Content Enable Configuration End
   */

  const enhancedContentConfig = enhancedContentConfigList?.find(config =>
    config.rule({ contentType: message.content_type, contentConfigs, message }),
  );

  if (enhancedContentConfig) {
    return enhancedContentConfig.render({
      message,
      eventCallbacks: props.eventCallbacks,
      contentConfigs,
      options: { isCardDisabled, isContentLoading, showBackground, readonly },
    });
  }
  /**
   * Handling of text types
   * There are currently two cases here, the first is message.type = 'follow_up' means suggestion, the second is plain text message
   */
  if (message.content_type === ContentType.Text) {
    const { eventCallbacks, mdBoxProps } = props;
    const { onImageClick, onLinkClick } = eventCallbacks ?? {};
    if (
      MESSAGE_TYPE_VALID_IN_TEXT_LIST.includes(message.type) &&
      isTextEnable
    ) {
      return message.role === 'user' ? (
        <PlainTextContent
          isContentLoading={isContentLoading}
          content={message.content}
          getBotInfo={getBotInfo}
          mentioned={message.mention_list.at(0)}
        />
      ) : (
        <TextContent
          message={message}
          readonly={readonly}
          onImageClick={onImageClick}
          onLinkClick={onLinkClick}
          enableAutoSizeImage={enableAutoSizeImage}
          mdBoxProps={mdBoxProps}
        />
      );
    }
  }

  /**
   * FIle type content
   */
  if (message.content_type === ContentType.File && isFileEnable) {
    const { copywriting, fileAttributeKeys } =
      contentConfigs[ContentBoxType.FILE] ?? {};
    const { eventCallbacks } = props;
    const { onCancelUpload, onCopyUpload, onRetryUpload } =
      eventCallbacks ?? {};
    return (
      <FileContent
        message={message}
        copywriting={copywriting}
        fileAttributeKeys={fileAttributeKeys}
        readonly={readonly}
        onCancel={onCancelUpload}
        onCopy={onCopyUpload}
        onRetry={onRetryUpload}
        layout={layout}
        showBackground={showBackground}
      />
    );
  }

  /**
   * Image type content
   */
  if (message.content_type === ContentType.Image && isImageEnable) {
    const { eventCallbacks } = props;
    const { onImageClick } = eventCallbacks ?? {};

    if (!isImage(message.content_obj)) {
      return null;
    }

    const UsedSingleImageContent = enableAutoSizeImage
      ? SingleImageContentWithAutoSize
      : SingleImageContent;

    const isMultipleImage = message.content_obj.image_list.length > 1;

    if (isMultipleImage) {
      return <ImageContent message={message} onImageClick={onImageClick} />;
    }

    return (
      <UsedSingleImageContent message={message} onImageClick={onImageClick} />
    );
  }

  /**
   * Function type
   */
  if (message.type === 'function_call' && isSimpleFunctionEnable) {
    const { copywriting } =
      contentConfigs[ContentBoxType.SIMPLE_FUNCTION] ?? {};

    return (
      <SimpleFunctionContent message={message} copywriting={copywriting} />
    );
  }

  /**
   * Multimodal messages with simultaneous text transmission
   */
  if (
    message.content_type === ContentType.Mix &&
    isFileEnable &&
    isImageEnable &&
    isTextEnable
  ) {
    const { copywriting, fileAttributeKeys } =
      contentConfigs[ContentBoxType.FILE] ?? {};
    const { eventCallbacks } = props;
    const { onCancelUpload, onCopyUpload, onRetryUpload, onImageClick } =
      eventCallbacks ?? {};
    return (
      <MultimodalContent
        isContentLoading={isContentLoading}
        renderTextContentAddonTop={props.multimodalTextContentAddonTop}
        message={message}
        getBotInfo={getBotInfo}
        fileAttributeKeys={fileAttributeKeys}
        copywriting={copywriting}
        readonly={readonly}
        onCancel={onCancelUpload}
        onCopy={onCopyUpload}
        onRetry={onRetryUpload}
        onImageClick={onImageClick}
        layout={layout}
        showBackground={showBackground}
      />
    );
  }

  return <span>Not Support {message.content_type} Content</span>;
};

ContentBox.displayName = 'UIKitContentBox';

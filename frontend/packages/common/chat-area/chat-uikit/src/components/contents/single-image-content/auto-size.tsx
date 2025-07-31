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

import { useEffect, useState, type FC } from 'react';

import { isEmpty } from 'lodash-es';
import classNames from 'classnames';
import { type ContentType, type Message } from '@coze-common/chat-core';
import {
  safeAsyncThrow,
  typeSafeJsonParseEnhanced,
} from '@coze-common/chat-area-utils';
import { Skeleton } from '@coze-arch/coze-design';
import { type IImageContent } from '@coze-common/chat-uikit-shared';

import { type IImageMessageContentProps } from '../image-content';
import { isImage } from '../../../utils/is-image';
import { getImageDisplayAttribute } from '../../../utils/image/get-image-display-attribute';
import { useUiKitMessageBoxContext } from '../../../context/message-box';
import DefaultImage from '../../../assets/image-default.png';

import './index.less';

interface ImageInfo {
  url: string;
  displayWidth: number;
  displayHeight: number;
}
type IBlobImageMap = Record<string, ImageInfo>;

interface SingleImageContentWithAutoSizeProps
  extends IImageMessageContentProps {
  content_obj: IImageContent;
}

export const SingleImageContentWithAutoSize: FC<
  IImageMessageContentProps
> = props => {
  const { message } = props;

  const {
    content_obj = typeSafeJsonParseEnhanced<Message<ContentType.Image>>({
      str: message.content,
      onParseError: e => {
        safeAsyncThrow(e.message);
      },
      onVerifyError: e => {
        safeAsyncThrow(e.message);
      },
      verifyStruct: (sth: unknown): sth is Message<ContentType.Image> =>
        Boolean(sth && 'image_list' in { ...sth }),
    }),
  } = message;
  // Type guards generally do not affect the order of hooks
  if (!isImage(content_obj)) {
    return null;
  }
  return (
    <SingleImageContentWithAutoSizeImpl content_obj={content_obj} {...props} />
  );
};

/**
 * There's a reason for this.
 * The front-end compute groupId is grouped by replyId (localMessageId before server level is not ack)
 * Therefore, after the server level ack, the key of the loop will change, causing the component to unmount - > mount (destroy and rebuild).
 * Therefore, it is necessary to use a more trick way to achieve the problem of picture display optimization
 */
const blobImageMap: IBlobImageMap = {};
const isBlob = (url: string) => url?.startsWith('blob:');

const SingleImageContentWithAutoSizeImpl: FC<
  SingleImageContentWithAutoSizeProps
> = props => {
  const { message, onImageClick, className, content_obj } = props;
  const { imageAutoSizeContainerWidth = 0 } = useUiKitMessageBoxContext();
  const localMessageId = message.extra_info.local_message_id;

  // The picture sent by the current server level ori = thumb, so just use one for now.
  const currentImageUrl = content_obj?.image_list?.at(0)?.image_ori?.url ?? '';

  const { displayHeight, displayWidth, isCover } = getImageDisplayAttribute(
    content_obj.image_list.at(0)?.image_ori.width ?? 0,
    content_obj.image_list.at(0)?.image_ori.height ?? 0,
    imageAutoSizeContainerWidth,
  );

  if (isBlob(currentImageUrl) && imageAutoSizeContainerWidth > 0) {
    blobImageMap[localMessageId] = {
      url: currentImageUrl,
      displayHeight,
      displayWidth,
    };
  }

  const [imageInfo, setImageInfo] = useState<ImageInfo>(
    blobImageMap[localMessageId] ?? {
      url: currentImageUrl,
      displayWidth,
      displayHeight,
    },
  );

  useEffect(() => {
    const preloadImage = new Image();

    if (currentImageUrl.startsWith('http')) {
      preloadImage.src = currentImageUrl;
      preloadImage.onload = () => {
        setImageInfo({
          url: currentImageUrl,
          displayHeight,
          displayWidth,
        });
      };
    }

    return () => {
      preloadImage.onload = null;
    };
  }, [currentImageUrl, imageAutoSizeContainerWidth]);

  return (
    <Skeleton
      loading={isEmpty(imageInfo?.url)}
      style={{
        width: imageInfo?.displayWidth,
        height: imageInfo?.displayHeight,
      }}
    >
      <img
        src={imageInfo?.url ?? DefaultImage}
        style={{
          width: imageInfo?.displayWidth,
          height: imageInfo?.displayHeight,
          maxWidth: '100%',
          objectFit: isCover ? 'cover' : undefined,
          objectPosition: 'left top',
        }}
        onClick={e =>
          onImageClick?.({
            message,
            extra: {
              url: imageInfo?.url,
            },
          })
        }
        className={classNames('block', className, {
          'cursor-zoom-in': Boolean(onImageClick),
        })}
      />
    </Skeleton>
  );
};

SingleImageContentWithAutoSize.displayName = 'SingleImageContentWithAutoSize';

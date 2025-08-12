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

import { type FC } from 'react';

import { type ImageMixItem } from '@coze-common/chat-core';
import {
  type IOnImageClickParams,
  type IMessage,
} from '@coze-common/chat-uikit-shared';

import { SingleImageContentWithAutoSize } from '../single-image-content/auto-size';
import { ImageBox } from '../image-content/image-box';
import { typeSafeMessageBoxInnerVariants } from '../../../variants/message-box-inner-variants';
import { makeFakeImageMessage } from '../../../utils/make-fake-image-message';

interface ImageItemListProps {
  imageItemList: ImageMixItem[];
  message: IMessage;
  onImageClick?: (params: IOnImageClickParams) => void;
}

export const ImageItemList: FC<ImageItemListProps> = ({
  imageItemList,
  message,
  onImageClick,
}) => {
  const handleImageClick = (originUrl: string) => {
    onImageClick?.({ message, extra: { url: originUrl } });
  };

  return (
    <>
      {Boolean(imageItemList.length) &&
        (imageItemList.length === 1 ? (
          <SingleImageContentWithAutoSize
            key={imageItemList[0].image.image_thumb.url}
            message={makeFakeImageMessage({
              originMessage: message,
              url: imageItemList[0].image.image_ori.url,
              key: imageItemList[0].image.image_ori.url,
              width: imageItemList[0].image.image_ori.width,
              height: imageItemList[0].image.image_ori.height,
            })}
            onImageClick={onImageClick}
            className="mb-[16px] rounded-[16px] overflow-hidden"
          />
        ) : (
          <div
            // Here we borrow the style of messageBoxInner
            className={typeSafeMessageBoxInnerVariants({
              color: 'whiteness',
              border: null,
              tight: true,
              showBackground: false,
            })}
            style={{ width: '240px' }}
            key={imageItemList[0].image.image_thumb.url}
          >
            <ImageBox
              data={{ image_list: imageItemList.map(item => item.image) }}
              eventCallbacks={{
                onImageClick: (_, eventData) =>
                  handleImageClick(eventData.src ?? ''),
              }}
            />
          </div>
        ))}
    </>
  );
};

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
            // 这里借用了 messageBoxInner 的样式风格
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

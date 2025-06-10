import { useState, type FC, useEffect } from 'react';

import { type IImageMessageContentProps } from '../image-content';
import { safeJSONParse } from '../../../utils/safe-json-parse';
import { isImage } from '../../../utils/is-image';
import { SingleImageContentUI } from './single-image-content-ui';

import './index.less';

type IBlobImageMap = Record<string, string>;

/**
 * 这里这么做是有原因的
 * 前端计算groupId是通过replyId分组（服务端未ack前是localMessageId）
 * 因此服务端ack后会导致循环的key发生变化，导致组件unmount -> mount（销毁重建）
 * 因此需要用比较trick的方式来实现图片展示优化的问题
 */
const blobImageMap: IBlobImageMap = {};
const isBlob = (url: string) => url?.startsWith('blob:');

/**
 * @deprecated 废弃不再维护，请尽快迁移至 SingleImageContentWithAutoSize 组件
 */
export const SingleImageContent: FC<IImageMessageContentProps> = props => {
  const { message, onImageClick } = props;

  // @liushuoyan 这里类型大溃败，引入了 any
  const { content_obj = safeJSONParse(message.content) } = message;

  const localMessageId = message.extra_info.local_message_id;

  // 目前服务端下发的图片 ori = thumb 因此目前用一个就行
  const currentImageUrl = content_obj?.image_list?.at(0)?.image_ori?.url ?? '';

  if (isBlob(currentImageUrl)) {
    blobImageMap[localMessageId] = currentImageUrl;
  }

  const [imageUrl, setImageUrl] = useState<string>(
    isBlob(currentImageUrl) ? currentImageUrl : blobImageMap[localMessageId],
  );

  useEffect(() => {
    const preloadImage = new Image();
    if (currentImageUrl.startsWith('http')) {
      preloadImage.src = currentImageUrl;
      preloadImage.onload = () => {
        setImageUrl(currentImageUrl);
      };
    }

    return () => {
      preloadImage.onload = null;
    };
  }, [currentImageUrl]);

  if (!isImage(content_obj)) {
    return null;
  }

  return (
    <SingleImageContentUI
      onClick={originUrl => {
        onImageClick?.({
          message,
          extra: { url: originUrl },
        });
      }}
      thumbUrl={imageUrl}
      originalUrl={imageUrl}
    />
  );
};

SingleImageContent.displayName = 'SingleImageContent';

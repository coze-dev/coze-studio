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

import { useState, type FC, useEffect } from 'react';

import { type IImageMessageContentProps } from '../image-content';
import { safeJSONParse } from '../../../utils/safe-json-parse';
import { isImage } from '../../../utils/is-image';
import { SingleImageContentUI } from './single-image-content-ui';

import './index.less';

type IBlobImageMap = Record<string, string>;

/**
 * There's a reason for this.
 * The front-end compute groupId is grouped by replyId (localMessageId before server level is not ack)
 * Therefore, after the server level ack, the key of the loop will change, causing the component to unmount - > mount (destroy and rebuild).
 * Therefore, it is necessary to use a more trick way to achieve the problem of picture display optimization
 */
const blobImageMap: IBlobImageMap = {};
const isBlob = (url: string) => url?.startsWith('blob:');

/**
 * @Deprecated is no longer maintained, please migrate to SingleImageContentWithAutoSize component as soon as possible
 */
export const SingleImageContent: FC<IImageMessageContentProps> = props => {
  const { message, onImageClick } = props;

  // @Liushuoyan here type rout, introduced any
  const { content_obj = safeJSONParse(message.content) } = message;

  const localMessageId = message.extra_info.local_message_id;

  // The picture sent by the current server level ori = thumb, so just use one for now.
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

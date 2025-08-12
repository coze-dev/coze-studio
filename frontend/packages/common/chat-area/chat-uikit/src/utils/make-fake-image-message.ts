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

import { ContentType, type Message } from '@coze-common/chat-core';

export const makeFakeImageMessage = ({
  originMessage,
  key,
  url,
  width,
  height,
}: {
  originMessage: Message<ContentType>;
  key: string;
  url: string;
  width: number;
  height: number;
}) => {
  const contentObj = {
    image_list: [
      {
        key,
        image_ori: {
          url,
          width,
          height,
        },
        image_thumb: {
          url,
          width,
          height,
        },
      },
    ],
  };
  const imageMessage: Message<ContentType.Image> = {
    ...originMessage,
    content_obj: contentObj,
    content: JSON.stringify(contentObj),
    content_type: ContentType.Image,
  };

  return imageMessage;
};

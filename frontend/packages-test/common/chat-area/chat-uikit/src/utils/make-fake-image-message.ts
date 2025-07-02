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

import { ContentType, type Message } from '@coze-common/chat-area';

export const getReferFromMessage = (message: Message<ContentType>) => {
  if (message.content_type === ContentType.Mix) {
    const { refer_items } = JSON.parse(message.content) ?? {};

    if (refer_items) {
      const firstItem = refer_items?.[0];

      if (firstItem?.type === 'text') {
        return {
          type: ContentType.Text,
          text: firstItem?.text,
        };
      } else if (firstItem?.type === 'image') {
        return {
          type: ContentType.Image,
          uri: firstItem?.image?.key,
          url: firstItem?.image?.image_thumb?.url,
        };
      }
    }
  }
  return undefined;
};

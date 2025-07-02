import { type IImageContent } from '@coze-common/chat-uikit-shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isImage = (value: any): value is IImageContent =>
  value && 'image_list' in value;

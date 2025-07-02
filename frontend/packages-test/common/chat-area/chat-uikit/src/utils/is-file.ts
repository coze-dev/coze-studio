import { type IFileContent } from '@coze-common/chat-uikit-shared';

export const isFile = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is IFileContent => value && 'file_list' in value;

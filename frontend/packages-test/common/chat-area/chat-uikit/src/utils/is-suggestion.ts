import { type ISuggestionContent } from '@coze-common/chat-uikit-shared';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSuggestion = (value: any): value is ISuggestionContent =>
  value && Array.isArray(value);

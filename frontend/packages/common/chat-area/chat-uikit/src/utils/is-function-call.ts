import {
  type IFunctionCallContent,
  type IMessage,
} from '@coze-common/chat-uikit-shared';

export const isFunctionCall = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  message: IMessage,
): value is IFunctionCallContent => value && message.type === 'function_call';

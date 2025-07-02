import { forwardRef, type PropsWithChildren } from 'react';

import {
  type ChatAreaProviderMethod,
  type ChatAreaProviderProps,
} from './type';
/**
 * 代码 1 周后删除，暂时保留以防万一
 */
import { ChatAreaProviderNew } from './provider-new';

export const ChatAreaProvider = forwardRef<
  ChatAreaProviderMethod,
  PropsWithChildren<ChatAreaProviderProps>
>((props, ref) => <ChatAreaProviderNew {...props} ref={ref} />);

ChatAreaProvider.displayName = 'ChatAreaProvider';

import { type PropsWithChildren } from 'react';

import { type ChatInputProps, ChatInputPropsContext } from './context';

export const ChatInputPropsProvider: React.FC<
  PropsWithChildren<ChatInputProps>
> = ({ children, ...props }) => (
  <ChatInputPropsContext.Provider value={props}>
    {children}
  </ChatInputPropsContext.Provider>
);

ChatInputPropsProvider.displayName = 'ChatAreaChatInputPropsProvider';

import { type PropsWithChildren } from 'react';

import { ChatInputLayoutContext, type ChatInputLayoutProps } from './context';

export const ChatInputLayoutProvider: React.FC<
  PropsWithChildren<ChatInputLayoutProps>
> = ({ children, ...props }) => (
  <ChatInputLayoutContext.Provider value={props}>
    {children}
  </ChatInputLayoutContext.Provider>
);

ChatInputLayoutProvider.displayName = 'ChatInputLayoutProvider';

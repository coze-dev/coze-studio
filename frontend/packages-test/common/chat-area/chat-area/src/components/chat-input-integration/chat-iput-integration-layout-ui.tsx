import React, { useRef, type FC, type PropsWithChildren } from 'react';

import cls from 'classnames';

import { ChatInputLayoutProvider } from '../../context/chat-input-layout/provider';

import style from './index.module.less';

export type ChatInputIntegrationLayoutUISlots = PropsWithChildren<{
  chatInputSlot?: React.ReactNode;
  inputTopSlot?: React.ReactNode;
  absoluteTopSlot?: React.ReactNode;
  className?: string;
}>;
export const ChatInputIntegrationLayoutUI: FC<
  ChatInputIntegrationLayoutUISlots
> = ({ children, absoluteTopSlot, chatInputSlot, inputTopSlot, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <ChatInputLayoutProvider layoutContainerRef={ref}>
      <div
        ref={ref}
        className={cls(style['chat-input-integration-layout'], className)}
      >
        {absoluteTopSlot}
        {inputTopSlot}
        {chatInputSlot}
        {children}
      </div>
    </ChatInputLayoutProvider>
  );
};

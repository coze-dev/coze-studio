import { createContext, type MutableRefObject } from 'react';

export interface ChatInputLayoutProps {
  layoutContainerRef?: MutableRefObject<HTMLDivElement | null>;
}

export const ChatInputLayoutContext = createContext<ChatInputLayoutProps>({});

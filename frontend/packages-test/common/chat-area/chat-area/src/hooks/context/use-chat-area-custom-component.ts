import { useContext } from 'react';

import { ChatAreaCustomComponentContext } from '../../context/chat-area-custom-component-context';

export const useChatAreaCustomComponent = () => {
  const context = useContext(ChatAreaCustomComponentContext);
  return context.componentTypes ?? {};
};

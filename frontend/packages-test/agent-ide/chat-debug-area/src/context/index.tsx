import { createContext, useContext } from 'react';

import { type ComponentTypesMap } from '@coze-common/chat-area';

export const BotDebugChatAreaComponentContext = createContext<
  Partial<ComponentTypesMap>
>({});

export const useBotDebugChatAreaComponent = () =>
  useContext(BotDebugChatAreaComponentContext);

export const BotDebugChatAreaComponentProvider =
  BotDebugChatAreaComponentContext.Provider;

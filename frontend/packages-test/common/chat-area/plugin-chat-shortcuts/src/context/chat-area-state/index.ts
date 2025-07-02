import { useContext } from 'react';

import { ChatAreaStateContext } from './context';

export const useChatAreaState = () => useContext(ChatAreaStateContext);

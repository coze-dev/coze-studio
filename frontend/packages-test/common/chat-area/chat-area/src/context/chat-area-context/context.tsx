import { createContext } from 'react';

import { type NullableType } from '../../typing/util-types';
import { type ChatAreaContext } from './type';

type NullableChatAreaContext = NullableType<ChatAreaContext>;

export const NullableChatAreaContext = createContext<NullableChatAreaContext>({
  refreshMessageList: null,
  reporter: null,
  botId: null,
  scene: null,
  manualInit: null,
  lifeCycleService: null,
  configs: null,
  eventCenter: null,
});

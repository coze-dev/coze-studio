import { createContext } from 'react';

import { type ComponentTypesMap } from '../components/types';

export interface ChatAreaCustomComponents {
  /**
   * @deprecated 废弃，请使用插件化方案
   */
  componentTypes?: Partial<ComponentTypesMap>;
}

export const ChatAreaCustomComponentContext =
  createContext<ChatAreaCustomComponents>({});

export const ChatAreaCustomComponentProvider =
  ChatAreaCustomComponentContext.Provider;

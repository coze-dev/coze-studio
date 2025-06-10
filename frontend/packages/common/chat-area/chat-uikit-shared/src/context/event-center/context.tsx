import { type PropsWithChildren, createContext } from 'react';

import mitt from 'mitt';
import { useCreation } from 'ahooks';

import {
  type UIKitEventMap,
  type UIKitEventCenter,
  type UIKitEventProviderProps,
} from './type';
import { useObserveChatContainer } from './hooks';

export const UIKitEventContext = createContext<UIKitEventCenter | null>(null);

export const UIKitEventProvider: React.FC<
  PropsWithChildren<UIKitEventProviderProps>
> = ({ chatContainerRef, children }) => {
  const eventCenter = useCreation(() => mitt<UIKitEventMap>(), []);

  useObserveChatContainer({ eventCenter, chatContainerRef });

  return (
    <UIKitEventContext.Provider value={eventCenter}>
      {children}
    </UIKitEventContext.Provider>
  );
};

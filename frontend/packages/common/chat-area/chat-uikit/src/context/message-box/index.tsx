import { createContext, useContext } from 'react';

import {
  type Layout,
  type IEventCallbacks,
} from '@coze-common/chat-uikit-shared';

export interface UIKitMessageBoxContextProps {
  imageAutoSizeContainerWidth?: number;
  layout?: Layout;
  enableImageAutoSize?: boolean;
  eventCallbacks?: IEventCallbacks;
  onError?: (error: unknown) => void;
}

export const UIKitMessageBoxContext =
  createContext<UIKitMessageBoxContextProps>({});

export const UIKitMessageBoxProvider = UIKitMessageBoxContext.Provider;

export const useUiKitMessageBoxContext = () =>
  useContext(UIKitMessageBoxContext);

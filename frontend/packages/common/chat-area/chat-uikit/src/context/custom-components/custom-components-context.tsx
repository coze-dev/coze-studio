import { createContext, type ComponentType, type ReactNode } from 'react';

import { type SendButtonProps } from '@coze-common/chat-uikit-shared';

/* eslint-disable @typescript-eslint/naming-convention */
export interface UIKitCustomComponentsMap {
  MentionOperateTool: ComponentType<{
    senderId: string;
  }>;
  SendButton: ComponentType<SendButtonProps>;
  AvatarWrap: ComponentType<{
    children: ReactNode;
  }>;
}
/* eslint-enable @typescript-eslint/naming-convention */

export interface UIKitCustomComponents {
  uiKitCustomComponents?: Partial<UIKitCustomComponentsMap>;
}

export const UIKitCustomComponentsContext =
  createContext<UIKitCustomComponents>({});

export const UIKitCustomComponentsProvider =
  UIKitCustomComponentsContext.Provider;

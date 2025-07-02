import { type RefObject } from 'react';

import { type Emitter } from 'mitt';

export enum UIKitEvents {
  WINDOW_RESIZE,
  AFTER_CARD_RENDER,
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt 的类型不认 interface
export type UIKitEventMap = {
  [UIKitEvents.WINDOW_RESIZE]: undefined;
  [UIKitEvents.AFTER_CARD_RENDER]: { messageId: string };
};

export type UIKitEventCenter = Emitter<UIKitEventMap>;

export interface UIKitEventProviderProps {
  chatContainerRef: RefObject<HTMLDivElement>;
}

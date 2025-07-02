import { useEffect, type RefObject } from 'react';

import { type Emitter } from 'mitt';

import { UIKitEvents, type UIKitEventMap } from './type';

export const useObserveChatContainer = ({
  eventCenter,
  chatContainerRef,
}: {
  eventCenter: Emitter<UIKitEventMap>;
  chatContainerRef: RefObject<HTMLDivElement>;
}) => {
  useEffect(() => {
    if (!chatContainerRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      eventCenter.emit(UIKitEvents.WINDOW_RESIZE);
    });

    resizeObserver.observe(chatContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
};

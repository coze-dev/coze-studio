import { useEffect, type RefObject } from 'react';

import { useDebounceFn } from 'ahooks';
import {
  UIKitEvents,
  useUiKitEventCenter,
} from '@coze-common/chat-uikit-shared';

export const useObserveCardContainer = ({
  messageId,
  cardContainerRef,
  onResize,
}: {
  messageId: string | null;
  cardContainerRef: RefObject<HTMLDivElement>;
  onResize: () => void;
}) => {
  const eventCenter = useUiKitEventCenter();

  /** 30s 内没变化则自动清除 observer */
  const debouncedDisconnect = useDebounceFn(
    (getResizeObserver: () => ResizeObserver | null) => {
      const resizeObserver = getResizeObserver();
      resizeObserver?.disconnect();
    },
    {
      wait: 30000,
    },
  );

  useEffect(() => {
    if (!eventCenter) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const onAfterCardRender = ({
      messageId: renderCardMessageId,
    }: {
      messageId: string;
    }) => {
      if (!cardContainerRef.current) {
        return;
      }

      if (renderCardMessageId !== messageId) {
        return;
      }

      resizeObserver = new ResizeObserver(() => {
        debouncedDisconnect.run(() => resizeObserver);
        onResize();
      });

      resizeObserver.observe(cardContainerRef.current);
    };

    eventCenter.on(UIKitEvents.AFTER_CARD_RENDER, onAfterCardRender);

    return () => {
      eventCenter.off(UIKitEvents.AFTER_CARD_RENDER, onAfterCardRender);
      resizeObserver?.disconnect();
    };
  }, []);
};

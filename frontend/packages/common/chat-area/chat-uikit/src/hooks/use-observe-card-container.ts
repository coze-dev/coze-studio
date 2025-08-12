/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  /** If there is no change within 30s, the observer will be automatically cleared. */
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

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

import { type RefObject, useEffect, useRef } from 'react';

import { useLatest, useKeyPress } from 'ahooks';
import {
  type AudioRecordEvents,
  type AudioRecordOptions,
} from '@coze-common/chat-uikit-shared';
import { useEventCallback } from '@coze-common/chat-hooks';

type EventType = MouseEvent | TouchEvent | KeyboardEvent;

export interface UseAudioRecordInteractionProps {
  target: RefObject<HTMLElement>;
  events: AudioRecordEvents;
  options?: AudioRecordOptions;
}

const touchSupported: boolean = 'ontouchstart' in window;

const isTouchEvent = (eventType: unknown): eventType is TouchEvent =>
  'TouchEvent' in window && eventType instanceof TouchEvent;

const getClientPosition = (event: TouchEvent | MouseEvent) => {
  if (isTouchEvent(event)) {
    return {
      clientX: event.touches[0]?.clientX ?? 0,
      clientY: event.touches[0]?.clientY ?? 0,
    };
  }
  return event;
};

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function
export const useAudioRecordInteraction = ({
  target,
  events,
  options = {},
}: UseAudioRecordInteractionProps) => {
  const { onStart, onEnd, onMoveEnter, onMoveLeave } = events;
  const {
    shortcutKey = () => false,
    getIsShortcutKeyDisabled,
    enabled = true,
    getActiveZoneTarget,
  } = options;
  const onStartRef = useLatest(onStart);
  const onEndRef = useLatest(onEnd);
  const onMoveEnterRef = useLatest(onMoveEnter);
  const onMoveLeaveRef = useLatest(onMoveLeave);
  const isKeydown = useRef(false);
  const isMouseOrTouchDown = useRef(false);
  const isMoveLeave = useRef(false);

  const onKeyDown = (eventType: KeyboardEvent) => {
    if (!enabled) {
      return;
    }
    if (getIsShortcutKeyDisabled?.()) {
      return onKeyUp(eventType);
    }
    if (isKeydown.current) {
      return;
    }
    isKeydown.current = true;
    onStartRef.current?.(eventType);
  };

  const onKeyUp = (eventType: KeyboardEvent | undefined) => {
    if (!enabled) {
      return;
    }
    if (!isKeydown.current) {
      return;
    }
    isKeydown.current = false;
    onEndRef.current?.(eventType);
  };

  const onPointerMove = useEventCallback(
    (eventType: TouchEvent | MouseEvent) => {
      eventType.preventDefault();
      const activeZoneElement = getActiveZoneTarget?.() || target.current;

      if (!isMouseOrTouchDown.current || !activeZoneElement) {
        return;
      }
      const { clientX, clientY } = getClientPosition(eventType);
      // Get the boundary information of the element
      const rect = activeZoneElement.getBoundingClientRect();
      const isOutRect =
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom;

      // Determine whether the touch point is within the scope of the element
      if (isOutRect && !isMoveLeave.current) {
        isMoveLeave.current = true;
        onMoveLeaveRef.current?.();
      }

      if (!isOutRect && isMoveLeave.current) {
        isMoveLeave.current = false;
        onMoveEnterRef.current?.();
      }
    },
  );

  const onClickOrTouchStart = useEventCallback((eventType: EventType) => {
    isMoveLeave.current = false;

    if (isMouseOrTouchDown.current) {
      return;
    }
    isMouseOrTouchDown.current = true;

    if (isTouchEvent(eventType)) {
      eventType.preventDefault();
      document.addEventListener('touchmove', onPointerMove);
    } else {
      document.addEventListener('mousemove', onPointerMove);
    }

    onStartRef.current?.(eventType);
  });

  const onClickOrTouchEnd = useEventCallback((eventType: EventType) => {
    if (!isMouseOrTouchDown.current) {
      return;
    }

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('touchmove', onPointerMove);

    isMouseOrTouchDown.current = false;
    onEndRef.current?.(eventType);
  });

  useKeyPress(shortcutKey, onKeyDown, {
    exactMatch: true,
    events: ['keydown'],
  });

  useKeyPress(shortcutKey, onKeyUp, {
    exactMatch: false,
    events: ['keyup'],
  });

  useEffect(() => {
    const onWindowBlur = () => {
      onKeyUp(undefined);
    };
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('blur', onWindowBlur);
    };
  }, []);

  useEffect(() => {
    const element = target.current;

    if (!element || !enabled) {
      return;
    }

    if (!touchSupported) {
      element.addEventListener('mousedown', onClickOrTouchStart);
      // ! caution document
      document.addEventListener('mouseup', onClickOrTouchEnd);
    } else {
      element.addEventListener('touchstart', onClickOrTouchStart);
      element.addEventListener('touchend', onClickOrTouchEnd);
    }

    return () => {
      if (!touchSupported) {
        element.removeEventListener('mousedown', onClickOrTouchStart);
        // ! caution document
        document.removeEventListener('mouseup', onClickOrTouchEnd);
      } else {
        element.removeEventListener('touchstart', onClickOrTouchStart);
        element.removeEventListener('touchend', onClickOrTouchEnd);
      }
    };
  });
  useEffect(
    () => () => {
      // Avoid events that cannot be uninstalled under abnormal circumstances
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('touchmove', onPointerMove);
    },
    [],
  );
};

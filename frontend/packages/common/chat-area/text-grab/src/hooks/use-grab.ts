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

import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import { defer } from 'lodash-es';
import { useEventCallback } from '@coze-common/chat-hooks';

import { isTouchDevice } from '../utils/is-touch-device';
import { getSelectionData } from '../utils/get-selection-data';
import { getRectData } from '../utils/get-rect-data';
import {
  Direction,
  type GrabPosition,
  type SelectionData,
} from '../types/selection';

const MAX_WIDTH = 40;
const TIMEOUT = 100;

interface GrabParams {
  /**
   * Select the Ref of the target container
   */
  contentRef: MutableRefObject<HTMLDivElement | null>;
  /**
   * Floating Menu Ref
   */
  floatMenuRef: MutableRefObject<HTMLDivElement | null> | undefined;
  /**
   * Select the callback for the event
   */
  onSelectChange: (selectionData: SelectionData | null) => void;
  /**
   * Callback of location information
   */
  onPositionChange: (position: GrabPosition | null) => void;
  /**
   * Resize/Scroll/Wheel is the time of throttling
   */
  resizeThrottleTime?: number;
}

// eslint-disable-next-line @coze-arch/max-line-per-function, max-lines-per-function
export const useGrab = ({
  contentRef,
  floatMenuRef,
  onSelectChange,
  onPositionChange,
}: GrabParams) => {
  const timeoutRef = useRef<number>();

  /**
   * Selection object storage (for internal flow state of hooks)
   */
  const selection = useRef<Selection | null>(null);

  /**
   * Data on the final calculation result of the constituency
   */
  const selectionData = useRef<SelectionData | null>(null);

  /**
   * In Scrolling
   */
  const [isScrolling, setIsScrolling] = useState(false);

  /**
   * Scrolling timer
   */
  const scrollingTimer = useRef<number | null>(null);

  /**
   * Is there SelectionData (for optimizing mount logic)
   */
  const hasSelectionData = useRef(false);

  /**
   * Clear internal data + trigger callback
   */
  const clearSelection = () => {
    onSelectChange(null);
    onPositionChange(null);
    selection.current?.removeAllRanges();
    selection.current = null;
    setIsScrolling(false);
    hasSelectionData.current = false;
    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }
  };

  /**
   * Handle screen changes Scroll + Resize + Wheel + SelectionChange (mobile device)
   */
  const handleScreenChange = () => {
    // Get Constituency
    const innerSelection = window.getSelection();

    const { direction = Direction.Unknown } = selectionData.current ?? {};

    // If the selection is empty, return
    if (!innerSelection) {
      onSelectChange(null);
      return;
    }

    const rectData = getRectData({ selection: innerSelection });

    if (!rectData) {
      onPositionChange(null);
      return;
    }

    // Default use to get the location information of the last line of the selection (both Forward cases)
    const rangeRect = Array.from(rectData.rangeRects).at(
      direction === Direction.Backward ? 0 : -1,
    );

    // Returns if the last line of selection information is incorrect
    if (!rangeRect) {
      onPositionChange(null);
      return;
    }

    let [x, y] = [0, 0];
    // If the selection is selected from front to back, it is displayed at the end of the last line, otherwise it is displayed at the beginning
    if (direction === Direction.Backward) {
      x = rangeRect.left;
      y = rangeRect.top + rangeRect.height;
    } else {
      x = rangeRect.x + rangeRect.width;
      y = rangeRect.y + rangeRect.height;
    }

    /**
     * Added a logic to avoid the screen
     */
    const position = {
      x: x > screen.width - MAX_WIDTH ? x - MAX_WIDTH : x,
      y:
        y > screen.height - MAX_WIDTH
          ? y - MAX_WIDTH
          : rangeRect.y + rangeRect.height,
    };

    onPositionChange(position);
  };

  /**
   * Smart processing screen changes, there is a timer + scroll notification logic
   */
  const handleSmartScreenChange = useEventCallback(() => {
    if (scrollingTimer.current) {
      clearTimeout(scrollingTimer.current);
    }

    setIsScrolling(true);
    scrollingTimer.current = setTimeout(() => {
      handleScreenChange();
      setIsScrolling(false);
    }, TIMEOUT);
  });

  /**
   * Handling the logic of getting the selection
   */
  const handleGetSelection = () => {
    if (!contentRef.current) {
      onSelectChange(null);
      return;
    }

    // Get Constituency
    // eslint-disable-next-line @typescript-eslint/naming-convention -- internal variable
    const _selection = window.getSelection();

    // If the selection is empty, return
    if (!_selection) {
      onSelectChange(null);
      return;
    }

    selection.current = _selection;

    // Get constituency data
    // eslint-disable-next-line @typescript-eslint/naming-convention -- internal variable
    const _selectionData = getSelectionData({
      selection: _selection,
    });

    // Hide Floating Button if selection is empty
    if (!_selectionData || !_selectionData.nodesAncestorIsMessageBox) {
      onSelectChange(null);
      return;
    }

    // Set display and location information
    selectionData.current = _selectionData;
    hasSelectionData.current = Boolean(_selectionData);

    handleScreenChange();
    onSelectChange(_selectionData);
  };

  /**
   * The action of raising the mouse
   */
  const handleMouseUp = useEventCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = defer(handleGetSelection);
  });

  /**
   * The action of keyboard pressing
   */
  const handleKeyDown = useEventCallback((e: KeyboardEvent) => {
    const forbiddenKeyboardSelect = () => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        onSelectChange(null);
      }
    };

    if (selectionData.current) {
      forbiddenKeyboardSelect();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        handleGetSelection();
      }
    }
  });

  /**
   * Mouse press.
   */
  const handleMouseDown = useEventCallback((e: MouseEvent) => {
    // Check if there is a constituency, and the target of the click event is not in the constituency

    if (!contentRef.current || !floatMenuRef || !floatMenuRef?.current) {
      return;
    }

    const { clientX, clientY } = e;

    const floatMenuRect = floatMenuRef.current.getBoundingClientRect();

    const isInFloatMenu =
      clientY >= floatMenuRect.top &&
      clientY <= floatMenuRect.bottom &&
      clientX >= floatMenuRect.left &&
      clientX <= floatMenuRect.right;

    if (isInFloatMenu) {
      return;
    }

    clearSelection();
  });

  useEffect(() => {
    if (!hasSelectionData.current) {
      return;
    }

    // Listen for mouse down events
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [hasSelectionData.current]);

  // When visible, mount the listening event to optimize listening
  useEffect(() => {
    if (!hasSelectionData.current) {
      return;
    }

    window.addEventListener('resize', handleSmartScreenChange);
    window.addEventListener('wheel', handleSmartScreenChange);
    window.addEventListener('scroll', handleSmartScreenChange);
    window.addEventListener('keydown', handleKeyDown);

    if (isTouchDevice()) {
      window.addEventListener('selectionchange', handleSmartScreenChange);
    }

    return () => {
      window.removeEventListener('resize', handleSmartScreenChange);
      window.removeEventListener('wheel', handleSmartScreenChange);
      window.removeEventListener('scroll', handleSmartScreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('selectionchange', handleSmartScreenChange);
    };
  }, [hasSelectionData.current]);

  // mount monitor on target
  useEffect(() => {
    const target = contentRef.current;

    if (!target) {
      return;
    }

    // Monitor selection-related mouse lift events
    target.addEventListener('pointerup', handleMouseUp);

    if (isTouchDevice()) {
      target.addEventListener('selectionchange', handleMouseUp);
    }

    return () => {
      target.removeEventListener('pointerup', handleMouseUp);
      target.removeEventListener('selectionchange', handleMouseUp);
    };
  }, [contentRef.current]);

  return {
    /**
     * Clear built-in state and selection
     */
    clearSelection,
    /**
     * Is it scrolling?
     */
    isScrolling,
    /**
     * Recalculate the selection position
     */
    computePosition: handleSmartScreenChange,
  };
};

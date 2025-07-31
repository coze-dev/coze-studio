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

import { RefObject, useCallback, useRef, useState } from 'react';

const ANCHOR_UPDATE_BUFFER = 10;

const useShouldUpdateAnchor = () => {
  const prevStyleLeft = useRef<number | null>(null);
  const prevStyleTop = useRef<number | null>(null);
  const shouldUpdateGrabAnchor = useRef(false);

  const grabAnchorBuffer = useRef(0);

  const getShouldUpdateGrabAnchor = () => shouldUpdateGrabAnchor.current;

  const updateGrabAnchorBuffer = () => {
    grabAnchorBuffer.current += 1;
  };

  const getGrabAnchorBufferExceed = () =>
    grabAnchorBuffer.current > ANCHOR_UPDATE_BUFFER;

  const updateCheckState = ({
    currentLeft,
    currentTop,
  }: {
    currentTop: number;
    currentLeft: number;
  }) => {
    const isUnChanged =
      currentLeft === prevStyleLeft.current &&
      currentTop === prevStyleTop.current;

    shouldUpdateGrabAnchor.current = isUnChanged;
    prevStyleLeft.current = currentLeft;
    prevStyleTop.current = currentTop;
  };

  const refreshCheckState = () => {
    shouldUpdateGrabAnchor.current = false;
    grabAnchorBuffer.current = 0;
  };

  return {
    getGrabAnchorBufferExceed,
    updateCheckState,
    updateGrabAnchorBuffer,
    getShouldUpdateGrabAnchor,
    refreshCheckState,
  };
};

export interface GrabProps {
  /**
   * Drag anchor
   * @default grabTarget
   */
  grabAnchor?: RefObject<HTMLDivElement>;
  /** Dragged moving target */
  grabTarget: RefObject<HTMLDivElement>;
  /** Whether to directly modify the style to achieve the effect of moving */
  isModifyStyle: boolean;
  /** Callback when position changes */
  onPositionChange?: (param: { left: number; top: number }) => void;
}

// eslint-disable-next-line
export const useGrab = ({
  grabTarget,
  grabAnchor = grabTarget,
  isModifyStyle,
  onPositionChange,
}: GrabProps) => {
  const [grabbing, setGrabbing] = useState(false);
  const isGrabbingRef = useRef(false);
  const anchorOffsetX = useRef(0);
  const anchorOffsetY = useRef(0);
  const {
    getGrabAnchorBufferExceed,
    getShouldUpdateGrabAnchor,
    updateCheckState,
    updateGrabAnchorBuffer,
    refreshCheckState,
  } = useShouldUpdateAnchor();

  const setGrabStatus = (grab: boolean) => {
    setGrabbing(grab);
    isGrabbingRef.current = grab;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const docElement = document.documentElement;
    const target = grabTarget.current;

    if (!isGrabbingRef.current || !target) {
      return;
    }

    e.preventDefault();

    /**
     * Calculate the page width and target width, and compare with the drag position
     * Avoid dragging pop-ups off the page
     */
    const currentLeft = Math.min(
      Math.max(e.clientX - anchorOffsetX.current, 0),
      docElement.offsetWidth - target.offsetWidth,
    );

    const currentTop = Math.min(
      Math.max(e.clientY - anchorOffsetY.current, 0),
      docElement.offsetHeight - target.offsetHeight,
    );

    updateCheckState({ currentLeft, currentTop });
    onPositionChange?.({ top: currentTop, left: currentLeft });
    if (!isModifyStyle) {
      return;
    }
    target.style.left = `${currentLeft}px`;
    target.style.top = `${currentTop}px`;
  }, []);

  const handleMouseUp = useCallback(() => {
    setGrabStatus(false);
    unsubscribeDocumentMouseEvent();
    refreshCheckState();
  }, []);

  const unsubscribeDocumentMouseEvent = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const subscribeDocumentMouseEvent = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const updateGrabAnchor = (e: MouseEvent) => {
    const target = grabTarget.current;
    if (!target) {
      return;
    }
    /**
     * Calculate the relative position of the mouse in the drag target dom
     * Use for subsequent and global mouse position difference calculations to get the drag position
     */
    const left = target.offsetLeft;
    const top = target.offsetTop;
    anchorOffsetX.current = e.clientX - left;
    anchorOffsetY.current = e.clientY - top;
  };

  const subscribeGrab = () => {
    const anchor = grabAnchor.current;

    if (!anchor) {
      return;
    }

    const handleAnchorMouseDown = (e: MouseEvent) => {
      /**
       * https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/buttons
       * Only the main mouse button (left button) is recognized and pressed.
       */
      if (e.button !== 0) {
        return;
      }
      subscribeDocumentMouseEvent();
      setGrabStatus(true);
      e.stopPropagation();
      updateGrabAnchor(e);
    };

    /**
     * When the pop-up window reaches the boundary/after the pop-up window exceeds the boundary due to resize
     * The anchor position needs to be updated during the mouse movement, otherwise there will be a problem that the mouse moves but the pop-up window position is not updated.
     */
    const handleAnchorMouseMove = (e: MouseEvent) => {
      if (!isGrabbingRef.current) {
        return;
      }

      if (!getShouldUpdateGrabAnchor()) {
        return;
      }

      updateGrabAnchorBuffer();

      /**
       * Avoid changing anchor position and global mouse position simultaneously during normal dragging
       * The position is not updated after the difference is calculated
       */
      if (!getGrabAnchorBufferExceed()) {
        return;
      }

      updateGrabAnchor(e);
      refreshCheckState();
    };

    anchor.addEventListener('mousedown', handleAnchorMouseDown);
    anchor.addEventListener('mousemove', handleAnchorMouseMove);

    return () => {
      anchor.removeEventListener('mousedown', handleAnchorMouseDown);
      anchor.removeEventListener('mousemove', handleAnchorMouseMove);
      refreshCheckState();
      unsubscribeDocumentMouseEvent();
    };
  };
  return { subscribeGrab, grabbing };
};

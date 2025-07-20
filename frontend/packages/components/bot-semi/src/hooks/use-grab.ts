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
   * 拖拽的锚点
   * @default grabTarget
   */
  grabAnchor?: RefObject<HTMLDivElement>;
  /** 被拖拽移动的目标 */
  grabTarget: RefObject<HTMLDivElement>;
  /** 是否直接修改 style 达到移动的效果 */
  isModifyStyle: boolean;
  /** 位置改变时的回调 */
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
     * 计算页面宽度和目标宽度, 和拖拽的位置进行比较
     * 避免将弹窗拖离页面
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
     * 计算鼠标在拖拽目标 dom 中的相对位置
     * 用于后续和全局鼠标位置进行差值计算得到拖拽位置
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
       * 只识别鼠标主按键(左键)按下
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
     * 当弹窗到达边界/由于 resize 导致弹窗超出边界后
     * 鼠标移动过程中需要更新 anchor 位置, 否则会出现鼠标移动但是弹窗位置不更新的问题
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
       * 避免正常拖拽时 anchor 位置和全局鼠标位置同时变化
       * 导致差值计算后位置不更新
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

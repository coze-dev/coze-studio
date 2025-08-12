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

import { useState, useRef, useCallback } from 'react';

import { useMemoizedFn } from 'ahooks';

interface Config {
  default?: number;
  min?: number;
  max?: number;
}

/**
 * Currently only highly variable is supported
 */
export const useResize = (config: Config) => {
  const [dragging, setDragging] = useState(false);
  const [height, setHeight] = useState(config.default);
  const ref = useRef<HTMLDivElement>(null);
  /**
   * Dragging process
   */
  const resizing = useRef(false);
  /**
   * Y-axis variation
   */
  const startY = useRef(0);
  /** starting position */
  const start = useRef(0);

  const handleMouseMove = useMemoizedFn(e => {
    if (resizing.current) {
      const newHeight = start.current - (e.clientY - startY.current); // Calculate the new height
      if (config.max && newHeight > config.max) {
        setHeight(config.max);
      } else if (config.min && newHeight < config.min) {
        setHeight(config.min);
      } else {
        setHeight(newHeight);
      }
    }
  });
  const handleMouseUp = useCallback(() => {
    resizing.current = false;
    setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove); // Cancel listening
    document.removeEventListener('mouseup', handleMouseUp); // Cancel listening
  }, [handleMouseMove]);

  const handleMouseDown = useMemoizedFn(e => {
    resizing.current = true;
    setDragging(true);
    startY.current = e.clientY; // Record the Y-axis coordinates when the mouse starts dragging
    start.current = ref.current?.offsetHeight || 0;
    document.addEventListener('mousemove', handleMouseMove); // Monitor mouse movement events
    document.addEventListener('mouseup', handleMouseUp); // Monitor mouse lift events
  });

  return {
    height,
    bind: handleMouseDown,
    ref,
    dragging,
  };
};

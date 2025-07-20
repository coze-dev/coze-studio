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
 * 目前仅支持高度可变
 */
export const useResize = (config: Config) => {
  const [dragging, setDragging] = useState(false);
  const [height, setHeight] = useState(config.default);
  const ref = useRef<HTMLDivElement>(null);
  /**
   * 拖拽过程中
   */
  const resizing = useRef(false);
  /**
   * y 轴变化
   */
  const startY = useRef(0);
  /** 开始位置 */
  const start = useRef(0);

  const handleMouseMove = useMemoizedFn(e => {
    if (resizing.current) {
      const newHeight = start.current - (e.clientY - startY.current); // 计算新的高度
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
    document.removeEventListener('mousemove', handleMouseMove); // 取消监听
    document.removeEventListener('mouseup', handleMouseUp); // 取消监听
  }, [handleMouseMove]);

  const handleMouseDown = useMemoizedFn(e => {
    resizing.current = true;
    setDragging(true);
    startY.current = e.clientY; // 记录鼠标开始拖拽时的 Y 轴坐标
    start.current = ref.current?.offsetHeight || 0;
    document.addEventListener('mousemove', handleMouseMove); // 监听鼠标移动事件
    document.addEventListener('mouseup', handleMouseUp); // 监听鼠标抬起事件
  });

  return {
    height,
    bind: handleMouseDown,
    ref,
    dragging,
  };
};

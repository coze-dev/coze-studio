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

import type React from 'react';
import { type DragEventHandler, useRef, useState } from 'react';

const checkHasFileOnDrag = (e: React.DragEvent<HTMLDivElement>) =>
  Boolean(e.dataTransfer?.types.includes('Files'));

export const useDragImage = () => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDragIn, setIsDragIn] = useState(false);

  const clearTimer = () => {
    if (!timer.current) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
  };
  const onDragEnter: DragEventHandler<HTMLDivElement> = e => {
    clearTimer();
    if (!checkHasFileOnDrag(e)) {
      return;
    }
    setIsDragIn(true);
  };

  const onDragEnd = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      setIsDragIn(false);
    }, 100);
  };

  const onDragOver: DragEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    clearTimer();
    if (!checkHasFileOnDrag(e)) {
      return;
    }
    setIsDragIn(true);
  };

  return {
    isDragIn,
    setIsDragIn,
    onDragEnter,
    onDragEnd,
    onDragOver,
  };
};

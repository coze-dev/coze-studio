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

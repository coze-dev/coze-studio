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

import {
  type MouseEventHandler,
  type FC,
  useRef,
  useCallback,
  useState,
} from 'react';

import classnames from 'classnames';

import s from './handle.module.less';

// Currently only supports horizontal direction, expand it on demand.
export interface ResizableLayoutHandleProps {
  className?: string;
  hotZoneClassName?: string;
  onMove: (offset: number) => void;
  onMoveStart: () => void;
  onMoveEnd: () => void;
}

interface HandleState {
  startX: number;
  moving: boolean;
}

const hotZoneStyle = classnames(
  s['hot-zone'],
  'flex items-stretch justify-center',
  'cursor-col-resize',
  'z-10',
  'w-[8px] mx-[-3.5px]',
  'bg-transparent',
);

const handleStyle = classnames('transition-width duration-300 ease-in-out');

export const ResizableLayoutHandle: FC<ResizableLayoutHandleProps> = ({
  className,
  hotZoneClassName,
  onMove,
  onMoveStart,
  onMoveEnd,
}) => {
  const [moving, setMoving] = useState(false);
  const stateRef = useRef<HandleState>({
    startX: 0,
    moving: false,
  });

  const callbackRef = useRef({
    onMove,
    onMoveStart,
    onMoveEnd,
  });

  callbackRef.current = {
    onMove,
    onMoveStart,
    onMoveEnd,
  };

  const moveEnd = useCallback(() => {
    setMoving(false);
    stateRef.current = {
      startX: 0,
      moving: false,
    };
    offEvents();
    callbackRef.current.onMoveEnd();
  }, []);

  const move = useCallback((e: PointerEvent) => {
    if (stateRef.current.moving) {
      callbackRef.current.onMove(e.clientX - stateRef.current.startX);
    }
  }, []);

  const offEvents = () => {
    window.removeEventListener('pointermove', move, false);
    // Adapt to the situation of multi-touch on the mobile end
    window.removeEventListener('pointerdown', moveEnd, false);
    window.removeEventListener('pointerup', moveEnd, false);
    window.removeEventListener('pointercancel', moveEnd, false);
  };

  const onMouseDown: MouseEventHandler<HTMLDivElement> = e => {
    stateRef.current = {
      moving: true,
      startX: e.pageX,
    };
    setMoving(true);
    callbackRef.current.onMoveStart();
    window.addEventListener('pointermove', move, false);
    // Adapt to the situation of multi-touch on the mobile end
    window.addEventListener('pointerdown', moveEnd, false);
    window.addEventListener('pointerup', moveEnd, false);
    window.addEventListener('pointercancel', moveEnd, false);
  };
  //  TODO hover style & hotzone width needs to be aligned with UI
  return (
    <div
      className={classnames(hotZoneStyle, hotZoneClassName)}
      onMouseDown={onMouseDown}
    >
      <div
        className={classnames(
          className,
          s.handle,
          moving && s['handle-moving'],
          handleStyle,
        )}
      />
    </div>
  );
};

ResizableLayoutHandle.displayName = 'ResizableLayoutHandle';

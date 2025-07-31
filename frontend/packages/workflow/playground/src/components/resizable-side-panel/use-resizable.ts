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

/* eslint-disable max-params */
import { useCallback, useRef } from 'react';

import { type NumberSize, type ResizableProps } from 're-resizable';

import { useResizableSidePanelStore } from '@/hooks/use-resizable-side-panel-store';

import { getConstraintWidth } from './utils';
import { useSidePanelWidth } from './use-side-panel-width';
import { MIN_WIDTH } from './constants';

import styles from './index.module.less';

export function useResizable(): ResizableProps {
  const setStoreWidth = useResizableSidePanelStore(state => state.setWidth);
  const { width, max } = useSidePanelWidth();
  const initWidth = useRef(width);

  const handleResizeStart = useCallback(
    (_event, _direction, _elementRef) => {
      initWidth.current = width;
    },
    [width],
  );

  const handleResize = useCallback(
    (_event, _direction, _elementRef, delta: NumberSize) => {
      if (!initWidth.current) {
        return;
      }
      setStoreWidth(getConstraintWidth(initWidth.current + delta.width, max));
    },
    [max, setStoreWidth],
  );

  const handleResizeStop = useCallback(
    (_event, _direction, _elementRef, delta: NumberSize) => {
      if (!initWidth.current) {
        return;
      }
      setStoreWidth(getConstraintWidth(initWidth.current + delta.width, max));
    },
    [max, setStoreWidth],
  );

  return {
    enable: {
      left: true,
    },
    minWidth: MIN_WIDTH,
    maxWidth: max,
    size: {
      width,
      height: '100%',
    },
    handleWrapperClass: styles['resizable-handle-wrapper'],
    onResizeStart: handleResizeStart,
    onResize: handleResize,
    onResizeStop: handleResizeStop,
  };
}

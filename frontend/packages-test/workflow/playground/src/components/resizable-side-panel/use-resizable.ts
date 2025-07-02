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

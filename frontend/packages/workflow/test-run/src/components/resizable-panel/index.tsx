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

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  type MutableRefObject,
} from 'react';

import { isNumber } from 'lodash-es';
import cls from 'classnames';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import styles from './resizable-panel.module.less';

interface ResizablePanelProps {
  className?: string;
  header?: React.ReactNode;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  hideClose?: boolean;
  onClose: () => void;
  onCloseWithoutAnimation?: () => void;
  animation?: 'slide' | 'translateY';
  translateYHeight?: string;
  innerScrollRef?: MutableRefObject<HTMLDivElement | null>;
  draggable?: boolean;
}

export interface ResizablePanelRef {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  scrollTo: (options?: ScrollToOptions) => void;
}

const MIN_HEIGHT = 156;

/**
 * TODO: The core telescopic ability here wants to be replaced by semi Resizable later. Here are some temporary logical adaptations.
 */
export const ResizablePanel = forwardRef<
  ResizablePanelRef,
  React.PropsWithChildren<ResizablePanelProps>
>(
  (
    {
      className,
      hideClose,
      header,
      footer,
      onClose,
      onCloseWithoutAnimation,
      children,
      animation,
      translateYHeight = 'calc(100% - 52px)',
      innerScrollRef: innerScrollRefFromProps,
      draggable = true,
      headerExtra,
    },
    ref,
  ) => {
    const [height, setHeight] = useState<null | number>(0);
    const [isOpen, setIsOpen] = useState<null | boolean>(null);

    const innerRef = useRef<HTMLDivElement>(null);
    const _scrollRef = useRef<HTMLDivElement>(null);
    const scrollRef = innerScrollRefFromProps || _scrollRef;

    const isResizing = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const [transition, setTransition] = useState(true);

    const handleMouseMove = useCallback(
      e => {
        if (isResizing.current) {
          const newHeight = startHeight.current - (e.clientY - startY.current); // Calculate the new height
          setHeight(newHeight > MIN_HEIGHT ? newHeight : MIN_HEIGHT);
        }
      },
      [setHeight],
    );
    const handleMouseUp = useCallback(() => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove); // Cancel listening
      document.removeEventListener('mouseup', handleMouseUp); // Cancel listening
    }, [handleMouseMove]);

    const handleMouseDown = useCallback(
      e => {
        isResizing.current = true;
        startY.current = e.clientY; // Record the Y-axis coordinates when the mouse starts dragging
        startHeight.current = innerRef.current?.offsetHeight || 0;
        document.addEventListener('mousemove', handleMouseMove); // Monitor mouse movement events
        document.addEventListener('mouseup', handleMouseUp); // Monitor mouse lift events
      },
      [handleMouseMove, handleMouseUp],
    );

    const handleClose = () => {
      setTransition(true);
      onCloseWithoutAnimation?.();

      if (animation) {
        setIsOpen(false);
      } else {
        setHeight(0);
      }

      setTimeout(() => {
        onClose();
      }, 250);
    };

    useImperativeHandle(ref, () => ({
      minimize: () => {
        setTransition(true);
        setHeight(MIN_HEIGHT);
        setTimeout(() => setTransition(false), 250);
      },
      maximize: () => {
        setTransition(true);
        setHeight(null);
        setTimeout(() => setTransition(false), 250);
      },
      close: () => {
        handleClose();
      },
      scrollTo: (options?: ScrollToOptions) =>
        scrollRef.current?.scrollTo(options),
    }));

    useEffect(() => {
      setIsOpen(true);

      setTimeout(() => {
        setHeight(null);
        setTimeout(() => {
          setTransition(false);
        }, 250);
      }, 100);
    }, []);

    const styleMemo = useMemo(() => {
      if (animation === 'slide') {
        return {
          height: '100%',
        };
      }

      if (animation === 'translateY') {
        return {
          height: isNumber(height) ? `${height}px` : translateYHeight,
          maxHeight: translateYHeight,
        };
      }

      return {
        height: isNumber(height) ? `${height}px` : '90%',
      };
    }, [height, animation, translateYHeight]);

    return (
      <div
        ref={innerRef}
        style={styleMemo}
        className={cls(
          styles.container,
          {
            [styles['resizable-panel']]: !animation,
            [styles['need-transition']]: !animation && transition,

            [styles['resizable-panel-translateY']]: animation === 'translateY',
            [styles.show]: animation === 'translateY' && isOpen,
            [styles.hide]: animation === 'translateY' && !isOpen,

            [styles['resizable-panel-slide']]: animation === 'slide',
            [styles['slide-in']]: animation === 'slide' && isOpen,
            [styles['slide-out']]: animation === 'slide' && !isOpen,
          },
          className,
        )}
      >
        {draggable ? (
          <div
            onMouseDown={handleMouseDown}
            className={styles['panel-dragging']}
          ></div>
        ) : null}

        {header ? (
          <div className={styles['panel-header']}>
            {header}
            {hideClose ? null : (
              <IconButton
                icon={<IconCozCross className={'text-[18px]'} />}
                color="secondary"
                onClick={handleClose}
              />
            )}
          </div>
        ) : null}
        {headerExtra ? headerExtra : null}
        <div ref={scrollRef} className={styles['panel-content']}>
          {children}
        </div>
        {footer ? <div className={styles['panel-footer']}>{footer}</div> : null}
      </div>
    );
  },
);

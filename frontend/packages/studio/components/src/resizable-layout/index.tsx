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
  Children,
  type PropsWithChildren,
  useRef,
  type FC,
  isValidElement,
  cloneElement,
  type ReactNode,
  useState,
} from 'react';

import { sum } from 'lodash-es';
import classnames from 'classnames';
import { useDebounceEffect, useSize } from 'ahooks';

import { type ResizableLayoutProps } from './types';
import { ResizableLayoutHandle } from './handle';

interface LayoutState {
  moving: boolean;
  itemWidth: number[];
}

const getDefaultState = () => ({
  moving: false,
  itemWidth: [],
});

export const ResizableLayout: FC<PropsWithChildren<ResizableLayoutProps>> = ({
  className,
  children,
  handleClassName,
  hotZoneClassName,
}) => {
  const [state, setState] = useState<LayoutState>(getDefaultState());
  const containerRef = useRef<HTMLDivElement>(null);

  const childRef = useRef<HTMLElement[]>([]);

  const size = useSize(containerRef);

  useDebounceEffect(
    () => {
      if (!size?.width) {
        return;
      }
      const totalSize = sum(state.itemWidth);
      // Exclude the case where no drag has been performed, and the last allocated width is not recorded in the local state at this time
      if (totalSize <= 0) {
        return;
      }
      const ratio = size.width / totalSize;
      const newItemWidth = state.itemWidth.map(w => w * ratio);
      childRef.current.forEach(
        (item, index) => (item.style.width = `${newItemWidth[index]}px`),
      );
      setState({
        ...state,
        itemWidth: newItemWidth,
      });
    },
    [size?.width],
    {
      wait: 20,
      maxWait: 100,
    },
  );

  return (
    <div
      className={classnames(
        'flex w-full items-stretch',
        className,
        state.moving && 'cursor-col-resize select-none',
      )}
      ref={containerRef}
    >
      {Children.map(children, (child, index) => {
        let node: ReactNode;
        if (isValidElement(child)) {
          node = cloneElement(
            child,
            Object.assign({}, child.props, {
              ref: (target: React.ReactNode) => {
                if (target instanceof HTMLElement) {
                  childRef.current[index] = target;
                } else {
                  if (!IS_PROD && target) {
                    throw Error(
                      'children of ResizableLayout need a ref of HTMLElement',
                    );
                  }
                }
                // @ts-expect-error -- skip type gymnastics
                const { ref } = child;
                if (typeof ref === 'function') {
                  ref(target);
                } else if (ref && typeof ref === 'object') {
                  ref.current = target;
                }
              },
            }),
          );
        } else {
          node = (
            <div
              ref={elm => {
                if (elm) {
                  childRef.current[index] = elm;
                }
              }}
            >
              {child}
            </div>
          );
        }
        return (
          <>
            {index > 0 && (
              <ResizableLayoutHandle
                className={handleClassName}
                hotZoneClassName={hotZoneClassName}
                onMoveStart={() => {
                  setState({
                    moving: true,
                    itemWidth: childRef.current.map(
                      item => item.clientWidth ?? 0,
                    ),
                  });
                }}
                // Offset from the initial position
                onMove={offset => {
                  const pre = index - 1;
                  childRef.current[pre].style.width = `${
                    state.itemWidth[pre] + offset
                  }px`;
                  childRef.current[index].style.width = `${
                    state.itemWidth[index] - offset
                  }px`;
                }}
                onMoveEnd={() => {
                  setState({
                    // After dragging, record the true width
                    itemWidth: childRef.current.map(
                      item => item.clientWidth ?? 0,
                    ),
                    moving: false,
                  });
                }}
              />
            )}
            {node}
          </>
        );
      })}
    </div>
  );
};

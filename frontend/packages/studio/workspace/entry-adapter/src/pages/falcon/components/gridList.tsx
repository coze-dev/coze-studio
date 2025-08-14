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

import { useRef, useEffect, useState } from 'react';

import cls from 'classnames';

import styles from './index.module.less';

export const GridList = ({ children, averageItemWidth = 300, className }) => {
  const gridListRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(3);

  useEffect(() => {
    if (gridListRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          const itemWidth = averageItemWidth;
          const newRepeatCount = Math.max(1, Math.floor(width / itemWidth));
          setRepeatCount(newRepeatCount);
        }
      });
      resizeObserver.observe(gridListRef.current);
    }
  }, []);

  return (
    <div
      ref={gridListRef}
      className={cls(styles.gridList, className)}
      style={{ gridTemplateColumns: `repeat(${repeatCount}, 1fr)` }}
    >
      {children}
    </div>
  );
};

export const GridItem = ({
  children,
  disabled = false,
  className,
  onClick,
}) => {
  return (
    <div
      className={cls(styles.gridItem, className, {
        [styles.disabled]: disabled,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

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

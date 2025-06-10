import { type FC, Suspense, useState, useCallback } from 'react';

import { useRouteConfig } from '@coze-arch/bot-hooks';

import styles from '../side-sheet.module.less';

const STORAGE_KEY = 'submenu-width';
const MIN_WIDTH = 200;
const MAX_WIDTH = 380;

export const SubMenu: FC = () => {
  const config = useRouteConfig();
  const { subMenu: SubMenuComponent } = config;
  const [width, setWidth] = useState(() => {
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    return savedWidth
      ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Number(savedWidth)))
      : MIN_WIDTH;
  });

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.pageX;
      const startWidth = width;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidth + e.pageX - startX),
        );
        setWidth(newWidth);
        localStorage.setItem(STORAGE_KEY, String(newWidth));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width],
  );

  if (!SubMenuComponent) {
    return null;
  }

  return (
    <div className="relative flex flex-row">
      <div
        className="overflow-auto flex flex-col box-border px-[6px] py-[12px]"
        style={{ width: `${width}px` }}
      >
        <Suspense>
          <SubMenuComponent />
        </Suspense>
      </div>
      <div className={styles['sub-menu-resize']} onMouseDown={handleMouseDown}>
        <div className={styles['sub-menu-resize-line']}></div>
      </div>
    </div>
  );
};

import classNames from 'classnames';

import { tokenMapToStr } from '../../utils/token-map-to-str';
import { type ResponsiveTokenMap } from '../../types';
import { type ScreenRange } from '../../constant';

import styles from './responsive.module.less';

interface ResponsiveListProps<T> {
  dataSource: T[];
  renderItem: (item: T, index: number) => React.ReactNode;

  className?: string;
  emptyContent?: React.ReactNode;

  footer?: React.ReactNode;

  gridCols?: ResponsiveTokenMap<ScreenRange>; // 响应式列数
  gridGapXs?: ResponsiveTokenMap<ScreenRange>; // 响应式X轴gap
  gridGapYs?: ResponsiveTokenMap<ScreenRange>; // 响应式Y轴gap
}

// 通过tailwind动态根据媒体查询设置List列数
export const ResponsiveList = <T extends object>({
  dataSource,
  renderItem,

  className,
  emptyContent,
  footer,

  gridCols = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gridGapXs,
  gridGapYs,
}: ResponsiveListProps<T>) => (
  <div className={classNames('flex flex-col justify-items-center', className)}>
    <div
      className={classNames(
        'w-full grid justify-content-center responsive-list-container',
        gridCols && tokenMapToStr(gridCols, 'grid-cols'),
        gridGapXs && tokenMapToStr(gridGapXs, 'gap-x'),
        gridGapYs && tokenMapToStr(gridGapYs, 'gap-y'),
        styles['grid-cols-1'],
      )}
    >
      {dataSource.length
        ? dataSource.map((data, idx) => renderItem(data, idx))
        : emptyContent}
    </div>
    {footer}
  </div>
);

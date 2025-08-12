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

  gridCols?: ResponsiveTokenMap<ScreenRange>; // number of responsive columns
  gridGapXs?: ResponsiveTokenMap<ScreenRange>; // Responsive X-axis gap
  gridGapYs?: ResponsiveTokenMap<ScreenRange>; // Responsive Y-axis gap
}

// List columns dynamically set by media query with tailwind
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

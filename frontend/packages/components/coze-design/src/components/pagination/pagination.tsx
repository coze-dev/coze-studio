import { forwardRef } from 'react';

import { Pagination as SemiPagination } from '@douyinfe/semi-ui';
import { IconCozArrowLeft, IconCozArrowRight } from '@coze-arch/arco-icon';

import { cn } from '@/utils/cn';

import { paginationVariants } from './pagination-variant';
import { type PaginationProps } from './pagination-types';

import './index.css';

export const Pagination = forwardRef<SemiPagination, PaginationProps>(
  (props, ref) => {
    const { className, style, layout, size, ...restProps } = props;

    const classes = cn(
      paginationVariants({
        size,
        layout,
      }),
      className,
    );
    return (
      <SemiPagination
        prevText={<IconCozArrowLeft />}
        nextText={<IconCozArrowRight />}
        ref={ref}
        className={classes}
        style={style}
        size={layout === 'simple' ? 'small' : 'default'}
        popoverPosition="bottomLeft"
        {...restProps}
      />
    );
  },
);

Pagination.displayName = 'Pagination';

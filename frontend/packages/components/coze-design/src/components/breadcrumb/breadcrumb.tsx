import { forwardRef } from 'react';

import { Breadcrumb as SemiBreadcrumb } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { breadcrumbVariants } from './breadcrumb-variant';
import { type BreadcrumbProps } from './breadcrumb-types';

import './index.css';

const defaultProps: Partial<BreadcrumbProps> = {
  size: 'default',
};

const BreadcrumbComponent = forwardRef<SemiBreadcrumb, BreadcrumbProps>(
  (props, ref) => {
    const { dataTheme, className, size, children, ...restProps } =
      Object.assign({}, defaultProps, props);

    const classes = cn(breadcrumbVariants(), className);

    const elementProps = {
      className: classes,
      'data-theme': dataTheme,
    };

    return (
      <SemiBreadcrumb
        ref={ref}
        {...elementProps}
        {...restProps}
        compact={size !== 'default'}
      >
        {children}
      </SemiBreadcrumb>
    );
  },
);

export const Breadcrumb = Object.assign(BreadcrumbComponent, {
  Item: SemiBreadcrumb.Item,
});

Breadcrumb.displayName = 'Breadcrumb';

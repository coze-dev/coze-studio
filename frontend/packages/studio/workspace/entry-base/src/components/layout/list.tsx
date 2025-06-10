import React, { type HTMLAttributes, forwardRef } from 'react';

import classNames from 'classnames';

export type LayoutBaseProps = HTMLAttributes<HTMLDivElement>;

export const Layout = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'min-h-[100%]',
        'flex flex-col gap-[16px]',
        'overflow-hidden',
        'px-[24px] pt-[24px]',
      )}
    >
      {children}
    </div>
  ),
);

export const Header = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'flex-shrink-0',
        'w-full h-[32px]',
        'flex items-center justify-between',
      )}
    >
      {children}
    </div>
  ),
);

export const HeaderTitle = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'text-[20px] font-[500]',
        'flex items-center gap-[8px]',
      )}
    >
      {children}
    </div>
  ),
);

export const HeaderActions = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'flex items-center gap-[8px] ml-[32px]',
      )}
    >
      {children}
    </div>
  ),
);

export const SubHeader = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'flex-shrink-0',
        'w-full h-[32px]',
        'flex items-center justify-between',
      )}
    >
      {children}
    </div>
  ),
);

export const SubHeaderFilters = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(restProps.className, 'flex items-center gap-[8px]')}
    >
      {children}
    </div>
  ),
);

export const SubHeaderSearch = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div {...restProps} ref={ref} className={classNames(restProps.className)}>
      {children}
    </div>
  ),
);

export const Content = forwardRef<HTMLDivElement, LayoutBaseProps>(
  ({ children, ...restProps }, ref) => (
    <div
      {...restProps}
      ref={ref}
      className={classNames(
        restProps.className,
        'flex-grow',
        'overflow-x-hidden overflow-y-auto',
      )}
    >
      {children}
    </div>
  ),
);

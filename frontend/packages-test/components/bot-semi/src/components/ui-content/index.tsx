import React, { ForwardedRef, PropsWithChildren, forwardRef } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

export type UIContentProps = PropsWithChildren<{
  className?: string;
}>;
export const UIContent = forwardRef(
  (
    { className, children }: UIContentProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    <div ref={ref} className={classNames(s['ui-content'], className)}>
      {children}
    </div>
  ),
);

export default UIContent;

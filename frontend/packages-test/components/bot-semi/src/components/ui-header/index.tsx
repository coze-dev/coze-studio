import React, { PropsWithChildren, ReactElement } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

export type UIHeaderProps = PropsWithChildren<{
  className?: string;
  title?: string;
  breadcrumb?: ReactElement;
}>;
export const UIHeader: React.FC<UIHeaderProps> = ({
  className,
  children,
  title = '',
  breadcrumb,
}) => (
  <div
    className={classNames(s['ui-header'], className)}
    data-testid="ui.header"
  >
    {title && <div className={s.title}>{title}</div>}
    {!!breadcrumb && breadcrumb}
    {children}
  </div>
);

export default UIHeader;

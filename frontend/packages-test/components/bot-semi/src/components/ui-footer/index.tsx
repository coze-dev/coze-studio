import React, { PropsWithChildren } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

export type UIFooterProps = PropsWithChildren<{
  className?: string;
}>;
export const UIFooter: React.FC<UIFooterProps> = ({ className, children }) => (
  <div className={classNames(s['ui-footer'], className)}>{children}</div>
);

export default UIFooter;

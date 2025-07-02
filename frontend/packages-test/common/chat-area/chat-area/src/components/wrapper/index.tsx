import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './index.module.less';

export const Wrapper: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ children, className }) => (
  <div className={classNames(styles.wrapper, 'common-wrapper', className)}>
    {children}
  </div>
);

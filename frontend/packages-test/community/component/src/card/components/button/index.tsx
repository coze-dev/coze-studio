import { type FC, type PropsWithChildren } from 'react';

import cls from 'classnames';

import styles from './index.module.less';

export const CardButton: FC<
  PropsWithChildren<{
    className?: string;
    onClick?: () => void;
  }>
> = ({ className, onClick, children }) => (
  <button
    className={cls(styles['card-button'], className)}
    color="primary"
    onClick={onClick}
  >
    {children}
  </button>
);

import { type PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './index.module.less';

export const ProcessContent: React.FC<PropsWithChildren> = ({ children }) => (
  <div
    className={classNames(styles['process-content'], [
      'bg-[var(--coz-mg-secondary)]',
    ])}
  >
    {children}
  </div>
);

import { PropsWithChildren } from 'react';

import classNames from 'classnames';

import { isMobile } from '../../utils';

import s from './index.module.less';

export const SignPanel: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <div
    className={classNames(isMobile() ? s['mobile-panel'] : s.panel, className)}
  >
    {children}
  </div>
);

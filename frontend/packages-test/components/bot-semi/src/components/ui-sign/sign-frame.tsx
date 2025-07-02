import React, { PropsWithChildren } from 'react';

import { isMobile } from '../../utils';

import s from './index.module.less';

interface SignFrameProps {
  brandNode: React.ReactNode;
}

export const SignFrame: React.FC<PropsWithChildren<SignFrameProps>> = ({
  children,
  brandNode,
}) => (
  <div className={isMobile() ? s['mobile-frame'] : s.frame}>
    {!isMobile() && <div className={s.brand}>{brandNode}</div>}
    {children}
  </div>
);

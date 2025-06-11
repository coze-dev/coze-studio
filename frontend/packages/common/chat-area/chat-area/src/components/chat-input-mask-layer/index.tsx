import React, { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './index.module.less';

export const ChatInputMaskLayer: FC<PropsWithChildren> = ({ children }) => (
  <div className={classNames(styles.mask)}>{children}</div>
);

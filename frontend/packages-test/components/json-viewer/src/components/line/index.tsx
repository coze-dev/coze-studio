import React from 'react';

import cls from 'classnames';

import { LineStatus } from '../../types';

import styles from './index.module.less';

export const Line: React.FC<{ status: LineStatus }> = ({ status }) => (
  <div
    className={cls(styles['json-viewer-line'], {
      [styles.hidden]: status === LineStatus.Hidden,
      [styles.visible]: status === LineStatus.Visible,
      [styles.half]: status === LineStatus.Half,
      [styles.last]: status === LineStatus.Last,
    })}
  ></div>
);

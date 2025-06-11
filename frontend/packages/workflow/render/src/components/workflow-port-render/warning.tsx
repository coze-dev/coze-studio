import React from 'react';

import classNames from 'classnames';

import styles from './index.module.less';

export const Warning = () => (
  <div className={classNames(styles.symbol, styles.warning)}>
    <svg
      style={{ width: 10, height: 10 }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="path1"
        fill="#ffffff"
        stroke="none"
        d="M 12 0 C 10.674479 0 9.6 1.074528 9.6 2.4 L 9.6 14.4 C 9.6 15.725521 10.674479 16.799999 12 16.799999 C 13.325521 16.799999 14.4 15.725521 14.4 14.4 L 14.4 2.4 C 14.4 1.074528 13.325521 0 12 0 Z"
      />
      <path
        id="path2"
        fill="#ffffff"
        stroke="none"
        d="M 12 19.200001 C 10.674479 19.200001 9.6 20.274479 9.6 21.6 C 9.6 22.925518 10.674479 24 12 24 C 13.325521 24 14.4 22.925518 14.4 21.6 C 14.4 20.274479 13.325521 19.200001 12 19.200001 Z"
      />
    </svg>
  </div>
);

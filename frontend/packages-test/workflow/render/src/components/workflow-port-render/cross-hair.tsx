import React from 'react';

import styles from './index.module.less';

// demo 环境自绘 cross-hair，正式环境使用 IconAdd
export default function CrossHair(): JSX.Element {
  return (
    <div className={styles.symbol}>
      <div className={styles.crossHair} />
    </div>
  );
}

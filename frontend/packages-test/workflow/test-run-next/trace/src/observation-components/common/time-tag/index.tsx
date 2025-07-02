import { type FC } from 'react';

import { isUndefined } from 'lodash-es';

import styles from './index.module.less';

export const TimeTag: FC<{ duration: number | string | undefined }> = ({
  duration,
}) =>
  !isUndefined(duration) ? (
    <span className={styles['time-tag']}>
      {duration.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ms
    </span>
  ) : null;

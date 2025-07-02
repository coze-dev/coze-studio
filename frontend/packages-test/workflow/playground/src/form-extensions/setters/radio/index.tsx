import { type FC } from 'react';

import { Radio as BaseRadio, type RadioProps } from '../../components/radio';

import styles from './index.module.less';

export const Radio: FC<RadioProps> = props => (
  <div className={styles['workflow-node-setter-radio']}>
    <BaseRadio {...props} />
  </div>
);

export const radio = {
  key: 'Radio',
  component: Radio,
};

import { IconSpin } from '@douyinfe/semi-icons';

import { type FunctionCallMessage } from '../../../store/types';

import styles from './index.module.less';

export const FunctionCallContent = ({
  message,
}: {
  message: FunctionCallMessage;
}) => (
  <div className={styles.content}>
    <IconSpin spin className={styles['prefix-icon']} />
    {'开发中'}
  </div>
);

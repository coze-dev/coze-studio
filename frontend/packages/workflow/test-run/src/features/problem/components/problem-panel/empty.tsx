import { IconCozIllusDone } from '@coze/coze-design/illustrations';

import styles from './empty.module.less';

export const ProblemEmpty = () => (
  <div className={styles['problem-empty']}>
    <IconCozIllusDone width="120" height="120" />
  </div>
);

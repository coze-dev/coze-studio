import { Spin } from '@coze-arch/coze-design';

import styles from './result.module.less';

interface ResultProps {
  isFetching?: boolean;
  value?: string;
  testId?: string;
}

export const Result: React.FC<ResultProps> = ({
  value,
  isFetching,
  testId,
}) => (
  <Spin
    wrapperClassName={styles.result}
    tip="Optimizing Prompt..."
    spinning={isFetching}
    data-testid={testId}
  >
    {value}
  </Spin>
);

import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { UIEmpty } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface ConfigurationErrorProps {
  fetchTableInfo: () => void;
}
export const ConfigurationError = (props: ConfigurationErrorProps) => {
  const { fetchTableInfo } = props;
  return (
    <UIEmpty
      className={styles['load-failure']}
      empty={{
        title: 'Read failure',
        description: '',
        icon: <IllustrationNoResult></IllustrationNoResult>,
        btnText: 'Retry',
        btnOnClick: fetchTableInfo,
      }}
    />
  );
};

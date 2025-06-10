import { type DataSetInfo } from '@coze-arch/bot-api/memory';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { UIBreadcrumb } from '@coze-studio/components';
import { Layout } from '@coze/coze-design';

import styles from './index.module.less';

export interface KnowledgePreviewNavigationProps {
  datasetInfo: Dataset;
}
export const KnowledgePreviewNavigation = ({
  datasetInfo,
}: KnowledgePreviewNavigationProps) => (
  <Layout.Header
    className={styles.header}
    breadcrumb={
      <UIBreadcrumb
        showTooltip={{ width: '160px' }}
        className={styles.breadcrumb}
        datasetInfo={datasetInfo as unknown as DataSetInfo}
        compact={false}
      />
    }
  ></Layout.Header>
);

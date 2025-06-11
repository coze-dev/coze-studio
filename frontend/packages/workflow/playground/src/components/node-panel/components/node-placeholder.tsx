import { Placeholder } from '@/components/node-render/node-render-new/placeholder';

import styles from './styles.module.less';
export const NodePlaceholder = () => (
  <div
    className={styles['node-placeholder']}
    data-testid="workflow.detail.node-panel.placeholder"
  >
    <Placeholder />
  </div>
);

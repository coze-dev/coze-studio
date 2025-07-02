import { type NodeError } from '@/entities/workflow-exec-state-entity';

import { ErrorLineItem, ErrorNodeItem } from './error-item';

import styles from './styles.module.less';

export const ErrorList = ({
  nodeErrorList,
  title,
}: {
  nodeErrorList: NodeError[];
  title: string;
}) => (
  <div className={styles['execute-result-list']}>
    <div className={styles['execute-result-list-title']}>{title}</div>
    <div className={styles['execute-result-list-content']}>
      {nodeErrorList.map((item, index) => (
        <div style={{ padding: 0 }} key={item.nodeId}>
          {item.errorType === 'line' ? (
            <ErrorLineItem nodeError={item} index={index} />
          ) : (
            <ErrorNodeItem nodeError={item} />
          )}
        </div>
      ))}
    </div>
  </div>
);

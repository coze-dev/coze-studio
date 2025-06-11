import React from 'react';

import { JsonViewer } from '@coze-common/json-viewer';

import { type ConditionLog as ConditionLogType } from '../types';

import styles from './index.module.less';

export const ConditionLog: React.FC<{ condition: ConditionLogType }> = ({
  condition,
}) => {
  const { leftData, rightData, operatorData } = condition;
  return (
    <div className={styles['flow-test-run-condition-log']}>
      <JsonViewer
        data={leftData}
        className={styles['flow-test-run-condition-log-value']}
      />
      <div className={styles['flow-test-run-condition-log-operator']}>
        <div className={styles['operator-line']}></div>
        <div className={styles['operator-value']}>{operatorData}</div>
        <div className={styles['operator-line']}></div>
      </div>
      <JsonViewer
        data={rightData}
        className={styles['flow-test-run-condition-log-value']}
      />
    </div>
  );
};

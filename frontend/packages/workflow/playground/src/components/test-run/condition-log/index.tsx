/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

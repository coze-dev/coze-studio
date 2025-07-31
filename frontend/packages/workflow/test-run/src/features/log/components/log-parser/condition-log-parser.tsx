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

import { pick } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import { DataViewer } from '../data-viewer';
import {
  type ConditionData,
  type ConditionLog,
  ConditionGroup,
} from '../../types';
import { LogWrap } from './log-wrap';

import css from './condition-log-parser.module.less';

export const ConditionField: React.FC<{ condition: ConditionData }> = ({
  condition,
}) => {
  const { leftData, rightData, operatorData } = condition;
  return (
    <div className={css['condition-field']}>
      <DataViewer data={leftData} className={css['field-value']} />
      <div className={css['field-operator']}>
        <Typography.Text size="small" className={css['operator-value']}>
          {operatorData}
        </Typography.Text>
      </div>
      <DataViewer data={rightData} className={css['field-value']} />
    </div>
  );
};

const ConditionGroup: React.FC<{
  idx: number;
  group: ConditionGroup;
}> = ({ idx, group }) => {
  const { name, logic, logicData, conditions } = group;

  return (
    <LogWrap
      label={`${I18n.t('workflow_detail_condition_condition')} ${idx + 1}`}
      copyTooltip={I18n.t('workflow_detail_title_testrun_copyinput')}
      source={{
        name,
        logic,
        conditions: conditions.map(condition =>
          pick(condition, ['left', 'right', 'oprator']),
        ),
      }}
    >
      {conditions.map((condition, cIdx) => (
        <>
          <ConditionField condition={condition} />
          {cIdx < conditions.length - 1 && (
            <div className={css['logic-data']}>{logicData}</div>
          )}
        </>
      ))}
    </LogWrap>
  );
};

export const ConditionLogParser: React.FC<{ log: ConditionLog }> = ({
  log,
}) => {
  const { conditions } = log;

  return (
    <>
      {conditions.map((group, idx) => (
        <ConditionGroup group={group} idx={idx} key={idx} />
      ))}
    </>
  );
};

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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { Logic } from '../../constants';

import styles from './index.module.less';

interface ConditionRelationProps {
  value: number;
  disabled?: boolean;
  showPlaceholder?: boolean;
  onChange: (v: Logic) => void;
}

export default function ConditionLogic({
  value,
  disabled,
  showPlaceholder,
  onChange,
}: ConditionRelationProps) {
  const renderContent = () => {
    if (showPlaceholder) {
      return (
        <span className={styles.label}>
          {I18n.t('workflow_detail_condition_condition')}
        </span>
      );
    }
    return (
      <Select
        placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
        style={{ width: '100%' }}
        disabled={disabled}
        value={value}
        size="small"
        optionList={[
          {
            label: I18n.t('workflow_detail_condition_and'),
            value: Logic.AND,
          },
          {
            label: I18n.t('workflow_detail_condition_or'),
            value: Logic.OR,
          },
        ]}
        onChange={val => onChange(val as Logic)}
      />
    );
  };

  return (
    <div
      className={classNames({
        [styles.container]: true,
        [styles.only_label]: showPlaceholder,
      })}
    >
      {renderContent()}
    </div>
  );
}

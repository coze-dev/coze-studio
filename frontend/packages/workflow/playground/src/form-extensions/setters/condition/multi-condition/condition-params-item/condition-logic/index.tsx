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

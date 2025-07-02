import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';

import styles from './index.module.less';

const Block = [
  { label: I18n.t('workflow_detail_condition_reference') },
  { label: I18n.t('workflow_detail_condition_select') },
  { label: I18n.t('workflow_detail_condition_comparison') },
];

export interface ConditionParamsHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ConditionParamsHeader({
  className,
  style,
}: ConditionParamsHeaderProps) {
  return (
    <div className={classNames(styles.container, className)} style={style}>
      {Block.map((item, index) => (
        <div key={index} className={styles.block}>
          {item.label ? (
            <span className={styles.label}>{item.label}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

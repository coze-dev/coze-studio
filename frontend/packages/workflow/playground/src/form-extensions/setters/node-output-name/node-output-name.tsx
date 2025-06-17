import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Input } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { feedbackStatus2ValidateStatus } from '../../components/utils';

import styles from './index.module.less';

type NodeOutputNameProps = SetterComponentProps & { readonly?: boolean };

const MaxCount = 20;

export const NodeOutputName = ({
  options,
  feedbackStatus,
  value,
  onChange,
  readonly,
}: NodeOutputNameProps) => {
  const { style = {} } = options;

  const onValueChange = React.useCallback(
    (v: string): void => {
      onChange(v);
    },
    [onChange],
  );

  const validateStatus = useMemo(
    () => feedbackStatus2ValidateStatus(feedbackStatus),
    [feedbackStatus],
  );

  const LimitCountNode = useMemo(
    () => (
      <span className={styles['limit-count']}>
        {value?.length || 0}/{MaxCount}
      </span>
    ),
    [value],
  );

  return (
    <div style={{ ...style, pointerEvents: readonly ? 'none' : 'auto' }}>
      <Input
        value={value}
        onChange={onValueChange}
        maxLength={MaxCount}
        validateStatus={validateStatus}
        placeholder={I18n.t('workflow_detail_node_input_entername')}
        suffix={LimitCountNode}
      />
    </div>
  );
};

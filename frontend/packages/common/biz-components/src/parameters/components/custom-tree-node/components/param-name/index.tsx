import React, { useState } from 'react';
import type { CSSProperties } from 'react';

import cx from 'classnames';
import { I18n } from '@coze-arch/i18n';

import useErrorMessage from '@/parameters/hooks/use-error-message';
import useConfig from '@/parameters/hooks/use-config';

import WorkflowSLInput from '../workflow-sl-input';
import { type TreeNodeCustomData } from '../../type';

import styles from './index.module.less';

interface ParamNameProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  style?: CSSProperties;
  onChange: (name: string) => void;
}

export default function ParamName({
  disabled,
  data,
  style,
  onChange,
}: ParamNameProps) {
  const errorMessage = useErrorMessage('name');
  const [slient, setSlient] = useState(true);
  const showError = slient === false && errorMessage;
  const { withDescription } = useConfig();

  return (
    <div
      className={cx(styles.container, {
        [styles.withDescription]: withDescription,
      })}
      style={style}
    >
      <WorkflowSLInput
        className={styles.name}
        value={data.name || ''}
        disabled={disabled}
        handleBlur={() => setSlient(false)}
        handleChange={(name: string) => {
          setSlient(true);
          onChange(name);
        }}
        inputProps={{
          size: 'small',
          placeholder: I18n.t('workflow_detail_end_output_entername'),
          disabled,
        }}
        errorMsg={showError ? errorMessage : ''}
        validateStatus={showError ? 'error' : 'default'}
      />
    </div>
  );
}

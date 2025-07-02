/* eslint-disable @coze-arch/no-deep-relative-import */
import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { Checkbox as UICheckbox } from '@coze-arch/coze-design';

import { type TreeNodeCustomData } from '../../type';
import { useOutputTreeContext } from '../../../../context';

import styles from './index.module.less';

interface ParamRequiredProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (required: boolean) => void;
}

export default function ParamRequired({
  data,
  disabled,
  onChange,
}: ParamRequiredProps) {
  const { concatTestId } = useNodeTestId();
  const { testId } = useOutputTreeContext();
  return (
    <div className={styles.container}>
      <div className={styles.switch}>
        <UICheckbox
          data-testid={concatTestId(testId ?? '', data.field, 'required')}
          disabled={disabled}
          checked={data.required}
          onChange={e => onChange(e.target.checked || false)}
        ></UICheckbox>
      </div>
    </div>
  );
}

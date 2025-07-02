import type { ReactNode } from 'react';

import { RadioGroup } from '@coze-arch/coze-design';
import type { RadioGroupProps } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface SourceSelectProps {
  value: RadioGroupProps['value'];
  onChange: RadioGroupProps['onChange'];
  children: ReactNode;
}

export const SourceSelect = (props: SourceSelectProps) => {
  const { value, onChange, children } = props;

  return (
    <div className={styles['radio-wrapper']}>
      <RadioGroup
        type="pureCard"
        onChange={onChange}
        value={value}
        direction="horizontal"
        name="format-type"
        className={styles['radio-group']}
      >
        {children}
      </RadioGroup>
    </div>
  );
};

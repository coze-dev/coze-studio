import type { ReactNode } from 'react';

import { RadioGroup } from '@coze-arch/coze-design';
import type { RadioGroupProps } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface KnowledgeSourceRadioGroupProps {
  value: RadioGroupProps['value'];
  onChange: RadioGroupProps['onChange'];
  children: ReactNode;
}

export const KnowledgeSourceRadioGroup = (
  props: KnowledgeSourceRadioGroupProps,
) => {
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

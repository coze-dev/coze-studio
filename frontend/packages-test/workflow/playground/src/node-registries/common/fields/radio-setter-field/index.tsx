import React from 'react';

import { Radio as BaseRadio } from '@/form-extensions/components/radio';
import { useField, withField } from '@/form';

import styles from './index.module.less';

const Radio = ({
  options,
  customReadonly,
}: {
  options;
  customReadonly?: boolean;
}) => {
  const { name, value, onChange, readonly } = useField<string | number>();
  const context = {
    meta: {
      name,
    },
  };
  return (
    <div className={styles['workflow-node-setter-radio']}>
      <BaseRadio
        value={value}
        onChange={onChange}
        options={options}
        readonly={!!readonly || customReadonly}
        context={context}
      />
    </div>
  );
};

export const RadioSetterField = withField(Radio);

import { type ChangeEvent, type FocusEvent } from 'react';

import {
  Input,
  withField,
  type InputProps,
  type CommonFieldProps,
} from '@coze-arch/coze-design';

import styles from './name-input.module.less';

const TESTSET_NAME_MAX_LEN = 50;

function count(val: unknown) {
  return val ? `${val}`.length : 0;
}

/** 需要后缀 & blur trim，扩展下原始的input */
function InnerInput(props: InputProps) {
  const onBlur = (evt: FocusEvent<HTMLInputElement>) => {
    props.onChange?.(
      `${props.value ?? ''}`.trim(),
      {} as unknown as ChangeEvent<HTMLInputElement>,
    );
    props.onBlur?.(evt);
  };

  return (
    <Input
      {...props}
      maxLength={props.maxLength ?? TESTSET_NAME_MAX_LEN}
      autoComplete="off"
      onBlur={onBlur}
      suffix={
        <div className={styles.suffix}>
          {count(props.value)}/{props.maxLength ?? TESTSET_NAME_MAX_LEN}
        </div>
      }
    />
  );
}

export const TestsetNameInput = withField(InnerInput, {}) as (
  props: CommonFieldProps & InputProps,
) => JSX.Element;

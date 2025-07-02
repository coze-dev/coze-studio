import { type ChangeEvent, type FocusEvent } from 'react';

import { type InputProps } from '@coze-arch/bot-semi/Input';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { withField, UIInput } from '@coze-arch/bot-semi';

import s from './testset-name-input.module.less';

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
    <UIInput
      {...props}
      maxLength={props.maxLength ?? TESTSET_NAME_MAX_LEN}
      autoComplete="off"
      onBlur={onBlur}
      suffix={
        <div className={s.suffix}>
          {count(props.value)}/{props.maxLength ?? TESTSET_NAME_MAX_LEN}
        </div>
      }
    />
  );
}

export const TestsetNameInput = withField(InnerInput, {}) as (
  props: CommonFieldProps & InputProps,
) => JSX.Element;

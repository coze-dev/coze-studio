import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { InputNumber as InputNumberUI } from '@coze/coze-design';

type InputNumberProps = SetterComponentProps;
export const InputNumber: FC<InputNumberProps> = props => {
  const { value, onChange, options, readonly } = props;

  const { key, style, ...others } = options;

  const { getNodeSetterId } = useNodeTestId();

  return (
    <InputNumberUI
      {...others}
      value={value}
      onChange={onChange}
      style={{
        ...style,
        pointerEvents: readonly ? 'none' : 'auto',
      }}
      data-testid={getNodeSetterId('number-input')}
    />
  );
};

export const number = {
  key: 'Number',
  component: InputNumber,
};

import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { Input as UIInput } from '@coze/coze-design';

function Input({
  value,
  onChange,
  options,
}: SetterComponentProps): JSX.Element {
  const { style } = options;
  const { getNodeSetterId } = useNodeTestId();
  const onValueChange = React.useCallback(
    (innerValue: string) => {
      onChange(innerValue);
    },
    [value, onChange],
  );
  return (
    <div style={style}>
      <UIInput
        value={value}
        onChange={onValueChange}
        data-testid={getNodeSetterId('input')}
      />
    </div>
  );
}

export const input = {
  key: 'Input',
  component: Input,
};

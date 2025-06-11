import React, { useCallback, useMemo } from 'react';

import { Switch as UISwitch } from '@coze/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type SwitchProps = SetterComponentProps;

const Switch = ({ value, onChange, options, readonly }: SwitchProps) => {
  const { size = 'default', style = {} } = options;

  const onValueChange = useCallback((checked: boolean) => {
    onChange(checked);
  }, []);

  const memoStyle = useMemo(
    () => ({ ...style, verticalAlign: 'bottom' }),
    [style],
  );

  return (
    <UISwitch
      disabled={readonly}
      size={size}
      checked={value}
      style={memoStyle}
      onChange={onValueChange}
    />
  );
};

export const switchSetter = {
  key: 'Switch',
  component: Switch,
};

import React from 'react';

import { connect } from '@formily/react';
import { Switch as CozSwitch } from '@coze/coze-design';

export interface SwitchProps {
  value?: boolean;
  onChange?: (v: boolean) => void;
}

const SwitchAdapter: React.FC<SwitchProps> = ({ value, ...props }) => (
  <CozSwitch checked={value} {...props} size="small" />
);

export const Switch = connect(SwitchAdapter);

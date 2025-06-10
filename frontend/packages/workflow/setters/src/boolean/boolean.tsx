import React from 'react';

import { Switch } from '@coze/coze-design';

import type { Setter } from '../types';

export const Boolean: Setter<boolean> = ({ value, onChange, readonly }) => (
  <Switch checked={value} onChange={onChange} disabled={readonly} />
);

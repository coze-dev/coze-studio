import React from 'react';

import { connect } from '@formily/react';

import {
  BaseInputNumberAdapter,
  type BaseInputNumberAdapterProps,
} from './base-input-number';

const InputIntegerAdapter: React.FC<BaseInputNumberAdapterProps> = props => (
  <BaseInputNumberAdapter {...props} precision={0.1} />
);

export const InputInteger = connect(InputIntegerAdapter);

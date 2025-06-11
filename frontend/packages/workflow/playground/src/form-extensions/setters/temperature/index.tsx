import React from 'react';

import { InputNumber } from '@coze/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type TemperatureProps = SetterComponentProps;

export const Temperature = ({ value, onChange }: TemperatureProps) => (
  <InputNumber min={0.1} max={1} step={0.1} value={value} onChange={onChange} />
);

export const temperature = {
  key: 'Temperature',
  component: Temperature,
};

import React from 'react';

import { isNil } from 'lodash-es';
import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { Slider as UISlider } from '@coze/coze-design';

type SelectProps = SetterComponentProps;

export const Slider = ({ value, onChange, options, readonly }: SelectProps) => {
  const { max, min, step, marks } = options;
  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="pb-1">
      <UISlider
        data-testid={getNodeSetterId('slider')}
        marks={marks}
        step={step}
        max={max}
        min={min}
        value={isNil(value) ? undefined : Number(value)}
        onChange={val => onChange(val)}
        readonly={readonly}
        disabled={readonly}
      />
    </div>
  );
};

export const slider: SetterExtension = {
  key: 'Slider',
  component: Slider,
};

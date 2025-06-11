import React from 'react';

import { SliderWithInput as SliderWithInputLegacy } from '@/form-extensions/components/slider-with-input';
import { useField, withField } from '@/form';

const SliderWithInput = props => {
  const { value, onChange, readonly } = useField<string | number>();

  return (
    <SliderWithInputLegacy
      value={value}
      onChange={onChange}
      readonly={!!readonly}
      {...props}
    />
  );
};

export const SliderWithInputField = withField(SliderWithInput);

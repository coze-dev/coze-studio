import { type CSSProperties } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { Slider } from '@coze-arch/coze-design';

export const SliderWithInput = (props: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min: number;
  sliderStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  readonly: boolean;
  marks?: {
    [key: number]: string;
  };
}) => {
  const {
    value,
    onChange,
    max,
    min,
    sliderStyle = { width: 300 },
    readonly,
    marks,
  } = props;

  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="flex">
      <Slider
        data-testid={getNodeSetterId('slider-with-input-slider')}
        max={max}
        min={min}
        value={value}
        onChange={val => {
          onChange(val as number);
        }}
        style={sliderStyle}
        readonly={readonly}
        disabled={readonly}
        marks={marks}
      />
    </div>
  );
};

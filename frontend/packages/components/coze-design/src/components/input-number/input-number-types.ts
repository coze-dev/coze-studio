import { type InputNumberProps as SemiInputNumberProps } from '@douyinfe/semi-ui/lib/es/inputNumber';

import { type IComponentBaseProps } from '@/typings';

export interface InputNumberProps
  extends IComponentBaseProps,
    Omit<SemiInputNumberProps, 'onChange' | 'onNumberCHange'> {
  error?: boolean;
  onChange?: (value: number | string) => void;
  onNumberChange?: (value: number) => void;
  size?: 'small' | 'default';
  sliderControl?: boolean;
}

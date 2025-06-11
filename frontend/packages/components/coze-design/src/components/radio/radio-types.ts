import {
  type RadioGroupProps as SemiRadioGroupProps,
  type RadioProps as SemiRadioProps,
} from '@douyinfe/semi-ui/lib/es/radio';

import { type IComponentBaseProps } from '@/typings';

export interface RadioProps extends IComponentBaseProps, SemiRadioProps {}

export interface RadioGroupProps
  extends IComponentBaseProps,
    SemiRadioGroupProps {}

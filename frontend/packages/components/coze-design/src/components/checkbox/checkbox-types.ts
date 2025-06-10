import {
  type CheckboxProps as SemiCheckboxProps,
  type CheckboxGroupProps as SemiCheckboxGroupProps,
} from '@douyinfe/semi-ui/lib/es/checkbox';

import { type IComponentBaseProps } from '@/typings';

export interface CheckboxProps extends SemiCheckboxProps, IComponentBaseProps {}

export interface CheckboxGroupProps
  extends IComponentBaseProps,
    SemiCheckboxGroupProps {}

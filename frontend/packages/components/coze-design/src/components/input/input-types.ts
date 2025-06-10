import { type InputProps as SemiInputProps } from '@douyinfe/semi-ui/lib/es/input';

import { type IComponentBaseProps } from '@/typings';

export interface InputProps
  extends IComponentBaseProps,
    Omit<SemiInputProps, 'loading' | 'error'> {
  loading?: boolean;
  error?: boolean;
}

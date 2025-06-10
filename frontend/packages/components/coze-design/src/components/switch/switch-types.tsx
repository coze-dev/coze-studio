import { type SwitchProps as SemiSwitchProps } from '@douyinfe/semi-ui/lib/es/switch';

import { type IComponentBaseProps } from '@/typings';

export type SwitchSize = 'default' | 'small' | 'mini';
export interface SwitchProps
  extends IComponentBaseProps,
    Omit<SemiSwitchProps, 'size'> {
  size?: SwitchSize;
}

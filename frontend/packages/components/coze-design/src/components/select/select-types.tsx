import { type SelectProps as SemiSelectProps } from '@douyinfe/semi-ui/lib/es/select';

import { type IComponentBaseProps } from '@/typings';

export type SelectSize = 'default' | 'small' | 'large';

export interface SelectProps
  extends IComponentBaseProps,
    Omit<SemiSelectProps, 'size'> {
  hasError?: boolean;
  /** large尺寸仅fornax使用 */
  size?: SelectSize;
  showTick?: boolean;
  chipRender?: 'trigger' | 'selectedItem';
}

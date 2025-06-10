import { type TimePickerProps as SemiTimePickerProps } from '@douyinfe/semi-ui/lib/es/timePicker';

import { type IComponentBaseProps } from '@/typings';

export interface TimePickerProps
  extends IComponentBaseProps,
    Omit<
      SemiTimePickerProps,
      'insetLabel' | 'size' | 'showClear' | 'clearIcon' | 'clearText'
    > {
  /** 是否展示prefix icon，默认为true*/
  showIcon?: boolean;
  /** 是否展示单位，默认为true*/
  showUnit?: boolean;
  /** large尺寸仅fornax使用 */
  size?: 'default' | 'small' | 'large';
}

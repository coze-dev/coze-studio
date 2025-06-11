import { type RadioGroupProps } from '@douyinfe/semi-ui/lib/es/radio';

import { type IComponentBaseProps } from '@/typings';

export interface SegmentTabProps
  extends IComponentBaseProps,
    Pick<
      RadioGroupProps,
      | 'options'
      | 'defaultValue'
      | 'className'
      | 'onChange'
      | 'value'
      | 'style'
      | 'disabled'
      | 'children'
    > {
  size?: 'default' | 'small';
}

import {
  type CascaderProps as SemiCascaderProps,
  type Value as SemiCascaderValue,
  type CascaderData as SemiCascaderData,
} from '@douyinfe/semi-ui/lib/es/cascader';

import { type IComponentBaseProps } from '@/typings';

export type CascaderSize = 'default' | 'small';

export interface CascaderProps
  extends IComponentBaseProps,
    Omit<SemiCascaderProps, 'size'> {
  hasError?: boolean;
  size?: CascaderSize;
}

export type CascaderValue = SemiCascaderValue;
export type CascaderData = SemiCascaderData;

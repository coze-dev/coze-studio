import { type IComponentBaseProps } from '@/typings';
import { type ProgressProps as SemiProgressProps } from '@/components/semi/types';

export interface ProgressProps
  extends IComponentBaseProps,
    Omit<SemiProgressProps, 'size' | 'type'> {
  size?: 'small' | 'default' | 'large';
  type?: 'circle' | 'line';
  stroke?: string;
  height?: number | string;
  width?: number;
  strokeWidth?: number;
}

import type { ReactNode } from 'react';

import { type EmptyProps as SemiEmptyProps } from '@douyinfe/semi-ui/lib/es/empty';

import { type IComponentBaseProps } from '@/typings';

import { type ButtonProps } from '../button';

export type EmptyStateSize = 'full_screen' | 'large' | 'default';

export interface EmptyStateProps
  extends IComponentBaseProps,
    Omit<SemiEmptyProps, 'image' | 'darkModeImage'> {
  icon?: ReactNode;
  darkModeIcon?: ReactNode;
  size?: EmptyStateSize;
  /** 按钮文案 不传则不展示按钮 */
  buttonText?: string;
  onButtonClick?: () => void;
  buttonProps?: ButtonProps;
  /** 更多元素 */
  extra?: ReactNode | string;
}

import type { ReactNode } from 'react';

import type { ButtonProps as SemiButtonProps } from '@douyinfe/semi-ui/lib/es/button';

import type {
  IComponentBaseProps,
  ComponentTone,
  ComponentRadius,
} from '@/typings';
import type { ToastProps } from '@/components/toast';

export type ButtonColor =
  | 'brand'
  | 'hgltplus'
  | 'highlight'
  | 'primary'
  | 'secondary'
  | 'red'
  | 'redhglt'
  | 'green'
  | 'yellow'
  | 'aiplus'
  | 'aihglt'
  | 'aiprimary';

export type ButtonRadius = ComponentRadius;

export type ButtonSize = 'default' | 'large' | 'small' | 'mini';

export type ButtonTone = ComponentTone;

export interface ButtonProps
  extends Omit<SemiButtonProps, 'size' | 'color' | 'iconSize'>,
    IComponentBaseProps {
  size?: ButtonSize;
  color?: ButtonColor;
  useSpinIcon?: boolean;
  children?: ReactNode;
  showBadge?: boolean;
  /** default为按钮颜色, unset为badge本身颜色（红色） */
  badgeColor?: 'default' | 'unset';
}

export interface IconButtonProps extends ButtonProps {
  wrapperClass?: string;
  iconSize?: 'small' | 'default' | 'large';
}

export interface AIButtonProps extends ButtonProps {
  iconClass?: string;
  iconSize?: 'small' | 'default' | 'large';
  onlyIcon?: boolean;
  hideIcon?: boolean;
}

export interface LoadingButtonProps extends ButtonProps {
  /** 加载中的 toast 文案 */
  loadingToast?: string | Omit<ToastProps, 'type'>;
}

export interface SplitButtonProps extends ButtonProps {
  wrapperClass?: string;
  onIconClick?: ButtonProps['onClick'];
}

import { type RefObject } from 'react';

import { type ModalReactProps as SemiModalReactProps } from '@douyinfe/semi-ui/lib/es/modal';

import { type IComponentBaseProps } from '@/typings';
import { type ButtonProps } from '@/components/button';

export type ModelTypes = 'dialog' | 'modal';

export type ModalSize =
  | 'default'
  | 'large'
  | 'xl'
  | 'xxl'
  | 'fill'
  | 'small'
  | 'medium'
  | 'full-width';
export type ModalHeight = 'fit-content' | 'fill' | number;

export interface ModalProps
  extends IComponentBaseProps,
    Omit<
      SemiModalReactProps,
      'okButtonProps' | 'cancelButtonProps' | 'size' | 'height'
    > {
  okButtonColor?: ButtonProps['color'];
  showCancelButton?: boolean;
  linearGradientMask?: boolean;
  okButtonClassName?: string;
  type?: ModelTypes;
  size?: ModalSize;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  height?: ModalHeight;
  autoLoading?: boolean;
  hasScroll?: boolean;
  scrollerYRef?: RefObject<HTMLDivElement>;
}

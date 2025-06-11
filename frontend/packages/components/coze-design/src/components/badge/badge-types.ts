import { type IComponentBaseProps } from '@/typings';
import { type BadgeProps as SemiBadgeProps } from '@/components/semi/types';

export interface BadgeProps
  extends IComponentBaseProps,
    Omit<SemiBadgeProps, 'type' | 'position'> {
  type?: 'mini' | 'default' | 'alt';
  position?: 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  /** 使用coz专属布局 */
  cozLayout?: boolean;
}

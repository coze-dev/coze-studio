import { type IComponentBaseProps } from '@/typings';
import type {
  AvatarProps as SemiAvatarProps,
  AvatarGroupProps as SemiSemiAvatarProps,
} from '@/components/semi/types';

export type AvatarColor =
  | 'blue'
  | 'cyan'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'grey'
  | 'red'
  | 'pink'
  | 'indigo';

export type AvatarSize =
  | 'ultra'
  | 'xxl'
  | 'xl'
  | 'lg'
  | 'plus'
  | 'default'
  | 'small'
  | 'mini'
  | 'micro';

export type AvatarType = 'bot' | 'platform' | 'person' | 'team';

export type Shape = 'circle' | 'square';

export interface AvatarProps
  extends Omit<SemiAvatarProps, 'color' | 'size' | 'hoverMask'>,
    IComponentBaseProps {
  color?: AvatarColor;
  size?: AvatarSize;
  type?: AvatarType;
  hoverMask?: boolean;
}

export interface AvatarGroupProps
  extends Omit<SemiSemiAvatarProps, 'size'>,
    IComponentBaseProps {
  className?: string;
  size?: 'small' | 'default' | 'medium' | 'large';
}

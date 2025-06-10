import { forwardRef } from 'react';

import { Avatar as SemiAvatar } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';
import { IconCozEdit } from '@/components/icon';

import { avatarVariant } from './avatar-variant';
import { type AvatarProps, type AvatarType, type Shape } from './avatar-types';
import AvatarGroup from './avatar-group';

import './index.css';

const defaultProps: Partial<AvatarProps> = {
  alt: '',
  hoverMask: false,
  color: 'blue',
  shape: 'square',
  type: 'person',
  size: 'default',
};

const AvatarComponent = forwardRef<SemiAvatar, AvatarProps>((props, ref) => {
  const {
    alt,
    color,
    size,
    type,
    shape,
    className,
    hoverMask,
    children,
    src,
    ...restProps
  } = mergeProps(props, defaultProps);

  const cls = cn(
    avatarVariant.base({
      color,
      size,
      type,
      src: !!src,
      hoverMask,
    }),
    className,
  );

  const renderShape = (avatarType: AvatarType | undefined): Shape => {
    if (avatarType === 'bot' || avatarType === 'platform') {
      return 'square';
    }
    return 'circle';
  };

  return (
    <SemiAvatar
      ref={ref}
      className={cls}
      color={color}
      alt={alt}
      src={src}
      shape={renderShape(type)}
      hoverMask={
        hoverMask ? (
          <div className="coz-avatar-editable-mask">
            <IconCozEdit className="coz-fg-white" />
          </div>
        ) : null
      }
      {...restProps}
    >
      {children}
    </SemiAvatar>
  );
});

AvatarComponent.displayName = 'Avatar';

export const Avatar = Object.assign(AvatarComponent, {
  AvatarGroup,
});

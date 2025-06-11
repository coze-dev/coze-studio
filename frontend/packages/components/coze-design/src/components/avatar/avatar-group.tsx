import { forwardRef, type JSX } from 'react';

import { AvatarGroup as SemiAvatarGroup } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type AvatarGroupProps } from './avatar-types';

const AvatarGroup = forwardRef<SemiAvatarGroup, AvatarGroupProps>(
  ({ children, className, size, ...restProps }, ref): JSX.Element => {
    const cls = cn('coz-avatar-group', className);
    return (
      <div className={cls}>
        <SemiAvatarGroup size={size} ref={ref} {...restProps}>
          {children}
        </SemiAvatarGroup>
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';

export default AvatarGroup;

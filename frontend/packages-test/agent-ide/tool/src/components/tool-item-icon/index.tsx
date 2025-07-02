import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';

export const ToolItemIcon: FC<PropsWithChildren & { size?: 'small' }> = ({
  children,
  size,
}) => (
  <div
    className={classNames('flex justify-center items-center cursor-pointer', {
      'w-[24px] h-[24px]': size !== 'small',
      'w-[16px] h-[16px]': size === 'small',
    })}
    onClick={e => e.stopPropagation()}
  >
    {children}
  </div>
);

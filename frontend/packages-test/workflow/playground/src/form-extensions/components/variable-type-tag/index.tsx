import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { type WithCustomStyle } from '@coze-workflow/base/types';

export const VariableTypeTag: FC<
  PropsWithChildren<
    WithCustomStyle<{
      size?: 'xs' | 'default';
    }>
  >
> = props => {
  const { children, className, size = 'default' } = props;
  return (
    <div
      className={classNames(
        {
          'py-[1px] px-[3px] ml-1 rounded-[4px] h-4': size === 'xs',
          'py-0.5 px-2 rounded-[6px] ml-2': size === 'default',
        },
        'shrink-0 flex items-center coz-mg-primary',
        className,
      )}
    >
      <span
        className={classNames(
          {
            'text-mini': size === 'xs',
            'text-xs': size === 'default',
          },
          'coz-fg-primary block',
        )}
      >
        {children}
      </span>
    </div>
  );
};

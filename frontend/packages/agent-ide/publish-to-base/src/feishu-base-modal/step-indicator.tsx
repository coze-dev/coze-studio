import { type CSSProperties, type FC } from 'react';

import classNames from 'classnames';

export const StepIndicator: FC<{
  number: number;
  className?: string;
  style?: CSSProperties;
}> = ({ number, className, style }) => (
  <div
    style={style}
    className={classNames(
      className,
      'coz-mg-hglt',
      'w-[20px]',
      'h-[20px]',
      'coz-fg-hglt',
      'text-[14px]',
      'font-medium',
      'flex',
      'items-center',
      'justify-center',
      'rounded-[50%]',
    )}
  >
    {number}
  </div>
);

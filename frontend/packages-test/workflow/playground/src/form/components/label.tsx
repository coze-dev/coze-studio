import { type PropsWithChildren } from 'react';

import { RequiredStar } from './required-star';
import { IconInfo } from './icon-info';

export interface LabelProps {
  className?: String;
  required?: Boolean;
  tooltip?: String | React.ReactNode;
  extra?: React.ReactNode;
}

export function Label({
  className,
  required = false,
  tooltip,
  extra,
  children,
}: PropsWithChildren<LabelProps>) {
  return (
    <div className={`flex gap-[4px] items-center ${className} h-[24px]`}>
      <div className="flex text-[12px]">
        {children}
        {required ? <RequiredStar /> : null}
      </div>

      {tooltip ? <IconInfo tooltip={tooltip} /> : null}
      {extra}
    </div>
  );
}

import React, { type FC } from 'react';

import { type TooltipProps } from '@/components/tooltip';

import { Text } from './text';

export interface NavProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  selectedIcon?: React.ReactNode;
  unselectedIcon?: React.ReactNode;
  text: string;
  selected?: boolean;
  onClick?: () => void;
  suffix?: React.ReactNode;
  tooltipOpts?: TooltipProps;
}
export const Nav: FC<NavProps> = props => {
  const {
    text,
    selected = false,
    selectedIcon = <></>,
    unselectedIcon = <></>,
    suffix,
    onClick,
    tooltipOpts,
    className,
  } = props;
  return (
    <div
      onClick={onClick}
      className={[
        'flex',
        'flex-row',
        'cursor-pointer',
        'items-center',
        'justify-between',
        'rounded-normal',
        'px-[8px]',
        'py-[6px]',
        'text-lg',
        'text-foreground-4',
        'w-full',
        'hover:bg-background-5',
        'active:bg-background-6',
        selected ? 'bg-background-4' : '',
        className,
      ].join(' ')}
    >
      <div className="flex flex-row gap-[8px] items-center flex-1 overflow-hidden">
        {selected ? selectedIcon : unselectedIcon}
        <div className="flex-1 overflow-hidden">
          <Text
            className="font-medium"
            tooltipOpts={{
              position: 'right',
              ...tooltipOpts,
            }}
          >
            {text}
          </Text>
        </div>
      </div>
      {typeof suffix === 'string' ? (
        <div className="font-base text-foreground-2">{suffix}</div>
      ) : (
        suffix ?? <></>
      )}
    </div>
  );
};

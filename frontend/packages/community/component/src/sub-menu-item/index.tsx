import { type FC, type ReactNode } from 'react';

import classNames from 'classnames';
import { Typography } from '@coze/coze-design';

export interface SubMenuItemProps {
  icon?: ReactNode;
  title?: string;
  activeIcon?: ReactNode;
  isActive: boolean;
  suffix?: ReactNode;
  onClick: () => void;
}

export const SubMenuItem: FC<SubMenuItemProps> = ({
  icon = null,
  title,
  activeIcon = null,
  isActive,
  suffix,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={classNames(
      'flex items-center gap-[8px]',
      'transition-colors',
      'rounded-[8px]',
      'h-[32px] w-full',
      'px-[8px]',
      'cursor-pointer',
      'hover:coz-mg-primary-hovered',
      isActive ? 'coz-bg-primary coz-fg-plus' : 'coz-fg-primary coz-bg-max',
    )}
  >
    <div className="text-[16px] leading-none leading-none w-[16px] h-[16px]">
      {isActive ? activeIcon : icon}
    </div>
    <Typography.Text
      ellipsis={{ showTooltip: true, rows: 1 }}
      fontSize="14px"
      weight={500}
      className="flex-1 text-[14px] leading-[20px] font-[500]"
    >
      {title}
    </Typography.Text>
    {suffix}
  </div>
);

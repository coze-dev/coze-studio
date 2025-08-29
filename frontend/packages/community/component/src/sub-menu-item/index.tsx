/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type FC, type ReactNode } from 'react';

import classNames from 'classnames';
import { Typography } from '@coze-arch/coze-design';

export interface SubMenuItemProps {
  icon?: ReactNode;
  title?: string;
  subText?: ReactNode;
  activeIcon?: ReactNode;
  isActive: boolean;
  suffix?: ReactNode;
  onClick: () => void;
  subNode?: Boolean;
}

export const SubMenuItem: FC<SubMenuItemProps> = ({
  icon = null,
  title,
  subText,
  activeIcon = null,
  isActive,
  suffix,
  onClick,
  subNode = false,
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
      'hover:coz-mg-secondary-hovered',
      isActive ? 'coz-bg-primary coz-fg-plus' : 'coz-fg-primary coz-bg-max',
    )}
  >
    <div className="text-[16px] leading-none leading-none w-[16px] h-[16px]">
      {isActive ? activeIcon : icon}
    </div>
    <Typography.Text
      ellipsis={{ showTooltip: true, rows: 1 }}
      weight={subNode ? 400 : 500}
      className={classNames(
        'flex-1 text-[14px] leading-[20px] ',
        isActive ? 'coz-fg-plus' : 'coz-fg-primary',
      )}
    >
      {title}
      {subText}
    </Typography.Text>
    {suffix}
  </div>
);

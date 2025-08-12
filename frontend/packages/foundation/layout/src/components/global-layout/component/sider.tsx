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

import { type FC } from 'react';

import classNames from 'classnames';
import { Divider, Space } from '@coze-arch/coze-design';
import { IconMenuLogo } from '@coze-arch/bot-icons';
import { useRouteConfig } from '@coze-arch/bot-hooks';

import { type LayoutProps } from '../types';
import { SubMenu } from './sub-menu';
import { GLobalLayoutMenuItem } from './menu-item';
import { GlobalLayoutActionBtn } from './action-btn';

const siderStyle = classNames(
  'relative',
  'h-full',
  'border-[1px] border-solid coz-stroke-primary rounded-[14px]',
  'coz-bg-max',
  'flex flex-row items-stretch',
);

const mainMenuStyle = classNames(
  'px-[6px] py-[16px]',
  'flex flex-col h-full items-center',
);

export const GlobalLayoutSider: FC<Omit<LayoutProps, 'hasSider'>> = ({
  actions,
  menus,
  extras,
  onClickLogo,
  footer = null,
}) => {
  const config = useRouteConfig();
  const { subMenu: SubMenuComponent } = config;
  const hasSubNav = Boolean(SubMenuComponent);

  return (
    <div className="pl-8px py-8px h-full">
      <div className={siderStyle}>
        {/* main navigation */}
        <div
          className={classNames(
            mainMenuStyle,
            hasSubNav &&
              'border-0 border-r-[1px] border-solid coz-stroke-primary',
          )}
        >
          <IconMenuLogo
            onClick={onClickLogo}
            className="cursor-pointer w-[40px] h-[40px]"
          />
          <div className="mt-[16px]">
            {actions?.map((action, index) => (
              <GlobalLayoutActionBtn {...action} key={index} />
            ))}
          </div>
          <Divider className="my-12px w-[24px]" />
          <Space spacing={4} vertical className="flex-1 overflow-auto">
            {menus?.map((menu, index) => (
              <GLobalLayoutMenuItem {...menu} key={index} />
            ))}
          </Space>
          <Space spacing={4} vertical className="mt-[12px]">
            {extras?.map((extra, index) => (
              <GlobalLayoutActionBtn {...extra} key={index} />
            ))}
            {footer}
          </Space>
        </div>
        {/* secondary navigation */}
        <SubMenu />
      </div>
    </div>
  );
};

GlobalLayoutSider.displayName = 'GlobalLayoutSider';

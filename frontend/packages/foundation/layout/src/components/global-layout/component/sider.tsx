import { type FC } from 'react';

import classNames from 'classnames';
import { Divider, Space } from '@coze-arch/coze-design';
import { IconMenuLogo } from '@coze-arch/bot-icons';
import { useRouteConfig } from '@coze-arch/bot-hooks';

import { type LayoutProps } from '../types';
import { SubMenu } from './sub-menu';
import { GLobalLayoutMenuItem } from './menu-item';
import { GlobalLayoutActionBtn } from './action-btn';
// import { GlobalLayoutAccountDropdown } from './account-dropdown';

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
        {/* 主导航 */}
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
        {/* 二级导航 */}
        <SubMenu />
      </div>
    </div>
  );
};

GlobalLayoutSider.displayName = 'GlobalLayoutSider';

/* eslint-disable @typescript-eslint/no-magic-numbers */
import React, { useMemo, type FC } from 'react';

import { Tooltip, type TooltipProps } from '@/components/tooltip';
import {
  IconCozPlug,
  IconCozChatHashtag,
  IconCozCoin,
  IconCozDiscordFill,
  IconCozHouse,
  IconCozTeam,
  IconCozTelegramFill,
} from '@/components/icon';
import { Avatar } from '@/components/avatar';

import { Nav } from '../side-nav/components/nav';
import { Divider } from '../side-nav/components/divider';

export interface SideNavProps extends TooltipProps {
  visible?: boolean;
  children?: React.ReactNode;
}

export const SideNavModal: FC<SideNavProps> = props => {
  const { children, className, ...rest } = props;

  const content = useMemo(
    () => (
      <div className="flex flex-col gap-[2px] w-[200px] h-[400px] overflow-y-auto">
        <Nav
          className="p-[8px]"
          unselectedIcon={<IconCozHouse className="text-xxl" />}
          text="Home"
        />
        <Tooltip
          showArrow={false}
          trigger="hover"
          position="rightTop"
          className={'p-[4px]'}
          spacing={12}
          content={
            <div className="flex flex-col gap-[2px] w-[200px]">
              <Nav
                className="p-[8px]"
                unselectedIcon={<IconCozDiscordFill className="text-xxl" />}
                text="Discord"
              />
              <Nav
                className="p-[8px]"
                unselectedIcon={<IconCozTelegramFill className="text-xxl" />}
                text="Telegram"
              />
            </div>
          }
        >
          <div>
            <Nav
              className="p-[8px]"
              unselectedIcon={<IconCozChatHashtag className="text-xxl" />}
              text="Community"
            />
          </div>
        </Tooltip>

        <div>
          <Divider></Divider>
        </div>

        {new Array(10)
          .fill('')
          .map((d, i) => `Team name${i + 1}`)
          .map(name => (
            <Nav
              className="p-[8px]"
              unselectedIcon={<IconCozTeam className="text-xxl" />}
              text={name}
              key={name}
            />
          ))}

        <div>
          <Divider></Divider>
        </div>

        <Nav
          className="p-[8px]"
          unselectedIcon={<IconCozPlug className="text-xxl" />}
          text="Coze API"
        />
        <Nav
          className="p-[8px]"
          unselectedIcon={<IconCozCoin className="text-xxl" />}
          text="Coze Token"
        />
        <Tooltip
          showArrow={false}
          trigger="hover"
          position="rightTop"
          className={'p-[4px]'}
          spacing={12}
          content={
            <div className="flex flex-col gap-[2px] w-[200px]">
              <Nav
                className="p-[8px]"
                unselectedIcon={<IconCozDiscordFill className="text-xxl" />}
                text="Discord"
              />
              <Nav
                className="p-[8px]"
                unselectedIcon={<IconCozTelegramFill className="text-xxl" />}
                text="Telegram"
              />
            </div>
          }
        >
          <div>
            <Nav
              className="p-[8px]"
              tooltipOpts={{ position: 'bottom' }}
              unselectedIcon={
                <Avatar
                  alt="coze"
                  size="xl"
                  src="https://placehold.co/460x460"
                />
              }
              text="bytedance@bytedance.com"
            />
          </div>
        </Tooltip>
      </div>
    ),
    [],
  );

  return (
    <Tooltip
      showArrow={false}
      className={`p-[4px] ${className}`}
      content={content}
      trigger="click"
      position="bottomLeft"
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

import { type FC } from 'react';

import { Tooltip } from '@/components/tooltip';
import {
  IconCozPlugFill,
  IconCozPlug,
  IconCozChatHashtag,
  IconCozChatPeople,
  IconCozCoinFill,
  IconCozCoin,
  IconCozDiscordFill,
  IconCozDocument,
  IconCozEnvelope,
  IconCozTelegramFill,
  IconCozXTwitterFill,
  IconCozYoutubeFill,
} from '@/components/icon';
import { Button } from '@/components/button';
import { Avatar } from '@/components/avatar';

import { Title } from './components/title';
import { Text } from './components/text';
import { NavType, Navs, type NavsProps } from './components/navs';
import { Nav } from './components/nav';
import { Divider } from './components/divider';

export interface SideNavProps {
  onSelect?: (key: string) => void;
  selected?: string;
}

const navSchema: NavsProps['schema'] = [
  {
    type: NavType.ITEM,
    props: {
      text: 'Coze API',
      selectedIcon: <IconCozPlugFill className="text-xxl" />,
      unselectedIcon: <IconCozPlug className="text-xxl" />,
    },
  },
  {
    type: NavType.ITEM,
    props: {
      text: 'Coze Token',
      selectedIcon: <IconCozCoinFill className="text-xxl" />,
      unselectedIcon: <IconCozCoin className="text-xxl" />,
      suffix: '9,999M',
    },
  },
];

export const SideNavFooter: FC<SideNavProps> = props => {
  const { onSelect, selected } = props;

  return (
    <div className={['flex', 'flex-col', 'w-full', 'gap-[8px]'].join(' ')}>
      {/* Team Space 下面横着的四个 icon */}
      <div className="flex px-[8px] justify-between text-foreground-3">
        <Tooltip content="Document" position="topRight">
          <Button
            className="bg-transparent hover:bg-background-5 active:bg-background-6 text-foreground-2"
            size="small"
            icon={<IconCozDocument className="text-lg" />}
          />
        </Tooltip>

        <Tooltip
          className="p-[4px]"
          content={
            <div className="flex flex-col gap-[2px]">
              <Title text="Join our communities" className="font-base" />
              <Nav
                unselectedIcon={<IconCozDiscordFill className="text-xxl" />}
                text="Discord"
              />
              <Nav
                unselectedIcon={<IconCozTelegramFill className="text-xxl" />}
                text="Telegram"
              />
            </div>
          }
          position="topRight"
        >
          <Button
            className="bg-transparent hover:bg-background-5 active:bg-background-6 text-foreground-2"
            size="small"
            icon={<IconCozChatHashtag className="text-lg" />}
          />
        </Tooltip>

        <Tooltip
          className="p-[4px]"
          content={
            <div className="flex flex-col gap-[2px]">
              <Title text="Follow us on social media" className="font-base" />
              <Nav
                unselectedIcon={<IconCozYoutubeFill className="text-xxl" />}
                text="YouTube Channel"
              />
              <Nav
                unselectedIcon={<IconCozXTwitterFill className="text-xxl" />}
                text="X"
              />
            </div>
          }
          position="top"
        >
          <Button
            className="bg-transparent hover:bg-background-5 active:bg-background-6 text-foreground-2"
            size="small"
            icon={<IconCozChatPeople className="text-lg" />}
          />
        </Tooltip>

        <Tooltip content="Feedback" position="top">
          <Button
            className="bg-transparent hover:bg-background-5 active:bg-background-6 text-foreground-2"
            size="small"
            icon={<IconCozEnvelope className="text-lg" />}
          />
        </Tooltip>
      </div>

      <Divider />

      {/* Coze API & Coze Token 入口 */}
      <Navs schema={navSchema} selected={selected} onSelect={onSelect} />

      {/* 用户信息 */}
      <div className="flex gap-[8px]">
        <Tooltip
          className="p-[4px]"
          content={
            <div className="flex flex-col gap-[2px]">
              <Nav text="Settings" />
              <Nav text="Logout" />
            </div>
          }
          position="topRight"
        >
          <Avatar
            className="cursor-pointer"
            alt="coze"
            size="small"
            src="https://placehold.co/460x460"
          />
        </Tooltip>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-lg text-foreground-4 leading-[20px] font-medium">
            Byte Dancer
          </span>
          <Text
            className="text-base text-foreground-2 leading-[16px]"
            tooltipOpts={{
              position: 'top',
            }}
          >
            bytedancer@bytedance.com
          </Text>
        </div>
      </div>
    </div>
  );
};

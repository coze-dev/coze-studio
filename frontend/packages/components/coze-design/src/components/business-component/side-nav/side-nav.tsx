import { useState, type FC } from 'react';

import {
  IconCozBotFill,
  IconCozBot,
  // IconCozCozeLogoWithZhText,
  IconCozHouseFill,
  IconCozHouse,
  IconCozPeopleFill,
  IconCozPeople,
  IconCozPlusFill,
  IconCozTeamFill,
  IconCozTeam,
} from '@/components/icon';
import { Button } from '@/components/button';

import { Scroll } from '../../common';
import { SideNavFooter } from './side-nav-footer';
import { Navs, NavType, type NavsProps } from './components/navs';

export interface SideNavProps {
  theme?: 'dark' | 'light';
}

const teams = [
  'Team Name1 long name long name long name long name long name',
  'Team Name22',
  'Team Name333',
  'Team Name4444',
  'Team Name55555',
  'Team Name666666',
  'Team Name7777777',
  'Team Name88888888',
  'Team Name999999999',
  'Team Name1000000000',
  'Team Name11',
  'Team Name12',
  'Team Name13',
  'Team Name14',
  'Team Name15',
  'Team Name16',
  'Team Name17',
];

const navSchema: NavsProps['schema'] = [
  {
    type: NavType.ITEM,
    props: {
      text: 'Home',
      selectedIcon: <IconCozHouseFill className="text-xxl" />,
      unselectedIcon: <IconCozHouse className="text-xxl" />,
    },
  },
  {
    type: NavType.ITEM,
    props: {
      text: 'Personal',
      selectedIcon: <IconCozPeopleFill className="text-xxl" />,
      unselectedIcon: <IconCozPeople className="text-xxl" />,
    },
  },
  {
    type: NavType.DIVIDER,
  },
  {
    type: NavType.TITLE,
    props: {
      text: 'Store',
    },
  },
  {
    type: NavType.ITEM,
    props: {
      text: 'Bot Store',
      selectedIcon: <IconCozBotFill className="text-xxl" />,
      unselectedIcon: <IconCozBot className="text-xxl" />,
    },
  },
  {
    type: NavType.ITEM,
    props: {
      text: 'Plugin Store',
      selectedIcon: <IconCozBotFill className="text-xxl" />,
      unselectedIcon: <IconCozBot className="text-xxl" />,
    },
  },
  {
    type: NavType.DIVIDER,
  },
  {
    type: NavType.TITLE,
    props: {
      text: 'Team Space',
      showAddButton: true,
    },
  },
  ...teams.map(team => ({
    type: NavType.ITEM,
    props: {
      text: team,
      selectedIcon: <IconCozTeamFill className="text-xxl" />,
      unselectedIcon: <IconCozTeam className="text-xxl" />,
    },
  })),
];

export const SideNav: FC<SideNavProps> = ({ theme }) => {
  const [selectedKey, setSelectedKey] = useState('Home');

  return (
    <div
      className={[
        'flex',
        'flex-col',
        'w-[208px]',
        'h-full',
        'rounded-normal',
        'bg-background-2',
        'px-[8px]',
        'py-[16px]',
        'gap-[16px]',
      ].join(' ')}
    >
      {/* logo 区域 */}
      <div className="flex">
        {/* <CozeLogoWithZhTextIcon height={36} width={90} /> */}
      </div>
      {/* 创建 bot 按钮 */}
      <Button>
        <div className="flex items-center">
          <IconCozPlusFill className="text-xxl pr-[6px]" />
          <span>Create Bot</span>
        </div>
      </Button>
      {/* 页面导航菜单 */}
      <div className={['flex-1', 'overflow-hidden'].join(' ')}>
        <Scroll>
          <Navs
            schema={navSchema}
            selected={selectedKey}
            onSelect={key => {
              setSelectedKey(key);
            }}
          />
        </Scroll>
      </div>
      {/* 底部 */}
      <SideNavFooter
        selected={selectedKey}
        onSelect={key => {
          setSelectedKey(key);
        }}
      />
    </div>
  );
};

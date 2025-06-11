/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type FC } from 'react';

import { Input } from '@/components/input';
import {
  IconCozLoading,
  IconCozHouse,
  IconCozMagnifier,
  IconCozPlusFill,
} from '@/components/icon';
import { Button } from '@/components/button';

import { Scroll } from '../../common';
import { Title } from './components/title';
import { Nav } from './components/nav';
import { Divider } from './components/divider';

export const SideNavInModal: FC = props => (
  <div className="flex flex-col gap-[2px] w-[200px] pt-[16px] px-[8px] bg-background-3">
    <h1 className="px-[8px] text-[20px] font-medium">Modal Title</h1>
    <Input
      placeholder="Search"
      className="my-[16px]"
      prefix={
        <div className="text-foreground-4">
          <IconCozMagnifier className="text-lg" />
        </div>
      }
    ></Input>
    {/* 创建 bot 按钮 */}
    <Button className="mb-[16px]">
      <div className="flex items-center">
        <IconCozPlusFill className="text-xxl pr-[6px]" />
        <span>Create Bot</span>
      </div>
    </Button>

    <Nav
      unselectedIcon={<IconCozHouse className="text-xxl" />}
      text="My Tools"
    />
    <Nav
      unselectedIcon={<IconCozHouse className="text-xxl" />}
      text="Favorite"
    />

    <div className="my-[8px]">
      <Divider></Divider>
    </div>

    <div className="flex-1 overflow-hidden">
      <Scroll
        lightColor="rgba(var(--coze-bg-3), 0)"
        darkColor="rgba(var(--coze-bg-3), 1)"
      >
        <Title
          text="Subtitle"
          suffix={<IconCozLoading className="text-xxl" />}
        />
        <Nav
          unselectedIcon={<IconCozHouse className="text-xxl" />}
          text="Bots"
        />
        <Nav
          unselectedIcon={<IconCozHouse className="text-xxl" />}
          text="Plugins"
        />

        <div className="my-[8px]">
          <Divider></Divider>
        </div>

        <Title
          text="Subtitle"
          suffix={<IconCozLoading className="text-xxl" />}
        />
        <div className="flex flex-col gap-[2px]">
          {new Array(10)
            .fill('')
            .map((d, i) => `Plugin-${i + 1}`)
            .map(name => (
              <Nav
                unselectedIcon={<IconCozHouse className="text-xxl" />}
                key={name}
                text={name}
              />
            ))}
        </div>
      </Scroll>
    </div>
  </div>
);

import { useState } from 'react';

import { type Meta } from '@storybook/react';

import { View } from '@/components/view';
import { Tag } from '@/components/tag';
import { IconCozLoading } from '@/components/icon';

import { BotCard } from '../top-nav/bot-card';
import { TopNav } from '../top-nav';
import { SideNavInModal } from '../side-nav/side-nav-in-modal';
import { SideNav } from '../side-nav/side-nav';
const meta: Meta = {
  title: 'Business/Component',
  tags: ['autodocs'],
  component: SideNav,
};

export default meta;

export const Default = args => (
  <View prop="variant" value="default">
    一些 coze design 组件的使用示例
  </View>
);

export const SideNavDemo = args => (
  <View prop="variant" value="default">
    <div className="w-full !h-[600px] flex flex-row border">
      <SideNav {...args} />
      <div className="h-full flex-1 flex justify-center items-center text-[56px] font-extrabold">
        <div>Welcome to Coze</div>
      </div>
    </div>
  </View>
);

export const SideNavInModalDemo = args => (
  <View prop="variant" value="default">
    <div className="!w-[800px] !h-[600px] flex flex-row border rounded-md overflow-hidden">
      <SideNavInModal />
      <div className="h-full flex-1 flex justify-center items-center text-[22px] font-extrabold bg-background-1">
        请把我当做 modal
      </div>
    </div>
  </View>
);

export const TopNavBackType = args => (
  <View prop="variant" value="default">
    <div className="w-full flex flex-col gap-[8px]">
      <div>按钮返回</div>
      <div className="border">
        <TopNav />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[24px]">
      <div>面包屑返回</div>
      <div className="border">
        <TopNav backType="breadcrumb" />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>
  </View>
);

export const TopNavCompact = args => (
  <View prop="variant" value="default">
    <div className="w-full flex flex-col gap-[8px]">
      <div>isCompact: false</div>
      <div className="border">
        <TopNav />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[24px]">
      <div>isCompact: true</div>
      <div className="border">
        <TopNav isCompact />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>
  </View>
);

export const TopNavCustomContent = args => (
  <View prop="variant" value="default">
    <div className="w-full flex flex-col gap-[8px]">
      <div>isCompact: true + content</div>
      <div className="border">
        <TopNav
          isCompact
          content={
            <div className="flex justify-center items-center gap-[12px] text-[20px]">
              <div className="cursor-pointer">Tabname</div>
              <div className="text-foreground-3 cursor-pointer">Tabname</div>
            </div>
          }
        />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[24px]">
      <div>isCompact: false + content</div>
      <div className="border">
        <TopNav
          content={
            <div className="flex justify-center items-center gap-[12px] text-[20px]">
              <div className="cursor-pointer">Tabname</div>
              <div className="text-foreground-3 cursor-pointer">Tabname</div>
            </div>
          }
        />
        <div className="h-[300px] flex-1 flex justify-center items-center text-[56px] font-extrabold">
          <div>Welcome to Coze</div>
        </div>
      </div>
    </div>
  </View>
);

export const TopNavHighLightBorderBottom = args => {
  const [scrollTop, setScrollTop] = useState(0);
  return (
    <View prop="variant" value="default">
      <div className="w-full flex flex-col gap-[8px]">
        <div>当内容区滚动时，顶导航底部高亮</div>
        <div className="border">
          <TopNav
            isCompact
            content={
              <div className="flex justify-center items-center gap-[12px] text-[20px]">
                <div className="cursor-pointer">Tabname</div>
                <div className="text-foreground-3 cursor-pointer">Tabname</div>
              </div>
            }
            highLightBorderBottom={scrollTop > 0}
          />
          <div
            className="h-[600px] overflow-y-scroll"
            onScroll={e => {
              const _scrollY = (e.target as HTMLElement)?.scrollTop;
              setScrollTop(_scrollY);
            }}
          >
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
            <div className="h-[300px] w-full text-[56px] font-extrabold flex justify-center items-center">
              Welcome to Coze
            </div>
          </div>
        </div>
      </div>
    </View>
  );
};

export const TopNavBotCard = args => (
  <View prop="variant" value="default">
    <div className="w-full flex flex-col gap-[8px]">
      <div>非紧凑 + footer</div>
      <div className="border p-[16px]">
        <BotCard
          isCompact={false}
          name={'Bot Gallery'}
          footer={
            <div className="flex gap-[8px]">
              <Tag
                size="mini"
                prefixIcon={<IconCozLoading className="text-[10px]" />}
              >
                Tagtag
              </Tag>
              <Tag
                size="mini"
                color="primary"
                prefixIcon={<IconCozLoading className="text-[10px]" />}
              >
                Tagtag
              </Tag>
              <div className="text-base">Auto-saved 17:06:34</div>
            </div>
          }
        />
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[16px]">
      <div>非紧凑 + 无 footer</div>
      <div className="border p-[16px]">
        <BotCard name={'Bot Gallery'} isCompact={false} />
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[16px]">
      <div>紧凑 + footer</div>
      <div className="border p-[16px]">
        <BotCard
          name={'Bot Gallery'}
          isCompact
          footer={
            <div className="flex gap-[8px]">
              <Tag
                size="mini"
                prefixIcon={<IconCozLoading className="text-[10px]" />}
              >
                Tagtag
              </Tag>
              <Tag
                size="mini"
                color="primary"
                prefixIcon={<IconCozLoading className="text-[10px]" />}
              >
                Tagtag
              </Tag>
              <div className="text-base">Auto-saved 17:06:34</div>
            </div>
          }
        />
      </div>
    </div>

    <div className="w-full flex flex-col gap-[8px] mt-[16px]">
      <div>紧凑 + 无 footer</div>
      <div className="border p-[16px]">
        <BotCard name={'Bot Gallery'} isCompact />
      </div>
    </div>
  </View>
);

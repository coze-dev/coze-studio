import { useState } from 'react';

import { type StoryFn as Story, type Meta } from '@storybook/react';

import { View, EnhancedView } from '@/components/view';
import { Badge } from '@/components/semi';

import { TabBar, type TabsTopProps } from '..';

const meta: Meta = {
  title: 'Components/TabBar',
  component: TabBar,
  tags: [''],
  argTypes: {
    mode: {
      options: ['tab', 'select'],
      control: { type: 'select' },
    },
    type: {
      options: ['button', 'text'],
      control: { type: 'select' },
    },
    align: {
      options: ['left', 'center', 'right'],
      control: { type: 'select' },
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

const { TabPanel } = TabBar;

const defaultProps: TabsTopProps = {
  mode: 'tab',
  type: 'button',
  align: 'left',
};

export const Default: Story<TabsTopProps> = args => (
  <EnhancedView prop="default">
    <TabBar {...args}>
      <TabPanel tab="效率工具" itemKey="1">
        效率工具内容
      </TabPanel>
      <TabPanel tab="商务服务" itemKey="2">
        商务服务内容
      </TabPanel>
      <TabPanel tab="文本创作" itemKey="3">
        文本创作内容
      </TabPanel>
      <TabPanel tab="学习教育" itemKey="4">
        学习教育内容
      </TabPanel>
      <TabPanel tab="代码助手" itemKey="5">
        代码助手内容
      </TabPanel>
      <TabPanel tab="生活方式" itemKey="6">
        生活方式内容
      </TabPanel>
    </TabBar>
  </EnhancedView>
);

Default.args = {
  ...defaultProps,
};

export const Tab: Story<TabsTopProps> = args => (
  <View prop="mode" value={args.mode} justify="start">
    <TabBar {...args}>
      <TabPanel tab="我的" itemKey="tab1">
        我的
      </TabPanel>
      <TabPanel tab="插件" itemKey="tab2">
        插件
      </TabPanel>
      <TabPanel tab="工作流" itemKey="tab3">
        工作流
      </TabPanel>
      <TabPanel tab="图像流" itemKey="tab4">
        图像流
      </TabPanel>
      <TabPanel tab="知识库" itemKey="tab5">
        知识库
      </TabPanel>
      <TabPanel tab="卡片" itemKey="tab6">
        卡片
      </TabPanel>
      <TabPanel
        tab={
          <div className="relative">
            <Badge type="success" count="beta" style={{ right: -6, top: -6 }}>
              <span>社会场景</span>
            </Badge>
          </div>
        }
        itemKey="7"
      >
        社会场景
      </TabPanel>
    </TabBar>
  </View>
);

Tab.args = {
  ...defaultProps,
  mode: 'tab',
};

export const Select: Story<TabsTopProps> = args => {
  const [tabKey, setTabKey] = useState('效率工具');
  const handleOnClick = (key: string) => {
    setTabKey(key);
  };
  return (
    <View prop="mode" value="select" justify="start">
      <div className="block">
        <TabBar
          type="button"
          mode="select"
          activeKey={tabKey}
          defaultActiveKey="效率工具"
          onTabClick={handleOnClick}
        >
          <TabPanel tab="效率工具" itemKey="效率工具" />
          <TabPanel tab="商务服务" itemKey="商务服务" />
          <TabPanel tab="文本创作" itemKey="文本创作" />
          <TabPanel tab="学习教育" itemKey="学习教育" />
          <TabPanel tab="代码助手" itemKey="代码助手" />
          <TabPanel tab="生活方式" itemKey="生活方式" />
        </TabBar>
        <div className="flex py-8px">
          <div className="coz-fg-primary text-lg">已选中: {tabKey}</div>
        </div>
      </div>
    </View>
  );
};

Select.args = {
  ...defaultProps,
  mode: 'select',
};

export const Type: Story<TabsTopProps> = args => (
  <View prop="type" value={args.type} justify="start">
    <TabBar align="left" {...args}>
      <TabPanel tab="我的" itemKey="1">
        我的
      </TabPanel>
      <TabPanel tab="插件" itemKey="2">
        插件
      </TabPanel>
      <TabPanel tab="工作流" itemKey="3">
        工作流
      </TabPanel>
      <TabPanel tab="图像流" itemKey="4">
        图像流
      </TabPanel>
      <TabPanel tab="知识库" itemKey="5">
        知识库
      </TabPanel>
      <TabPanel tab="卡片" itemKey="6">
        卡片
      </TabPanel>
      <TabPanel
        tab={
          <div className="relative">
            <Badge type="success" count="beta" style={{ right: -6, top: -6 }}>
              <span>社会场景</span>
            </Badge>
          </div>
        }
        itemKey="7"
      >
        社会场景
      </TabPanel>
    </TabBar>
  </View>
);

Type.args = {
  ...defaultProps,
  type: 'text',
};

export const Align: Story<TabsTopProps> = args => (
  <View prop="align" value={args.align} justify="start">
    <div className="block w-full">
      <TabBar {...args}>
        <TabPanel tab="我的" itemKey="1">
          我的
        </TabPanel>
        <TabPanel tab="插件" itemKey="2">
          插件
        </TabPanel>
        <TabPanel tab="工作流" itemKey="3">
          工作流
        </TabPanel>
        <TabPanel tab="图像流" itemKey="4">
          图像流
        </TabPanel>
        <TabPanel tab="知识库" itemKey="5">
          知识库
        </TabPanel>
        <TabPanel tab="卡片" itemKey="6">
          卡片
        </TabPanel>
        <TabPanel
          tab={
            <div className="relative">
              <Badge type="success" count="beta" style={{ right: -6, top: -6 }}>
                <span>社会场景</span>
              </Badge>
            </div>
          }
          itemKey="7"
        >
          社会场景
        </TabPanel>
      </TabBar>
    </div>
  </View>
);

Align.args = {
  ...defaultProps,
  align: 'left',
};

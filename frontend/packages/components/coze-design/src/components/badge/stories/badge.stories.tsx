/* eslint-disable @coze-arch/max-line-per-function */
import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';
import { TabBar } from '@/components/tab-bar';
import { SegmentTab } from '@/components/segment-tab';
import {
  IconCozFireFill,
  IconCozMicrophone,
  IconCozPeopleFill,
} from '@/components/icon';
import { AIButton, Button, IconButton } from '@/components/button';
import { Avatar } from '@/components/avatar';

import { Badge, type BadgeProps } from '../index';

const defaultSrc = 'https://placehold.co/460x460';

const meta: Meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: [''],
  argTypes: {
    count: {
      options: '',
      control: { type: 'number' },
    },
    type: {
      options: ['default', 'mini', 'alt'],
      control: { type: 'select' },
    },
    position: {
      options: ['leftTop', 'leftBottom', 'rightTop', 'rightBottom'],
      control: { type: 'select' },
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
} satisfies Meta<typeof Badge>;

export default meta;

const defaultProps = {
  count: 33,
  position: 'rightTop',
} satisfies BadgeProps;

export const Default: Story<BadgeProps> = args => (
  <EnhancedView>
    <View prop="variant" value="count">
      <div className="flex flex-row gap-2">
        <div className="flex px-6px">
          <Badge {...args}>
            <Avatar color="orange" type="bot" size="lg">
              BD
            </Avatar>
          </Badge>
        </div>
        <div className="flex px-6px">
          <Badge {...args} count="beta">
            <Avatar color="green" type="bot" size="lg">
              BD
            </Avatar>
          </Badge>
        </div>
        <div className="flex px-6px">
          <Badge {...args} count={1000} overflowCount={999}>
            <Avatar color="orange" type="bot" size="lg" src={defaultSrc}>
              BD
            </Avatar>
          </Badge>
        </div>
      </div>
    </View>
  </EnhancedView>
);

Default.args = {
  ...defaultProps,
};

export const Type: Story<BadgeProps> = args => (
  <ViewGroup>
    <View prop="type" value="default" justify="center">
      <Badge {...args} type="default" countStyle={{ right: 2, top: 2 }}>
        <Avatar color="green" type="bot" size="lg" src={defaultSrc}>
          BD
        </Avatar>
      </Badge>
    </View>
    <View prop="type" value="alt" justify="center">
      <Badge
        {...args}
        type="alt"
        countStyle={{ right: 2, top: 2 }}
        count="beta"
      >
        <AIButton color="aihglt">Bot竞技场</AIButton>
      </Badge>
    </View>
    <View prop="type" value="mini" justify="center">
      <Badge {...args} type="mini" countStyle={{ right: 8, top: 4 }}>
        <Avatar color="indigo" type="person" size="lg">
          BD
        </Avatar>
      </Badge>
    </View>
  </ViewGroup>
);

Type.args = {
  ...defaultProps,
  count: '666',
};

export const Count: Story<BadgeProps> = args => (
  <View prop="variant" value="count" justify="start">
    <div className="flex flex-row gap-8">
      <div className="inline-flex px-6px relative">
        <Badge
          {...args}
          type="default"
          countStyle={{ right: 2, top: 2 }}
          count="beta"
        >
          <Avatar color="orange" type="bot" size="lg">
            BD
          </Avatar>
        </Badge>
      </div>
      <div className="inline-flex px-6px relative">
        <Badge
          {...args}
          countStyle={{ right: 2, top: 2 }}
          count={1000}
          overflowCount={999}
        >
          <Avatar color="orange" type="bot" size="lg">
            BD
          </Avatar>
        </Badge>
      </div>
    </div>
  </View>
);

Count.args = {
  ...defaultProps,
};

export const Position: Story<BadgeProps> = args => (
  <View prop="variant" value="position" justify="start">
    <div className="flex flex-row gap-8">
      <div className="inline-flex px-6px relative">
        <Badge {...args} countStyle={{ right: 8, top: 6 }} position="rightTop">
          <Avatar color="green" type="person" size="lg" src={defaultSrc}>
            BD
          </Avatar>
        </Badge>
      </div>
      <div className="inline-flex px-6px relative">
        <Badge
          {...args}
          countStyle={{ right: 8, bottom: 6 }}
          position="rightBottom"
        >
          <Avatar color="green" type="person" size="lg" src={defaultSrc}>
            BD
          </Avatar>
        </Badge>
      </div>
    </div>
  </View>
);

Position.args = {
  ...defaultProps,
  type: 'mini',
};

export const Icon: Story<BadgeProps> = args => (
  <View prop="variant" value="icon" justify="start">
    <div className="inline-flex px-6px relative">
      <Badge
        {...args}
        count={<IconCozFireFill className="coz-fg-hglt-red text-20px" />}
        countStyle={{ top: -3, right: 8 }}
      >
        <Avatar color="purple" type="person" size="lg" src={defaultSrc}>
          BD
        </Avatar>
      </Badge>
    </div>
  </View>
);

Icon.args = {
  ...defaultProps,
};

export const Custom: Story<BadgeProps> = args => (
  <View prop="variant" value="custom" justify="start">
    <div className="flex flex-row gap-6">
      <div className="inline-flex px-6px relative">
        <Badge {...args} />
      </div>
      <div className="inline-flex px-6px relative">
        <Badge {...args} count="beta" type="alt" />
      </div>
      <div className="inline-flex px-6px relative">
        <span>
          <Badge
            type="mini"
            countStyle={{ backgroundColor: 'var(--coz-fg-hglt-green)' }}
          />
        </span>
      </div>
    </div>
  </View>
);

Custom.args = {
  ...defaultProps,
};

export const WithButton: Story<BadgeProps> = args => (
  <div>
    <View prop="variant" value="TabBar" justify="start">
      <TabBar mode="tab">
        <TabBar.TabPanel tab="我的" itemKey="tab1">
          我的
        </TabBar.TabPanel>
        <TabBar.TabPanel
          tab={
            <div className="flex items-center">
              <span>插件</span> <Badge cozLayout count={99} />
            </div>
          }
          itemKey="2"
        >
          插件
        </TabBar.TabPanel>
      </TabBar>
    </View>

    <View prop="variant" value="SegmentTag" justify="start">
      <SegmentTab defaultValue={1} style={{ width: 300 }}>
        <SegmentTab.Tab value={1}>123</SegmentTab.Tab>
        <SegmentTab.Tab value={2}>
          <div className="flex items-center justify-center">
            123
            <Badge type="default" cozLayout count={99}></Badge>
          </div>
        </SegmentTab.Tab>
      </SegmentTab>

      <SegmentTab defaultValue={1}>
        <SegmentTab.Tab value={1}>123</SegmentTab.Tab>
        <SegmentTab.Tab value={2}>
          <div className="flex items-center justify-center">
            123
            <Badge type="mini" cozLayout></Badge>
          </div>
        </SegmentTab.Tab>
      </SegmentTab>
    </View>

    <View prop="variant" value="Button" justify="start">
      <div className="flex flex-col space-y-8">
        <div className="flex space-x-5">
          <Button icon={<IconCozPeopleFill />} size="large" showBadge={true}>
            Button
          </Button>

          <Button icon={<IconCozPeopleFill />} showBadge={true}>
            Button
          </Button>

          <Button icon={<IconCozPeopleFill />} size="small" showBadge={true}>
            Button
          </Button>

          <Button
            icon={<IconCozPeopleFill />}
            size="small"
            badgeColor="unset"
            showBadge={true}
            color="hgltplus"
          >
            Button
          </Button>

          <Button
            icon={<IconCozPeopleFill />}
            size="small"
            showBadge={true}
            color="highlight"
          >
            Button
          </Button>

          <Button
            icon={<IconCozPeopleFill />}
            size="small"
            showBadge={true}
            color="primary"
          >
            Button
          </Button>

          <Button
            icon={<IconCozPeopleFill />}
            size="small"
            showBadge={true}
            color="secondary"
          >
            Button
          </Button>
        </div>
        <div className="flex space-x-5">
          <span>size large: </span>

          <Badge type="mini">
            <IconButton size="large" icon={<IconCozMicrophone />} />
          </Badge>
          <Badge count={9}>
            <IconButton size="large" icon={<IconCozMicrophone />} />
          </Badge>

          <Badge type="mini">
            <IconButton
              size="large"
              icon={<IconCozMicrophone />}
              color="secondary"
            />
          </Badge>
          <Badge count={9}>
            <IconButton
              size="large"
              icon={<IconCozMicrophone />}
              color="secondary"
            />
          </Badge>
        </div>

        <div className="flex space-x-5">
          <span>size default: </span>
          <Badge type="mini">
            <IconButton icon={<IconCozMicrophone />} />
          </Badge>

          <Badge count={9}>
            <IconButton icon={<IconCozMicrophone />} />
          </Badge>

          <Badge type="mini">
            <IconButton icon={<IconCozMicrophone />} color="secondary" />
          </Badge>
          <Badge count={9}>
            <IconButton icon={<IconCozMicrophone />} color="secondary" />
          </Badge>
        </div>

        <div className="flex space-x-5">
          <span>size small: </span>
          <Badge type="mini">
            <IconButton size="small" icon={<IconCozMicrophone />} />
          </Badge>
          <Badge count={9}>
            <IconButton size="small" icon={<IconCozMicrophone />} />
          </Badge>

          <Badge type="mini">
            <IconButton
              size="small"
              icon={<IconCozMicrophone />}
              color="secondary"
            />
          </Badge>
          <Badge count={9}>
            <IconButton
              size="small"
              icon={<IconCozMicrophone />}
              color="secondary"
            />
          </Badge>
        </div>
      </div>
    </View>
  </div>
);

WithButton.args = {
  ...defaultProps,
};

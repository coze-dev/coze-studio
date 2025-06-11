import { type Meta, type StoryFn } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';
import {
  IconCozPeopleFill,
  IconCozAnalytics,
  IconCozMore,
} from '@/components/icon';

import {
  Avatar,
  type AvatarColor,
  type AvatarProps,
  type AvatarGroupProps,
  type AvatarSize,
  type AvatarType,
} from '..';

const { AvatarGroup } = Avatar;

const colors: AvatarColor[] = [
  'grey',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'red',
  'pink',
  'indigo',
];

const sizes: AvatarSize[] = [
  'ultra',
  'xxl',
  'xl',
  'lg',
  'plus',
  'default',
  'small',
  'mini',
  'micro',
];

const types: AvatarType[] = ['bot', 'person', 'platform', 'team'];

const defaultSrc = 'https://placehold.co/460x460?text=placeholder-1';

const group = [
  'https://placehold.co/460x460?text=placeholder-1',
  'https://placehold.co/460x460?text=placeholder-2',
  'https://placehold.co/460x460?text=placeholder-3',
];

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: [''],
  argTypes: {
    color: {
      options: colors,
      control: { type: 'select' },
    },
    type: {
      options: types,
      control: { type: 'select' },
    },
    src: {
      options: group,
      control: { type: 'select' },
    },
    size: {
      options: sizes,
      control: { type: 'select' },
    },
    hoverMask: {
      options: [true, false],
      control: { type: 'boolean' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

const defaultProps = {
  size: 'lg',
  alt: 'COZAvatar',
  type: 'person',
  color: 'blue',
  hoverMask: false,
} satisfies AvatarProps;

export const Default: StoryFn<AvatarProps> = args => (
  <EnhancedView>
    <Avatar {...args}>COZAvatar</Avatar>
  </EnhancedView>
);

Default.args = {
  ...defaultProps,
  src: defaultSrc,
};

export const Size: StoryFn<AvatarProps> = args => (
  <ViewGroup>
    <View prop="variant" value="size">
      <div className="flex space-x-6">
        <div className="flex flex-col items-center">
          <Avatar {...args} size="micro">
            micro
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="mini">
            mini
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="small">
            small
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="default">
            default
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="plus">
            plus
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="lg">
            lg
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="xl">
            xl
          </Avatar>
        </div>
        <div className="flex flex-col items-center">
          <Avatar {...args} size="xxl">
            xxl
          </Avatar>
        </div>
      </div>
    </View>
  </ViewGroup>
);

Size.args = {
  ...defaultProps,
};

export const HoverMask: StoryFn<AvatarProps> = args => (
  <View prop="variant" value="hoverMask">
    <div className="flex space-x-6">
      <div className="flex flex-col items-center">
        <Avatar
          {...args}
          onClick={() => {
            console.log('click avatar');
          }}
        >
          COZE
        </Avatar>
      </div>
      <div className="flex flex-col items-center">
        <Avatar
          {...args}
          src={defaultSrc}
          type="platform"
          onMouseLeave={() => {
            console.log('mouse leave');
          }}
        >
          COZE
        </Avatar>
      </div>
    </div>
  </View>
);

HoverMask.args = {
  ...defaultProps,
  hoverMask: true,
};

export const Color: StoryFn<AvatarProps> = args => (
  <View prop="variant" value="color">
    <div className="flex space-x-6">
      <div className="flex flex-col items-center">
        <Avatar {...args} type="person" color="blue">
          张
        </Avatar>
        <div className="coz-fg-color-brand text-lg">blue</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="team" color="red">
          <IconCozPeopleFill />
        </Avatar>
        <div className="coz-fg-hglt-red text-lg">red</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="team" color="purple">
          <IconCozAnalytics />
        </Avatar>
        <div className="coz-fg-hglt-purple text-lg">cyan</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="person" color="grey">
          99+
        </Avatar>
        <div className="coz-fg-secondary text-lg">grey</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="person" color="cyan">
          <IconCozMore />
        </Avatar>
        <div className="coz-fg-color-cyan text-lg">cyan</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="bot" color="green">
          张豆
        </Avatar>
        <div className="coz-fg-hglt-green text-lg">green</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="bot" color="orange">
          John Doe
        </Avatar>
        <div className="coz-fg-color-orange text-lg">orange</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="bot" color="yellow">
          U
        </Avatar>
        <div className="coz-fg-color-yellow text-lg">yellow</div>
      </div>
    </div>
  </View>
);

Color.args = {
  ...defaultProps,
  size: 'lg',
};

export const Type: StoryFn<AvatarProps> = args => (
  <View prop="variant" value="type">
    <div className="flex space-x-6">
      <div className="flex flex-col items-center">
        <Avatar {...args} type="person" src={group[0]}>
          COZE
        </Avatar>
        <div className="coz-fg-primary text-lg">person</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="team" src={group[1]}>
          COZE
        </Avatar>
        <div className="coz-fg-primary text-lg">team</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="bot" src={group[2]}>
          COZE
        </Avatar>
        <div className="coz-fg-primary text-lg">bot</div>
      </div>
      <div className="flex flex-col items-center">
        <Avatar {...args} type="bot" src={defaultSrc}>
          COZE
        </Avatar>
        <div className="coz-fg-primary text-lg">platform</div>
      </div>
    </div>
  </View>
);

Type.args = {
  ...defaultProps,
};

export const Group: StoryFn<AvatarGroupProps> = args => (
  <ViewGroup>
    <View prop="overlapFrom" value="start" {...args}>
      <div className="flex space-x-6">
        <div>
          <AvatarGroup overlapFrom={'start'} size="default">
            <Avatar color="red" alt="Lisa LeBlanc">
              LL
            </Avatar>
            <Avatar alt="Caroline Xiao">CX</Avatar>
            <Avatar color="orange" alt="Rafal Matin">
              RM
            </Avatar>
            <Avatar
              style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
              alt="Zank Lance"
            >
              ZL
            </Avatar>
            <Avatar style={{ backgroundColor: '#87d068' }} alt="Youself Zhang">
              YZ
            </Avatar>
          </AvatarGroup>
        </div>
      </div>
    </View>
    <View prop="overlapFrom" value="end" {...args}>
      <div className="flex space-x-6">
        <div className="flex flex-col">
          <AvatarGroup overlapFrom={'end'} size="medium" maxCount={3}>
            <Avatar color="red" alt="Lisa LeBlanc">
              LL
            </Avatar>
            <Avatar alt="Caroline Xiao" color="pink">
              CX
            </Avatar>
            <Avatar color="orange" alt="Rafal Matin">
              RM
            </Avatar>
            <Avatar
              style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
              alt="Zank Lance"
            >
              ZL
            </Avatar>
            <Avatar style={{ backgroundColor: '#87d068' }} alt="Youself Zhang">
              YZ
            </Avatar>
          </AvatarGroup>
        </div>
      </div>
    </View>

    <View prop="overlapFrom" value="end" {...args}>
      <div className="flex space-x-6">
        <div className="flex flex-col">
          <AvatarGroup overlapFrom={'end'} size="medium" maxCount={3}>
            <Avatar type="person" src={group[0]}></Avatar>
            <Avatar type="person" src={group[1]}></Avatar>
            <Avatar type="person" src={group[2]}></Avatar>
            <Avatar type="person" src={group[0]}></Avatar>
            <Avatar type="person" src={group[1]}></Avatar>
            <Avatar type="person" src={group[2]}></Avatar>
          </AvatarGroup>
        </div>
      </div>
    </View>
  </ViewGroup>
);

Group.args = {};

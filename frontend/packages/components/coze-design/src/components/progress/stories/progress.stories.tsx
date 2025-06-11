import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';

import { Progress, type ProgressProps } from '..';

const meta: Meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: [''],
  argTypes: {
    size: {
      options: ['small', 'default', 'large'],
      control: { type: 'select' },
    },
    type: {
      options: ['circle', 'line'],
      control: { type: 'select' },
    },
    percent: {
      control: { type: 'number', min: 0, max: 100, step: 2 },
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
} satisfies Meta<typeof Progress>;

export default meta;

const defaultProps = {
  size: 'default',
  percent: 50,
  stroke: 'var(--coz-fg-hglt)',
} satisfies ProgressProps;

export const Default: Story<ProgressProps> = args => (
  <EnhancedView prop="default">
    <Progress {...args} />
  </EnhancedView>
);

Default.args = {
  ...defaultProps,
  type: 'circle',
};

export const Line: Story<ProgressProps> = args => (
  <View prop="type" value="line" justify="start">
    <div className="block w-full">
      <Progress {...args} />
    </div>
  </View>
);

Line.args = {
  ...defaultProps,
  type: 'line',
};

export const Circle: Story<ProgressProps> = args => (
  <View prop="type" value="circle" justify="start">
    <div className="flex py-2px">
      <Progress {...args} />
    </div>
  </View>
);

Circle.args = {
  ...defaultProps,
  type: 'circle',
};

export const Size: Story<ProgressProps> = args => (
  <ViewGroup>
    <View prop="size" value="large" justify="start">
      <div className="block w-full">
        <Progress {...args} size="large" />
      </div>
    </View>
    <View prop="size" value="default" justify="start">
      <div className="block w-full">
        <Progress {...args} size="default" />
      </div>
    </View>
    <View prop="size" value="small" justify="start">
      <div className="block w-full">
        <Progress {...args} size="small" />
      </div>
    </View>
    <View prop="size" value="custom" justify="start">
      <div className="block w-full">
        <Progress {...args} size="small" height={2} />
      </div>
    </View>
  </ViewGroup>
);

Size.args = {
  ...defaultProps,
  type: 'line',
};

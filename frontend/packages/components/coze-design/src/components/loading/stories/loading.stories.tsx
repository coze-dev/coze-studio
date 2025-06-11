import React from 'react';

import { type StoryFn, type Meta } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';

import { type LoadingProps } from '..';
import { Loading } from '..';

const meta: Meta = {
  title: 'Components/Loading',
  tags: [''],
  component: Loading,
  argTypes: {
    size: {
      options: ['mini', 'small', 'middle', 'large'],
      control: { type: 'select' },
    },
    color: {
      options: ['default', 'blue', 'red', 'green'],
      control: { type: 'select' },
    },
    labelSize: {
      options: ['small', 'normal', 'middle', 'large'],
      description: 'label font size',
      defaultValue: 'normal',
      control: { type: 'select' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const defaultArgs: LoadingProps = {
  loading: true,
  size: 'middle',
  color: 'default',
};

export const Default: StoryFn<LoadingProps> = args => (
  <EnhancedView>
    <Loading {...args} />
  </EnhancedView>
);

Default.args = {
  ...defaultArgs,
};

export const Size: StoryFn<LoadingProps> = args => (
  <View prop="prop" value="size">
    <div className="relative flex space-x-2">
      <Loading {...args} size="mini" />
      <Loading {...args} size="small" />
      <Loading {...args} size="middle" />
      <Loading {...args} size="large" />
    </div>
  </View>
);

Size.args = {
  ...defaultArgs,
};

export const Color: StoryFn<LoadingProps> = args => (
  <View prop="variant" value="color">
    <div className="relative flex space-x-2">
      <Loading {...args} color="default" />
      <Loading {...args} color="blue" />
      <Loading {...args} color="green" />
      <Loading {...args} color="red" />
    </div>
  </View>
);

Color.args = {
  ...defaultArgs,
};

export const Label: StoryFn<LoadingProps> = args => (
  <View prop="labelSize" value={args.labelSize ?? 'normal'}>
    <div className="w-120px h-md relative mt-4">
      <Loading {...args} label={<span>正在加载中</span>} className="flex">
        <></>
      </Loading>
    </div>
  </View>
);

Label.args = {
  ...defaultArgs,
  size: 'small',
};

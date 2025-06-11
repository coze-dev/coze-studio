import React, { useState } from 'react';

import {
  type Meta,
  type StoryFn,
  type StoryFn as Story,
} from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';
import {
  IconCozThumbdown,
  IconCozThumbdownFill,
  IconCozThumbsup,
  IconCozThumbsupFill,
} from '@/components/icon';

import { SingleSelect, type SingleSelectProps } from '..';

const { SingleSelectLabel } = SingleSelect;

const meta: Meta = {
  title: 'Components/SingleSelect',
  component: SingleSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      source: { type: 'code' },
    },
    controls: { expanded: true },
  },
  argTypes: {
    layout: {
      control: {
        type: 'select',
      },
      options: ['hug', 'fill'],
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['default', 'small'],
    },
  },
};

export default meta;

const defaultProps = {
  defaultValue: '1',
  disabled: false,
  layout: 'hug',
  size: 'default',
} satisfies SingleSelectProps;

export const Default: Story<SingleSelectProps> = function defaultFactory(args) {
  return (
    <EnhancedView prop="default">
      <SingleSelect
        {...args}
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ]}
      />
    </EnhancedView>
  );
};

Default.args = { ...defaultProps };

export const Layout: StoryFn<SingleSelectProps> = args => {
  const [value, setValue] = useState('');
  return (
    <View prop="variant" value="layout" justify="start">
      <SingleSelect
        {...args}
        layout="fill"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ]}
        onChange={event => {
          setValue(event.target.value);
        }}
      />
      <div className="text-lg mt-2 text-foreground-4">当前选中：{value}</div>
    </View>
  );
};

Layout.args = {
  ...defaultProps,
  layout: 'fill',
};

export const Disabled: StoryFn<SingleSelectProps> = args => (
  <ViewGroup>
    <View prop="variant" value="disabled in option" justify="start">
      <SingleSelect
        defaultValue={'2'}
        options={[
          { value: '1', label: 'Option', disabled: true },
          { value: '2', label: 'Option Option', disabled: true },
          { value: '3', label: 'Option 3' },
        ]}
      />
    </View>
    <View prop="variant" value="disabled in singleSelect" justify="start">
      <SingleSelect
        {...args}
        options={[
          { value: '1', label: 'Option' },
          { value: '2', label: 'Option Option' },
          { value: '3', label: 'Option 3' },
        ]}
      />
    </View>
  </ViewGroup>
);

Disabled.args = {
  ...defaultProps,
  disabled: true,
};

export const SmallSize: StoryFn<SingleSelectProps> = args => (
  <ViewGroup>
    <View prop="variant" value="default in singleSelect" justify="start">
      <SingleSelect
        defaultValue={'2'}
        layout="fill"
        options={[
          { value: '1', label: 'Option1' },
          { value: '2', label: 'Option2' },
          { value: '3', label: 'Option3' },
        ]}
      />
    </View>
    <View prop="variant" value="small in singleSelect" justify="start">
      <SingleSelect
        defaultValue={'2'}
        layout="fill"
        size="small"
        options={[
          { value: '1', label: 'Option1' },
          { value: '2', label: 'Option2' },
          { value: '3', label: 'Option3' },
        ]}
      />
    </View>
  </ViewGroup>
);

SmallSize.args = {
  ...defaultProps,
  size: 'small',
};

export const WithIcon: StoryFn<SingleSelectProps> = args => (
  <View prop="variant" value="icon" justify="start">
    <SingleSelect
      {...args}
      options={[
        {
          value: '1',
          label: (
            <SingleSelectLabel
              icon={<IconCozThumbsup />}
              activeIcon={<IconCozThumbsupFill />}
              text="1,024"
            />
          ),
        },
        {
          value: '2',
          label: (
            <SingleSelectLabel
              icon={<IconCozThumbdown />}
              activeIcon={<IconCozThumbdownFill />}
              text="206"
            />
          ),
        },
      ]}
    />
  </View>
);

WithIcon.args = {
  ...defaultProps,
};

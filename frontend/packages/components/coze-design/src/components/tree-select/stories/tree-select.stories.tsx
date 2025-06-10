import type { Meta, StoryFn } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';

import { TreeSelect } from '..';
import type { TreeSelectProps } from '..';

const meta: Meta = {
  title: 'Components/TreeSelect',
  tags: ['autodocs'],
  component: TreeSelect,
  argTypes: {
    size: {
      options: ['large', 'middle', 'small'],
      control: { type: 'select' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

const defultArgs = {
  className: 'w-240px',
};

const treeData = [
  {
    label: '亚洲',
    value: 'Asia',
    key: '0',
    children: [
      {
        label: '中国',
        value: 'China',
        key: '0-0',
        children: [
          {
            label: '北京',
            value: 'Beijing',
            key: '0-0-0',
          },
          {
            label: '上海',
            value: 'Shanghai',
            key: '0-0-1',
          },
        ],
      },
    ],
  },
  {
    label: '北美洲',
    value: 'North America',
    key: '1',
  },
];

export default meta;

export const Default: StoryFn<TreeSelectProps> = args => (
  <EnhancedView prop="default">
    <TreeSelect
      {...args}
      showClear
      treeData={treeData}
      placeholder="请选择"
      className="w-240px"
    />
  </EnhancedView>
);

Default.args = {
  ...defultArgs,
};

export const Multiple: StoryFn<TreeSelectProps> = args => (
  <View prop="variant" value="multiple" justify="start">
    <TreeSelect
      className="w-240px"
      multiple
      leafOnly={true}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeData={treeData}
      placeholder="请选择"
    />
  </View>
);

Multiple.args = {
  ...defultArgs,
};

export const OnlyLeafSelectable: StoryFn<TreeSelectProps> = args => (
  <View prop="variant" value="onlyLeafSelectable" justify="start">
    <TreeSelect
      {...args}
      showClear
      treeData={treeData}
      placeholder="请选择"
      className="w-240px"
      onlyLeafSelectable
    />
  </View>
);

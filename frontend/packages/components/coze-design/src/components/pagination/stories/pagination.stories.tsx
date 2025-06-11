import { type Meta, type StoryFn } from '@storybook/react';

import { View } from '@/components/view';

import { Pagination, type PaginationProps } from '../index';

const meta: Meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'small'],
      defaultValue: 'default',
      description: 'Size of pagination component',
    },
    layout: {
      control: 'select',
      options: ['default', 'simple'],
      defaultValue: 'default',
      description: 'Layout of pagination component',
    },
  },
};

export default meta;

export const Default: StoryFn<PaginationProps> = function DefaultFactory(args) {
  return <Pagination {...args} />;
};

Default.args = {
  total: 100,
};

export const Basic: StoryFn<PaginationProps> = function DefaultFactory(args) {
  return <Pagination {...args} />;
};

Basic.args = {
  total: 100,
  currentPage: 1,
  pageSize: 10,
};

export const Sizes: StoryFn<PaginationProps> = function SizeDemoFactory(args) {
  return (
    <>
      <View prop="variant" value="size">
        <div className="flex-col space-y-4">
          <Pagination {...args} size="default" />
          <Pagination {...args} size="small" />
        </div>
        <div className="flex-col space-y-4">
          <Pagination {...args} size="default" layout="simple" />
          <Pagination {...args} size="small" layout="simple" />
        </div>
      </View>
    </>
  );
};

Sizes.args = {
  total: 100,
};

export const ShowTotal: StoryFn<PaginationProps> = function ShowTotalFactory(
  args,
) {
  return (
    <View prop="showTotal" value="true">
      <div className="flex-col space-y-4">
        <Pagination {...args} size="default" showTotal showSizeChanger />
        <Pagination {...args} size="small" showTotal showSizeChanger />
      </div>
    </View>
  );
};

ShowTotal.args = {
  total: 100,
};

export const QuickJump: StoryFn<PaginationProps> = function QuickJumpFactory(
  args,
) {
  return (
    <View prop="quickJump" value="true">
      <div className="flex-col space-y-4">
        <Pagination {...args} showQuickJumper />
        <Pagination {...args} showQuickJumper showTotal />
      </div>
    </View>
  );
};

QuickJump.args = {
  total: 100,
  currentPage: 1,
  pageSize: 10,
};

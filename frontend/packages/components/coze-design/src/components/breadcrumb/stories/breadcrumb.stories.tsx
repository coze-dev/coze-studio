import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';

import { Breadcrumb, type BreadcrumbProps } from '..';

const meta: Meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    size: {
      options: ['default', 'small'],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

export const Default: Story<BreadcrumbProps> = function defaultFactory(args) {
  return (
    <EnhancedView>
      <Breadcrumb {...args} size="default">
        <Breadcrumb.Item>Coze Design</Breadcrumb.Item>
        <Breadcrumb.Item>Components</Breadcrumb.Item>
        <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
      </Breadcrumb>
    </EnhancedView>
  );
};

export const Size: Story<BreadcrumbProps> = function SizeFactory(args) {
  return (
    <View prop="variant" value="size" justify="start">
      <Breadcrumb {...args}>
        <Breadcrumb.Item>Coze Design</Breadcrumb.Item>
        <Breadcrumb.Item>Components</Breadcrumb.Item>
        <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
      </Breadcrumb>
    </View>
  );
};

import { type StoryFn as Story, type Meta } from '@storybook/react';

import { Layout, type LayoutProps } from '..';

const meta: Meta = {
  title: 'Components/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Default: Story<LayoutProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>基本用法</h1>
        <Layout />
      </div>
    </div>
  );
};

export const Size: Story<LayoutProps> = function SizeFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>default</h1>
        <Layout />
      </div>

      <div className="flex flex-col gap-2">
        <h1>small</h1>
        <Layout />
      </div>
    </div>
  );
};

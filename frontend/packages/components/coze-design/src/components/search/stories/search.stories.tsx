import { type StoryFn as Story, type Meta } from '@storybook/react';

import { Search, type SearchProps } from '..';

const meta: Meta = {
  title: 'Components/Search',
  component: Search,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Default: Story<SearchProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>基本用法</h1>
        <Search />
      </div>
    </div>
  );
};

export const Size: Story<SearchProps> = function SizeFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>default</h1>
        <Search size="default" />
      </div>

      <div className="flex flex-col gap-2">
        <h1>small</h1>
        <Search size="small" />
      </div>
      <div className="flex flex-col gap-2">
        <h1>large</h1>
        <Search size="large" />
      </div>
    </div>
  );
};

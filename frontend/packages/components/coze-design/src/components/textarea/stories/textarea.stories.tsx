import React from 'react';

import { type StoryFn as Story, type Meta } from '@storybook/react';

import { IconCozLoading } from '@/components/icon';

import { TextArea, type TextAreaProps } from '..';

const meta: Meta = {
  title: 'Components/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    loading: {
      type: 'boolean',
    },
    error: {
      type: 'boolean',
    },
    disabled: {
      type: 'boolean',
    },
  },
};

export default meta;

export const Default: Story<TextAreaProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2">基本用法</h1>
        <TextArea {...args} defaultValue="Entered text" maxCount={500} />
      </div>
      <div>
        <h1 className="mb-2">Disabled</h1>
        <TextArea {...args} disabled={true} />
      </div>
      <div>
        <h1 className="mb-2">Loading</h1>
        <TextArea {...args} loading={true} />
      </div>
      <div>
        <h1 className="mb-2">Error</h1>
        <TextArea {...args} error={true} />
      </div>
      <div>
        <h1 className="mb-2">Suffix</h1>
        <TextArea {...args} suffix={<IconCozLoading />} />
      </div>
    </div>
  );
};

Default.args = { placeholder: 'Please enter' };

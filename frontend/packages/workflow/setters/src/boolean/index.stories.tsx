import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Boolean } from './boolean';

const meta: Meta<typeof Boolean> = {
  title: 'workflow setters/Boolean',
  component: Boolean,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();

    return (
      <Boolean
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof Boolean>;

export const Base: Story = {};

export const Readonly: Story = {
  args: {
    value: true,
    readonly: true,
  },
};

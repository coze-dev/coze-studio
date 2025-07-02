import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { String } from './string';

const meta: Meta<typeof String> = {
  title: 'workflow setters/String',
  component: String,
  args: {
    value: '文本',
  },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();

    return (
      <String
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
};
export default meta;

type Story = StoryObj<typeof String>;

export const Base: Story = {};

export const Placeholder: Story = {
  args: {
    value: '',
    placeholder: '请输入文字',
  },
};

export const Width: Story = {
  args: {
    value: '文本',
    placeholder: '请输入文字',
    width: 100,
  },
};

export const MaxCount: Story = {
  args: {
    value: '文本',
    maxCount: 20,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

export const TextMode: Story = {
  args: {
    textMode: true,
  },
};

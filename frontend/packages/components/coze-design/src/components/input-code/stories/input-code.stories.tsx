import { type StoryFn as Story, type Meta } from '@storybook/react';

import { type InputCodeProps } from '../input-code-types';
import { InputCode } from '../input-code';

const meta: Meta = {
  title: 'Components/InputCode',
  component: InputCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    type: {
      options: ['text', 'password'],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

export const Default: Story<InputCodeProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>基本用法</h1>
        <InputCode {...args} />
      </div>
      <div className="flex flex-col gap-2">
        <h1>Disabled</h1>
        <InputCode {...args} disabled />
      </div>
      <div className="flex flex-col gap-2">
        <h1>Error</h1>
        <InputCode {...args} error />
      </div>
    </div>
  );
};

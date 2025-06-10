import { type StoryFn as Story, type Meta } from '@storybook/react';

import { type RadioGroupProps, type RadioProps } from '../radio-types';
import { RadioGroup } from '../radio-group';
import { Radio } from '..';

const meta: Meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
    },
    checked: {
      type: 'boolean',
    },
  },
};

export default meta;

export const Default: Story<RadioProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Radio {...args} defaultChecked={true}>
          Radio
        </Radio>

        <h1>不受控</h1>
        <Radio {...args}>Radio</Radio>
        <h1>受控</h1>
        <Radio {...args} checked={false}>
          Radio
        </Radio>

        <h1>禁用</h1>
        <Radio {...args} disabled={true}>
          Radio Disabled
        </Radio>
        <Radio {...args} disabled={true} checked={true}>
          Radio Disabled
        </Radio>
      </div>
    </div>
  );
};

export const Card: Story<RadioProps> = function cardFactory(args) {
  return (
    <div>
      <h1>Radio卡片样式</h1>
      <Radio
        {...args}
        mode="advanced"
        type="pureCard"
        extra="This is a description. This is a description."
      >
        This is an option
      </Radio>
    </div>
  );
};

export const Group: Story<RadioGroupProps> = function groupFactory(args) {
  return (
    <div className="flex flex-col gap-4">
      <h1>水平排列</h1>
      <RadioGroup {...args} direction="horizontal" defaultValue={1}>
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
      </RadioGroup>
      <h1>垂直排列</h1>
      <RadioGroup direction="vertical">
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
      </RadioGroup>
      <h1>受控</h1>
      <RadioGroup value={2} direction="vertical">
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
      </RadioGroup>
    </div>
  );
};

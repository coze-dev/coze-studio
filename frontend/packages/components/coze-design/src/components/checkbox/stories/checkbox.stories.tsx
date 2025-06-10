import { type StoryFn as Story, type Meta } from '@storybook/react';

import { type CheckboxGroupProps } from '../checkbox-types';
import { Checkbox, type CheckboxProps } from '..';

const meta: Meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
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
    indeterminate: {
      type: 'boolean',
    },
  },
};

export default meta;

export const Default: Story<CheckboxProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>基本用法</h1>
        <Checkbox {...args}>Coze Design</Checkbox>
      </div>
      <div className="flex flex-col gap-2">
        <h1>全选/半选</h1>
        <Checkbox indeterminate={true}>Coze Design</Checkbox>
      </div>
      <div className="flex flex-col gap-2">
        <h1>禁用</h1>
        <Checkbox disabled={true}>Coze Design</Checkbox>
        <Checkbox indeterminate={true} disabled={true}>
          Checkbox
        </Checkbox>
        <Checkbox defaultChecked={true} disabled={true}>
          Checkbox
        </Checkbox>
      </div>
      <div className="flex flex-col gap-2">
        <h1>受控</h1>
        <Checkbox checked={true}>Coze Design</Checkbox>
      </div>
    </div>
  );
};

export const Group: Story<CheckboxGroupProps> = function groupFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <h1>水平排列</h1>
      <Checkbox.Group {...args} direction="horizontal">
        <Checkbox value={1}>A</Checkbox>
        <Checkbox value={2}>B</Checkbox>
        <Checkbox value={3}>C</Checkbox>
      </Checkbox.Group>
      <h1>垂直排列</h1>
      <Checkbox.Group {...args} direction="vertical">
        <Checkbox value={1}>A</Checkbox>
        <Checkbox value={2}>B</Checkbox>
        <Checkbox value={3}>C</Checkbox>
      </Checkbox.Group>
    </div>
  );
};

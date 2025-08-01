/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Number } from './number';

const meta: Meta<typeof Number> = {
  title: 'workflow setters/Number',
  component: Number,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 10,
  },
  tags: ['autodocs'],
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();

    return (
      <Number
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
};
export default meta;

type Story = StoryObj<typeof Number>;

export const Base: Story = {};

export const Placeholder: Story = {
  args: {
    value: undefined,
    placeholder: '请输入数字',
  },
};

export const Width: Story = {
  args: {
    width: 100,
  },
};

export const MaxMinStep: Story = {
  args: {
    max: 100,
    min: 10,
    step: 10,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

export const Slider: Story = {
  args: {
    mode: 'slider',
    width: 200,
    min: 1,
    max: 10,
    step: 1,
  },
};

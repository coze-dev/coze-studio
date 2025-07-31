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

import { Text } from './text';

const meta: Meta<typeof Text> = {
  title: 'workflow setters/Text',
  component: Text,
  args: {
    value: '长文本',
  },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();

    return (
      <Text
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Base: Story = {};

export const Placeholder: Story = {
  args: {
    value: '',
    placeholder: '请输入文字',
  },
};

export const Width: Story = {
  args: {
    value: '长文本',
    placeholder: '请输入文字',
    width: 100,
  },
};

export const MaxCount: Story = {
  args: {
    value: '长文本',
    maxCount: 100,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

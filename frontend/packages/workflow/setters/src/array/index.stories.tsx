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

/* eslint-disable @typescript-eslint/no-empty-function */
import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { String } from '../string';
import { Number } from '../number';
import { Enum } from '../enum';
import { Array } from './array';

const meta: Meta<typeof Array> = {
  title: 'workflow setters/Array',
  component: Array,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();
    const { value = [] } = args;

    const handleItemChange = (newItemValue: number, index: number) => {
      const newValue = [...(args.value || [])];
      newValue[index] = newItemValue;
      updateArgs({ ...args, value: newValue });
    };

    return (
      <Array
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      >
        {value?.map((itemValue: number, index) => (
          <Enum
            value={itemValue}
            options={[
              {
                label: '知识1',
                value: 1,
              },
              {
                label: '知识2',
                value: 2,
              },
            ]}
            onChange={newValue => handleItemChange(newValue as number, index)}
          />
        ))}
      </Array>
    );
  },
  args: {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    value: [1, 2],
  },
};

export default meta;

type Story = StoryObj<typeof Array>;

export const Base: Story = {};

export const DisableAdd: Story = {
  args: {
    disableAdd: true,
  },
};

export const Readonly: Story = {
  args: {
    readonly: true,
  },
};

interface WithFieldsValueItem {
  paramName?: string;
  paramValue?: number;
}

export const WithFields: Story = {
  args: {
    value: [
      { paramName: 'key1', paramValue: 100 },
      { paramName: 'key2', paramValue: 200 },
    ],
    fields: [
      {
        label: '参数名',
        width: 160,
      },
      {
        label: '参数值',
      },
    ],
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();
    const { value } = args;

    return (
      <Array
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      >
        {value?.map((itemValue: WithFieldsValueItem) => (
          <>
            <String
              value={itemValue?.paramName}
              width={160}
              onChange={v => {}}
            />
            <Number value={itemValue?.paramValue} onChange={() => {}} />
          </>
        ))}
      </Array>
    );
  },
};

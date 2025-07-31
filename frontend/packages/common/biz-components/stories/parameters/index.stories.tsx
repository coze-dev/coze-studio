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

import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/client-api';

import { Parameters, ParamTypeAlias } from '../../src/parameters';
import type { ParameterValue } from '../../src/parameters';

const meta: Meta<typeof Parameters> = {
  title: 'Biz Components/Parameters',
  component: Parameters,
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    layout: 'centered',
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();
    const handleChange = (value: ParameterValue[]) => {
      updateArgs({ ...args, value });
    };
    return <Parameters {...args} onChange={handleChange} />;
  },
  argTypes: {
    value: {
      description: '值',
      table: {
        type: { summary: 'ParameterValue[]' },
      },
    },
    readonly: {
      description: '启用只读',
      type: 'boolean',
      table: {
        type: { summary: 'Boolean' },
      },
    },
    withDescription: {
      description: '启用描述',
      defaultValue: false,
      table: {
        type: { summary: 'Boolean' },
      },
    },
    errors: {
      control: 'object',
      description: '失焦时触发',
      table: {
        type: { summary: 'ParametersError[]' },
      },
    },
    disabledTypes: {
      description: '禁用可选参数类型',
      control: 'multi-select',
      options: {
        String: ParamTypeAlias.String,
        Integer: ParamTypeAlias.Integer,
        Boolean: ParamTypeAlias.Boolean,
        Number: ParamTypeAlias.Number,
        Object: ParamTypeAlias.Object,
        ArrayString: ParamTypeAlias.ArrayString,
        ArrayInteger: ParamTypeAlias.ArrayInteger,
        ArrayBoolean: ParamTypeAlias.ArrayBoolean,
        ArrayNumber: ParamTypeAlias.ArrayNumber,
      },
      table: {
        type: { summary: 'ParamTypeAlias' },
      },
    },
    allowValueEmpty: {
      defaultValue: false,
      type: 'boolean',
      table: {
        type: { summary: 'Boolean' },
      },
    },
    className: {
      description: '样式类',
      table: {
        type: { summary: 'String' },
      },
    },
    style: {
      description: '样式对象',
      table: {
        type: { summary: 'CSSProperties' },
      },
    },
    onChange: {
      description: '监听值变化',
      table: {
        type: { summary: '(value: ParameterValue[]) => void' },
      },
    },
  },
  args: {
    value: [
      {
        key: '1',
        type: ParamTypeAlias.ArrayObject,
        name: 'outputList',
        description: '输出',
        children: [
          {
            key: '1-1',
            name: 'name',
            type: ParamTypeAlias.ArrayString,
            description: '名称',
            children: [
              {
                key: '1-1-1',
                name: 'sub-name',
                type: ParamTypeAlias.String,
              },
            ],
          },
          {
            key: '1-2',
            name: 'type',
            type: ParamTypeAlias.Integer,
            description: '类型',
          },
          {
            key: '1-3',
            name: 'description',
            type: ParamTypeAlias.String,
            description: '描述',
          },
        ],
      },
    ],
    withDescription: true,
    readonly: false,
    errors: [],
    disabledTypes: [],
    className: '',
    allowValueEmpty: false,
    style: {
      width: 500,
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Parameters>;

export const Base: Story = {};

export const WithDescription: Story = { args: { withDescription: true } };

export const Readonly: Story = { args: { readonly: true } };

export const Error: Story = {
  args: { errors: [{ path: '0.children.0.name', message: '名称最小长度10' }] },
  parameters: {
    docs: {
      description: {
        story: '目前只支持名称展示错误 失焦时触发',
      },
    },
  },
};

export const DisableTypes: Story = {
  args: {
    disabledTypes: [ParamTypeAlias.ArrayString, ParamTypeAlias.ArrayInteger],
  },
  parameters: {
    docs: {
      description: {
        story: '可配置多个禁用类型',
      },
    },
  },
};

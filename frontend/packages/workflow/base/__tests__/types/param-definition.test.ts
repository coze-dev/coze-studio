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

import { describe, it, expect } from 'vitest';

import { ViewVariableType } from '../../src/types/view-variable-type';
import type { RecursedParamDefinition } from '../../src/types/param-definition';
import { ParamValueType } from '../../src/types/param-definition';

describe('param-definition', () => {
  describe('RecursedParamDefinition', () => {
    it('应该能够创建基本的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'testParam',
        type: ViewVariableType.String,
      };

      expect(param.name).toBe('testParam');
      expect(param.type).toBe(ViewVariableType.String);
    });

    it('应该能够创建带有随机键的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'testParam',
        fieldRandomKey: 'random123',
        type: ViewVariableType.String,
      };

      expect(param.fieldRandomKey).toBe('random123');
    });

    it('应该能够创建带有描述和必填标记的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'testParam',
        desc: 'This is a test parameter',
        required: true,
        type: ViewVariableType.String,
      };

      expect(param.desc).toBe('This is a test parameter');
      expect(param.required).toBe(true);
    });

    it('应该能够创建带有子参数的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'parentParam',
        type: ViewVariableType.Object,
        children: [
          {
            name: 'childParam1',
            type: ViewVariableType.String,
          },
          {
            name: 'childParam2',
            type: ViewVariableType.Number,
          },
        ],
      };

      expect(param.children).toHaveLength(2);
      expect(param.children?.[0].name).toBe('childParam1');
      expect(param.children?.[1].name).toBe('childParam2');
    });

    it('应该能够创建带有固定值的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'testParam',
        type: ViewVariableType.String,
        isQuote: ParamValueType.FIXED,
        fixedValue: 'test value',
      };

      expect(param.isQuote).toBe(ParamValueType.FIXED);
      expect(param.fixedValue).toBe('test value');
    });

    it('应该能够创建带有引用值的参数定义', () => {
      const param: RecursedParamDefinition = {
        name: 'testParam',
        type: ViewVariableType.String,
        isQuote: ParamValueType.QUOTE,
        quotedValue: ['node1', 'path', 'to', 'value'],
      };

      expect(param.isQuote).toBe(ParamValueType.QUOTE);
      expect(param.quotedValue).toEqual(['node1', 'path', 'to', 'value']);
    });
  });

  describe('ParamValueType', () => {
    it('应该定义正确的参数值类型', () => {
      expect(ParamValueType.QUOTE).toBe('quote');
      expect(ParamValueType.FIXED).toBe('fixed');
    });

    it('应该只包含 QUOTE 和 FIXED 两种类型', () => {
      const valueTypes = Object.values(ParamValueType);
      expect(valueTypes).toHaveLength(2);
      expect(valueTypes).toContain('quote');
      expect(valueTypes).toContain('fixed');
    });
  });
});

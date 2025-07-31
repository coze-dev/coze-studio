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

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import 'reflect-metadata';

import type {
  ExpressionEditorTreeNode,
  ExpressionEditorVariable,
} from '../type';
import { ExpressionEditorValidator } from './index';

enum ViewVariableType {
  String = 1,
  Integer,
  Boolean,
  Number,
  Object = 6,
  ArrayString = 99,
  ArrayInteger,
  ArrayBoolean,
  ArrayNumber,
  ArrayObject,
}

vi.mock('@coze-arch/logger', () => ({
  logger: {
    createLoggerWith: vi.fn(),
  },
  reporter: {
    createReporterWithPreset: vi.fn(),
  },
}));

vi.mock('@coze-workflow/base', () => {
  enum VariableType {
    String = 1,
    Integer,
    Boolean,
    Number,
    Object = 6,
    ArrayString = 99,
    ArrayInteger,
    ArrayBoolean,
    ArrayNumber,
    ArrayObject,
  }

  return {
    ViewVariableType: {
      ...VariableType,
      isArrayType: (type: VariableType): boolean => {
        const arrayTypes = [
          VariableType.ArrayString,
          VariableType.ArrayInteger,
          VariableType.ArrayBoolean,
          VariableType.ArrayNumber,
          VariableType.ArrayObject,
        ];
        return arrayTypes.includes(type);
      },
    },
  };
});

describe('ExpressionEditorValidatorBuiltin', () => {
  describe('findPatterns', () => {
    it('findPatterns should work', () => {
      const patterns = ExpressionEditorValidator.findPatterns(
        'first {{foo1.bar1}} second {{foo2.bar2}}',
      );
      expect(patterns).toEqual([
        {
          start: 6,
          end: 19,
          content: 'foo1.bar1',
        },
        {
          start: 27,
          end: 40,
          content: 'foo2.bar2',
        },
      ]);
    });
    it('findPatterns with empty content', () => {
      const patterns = ExpressionEditorValidator.findPatterns('{{}}');
      expect(patterns).toEqual([
        {
          start: 0,
          end: 4,
          content: '',
        },
      ]);
    });
    it('findPatterns satisfies length', () => {
      const lengthTests = {
        'first {{foo1.bar1}}': 1,
        'first {{foo1.bar1}} second {{foo2.bar2}}': 2,
        'first {{foo1.bar1}} second {{foo2.bar2}} third {{foo3.bar3}}': 3,
        'first| {{foo1.bar1}}': 1,
        'first{} {{foo1.bar1}}': 1,
        'first{} {{foo1.bar1}} {}': 1,
        '{} {} {} {{ {{}} }{}{}{': 1,
      };
      for (const [input, expected] of Object.entries(lengthTests)) {
        const patterns = ExpressionEditorValidator.findPatterns(input);
        expect(patterns.length).toEqual(expected);
      }
    });
  });
});

describe('ExpressionEditorValidator lineTextValidator', () => {
  let tree: ExpressionEditorTreeNode[];
  beforeEach(() => {
    tree = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.ArrayObject,
        } as ExpressionEditorVariable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.String,
            } as ExpressionEditorVariable,
          },
        ],
      },
    ];
  });
  it('line text validator correctly', () => {
    const validateList = ExpressionEditorValidator.lineTextValidate({
      lineText: 'first {{foo[0].bar}} second {{foo[1].bar}}',
      tree,
    });
    expect(validateList).toEqual([
      { start: 6, end: 20, valid: true },
      { start: 28, end: 42, valid: true },
    ]);
  });
});

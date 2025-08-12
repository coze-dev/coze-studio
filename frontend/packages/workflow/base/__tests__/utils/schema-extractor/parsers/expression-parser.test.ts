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

import { expressionParser } from '../../../../src/utils/schema-extractor/parsers/expression-parser';
import type { ValueExpressionDTO } from '../../../../src/types/dto';

describe('expression-parser', () => {
  it('should handle empty input', () => {
    const result = expressionParser([]);
    expect(result).toEqual([]);
  });

  it('should parse string literal expression', () => {
    const expression: ValueExpressionDTO = {
      type: 'string',
      value: {
        type: 'literal',
        content: 'hello',
      },
    };
    const result = expressionParser(expression);
    expect(result).toEqual([
      {
        value: 'hello',
        isImage: false,
      },
    ]);
  });

  it('should parse image url expression', () => {
    const expression: ValueExpressionDTO = {
      type: 'string',
      value: {
        type: 'literal',
        content: 'https://example.com/tos-cn-i-mdko3gqilj/test.png',
      },
    };
    const result = expressionParser(expression);
    expect(result).toEqual([
      {
        value: 'https://example.com/tos-cn-i-mdko3gqilj/test.png',
        isImage: false,
      },
    ]);
  });

  it('should parse block output expression', () => {
    const expression: ValueExpressionDTO = {
      type: 'string',
      value: {
        type: 'ref',
        content: {
          source: 'block-output',
          blockID: 'block1',
          name: 'output',
        },
      },
    };
    const result = expressionParser(expression);
    expect(result).toEqual([
      {
        value: 'output',
        isImage: false,
      },
    ]);
  });

  it('should parse global variable expression', () => {
    const expression: ValueExpressionDTO = {
      type: 'string',
      value: {
        type: 'ref',
        content: {
          source: 'global_variable_test',
          path: ['user', 'name'],
          blockID: 'global',
          name: 'user.name',
        },
      },
    };
    const result = expressionParser(expression);
    expect(result).toEqual([
      {
        value: 'user.name',
        isImage: false,
      },
    ]);
  });

  it('should handle invalid expressions', () => {
    const expression: ValueExpressionDTO = {
      type: 'string',
      value: {
        type: 'literal',
        content: undefined,
      },
    };
    const result = expressionParser(expression);
    expect(result).toEqual([]);
  });

  it('should filter out invalid inputs', () => {
    const result = expressionParser(undefined as any);
    expect(result).toEqual([]);
  });
});

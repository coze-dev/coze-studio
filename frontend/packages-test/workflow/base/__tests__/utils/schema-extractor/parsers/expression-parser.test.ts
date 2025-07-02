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

import { describe, it, expect, vi } from 'vitest';

import { variableMergeGroupsParser } from '../../../../src/utils/schema-extractor/parsers/variable-merge-groups-parser';
import type { ValueExpressionDTO } from '../../../../src/types/dto';

// Mock expressionParser
vi.mock(
  '../../../../src/utils/schema-extractor/parsers/expression-parser',
  () => ({
    expressionParser: vi.fn(variables => {
      if (!Array.isArray(variables)) {
        return [];
      }
      return variables.map(variable => ({
        value: variable.value?.content,
        isImage:
          typeof variable.value?.content === 'string' &&
          variable.value?.content.startsWith('https://example.com/'),
      }));
    }),
  }),
);

describe('variable-merge-groups-parser', () => {
  it('应该处理空输入', () => {
    const result = variableMergeGroupsParser([]);
    expect(result).toEqual([]);
  });

  it('应该正确解析单个变量组', () => {
    const mergeGroups = [
      {
        name: 'group1',
        variables: [
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'test value',
            },
          } as ValueExpressionDTO,
        ],
      },
    ];

    const result = variableMergeGroupsParser(mergeGroups);
    expect(result).toEqual([
      {
        groupName: 'group1',
        variables: [
          {
            value: 'test value',
            isImage: false,
          },
        ],
      },
    ]);
  });

  it('应该正确解析多个变量组', () => {
    const mergeGroups = [
      {
        name: 'group1',
        variables: [
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'value1',
            },
          } as ValueExpressionDTO,
        ],
      },
      {
        name: 'group2',
        variables: [
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'value2',
            },
          } as ValueExpressionDTO,
        ],
      },
    ];

    const result = variableMergeGroupsParser(mergeGroups);
    expect(result).toEqual([
      {
        groupName: 'group1',
        variables: [
          {
            value: 'value1',
            isImage: false,
          },
        ],
      },
      {
        groupName: 'group2',
        variables: [
          {
            value: 'value2',
            isImage: false,
          },
        ],
      },
    ]);
  });

  it('应该正确处理包含图片 URL 的变量组', () => {
    const mergeGroups = [
      {
        name: 'images',
        variables: [
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'https://example.com/test.png',
            },
          } as ValueExpressionDTO,
        ],
      },
    ];

    const result = variableMergeGroupsParser(mergeGroups);
    expect(result).toEqual([
      {
        groupName: 'images',
        variables: [
          {
            value: 'https://example.com/test.png',
            isImage: true,
          },
        ],
      },
    ]);
  });

  it('应该正确处理空变量组', () => {
    const mergeGroups = [
      {
        name: 'emptyGroup',
        variables: [],
      },
    ];

    const result = variableMergeGroupsParser(mergeGroups);
    expect(result).toEqual([
      {
        groupName: 'emptyGroup',
        variables: [],
      },
    ]);
  });

  it('应该正确处理包含多个变量的组', () => {
    const mergeGroups = [
      {
        name: 'mixedGroup',
        variables: [
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'text value',
            },
          } as ValueExpressionDTO,
          {
            type: 'string',
            value: {
              type: 'literal',
              content: 'https://example.com/test.png',
            },
          } as ValueExpressionDTO,
        ],
      },
    ];

    const result = variableMergeGroupsParser(mergeGroups);
    expect(result).toEqual([
      {
        groupName: 'mixedGroup',
        variables: [
          {
            value: 'text value',
            isImage: false,
          },
          {
            value: 'https://example.com/test.png',
            isImage: true,
          },
        ],
      },
    ]);
  });
});

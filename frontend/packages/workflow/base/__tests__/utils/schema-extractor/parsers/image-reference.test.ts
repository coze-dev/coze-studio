import { describe, it, expect } from 'vitest';

import { imageReferenceParser } from '../../../../src/utils/schema-extractor/parsers/image-reference';
import type { ValueExpressionDTO } from '../../../../src/types/dto';

interface ImageReferenceDTO {
  url: ValueExpressionDTO;
}

describe('image-reference-parser', () => {
  it('应该处理空输入', () => {
    const result = imageReferenceParser([]);
    expect(result).toEqual([]);
  });

  it('应该处理非数组输入', () => {
    const result = imageReferenceParser(undefined as any);
    expect(result).toEqual([]);

    const result2 = imageReferenceParser({} as any);
    expect(result2).toEqual([]);

    const result3 = imageReferenceParser(null as any);
    expect(result3).toEqual([]);
  });

  it('应该正确解析图片引用', () => {
    const references: ImageReferenceDTO[] = [
      {
        url: {
          type: 'string',
          value: {
            type: 'literal',
            content: 'https://example.com/test.png',
          },
        },
      },
    ];

    const result = imageReferenceParser(references);
    expect(result).toEqual([
      {
        name: '-',
        value: 'https://example.com/test.png',
        isImage: false,
      },
    ]);
  });

  it('应该正确解析多个图片引用', () => {
    const references: ImageReferenceDTO[] = [
      {
        url: {
          type: 'string',
          value: {
            type: 'literal',
            content: 'https://example.com/test1.png',
          },
        },
      },
      {
        url: {
          type: 'string',
          value: {
            type: 'literal',
            content: 'https://example.com/test2.png',
          },
        },
      },
    ];

    const result = imageReferenceParser(references);
    expect(result).toEqual([
      {
        name: '-',
        value: 'https://example.com/test1.png',
        isImage: false,
      },
      {
        name: '-',
        value: 'https://example.com/test2.png',
        isImage: false,
      },
    ]);
  });

  it('应该过滤掉无效的图片引用', () => {
    const references: ImageReferenceDTO[] = [
      {
        url: {
          type: 'string',
          value: {
            type: 'literal',
            content: undefined,
          },
        },
      },
      {
        url: {
          type: 'string',
          value: {
            type: 'literal',
            content: 'https://example.com/test.png',
          },
        },
      },
    ];

    const result = imageReferenceParser(references);
    expect(result).toEqual([
      {
        name: '-',
        value: 'https://example.com/test.png',
        isImage: false,
      },
    ]);
  });
});

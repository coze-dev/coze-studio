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

import { describe, it, expect, vi } from 'vitest';

import { outputsParser } from '../../../../src/utils/schema-extractor/parsers/output';
import { AssistTypeDTO, VariableTypeDTO } from '../../../../src/types/dto';

// Mock isWorkflowImageTypeURL
vi.mock('../../../../src/utils/schema-extractor/utils', () => ({
  isWorkflowImageTypeURL: (url: string) =>
    url.startsWith('https://example.com/'),
}));

describe('output-parser', () => {
  it('应该处理空输入', () => {
    const result = outputsParser([]);
    expect(result).toEqual([]);
  });

  it('应该处理非数组输入', () => {
    const result = outputsParser(undefined as any);
    expect(result).toEqual([]);

    const result2 = outputsParser({} as any);
    expect(result2).toEqual([]);

    const result3 = outputsParser(null as any);
    expect(result3).toEqual([]);
  });

  it('应该正确解析基本输出', () => {
    const outputs = [
      {
        name: 'test',
        description: 'test description',
        type: VariableTypeDTO.string,
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'test',
        description: 'test description',
      },
    ]);
  });

  it('应该正确解析对象类型输出', () => {
    const outputs = [
      {
        name: 'obj',
        type: VariableTypeDTO.object,
        schema: [
          {
            name: 'field1',
            type: VariableTypeDTO.string,
          },
          {
            name: 'field2',
            type: VariableTypeDTO.float,
          },
        ],
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'obj',
        children: [
          {
            name: 'field1',
          },
          {
            name: 'field2',
          },
        ],
      },
    ]);
  });

  it('应该正确解析列表类型输出', () => {
    const outputs = [
      {
        name: 'list',
        type: VariableTypeDTO.list,
        schema: {
          schema: [
            {
              name: 'item1',
              type: VariableTypeDTO.string,
            },
            {
              name: 'item2',
              type: VariableTypeDTO.float,
            },
          ],
        },
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'list',
        children: [
          {
            name: 'item1',
          },
          {
            name: 'item2',
          },
        ],
      },
    ]);
  });

  it('应该正确处理带有默认值的字符串输出', () => {
    const outputs = [
      {
        name: 'text',
        type: VariableTypeDTO.string,
        defaultValue: 'hello world',
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'text',
        value: 'hello world',
        isImage: false,
      },
    ]);
  });

  it('应该正确处理图片 URL 输出', () => {
    const outputs = [
      {
        name: 'image',
        type: VariableTypeDTO.string,
        defaultValue: 'https://example.com/test.png',
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'image',
        value: 'https://example.com/test.png',
        images: ['https://example.com/test.png'],
        isImage: true,
      },
    ]);
  });

  it('应该正确处理图片类型输出', () => {
    const outputs = [
      {
        name: 'image',
        type: VariableTypeDTO.string,
        assistType: AssistTypeDTO.image,
        defaultValue: 'https://example.com/test.png',
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'image',
        value: 'https://example.com/test.png',
        images: ['https://example.com/test.png'],
        isImage: true,
      },
    ]);
  });

  it('应该正确处理图片列表输出', () => {
    const outputs = [
      {
        name: 'images',
        type: VariableTypeDTO.list,
        schema: {
          assistType: AssistTypeDTO.image,
        },
        defaultValue: JSON.stringify([
          'https://example.com/test1.png',
          'https://example.com/test2.png',
        ]),
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'images',
        value: JSON.stringify([
          'https://example.com/test1.png',
          'https://example.com/test2.png',
        ]),
        images: [
          'https://example.com/test1.png',
          'https://example.com/test2.png',
        ],
        isImage: true,
      },
    ]);
  });

  it('应该正确处理文件列表中的图片', () => {
    const outputs = [
      {
        name: 'files',
        type: VariableTypeDTO.list,
        schema: {
          assistType: AssistTypeDTO.file,
        },
        defaultValue: JSON.stringify([
          'https://example.com/test.png',
          'https://example1.com/document.pdf',
        ]),
      },
    ];

    const result = outputsParser(outputs);
    console.log(result);
    expect(result).toEqual([
      {
        name: 'files',
        value: JSON.stringify([
          'https://example.com/test.png',
          'https://example1.com/document.pdf',
        ]),
        images: ['https://example.com/test.png'],
        isImage: true,
      },
    ]);
  });

  it('应该正确处理无效的 JSON 字符串', () => {
    const consoleError = vi.spyOn(console, 'error');
    const outputs = [
      {
        name: 'invalid',
        type: VariableTypeDTO.list,
        schema: {
          assistType: AssistTypeDTO.image,
        },
        defaultValue: 'invalid json',
      },
    ];

    const result = outputsParser(outputs);
    expect(result).toEqual([
      {
        name: 'invalid',
        value: 'invalid json',
        isImage: false,
      },
    ]);
    expect(consoleError).toHaveBeenCalled();
  });
});

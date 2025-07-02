import { describe, it, expect } from 'vitest';
import type { WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import { parseImagesFromOutputData } from '../../src/utils/output-image-parser';
import {
  StandardNodeType,
  VariableTypeDTO,
  AssistTypeDTO,
} from '../../src/types';

describe('output-image-parser', () => {
  describe('parseImagesFromOutputData', () => {
    it('应该在没有 nodeSchema 或 outputData 时返回空数组', () => {
      expect(parseImagesFromOutputData({})).toEqual([]);
      expect(
        parseImagesFromOutputData({
          outputData: 'test',
          nodeSchema: undefined,
        }),
      ).toEqual([]);
      expect(
        parseImagesFromOutputData({
          outputData: undefined,
          nodeSchema: {},
        }),
      ).toEqual([]);
    });

    it('应该在节点类型被排除时返回空数组', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'image',
              type: VariableTypeDTO.string,
              assistType: AssistTypeDTO.image,
            },
          ],
        },
      };

      expect(
        parseImagesFromOutputData({
          outputData: { image: 'https://example.com/image.png' },
          nodeSchema,
          excludeNodeTypes: [StandardNodeType.LLM],
        }),
      ).toEqual([]);
    });

    it('应该正确解析 End 节点的图片链接', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.End,
        data: {
          inputs: {
            inputParameters: [
              {
                name: 'image',
                input: {
                  type: VariableTypeDTO.string,
                  assistType: AssistTypeDTO.image,
                },
              },
            ],
          },
        },
      };

      const result = parseImagesFromOutputData({
        outputData: { image: 'https://example.com/image.png' },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.png']);
    });

    it('应该正确解析 Message 节点的图片链接', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Output,
        data: {
          inputs: {
            inputParameters: [
              {
                name: 'image',
                input: {
                  type: VariableTypeDTO.string,
                  assistType: AssistTypeDTO.image,
                },
              },
            ],
          },
        },
      };

      const result = parseImagesFromOutputData({
        outputData: { image: 'https://example.com/image.png' },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.png']);
    });

    it('应该正确解析其他节点类型的图片链接', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'image',
              type: VariableTypeDTO.string,
              assistType: AssistTypeDTO.image,
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: { image: 'https://example.com/image.png' },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.png']);
    });

    it('应该正确解析图片列表', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'images',
              type: VariableTypeDTO.list,
              schema: {
                type: VariableTypeDTO.string,
                assistType: AssistTypeDTO.image,
              },
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: {
          images: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
        },
        nodeSchema,
      });

      expect(result).toEqual([
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ]);
    });

    it('应该正确解析对象中的图片', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'data',
              type: VariableTypeDTO.object,
              schema: [
                {
                  name: 'image',
                  type: VariableTypeDTO.string,
                  assistType: AssistTypeDTO.image,
                },
                {
                  name: 'text',
                  type: VariableTypeDTO.string,
                },
              ],
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: {
          data: {
            image: 'https://example.com/image.png',
            text: 'Some text',
          },
        },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.png']);
    });

    it('应该正确处理 SVG 类型的图片', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'svg',
              type: VariableTypeDTO.string,
              assistType: AssistTypeDTO.svg,
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: { svg: 'https://example.com/image.svg' },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.svg']);
    });

    it('应该正确处理原生图片类型', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'image',
              type: VariableTypeDTO.image,
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: { image: 'https://example.com/image.png' },
        nodeSchema,
      });

      expect(result).toEqual(['https://example.com/image.png']);
    });

    it('应该过滤掉空的图片链接', () => {
      const nodeSchema: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.LLM,
        data: {
          outputs: [
            {
              name: 'images',
              type: VariableTypeDTO.list,
              schema: {
                type: VariableTypeDTO.string,
                assistType: AssistTypeDTO.image,
              },
            },
          ],
        },
      };

      const result = parseImagesFromOutputData({
        outputData: {
          images: [
            'https://example.com/image1.png',
            '',
            null,
            undefined,
            'https://example.com/image2.png',
          ],
        },
        nodeSchema,
      });

      expect(result).toEqual([
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ]);
    });
  });
});

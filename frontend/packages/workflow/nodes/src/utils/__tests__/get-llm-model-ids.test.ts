import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type {
  WorkflowJSON,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base/types';

import { getLLMModelIds } from '../get-llm-model-ids';
import { mockSchemaForLLM } from './__mocks__/mock-schema';

describe('getLLMModelIds (implicitly testing getLLMModelIdsByNodeJSON)', () => {
  let mockDocument: WorkflowDocument;
  let mockGetNodeRegistry: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNodeRegistry = vi.fn().mockReturnValue({
      meta: {
        getLLMModelIdsByNodeJSON: nodeJSON => {
          if (nodeJSON.type === StandardNodeType.Intent) {
            return nodeJSON?.data?.inputs?.llmParam?.modelType;
          }

          if (nodeJSON.type === StandardNodeType.Question) {
            return nodeJSON?.data?.inputs?.llmParam?.modelType;
          }

          if (nodeJSON.type === StandardNodeType.LLM) {
            return nodeJSON.data.inputs.llmParam.find(
              p => p.name === 'modelType',
            )?.input.value.content;
          }

          return null;
        },
      },
    });
    mockDocument = {
      getNodeRegistry: mockGetNodeRegistry,
    } as unknown as WorkflowDocument;
  });

  it('should return empty array if document is empty', () => {
    const json: WorkflowJSON = { nodes: [], edges: [] };
    expect(getLLMModelIds(json, mockDocument)).toEqual([]);
  });

  it('should return empty array if json.nodes is empty', () => {
    const json: WorkflowJSON = { nodes: [], edges: [] };
    expect(getLLMModelIds(json, mockDocument)).toEqual([]);
  });

  it('should return correct llm ids if json.nodes is not empty', () => {
    expect(
      getLLMModelIds(mockSchemaForLLM as unknown as WorkflowJSON, mockDocument),
    ).toEqual(['1737521813', '1745219190']);
  });
});

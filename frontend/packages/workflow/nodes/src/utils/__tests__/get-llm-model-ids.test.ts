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

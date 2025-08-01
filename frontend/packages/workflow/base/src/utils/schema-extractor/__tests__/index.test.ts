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

import { describe, expect, it } from 'vitest';

import { StandardNodeType, type WorkflowJSON } from '../../../types';
import {
  type SchemaExtracted,
  SchemaExtractor,
  type SchemaExtractorConfig,
  SchemaExtractorParserName,
} from '..';

describe('SchemaExtractor', () => {
  it('should create instance', () => {
    const schema: WorkflowJSON = {
      nodes: [],
      edges: [],
    };
    const schemaExtractor = new SchemaExtractor(schema);
    expect(schemaExtractor).toBeInstanceOf(SchemaExtractor);
  });
  it('should create instance with empty or undefined schema', () => {
    const schemaExtractorEmpty = new SchemaExtractor(
      {} as unknown as WorkflowJSON,
    );
    expect(schemaExtractorEmpty).toBeInstanceOf(SchemaExtractor);
    const schemaExtractorUndefined = new SchemaExtractor(
      undefined as unknown as WorkflowJSON,
    );
    expect(schemaExtractorUndefined).toBeInstanceOf(SchemaExtractor);
  });
  it('should extract schema with config', () => {
    const schema: WorkflowJSON = {
      nodes: [
        {
          id: '1',
          type: StandardNodeType.Api,
          data: {
            nodeMeta: {
              title: 'nodeName1',
            },
          },
        },
        {
          id: '2',
          type: StandardNodeType.LLM,
          data: {
            nodeMeta: {
              title: 'nodeName2',
            },
            inputs: {
              llmParam: [
                {
                  name: 'prompt',
                  input: {
                    type: 'string',
                    value: {
                      type: 'literal',
                      content: 'you should test {{here}}',
                    },
                  },
                },
                {
                  name: 'systemPrompt',
                  input: {
                    type: 'string',
                    value: {
                      type: 'literal',
                      content: 'this is systemPrompt',
                    },
                  },
                },
              ],
            },
            prompt: 'you should test here',
          },
        },
      ],
      edges: [],
    };
    const config: SchemaExtractorConfig = {
      [StandardNodeType.Api]: [
        {
          name: 'title',
          path: 'nodeMeta.title',
        },
      ],
      [StandardNodeType.LLM]: [
        {
          name: 'title',
          path: 'nodeMeta.title',
        },
        {
          name: 'llmParam',
          path: 'inputs.llmParam',
          parser: SchemaExtractorParserName.LLM_PARAM,
        },
      ],
    };
    const schemaExtractor = new SchemaExtractor(schema);
    const extractedSchema: SchemaExtracted[] = schemaExtractor.extract(config);
    expect(extractedSchema).toStrictEqual([
      {
        nodeId: '1',
        nodeType: StandardNodeType.Api,
        properties: {
          title: 'nodeName1',
        },
      },
      {
        nodeId: '2',
        nodeType: StandardNodeType.LLM,
        properties: {
          title: 'nodeName2',
          llmParam: {
            prompt: 'you should test {{here}}',
            systemPrompt: 'this is systemPrompt',
          },
        },
      },
    ]);
  });
  it('should use parser in the config', () => {
    const schema: WorkflowJSON = {
      nodes: [
        {
          id: '1',
          type: StandardNodeType.Api,
          data: {
            content: {
              prefix: 'hello',
              suffix: 'world',
            },
          },
        },
      ],
      edges: [],
    };
    const config: SchemaExtractorConfig = {
      [StandardNodeType.Api]: [
        {
          name: 'content',
          path: 'content',
          parser: (content: { prefix: string; suffix: string }) =>
            `${content.prefix},${content.suffix}!`,
        },
      ],
    };
    const schemaExtractor = new SchemaExtractor(schema);
    const extractedSchema: SchemaExtracted[] = schemaExtractor.extract(config);
    expect(extractedSchema).toStrictEqual([
      {
        nodeId: '1',
        nodeType: StandardNodeType.Api,
        properties: {
          content: 'hello,world!',
        },
      },
    ]);
  });
  it('should flat multi-layer schema', () => {
    const schema: WorkflowJSON = {
      nodes: [
        {
          id: '1',
          type: StandardNodeType.Loop,
          data: {
            nodeMeta: {
              title: 'nodeName1',
            },
          },
          blocks: [
            {
              id: '1.1',
              type: StandardNodeType.Api,
              data: {
                nodeMeta: {
                  title: 'nodeName1.1',
                },
              },
            },
            {
              id: '1.2',
              type: StandardNodeType.Api,
              data: {
                nodeMeta: {
                  title: 'nodeName1.2',
                },
              },
            },
            {
              id: '1.3',
              type: StandardNodeType.Api,
              data: {
                nodeMeta: {
                  title: 'nodeName1.3',
                },
              },
            },
          ],
          edges: [
            {
              sourceNodeID: '1.1',
              sourcePortID: 'output',
              targetNodeID: '1.2',
              targetPortID: 'input',
            },
            {
              sourceNodeID: '1.2',
              sourcePortID: 'output',
              targetNodeID: '1.3',
              targetPortID: 'input',
            },
            {
              sourceNodeID: '1.1',
              sourcePortID: 'output',
              targetNodeID: '1.3',
              targetPortID: 'input',
            },
          ],
        },
        {
          id: '2',
          type: StandardNodeType.Api,
          data: {
            nodeMeta: {
              title: 'nodeName2',
            },
          },
        },
      ],
      edges: [
        {
          sourceNodeID: '1',
          sourcePortID: 'output',
          targetNodeID: '2',
          targetPortID: 'input',
        },
      ],
    };
    const config: SchemaExtractorConfig = {
      [StandardNodeType.Loop]: [
        {
          name: 'title',
          path: 'nodeMeta.title',
        },
      ],
      [StandardNodeType.Api]: [
        {
          name: 'title',
          path: 'nodeMeta.title',
        },
      ],
    };
    const schemaExtractor = new SchemaExtractor(schema);
    const extractedSchema: SchemaExtracted[] = schemaExtractor.extract(config);
    expect(extractedSchema).toStrictEqual([
      {
        nodeId: '1',
        nodeType: StandardNodeType.Loop,
        properties: {
          title: 'nodeName1',
        },
      },
      {
        nodeId: '2',
        nodeType: StandardNodeType.Api,
        properties: {
          title: 'nodeName2',
        },
      },
      {
        nodeId: '1.1',
        nodeType: StandardNodeType.Api,
        properties: {
          title: 'nodeName1.1',
        },
      },
      {
        nodeId: '1.2',
        nodeType: StandardNodeType.Api,
        properties: {
          title: 'nodeName1.2',
        },
      },
      {
        nodeId: '1.3',
        nodeType: StandardNodeType.Api,
        properties: {
          title: 'nodeName1.3',
        },
      },
    ]);
  });
});

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

import { expect, it } from 'vitest';

import { SchemaExtractorParserName } from '../constant';
import { StandardNodeType } from '../../../types';
import { SchemaExtractor } from '..';

it('extract schema with intents param parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '159306',
        type: '22',
        data: {
          inputs: {
            inputParameters: [
              {
                name: 'query',
                input: {
                  type: 'string',
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '100001',
                      name: 'BOT_USER_INPUT',
                    },
                  },
                },
              },
            ],
            llmParam: {
              modelType: 113,
              generationDiversity: 'balance',
              temperature: 0.5,
              topP: 1,
              frequencyPenalty: 0,
              presencePenalty: 0,
              maxTokens: 2048,
              responseFormat: 2,
              modelName: 'GPT-3.5',
              prompt: {
                type: 'string',
                value: {
                  type: 'literal',
                  content: '{{query}}',
                },
              },
              systemPrompt: {
                type: 'string',
                value: {
                  type: 'literal',
                  content: '你好, {{query}}',
                },
              },
              enableChatHistory: false,
            },
            intents: [
              {
                name: '北京',
              },
              {
                name: '上海',
              },
              {
                name: '武汉',
              },
              {
                name: '深圳',
              },
              {
                name: '长沙2',
              },
            ],
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // End End Node 2
    [StandardNodeType.Intent]: [
      {
        // Corresponding input name
        name: 'inputs',
        path: 'inputs.inputParameters',
        parser: SchemaExtractorParserName.INPUT_PARAMETERS,
      },
      {
        // intents
        name: 'intents',
        path: 'inputs.intents',
        parser: SchemaExtractorParserName.INTENTS,
      },
      {
        // system prompt
        name: 'systemPrompt',
        path: 'inputs.llmParam.systemPrompt.value.content',
      },
    ],
  });

  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '159306',
      nodeType: '22',
      properties: {
        inputs: [{ isImage: false, name: 'query', value: 'BOT_USER_INPUT' }],
        intents: { intent: '1. 北京 2. 上海 3. 武汉 4. 深圳 5. 长沙2' },
        systemPrompt: '你好, {{query}}',
      },
    },
  ]);
});

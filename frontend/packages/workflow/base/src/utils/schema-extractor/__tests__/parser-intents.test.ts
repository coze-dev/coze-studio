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
    // end 结束节点 2
    [StandardNodeType.Intent]: [
      {
        // 对应input name
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

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

import { SchemaExtractor } from '..';
import { workflowSchemaJSON } from './resource/workflow-schema';
import { workflowExtractorConfig } from './resource/workflow-config';

it('extract workflow schema', () => {
  const schemaExtractor = new SchemaExtractor(workflowSchemaJSON);
  const extractedWorkflowSchema = schemaExtractor.extract(
    workflowExtractorConfig,
  );
  expect(extractedWorkflowSchema).toStrictEqual([
    {
      nodeId: '100001',
      nodeType: '1',
      properties: {
        title: '开始',
        outputs: [
          { name: 'start_input_a', description: 'test desc' },
          { name: 'start_input_b' },
        ],
      },
    },
    {
      nodeId: '900001',
      nodeType: '2',
      properties: {
        title: '结束',
        inputs: [
          { name: 'output_a', value: 'outputList.output_b', isImage: false },
        ],
        content: '{{output_a}} and {{output_b}}',
      },
    },
    {
      nodeId: '154650',
      nodeType: '3',
      properties: {
        title: '大模型',
        batch: [
          { name: 'batch_a', value: 'key2', isImage: false },
          { name: 'batch_b', value: 'key4', isImage: false },
        ],
        inputs: [
          { name: 'input_a', value: 'key0', isImage: false },
          { name: 'input_b', value: 'batch_a', isImage: false },
          { name: 'const_c', value: '1234', isImage: false },
        ],
        llmParam: {
          prompt: '{{input_a}} and {{input_b}}',
          systemPrompt: 'this is systemPrompt',
        },
        outputs: [
          {
            name: 'outputList',
            children: [
              { name: 'output_a', description: 'desc output_a' },
              { name: 'output_b' },
            ],
          },
        ],
      },
    },
    {
      nodeId: '190950',
      nodeType: '5',
      properties: {
        title: '代码',
        inputs: [
          { name: 'code_input_a', value: 'start_input_a', isImage: false },
          { name: 'code_const_b', value: 'test const', isImage: false },
        ],
        code: 'async function main({ params }: Args): Promise<Output> {\n    return params; \n}',
        outputs: [
          { name: 'key0' },
          { name: 'key1' },
          { name: 'key2' },
          { name: 'key3', children: [{ name: 'key31' }] },
          {
            name: 'key4',
            children: [
              { name: 'key41' },
              { name: 'key42' },
              { name: 'key43' },
              { name: 'key44' },
              { name: 'key45', children: [{ name: 'key451' }] },
            ],
          },
        ],
      },
    },
    {
      nodeId: '111943',
      nodeType: '6',
      properties: {
        title: '知识库',
        inputs: [{ name: 'Query', value: 'start_input_b', isImage: false }],
        datasetParam: {
          datasetList: ['7330215302133268524', '7330215302133268524'],
        },
      },
    },
    {
      nodeId: '183818',
      nodeType: '8',
      properties: {
        title: '选择器',
        branches: [
          {
            condition: {
              logic: 2,
              conditions: [
                {
                  operator: 1,
                  left: {
                    input: {
                      type: 'string',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '100001',
                          name: 'start_input_a',
                        },
                      },
                    },
                  },
                  right: {
                    input: {
                      type: 'string',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '190950',
                          name: 'key0',
                        },
                      },
                    },
                  },
                },
                {
                  operator: 2,
                  left: {
                    input: {
                      type: 'integer',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '100001',
                          name: 'start_input_b',
                        },
                      },
                    },
                  },
                  right: {
                    input: {
                      type: 'integer',
                      value: { type: 'literal', content: '2' },
                    },
                  },
                },
                {
                  operator: 1,
                  left: {
                    input: {
                      type: 'string',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '190950',
                          name: 'key1',
                        },
                      },
                    },
                  },
                  right: {
                    input: {
                      type: 'string',
                      value: { type: 'literal', content: 'constant_a' },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      nodeId: '163608',
      nodeType: '11',
      properties: {
        title: '变量设置',
        inputs: [
          { name: 'variable_a', value: 'start_input_a', isImage: false },
        ],
        outputs: [{ name: 'isSuccess' }],
      },
    },
    {
      nodeId: '150706',
      nodeType: '11',
      properties: {
        title: '变量获取',
        inputs: [{ name: 'Key', value: 'workflow_variable_a', isImage: false }],
        outputs: [{ name: 'bot_variable_b' }],
      },
    },
    {
      nodeId: '193063',
      nodeType: '4',
      properties: {
        title: 'playOrRecommendMusic',
        batch: [
          { name: 'item1', value: 'key2', isImage: false },
          { name: 'item2', value: 'key4.key44', isImage: false },
        ],
        inputs: [
          { name: 'artist', value: 'item1', isImage: false },
          { name: 'user_question', value: 'key0', isImage: false },
          { name: 'song_name', value: 'start_input_b', isImage: false },
          { name: 'description', value: 'start_input_a', isImage: false },
        ],
        outputs: [
          {
            name: 'outputList',
            children: [
              { name: 'response_for_model', description: 'response for model' },
              { name: 'response_type', description: 'response type' },
              { name: 'template_id', description: 'use card template 3' },
              {
                name: 'type_for_model',
                description: 'how to treat response, 2 means directly return',
              },
              {
                name: 'music_list',
                description: 'music data list, usually single item',
                children: [
                  { name: 'song_name', description: 'name of the music' },
                  {
                    name: 'start',
                    description: 'the beginning of the material',
                  },
                  {
                    name: 'source_from',
                    description: 'id of the source, 1 is soda',
                  },
                  { name: 'vid', description: 'vid of the video model' },
                  { name: 'video_auto_play', description: 'if auto play' },
                  {
                    name: 'source_id',
                    description: 'the unique id from source',
                  },
                  {
                    name: 'album_image',
                    description: 'album image of the music',
                  },
                  {
                    name: 'ref_score',
                    description: 'confidence score that match user intention',
                  },
                  {
                    name: 'video_model',
                    description: 'video model to get material of the music',
                  },
                  {
                    name: 'artist_name',
                    description: 'artist name of the music',
                  },
                  {
                    name: 'duration',
                    description: 'play duration of the material',
                  },
                  {
                    name: 'source_app_icon',
                    description: 'icon of the music source',
                  },
                  {
                    name: 'source_app_name',
                    description: 'name of the music source',
                  },
                ],
              },
              {
                name: 'recommend_reason',
                description: 'if music is recommended, give reason',
              },
              {
                name: 'rel_score',
                description: 'confidence score of found music',
              },
            ],
          },
        ],
      },
    },
    {
      nodeId: '139426',
      nodeType: '9',
      properties: {
        title: 'test_ref',
        batch: [{ name: 'item1', value: 'key2', isImage: false }],
        inputs: [{ name: 'input_a', value: 'item1', isImage: false }],
        outputs: [{ name: 'outputList', children: [{ name: 'output_a' }] }],
      },
    },
    {
      nodeId: '122146',
      nodeType: '11',
      properties: {
        title: '变量',
        inputs: [{ name: 'arr_str', value: 'arr_str', isImage: false }],
        outputs: [{ name: 'isSuccess' }],
      },
    },
    {
      nodeId: '124687',
      nodeType: '11',
      properties: {
        title: '变量_1',
        inputs: [{ name: 'Key', value: 'sss', isImage: false }],
        outputs: [{ name: 'dddd' }],
      },
    },
    {
      nodeId: '184010',
      nodeType: '21',
      properties: {
        title: '循环',
        inputs: [{ name: 'arr_str', value: 'arr_str', isImage: false }],
        variables: [
          { name: 'var_str', value: 'str', isImage: false },
          { name: 'var_num', value: 'num', isImage: false },
          { name: 'var_bool', value: 'bool', isImage: false },
        ],
        outputs: [{ name: 'output_list' }],
      },
    },
    {
      nodeId: '149710',
      nodeType: '20',
      properties: {
        title: '循环变量',
        inputs: [
          { name: 'var_str', value: 'new_str' },
          { name: 'var_num', value: 'new_num' },
          { name: 'var_bool', value: 'new_bool' },
        ],
      },
    },
    {
      nodeId: '185397',
      nodeType: '13',
      properties: {
        title: '消息',
        inputs: [
          { name: 'str', value: 'var_str', isImage: false },
          { name: 'num', value: 'var_num', isImage: false },
          { name: 'bool', value: 'var_bool', isImage: false },
        ],
        content: 'str: {{str}}\nnum: {{num}}\nbool: {{bool}}',
      },
    },
    {
      nodeId: '146923',
      nodeType: '5',
      properties: {
        title: '代码',
        inputs: [
          { name: 'var_str', value: 'var_str', isImage: false },
          { name: 'var_num', value: 'var_num', isImage: false },
          { name: 'var_bool', value: 'var_bool', isImage: false },
        ],
        code: 'async function main({ params }: Args): Promise<Output> {\n    return {\n        "new_str": params.var_str + \'✅\',\n        "new_num": params.var_num + 1,\n        "new_bool": !params.var_bool,\n    };\n}',
        outputs: [
          { name: 'new_str' },
          { name: 'new_num' },
          { name: 'new_bool' },
        ],
      },
    },
    {
      nodeId: '123896',
      nodeType: '15',
      properties: {
        title: '文本处理',
        concatResult: 'str: {{String1}}\nnum: {{String2}}\nbool: {{String3}}',
        arrayConcatChar: '',
        splitChar: '',
      },
    },
    {
      nodeId: '179778',
      nodeType: '8',
      properties: {
        title: '选择器',
        branches: [
          {
            condition: {
              logic: 2,
              conditions: [
                {
                  operator: 1,
                  left: {
                    input: {
                      type: 'boolean',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '184010',
                          name: 'var_bool',
                        },
                      },
                    },
                  },
                  right: {
                    input: {
                      type: 'boolean',
                      value: { type: 'literal', content: 'true' },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      nodeId: '177333',
      nodeType: '8',
      properties: {
        title: '选择器_1',
        branches: [
          {
            condition: {
              logic: 2,
              conditions: [
                {
                  operator: 13,
                  left: {
                    input: {
                      type: 'float',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '184010',
                          name: 'var_num',
                        },
                      },
                    },
                  },
                  right: {
                    input: {
                      type: 'integer',
                      value: { type: 'literal', content: '5' },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { nodeId: '194199', nodeType: '19', properties: { title: '终止循环' } },
  ]);
});

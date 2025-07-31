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

export const workflowSchemaJSON = {
  nodes: [
    {
      id: '100001',
      type: '1',
      meta: { position: { x: 192, y: 2086.3999999999996 } },
      data: {
        nodeMeta: {
          title: '开始',
          icon: 'icon-Start.png',
          description: '工作流的起始节点，用于设定启动工作流需要的信息',
          subTitle: '',
        },
        outputs: [
          {
            type: 'string',
            name: 'start_input_a',
            required: true,
            description: 'test desc',
          },
          { type: 'integer', name: 'start_input_b', required: false },
        ],
      },
    },
    {
      id: '900001',
      type: '2',
      meta: { position: { x: 3071, y: 1452.6499999999999 } },
      data: {
        nodeMeta: {
          title: '结束',
          icon: 'icon-End.png',
          description: '工作流的最终节点，用于返回工作流运行后的结果信息',
          subTitle: '',
        },
        inputs: {
          terminatePlan: 'useAnswerContent',
          inputParameters: [
            {
              name: 'output_a',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '154650',
                    name: 'outputList.output_b',
                  },
                },
              },
            },
          ],
          content: {
            type: 'string',
            value: {
              type: 'literal',
              content: '{{output_a}} and {{output_b}}',
            },
          },
        },
      },
    },
    {
      id: '154650',
      type: '3',
      meta: { position: { x: 2384.117535662213, y: -99.09699951398775 } },
      data: {
        nodeMeta: {
          title: '大模型',
          icon: 'icon-LLM.png',
          description: '调用大语言模型,使用变量和提示词生成回复',
          subTitle: '大模型',
        },
        inputs: {
          inputParameters: [
            {
              name: 'input_a',
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
            {
              name: 'input_b',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '154650',
                    name: 'batch_a',
                  },
                },
              },
            },
            {
              name: 'const_c',
              input: {
                type: 'string',
                value: { type: 'literal', content: '1234' },
              },
            },
          ],
          llmParam: [
            {
              name: 'modleName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'GPT-3.5 (16K)' },
              },
            },
            {
              name: 'modelType',
              input: {
                type: 'integer',
                value: { type: 'literal', content: '113' },
              },
            },
            {
              name: 'prompt',
              input: {
                type: 'string',
                value: {
                  type: 'literal',
                  content: '{{input_a}} and {{input_b}}',
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
            {
              name: 'temperature',
              input: {
                type: 'float',
                value: { type: 'literal', content: '0.7' },
              },
            },
          ],
          batch: {
            batchEnable: true,
            batchSize: 10,
            inputLists: [
              {
                name: 'batch_a',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key2',
                    },
                  },
                },
              },
              {
                name: 'batch_b',
                input: {
                  type: 'list',
                  schema: {
                    type: 'object',
                    schema: [
                      { type: 'boolean', name: 'key41' },
                      { type: 'integer', name: 'key42' },
                      { type: 'float', name: 'key43' },
                      {
                        type: 'list',
                        name: 'key44',
                        schema: { type: 'string' },
                      },
                      {
                        type: 'object',
                        name: 'key45',
                        schema: [{ type: 'string', name: 'key451' }],
                      },
                    ],
                  },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key4',
                    },
                  },
                },
              },
            ],
          },
        },
        outputs: [
          {
            type: 'list',
            name: 'outputList',
            schema: {
              type: 'object',
              schema: [
                {
                  type: 'string',
                  name: 'output_a',
                  description: 'desc output_a',
                },
                { type: 'list', name: 'output_b', schema: { type: 'string' } },
              ],
            },
          },
        ],
        version: '2',
      },
    },
    {
      id: '190950',
      type: '5',
      meta: { position: { x: 726, y: 1988.3999999999996 } },
      data: {
        nodeMeta: {
          title: '代码',
          icon: 'icon-Code.png',
          description: '编写代码，处理输入变量来生成返回值',
          subTitle: '代码',
        },
        inputs: {
          inputParameters: [
            {
              name: 'code_input_a',
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
            {
              name: 'code_const_b',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'test const' },
              },
            },
          ],
          code: 'async function main({ params }: Args): Promise<Output> {\n    return params; \n}',
          language: 5,
        },
        outputs: [
          { type: 'string', name: 'key0' },
          { type: 'string', name: 'key1' },
          { type: 'list', name: 'key2', schema: { type: 'string' } },
          {
            type: 'object',
            name: 'key3',
            schema: [{ type: 'string', name: 'key31' }],
          },
          {
            type: 'list',
            name: 'key4',
            schema: {
              type: 'object',
              schema: [
                { type: 'boolean', name: 'key41' },
                { type: 'integer', name: 'key42' },
                { type: 'float', name: 'key43' },
                { type: 'list', name: 'key44', schema: { type: 'string' } },
                {
                  type: 'object',
                  name: 'key45',
                  schema: [{ type: 'string', name: 'key451' }],
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: '111943',
      type: '6',
      meta: { position: { x: 2373.5, y: 2348.1499999999996 } },
      data: {
        nodeMeta: {
          title: '知识库',
          icon: 'icon-Knowledge.png',
          description:
            '在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回',
          subTitle: '知识库',
        },
        outputs: [
          {
            type: 'list',
            name: 'outputList',
            schema: {
              type: 'object',
              schema: [{ type: 'string', name: 'output' }],
            },
          },
        ],
        inputs: {
          inputParameters: [
            {
              name: 'Query',
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
          ],
          datasetParam: [
            {
              name: 'datasetList',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'literal',
                  content: ['7330215302133268524', '7330215302133268524'],
                },
              },
            },
            {
              name: 'topK',
              input: {
                type: 'integer',
                value: { type: 'literal', content: 6 },
              },
            },
            {
              name: 'minScore',
              input: {
                type: 'number',
                value: { type: 'literal', content: 0.5 },
              },
            },
            {
              name: 'strategy',
              input: {
                type: 'integer',
                value: { type: 'literal', content: 1 },
              },
            },
          ],
        },
      },
    },
    {
      id: '183818',
      type: '8',
      meta: { position: { x: 1493, y: 830.6500000000001 } },
      data: {
        nodeMeta: {
          title: '选择器',
          icon: 'icon-Condition.png',
          description:
            '连接两个下游分支，如果设定的条件成立则只运行“如果”分支，不成立则只运行“否则”分支',
          subTitle: '选择器',
        },
        inputs: {
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
    },
    {
      id: '163608',
      type: '11',
      meta: { position: { x: 1493, y: 2108.1499999999996 } },
      data: {
        nodeMeta: {
          title: '变量设置',
          icon: 'icon-Variable.png',
          description:
            '用于读取和写入机器人中的变量。变量名称必须与机器人中的变量名称相匹配。',
          subTitle: '变量',
        },
        inputs: {
          mode: 'set',
          inputParameters: [
            {
              name: 'variable_a',
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
          ],
        },
        outputs: [{ type: 'boolean', name: 'isSuccess' }],
      },
    },
    {
      id: '150706',
      type: '11',
      meta: { position: { x: 2373.5, y: 1098.1499999999999 } },
      data: {
        nodeMeta: {
          title: '变量获取',
          icon: 'icon-Variable.png',
          description:
            '用于读取和写入机器人中的变量。变量名称必须与机器人中的变量名称相匹配。',
          subTitle: '变量',
        },
        inputs: {
          mode: 'get',
          inputParameters: [
            {
              name: 'Key',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'workflow_variable_a' },
              },
            },
          ],
        },
        outputs: [{ type: 'string', name: 'bot_variable_b' }],
      },
    },
    {
      id: '193063',
      type: '4',
      meta: { position: { x: 2373.5, y: 1575.1499999999999 } },
      data: {
        nodeMeta: {
          title: 'playOrRecommendMusic',
          icon: 'icon-API.png',
          subtitle: 'Music030101:playOrRecommendMusic',
          description: 'Used to play music and songs',
        },
        inputs: {
          apiParam: [
            {
              name: 'apiID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7341237036076089388' },
              },
            },
            {
              name: 'apiName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'playOrRecommendMusic' },
              },
            },
            {
              name: 'pluginID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7341237036076023852' },
              },
            },
            {
              name: 'pluginName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'Music030101' },
              },
            },
            {
              name: 'pluginVersion',
              input: {
                type: 'string',
                value: { type: 'literal', content: '' },
              },
            },
            {
              name: 'tips',
              input: {
                type: 'string',
                value: { type: 'literal', content: '' },
              },
            },
            {
              name: 'outDocLink',
              input: {
                type: 'string',
                value: { type: 'literal', content: '' },
              },
            },
          ],
          inputParameters: [
            {
              name: 'artist',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '193063',
                    name: 'item1',
                  },
                },
              },
            },
            {
              name: 'user_question',
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
            {
              name: 'song_name',
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
            {
              name: 'description',
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
          ],
          batch: {
            batchEnable: true,
            batchSize: 10,
            inputLists: [
              {
                name: 'item1',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key2',
                    },
                  },
                },
              },
              {
                name: 'item2',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key4.key44',
                    },
                  },
                },
              },
            ],
          },
        },
        outputs: [
          {
            type: 'list',
            name: 'outputList',
            schema: {
              type: 'object',
              schema: [
                {
                  type: 'string',
                  name: 'response_for_model',
                  required: false,
                  description: 'response for model',
                },
                {
                  type: 'string',
                  name: 'response_type',
                  required: false,
                  description: 'response type',
                },
                {
                  type: 'integer',
                  name: 'template_id',
                  required: false,
                  description: 'use card template 3',
                },
                {
                  type: 'integer',
                  name: 'type_for_model',
                  required: false,
                  description: 'how to treat response, 2 means directly return',
                },
                {
                  type: 'list',
                  name: 'music_list',
                  schema: {
                    type: 'object',
                    schema: [
                      {
                        type: 'string',
                        name: 'song_name',
                        required: false,
                        description: 'name of the music',
                      },
                      {
                        type: 'integer',
                        name: 'start',
                        required: false,
                        description: 'the beginning of the material',
                      },
                      {
                        type: 'integer',
                        name: 'source_from',
                        required: false,
                        description: 'id of the source, 1 is soda',
                      },
                      {
                        type: 'string',
                        name: 'vid',
                        required: false,
                        description: 'vid of the video model',
                      },
                      {
                        type: 'boolean',
                        name: 'video_auto_play',
                        required: false,
                        description: 'if auto play',
                      },
                      {
                        type: 'string',
                        name: 'source_id',
                        required: false,
                        description: 'the unique id from source',
                      },
                      {
                        type: 'string',
                        name: 'album_image',
                        required: false,
                        description: 'album image of the music',
                      },
                      {
                        type: 'float',
                        name: 'ref_score',
                        required: false,
                        description:
                          'confidence score that match user intention',
                      },
                      {
                        type: 'string',
                        name: 'video_model',
                        required: false,
                        description: 'video model to get material of the music',
                      },
                      {
                        type: 'string',
                        name: 'artist_name',
                        required: false,
                        description: 'artist name of the music',
                      },
                      {
                        type: 'integer',
                        name: 'duration',
                        required: false,
                        description: 'play duration of the material',
                      },
                      {
                        type: 'string',
                        name: 'source_app_icon',
                        required: false,
                        description: 'icon of the music source',
                      },
                      {
                        type: 'string',
                        name: 'source_app_name',
                        required: false,
                        description: 'name of the music source',
                      },
                    ],
                  },
                  required: false,
                  description: 'music data list, usually single item',
                },
                {
                  type: 'string',
                  name: 'recommend_reason',
                  required: false,
                  description: 'if music is recommended, give reason',
                },
                {
                  type: 'float',
                  name: 'rel_score',
                  required: false,
                  description: 'confidence score of found music',
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: '139426',
      type: '9',
      meta: { position: { x: 2373.5, y: 3075.1499999999996 } },
      data: {
        nodeMeta: {
          title: 'test_ref',
          description: 'test only',
          icon: 'workflow.png',
        },
        inputs: {
          workflowId: '7330237522666242092',
          spaceId: '7304782809376718892',
          inputDefs: [{ name: 'input_a', type: 'string', required: false }],
          type: 0,
          inputParameters: [
            {
              name: 'input_a',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '139426',
                    name: 'item1',
                  },
                },
              },
            },
          ],
          batch: {
            batchEnable: true,
            batchSize: 10,
            inputLists: [
              {
                name: 'item1',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key2',
                    },
                  },
                },
              },
            ],
          },
        },
        outputs: [
          {
            type: 'list',
            name: 'outputList',
            schema: {
              type: 'object',
              schema: [{ type: 'string', name: 'output_a', required: false }],
            },
          },
        ],
      },
    },
    {
      id: '122146',
      type: '11',
      meta: {
        position: { x: 878.3385990010952, y: 1088.8293868436451 },
        testRun: {},
      },
      data: {
        nodeMeta: {
          title: '变量',
          icon: 'icon-Variable.png',
          description:
            '用于读取和写入机器人中的变量。变量名称必须与机器人中的变量名称相匹配。',
          subTitle: '变量',
        },
        inputs: {
          mode: 'set',
          inputParameters: [
            {
              name: 'arr_str',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'arr_str',
                  },
                },
              },
            },
          ],
        },
        outputs: [{ type: 'boolean', name: 'isSuccess' }],
      },
    },
    {
      id: '124687',
      type: '11',
      meta: {
        position: { x: 830.7416699219491, y: 1555.6201719500916 },
        testRun: {},
      },
      data: {
        nodeMeta: {
          title: '变量_1',
          icon: 'icon-Variable.png',
          description:
            '用于读取和写入机器人中的变量。变量名称必须与机器人中的变量名称相匹配。',
          subTitle: '变量',
        },
        inputs: {
          mode: 'get',
          inputParameters: [
            {
              name: 'Key',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'sss' },
              },
            },
          ],
        },
        outputs: [{ type: 'string', name: 'dddd' }],
      },
    },
    {
      id: '184010',
      type: '21',
      meta: {
        position: { x: 1155, y: 351.18125 },
        canvasPosition: { x: 1566.3855553849655, y: 476.0442470523659 },
        testRun: {},
      },
      data: {
        nodeMeta: {
          title: '循环',
          icon: 'icon-Loop.png',
          description: '用于通过设定循环次数和逻辑，重复执行一系列任务',
          subTitle: '循环',
        },
        inputs: {
          inputParameters: [
            {
              name: 'arr_str',
              input: {
                type: 'list',
                schema: { type: 'string' },
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'arr_str',
                  },
                },
              },
            },
          ],
          variableParameters: [
            {
              name: 'var_str',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'str',
                  },
                },
              },
            },
            {
              name: 'var_num',
              input: {
                type: 'float',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'num',
                  },
                },
              },
            },
            {
              name: 'var_bool',
              input: {
                type: 'boolean',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'bool',
                  },
                },
              },
            },
          ],
        },
        outputs: [
          {
            name: 'output_list',
            input: {
              type: 'list',
              schema: { type: 'string' },
              value: {
                type: 'ref',
                content: {
                  source: 'block-output',
                  blockID: '123896',
                  name: 'output',
                },
              },
            },
          },
        ],
      },
      blocks: [
        {
          id: '149710',
          type: '20',
          meta: {
            position: { x: 1202.5, y: 512.2749999999999 },
            testRun: {},
          },
          data: {
            inputs: {
              inputParameters: [
                {
                  left: {
                    type: 'string',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '184010',
                        name: 'var_str',
                      },
                    },
                  },
                  right: {
                    type: 'string',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '146923',
                        name: 'new_str',
                      },
                    },
                  },
                },
                {
                  left: {
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
                  right: {
                    type: 'float',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '146923',
                        name: 'new_num',
                      },
                    },
                  },
                },
                {
                  left: {
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
                  right: {
                    type: 'boolean',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '146923',
                        name: 'new_bool',
                      },
                    },
                  },
                },
              ],
            },
            nodeMeta: {
              title: '循环变量',
              icon: 'icon-LoopSetVariable.png',
              description: '用于重置循环变量的值，使其下次循环使用重置后的值',
              subTitle: '设置变量',
            },
          },
        },
        {
          id: '185397',
          type: '13',
          meta: {
            position: { x: 2748.2602325491534, y: 1014.6472367006949 },
            testRun: {},
          },
          data: {
            nodeMeta: {
              title: '消息',
              icon: 'icon-Messager.png',
              description: '支持中间过程的消息输出，支持流式和非流式两种方式',
              subTitle: '消息',
            },
            inputs: {
              inputParameters: [
                {
                  name: 'str',
                  input: {
                    type: 'string',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '184010',
                        name: 'var_str',
                      },
                    },
                  },
                },
                {
                  name: 'num',
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
                {
                  name: 'bool',
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
              ],
              streamingOutput: false,
              content: {
                type: 'string',
                value: {
                  type: 'literal',
                  content: 'str: {{str}}\nnum: {{num}}\nbool: {{bool}}',
                },
              },
            },
          },
        },
        {
          id: '146923',
          type: '5',
          meta: { position: { x: 425, y: 258.32499999999993 }, testRun: {} },
          data: {
            nodeMeta: {
              title: '代码',
              icon: 'icon-Code.png',
              description: '编写代码，处理输入变量来生成返回值',
              subTitle: '代码',
            },
            inputs: {
              inputParameters: [
                {
                  name: 'var_str',
                  input: {
                    type: 'string',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '184010',
                        name: 'var_str',
                      },
                    },
                  },
                },
                {
                  name: 'var_num',
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
                {
                  name: 'var_bool',
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
              ],
              code: 'async function main({ params }: Args): Promise<Output> {\n    return {\n        "new_str": params.var_str + \'✅\',\n        "new_num": params.var_num + 1,\n        "new_bool": !params.var_bool,\n    };\n}',
              language: 5,
              settingOnError: {},
            },
            outputs: [
              { type: 'string', name: 'new_str' },
              { type: 'float', name: 'new_num' },
              { type: 'boolean', name: 'new_bool' },
            ],
          },
        },
        {
          id: '123896',
          type: '15',
          meta: {
            position: { x: 2748.2602325491534, y: 243.64723670069495 },
            testRun: {},
          },
          data: {
            nodeMeta: {
              title: '文本处理',
              icon: 'icon-Text.png',
              description: '用于处理多个字符串类型变量的格式',
              subTitle: '文本处理',
            },
            inputs: {
              method: 'concat',
              inputParameters: [
                {
                  name: 'String1',
                  input: {
                    type: 'string',
                    value: {
                      type: 'ref',
                      content: {
                        source: 'block-output',
                        blockID: '184010',
                        name: 'var_str',
                      },
                    },
                  },
                },
                {
                  name: 'String2',
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
                {
                  name: 'String3',
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
              ],
              concatParams: [
                {
                  name: 'concatResult',
                  input: {
                    type: 'string',
                    value: {
                      type: 'literal',
                      content:
                        'str: {{String1}}\nnum: {{String2}}\nbool: {{String3}}',
                    },
                  },
                },
                {
                  name: 'arrayItemConcatChar',
                  input: {
                    type: 'string',
                    value: { type: 'literal', content: '，' },
                  },
                },
                {
                  name: 'allArrayItemConcatChars',
                  input: {
                    type: 'list',
                    schema: {
                      type: 'object',
                      schema: [
                        { type: 'string', name: 'label', required: true },
                        { type: 'string', name: 'value', required: true },
                        {
                          type: 'boolean',
                          name: 'isDefault',
                          required: true,
                        },
                      ],
                    },
                    value: {
                      type: 'literal',
                      content: [
                        { label: '换行', value: '\n', isDefault: true },
                        { label: '制表符', value: '\t', isDefault: true },
                        { label: '句号', value: '。', isDefault: true },
                        { label: '逗号', value: '，', isDefault: true },
                        { label: '分号', value: '；', isDefault: true },
                        { label: '空格', value: ' ', isDefault: true },
                      ],
                    },
                  },
                },
              ],
            },
            outputs: [{ type: 'string', name: 'output', required: true }],
          },
        },
        {
          id: '179778',
          type: '8',
          meta: { position: { x: 1980, y: 502.2749999999999 }, testRun: {} },
          data: {
            nodeMeta: {
              title: '选择器',
              icon: 'icon-Condition.png',
              description:
                '连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支',
              subTitle: '选择器',
            },
            inputs: {
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
        },
        {
          id: '177333',
          type: '8',
          meta: {
            position: { x: 605.232202490925, y: 1181.6239329643074 },
            testRun: {},
          },
          data: {
            nodeMeta: {
              title: '选择器_1',
              icon: 'icon-Condition.png',
              description:
                '连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支',
              subTitle: '选择器',
            },
            inputs: {
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
        },
        {
          id: '194199',
          type: '19',
          meta: {
            position: { x: 1392.7451026293097, y: 1334.5997332410768 },
            testRun: {},
          },
          data: {
            nodeMeta: {
              title: '终止循环',
              icon: 'icon-Break.png',
              description: '用于立即终止当前所在的循环，跳出循环体',
              subTitle: '终止循环',
            },
          },
        },
      ],
      edges: [
        { sourceNodeID: '146923', targetNodeID: '149710' },
        {
          sourceNodeID: '179778',
          targetNodeID: '185397',
          sourcePortID: 'false',
        },
        {
          sourceNodeID: '179778',
          targetNodeID: '123896',
          sourcePortID: 'true',
        },
        { sourceNodeID: '149710', targetNodeID: '179778' },
        {
          sourceNodeID: '177333',
          targetNodeID: '194199',
          sourcePortID: 'true',
        },
      ],
    },
  ],
  edges: [
    { sourceNodeID: '100001', targetNodeID: '190950' },
    { sourceNodeID: '190950', targetNodeID: '154650' },
    { sourceNodeID: '154650', targetNodeID: '900001' },
    { sourceNodeID: '111943', targetNodeID: '900001' },
    { sourceNodeID: '190950', targetNodeID: '183818' },
    { sourceNodeID: '183818', targetNodeID: '900001', sourcePortID: 'true' },
    { sourceNodeID: '183818', targetNodeID: '111943', sourcePortID: 'false' },
    { sourceNodeID: '190950', targetNodeID: '163608' },
    { sourceNodeID: '163608', targetNodeID: '150706' },
    { sourceNodeID: '150706', targetNodeID: '900001' },
    { sourceNodeID: '190950', targetNodeID: '111943' },
    { sourceNodeID: '190950', targetNodeID: '193063' },
    { sourceNodeID: '193063', targetNodeID: '900001' },
    { sourceNodeID: '190950', targetNodeID: '139426' },
    { sourceNodeID: '139426', targetNodeID: '900001' },
    {
      sourceNodeID: '184010',
      targetNodeID: '900001',
      sourcePortID: 'loop-output',
    },
    { sourceNodeID: '100001', targetNodeID: '184010' },
  ],
};

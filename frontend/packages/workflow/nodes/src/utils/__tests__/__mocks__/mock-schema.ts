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

export const mockSchemaForLLM = {
  nodes: [
    {
      blocks: [],
      data: {
        nodeMeta: {
          description: '工作流的起始节点，用于设定启动工作流需要的信息',
          icon: 'icon-Start-v2.jpg',
          subTitle: '',
          title: '开始',
        },
        outputs: [
          {
            name: 'input',
            required: false,
            type: 'string',
          },
          {
            name: 'arr_input',
            required: false,
            schema: {
              type: 'string',
            },
            type: 'list',
          },
          {
            assistType: 2,
            name: 'img',
            required: false,
            type: 'string',
          },
        ],
        trigger_parameters: [
          {
            name: 'input',
            required: false,
            type: 'string',
          },
          {
            name: 'arr_input',
            required: false,
            schema: {
              type: 'string',
            },
            type: 'list',
          },
          {
            assistType: 2,
            name: 'img',
            required: false,
            type: 'string',
          },
        ],
      },
      edges: null,
      id: '100001',
      meta: {
        position: {
          x: 180,
          y: 39,
        },
      },
      type: '1',
    },
    {
      blocks: [],
      data: {
        inputs: {
          inputParameters: [
            {
              input: {
                schema: {
                  type: 'string',
                },
                type: 'list',
                value: {
                  content: {
                    blockID: '160281',
                    name: 'output',
                    source: 'block-output',
                  },
                  rawMeta: {
                    type: 99,
                  },
                  type: 'ref',
                },
              },
              name: 'output',
            },
          ],
          terminatePlan: 'returnVariables',
        },
        nodeMeta: {
          description: '工作流的最终节点，用于返回工作流运行后的结果信息',
          icon: 'icon-End-v2.jpg',
          subTitle: '',
          title: '结束',
        },
      },
      edges: null,
      id: '900001',
      meta: {
        position: {
          x: 1760,
          y: 26,
        },
      },
      type: '2',
    },
    {
      blocks: [],
      data: {
        inputs: {
          inputParameters: [
            {
              input: {
                type: 'string',
                value: {
                  content: {
                    blockID: '100001',
                    name: 'input',
                    source: 'block-output',
                  },
                  rawMeta: {
                    type: 1,
                  },
                  type: 'ref',
                },
              },
              name: 'input',
            },
          ],
          llmParam: [
            {
              input: {
                type: 'float',
                value: {
                  content: '0.8',
                  rawMeta: {
                    type: 4,
                  },
                  type: 'literal',
                },
              },
              name: 'temperature',
            },
            {
              input: {
                type: 'integer',
                value: {
                  content: '4096',
                  rawMeta: {
                    type: 2,
                  },
                  type: 'literal',
                },
              },
              name: 'maxTokens',
            },
            {
              input: {
                type: 'integer',
                value: {
                  content: '2',
                  rawMeta: {
                    type: 2,
                  },
                  type: 'literal',
                },
              },
              name: 'responseFormat',
            },
            {
              input: {
                type: 'string',
                value: {
                  content: '豆包·1.5·Pro·32k',
                  rawMeta: {
                    type: 1,
                  },
                  type: 'literal',
                },
              },
              name: 'modleName',
            },
            {
              input: {
                type: 'integer',
                value: {
                  content: '1737521813',
                  rawMeta: {
                    type: 2,
                  },
                  type: 'literal',
                },
              },
              name: 'modelType',
            },
            {
              input: {
                type: 'string',
                value: {
                  content: 'balance',
                  rawMeta: {
                    type: 1,
                  },
                  type: 'literal',
                },
              },
              name: 'generationDiversity',
            },
            {
              input: {
                type: 'string',
                value: {
                  content: '{{input}}',
                  rawMeta: {
                    type: 1,
                  },
                  type: 'literal',
                },
              },
              name: 'prompt',
            },
            {
              input: {
                type: 'boolean',
                value: {
                  content: false,
                  rawMeta: {
                    type: 3,
                  },
                  type: 'literal',
                },
              },
              name: 'enableChatHistory',
            },
            {
              input: {
                type: 'integer',
                value: {
                  content: '3',
                  rawMeta: {
                    type: 2,
                  },
                  type: 'literal',
                },
              },
              name: 'chatHistoryRound',
            },
            {
              input: {
                type: 'string',
                value: {
                  content: '',
                  rawMeta: {
                    type: 1,
                  },
                  type: 'literal',
                },
              },
              name: 'systemPrompt',
            },
          ],
          settingOnError: {
            processType: 1,
            retryTimes: 0,
            timeoutMs: 180000,
          },
        },
        nodeMeta: {
          description: '调用大语言模型,使用变量和提示词生成回复',
          icon: 'icon-LLM-v2.jpg',
          mainColor: '#5C62FF',
          subTitle: '大模型',
          title: '大模型',
        },
        outputs: [
          {
            name: 'output',
            type: 'string',
          },
        ],
        version: '3',
      },
      edges: null,
      id: '181515',
      meta: {
        position: {
          x: 640,
          y: 0,
        },
      },
      type: '3',
    },
    {
      blocks: [
        {
          blocks: [],
          data: {
            inputs: {
              inputParameters: [
                {
                  input: {
                    type: 'string',
                    value: {
                      content: {
                        blockID: '100001',
                        name: 'input',
                        source: 'block-output',
                      },
                      rawMeta: {
                        type: 1,
                      },
                      type: 'ref',
                    },
                  },
                  name: 'input',
                },
                {
                  input: {
                    assistType: 2,
                    type: 'string',
                    value: {
                      content: {
                        blockID: '100001',
                        name: 'img',
                        source: 'block-output',
                      },
                      rawMeta: {
                        isVision: true,
                        type: 7,
                      },
                      type: 'ref',
                    },
                  },
                  name: 'img',
                },
              ],
              llmParam: [
                {
                  input: {
                    type: 'float',
                    value: {
                      content: '0.8',
                      rawMeta: {
                        type: 4,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'temperature',
                },
                {
                  input: {
                    type: 'float',
                    value: {
                      content: '0.7',
                      rawMeta: {
                        type: 4,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'topP',
                },
                {
                  input: {
                    type: 'float',
                    value: {
                      content: '0',
                      rawMeta: {
                        type: 4,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'frequencyPenalty',
                },
                {
                  input: {
                    type: 'integer',
                    value: {
                      content: '4096',
                      rawMeta: {
                        type: 2,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'maxTokens',
                },
                {
                  input: {
                    type: 'integer',
                    value: {
                      content: '2',
                      rawMeta: {
                        type: 2,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'responseFormat',
                },
                {
                  input: {
                    type: 'string',
                    value: {
                      content: '豆包·1.5·Pro·视觉推理·128K\t',
                      rawMeta: {
                        type: 1,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'modleName',
                },
                {
                  input: {
                    type: 'integer',
                    value: {
                      content: '1745219190',
                      rawMeta: {
                        type: 2,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'modelType',
                },
                {
                  input: {
                    type: 'string',
                    value: {
                      content: 'balance',
                      rawMeta: {
                        type: 1,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'generationDiversity',
                },
                {
                  input: {
                    type: 'string',
                    value: {
                      content: '图片{{img}}中有什么？',
                      rawMeta: {
                        type: 1,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'prompt',
                },
                {
                  input: {
                    type: 'boolean',
                    value: {
                      content: false,
                      rawMeta: {
                        type: 3,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'enableChatHistory',
                },
                {
                  input: {
                    type: 'integer',
                    value: {
                      content: '3',
                      rawMeta: {
                        type: 2,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'chatHistoryRound',
                },
                {
                  input: {
                    type: 'string',
                    value: {
                      content: '',
                      rawMeta: {
                        type: 1,
                      },
                      type: 'literal',
                    },
                  },
                  name: 'systemPrompt',
                },
              ],
              settingOnError: {
                processType: 1,
                retryTimes: 0,
                timeoutMs: 180000,
              },
            },
            nodeMeta: {
              description: '调用大语言模型,使用变量和提示词生成回复',
              icon: 'icon-LLM-v2.jpg',
              mainColor: '#5C62FF',
              subTitle: '大模型',
              title: '大模型_1',
            },
            outputs: [
              {
                name: 'output',
                type: 'string',
              },
              {
                name: 'reasoning_content',
                type: 'string',
              },
            ],
            version: '3',
          },
          edges: null,
          id: '189239',
          meta: {
            position: {
              x: 180,
              y: 0,
            },
          },
          type: '3',
        },
      ],
      data: {
        inputs: {
          inputParameters: [
            {
              input: {
                schema: {
                  type: 'string',
                },
                type: 'list',
                value: {
                  content: {
                    blockID: '100001',
                    name: 'arr_input',
                    source: 'block-output',
                  },
                  rawMeta: {
                    type: 99,
                  },
                  type: 'ref',
                },
              },
              name: 'input',
            },
          ],
          loopCount: {
            type: 'integer',
            value: {
              content: '10',
              type: 'literal',
            },
          },
          loopType: 'array',
          variableParameters: [],
        },
        nodeMeta: {
          description: '用于通过设定循环次数和逻辑，重复执行一系列任务',
          icon: 'icon-Loop-v2.jpg',
          mainColor: '#00B2B2',
          subTitle: '循环',
          title: '循环',
        },
        outputs: [
          {
            input: {
              schema: {
                type: 'string',
              },
              type: 'list',
              value: {
                content: {
                  blockID: '189239',
                  name: 'output',
                  source: 'block-output',
                },
                rawMeta: {
                  type: 1,
                },
                type: 'ref',
              },
            },
            name: 'output',
          },
        ],
      },
      edges: [
        {
          sourceNodeID: '160281',
          targetNodeID: '189239',
          sourcePortID: 'loop-function-inline-output',
        },
        {
          sourceNodeID: '189239',
          targetNodeID: '160281',
          sourcePortID: '',
          targetPortID: 'loop-function-inline-input',
        },
      ],
      id: '160281',
      meta: {
        canvasPosition: {
          x: 1020,
          y: 331,
        },
        position: {
          x: 1200,
          y: 13,
        },
      },
      type: '21',
    },
  ],
  edges: [
    {
      sourceNodeID: '100001',
      targetNodeID: '181515',
      sourcePortID: '',
    },
    {
      sourceNodeID: '160281',
      targetNodeID: '900001',
      sourcePortID: 'loop-output',
    },
    {
      sourceNodeID: '181515',
      targetNodeID: '160281',
      sourcePortID: '',
    },
  ],
  versions: {
    loop: 'v2',
  },
};

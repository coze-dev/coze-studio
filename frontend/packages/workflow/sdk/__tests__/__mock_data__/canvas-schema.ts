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

export const mockCanvasSchema = {
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
            defaultValue: '2000',
            name: 'timeout',
            required: false,
            type: 'integer',
          },
        ],
        trigger_parameters: [],
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
                type: 'string',
                value: {
                  content: {
                    blockID: '126762',
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
          x: 1560,
          y: 26,
        },
      },
      type: '2',
    },
    {
      blocks: [],
      data: {
        inputs: {
          code: '// 在这里，您可以通过 ‘params’  获取节点中的输入变量，并通过 \'ret\' 输出结果\n// \'params\' 和 \'ret\' 已经被正确地注入到环境中\n// 下面是一个示例，获取节点输入中参数名为‘input’的值：\n// const input = params.input; \n// 下面是一个示例，输出一个包含多种数据类型的 \'ret\' 对象：\n// const ret = { "name": ‘小明’, "hobbies": [“看书”, “旅游”] };\n\nasync function main({ params }: Args): Promise<Output> {\n    const wait = ms => new Promise(resolve => {\n            setTimeout(() => resolve(\'请回答问题：\'), ms);\n        });\n\n    const r = await wait(params.timeout);\n\n    // 构建输出对象\n    const ret = {\n        "key0": r + params.input, // 拼接两次入参 input 的值\n        "key1": ["hello", "world"], // 输出一个数组\n        "key2": { // 输出一个Object\n            "key21": "hi"\n        },\n    };\n\n    return ret;\n}',
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
                type: 'integer',
                value: {
                  content: {
                    blockID: '100001',
                    name: 'timeout',
                    source: 'block-output',
                  },
                  rawMeta: {
                    type: 2,
                  },
                  type: 'ref',
                },
              },
              name: 'timeout',
            },
          ],
          language: 5,
          settingOnError: {
            processType: 1,
            retryTimes: 0,
            timeoutMs: 60000,
          },
        },
        nodeMeta: {
          description: '编写代码，处理输入变量来生成返回值',
          icon: 'icon-Code-v2.jpg',
          mainColor: '#00B2B2',
          subTitle: '代码',
          title: '代码',
        },
        outputs: [
          {
            name: 'key0',
            type: 'string',
          },
          {
            name: 'key1',
            schema: {
              type: 'string',
            },
            type: 'list',
          },
          {
            name: 'key2',
            schema: [
              {
                name: 'key21',
                type: 'string',
              },
            ],
            type: 'object',
          },
        ],
      },
      edges: null,
      id: '172934',
      meta: {
        position: {
          x: 640,
          y: 26,
        },
      },
      type: '5',
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
                    blockID: '172934',
                    name: 'key0',
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
      id: '126762',
      meta: {
        position: {
          x: 1100,
          y: 0,
        },
      },
      type: '3',
    },
  ],
  edges: [
    {
      sourceNodeID: '100001',
      targetNodeID: '172934',
      sourcePortID: '',
    },
    {
      sourceNodeID: '126762',
      targetNodeID: '900001',
      sourcePortID: '',
    },
    {
      sourceNodeID: '172934',
      targetNodeID: '126762',
      sourcePortID: '',
    },
  ],
  versions: {
    loop: 'v2',
  },
};

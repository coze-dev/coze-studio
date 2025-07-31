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

export const imageflowSchemaJSON = {
  nodes: [
    {
      id: '100001',
      type: '1',
      meta: { position: { x: 0, y: 0 } },
      data: {
        outputs: [
          { type: 'string', name: 'ss', required: true },
          { type: 'float', name: 'sss', required: true },
        ],
        nodeMeta: {
          title: '开始',
          icon: 'icon-Start.png',
          description: '工作流的起始节点，用于设定启动工作流需要的信息',
          subTitle: '',
        },
      },
    },
    {
      id: '900001',
      type: '2',
      meta: { position: { x: 305.67163461538473, y: 600.1374999999998 } },
      data: {
        nodeMeta: {
          title: '结束',
          icon: 'icon-End.png',
          description: '工作流的最终节点，用于返回工作流运行后的结果信息',
          subTitle: '',
        },
        inputs: {
          terminatePlan: 'returnVariables',
          inputParameters: [
            {
              name: 'output',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'ss',
                  },
                },
              },
            },
            {
              name: 'sss',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'ss' },
              },
            },
          ],
          streamingOutput: false,
        },
      },
    },
    {
      id: '164069',
      type: '4',
      meta: { position: { x: -455, y: 338.06874999999997 } },
      data: {
        nodeMeta: {
          title: '文生图',
          icon: 'icon_Text-to-Image-CN.png',
          isFromImageflow: true,
          description: '通过文字描述生成图片',
        },
        inputs: {
          apiParam: [
            {
              name: 'apiID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7352834806217981963' },
              },
            },
            {
              name: 'apiName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'text2image' },
              },
            },
            {
              name: 'pluginID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7352834694330794023' },
              },
            },
            {
              name: 'pluginName',
              input: {
                type: 'string',
                value: { type: 'literal', content: '文生图' },
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
              name: 'prompt',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'ss',
                  },
                },
              },
            },
            {
              name: 'ratio',
              input: {
                type: 'float',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'sss',
                  },
                },
              },
            },
            {
              name: 'width',
              input: {
                type: 'float',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'sss',
                  },
                },
              },
            },
            {
              name: 'height',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'ss',
                  },
                },
              },
            },
          ],
        },
        outputs: [
          { type: 'image', name: 'data', required: false },
          { type: 'string', name: 'msg', required: false },
        ],
      },
    },
    {
      id: '164578',
      type: '4',
      meta: { position: { x: -543, y: 937.0687499999999 } },
      data: {
        nodeMeta: {
          title: '智能换脸',
          icon: 'icon_AI-FaceSwap.png',
          isFromImageflow: true,
          description: '为图片替换参考图的人脸',
        },
        inputs: {
          apiParam: [
            {
              name: 'apiID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7352888732107915305' },
              },
            },
            {
              name: 'apiName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'smartFaceChanging' },
              },
            },
            {
              name: 'pluginID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7352887570142969875' },
              },
            },
            {
              name: 'pluginName',
              input: {
                type: 'string',
                value: { type: 'literal', content: '智能换脸' },
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
              name: 'reference_picture_url',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'ss',
                  },
                },
              },
            },
            {
              name: 'skin',
              input: {
                type: 'image',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '164069',
                    name: 'data',
                  },
                },
              },
            },
            {
              name: 'template_picture_url',
              input: {
                type: 'string',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '164069',
                    name: 'msg',
                  },
                },
              },
            },
          ],
        },
        outputs: [{ type: 'image', name: 'data', required: false }],
      },
    },
    {
      id: '146804',
      type: '4',
      meta: { position: { x: -17, y: 1182.06875 } },
      data: {
        nodeMeta: {
          title: '提示词优化',
          icon: 'icon_PromptOptimization.png',
          isFromImageflow: true,
          description: '智能优化图像提示词',
        },
        inputs: {
          apiParam: [
            {
              name: 'apiID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7360989981134864399' },
              },
            },
            {
              name: 'apiName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'sd_better_prompt' },
              },
            },
            {
              name: 'pluginID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7360989829062230050' },
              },
            },
            {
              name: 'pluginName',
              input: {
                type: 'string',
                value: { type: 'literal', content: '提示词优化' },
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
              name: 'prompt',
              input: {
                type: 'image',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '140741',
                    name: 'data',
                  },
                },
              },
            },
          ],
        },
        outputs: [{ type: 'string', name: 'data', required: false }],
      },
    },
    {
      id: '140741',
      type: '4',
      meta: { position: { x: -379.44467504743835, y: 1532.3798149905122 } },
      data: {
        nodeMeta: {
          title: '亮度',
          icon: 'icon_Brightness.png',
          isFromImageflow: true,
          description: '改变图片亮度',
        },
        inputs: {
          apiParam: [
            {
              name: 'apiID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7355822909170073600' },
              },
            },
            {
              name: 'apiName',
              input: {
                type: 'string',
                value: { type: 'literal', content: 'image_light' },
              },
            },
            {
              name: 'pluginID',
              input: {
                type: 'string',
                value: { type: 'literal', content: '7355822909170057216' },
              },
            },
            {
              name: 'pluginName',
              input: {
                type: 'string',
                value: { type: 'literal', content: '亮度' },
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
              name: 'bright',
              input: {
                type: 'float',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '100001',
                    name: 'sss',
                  },
                },
              },
            },
            {
              name: 'origin_url',
              input: {
                type: 'image',
                value: {
                  type: 'ref',
                  content: {
                    source: 'block-output',
                    blockID: '164069',
                    name: 'data',
                  },
                },
              },
            },
          ],
        },
        outputs: [{ type: 'image', name: 'data', required: false }],
      },
    },
  ],
  edges: [
    { sourceNodeID: '100001', targetNodeID: '164069' },
    { sourceNodeID: '164069', targetNodeID: '164578' },
    { sourceNodeID: '164578', targetNodeID: '140741' },
    { sourceNodeID: '140741', targetNodeID: '146804' },
    { sourceNodeID: '146804', targetNodeID: '900001' },
  ],
};

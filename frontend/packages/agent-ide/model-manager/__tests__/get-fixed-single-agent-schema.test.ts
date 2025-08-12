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

import { getFixedSingleAgentSchema } from '../src/utils/model/get-fixed-single-agent-schema';
import {
  ModelFormComponent,
  ModelFormVoidFieldComponent,
} from '../src/constant/model-form-component';

vi.mock('@coze-studio/bot-detail-store', () => ({}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: () => 'mockedI18n',
  },
}));

describe('get-fixed-single-agent-schema', () => {
  it('should fixed correctly', () => {
    const prevSchema = {
      type: 'object',
      properties: {
        1: {
          type: 'void',
          'x-decorator':
            ModelFormVoidFieldComponent.ModelFormGenerationDiversityGroupItem,
          'x-decorator-props': {
            title: '生成多样性',
          },
          'x-index': 1,
          properties: {
            temperature: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: 0,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '回复随机性',
                popoverContent:
                  '即 Temperature，较高的 Temperature 会让模型生成更多样和创新的文本，反之生成内容会更加保守且类似于训练数据。',
              },
              'x-index': 1,
            },
            top_p: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 1,
                min: 0,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: 'Top P',
                popoverContent:
                  '设定Top p概率阈值，模型在生成文本时只从概率超过阈值的词汇中选择，从而控制文本的多样性',
              },
              'x-index': 2,
            },
            frequency_penalty: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: -2,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '重复词汇惩罚',
                popoverContent:
                  '当该值为正时，它会降低已出现词汇的重复率，进而提高模型输出词汇的多样性',
              },
              'x-index': 3,
            },
            presence_penalty: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: -2,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '存在惩罚',
                popoverContent:
                  '减少已提及内容的重复，增加新主题和概念的引入，促进内容的多元化。',
              },
              'x-index': 4,
            },
          },
        },
        2: {
          type: 'void',
          'x-decorator': ModelFormVoidFieldComponent.ModelFormGroupItem,
          'x-decorator-props': {
            title: '输入及输出长度',
          },
          'x-index': 2,
          properties: {
            max_tokens: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 16384,
                min: 1,
                step: 1,
                decimalPlaces: 0,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '最大回复长度',
                popoverContent:
                  '可控制模型回复的最多 Token 数量，以满足不同场景和需求。通常 100 Tokens 约等于 60 个中文汉字。',
              },
              'x-index': 1,
            },
            response_format: {
              type: 'number',
              'x-component': ModelFormComponent.RadioButton,
              'x-component-props': {
                type: 'button',
                options: [
                  {
                    label: '文本',
                    value: 0,
                  },
                  {
                    label: 'Markdown',
                    value: 1,
                  },
                ],
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '输出格式',
                popoverContent:
                  '文本: 使用普通文本格式回复Markdown: 将强制模型使用Markdown格式输出回复\nJSON: 将强制模型使用 JSON 格式输出回复',
              },
              'x-index': 2,
            },
          },
        },
      },
    };
    const res = getFixedSingleAgentSchema(prevSchema);

    expect(res).toStrictEqual({
      type: 'object',
      properties: {
        1: {
          type: 'void',
          'x-decorator':
            ModelFormVoidFieldComponent.ModelFormGenerationDiversityGroupItem,
          'x-decorator-props': {
            title: '生成多样性',
          },
          'x-index': 1,
          properties: {
            temperature: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: 0,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '回复随机性',
                popoverContent:
                  '即 Temperature，较高的 Temperature 会让模型生成更多样和创新的文本，反之生成内容会更加保守且类似于训练数据。',
              },
              'x-index': 1,
            },
            top_p: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 1,
                min: 0,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: 'Top P',
                popoverContent:
                  '设定Top p概率阈值，模型在生成文本时只从概率超过阈值的词汇中选择，从而控制文本的多样性',
              },
              'x-index': 2,
            },
            frequency_penalty: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: -2,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '重复词汇惩罚',
                popoverContent:
                  '当该值为正时，它会降低已出现词汇的重复率，进而提高模型输出词汇的多样性',
              },
              'x-index': 3,
            },
            presence_penalty: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 2,
                min: -2,
                step: 0.01,
                decimalPlaces: 2,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '存在惩罚',
                popoverContent:
                  '减少已提及内容的重复，增加新主题和概念的引入，促进内容的多元化。',
              },
              'x-index': 4,
            },
          },
        },
        2: {
          type: 'void',
          'x-decorator': ModelFormVoidFieldComponent.ModelFormGroupItem,
          'x-decorator-props': {
            title: '输入及输出长度',
          },
          'x-index': 2,
          properties: {
            HistoryRound: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-component-props': {
                step: 1,
                max: 100,
                min: 0,
                decimalPlaces: 0,
              },
              'x-decorator-props': {
                label: 'mockedI18n',
                popoverContent: 'mockedI18n',
              },
              // Put it up front.
              'x-index': 0,
            },
            max_tokens: {
              type: 'number',
              'x-component': ModelFormComponent.SliderInputNumber,
              'x-component-props': {
                max: 16384,
                min: 1,
                step: 1,
                decimalPlaces: 0,
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '最大回复长度',
                popoverContent:
                  '可控制模型回复的最多 Token 数量，以满足不同场景和需求。通常 100 Tokens 约等于 60 个中文汉字。',
              },
              'x-index': 1,
            },
            response_format: {
              type: 'number',
              'x-component': ModelFormComponent.RadioButton,
              'x-component-props': {
                type: 'button',
                options: [
                  {
                    label: '文本',
                    value: 0,
                  },
                  {
                    label: 'Markdown',
                    value: 1,
                  },
                ],
              },
              'x-decorator': ModelFormComponent.ModelFormItem,
              'x-decorator-props': {
                label: '输出格式',
                popoverContent:
                  '文本: 使用普通文本格式回复Markdown: 将强制模型使用Markdown格式输出回复\nJSON: 将强制模型使用 JSON 格式输出回复',
              },
              'x-index': 2,
            },
          },
        },
      },
    });
  });
});

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

export const mockLLMModels = {
  code: 0,
  msg: 'success',
  data: {
    model_list: [
      {
        name: '豆包·1.5·Pro·32k',
        model_type: 1737521813,
        model_class: 2,
        model_icon: 'doubao_v2.png',
        model_input_price: 0,
        model_output_price: 0,
        model_quota: {
          token_limit: 32768,
          token_resp: 4096,
          token_system: 0,
          token_user_in: 32768,
          token_tools_in: 0,
          token_tools_out: 0,
          token_data: 0,
          token_history: 0,
          token_cut_switch: false,
          price_in: 0,
          price_out: 0,
        },
        model_name: 'ep-20250122125445-ck9wp',
        model_class_name: '豆包系列模型',
        is_offline: false,
        model_params: [
          {
            name: 'temperature',
            label: '生成随机性',
            desc: '- **temperature**: 调高温度会使得模型的输出更多样性和创新性，反之，降低温度会使输出内容更加遵循指令要求但减少多样性。建议不要与“Top p”同时调整。',
            type: 1,
            min: '0',
            max: '1',
            precision: 1,
            default_val: {
              default_val: '1',
              creative: '1',
              balance: '0.8',
              precise: '0.3',
            },
            options: [],
            param_class: {
              class_id: 1,
              label: '生成多样性',
            },
          },
          {
            name: 'max_tokens',
            label: '最大回复长度',
            desc: '控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于 150 个中文汉字。',
            type: 2,
            min: '1',
            max: '12288',
            precision: 0,
            default_val: {
              default_val: '4096',
            },
            options: [],
            param_class: {
              class_id: 2,
              label: '输入及输出设置',
            },
          },
        ],
        model_desc: [
          {
            group_name: '### 功能特点：',
            desc: [
              '- 支持Function calling能力（提供更准确、稳定的工具调用能力）',
              '- 输入的长度支持最长32768个Tokens（约49152个中文字符）',
              '- 节点ID：ep-20250122125445-ck9wp',
            ],
          },
        ],
        model_tag_list: [
          {
            tag_name: '文本模型',
            tag_class: 1,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: '旗舰',
            tag_class: 3,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: '工具调用',
            tag_class: 16,
            tag_icon: '',
            tag_descriptions: '',
          },
        ],
        is_up_required: false,
        model_brief_desc:
          'Doubao-1.5-pro-32k，全新一代主力模型，性能全面升级，在知识、代码、推理、等方面表现卓越。支持32k上下文窗口，输出长度支持最大12k tokens。',
        model_series: {
          series_name: '热门模型',
          icon_url: 'doubao_v2.png',
          model_vendor: '扣子',
        },
        model_status_details: {
          is_new_model: false,
          is_advanced_model: false,
          is_free_model: false,
          is_upcoming_deprecated: false,
          deprecated_date: '',
          replace_model_name: '',
          update_info: '',
          model_feature: 1,
        },
        model_ability: {
          function_call: true,
          image_understanding: false,
          video_understanding: false,
          audio_understanding: false,
        },
        model_show_family_id: '7287388636726274',
        hot_flag: 1,
        hot_ranking: 100,
        online_time: 1737874220,
        offline_time: 0,
      },
      {
        name: '豆包·工具调用',
        model_type: 1706077826,
        model_class: 2,
        model_icon: 'doubao_v2.png',
        model_input_price: 0,
        model_output_price: 0,
        model_quota: {
          token_limit: 32768,
          token_resp: 4096,
          token_system: 0,
          token_user_in: 0,
          token_tools_in: 0,
          token_tools_out: 0,
          token_data: 0,
          token_history: 0,
          token_cut_switch: false,
          price_in: 0,
          price_out: 0,
        },
        model_name: 'ep-20250103114050-hgnz5',
        model_class_name: '豆包系列模型',
        is_offline: false,
        model_params: [
          {
            name: 'temperature',
            label: '生成随机性',
            desc: '- **temperature**: 调高温度会使得模型的输出更多样性和创新性，反之，降低温度会使输出内容更加遵循指令要求但减少多样性。建议不要与“Top p”同时调整。',
            type: 1,
            min: '0',
            max: '1',
            precision: 2,
            default_val: {
              default_val: '1',
              creative: '1',
              balance: '1',
              precise: '0.1',
            },
            options: [],
            param_class: {
              class_id: 1,
              label: '生成多样性',
            },
          },
          {
            name: 'top_p',
            label: 'Top P',
            desc: '- **Top p 为累计概率**: 模型在生成输出时会从概率最高的词汇开始选择，直到这些词汇的总概率累积达到Top p 值。这样可以限制模型只选择这些高概率的词汇，从而控制输出内容的多样性。建议不要与“生成随机性”同时调整。',
            type: 1,
            min: '0',
            max: '1',
            precision: 2,
            default_val: {
              default_val: '0.7',
              creative: '0.8',
              balance: '0.7',
              precise: '0.7',
            },
            options: [],
            param_class: {
              class_id: 1,
              label: '生成多样性',
            },
          },
          {
            name: 'response_format',
            label: '输出格式',
            desc: '- **文本**: 使用普通文本格式回复\n- **Markdown**: 将引导模型使用Markdown格式输出回复\n- **JSON**: 将引导模型使用JSON格式输出',
            type: 2,
            min: '',
            max: '',
            precision: 0,
            default_val: {
              default_val: '0',
            },
            options: [
              {
                label: '文本',
                value: '0',
              },
              {
                label: 'Markdown',
                value: '1',
              },
            ],
            param_class: {
              class_id: 2,
              label: '输入及输出设置',
            },
          },
          {
            name: 'max_tokens',
            label: '最大回复长度',
            desc: '控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于 150 个中文汉字。',
            type: 2,
            min: '5',
            max: '4096',
            precision: 0,
            default_val: {
              default_val: '1024',
            },
            options: [],
            param_class: {
              class_id: 2,
              label: '输入及输出设置',
            },
          },
        ],
        model_desc: [
          {
            group_name: '### 功能特点：',
            desc: [
              '- 支持Function calling能力（提供更准确、稳定的工具调用能力）',
              '- 节点ID：ep-20250103114050-hgnz5',
            ],
          },
        ],
        model_tag_list: [
          {
            tag_name: '文本模型',
            tag_class: 1,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: '工具调用',
            tag_class: 3,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: '支持微调',
            tag_class: 4,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: 'functionCall',
            tag_class: 4,
            tag_icon: '',
            tag_descriptions: '',
          },
          {
            tag_name: '工具调用',
            tag_class: 16,
            tag_icon: '',
            tag_descriptions: '',
          },
        ],
        is_up_required: false,
        model_brief_desc:
          'Doubao-pro-32k/241215，主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持32k上下文窗口的推理和精调。',
        model_series: {
          series_name: '豆包系列',
          icon_url: 'doubao_v2.png',
          model_vendor: '字节跳动',
        },
        model_status_details: {
          is_new_model: false,
          is_advanced_model: false,
          is_free_model: false,
          is_upcoming_deprecated: false,
          deprecated_date: '',
          replace_model_name: '',
          update_info: '',
          model_feature: 3,
        },
        model_ability: {
          function_call: true,
          image_understanding: false,
          video_understanding: false,
          audio_understanding: false,
        },
        model_show_family_id: '7287388636726274',
        hot_flag: 0,
        hot_ranking: 0,
        online_time: 1706247332,
        offline_time: 0,
      },
    ],
    voice_list: null,
    raw_model_list: null,
    model_show_family_list: [
      {
        id: 7287388636726274,
        icon: 'MODEL_ICON/CUSTOM/af087406da7641beacf2b33c538d64fd_豆包.png',
        iconUrl: 'CUSTOM/af087406da7641beacf2b33c538d64fd_豆包.png',
        name: '豆包大模型',
        ranking: 1,
      },
    ],
    default_model_id: 1737521813,
  },
};

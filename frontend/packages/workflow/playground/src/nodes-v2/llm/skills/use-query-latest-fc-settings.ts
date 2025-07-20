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
 
import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@coze-workflow/base/api';

import { useGlobalState } from '@/hooks';

import {
  type WorkflowFCSetting,
  type KnowledgeGlobalSetting,
  type PluginFCSetting,
} from './types';

// const mockSettings = {
//           plugin_fc_setting: {
//             request_params: [
//               {
//                 name: 'fieldName',
//                 type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                 sub_type: 1,
//                 location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                 is_required: false,
//                 sub_parameters: [
//                   {
//                     name: 'fieldName',
//                     type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                     sub_type: 1,
//                     location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                     is_required: false,
//                     local_default: '', // 默认值
//                     local_disable: false, // 是否启用
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default: '', // 默认值
//                 local_disable: false, // 是否启用
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_params: [
//               {
//                 name: 'fieldName',
//                 type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                 sub_type: 1,
//                 location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                 is_required: false,
//                 sub_parameters: [
//                   {
//                     name: 'fieldName',
//                     type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                     sub_type: 1,
//                     location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                     is_required: false,
//                     local_default: '', // 默认值
//                     local_disable: false, // 是否启用
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default: '', // 默认值
//                 local_disable: false, // 是否启用
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_style: {
//               mode: 1, // Raw      = 0, // 原始输出 Card     = 1, // 渲染成卡片 Template = 2, // 包含变量的模板内容，用jinja2渲染 TODO
//             },
//           },
//           workflow_fc_setting: {
//             request_params: [
//               {
//                 name: 'fieldName',
//                 type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                 sub_type: 1,
//                 location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                 is_required: false,
//                 sub_parameters: [
//                   {
//                     name: 'fieldName',
//                     type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                     sub_type: 1,
//                     location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                     is_required: false,
//                     local_default: '', // 默认值
//                     local_disable: false, // 是否启用
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default: '', // 默认值
//                 local_disable: false, // 是否启用
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_params: [
//               {
//                 name: 'fieldName',
//                 type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                 sub_type: 1,
//                 location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                 is_required: false,
//                 sub_parameters: [
//                   {
//                     name: 'fieldName',
//                     type: 1, // String  = 1, Integer = 2, Number  = 3, Object  = 4, Array   = 5, Bool    = 6,
//                     sub_type: 1,
//                     location: 1, // Path   = 1, Query  = 2, Body   = 3, Header = 4,
//                     is_required: false,
//                     local_default: '', // 默认值
//                     local_disable: false, // 是否启用
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default: '', // 默认值
//                 local_disable: false, // 是否启用
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_style: {
//               mode: 1, // Raw      = 0, // 原始输出 Card     = 1, // 渲染成卡片 Template = 2, // 包含变量的模板内容，用jinja2渲染 TODO
//             },
//           },
//           dataset_fc_setting: {
//             top_k: 5, // 召回数量
//             min_score: 0.46, // 召回的最小相似度阈值
//             auto: true, // 是否自动召回
//             search_mode: 1, // 搜索策略
//             no_recall_reply_mode: 1, // 无召回回复mode，默认0
//             no_recall_reply_customize_prompt:
//               '抱歉，您的问题超出了我的知识范围，并且无法在当前阶段回答', // 无召回回复时自定义prompt，当NoRecallReplyMode=1时生效
//             show_source: true, // 是否展示来源
//             show_source_mode: 1, // 来源展示方式 默认值0 卡片列表方式
//           },
//         }

export const useQueryLatestFCSettings = (params: { nodeId: string }) => {
  const { workflowId, spaceId } = useGlobalState();

  const mutation = useMutation({
    mutationFn: (options: {
      pluginFCSetting?: PluginFCSetting;
      workflowFCSetting?: WorkflowFCSetting;
      datasetFCSetting?: KnowledgeGlobalSetting;
    }) =>
      workflowApi.GetLLMNodeFCSettingsMerged({
        workflow_id: workflowId,
        space_id: spaceId,
        plugin_fc_setting: options.pluginFCSetting,
        workflow_fc_setting: options.workflowFCSetting,
      }),
    // return Promise.resolve({
    //   data: mockSettings,
    // });
  });

  return mutation;
};

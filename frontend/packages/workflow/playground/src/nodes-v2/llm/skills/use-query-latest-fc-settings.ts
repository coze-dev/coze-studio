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
//                     local_default : '', // default
//                     local_disable: false,//enabled
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default : '', // default
//                 local_disable: false,//enabled
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
//                     local_default : '', // default
//                     local_disable: false,//enabled
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default : '', // default
//                 local_disable: false,//enabled
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_style: {
//               Mode: 1,//Raw = 0,//Raw Output Card = 1,//Render as Card Template = 2,//Template content containing variables, render TODO with jinja2
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
//                     local_default : '', // default
//                     local_disable: false,//enabled
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default : '', // default
//                 local_disable: false,//enabled
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
//                     local_default : '', // default
//                     local_disable: false,//enabled
//                     assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//                   },
//                 ],
//                 local_default : '', // default
//                 local_disable: false,//enabled
//                 assist_type: 1, //DEFAULT = 1, IMAGE   = 2, DOC     = 3,CODE    = 4,PPT     = 5, TXT     = 6, EXCEL   = 7, AUDIO   = 8, ZIP     = 9,VIDEO   = 10,
//               },
//             ],
//             response_style: {
//               Mode: 1,//Raw = 0,//Raw Output Card = 1,//Render as Card Template = 2,//Template content containing variables, render TODO with jinja2
//             },
//           },
//           dataset_fc_setting: {
//             top_k: 5,//Recall Quantity
//             min_score: 0.46,//minimum similarity threshold for recall
//             Auto: true,//whether to recall automatically
//             search_mode: 1,//search strategy
//             no_recall_reply_mode: 1,//no recall reply mode, default 0
//             no_recall_reply_customize_prompt:
//               'Sorry, your question is beyond my knowledge and cannot be answered at this stage ',//Custom prompt when no recall reply, takes effect when NoRecallReplyMode = 1
//             show_source: true,//whether to show the source
//             show_source_mode: 1,//source display method, default value 0 card list method
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

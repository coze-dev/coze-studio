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

export const mockNodeResults = [
  {
    NodeName: 'start-node',
    NodeType: 'Start',
    errorInfo: '',
    errorLevel: '',
    executeId: '7509801470167547958',
    extra: '',
    input: '{"input":"世界上有多少个国家？","timeout":2000}',
    logVersion: 1,
    needAsync: false,
    nodeExeCost: '0.000s',
    nodeId: '100001',
    nodeStatus: 3,
    output: '{"input":"世界上有多少个国家？","timeout":2000}',
    raw_output: '{"input":"世界上有多少个国家？","timeout":2000}',
  },
  {
    NodeName: '结束',
    NodeType: 'End',
    errorInfo: '',
    errorLevel: '',
    executeId: '7509801470167547958',
    extra:
      '{"current_sub_execute_id":7509801470167547958,"response_extra":{"_WORKFLOW_INPUT_COST":"0","_WORKFLOW_INPUT_TOKEN":"19","_WORKFLOW_MODEL_CLASS":"9","_WORKFLOW_OUTPUT_COST":"0","_WORKFLOW_OUTPUT_TOKEN":"81","terminal_plan":1},"uuid":"1888900664","versions":{"commit_id":"Bot_7509424857970901004_Dev_3382534830832013_7509801338772242444","workflow_version":"v0.0.1"}}',
    input:
      '{"output":"截至2024年7月，世界上共有233个国家和地区，其中国家有197个（主权国家195个），地区有36个。\\n\\n联合国会员国目前有193个，此外梵蒂冈是联合国观察员国，巴勒斯坦是联合国观察员实体，这两个在国际上也被广泛承认为国家。 "}',
    logVersion: 1,
    needAsync: false,
    nodeExeCost: '0.000s',
    nodeId: '900001',
    nodeStatus: 3,
    output:
      '{"output":"截至2024年7月，世界上共有233个国家和地区，其中国家有197个（主权国家195个），地区有36个。\\n\\n联合国会员国目前有193个，此外梵蒂冈是联合国观察员国，巴勒斯坦是联合国观察员实体，这两个在国际上也被广泛承认为国家。 "}',
    tokenAndCost: {},
  },
  {
    NodeName: '代码',
    NodeType: 'Code',
    errorInfo: '',
    errorLevel: '',
    executeId: '7509801470167547958',
    extra:
      '{"current_sub_execute_id":7509801470167547958,"response_extra":{},"uuid":"1182674096","versions":{"commit_id":"Bot_7509424857970901004_Dev_3382534830832013_7509801338772242444","workflow_version":"v0.0.1"}}',
    input: '{"input":"世界上有多少个国家？","timeout":2000}',
    logVersion: 1,
    needAsync: false,
    nodeExeCost: '2s',
    nodeId: '172934',
    nodeStatus: 3,
    output:
      '{"key0":"请回答问题：世界上有多少个国家？","key1":["hello","world"],"key2":{"key21":"hi"}}',
    raw_output:
      '{"key0":"请回答问题：世界上有多少个国家？","key1":["hello","world"],"key2":{"key21":"hi"}}',
    tokenAndCost: {},
  },
  {
    NodeName: '大模型',
    NodeType: 'LLM',
    errorInfo: '',
    errorLevel: '',
    executeId: '7509801470167547958',
    extra:
      '{"current_sub_execute_id":7509801470167547958,"response_extra":{"fc_called_detail":{},"reasoning_content":""},"uuid":"1494046291","versions":{"commit_id":"Bot_7509424857970901004_Dev_3382534830832013_7509801338772242444","workflow_version":"v0.0.1"}}',
    input: '{"input":"请回答问题：世界上有多少个国家？"}',
    logVersion: 1,
    needAsync: false,
    nodeExeCost: '3s',
    nodeId: '126762',
    nodeStatus: 3,
    output:
      '{"output":"截至2024年7月，世界上共有233个国家和地区，其中国家有197个（主权国家195个），地区有36个。\\n\\n联合国会员国目前有193个，此外梵蒂冈是联合国观察员国，巴勒斯坦是联合国观察员实体，这两个在国际上也被广泛承认为国家。 "}',
    raw_output:
      '截至2024年7月，世界上共有233个国家和地区，其中国家有197个（主权国家195个），地区有36个。\n\n联合国会员国目前有193个，此外梵蒂冈是联合国观察员国，巴勒斯坦是联合国观察员实体，这两个在国际上也被广泛承认为国家。 ',
    tokenAndCost: {
      inputCost: '$0.00',
      inputTokens: '19 Tokens',
      outputCost: '$0.00',
      outputTokens: '81 Tokens',
      totalCost: '$0.00',
      totalTokens: '100 Tokens',
    },
  },
];

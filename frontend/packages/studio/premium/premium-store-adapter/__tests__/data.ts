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

import { type SubscriptionDetailV2 } from '@coze-arch/bot-api/trade';

export const mockUserBenefit = {
  user_basic_info: {
    user_level: 0,
    volc_account_info: {
      account_id: 12345,
      is_volcano_pro_account: false,
      instance_id: 'mock_instance_id',
      coze_instance_status: 1,
      instance_status: 1,
      volcano_user_type: 0,
    },
  },
  benefit_type_infos: {
    101: {
      used: 5,
      total: 10,
      strategy: 3,
      unit: 1,
      start_at: 1690000000,
      end_at: 1700000000,
    },
    102: {
      used: 5,
      total: 10,
      strategy: 3,
      unit: 1,
      start_at: 1690000000,
      end_at: 1700000000,
    },
  },
  resource_packages: [
    {
      package_name: 'Doubao pro 32k TPM扩容包',
      package_type: 1,
      start_at: '1690000000',
      end_at: '1700000000',
      total_quota: 100,
      remain_quota: 50,
      input_quota: 20,
      output_quota: 30,
    },
  ],
} as SubscriptionDetailV2;

export const mockPremiumPlansCN = [
  {
    member_version: 0,
    configuration_name: '免费版',
    configuration_remark: '团队提效或中小型应用PoC开发',
    price_info: {
      monthly_price: 69,
      annual_price: 690,
      annual_discount: 83,
    },
    right_overview: [
      '500资源点/天，不可增购',
      '模型每分钟请求数：300',
      '工作空间数量1，人数50',
      '知识库空间：1GB',
      'API累计500次调用',
      '日志存储3天',
    ],
    right_list: [
      {
        right_type_code: 'ModelAndResource',
        right_type_name: '模型和资源',
        right_type_remark: '',
        right: [
          {
            right_code: 'ResourcePackage',
            right_name: '资源点',
            right_remark: '备注',
            right_value_type: 'string',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'IncreaseModelRpm',
            right_name: '提升模型 RPM',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'bool', value: 'false' }],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    member_version: 110,
    configuration_name: '个人旗舰版',
    configuration_remark: '企业提效或大模型应用开发',
    price_info: {
      monthly_price: 69,
      annual_price: 690,
      annual_discount: 83,
    },
    right_overview: [
      '500资源点/天，不可增购',
      '模型每分钟请求数：300',
      '工作空间数量1，人数50',
      '知识库空间：1GB',
      'API调用不限额度',
      '日志存储3天',
      '新模型尝鲜',
    ],
    right_list: [
      {
        right_type_code: 'ModelAndResource',
        right_type_name: '模型和资源',
        right_type_remark: '',
        right: [
          {
            right_code: 'ResourcePackage',
            right_name: '资源点',
            right_remark: '备注',
            right_value_type: 'string',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'IncreaseModelRpm',
            right_name: '提升模型 RPM',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'bool', value: 'false' }],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    member_version: 120,
    configuration_name: '团队版',
    configuration_remark: '适合团队提效或中小型应用 PoC 开发',
    price_info: {
      monthly_price: 69,
      annual_price: 690,
      annual_discount: 83,
    },
    right_overview: [
      '500资源点/天，不可增购',
      '模型每分钟请求数：300',
      '工作空间数量1，人数50',
      '知识库空间：1GB',
      'API调用不限额度',
      '日志存储3天',
      '新模型尝鲜',
      '支持多人协同编辑',
      '支持SSO登录',
      '人工客服',
    ],
    right_list: [
      {
        right_type_code: 'ModelAndResource',
        right_type_name: '模型和资源',
        right_type_remark: '',
        right: [
          {
            right_code: 'ResourcePackage',
            right_name: '资源点',
            right_remark: '备注',
            right_value_type: 'string',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'IncreaseModelRpm',
            right_name: '提升模型 RPM',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'bool', value: 'false' }],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    member_version: 130,
    configuration_name: '企业版',
    configuration_remark: '使用企业提效或大型应用开发',
    price_info: {
      monthly_price: 69,
      annual_price: 690,
      annual_discount: 83,
    },
    right_overview: [
      '500资源点/天，不可增购',
      '模型每分钟请求数：300',
      '工作空间数量1，人数50',
      '知识库空间：1GB',
      'API调用不限额度',
      '日志存储3天',
      '新模型尝鲜',
      '支持企业用户',
      '跨空间的资源迁移',
      '成员发布和操作权限管控',
      '支持企业用户',
      '跨空间的资源迁移',
      '成员发布和操作权限管控',
    ],
    right_list: [
      {
        right_type_code: 'ModelAndResource',
        right_type_name: '模型和资源',
        right_type_remark: '',
        right: [
          {
            right_code: 'ResourcePackage',
            right_name: '资源点',
            right_remark: '备注',
            right_value_type: 'string',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'IncreaseModelRpm',
            right_name: '提升模型 RPM',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'bool', value: 'false' }],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
      {
        right_type_code: 'develop',
        right_type_name: '开发调试',
        right_type_remark: '',
        right: [
          {
            right_code: 'develop_prompt',
            right_name: '提示词调试',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'develop_knowledge',
            right_name: '知识库空间',
            right_remark: '备注',
            right_value_type: 'string',
            right_show_value: [{ type: 'string', value: '2T' }],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
      {
        right_type_code: 'prompts',
        right_type_name: '开发调试',
        right_type_remark: '扣子罗盘',
        right: [
          {
            right_code: 'prompts_version',
            right_name: 'Prompts 版本管理',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [{ type: 'string', value: '500/天' }],
            right_value_list: [
              {
                code: 'Quota',
                name: '资源点',
                value: '500',
                unit: '天',
              },
            ],
          },
          {
            right_code: 'prompts_diff',
            right_name: 'Prompts 对比模式',
            right_remark: '备注',
            right_value_type: 'bool',
            right_show_value: [
              { type: 'bool', value: '2T' },
              { type: 'string', value: '2T' },
            ],
            right_value_list: [
              {
                code: 'Support',
                name: '是否支持',
                value: 'false',
                unit: '',
              },
            ],
          },
        ],
      },
    ],
  },
];

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
 
import { OrderBy, WorkFlowListStatus } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

import { WORKFLOW_LIST_STATUS_ALL } from '@/workflow-modal/type';

/** 流程所有者选项, 全部/我的 */
export const scopeOptions = [
  {
    label: I18n.t('workflow_list_scope_all'),
    value: 'all',
  },
  {
    label: I18n.t('workflow_list_scope_mine'),
    value: 'me',
  },
];

/** 流程状态选项, 全部/已发布/未发布 */
export const statusOptions = [
  {
    label: I18n.t('workflow_list_status_all'),
    value: WORKFLOW_LIST_STATUS_ALL,
  },
  {
    label: I18n.t('workflow_list_status_published'),
    value: WorkFlowListStatus.HadPublished,
  },
  {
    label: I18n.t('workflow_list_status_unpublished'),
    value: WorkFlowListStatus.UnPublished,
  },
];

/** 流程排序选项, 创建时间/更新时间 */
export const sortOptions = [
  {
    label: I18n.t('workflow_list_sort_create_time'),
    value: OrderBy.CreateTime,
  },
  {
    label: I18n.t('workflow_list_sort_edit_time'),
    value: OrderBy.UpdateTime,
  },
];

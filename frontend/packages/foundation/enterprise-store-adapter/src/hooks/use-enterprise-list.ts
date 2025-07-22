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
 
/**
 * @file 开源版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */

import { useEnterpriseStore } from '../stores/enterprise';
/**
 * 获取企业列表的hook。
 * 从企业store中获取企业列表，并返回企业信息列表。
 * @returns {Array} 企业信息列表
 */
export const useEnterpriseList = () => {
  const list = useEnterpriseStore(store => store.enterpriseList);

  return list?.enterprise_info_list ?? [];
};

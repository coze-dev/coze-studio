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
import { type GetEnterpriseResponseData } from '@coze-arch/bot-api/pat_permission_api';

import { useEnterpriseStore } from '../stores/enterprise';

export interface CurrentEnterpriseInfoProps extends GetEnterpriseResponseData {
  organization_id: string | undefined;
}
/**
 * 获取当前企业信息。
 * 如果当前企业为个人版，则返回null。
 * 否则，返回当前企业信息，包括企业信息和组织ID。
 * @example
 * const { organization_id, enterprise_id } = useCurrentEnterpriseInfo();
 * @returns {(GetEnterpriseResponseData & { organization_id: string | undefined }) | null} 当前企业信息或null
 */
export const useCurrentEnterpriseInfo: () => CurrentEnterpriseInfoProps | null =
  () => null;

/**
 * 获取当前企业ID。
 * 如果当前企业类型为个人版，则返回约定的字符串。
 * 否则，返回当前企业的ID。
 * @returns {string} 当前企业ID
 */
export const useCurrentEnterpriseId = () =>
  useEnterpriseStore(store => store.enterpriseId);

/**
 * 检查当前企业是否为个人版。
 * @returns {boolean} 如果当前企业为个人版，则返回true，否则返回false。
 */
export const useIsCurrentPersonalEnterprise = () => true;

/**
 * 获取当前企业的角色列表。
 * 如果当前企业类型为个人版，则返回空数组。
 * 否则，返回当前企业的角色类型列表，如果列表不存在，则返回空数组。
 * @returns {Array} 当前企业的角色列表
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCurrentEnterpriseRoles = (): any[] => [];

/** 是否是企业版 */
export const useIsEnterpriseLevel = () => false;

/** 是否是团队版 */
export const useIsTeamLevel = () => false;

export const useIsCurrentEnterpriseInit = () =>
  useEnterpriseStore(store => store.isCurrentEnterpriseInit);

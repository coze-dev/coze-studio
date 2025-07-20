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
 
import { useParams, useSearchParams } from 'react-router-dom';

import { useRequest } from 'ahooks';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { MemoryApi } from '@coze-arch/bot-api';

/**
 * 已经迁移的旧渠道 id 到新渠道 id 的映射
 * key(旧) -> value(新)
 */
const migratedConnectorIds: Record<string, string | undefined> = {
  // 微信服务号
  '10000114': '10000120',
  // 微信订阅号
  '10000115': '10000121',
};

export interface ConnectorOption {
  label: string;
  value: string;
  /** 该渠道 id 是否已经迁移 */
  migrated?: boolean;
}

export interface UseConnectorOptionsParams {
  /** 是否包含已迁移的旧渠道，默认不包含 */
  includeMigrated?: boolean;
}

export function useConnectorOptions({
  includeMigrated = false,
}: UseConnectorOptionsParams = {}): ConnectorOption[] {
  const { space_id } = useParams<DynamicParams>();
  // 资源库 workflow 页面的 url 上没有 space_id 参数，需要从 searchParams 中获取
  const [searchParams] = useSearchParams();
  const spaceId = space_id ?? searchParams.get('space_id') ?? '';
  const { data } = useRequest(
    async () => {
      const res = await MemoryApi.GetConnectorName({
        SpaceId: spaceId,
        Version: IS_RELEASE_VERSION ? 'release' : 'inhouse',
        ListAll: true,
      });
      const connectors = res.ConnectorList;
      return connectors?.map(i => {
        const value = i.ConnectorID?.toString() ?? '';
        if (migratedConnectorIds[value]) {
          const target = connectors.find(
            j => j.ConnectorID?.toString() === migratedConnectorIds[value],
          );
          if (target?.ConnectorName) {
            return { label: target.ConnectorName, value, migrated: true };
          }
        }
        return { label: i.ConnectorName ?? '', value };
      });
    },
    {
      refreshDeps: [spaceId],
      // 设置缓存 key, 防止重复请求
      cacheKey: `db_connector_name_${spaceId}`,
    },
  );
  return (includeMigrated ? data : data?.filter(c => !c.migrated)) ?? [];
}

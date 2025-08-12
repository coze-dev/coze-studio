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
 * Mapping of migrated old channel IDs to new channel IDs
 * Key (old) - > value (new)
 */
const migratedConnectorIds: Record<string, string | undefined> = {
  // WeChat service account
  '10000114': '10000120',
  // WeChat subscribed account
  '10000115': '10000121',
};

export interface ConnectorOption {
  label: string;
  value: string;
  /** Has the channel ID been migrated? */
  migrated?: boolean;
}

export interface UseConnectorOptionsParams {
  /** Whether to include the old channels that have been migrated, not by default */
  includeMigrated?: boolean;
}

export function useConnectorOptions({
  includeMigrated = false,
}: UseConnectorOptionsParams = {}): ConnectorOption[] {
  const { space_id } = useParams<DynamicParams>();
  // There is no space_id parameter on the url of the library workflow page, you need to get it from searchParams
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
      // Set cache key to prevent duplicate requests
      cacheKey: `db_connector_name_${spaceId}`,
    },
  );
  return (includeMigrated ? data : data?.filter(c => !c.migrated)) ?? [];
}

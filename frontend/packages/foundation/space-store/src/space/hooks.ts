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

import { useEffect, useState } from 'react';

import { useSpaceStore } from '@coze-foundation/space-store-adapter';
import { useCurrentEnterpriseInfo } from '@coze-foundation/enterprise-store-adapter';
import { type BotSpace } from '@coze-arch/bot-api/developer_api';

export const useRefreshSpaces = (refresh?: boolean) => {
  const [loading, setLoading] = useState(true);
  const enterpriseInfo = useCurrentEnterpriseInfo();
  // Businesses change, regain the list of spaces
  useEffect(() => {
    if (refresh || !useSpaceStore.getState().inited) {
      setLoading(true);
      useSpaceStore
        .getState()
        .fetchSpaces(true)
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [enterpriseInfo?.organization_id, refresh]);
  return loading;
};

export const useSpaceList: (refresh?: boolean) => {
  spaces?: BotSpace[];
  loading: boolean;
} = refresh => {
  const spaces = useSpaceStore(s => s.spaceList);
  const loading = useRefreshSpaces(refresh);

  return {
    spaces,
    loading,
  } as const;
};

export const useSpace: (
  spaceId: string,
  refresh?: boolean,
) => {
  space?: BotSpace;
  loading: boolean;
} = (spaceId, refresh) => {
  const space = useSpaceStore(s =>
    s.spaceList.find(spaceItem => spaceItem.id === spaceId),
  );
  const loading = useRefreshSpaces(refresh);

  return {
    space,
    loading,
  } as const;
};

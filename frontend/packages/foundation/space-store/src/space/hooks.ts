import { useEffect, useState } from 'react';

import { useSpaceStore } from '@coze-foundation/space-store-adapter';
import { useCurrentEnterpriseInfo } from '@coze-foundation/enterprise-store-adapter';
import { type BotSpace } from '@coze-arch/bot-api/developer_api';

export const useRefreshSpaces = (refresh?: boolean) => {
  const [loading, setLoading] = useState(true);
  const enterpriseInfo = useCurrentEnterpriseInfo();
  // 企业发生变化，重新获取空间列表
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

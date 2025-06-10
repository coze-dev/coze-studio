import { useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import { type IntelligenceType } from '@coze-arch/bot-api/intelligence_api';
import { intelligenceApi } from '@coze-arch/bot-api';

export interface UseIsPublishRecordReadyProps {
  type: IntelligenceType;
  intelligenceId: string;
  spaceId: string;
  enable?: boolean;
}

export const useIsPublishRecordReady = ({
  type,
  intelligenceId,
  spaceId,
  enable,
}: UseIsPublishRecordReadyProps) => {
  const [inited, setInited] = useState(false);
  const res = useRequest(
    async () => {
      const data = await intelligenceApi.PublishIntelligenceList(
        {
          space_id: spaceId,
          intelligence_type: type,
          intelligence_ids: [intelligenceId],
          size: 1,
        },
        {
          __disableErrorToast: true,
        },
      );
      return data.data?.intelligences?.[0];
    },
    {
      manual: true,
      ready: enable,
      pollingInterval: 60 * 1000, // 60 秒轮询一次，避免过高频率请求导致服务端压力大
      pollingErrorRetryCount: 3,
      onSuccess: target => {
        if (target) {
          res.cancel();
        }
      },
      onFinally: () => {
        setInited(true);
      },
    },
  );

  useEffect(() => {
    setInited(false);
    res.run();
    return res.cancel;
  }, [type, intelligenceId, spaceId, enable]);

  return {
    inited,
    ready: !!res.data,
  };
};

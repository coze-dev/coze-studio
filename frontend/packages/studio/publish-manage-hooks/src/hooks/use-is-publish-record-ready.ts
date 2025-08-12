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
      pollingInterval: 60 * 1000, // Polling once every 60 seconds to avoid server level stress due to high frequency requests
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

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

import { useRequest } from 'ahooks';
import { TriggerEnabled } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

export const useUpdateHomeTriggerConfig = ({
  botId,
  onSuccess,
}: {
  botId: string | undefined;
  onSuccess?: (isKeepReceiveTrigger: boolean) => void;
}) => {
  const { run, loading } = useRequest(
    async ({ isKeepReceiveTrigger }: { isKeepReceiveTrigger: boolean }) => {
      if (!botId) {
        throw new Error('try to request home trigger but no bot id');
      }
      await DeveloperApi.UpdateHomeTriggerUserConfig({
        bot_id: botId,
        action: isKeepReceiveTrigger
          ? TriggerEnabled.Open
          : TriggerEnabled.Close,
      });
      return isKeepReceiveTrigger;
    },
    {
      manual: true,
      onSuccess,
    },
  );
  return {
    keepReceiveHomeTrigger: () => run({ isKeepReceiveTrigger: true }),
    stopReceiveHomeTrigger: () => run({ isKeepReceiveTrigger: false }),
    loading,
  };
};

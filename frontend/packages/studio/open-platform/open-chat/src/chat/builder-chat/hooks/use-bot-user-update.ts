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

import { useUpdateEffect } from 'ahooks';
import { useBotInfo, useChatArea } from '@coze-common/chat-area';

import { useGetAppDataCombineWithProps } from '../context/builder-chat-context';

// conversationId、sectionId 重新修改
export const useBotAndUserUpdate = () => {
  const { updateBotInfo } = useBotInfo();
  const { recordBotInfo } = useChatArea();
  const appInfoResult = useGetAppDataCombineWithProps();
  useUpdateEffect(() => {
    const id = appInfoResult?.botInfo?.id || '';
    recordBotInfo({
      name: appInfoResult?.botInfo?.nickname || '',
      avatar: appInfoResult?.botInfo?.url || '',
    });
    updateBotInfo(() => ({
      [id]: {
        url: appInfoResult?.botInfo?.url || '',
        nickname: appInfoResult?.botInfo?.nickname || '',
        id: appInfoResult?.botInfo?.id || '',
        allowMention: false,
      },
    }));
  }, [
    appInfoResult?.botInfo?.nickname,
    appInfoResult?.botInfo?.url,
    appInfoResult?.botInfo?.id,
  ]);
};

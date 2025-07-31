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

import { useQuery } from '@tanstack/react-query';
import {
  IntelligenceStatus,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { intelligenceApi } from '@coze-arch/bot-api';

interface QueryProps {
  spaceId: string;
}

export default function useQueryBotList({ spaceId }: QueryProps) {
  const { data } = useQuery({
    queryKey: ['related-bot-panel', 'GetDraftIntelligenceList', spaceId],
    queryFn: async () => {
      const res = await intelligenceApi.GetDraftIntelligenceList({
        space_id: spaceId,
        name: '',
        types: [IntelligenceType.Bot, IntelligenceType.Project],
        size: 30,
        order_by: 0,
        cursor_id: undefined,
        status: [
          IntelligenceStatus.Using,
          IntelligenceStatus.Banned,
          IntelligenceStatus.MoveFailed,
        ],
      });

      return res?.data ?? {};
    },
    retry: false,
  });

  return data;
}

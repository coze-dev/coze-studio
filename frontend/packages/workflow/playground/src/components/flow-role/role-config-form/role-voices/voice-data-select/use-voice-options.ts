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

import { useInfiniteScroll } from 'ahooks';
import { VoiceScene, type VoiceConfigV2 } from '@coze-arch/idl/playground_api';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { PlaygroundApi } from '@coze-arch/bot-api';

export interface VoiceOptionParams {
  language?: string;
  voiceType?: VoiceScene;
}

interface InfiniteScrollData {
  list: VoiceConfigV2[];
  hasMore?: boolean;
  nextCursor?: string;
}

export const useVoiceOptions = ({ language, voiceType }: VoiceOptionParams) => {
  const { space_id } = useParams<DynamicParams>();
  const [searchParams] = useSearchParams();
  // The workflow details page space_id in the query string
  const spaceId = space_id ?? searchParams.get('space_id') ?? '';

  const { data, loading, loadMore, loadingMore } = useInfiniteScroll(
    async (currentData?: InfiniteScrollData): Promise<InfiniteScrollData> => {
      if (!language) {
        return { list: [], hasMore: false };
      }
      const res = await PlaygroundApi.GetVoiceListV2({
        page_size: 20,
        language_code: language,
        voice_type: voiceType ?? VoiceScene.Preset,
        space_id: voiceType === VoiceScene.Library ? spaceId : undefined,
        next_cursor: currentData?.nextCursor,
      });
      return {
        list: res.data?.voice_list ?? [],
        hasMore: res.data?.has_more,
        nextCursor: res.data?.next_cursor,
      };
    },
    {
      reloadDeps: [language, voiceType],
      isNoMore: currentData => !currentData?.hasMore,
    },
  );

  return { options: data?.list ?? [], loading, loadMore, loadingMore };
};

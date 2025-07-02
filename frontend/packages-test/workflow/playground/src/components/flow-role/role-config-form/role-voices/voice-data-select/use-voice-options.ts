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
  // 资源库 workflow 详情页的 space_id 在 query string 里
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

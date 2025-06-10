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

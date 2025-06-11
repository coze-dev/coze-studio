import { type BotSpace } from '@coze-arch/bot-api/developer_api';
import { useSpace as useInternalSpace } from '@coze-foundation/space-store';

export function useSpace(spaceId: string): BotSpace | undefined {
  const { space } = useInternalSpace(spaceId);

  return space;
}

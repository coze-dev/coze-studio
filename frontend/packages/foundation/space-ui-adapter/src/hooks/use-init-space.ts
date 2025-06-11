import { useInitSpace as useBaseInitSpace } from '@coze-foundation/space-ui-base';
import { useSpaceStore } from '@coze-foundation/space-store';

export const useInitSpace = (spaceId?: string) =>
  useBaseInitSpace({
    spaceId,
    fetchSpacesWithSpaceId: _ => useSpaceStore.getState().fetchSpaces(true),
    isReady: true,
  });

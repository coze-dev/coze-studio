import { useInfiniteScroll } from 'ahooks';

import { type IntelligenceList } from '../../services/use-case-services/intelligence-search.service';
import { intelligenceSearchService } from '../../services/use-case-services/intelligence-search.service';

interface UseIntelligenceSearchProps {
  spaceId: string;
  searchValue: string;
  containerRef: React.RefObject<HTMLElement>;
}

export const useIntelligenceSearch = ({
  spaceId,
  searchValue,
  containerRef,
}: UseIntelligenceSearchProps) =>
  useInfiniteScroll<IntelligenceList>(
    async d =>
      await intelligenceSearchService.searchIntelligence({
        spaceId,
        searchValue,
        cursorId: d?.nextCursorId,
      }),
    {
      target: containerRef,
      isNoMore: d => !d?.hasMore,
      reloadDeps: [searchValue],
    },
  );

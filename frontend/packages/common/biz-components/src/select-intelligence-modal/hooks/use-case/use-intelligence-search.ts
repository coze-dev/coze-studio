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

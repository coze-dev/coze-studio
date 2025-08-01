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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { debounce } from 'lodash-es';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base';
import {
  type DraftIntelligenceListData,
  IntelligenceStatus,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { intelligenceApi } from '@coze-arch/bot-api';

import { useGlobalState } from '@/hooks';

import { type RelatedEntitiesHookProps } from '../types';
import { useExtraBotOption } from '../../use-extra-bot-option';
import { type IBotSelectOption, type IBotSelectOptions } from '../../types';
import useQueryBotList from './use-query-bot-list';

export default function useRelated({
  relatedEntityValue,
}: RelatedEntitiesHookProps) {
  const [baseRelatedEntities, setBaseRelatedEntities] = useState<
    IBotSelectOption[]
  >([]);
  const [nextCursorId, setNextCursorId] = useState<string | undefined>();
  const [search, setSearch] = useState<string>('');
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  const isLoadMoreDate = useRef(false);

  const { spaceId, personalSpaceId } = useGlobalState();

  const querySpaceId = spaceId === PUBLIC_SPACE_ID ? personalSpaceId : spaceId;

  const defaultBotData = useQueryBotList({
    spaceId: querySpaceId,
  });

  const fetchCallback = (
    fetchBotData?: DraftIntelligenceListData,
    isReset = false,
  ) => {
    const { intelligences, total = 0, next_cursor_id } = fetchBotData ?? {};

    const list: IBotSelectOptions = (intelligences ?? []).map(it => ({
      name: it.basic_info?.name ?? '',
      value: it.basic_info?.id ?? '',
      avatar: it.basic_info?.icon_url ?? '',
      type: it.type || IntelligenceType.Bot,
    }));

    const totalList = isReset ? list : [...baseRelatedEntities, ...list];

    setNextCursorId(next_cursor_id);
    setBaseRelatedEntities(totalList);

    setIsLoadMore(totalList.length < total);
  };

  const fetchBotList = async (query?: string, isReset = false) => {
    const res = await intelligenceApi.GetDraftIntelligenceList({
      space_id: querySpaceId,
      name: query ?? search,
      types: [IntelligenceType.Bot, IntelligenceType.Project],
      size: 30,
      order_by: 0,
      cursor_id: nextCursorId,
      status: [
        IntelligenceStatus.Using,
        IntelligenceStatus.Banned,
        IntelligenceStatus.MoveFailed,
      ],
    });

    fetchCallback(res?.data, isReset);
  };

  const onRelatedEntitiesSearch = useCallback((query: string) => {
    setSearch(query);
    setNextCursorId(undefined);
    fetchBotList(query, true);
  }, []);

  const loadMore = async () => {
    if (isLoadMoreDate.current) {
      return;
    }
    isLoadMoreDate.current = true;
    await fetchBotList();
    isLoadMoreDate.current = false;
  };

  useEffect(() => {
    fetchCallback(defaultBotData, true);
  }, [defaultBotData]);

  const isBot = relatedEntityValue?.type === IntelligenceType.Bot;

  // Due to paging restrictions, the selected botId may not find the corresponding option and needs to be added
  const extraBotOption = useExtraBotOption(
    baseRelatedEntities,
    relatedEntityValue?.id,
    isBot,
  );

  const relatedEntities = useMemo<IBotSelectOption[]>(
    () => [extraBotOption, ...baseRelatedEntities].filter(e => !!e),
    [extraBotOption, baseRelatedEntities],
  );

  return {
    relatedEntities,
    onRelatedEntitiesSearch: debounce(onRelatedEntitiesSearch, 300),
    loadMoreRelatedEntities: loadMore,
    isLoadMore,
  };
}

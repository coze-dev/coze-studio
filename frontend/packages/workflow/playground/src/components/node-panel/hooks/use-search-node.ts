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

import { useMemo, useState, useCallback } from 'react';

import { debounce } from 'lodash-es';
import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { NodePanelSearchType } from '@coze-arch/bot-api/workflow_api';

import {
  isNodeTemplate,
  isPluginApiNodeTemplate,
  isPluginCategoryNodeTemplate,
} from '@/utils';
import {
  NodeSearchSectionType,
  type NodeCategory,
  type NodeSearchResult,
} from '@/typing';
import { useGlobalState } from '@/hooks';

import { formatBackendSearchResult, mergeSearchResult } from '../utils';
import { PAGE_SIZE } from '../constant';

export interface UseSearchNodeProps {
  keyword: string;
  atomNodeCategoryList: NodeCategory[];
}

export const useSearchNode = ({
  atomNodeCategoryList,
}: {
  atomNodeCategoryList: NodeCategory[];
}): {
  keyword: string;
  isSearching: boolean;
  searchResult: NodeSearchResult;
  noSearchResult: boolean;
  showSearchResult: boolean;
  loadMore: (id?: NodePanelSearchType, cursor?: string) => Promise<void>;
  handleKeywordChange: (keyword: string) => void;
} => {
  const [keyword, setKeyword] = useState('');

  const { spaceId, projectId, workflowId } = useGlobalState();
  const showSearchResult = useMemo(() => Boolean(keyword), [keyword]);
  const atomNodeSearchResult = useMemo<NodeSearchResult>(() => {
    if (!keyword) {
      return [];
    }
    const filtered = atomNodeCategoryList
      .map(({ categoryName, nodeList }) => ({
        categoryName,
        nodeList: nodeList.filter(node => {
          const queryList: Array<string | undefined> = [];
          if (isPluginApiNodeTemplate(node)) {
            queryList.push(
              node.name,
              node.api_name,
              node.desc,
              node.api_id,
              node.plugin_id,
            );
          } else if (isPluginCategoryNodeTemplate(node)) {
            queryList.push(node.name, node.categoryInfo.categoryId);
          } else if (isNodeTemplate(node)) {
            queryList.push(node.name, node.desc);
          }
          return queryList
            .filter((item): item is string => Boolean(item))
            .some(item => item.toLowerCase().includes(keyword.toLowerCase()));
        }),
      }))
      .filter(({ nodeList }) => nodeList.length);
    if (filtered.length === 0) {
      return [];
    }
    return [
      {
        name: I18n.t('workflow_0224_01'),
        data: filtered,
        dataType: NodeSearchSectionType.Atom,
      },
    ];
  }, [keyword, atomNodeCategoryList]);
  const [isSearching, setIsSearching] = useState(false);

  const [backendSearchResult, setBackendSearchResult] =
    useState<NodeSearchResult>([]);

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
    if (!newKeyword) {
      setBackendSearchResult([]);
      return;
    }
    setIsSearching(true);
    debouncedBackendSearch(newKeyword);
  };

  const debouncedBackendSearch = useCallback(
    debounce(async (_keyword: string) => {
      try {
        const resp = await workflowApi.NodePanelSearch({
          search_type: NodePanelSearchType.All,
          space_id: spaceId,
          project_id: projectId,
          search_key: _keyword,
          page_size: PAGE_SIZE,
          page_or_cursor: '',
          exclude_workflow_id: workflowId,
        });
        setBackendSearchResult(formatBackendSearchResult(spaceId, resp));
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [],
  );

  const loadMore = async (
    searchType?: NodePanelSearchType,
    cursor?: string,
  ) => {
    const resp = await workflowApi.NodePanelSearch({
      search_type: searchType ?? NodePanelSearchType.All,
      space_id: spaceId,
      project_id: projectId,
      search_key: keyword,
      page_size: PAGE_SIZE,
      page_or_cursor: cursor ?? '',
    });
    setBackendSearchResult(prev =>
      mergeSearchResult(
        searchType ?? NodePanelSearchType.All,
        prev,
        formatBackendSearchResult(spaceId, resp),
      ),
    );
  };

  const searchResult = useMemo<NodeSearchResult>(
    () => [...atomNodeSearchResult, ...backendSearchResult],
    [atomNodeSearchResult, backendSearchResult],
  );

  const noSearchResult = useMemo(
    () =>
      showSearchResult &&
      !isSearching &&
      searchResult.reduce((acc, curr) => {
        const nodes = curr.data.flatMap(item => item.nodeList);
        acc += nodes.length;
        return acc;
      }, 0) === 0,
    [showSearchResult, searchResult, isSearching],
  );

  return {
    keyword,
    handleKeywordChange,
    showSearchResult,
    isSearching,
    noSearchResult,
    searchResult,
    loadMore,
  };
};

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

import { type ResourceAction, ResType } from '@coze-arch/idl/plugin_develop';
import { PlaygroundApi, PluginDevelopApi } from '@coze-arch/bot-api';
export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  actions?: ResourceAction[];
  promptText?: string;
}
export interface LibraryListRequest {
  searchWord: string;
  cursor: string;
  category: 'Recommended' | 'Team';
  spaceId: string;
  size: number;
}
export interface LibraryListResponse {
  list: LibraryInfo[];
  hasMore: boolean;
  cursor: string;
  code: number;
  [key: string]: unknown;
}

export const getTeamLibraryRequest = async (req: LibraryListRequest) => {
  const res = await PluginDevelopApi.LibraryResourceList({
    space_id: req.spaceId,
    size: req.size,
    cursor: req.cursor,
    name: req.searchWord,
    search_keys: ['full_text'],
    res_type_filter: [ResType.Prompt],
  });
  return {
    list:
      res.resource_list?.map(item => ({
        id: item.res_id ?? '',
        name: item.name ?? '',
        description: item.desc ?? '',
        actions: item?.actions ?? [],
      })) ?? [],
    hasMore: res.has_more ?? false,
    cursor: res.cursor ?? '',
    code: Number(res.code) ?? 0,
  };
};

export const getRecommendLibraryRequest = async (req: LibraryListRequest) => {
  const res = await PlaygroundApi.GetOfficialPromptResourceList({
    keyword: req.searchWord,
  });
  return {
    list:
      res.data?.map(item => ({
        id: item.id ?? '',
        name: item.name ?? '',
        description: item.description ?? '',
        promptText: item.prompt_text ?? '',
      })) ?? [],
    hasMore: false,
    cursor: '0',
    code: Number(res.code) ?? 0,
  };
};

export const getLibraryListByCategory = (
  req: LibraryListRequest,
): Promise<LibraryListResponse> => {
  if (req.category === 'Team') {
    return getTeamLibraryRequest(req);
  }
  return getRecommendLibraryRequest(req);
};

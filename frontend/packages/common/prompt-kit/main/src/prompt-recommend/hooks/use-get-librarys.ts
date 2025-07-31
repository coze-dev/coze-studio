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

import { useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  type LibraryResourceListResponse,
  type LibraryResourceListRequest,
  ResType,
} from '@coze-arch/idl/plugin_develop';
import { type GetOfficialPromptResourceListResponse } from '@coze-arch/idl/playground_api';
import { PlaygroundApi, PluginDevelopApi } from '@coze-arch/bot-api';

interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  promptText?: string;
}
export const useGetLibrarys = () => {
  const {
    runAsync: runRecommendLibrary,
    loading: loadingRecommendLibrary,
    data: dataRecommendLibrary,
  } = useGetRecommendLibrarys();
  const {
    runAsync: runTeamLibrary,
    loading: loadingTeamLibrary,
    data: dataTeamLibrary,
  } = useGetTeamLibrarys();
  return {
    loading: loadingRecommendLibrary || loadingTeamLibrary,
    data: {
      Recommended: dataRecommendLibrary ?? [],
      Team: dataTeamLibrary ?? [],
    },
    runAsync: (
      type: 'Recommended' | 'Team',
      options: LibraryResourceListRequest,
    ) => {
      if (type === 'Recommended') {
        return runRecommendLibrary({ size: options.size });
      }
      if (type === 'Team') {
        return runTeamLibrary(options);
      }
    },
  };
};
export const useGetRecommendLibrarys = (): {
  data: LibraryInfo[] | undefined;
  runAsync: (options: {
    size?: number;
  }) => Promise<GetOfficialPromptResourceListResponse>;
  loading: boolean;
} => {
  const size = useRef<number | undefined>();
  const [slicedData, setSlicedData] =
    useState<GetOfficialPromptResourceListResponse['data']>();

  const { runAsync, loading } = useRequest(
    () => PlaygroundApi.GetOfficialPromptResourceList(),
    {
      manual: true,
      onSuccess: res => {
        const processedData = size.current
          ? res.data?.slice(0, size.current)
          : res.data;
        setSlicedData(processedData);
        return res;
      },
    },
  );

  const runAsyncHandler = async (options: { size?: number }) => {
    size.current = options.size;
    return runAsync();
  };

  const commonData = slicedData?.map(
    ({
      id = '',
      name = '',
      description = '',
      prompt_text: promptText = '',
    }) => ({
      id,
      name,
      description,
      promptText,
    }),
  );

  return {
    data: commonData,
    runAsync: runAsyncHandler,
    loading,
  };
};
export const useGetTeamLibrarys = (): {
  data: LibraryInfo[] | undefined;
  runAsync: (
    options: LibraryResourceListRequest,
  ) => Promise<LibraryResourceListResponse>;
  loading: boolean;
} => {
  const { data, runAsync, loading } = useRequest(
    (options: LibraryResourceListRequest) =>
      PluginDevelopApi.LibraryResourceList({
        ...options,
        res_type_filter: [ResType.Prompt],
      }),
    {
      manual: true,
    },
  );
  const commonData = data?.resource_list?.map(
    ({ res_id: id = '', name = '', desc = '' }) => ({
      id,
      name,
      description: desc,
    }),
  );
  return { data: commonData, runAsync, loading };
};

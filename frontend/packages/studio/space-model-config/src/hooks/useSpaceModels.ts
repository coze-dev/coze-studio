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

import { useRequest } from 'ahooks';
import { getSpaceModelList, type SpaceModelItem } from '@coze-arch/bot-space-api';

export interface UseSpaceModelsResult {
  data?: SpaceModelItem[];
  loading: boolean;
  error?: Error;
  refresh: () => void;
}

/**
 * 获取空间模型列表的 Hook
 */
export const useSpaceModels = (): UseSpaceModelsResult => {
  const { data, loading, error, refresh } = useRequest(
    getSpaceModelList,
    {
      onError: (err) => {
        console.error('Failed to fetch space models:', err);
      },
    }
  );

  return {
    data,
    loading,
    error,
    refresh,
  };
};

/**
 * 按协议类型分组的模型数据
 */
export const useSpaceModelsByProtocol = () => {
  const { data, loading, error, refresh } = useSpaceModels();

  const groupedModels = data?.reduce((acc, model) => {
    const protocol = model.protocol || 'unknown';
    if (!acc[protocol]) {
      acc[protocol] = [];
    }
    acc[protocol].push(model);
    return acc;
  }, {} as Record<string, SpaceModelItem[]>) || {};

  return {
    data: groupedModels,
    loading,
    error,
    refresh,
  };
};
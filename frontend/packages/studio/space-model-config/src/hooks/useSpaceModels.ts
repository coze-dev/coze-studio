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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modelmgr } from '@coze-studio/api-schema';

// 保持向后兼容的类型定义
export interface SpaceModelItem {
  id: string;
  name: string;
  description: string;
  context_length: number;
  icon_uri: string;
  protocol: string;
  custom_config?: Record<string, unknown>;
}

export interface UseSpaceModelsResult {
  data?: SpaceModelItem[];
  loading: boolean;
  error?: Error;
  refresh: () => void;
}

// 向后兼容的 Hook（使用 ahooks）

/**
 * 获取空间模型列表的 Hook（使用 ahooks，保持向后兼容）
 * @deprecated 推荐使用 useModelList 或 useListModels
 */
export const useSpaceModels = (spaceId?: string): UseSpaceModelsResult => {
  const { data, loading, error, refresh } = useRequest(
    async () => {
      const response = await modelmgr.ListModels({ space_id: spaceId });
      if (response.data) {
        // 将ModelDetailOutput转换为SpaceModelItem格式以保持向后兼容
        return response.data.map((model: modelmgr.ModelDetailOutput): SpaceModelItem => ({
          id: model.id || '',
          name: model.name || '',
          description: model.description ? Object.keys(model.description).length > 0 ? 
            model.description[Object.keys(model.description)[0]] || '' : '' : '',
          context_length: model.meta?.capability?.max_tokens || 0,
          icon_uri: model.icon_uri || '',
          protocol: model.meta?.protocol || '',
          custom_config: {},
        }));
      }
      return [];
    },
    {
      onError: (err: Error) => {
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
 * 按协议分组获取空间模型列表（使用 ahooks，保持向后兼容）
 * @deprecated 推荐使用 useModelList 配合客户端分组
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

/**
 * 使用新的模型管理API获取详细的模型列表（使用 ahooks）
 */
export const useModelList = (params?: modelmgr.ListModelsRequest) => {
  const { data, loading, error, refresh } = useRequest(
    () => modelmgr.ListModels(params || {}),
    {
      onError: (err: Error) => {
        console.error('Failed to fetch models:', err);
      },
    }
  );

  return {
    models: data?.data || [],
    total: data?.total_count,
    nextPageToken: data?.next_page_token,
    loading,
    error,
    refresh,
  };
};

/**
 * 空间模型配置管理（使用 ahooks）
 */
export const useSpaceModelConfig = (spaceId: string, modelId: string, enabled = true) => {
  const { data, loading, error, refresh } = useRequest(
    () => modelmgr.GetSpaceModelConfig({ space_id: spaceId, model_id: modelId }),
    {
      ready: enabled && !!spaceId && !!modelId,
      onError: (err: Error) => {
        console.error('Failed to fetch space model config:', err);
      },
    }
  );

  return {
    config: data?.data,
    loading,
    error,
    refresh,
  };
};

// 推荐使用的新 Hooks（基于 React Query）

/**
 * 创建模型
 */
export const useCreateModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: modelmgr.CreateModelRequest) => modelmgr.CreateModel(data),
    onSuccess: () => {
      // 成功后刷新模型列表缓存
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

/**
 * 获取模型列表（推荐使用，基于 React Query）
 */
export const useListModels = (params?: modelmgr.ListModelsRequest) => {
  return useQuery({
    queryKey: ['models', params],
    queryFn: () => modelmgr.ListModels(params || {}),
    select: (response) => response.data, // 直接返回数据部分
  });
};

/**
 * 获取单个模型详情
 */
export const useGetModel = (modelId: string, enabled = true) => {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: () => modelmgr.GetModel({ model_id: modelId }),
    enabled: enabled && !!modelId,
    select: (response) => response.data,
  });
};

/**
 * 更新模型
 */
export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: modelmgr.UpdateModelRequest) => modelmgr.UpdateModel(data),
    onSuccess: (_, variables) => {
      // 刷新相关缓存
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['model', variables.model_id] });
    },
  });
};

/**
 * 删除模型
 */
export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (modelId: string) => modelmgr.DeleteModel({ model_id: modelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

/**
 * 添加模型到空间
 */
export const useAddModelToSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ spaceId, modelId }: { spaceId: string; modelId: string }) =>
      modelmgr.AddModelToSpace({ space_id: spaceId, model_id: modelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-models'] });
    },
  });
};

/**
 * 从空间移除模型
 */
export const useRemoveModelFromSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ spaceId, modelId }: { spaceId: string; modelId: string }) =>
      modelmgr.RemoveModelFromSpace({ space_id: spaceId, model_id: modelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-models'] });
    },
  });
};

/**
 * 获取空间模型配置（基于 React Query）
 */
export const useGetSpaceModelConfig = (spaceId: string, modelId: string, enabled = true) => {
  return useQuery({
    queryKey: ['space-model-config', spaceId, modelId],
    queryFn: () => modelmgr.GetSpaceModelConfig({ space_id: spaceId, model_id: modelId }),
    enabled: enabled && !!spaceId && !!modelId,
    select: (response) => response.data,
  });
};

/**
 * 更新空间模型配置
 */
export const useUpdateSpaceModelConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: modelmgr.UpdateSpaceModelConfigRequest) =>
      modelmgr.UpdateSpaceModelConfig(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['space-model-config', variables.space_id, variables.model_id],
      });
    },
  });
};
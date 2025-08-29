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

import { useSpaceStore } from '@coze-arch/bot-studio-store';

export interface SpaceModelItem {
  id: string;
  name: string;
  description: string;
  context_length: number;
  icon_uri: string;
  protocol: string;
  custom_config?: Record<string, unknown>;
}

export interface GetSpaceModelListRequest {
  space_id?: string;
}

export interface GetSpaceModelListResponse {
  models: SpaceModelItem[];
}

/**
 * 获取空间可用模型列表
 * 直接调用模型管理 API
 */
export const getSpaceModelList = async (): Promise<SpaceModelItem[]> => {
  try {
    const spaceId = useSpaceStore.getState().getSpaceId();

    // 调用模型管理的 ListModels API
    const response = await fetch('/api/model/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        space_id: spaceId,
        page: 1,
        page_size: 100,
      }),
    });

    const data = await response.json();

    if (data.code === 0 && data.data) {
      // 转换数据格式
      interface ModelData {
        id?: string | number;
        model_id?: string | number;
        name?: string;
        model_name?: string;
        description?: string;
        context_length?: number;
        icon_uri?: string;
        icon_url?: string;
        protocol?: string;
        custom_config?: Record<string, unknown>;
      }
      
      const DEFAULT_CONTEXT_LENGTH = 4096;
      
      return (data.data.models || []).map((model: ModelData) => ({
        id: String(model.id || model.model_id),
        name: model.name || model.model_name || '',
        description: model.description || '',
        context_length: model.context_length || DEFAULT_CONTEXT_LENGTH,
        icon_uri: model.icon_uri || model.icon_url || '',
        protocol: model.protocol || 'openai',
        custom_config: model.custom_config || {},
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch space model list:', error);
    // 返回一些默认模型作为 fallback
    return [
      {
        id: '1',
        name: 'GPT-4',
        description: 'OpenAI GPT-4 模型',
        context_length: 8192,
        icon_uri: '',
        protocol: 'openai',
      },
      {
        id: '2',
        name: 'GPT-3.5-Turbo',
        description: 'OpenAI GPT-3.5 Turbo 模型',
        context_length: 4096,
        icon_uri: '',
        protocol: 'openai',
      },
    ];
  }
};

/**
 * 根据协议类型过滤模型
 */
export const getModelsByProtocol = async (
  protocol: string,
): Promise<SpaceModelItem[]> => {
  const models = await getSpaceModelList();
  return models.filter(model => model.protocol === protocol);
};

/**
 * 根据名称搜索模型
 */
export const searchModels = async (
  keyword: string,
): Promise<SpaceModelItem[]> => {
  const models = await getSpaceModelList();
  const lowerKeyword = keyword.toLowerCase();
  return models.filter(
    model =>
      model.name.toLowerCase().includes(lowerKeyword) ||
      model.description.toLowerCase().includes(lowerKeyword),
  );
};

// ModelDetailOutput 类型定义 - 兼容旧的API
export interface ModelDetailOutput {
  id: number;
  name: string;
  description: string;
  context_length: number;
  protocol: string;
  status: number;
  icon_uri?: string;
  icon_url?: string;
}

/**
 * listModels - 兼容旧的API调用
 * 获取空间模型列表
 */
export const listModels = async (
  spaceId: string,
): Promise<ModelDetailOutput[]> => {
  try {
    const models = await getSpaceModelList();
    // 转换数据格式以兼容旧的API
    const RANDOM_ID_MAX = 100000;
    return models.map(model => ({
      id: parseInt(model.id) || Math.floor(Math.random() * RANDOM_ID_MAX), // 转换string id为number，如果失败则生成随机ID
      name: model.name,
      description: model.description,
      context_length: model.context_length,
      protocol: model.protocol,
      status: 1, // 默认启用状态
      icon_uri: model.icon_uri,
      icon_url: model.icon_uri, // 兼容两种字段名
    }));
  } catch (error) {
    console.error('Failed to list models:', error);
    throw error;
  }
};

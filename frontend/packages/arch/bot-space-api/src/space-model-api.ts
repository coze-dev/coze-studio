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
  icon_url?: string;
  protocol: string;
  custom_config?: Record<string, unknown>;
  meta?: Record<string, any>;
  default_parameters?: Array<Record<string, any>>;
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
        description?: string | { zh?: string; en?: string };
        context_length?: number;
        icon_uri?: string;
        icon_url?: string;
        protocol?: string;
        custom_config?: Record<string, unknown>;
        meta?: {
          protocol?: string;
          status?: number;
          capability?: {
            input_tokens?: number;
            max_tokens?: number;
            [key: string]: any;
          };
          [key: string]: any;
        };
        default_parameters?: Array<Record<string, any>>;
      }
      
      const DEFAULT_CONTEXT_LENGTH = 4096;
      
      return (data.data || []).map((model: ModelData) => {
        // 处理description字段，可能是字符串或多语言对象
        let description = '';
        if (typeof model.description === 'string') {
          description = model.description;
        } else if (model.description && typeof model.description === 'object') {
          // 优先使用中文，如果没有则使用英文
          description = (model.description as any).zh || (model.description as any).en || '';
        }
        
        // 获取context_length，优先从meta.capability获取
        const contextLength = model.meta?.capability?.input_tokens || 
                              model.meta?.capability?.max_tokens || 
                              model.context_length || 
                              DEFAULT_CONTEXT_LENGTH;
        
        // 获取protocol，优先从meta获取
        const protocol = model.meta?.protocol || model.protocol || 'openai';
        
        return {
          id: String(model.id || model.model_id),
          name: model.name || model.model_name || '',
          description,
          context_length: contextLength,
          icon_uri: model.icon_uri || '',
          icon_url: model.icon_url || '',
          protocol,
          custom_config: model.custom_config || {},
          // 保留原始的meta数据
          meta: model.meta,
          // 保留默认参数
          default_parameters: model.default_parameters,
        };
      });
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
      status: model.meta?.status || 1, // 从meta获取status，默认为1（启用）
      icon_uri: model.icon_uri,
      icon_url: model.icon_url || model.icon_uri, // 优先使用icon_url
    }));
  } catch (error) {
    console.error('Failed to list models:', error);
    throw error;
  }
};

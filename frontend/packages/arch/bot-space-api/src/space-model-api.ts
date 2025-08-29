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

import { SpaceApi } from './index';

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
 */
export const getSpaceModelList = async (): Promise<SpaceModelItem[]> => {
  try {
    const response = await SpaceApi.GetSpaceModelList({});
    return response.data?.models || [];
  } catch (error) {
    console.error('Failed to fetch space model list:', error);
    throw error;
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

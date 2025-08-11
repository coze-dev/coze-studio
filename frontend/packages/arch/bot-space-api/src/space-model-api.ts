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

// 暂时使用相对路径导入，直到模块路径解析问题解决
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

// 使用 api-schema 生成的类型定义
export type ModelDetailOutput = modelmgr.ModelDetailOutput;
export type ListModelsRequest = modelmgr.ListModelsRequest;
export type ListModelsResponse = modelmgr.ListModelsResponse;
export type CreateModelRequest = modelmgr.CreateModelRequest;
export type CreateModelResponse = modelmgr.CreateModelResponse;
export type UpdateModelRequest = modelmgr.UpdateModelRequest;
export type UpdateModelResponse = modelmgr.UpdateModelResponse;
export type DeleteModelRequest = modelmgr.DeleteModelRequest;
export type DeleteModelResponse = modelmgr.DeleteModelResponse;
export type AddModelToSpaceRequest = modelmgr.AddModelToSpaceRequest;
export type AddModelToSpaceResponse = modelmgr.AddModelToSpaceResponse;
export type RemoveModelFromSpaceRequest = modelmgr.RemoveModelFromSpaceRequest;
export type RemoveModelFromSpaceResponse =
  modelmgr.RemoveModelFromSpaceResponse;
export type GetSpaceModelConfigRequest = modelmgr.GetSpaceModelConfigRequest;
export type GetSpaceModelConfigResponse = modelmgr.GetSpaceModelConfigResponse;
export type UpdateSpaceModelConfigRequest =
  modelmgr.UpdateSpaceModelConfigRequest;
export type UpdateSpaceModelConfigResponse =
  modelmgr.UpdateSpaceModelConfigResponse;
export type CustomConfig = modelmgr.CustomConfig;

/**
 * 使用新的模型管理API获取模型列表
 */
export const listModels = async (
  params?: ListModelsRequest,
): Promise<ModelDetailOutput[]> => {
  try {
    const response = await modelmgr.ListModels(params || {});
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw error;
  }
};

/**
 * 创建模型
 */
export const createModel = async (
  data: CreateModelRequest,
): Promise<ModelDetailOutput> => {
  try {
    const response = await modelmgr.CreateModel(data);
    if (!response.data) {
      throw new Error('Invalid response data');
    }
    return response.data;
  } catch (error) {
    console.error('Failed to create model:', error);
    throw error;
  }
};

/**
 * 更新模型
 */
export const updateModel = async (
  data: UpdateModelRequest,
): Promise<ModelDetailOutput> => {
  try {
    const response = await modelmgr.UpdateModel(data);
    if (!response.data) {
      throw new Error('Invalid response data');
    }
    return response.data;
  } catch (error) {
    console.error('Failed to update model:', error);
    throw error;
  }
};

/**
 * 删除模型
 */
export const deleteModel = async (modelId: string): Promise<void> => {
  try {
    await modelmgr.DeleteModel({ model_id: modelId });
  } catch (error) {
    console.error('Failed to delete model:', error);
    throw error;
  }
};

/**
 * 添加模型到空间
 */
export const addModelToSpace = async (
  spaceId: string,
  modelId: string,
): Promise<void> => {
  try {
    await modelmgr.AddModelToSpace({ space_id: spaceId, model_id: modelId });
  } catch (error) {
    console.error('Failed to add model to space:', error);
    throw error;
  }
};

/**
 * 从空间移除模型
 */
export const removeModelFromSpace = async (
  spaceId: string,
  modelId: string,
): Promise<void> => {
  try {
    await modelmgr.RemoveModelFromSpace({
      space_id: spaceId,
      model_id: modelId,
    });
  } catch (error) {
    console.error('Failed to remove model from space:', error);
    throw error;
  }
};

/**
 * 获取空间模型配置
 */
export const getSpaceModelConfig = async (
  spaceId: string,
  modelId: string,
): Promise<CustomConfig> => {
  try {
    const response = await modelmgr.GetSpaceModelConfig({
      space_id: spaceId,
      model_id: modelId,
    });
    if (!response.data) {
      throw new Error('Invalid response data');
    }
    return response.data;
  } catch (error) {
    console.error('Failed to get space model config:', error);
    throw error;
  }
};

/**
 * 更新空间模型配置
 */
export const updateSpaceModelConfig = async (
  spaceId: string,
  modelId: string,
  customConfig: CustomConfig,
): Promise<void> => {
  try {
    await modelmgr.UpdateSpaceModelConfig({
      space_id: spaceId,
      model_id: modelId,
      custom_config: customConfig,
    });
  } catch (error) {
    console.error('Failed to update space model config:', error);
    throw error;
  }
};

/**
 * 将新格式的模型数据转换为旧格式（兼容性）
 */

/**
 * 根据协议类型过滤模型（使用新API）
 */
export const getModelsByProtocol = async (
  protocol: string,
): Promise<ModelDetailOutput[]> => {
  const models = await listModels();
  return models.filter(model => model.meta?.protocol === protocol);
};

/**
 * 根据名称搜索模型（使用新API）
 */
export const searchModels = async (
  keyword: string,
): Promise<ModelDetailOutput[]> => {
  const models = await listModels({
    filter: keyword, // 使用新API的搜索功能
  });
  return models;
};

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

import axios, { type AxiosRequestConfig } from 'axios';
import { globalVars } from '@coze-arch/web-context';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import type DeveloperApiService from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, type BotAPIRequestConfig } from '@coze-arch/bot-api';

export type SpaceRequest<T> = Omit<T, 'space_id'>;

type D = DeveloperApiService<BotAPIRequestConfig>;

// 这些是暴露出来需要被调用的函数列表
// 新增函数请在该列表后面追加即可
type ExportFunctions =
  | 'GetPlaygroundPluginList'
  | 'GetDraftBotList'
  | 'WorkFlowList'
  | 'CreateWorkFlow'
  | 'CopyFromTemplate'
  | 'DraftBotCreate'
  | 'DuplicateDraftBot'
  | 'GetDraftBotInfo'
  | 'UpdateDraftBot'
  | 'PublishDraftBot'
  | 'ExecuteDraftBot'
  | 'ListDraftBotHistory'
  | 'RevertDraftBot'
  | 'RegisterPlugin'
  | 'RegisterPluginMeta'
  | 'CreateDataSet'
  | 'ListDateSet'
  | 'DeleteDraftBot'
  | 'GetPluginList'
  | 'GetApiRespStruct'
  | 'GetProfileMemory'
  | 'WorkFlowPublish'
  | 'RunWorkFlow'
  | 'GetPluginCurrentInfo'
  | 'GetTypeList'
  | 'NodeList'
  | 'GetWorkFlowProcess'
  | 'MapData'
  | 'SuggestPlugin'
  | 'PublishConnectorList'
  | 'UnBindConnector'
  | 'BindConnector'
  | 'UpdateNode'
  | 'CreateChatflowAgent'
  | 'CopyChatflowAgent'
  | 'GetBotModuleInfo'
  | 'CopyWorkflowV2'
  | 'WorkflowListV2'
  | 'QueryWorkflowV2'
  | 'CreateWorkflowV2'
  | 'PublishWorkflowV2'
  | 'QueryCardDetail'
  | 'QueryCardList'
  | 'CreateCard'
  | 'GetPluginCards'
  | 'GetDraftBotDisplayInfo'
  | 'UpdateDraftBotDisplayInfo'
  | 'TaskList'
  | 'GetBindConnectorConfig'
  | 'SaveBindConnectorConfig'
  | 'CommitDraftBot'
  | 'CheckDraftBotCommit'
  | 'GetCardRespStruct'
  | 'GetSpaceModelList';

type ExportService = {
  [K in ExportFunctions]: (
    // 这里主要是为了 omit 掉 space_id 这个参数，而做的二次封装
    params: SpaceRequest<Parameters<D[K]>[0]>,
    options?: Parameters<D[K]>[1],
  ) => ReturnType<D[K]>;
};

const getSpaceId = () => useSpaceStore.getState().getSpaceId();

const spaceApiService = new Proxy(Object.create(null), {
  get(_, funcName: ExportFunctions) {
    const spaceId = getSpaceId();
    if (!DeveloperApi[funcName]) {
      throw new CustomError(
        ReportEventNames.parmasValidation,
        `Function ${funcName} is not defined in DeveloperApi`,
      );
    }
    const externalConfig: AxiosRequestConfig = {};

    switch (funcName) {
      case 'ExecuteDraftBot': {
        const defaults = axios.defaults?.transformResponse;
        externalConfig.transformResponse = [].concat(
          // @ts-expect-error -- ignoring type mismatch for axios transform response array
          ...(Array.isArray(defaults) ? defaults : [defaults]),
          (data, headers) => {
            globalVars.LAST_EXECUTE_ID = headers['x-tt-logid'];
            return data;
          },
        );
        break;
      }
      case 'WorkFlowList':
        funcName = 'WorkflowListV2';
        break;
      case 'CreateWorkFlow':
        funcName = 'CreateWorkflowV2';
        break;
      default: {
        break;
      }
    }

    return <S extends keyof D>(
      params: SpaceRequest<Parameters<D[S]>[0]>,
      options: AxiosRequestConfig = {},
    ): Promise<ReturnType<D[S]>> =>
      DeveloperApi[funcName](
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- required for dynamic parameter spread
        { ...params, space_id: spaceId } as any,
        {
          ...externalConfig,
          ...options,
        },
      ) as Promise<ReturnType<D[S]>>;
  },
}) as ExportService;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SpaceApi = spaceApiService;

export { SpaceApiV2 } from './space-api-v2';
export {
  // 类型定义
  type SpaceModelItem,
  type ModelDetailOutput,
  type ListModelsRequest,
  type ListModelsResponse,
  type CreateModelRequest,
  type CreateModelResponse,
  type UpdateModelRequest,
  type UpdateModelResponse,
  type DeleteModelRequest,
  type DeleteModelResponse,
  type AddModelToSpaceRequest,
  type AddModelToSpaceResponse,
  type RemoveModelFromSpaceRequest,
  type RemoveModelFromSpaceResponse,
  type GetSpaceModelConfigRequest,
  type GetSpaceModelConfigResponse,
  type UpdateSpaceModelConfigRequest,
  type UpdateSpaceModelConfigResponse,
  type CustomConfig,
  // 新的模型管理API函数
  listModels,
  createModel,
  updateModel,
  deleteModel,
  addModelToSpace,
  removeModelFromSpace,
  getSpaceModelConfig,
  updateSpaceModelConfig,
  // 辅助函数
  getModelsByProtocol,
  searchModels,
} from './space-model-api';

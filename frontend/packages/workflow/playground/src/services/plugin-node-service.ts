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

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { inject, injectable } from 'inversify';
import {
  type ApiNodeDetailDTO,
  type ApiNodeIdentifier,
} from '@coze-workflow/nodes';
import { workflowApi, workflowQueryClient } from '@coze-workflow/base';
import {
  PluginProductStatus,
  ProductUnlistType,
} from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';

import { WorkflowGlobalStateEntity } from '@/entities';

interface PluginNodeServiceState {
  /**
   * Is the plug-in node data loading?
   */
  loading: boolean;

  /**
   * Plug-in node data, key is the unique identifier of the plug-in specific tool, and value is the plug-in node data.
   */
  data: Record<string, ApiNodeDetailDTO>;

  /**
   * Plug-in node data loading error message, key is the unique identifier of the plug-in specific tool, and value is the error message
   */
  error: Record<string, string | undefined>;
}

interface PluginNodeServiceAction {
  getData: (identifier: ApiNodeIdentifier) => ApiNodeDetailDTO;
  setData: (identifier: ApiNodeIdentifier, value: ApiNodeDetailDTO) => void;
  getError: (identifier: ApiNodeIdentifier) => string | undefined;
  setError: (identifier: ApiNodeIdentifier, value: string | undefined) => void;
  clearError: (identifier: ApiNodeIdentifier) => void;
}

export type PluginNodeStore = PluginNodeServiceState & PluginNodeServiceAction;

const STALE_TIME = 5000;

function getCacheKey(identifier: ApiNodeIdentifier) {
  return `${identifier.pluginID}_${identifier.plugin_version}_${identifier.api_id}`;
}

const createStore = () =>
  createWithEqualityFn<PluginNodeServiceState & PluginNodeServiceAction>(
    (set, get) => ({
      loading: false,
      data: {},
      error: {},

      getData(identifier) {
        const key = getCacheKey(identifier);
        return get().data[key];
      },

      setData(identifier, value) {
        const key = getCacheKey(identifier);
        set({
          data: {
            ...get().data,
            [key]: value,
          },
        });
      },

      getError(identifier) {
        const key = getCacheKey(identifier);
        return get().error[key];
      },

      setError(identifier, value) {
        const key = getCacheKey(identifier);
        set({
          error: {
            ...get().error,
            [key]: value,
          },
        });
      },

      clearError(identifier) {
        const key = getCacheKey(identifier);
        set({
          error: {
            ...get().error,
            [key]: undefined,
          },
        });
      },
    }),
    shallow,
  );

@injectable()
export class PluginNodeService {
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;

  store = createStore();

  set loading(v: boolean) {
    this.store.setState({
      loading: v,
    });
  }

  get state() {
    return this.store.getState();
  }

  getApiDetail(identifier: ApiNodeIdentifier) {
    return this.state.getData(identifier);
  }

  getApiError(identifier: ApiNodeIdentifier) {
    return this.state.getError(identifier);
  }

  clearApiError(identifier: ApiNodeIdentifier) {
    this.state.clearError(identifier);
  }

  async fetchData(identifier: ApiNodeIdentifier) {
    const { spaceId, projectId } = this.globalState;
    return workflowQueryClient.fetchQuery({
      queryKey: [
        'loadApiNodeDetail',
        spaceId,
        identifier.pluginID,
        identifier.plugin_version,
        identifier.apiName,
        identifier.api_id,
        projectId,
      ],
      // 1. Set up a 5s cache to ensure that the same request is only sent once in a process, and there will be no excessive performance degradation.
      // 2. api detail contains the input and output, version information of the plug-in, the data has real-time sensitivity, and there is no data lag.
      staleTime: STALE_TIME,
      queryFn: async () =>
        await workflowApi.GetApiDetail(
          {
            ...identifier,
            space_id: spaceId,
            project_id: projectId,
          },
          {
            __disableErrorToast: true,
          },
        ),
    });
  }

  /**
   * Plugin status check, whether it is invalid, and determine whether ApiNode is available
   * @param params
   * Whether @returns is invalid
   */
  isApiNodeDeprecated(params: {
    currentSpaceID: string;
    pluginSpaceID?: string;
    pluginProductStatus?: PluginProductStatus;
    pluginProductUnlistType?: ProductUnlistType;
  }): boolean {
    const {
      currentSpaceID,
      pluginSpaceID,
      pluginProductStatus,
      pluginProductUnlistType,
    } = params;

    // Not removed from the shelves
    if (pluginProductStatus !== PluginProductStatus.Unlisted) {
      return false;
    }
    // Removed by administrator
    if (pluginProductUnlistType === ProductUnlistType.ByAdmin) {
      return true;
    }
    // Removed by the user, but not the creation space of the current plugin
    if (
      pluginProductUnlistType === ProductUnlistType.ByUser &&
      currentSpaceID !== pluginSpaceID
    ) {
      return true;
    }

    // Removed by the user, but in the plugin creation space
    return false;
  }

  async load(identifier: ApiNodeIdentifier) {
    let apiDetail: ApiNodeDetailDTO | undefined;
    let errorMessage = '';

    try {
      this.loading = true;
      const response = await this.fetchData(identifier);
      apiDetail = response.data as ApiNodeDetailDTO;
    } catch (error) {
      errorMessage = error.message;
      if (error.code === '702095021') {
        errorMessage = I18n.t('workflow_node_lose_efficacy', {
          name: identifier.apiName,
        });
      }
    } finally {
      this.loading = false;
    }

    if (errorMessage) {
      this.state.setError(identifier, errorMessage);
    }

    if (!apiDetail) {
      this.state.setError(identifier, errorMessage || 'loadApiNode failed');
      return;
    } else {
      this.state.setData(identifier, {
        ...apiDetail,
        // If the plug-in name is changed (for example, getStock is changed to getStock_v1), apiName will not change or getStock, and name is the updated getStock_v1
        // At this time, the name field needs to be taken first, otherwise testrun will use the old apiName, resulting in unsuccessful practice run
        apiName: apiDetail.name || apiDetail.apiName,
      });
    }

    const deprecated = this.isApiNodeDeprecated({
      currentSpaceID: this.globalState.spaceId,
      pluginSpaceID: apiDetail.spaceID,
      pluginProductStatus: apiDetail.pluginProductStatus,
      pluginProductUnlistType: apiDetail.pluginProductUnlistType,
    });

    if (deprecated) {
      this.state.setError(
        identifier,
        I18n.t('workflow_node_lose_efficacy', { name: identifier.apiName }),
      );
    }

    return apiDetail;
  }
}

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
   * 插件节点数据是否正在加载中
   */
  loading: boolean;

  /**
   * 插件节点数据，key 为插件具体工具的唯一标识，value 为插件节点数据
   */
  data: Record<string, ApiNodeDetailDTO>;

  /**
   * 插件节点数据加载错误信息，key 为插件具体工具的唯一标识，value 为错误信息
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
      // 1. 设置 5s 缓存，保证一个流程内同请求只发送一次即可，不会产生过多性能劣化
      // 2. api detail 包含插件的输入输出、版本信息，数据有实时敏感性，不可数据滞后
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
   * 插件状态检查，是否失效，判断 ApiNode 是否可用
   * @param params 参数
   * @returns 是否失效
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

    // 未下架
    if (pluginProductStatus !== PluginProductStatus.Unlisted) {
      return false;
    }
    // 被管理员下架
    if (pluginProductUnlistType === ProductUnlistType.ByAdmin) {
      return true;
    }
    // 被用户下架，但并不是当前插件的创建space
    if (
      pluginProductUnlistType === ProductUnlistType.ByUser &&
      currentSpaceID !== pluginSpaceID
    ) {
      return true;
    }

    // 被用户下架，但处于插件创建space
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
        // 插件名称如果变更后（例如 getStock 修改成 getStock_v1），apiName 不会变还是 getStock，name 才是更新后的的 getStock_v1
        // 此时需要优先取 name 字段，否则 testrun 时会用老的 apiName，导致试运行不成功
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

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

import { inject, injectable } from 'inversify';
import { EntityManager } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocumentProvider,
  type WorkflowDocument,
  type WorkflowNodeRegistry,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowBatchService,
  WorkflowVariableService,
  WorkflowVariableValidationService,
} from '@coze-workflow/variable';
import {
  type NodeTemplateInfo,
  WorkflowNodesService,
  type PlaygroundContext,
} from '@coze-workflow/nodes';
import { NODE_ORDER, StandardNodeType } from '@coze-workflow/base/types';
import {
  workflowApi,
  WorkflowMode,
  type NodeTemplateListResponse,
} from '@coze-workflow/base/api';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';
import {
  type NodeCategory as ServerNodeCategory,
  type PluginCategory,
  type PluginAPINode,
} from '@coze-arch/bot-api/workflow_api';
import {
  ProductEntityType,
  SortType,
  type GetUserFavoriteListData,
} from '@coze-arch/bot-api/product_api';
import { type Model } from '@coze-arch/bot-api/developer_api';
import { ProductApi } from '@coze-arch/bot-api';

import {
  type NodeTemplate,
  type PluginApiNodeTemplate,
  type PluginCategoryNodeTemplate,
  type NodeCategory,
} from './typing';
import { createApiNodeInfo } from './hooks/use-add-node-modal/helper';
import { WorkflowGlobalStateEntity } from './entities';
import { PAGE_SIZE } from './components/node-panel/constant';

export interface ImageflowNode {
  title: string;
  desc: string;
  icon: string;
  apiName: string;
  apiID: string;
  pluginID: string;
  pluginName: string;
}

export interface ImageflowNodesGroup {
  category: string;
  tools: ImageflowNode[];
}
@injectable()
export class WorkflowPlaygroundContext implements PlaygroundContext {
  protected nodeTemplateMap = new Map<StandardNodeType, NodeTemplate>();
  protected pluginApiMap: Record<string, PluginAPINode> = {};
  protected pluginCategoryMap: Record<string, PluginCategory> = {};
  public favoritePlugins: GetUserFavoriteListData | undefined;

  protected nodeCategoryList: ServerNodeCategory[] = [];
  public imageflowNodes: ImageflowNode[];

  @inject(WorkflowDocumentProvider)
  protected documentProvider: WorkflowDocumentProvider;

  @inject(WorkflowVariableService)
  readonly variableService: WorkflowVariableService;
  @inject(WorkflowBatchService) readonly batchService: WorkflowBatchService;
  @inject(WorkflowVariableValidationService)
  readonly variableValidationService: WorkflowVariableValidationService;
  @inject(WorkflowNodesService) readonly nodesService: WorkflowNodesService;
  @inject(EntityManager) public entityManager: EntityManager;

  protected modelList: Model[];

  get models() {
    return this.modelList;
  }

  set models(models: Model[]) {
    this.modelList = models;
  }

  /**
   * Acquire documents
   */
  get document(): WorkflowDocument {
    return this.documentProvider();
  }
  /**
   * Get, workflow node template
   */
  async loadNodeInfos(locale: string): Promise<void> {
    const nodeIds: StandardNodeType[] = Object.values(StandardNodeType);
    let resp: NodeTemplateListResponse | undefined;
    let favoritePlugins: GetUserFavoriteListData | undefined;
    const response = await Promise.allSettled([
      workflowApi.NodeTemplateList(
        {
          node_types: nodeIds,
        },
        {
          headers: {
            'x-locale': locale, // zh-CN, en-US
          },
        },
      ),
      this.fetchFavoritePlugins({ pageNum: 1 }),
    ]);
    response[0].status === 'fulfilled' && (resp = response[0].value);
    response[1].status === 'fulfilled' && (favoritePlugins = response[1].value);

    // Convert the template data returned by the server level to type: '1', which is the same as the standard StandardNodeType.
    const typeKey = 'node_type';

    this.favoritePlugins = favoritePlugins;
    this.nodeCategoryList = resp?.data?.cate_list ?? [];
    this.pluginApiMap = (resp?.data?.plugin_api_list ?? []).reduce<
      Record<string, PluginAPINode>
    >((acc, curr) => {
      curr.api_id && (acc[curr.api_id] = curr);
      return acc;
    }, {});
    this.pluginCategoryMap = (resp?.data?.plugin_category_list ?? []).reduce<
      Record<string, PluginCategory>
    >((acc, curr) => {
      curr.plugin_category_id && (acc[curr.plugin_category_id] = curr);
      return acc;
    }, {});
    resp?.data?.template_list?.forEach(temp => {
      if (temp[typeKey]) {
        this.nodeTemplateMap.set(`${temp[typeKey]}` as StandardNodeType, {
          ...temp,
          type: `${temp[typeKey]}` as StandardNodeType,
        });
      }
    });
  }

  getImageFlowNode(pluginId: string, apiName: string) {
    return this.imageflowNodes.find(
      tool => tool.pluginID === pluginId && tool.apiName === apiName,
    );
  }

  getNodeTemplateInfoByType = (
    type: StandardNodeType,
  ): NodeTemplateInfo | undefined => {
    const registry = this.document.getNodeRegister<WorkflowNodeRegistry>(type);
    if (
      !registry ||
      !registry.meta ||
      registry.meta.nodeDTOType === undefined
    ) {
      throw new CustomError(
        REPORT_EVENTS.parmasValidation,
        `Unknown NodeMeta by type ${type}`,
      );
    }
    const info = this.nodeTemplateMap.get(
      registry.meta.nodeDTOType as StandardNodeType,
    );

    if (!info) {
      return;
    }

    return {
      title: info.name as string,
      icon: info.icon_url as string,
      description: info.desc as string,
      mainColor: info.color || '',
      subTitle: (type !== StandardNodeType.Start &&
      type !== StandardNodeType.End
        ? info.name
        : '') as string,
    };
  };

  /**
   * This will prohibit operations such as circling and deleting
   */
  get disabled(): boolean {
    return !!this.globalState?.readonly;
  }

  /**
   * This way of passing through the context is not very good, and it needs to be rebuilt later.
   */
  get spaceId(): string | undefined {
    return this.globalState?.spaceId;
  }

  get flowMode(): WorkflowMode {
    return this.globalState?.flowMode ?? WorkflowMode.Workflow;
  }

  getTemplateList(types: StandardNodeType[] = []): NodeTemplate[] {
    // HACK: The type of the passed type is string, and then the template returned by the backend is actually number.
    return (
      types
        .sort(
          (prev, next) => Number(NODE_ORDER[prev]) - Number(NODE_ORDER[next]),
        )
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(type => this.nodeTemplateMap.get(type)!)
        .filter(Boolean)
    );
  }

  async fetchFavoritePlugins({
    pageNum,
    pageSize = PAGE_SIZE,
  }: {
    pageNum: number;
    pageSize?: number;
  }): Promise<GetUserFavoriteListData | undefined> {
    // will support soon
    if (IS_OPEN_SOURCE) {
      return {
        favorite_products: [],
        has_more: false,
      };
    }

    const resp = await ProductApi.PublicGetUserFavoriteList({
      entity_type: ProductEntityType.Plugin,
      sort_type: SortType.Newest,
      page_num: pageNum,
      page_size: pageSize,
    });
    return resp.data;
  }

  getTemplateCategoryList(
    enabledNodeTypes: StandardNodeType[] = [],
    isSupportImageflowNodes = false,
  ): NodeCategory[] {
    const isBindDouyin = Boolean(this.globalState?.isBindDouyin);
    const nodeCategoryList =
      this.nodeCategoryList.length !== 0
        ? this.nodeCategoryList
        : // fallback when server data load failed
          [
            {
              name: '',
              node_type_list: enabledNodeTypes,
            },
          ];
    return nodeCategoryList
      .map(category => {
        const nodeList =
          category.node_type_list
            ?.filter(item =>
              enabledNodeTypes.includes(item as StandardNodeType),
            )
            ?.map(item => this.nodeTemplateMap.get(item as StandardNodeType))
            ?.filter<NodeTemplate>((item): item is NodeTemplate =>
              Boolean(item),
            ) ?? [];
        const pluginApiList: PluginApiNodeTemplate[] = (
          category.plugin_api_id_list ?? []
        )?.map(apiId => {
          const pluginInfo = this.pluginApiMap[apiId];
          const nodeJSON = createApiNodeInfo(
            {
              name: pluginInfo.api_name,
              plugin_name: pluginInfo.name,
              api_id: pluginInfo.api_id,
              plugin_id: pluginInfo.plugin_id,
              desc: pluginInfo.desc,
            },
            pluginInfo.icon_url,
          );
          return {
            type: StandardNodeType.Api,
            ...pluginInfo,
            nodeJSON,
          };
        });
        const pluginCategoryList: PluginCategoryNodeTemplate[] = (
          category.plugin_category_id_list ?? []
        ).map(categoryId => {
          const pluginCategory = this.pluginCategoryMap[categoryId];
          return {
            type: StandardNodeType.Api,
            ...pluginCategory,
            categoryInfo: {
              categoryId,
              onlyOfficial: pluginCategory.only_official,
            },
          };
        });
        return {
          categoryName: category.name,
          nodeList: isSupportImageflowNodes
            ? [
                ...nodeList,
                ...(isBindDouyin ? [] : pluginApiList),
                ...(isBindDouyin ? [] : pluginCategoryList),
              ]
            : nodeList,
        };
      })
      .filter(category => category.nodeList.length > 0);
  }
  get globalState() {
    return this.entityManager.getEntity<WorkflowGlobalStateEntity>(
      WorkflowGlobalStateEntity,
    );
  }

  get schemaGray(): {
    isBatchV2: boolean;
  } {
    // const { schemaGray } = this.globalState?.config ?? {};
    return {
      isBatchV2: false,
    };
  }
}

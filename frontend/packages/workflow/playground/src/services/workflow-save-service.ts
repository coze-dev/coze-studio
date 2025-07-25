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
 
import { debounce, isEmpty } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { StackingContextManager } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  Playground,
  PlaygroundConfigEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowContentChangeType,
  WorkflowLineEntity,
  WorkflowResetLayoutService,
  delay,
  type WorkflowContentChangeEvent,
  type WorkflowDocument,
  type WorkflowJSON,
} from '@flowgram-adapter/free-layout-editor';
import { Emitter, type Disposable } from '@flowgram-adapter/common';
import { GlobalVariableService } from '@coze-workflow/variable';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { useWorkflowStore } from '@coze-workflow/base/store';
import { OperateType, WorkflowMode } from '@coze-workflow/base/api';
import {
  StandardNodeType,
  type WorkflowNodeJSON,
  reporter,
} from '@coze-workflow/base';
import { userStoreService } from '@coze-studio/user-store';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { getFlags } from '@coze-arch/bot-flags';
import { CustomError } from '@coze-arch/bot-error';
import { type Model } from '@coze-arch/bot-api/developer_api';

import { WorkflowModelsService } from '@/services/workflow-models-service';
import { TriggerService } from '@/services/trigger-service';
import { RelatedCaseDataService } from '@/services/related-case-data-service';
import { getNodeV2Registry } from '@/nodes-v2';

import { WorkflowPlaygroundContext } from '../workflow-playground-context';
import {
  WorkflowGlobalStateEntity,
  WorkflowDependencyStateEntity,
} from '../entities';
import { WorkflowOperationService } from './workflow-operation-service';

// 这个非写死，不要用来判断开始节点，请用 flowNodeType
const START_NODE_ID = '100001';
const END_NODE_ID = '900001';
const CHAT_NODE_DEFAULT_ID = '110100';
const HIGH_DEBOUNCE_TIME = 1000;
const LOW_DEBOUNCE_TIME = 3000;
const RELOAD_DELAY_TIME = 500;
const RENDER_DELAY_TIME = 100;

const ERROR_CODE_SAVE_VERSION_CONFLICT = '720702239';

/**
 * 创建默认，只有 start 和 end 节点
 */
function createDefaultJSON(flowMode: WorkflowMode): WorkflowJSON {
  if (flowMode === WorkflowMode.SceneFlow) {
    return {
      nodes: [
        {
          id: START_NODE_ID,
          type: StandardNodeType.Start,
          meta: {
            position: { x: 0, y: 0 },
          },
          data: {
            outputs: [
              {
                type: 'string',
                name: '',
                required: true,
              },
            ],
          },
        },
        {
          id: END_NODE_ID,
          type: StandardNodeType.End,
          meta: {
            position: { x: 2000, y: 0 },
          },
        },
        {
          id: CHAT_NODE_DEFAULT_ID,
          type: StandardNodeType.SceneChat,
          meta: {
            position: { x: 1000, y: 0 },
          },
        },
      ],
      edges: [
        { sourceNodeID: START_NODE_ID, targetNodeID: CHAT_NODE_DEFAULT_ID },
      ],
    };
  } else {
    return {
      nodes: [
        {
          id: START_NODE_ID,
          type: StandardNodeType.Start,
          meta: {
            position: { x: 0, y: 0 },
          },
          data: {
            outputs: [
              {
                type: 'string',
                name: '',
                required: true,
              },
            ],
          },
        },
        {
          id: END_NODE_ID,
          type: StandardNodeType.End,
          meta: {
            position: { x: 1000, y: 0 },
          },
        },
      ],
      edges: [],
    };
  }
}

@injectable()
export class WorkflowSaveService {
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowNodesService) nodesService: WorkflowNodesService;
  @inject(WorkflowOperationService) operationService: WorkflowOperationService;
  @inject(WorkflowModelsService) modelsService: WorkflowModelsService;
  @inject(TriggerService) triggerService: TriggerService;
  @inject(GlobalVariableService) globalVariableService: GlobalVariableService;
  @inject(RelatedCaseDataService) relatedBotService: RelatedCaseDataService;
  @inject(WorkflowDependencyStateEntity)
  dependencyEntity: WorkflowDependencyStateEntity;

  @inject(WorkflowPlaygroundContext) context: WorkflowPlaygroundContext;
  @inject(PlaygroundConfigEntity) playgroundConfig: PlaygroundConfigEntity;
  @inject(WorkflowResetLayoutService)
  resetLayoutService: WorkflowResetLayoutService;
  @inject(Playground) playground: Playground;

  @inject(StackingContextManager)
  private readonly stackingContextManager: StackingContextManager;

  protected workflowDocument: WorkflowDocument;
  protected readonly onSavedEmitter = new Emitter<void>();
  readonly onSaved = this.onSavedEmitter.event;

  protected saveOnChangeDisposable?: Disposable;

  // 是否需要流转 test run 状态。当修改节点位置时，不需要重新 test run
  ignoreStatusTransfer = true;

  /**
   * 获取 workflow schema json
   * @param commitId 流程的版本信息
   * @param type 流程版本的类型信息 提交或发布
   */
  loadWorkflowJson = async (
    commitId?: string,
    type?: OperateType,
    env?: string,
  ) => {
    let workflowJson: WorkflowJSON | undefined;
    const {
      workflowId,
      spaceId,
      workflowCommitId,
      playgroundProps,
      flowMode,
      logId,
      projectId,
      projectCommitVersion,
    } = this.globalState;

    const FLAGS = getFlags();
    const needUseLogId = IS_BOT_OP && logId;
    const isPreviewInProject = Boolean(projectId && projectCommitVersion);
    const hasExecuteId = Boolean(playgroundProps?.executeId);

    // 如果是 project 查看历史版本
    if (isPreviewInProject) {
      workflowJson = await this.globalState.loadHistory({
        commit_id: commitId as string,
        project_version: projectCommitVersion as string,
        project_id: projectId as string,
        log_id: logId,
        type: type || OperateType.SubmitOperate,
        env,
      });
    } else if (commitId || needUseLogId || hasExecuteId) {
      workflowJson = await this.globalState.loadHistory({
        commit_id: commitId as string,
        log_id: logId,
        type: type || OperateType.SubmitOperate,
        execute_id: hasExecuteId ? playgroundProps?.executeId : undefined,
        sub_execute_id: playgroundProps?.subExecuteId,
        env,
      });
    } else if (workflowCommitId || needUseLogId) {
      workflowJson = await this.globalState.loadHistory({
        commit_id: workflowCommitId,
        log_id: logId,
        type:
          this.globalState.config?.playgroundProps?.commitOptType ||
          OperateType.SubmitOperate,
      });
    } else if (playgroundProps?.from === 'communityTrial') {
      /**
       * 如果来自 community trial 无论是否有 commitId 都要取历史的版本
       * 主要应对在 trial 中 db 没有 commitId 请求最新 schema 的场景。数据清洗完毕后可删除该逻辑
       */
      workflowJson = await this.globalState.loadHistory({
        commit_id: workflowCommitId,
        type:
          this.globalState.config?.playgroundProps?.commitOptType ||
          OperateType.SubmitOperate,
      });
    } else {
      workflowJson = await this.globalState.load(workflowId, spaceId);
      // 流程初始化设置 saveVersion
      const workflowInfo = this.globalState.config?.info;
      FLAGS?.['bot.automation.project_multi_tab'] &&
        projectId &&
        this.dependencyEntity.setSaveVersion(
          BigInt(workflowInfo?.save_version ?? ''),
        );
    }

    if (!workflowJson || workflowJson.nodes.length === 0) {
      workflowJson = createDefaultJSON(flowMode);
    }

    if (!workflowJson.edges) {
      workflowJson.edges = [];
    }

    return workflowJson;
  };

  /**
   * 对所有节点表单渲染前进行初始化，初始化完毕才会进行表单创建工作
   * @param nodes 所有节点数据
   */
  async initNodeData(nodes: WorkflowNodeJSON[]) {
    const promises: Promise<void>[] = [];
    const stack: WorkflowNodeJSON[] = [...nodes];

    while (stack.length > 0) {
      const node = stack.pop() as WorkflowNodeJSON;
      const registry = getNodeV2Registry(node.type as StandardNodeType);
      if (registry?.onInit) {
        promises.push(registry.onInit(node, this.context));
      }

      if (node.blocks && node.blocks.length > 0) {
        stack.push(...node.blocks);
      }
    }

    await Promise.all(promises);
  }

  /**
   * 加载文档数据
   */
  async loadDocument(doc: WorkflowDocument): Promise<void> {
    this.workflowDocument = doc;
    const { workflowId, getProjectApi } = this.globalState;

    const projectApi = getProjectApi();

    const loadingStartTime = Date.now();

    try {
      if (!workflowId) {
        throw Error(I18n.t('workflow_detail_error_interface_initialization'));
      }
      projectApi?.setWidgetUIState('saving');
      this.hideRenderLayer();

      const userInfo = userStoreService.getUserInfo();
      const locale = userInfo?.locale ?? navigator.language ?? 'en-US';

      // 加载节点信息
      const [, workflowJSON] = await Promise.all([
        this.context.loadNodeInfos(locale),
        this.loadWorkflowJson(),
        // this.loadGlobalVariables(),
      ]);

      await this.loadGlobalVariables(workflowJSON);

      await this.modelsService.load();

      try {
        await this.triggerService.load();
      } catch (e) {
        logger.error(e.message);
      }

      // 加载大模型上下文
      this.context.models = this.modelsService.getModels() as Model[];

      // 同步加载的 nodes 和 edges 到 workflow store
      useWorkflowStore.getState().setNodes(workflowJSON.nodes);
      useWorkflowStore.getState().setEdges(workflowJSON.edges);

      const loadDateTime = Date.now() - loadingStartTime;

      const renderStartTime = Date.now();

      // 前置数据加载
      await this.initNodeData(workflowJSON.nodes as WorkflowNodeJSON[]);

      await this.workflowDocument.fromJSON(workflowJSON);
      const renderTime = Date.now() - renderStartTime;

      this.globalState.updateConfig({
        loading: false,
      });
      projectApi?.setWidgetUIState('normal');
      // 有权限才能自动保存
      if (!this.globalState.readonly) {
        this.saveOnChangeDisposable = doc.onContentChange(
          this.listenContentChange,
        );
      }

      const fitViewStartTime = Date.now();
      await this.fitView();
      const fitViewTime = Date.now() - fitViewStartTime;

      const totalTime = Date.now() - loadingStartTime;

      reporter.event({
        eventName: 'workflow_load_document',
        meta: {
          totalTime,
          loadDateTime,
          renderTime,
          fitViewTime,
        },
      });
    } catch (e) {
      this.globalState.updateConfig({
        loadingError: e.message,
        loading: false,
      });
      projectApi?.setWidgetUIState('error');

      throw e;
    } finally {
      this.showRenderLayer();
    }
  }

  async loadGlobalVariables(workflowJSON?: WorkflowJSON) {
    const useNewGlobalVariableCache =
      !this.globalState.isInIDE &&
      !this.globalState.playgroundProps?.disableGetTestCase;

    if (useNewGlobalVariableCache) {
      const relatedBot =
        await this.relatedBotService.getAsyncRelatedBotValue(workflowJSON);

      if (!relatedBot?.id || !relatedBot?.type) {
        return;
      }

      return this.globalVariableService.loadGlobalVariables(
        relatedBot?.type,
        relatedBot?.id,
      );
    }

    return this.globalVariableService.loadGlobalVariables(
      'project',
      this.globalState.projectId,
    );
  }

  /**
   * 默认将开始节点居中展示
   */
  async fitView(): Promise<void> {
    // 等待节点渲染与布局计算
    await delay(RENDER_DELAY_TIME);

    // 等待 DOM resize 更新
    await new Promise<void>(resolve => {
      window.requestAnimationFrame(() => resolve());
    });

    // 执行布局
    this.workflowDocument.fitView(false);

    // 等待布局后节点渲染
    await delay(RENDER_DELAY_TIME);
  }

  /**
   * 保存文档数据
   */
  save = async () => {
    const { getProjectApi } = this.globalState;
    const projectApi = getProjectApi();
    const FLAGS = getFlags();

    try {
      // 只读态禁用保存，如果在加载状态中，也禁止保存
      if (this.globalState.readonly || this.globalState.loading) {
        return;
      }
      reporter.event({
        eventName: 'workflow_save',
      });

      this.globalState.updateConfig({
        saveLoading: true,
        saving: true,
        savingError: false,
      });
      projectApi?.setWidgetUIState('saving');
      const json = await this.workflowDocument.toJSON();

      if (this.globalState.config.schemaGray) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 临时字段
        (json as any).versions = this.globalState.config.schemaGray;
      }

      // 保存草稿，存储 workflow 的 nodes 和 edges 到 zustand store
      useWorkflowStore.getState().setNodes(json.nodes);
      useWorkflowStore.getState().setEdges(json.edges);

      // FIXME 这个问题还没定位清除，先阻止保存
      if (json.nodes.length === 0) {
        projectApi?.setWidgetUIState('error');
        throw new CustomError(REPORT_EVENTS.parmasValidation, 'Saving Error');
      }

      await this.operationService.save(json, this.ignoreStatusTransfer);

      this.ignoreStatusTransfer = true;

      await this.globalState.reload();
      this.globalState.updateConfig({
        saveLoading: false,
        saving: false,
        savingError: false,
      });
      projectApi?.setWidgetUIState('normal');
      // save 成功后获取最新的 saveVersion
      const workflowInfo = this.globalState.config.info;
      FLAGS?.['bot.automation.project_multi_tab'] &&
        this.globalState.projectId &&
        this.dependencyEntity.setSaveVersion(
          BigInt(workflowInfo?.save_version ?? ''),
        );
    } catch (e) {
      this.globalState.updateConfig({
        saveLoading: false,
        saving: false,
        savingError: true,
      });
      projectApi?.setWidgetUIState('error');

      // 新版本节点后续统一使用 e.name 是否为 CustomNodeError 来判断
      if (
        e.eventName === 'WorkflowSubWorkflowResourceLose' ||
        e.eventName === 'WorkflowApiNodeResourceLose' ||
        e?.name === 'CustomNodeError'
      ) {
        logger.warning(e.message);
      } else if (
        e.code === ERROR_CODE_SAVE_VERSION_CONFLICT &&
        FLAGS?.['bot.automation.project_multi_tab']
      ) {
        // 保存时发现工作流版本冲突，提示用户刷新页面
        this.dependencyEntity.setRefreshModalVisible(true);
        throw e;
      } else {
        throw e;
      }
    } finally {
      this.onSavedEmitter.fire();
    }
  };

  /**
   * 判断是否为游离节点的改动
   * 游离节点修改无需重新 test run
   */
  isAssociateChange(entity: FlowNodeEntity | WorkflowLineEntity) {
    let isAssociateChange = false;
    const associatedNodes = this.workflowDocument.getAssociatedNodes();
    if (entity instanceof FlowNodeEntity) {
      isAssociateChange = associatedNodes.some(node => node.id === entity.id);
    } else if (entity instanceof WorkflowLineEntity) {
      isAssociateChange = associatedNodes.some(
        node => node.id === entity.from.id,
      );
    }
    return isAssociateChange;
  }

  protected listenContentChange = ({
    type,
    entity,
  }: WorkflowContentChangeEvent) => {
    const { getProjectApi } = this.globalState;
    const projectApi = getProjectApi();
    this.globalState.updateConfig({
      saving: true,
    });
    projectApi?.setWidgetUIState('saving');

    const isAssociateChange = this.isAssociateChange(entity);

    if (
      type === WorkflowContentChangeType.MOVE_NODE ||
      type === WorkflowContentChangeType.META_CHANGE ||
      !isAssociateChange
    ) {
      this.lowPrioritySave();
    } else {
      this.ignoreStatusTransfer = false;
      this.highPrioritySave();
    }
  };

  /**
   * 高优先级保存，包含节点内容、节点增删、线条增删
   */
  public highPrioritySave = debounce(() => {
    reporter.event({
      eventName: 'workflow_high_priority_save',
    });
    this.save();
  }, HIGH_DEBOUNCE_TIME);

  /**
   * 低优先级保存，包含节点位置移动
   * @protected
   */
  public lowPrioritySave = debounce(() => {
    reporter.event({
      eventName: 'workflow_low_priority_save',
    });
    this.highPrioritySave();
  }, LOW_DEBOUNCE_TIME - HIGH_DEBOUNCE_TIME);

  waitSaving = () => {
    if (!this.globalState.config.saving) {
      return;
    }
    return new Promise(resolve => {
      this.onSaved(() => resolve(true));
    });
  };

  /**
   * 重载文档数据
   */
  reloadDocument = async ({
    commitId,
    type,
    env,
    customWorkflowJson,
  }: {
    commitId?: string;
    type?: OperateType;
    env?: string;
    customWorkflowJson?: WorkflowJSON;
  } = {}) => {
    // 等待 save 结束

    await this.waitSaving();

    const workflowJson = !isEmpty(customWorkflowJson)
      ? customWorkflowJson
      : await this.loadWorkflowJson(commitId, type, env);
    if (!workflowJson) {
      return;
    }
    this.hideRenderLayer();

    this.saveOnChangeDisposable?.dispose();

    // 前置数据加载
    await this.initNodeData((workflowJson?.nodes as WorkflowNodeJSON[]) ?? []);
    await this.workflowDocument.reload(workflowJson, RELOAD_DELAY_TIME);
    if (!this.globalState.readonly) {
      this.saveOnChangeDisposable = this.workflowDocument.onContentChange(
        this.listenContentChange,
      );
    }

    await this.fitView();
    this.showRenderLayer();
  };

  private hideRenderLayer(): void {
    this.stackingContextManager.node.style.opacity = '0';
  }

  private showRenderLayer(): void {
    this.stackingContextManager.node.style.opacity = '1';
  }
}

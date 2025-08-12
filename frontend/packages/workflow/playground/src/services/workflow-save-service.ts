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

// This is not written dead, do not use it to judge the start node, please use flowNodeType
const START_NODE_ID = '100001';
const END_NODE_ID = '900001';
const CHAT_NODE_DEFAULT_ID = '110100';
const HIGH_DEBOUNCE_TIME = 1000;
const LOW_DEBOUNCE_TIME = 3000;
const RELOAD_DELAY_TIME = 500;
const RENDER_DELAY_TIME = 100;

const ERROR_CODE_SAVE_VERSION_CONFLICT = '720702239';

/**
 * Create default, only start and end nodes
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

  // Whether the test run state needs to be streamed. When changing the node location, there is no need to re-test run
  ignoreStatusTransfer = true;

  /**
   * Get workflow schema json
   * @Param commitId process version information
   * @Param type type information for process version, commit or publish
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

    // If it is a project, check the historical version.
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
       * If it comes from a community trial, the historical version must be taken regardless of whether there is a commitId or not.
       * Mainly deal with scenarios where db does not commitId request the latest schema in trial. This logic can be deleted after data cleaning is completed
       */
      workflowJson = await this.globalState.loadHistory({
        commit_id: workflowCommitId,
        type:
          this.globalState.config?.playgroundProps?.commitOptType ||
          OperateType.SubmitOperate,
      });
    } else {
      workflowJson = await this.globalState.load(workflowId, spaceId);
      // Process initialization settings saveVersion
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
   * Initialize all node forms before rendering, and the form creation will not proceed until the initialization is completed.
   * @param nodes All node data
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
   * Load document data
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

      // load node information
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

      // Load large model context
      this.context.models = this.modelsService.getModels() as Model[];

      // Synchronize loaded nodes and edges to workflow store
      useWorkflowStore.getState().setNodes(workflowJSON.nodes);
      useWorkflowStore.getState().setEdges(workflowJSON.edges);

      const loadDateTime = Date.now() - loadingStartTime;

      const renderStartTime = Date.now();

      // preload
      await this.initNodeData(workflowJSON.nodes as WorkflowNodeJSON[]);

      await this.workflowDocument.fromJSON(workflowJSON);
      const renderTime = Date.now() - renderStartTime;

      this.globalState.updateConfig({
        loading: false,
      });
      projectApi?.setWidgetUIState('normal');
      // Only with permission can it be automatically saved.
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
      const relatedBot = await this.relatedBotService.getAsyncRelatedBotValue(
        workflowJSON,
      );

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
   * By default, the start node will be centered
   */
  async fitView(): Promise<void> {
    // Waiting for node rendering and layout calculation
    await delay(RENDER_DELAY_TIME);

    // Wait for DOM resize update
    await new Promise<void>(resolve => {
      window.requestAnimationFrame(() => resolve());
    });

    // execution layout
    this.workflowDocument.fitView(false);

    // Wait for the node to render after layout
    await delay(RENDER_DELAY_TIME);
  }

  /**
   * Save document data
   */
  save = async () => {
    const { getProjectApi } = this.globalState;
    const projectApi = getProjectApi();
    const FLAGS = getFlags();

    try {
      // Disable saving in read-only state, and also disable saving if in the loaded state
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- temporary field
        (json as any).versions = this.globalState.config.schemaGray;
      }

      // Save the draft, store the nodes and edges of the workflow to zustand store
      useWorkflowStore.getState().setNodes(json.nodes);
      useWorkflowStore.getState().setEdges(json.edges);

      // The problem of FIXME has not been located and cleared, so prevent the saving first.
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
      // Get the latest saveVersion after successful saving
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

      // The new version of the node will use e.name whether it is CustomNodeError to judge
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
        // A workflow version conflict is found when saving, prompting the user to refresh the page
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
   * Determine whether it is a change from a free node
   * Free node modification without re-test run
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
   * High priority save, including node content, node addition and deletion, line addition and deletion
   */
  public highPrioritySave = debounce(() => {
    reporter.event({
      eventName: 'workflow_high_priority_save',
    });
    this.save();
  }, HIGH_DEBOUNCE_TIME);

  /**
   * Low-priority saving, including node location moves
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
   * Overloading document data
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
    // Wait for the save to end

    await this.waitSaving();

    const workflowJson = !isEmpty(customWorkflowJson)
      ? customWorkflowJson
      : await this.loadWorkflowJson(commitId, type, env);
    if (!workflowJson) {
      return;
    }
    this.hideRenderLayer();

    this.saveOnChangeDisposable?.dispose();

    // preload
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

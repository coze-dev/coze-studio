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

/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-lines */
import { isFunction } from 'lodash-es';
import dayjs from 'dayjs';
import {
  ConfigEntity,
  PlaygroundConfigEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import {
  workflowApi,
  type Workflow,
  OperateType,
  WorkFlowDevStatus,
  type VCSCanvasData,
  type OperationInfo,
  VCSCanvasType,
  WorkflowMode,
  WorkFlowStatus,
  WorkFlowType,
  type GetHistorySchemaRequest,
  CollaboratorMode,
  PersistenceModel,
  BindBizType,
} from '@coze-workflow/base/api';
import { isGeneralWorkflow } from '@coze-workflow/base';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { SpaceType } from '@coze-arch/bot-api/playground_api';
import { SpaceMode, type BotSpace } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

const getAutoSaveTime = timestamp => {
  let autoSaveTime = dayjs().format('HH:mm:ss');

  /**
   * If the backend has a return update time and the update time is unix timestamp, it will be used, otherwise the bottom cover will display the fake time.
   */
  if (timestamp && typeof timestamp === 'number') {
    const time = dayjs.unix(timestamp);
    if (time.isValid()) {
      const target = dayjs.unix(timestamp);
      const now = dayjs();
      if (now.diff(target, 'y') >= 1) {
        autoSaveTime = target.format('YYYY-MM-DD HH:mm:ss');
      } else if (!now.isSame(target, 'd')) {
        autoSaveTime = target.format('MM-DD HH:mm:ss');
      } else {
        autoSaveTime = target.format('HH:mm:ss');
      }
    }
  }

  return autoSaveTime;
};

import { getIsInitWorkflow } from '@/utils/get-is-init-workflow';

import { type WorkflowPlaygroundProps } from '../typing';
import { DataSetStore } from './workflow-dataset-store-entity';

export type WorkflowInfo = Omit<Workflow, 'status'> & {
  status?: WorkFlowDevStatus | WorkFlowStatus;
  vcsData?: VCSCanvasData;
  operationInfo?: OperationInfo;
  is_bind_agent?: boolean;
  bind_biz_id?: string;
  bind_biz_type?: number;
  workflow_version?: string;
} & {
  /**
   * The spaceId returned in the workflow details is not equal to the value of the current space in the official example scenario
   */
  workflowSourceSpaceId?: string;
};

export enum WorkflowExecStatus {
  DEFAULT = 'default',
  /** in progress */
  EXECUTING = 'executing',
  /** End of execution (there is still an end of execution banner at this time, and the workflow is disabled) */
  DONE = 'done',
}

/**
 * Current process status
 */
export interface WorkflowGlobalState {
  /** Workflow component pass-in properties */
  playgroundProps: WorkflowPlaygroundProps;
  workflowId: string;
  /**  Canvas loading */
  loading: boolean;
  /**  Save interface request time is shorter than save. */
  saveLoading: boolean;
  /**  Saving, including debouncing time */
  saving: boolean;
  savingError?: boolean;
  loadingError?: string;
  /**
   * In release
   */
  publishing: boolean;
  /**
   * Workflow auto-save time
   */
  autoSaveTime?: string;
  autoSaveTimestamp?: number;

  /** Workflow Details */
  info: WorkflowInfo;

  /** Current space type */
  spaceType?: SpaceType;
  /** List of user spaces */
  spaceList: BotSpace[];
  /** Spatial Mode */
  spaceMode: SpaceMode;

  /** Is the process in preview state? */
  preview: boolean;

  /**
   * Workflow view state (distinguished from publication state)
   * @default WorkflowExecStatus.DEFAULT
   */
  viewStatus?: WorkflowExecStatus;

  /** Has it been released? When the process is first released, it will be registered as a plugin with the bot. */
  pluginId: string;

  // Add is_bind_agent field, whether the process is bound to the bot as an agent
  isBindAgent: boolean;

  /** Is Douyin bound? */
  isBindDouyin: boolean;

  /** Is there an update to the Workflow stock plug-in, and if so, modifies the relevant form data and requires a practice run */
  inPluginUpdated?: boolean;
  /* Are you checking history? */
  historyStatus?: OperateType;
  /** Bound business scenario id */
  bindBizID?: string;
  /** bound business type */
  bindBizType?: number;
  /** Is the node sidebar bed open? */
  nodeSideSheetVisible?: boolean;
  schemaGray?: {
    loop?: string;
    batch?: string;
  };

  /** Whether the nodes and lines of the process are in the initial state, only the entry and exit parameters of the beginning and end nodes are judged */
  isInitWorkflow?: boolean;

  /**
   * Knowledge Base Information
   */
  sharedDataSet?: DataSetStore;
}

/**
 * Process global state management (singleton)
 */
export class WorkflowGlobalStateEntity extends ConfigEntity<WorkflowGlobalState> {
  static type = 'WorkflowGlobalStateEntity';

  getDefaultConfig(): WorkflowGlobalState {
    return {
      historyStatus: undefined,
      playgroundProps: Object.create(null),
      workflowId: '',
      loading: true,
      autoSaveTime: dayjs().format('HH:mm:ss'),
      saveLoading: false,
      saving: false,
      preview: false,
      publishing: false,
      info: {},
      viewStatus: WorkflowExecStatus.DEFAULT,
      spaceList: [],
      spaceMode: SpaceMode.Normal,
      pluginId: '',
      isBindAgent: false,
      inPluginUpdated: false,
      nodeSideSheetVisible: false,
      isInitWorkflow: false,
      isBindDouyin: false,
      sharedDataSet: new DataSetStore(),
    };
  }

  async load(
    workflowId: string,
    spaceId: string,
  ): Promise<WorkflowJSON | undefined> {
    if (!workflowId) {
      throw new CustomError(
        REPORT_EVENTS.parmasValidation,
        I18n.t('workflow_detail_error_missing_id'),
      );
    }

    // Load workflow tcc configuration
    await Promise.all([this.setSpaceInfo()]);

    const workflowInfo = await this.queryWorkflowDetail(workflowId, spaceId);
    const autoSaveTime = getAutoSaveTime(workflowInfo?.update_time);

    /** Determine whether the process is in preview state, from the official process, component configuration read-only readonly, non-vcs mode is not the creator's process, vcs mode has no collaborator permission, and the process is in preview state */
    const isVcsMode = workflowInfo.collaborator_mode === CollaboratorMode.Open;
    const isReadOnly = this.config.playgroundProps.readonly;
    const isGuanFangType = workflowInfo?.type === WorkFlowType.GuanFang;
    const isProjectPreview = Boolean(
      this.projectId && this.config.playgroundProps.projectCommitVersion,
    );
    const isUserType = workflowInfo?.type === WorkFlowType.User;
    const hasSingleEditPermission = !isVcsMode && workflowInfo.creator?.self;
    const hasVcsEditPermission = isVcsMode && workflowInfo.vcsData?.can_edit;
    const preview =
      isReadOnly ||
      isGuanFangType ||
      isProjectPreview ||
      (isUserType && !(hasSingleEditPermission || hasVcsEditPermission));

    const jsonStr = workflowInfo?.schema_json;
    const workflowJSON = (
      jsonStr ? JSON.parse(jsonStr) : undefined
    ) as WorkflowJSON;

    const isInitWorkflow = getIsInitWorkflow(
      workflowJSON,
      workflowInfo?.flow_mode || WorkflowMode.Workflow,
    );

    this.updateConfig({
      workflowId,
      pluginId:
        workflowInfo?.plugin_id && workflowInfo.plugin_id !== '0'
          ? workflowInfo.plugin_id
          : '',
      info: workflowInfo,
      autoSaveTime,
      autoSaveTimestamp: workflowInfo?.update_time as number,
      preview,
      isBindAgent: workflowInfo?.is_bind_agent,
      bindBizID: workflowInfo?.bind_biz_id,
      bindBizType: workflowInfo?.bind_biz_type,
      historyStatus: undefined,
      schemaGray: (
        workflowJSON as WorkflowJSON & {
          versions: {
            loop: string;
            batch: string;
          };
        }
      )?.versions,
      isInitWorkflow,
    });

    // Update the readonly status of the canvas
    this.entityManager
      .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)
      ?.updateConfig({
        /** Initially, the preview state = > canvas is not editable */
        readonly: preview,
      });
    return workflowJSON;
  }

  async loadHistory(
    params: Omit<GetHistorySchemaRequest, 'workflow_id' | 'space_id'>,
  ) {
    const workflowId = this.workflowId || this.playgroundProps.workflowId;
    const spaceId = this.spaceId || this.playgroundProps.spaceId;
    const projectCommitVersion =
      this.projectCommitVersion || this.playgroundProps.projectCommitVersion;
    const { projectId } = this;

    const {
      commit_id,
      type: operateType,
      env,
      log_id,
      execute_id,
      sub_execute_id,
    } = params;

    if (!workflowId || !spaceId) {
      throw new CustomError(
        REPORT_EVENTS.parmasValidation,
        I18n.t(
          'loadHistory error: no workflowId or spaceId' as I18nKeysNoOptionsType,
        ),
      );
    }

    const { data } = await workflowApi.GetHistorySchema({
      workflow_id: workflowId,
      space_id: spaceId,
      commit_id,
      log_id,
      execute_id,
      sub_execute_id,
      type: operateType,
      env,
      project_version: projectCommitVersion,
      project_id: projectId,
    });

    const {
      schema,
      name,
      describe,
      url,
      flow_mode,
      bind_biz_id,
      bind_biz_type,
    } = data;
    const { vcsData } = this.info;
    const workflowInfo: WorkflowInfo = {
      workflow_id: workflowId,
      space_id: spaceId,
      name,
      desc: describe,
      flow_mode: flow_mode ?? WorkflowMode.Workflow,
      url,
      status: WorkFlowDevStatus.HadSubmit,
      type: WorkFlowType.User,
      schema_json: schema,
      collaborator_mode: CollaboratorMode.Open,
      vcsData: {
        ...(vcsData || {}),
        type:
          operateType === OperateType.PublishOperate
            ? VCSCanvasType.Publish
            : VCSCanvasType.Submit,
        submit_commit_id: commit_id,
      },
    };

    const workflowJSON = (
      schema ? JSON.parse(schema) : undefined
    ) as WorkflowJSON;

    this.updateConfig({
      workflowId,
      info: workflowInfo,
      preview: true,
      bindBizID: bind_biz_id,
      bindBizType: bind_biz_type,
      historyStatus: operateType,
      schemaGray: (
        workflowJSON as WorkflowJSON & {
          versions: {
            loop: string;
            batch: string;
          };
        }
      )?.versions,
    });

    // Update the readonly status of the canvas
    this.entityManager
      .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)
      ?.updateConfig({
        /** Initially, the preview state = > canvas is not editable */
        readonly: true,
      });

    return workflowJSON;
  }

  /** Acquire space-related information */
  async setSpaceInfo() {
    if (!this.config.spaceList.length) {
      const { bot_space_list } = await DeveloperApi.SpaceList();
      this.updateConfig({
        spaceList: bot_space_list,
      });
    }
    const { spaceList } = this.config;

    if (this.spaceId === PUBLIC_SPACE_ID) {
      this.updateConfig({
        spaceType: SpaceType.Team,
        spaceMode: SpaceMode.Normal,
      });
      return;
    }
    const currentSpace = spaceList.find(space => space.id === this.spaceId);

    if (!currentSpace) {
      throw new Error("space id don't in list");
    }
    const { space_type, space_mode } = currentSpace;

    this.updateConfig({
      spaceType: space_type,
      spaceMode: space_mode,
    });
  }

  get isPersonalSpace(): boolean {
    return this.config?.spaceType === SpaceType.Personal;
  }

  get isTeamSpace(): boolean {
    return this.config?.spaceType === SpaceType.Team;
  }

  /** Whether the process has been published, and whether there is a pluginId indicating whether the process has been published */
  get hasPublished(): boolean {
    return Boolean(this.config?.pluginId);
  }

  /**
   * Is the space enabled in Dev mode?
   * @Deprecated Dev mode is currently offline
   */
  get isDevSpace(): boolean {
    return this.config.spaceMode === SpaceMode.DevMode;
  }

  get personalSpaceId(): string {
    const target = this.config.spaceList.find(
      item => item.space_type === SpaceType.Personal,
    );
    return target?.id ?? '';
  }

  /* New interface, multi-player collaboration mode grey release under this interface */
  protected async queryCollaborationWorkflow(
    workflowId: string,
    spaceId: string,
  ): Promise<WorkflowInfo> {
    const { data } = await workflowApi.GetCanvasInfo(
      {
        workflow_id: workflowId,
        space_id: spaceId,
      },
      {
        __disableErrorToast: true,
      },
    );

    const {
      workflow,
      vcs_data,
      db_data,
      operation_info,
      is_bind_agent,
      bind_biz_id,
      bind_biz_type,
      workflow_version,
    } = data;

    return {
      ...workflow,
      is_bind_agent,
      space_id: spaceId,
      status: db_data?.status ?? workflow?.status,
      vcsData: vcs_data,
      operationInfo: operation_info,
      bind_biz_id,
      bind_biz_type,
      workflow_version,
      workflowSourceSpaceId: workflow?.space_id,
    } as WorkflowInfo;
  }

  protected async queryWorkflowDetail(
    workflowId: string,
    spaceId: string,
  ): Promise<WorkflowInfo> {
    try {
      const res = await this.queryCollaborationWorkflow(workflowId, spaceId);
      return res;
    } catch (e) {
      reporter.errorEvent({
        eventName: 'query_workflow_detail_fail',
        namespace: 'workflow',
        error: e,
      });
      // When the public space template is deleted, there is a cache for about 5 minutes. Here, you need to back up to prevent the preview of the deleted process from crashing.
      if (spaceId !== PUBLIC_SPACE_ID) {
        throw e;
      }
      return {};
    }
  }

  /** external incoming property */
  get playgroundProps(): WorkflowPlaygroundProps {
    return this.config.playgroundProps;
  }

  get workflowId(): string {
    return this.config.playgroundProps.workflowId || '';
  }

  get workflowCommitId(): string {
    return this.config.playgroundProps.commitId || '';
  }

  get projectCommitVersion(): string {
    return this.config.playgroundProps.projectCommitVersion || '';
  }

  get logId(): string {
    return this.config.playgroundProps.logId || '';
  }

  get spaceId(): string {
    return this.config.playgroundProps.spaceId || '';
  }

  get projectId(): string | undefined {
    // The projectId currently passed into the page or the projectId returned by interfaces such as canvas
    return (
      this.config.playgroundProps.projectId || this.config.info?.project_id
    );
  }

  /** Is it in the IDE? */
  get isInIDE(): boolean {
    return !!this.projectId;
  }

  /**
   * Get the ability of project injection, return null in non-project
   */
  getProjectApi = () => {
    const outGetProjectApi = this.config.playgroundProps.getProjectApi;
    if (outGetProjectApi && isFunction(outGetProjectApi)) {
      return outGetProjectApi();
    }
    return null;
  };
  /**
   * Reload
   */
  reload = async () => {
    const workflowJson = await this.load(
      this.config.playgroundProps.workflowId,
      this.config.playgroundProps.spaceId || '',
    );
    return workflowJson;
  };

  /**
   * canvas description information
   */
  get info(): WorkflowInfo {
    return this.config.info;
  }

  setInfo(info: Partial<WorkflowInfo>) {
    this.config.info = {
      ...this.config.info,
      ...info,
    } as WorkflowInfo;
    this.fireChange();
  }

  /**
   * The process cannot be edited, such as: the process in practice run, the process in preview state cannot be edited, the component configuration readonly, etc
   */
  get readonly(): boolean {
    return this.config.preview || this.isExecuting;
  }

  get isFromExplore(): boolean {
    return this.config.playgroundProps.from === 'explore';
  }

  /**
   * The published workflow has changed and the copy needs to be displayed
   */
  get hasChanged(): boolean {
    const { config } = this;
    return (
      config.info.plugin_id !== '0' &&
      config.info.status !== WorkFlowStatus.HadPublished
    );
  }

  get loadingError(): string | undefined {
    return this.config.loadingError;
  }

  /**
   * Is the canvas loading?
   */
  get loading(): boolean {
    return this.config.loading;
  }

  get isExecuting(): boolean {
    return this.config.viewStatus === WorkflowExecStatus.EXECUTING;
  }

  get viewStatus(): WorkflowExecStatus | undefined {
    return this.config.viewStatus;
  }

  set viewStatus(status: WorkflowExecStatus | undefined) {
    this.config.viewStatus = status;
    this.entityManager
      .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)
      ?.updateConfig({
        readonly:
          status === WorkflowExecStatus.EXECUTING || this.config.preview,
      });
    this.fireChange();
  }

  /**
   * Whether to enable collaboration mode
   */
  get isCollaboratorMode() {
    return this.info.collaborator_mode === CollaboratorMode.Open;
  }

  get isBindAgent() {
    return this.config.isBindAgent;
  }

  get bindBizID() {
    return this.config.bindBizID;
  }

  get bindBizType() {
    return this.config.bindBizType;
  }

  /** Is the current workflow bound to the Douyin doppelganger? */
  get isBindDouyin() {
    return Boolean(
      this.config.bindBizType === BindBizType.DouYinBot &&
        this.config.bindBizID,
    );
  }

  get flowMode() {
    return (this.config.info.flow_mode ||
      WorkflowMode.Workflow) as WorkflowMode;
  }

  /* Determine whether the storage mode is vcs mode, and a new interface is required in vcs mode */
  get isVcsMode() {
    return this.config.info.persistence_model === PersistenceModel.VCS;
  }

  get isNormalWorkflow() {
    return isGeneralWorkflow(this.flowMode);
  }

  get isChatflow() {
    return this.flowMode === WorkflowMode.ChatFlow;
  }

  /**
   * @deprecated to be offline
   */
  get isSceneFlow() {
    return this.flowMode === WorkflowMode.SceneFlow;
  }

  /** Is there an update for the existing plugins? */
  get inPluginUpdated() {
    return Boolean(this.config.inPluginUpdated);
  }

  /** Set whether there is an updated value for the existing plug-ins. */
  set inPluginUpdated(value: boolean) {
    this.updateConfig({
      inPluginUpdated: value,
    });
  }

  get canTestset() {
    return (
      this.spaceId !== PUBLIC_SPACE_ID &&
      this.flowMode !== WorkflowMode.SceneFlow
    );
  }

  get publishing() {
    return this.config.publishing;
  }

  /**
   * Weather show plugin node related mockset feature
   *
   * only show when the workflow meet the following conditions:
   * - the space is not a public space(999999)
   * - and not in project
   * - and not in bot op
   */
  get canMockset() {
    return (
      this.spaceId !== PUBLIC_SPACE_ID &&
      !this.projectId &&
      !IS_BOT_OP &&
      // will support soon
      !IS_OPEN_SOURCE
    );
  }

  /** Whether to show the Add Collaborator feature */
  get canCollaboration() {
    return (
      this.isTeamSpace &&
      this.spaceId !== PUBLIC_SPACE_ID &&
      !this.isSceneFlow &&
      !this.isBindDouyin
    );
  }

  get canTestRunHistory() {
    // Unable to get practice run history when viewing history
    if (this.isViewHistory) {
      return false;
    }

    // When the author does not turn on the collaboration mode, it is equivalent to a single person and can access history
    if (!this.isCollaboratorMode && this.info.creator?.self) {
      return true;
    }

    const { vcsData, persistence_model } = this.info;
    // In VCS mode, only your own draft can get the practice run history
    if (
      persistence_model === PersistenceModel.VCS &&
      !(vcsData?.type === VCSCanvasType.Draft && this.info.vcsData?.can_edit)
    ) {
      return false;
    }
    return true;
  }

  get isViewHistory() {
    return this.config.historyStatus !== undefined;
  }

  get isInitWorkflow() {
    return this.config.isInitWorkflow;
  }

  get sharedDataSetStore() {
    if (!this.config.sharedDataSet) {
      this.config.sharedDataSet = new DataSetStore();
    }
    return this.config.sharedDataSet;
  }
}

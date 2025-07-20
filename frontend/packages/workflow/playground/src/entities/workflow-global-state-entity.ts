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
   * 如果后端有回传更新时间且更新时间为 unix 时间戳则使用，否则兜底显示假时间
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
   * workflow 详情中返回的 spaceId, 官方示例场景下和当前空间的值不相等
   */
  workflowSourceSpaceId?: string;
};

export enum WorkflowExecStatus {
  DEFAULT = 'default',
  /** 执行中 */
  EXECUTING = 'executing',
  /** 执行结束（此时依然有执行结束 banner，且工作流为 disable 状态） */
  DONE = 'done',
}

/**
 * 当前流程状态
 */
export interface WorkflowGlobalState {
  /** Workflow 组件传入属性 */
  playgroundProps: WorkflowPlaygroundProps;
  workflowId: string;
  /**  画布加载中 */
  loading: boolean;
  /**  save接口请求时间，比saving要短。 */
  saveLoading: boolean;
  /**  保存中，包含debounce时间 */
  saving: boolean;
  savingError?: boolean;
  loadingError?: string;
  /**
   * 发布中
   */
  publishing: boolean;
  /**
   * 工作流自动保存时间
   */
  autoSaveTime?: string;
  autoSaveTimestamp?: number;

  /** 工作流详情 */
  info: WorkflowInfo;

  /** 当前空间类型 */
  spaceType?: SpaceType;
  /** 用户的空间列表 */
  spaceList: BotSpace[];
  /** 空间模式 */
  spaceMode: SpaceMode;

  /** 流程是否是预览态 */
  preview: boolean;

  /**
   * 工作流视图状态（与发布状态区分）
   * @default WorkflowExecStatus.DEFAULT
   */
  viewStatus?: WorkflowExecStatus;

  /** 是否发布过, 流程首次发布的时候会向 bot 注册成插件 */
  pluginId: string;

  // 增加 is_bind_agent 字段，该流程是否绑定了 bot 当做 agent
  isBindAgent: boolean;

  /** 是否绑定了抖音 */
  isBindDouyin: boolean;

  /** Workflow 存量插件是否存在更新，如果存在更新，此时会修改相关表单数据，并且需要试运行 */
  inPluginUpdated?: boolean;
  /* 是否在查看历史 */
  historyStatus?: OperateType;
  /** 绑定的业务场景 id */
  bindBizID?: string;
  /** 绑定的业务类型 */
  bindBizType?: number;
  /** 节点侧栏床是否打开 */
  nodeSideSheetVisible?: boolean;
  schemaGray?: {
    loop?: string;
    batch?: string;
  };

  /** 流程的节点和线条是否为初始状态，只判断开始结束节点的出入参 */
  isInitWorkflow?: boolean;

  /**
   * 知识库信息
   */
  sharedDataSet?: DataSetStore;
}

/**
 * 流程全局状态管理 (单例)
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

    // 加载workflow tcc配置
    await Promise.all([this.setSpaceInfo()]);

    const workflowInfo = await this.queryWorkflowDetail(workflowId, spaceId);
    const autoSaveTime = getAutoSaveTime(workflowInfo?.update_time);

    /** 判断流程是否是预览态，来自官方的流程、组件配置只读 readonly、非vcs模式不是创建者的流程、 vcs模式无协作者权限 的流程为预览态 */
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

    // 更新画布的 readonly 状态
    this.entityManager
      .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)
      ?.updateConfig({
        /** 初始情况下，预览态 => 画布不可编辑 */
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

    // 更新画布的 readonly 状态
    this.entityManager
      .getEntity<PlaygroundConfigEntity>(PlaygroundConfigEntity)
      ?.updateConfig({
        /** 初始情况下，预览态 => 画布不可编辑 */
        readonly: true,
      });

    return workflowJSON;
  }

  /** 获取空间相关信息 */
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

  /** 流程是否发布过, 是否有 pluginId 标识本流程是否发布过 */
  get hasPublished(): boolean {
    return Boolean(this.config?.pluginId);
  }

  /**
   * 空间是否启用 Dev 模式
   * @deprecated 目前 Dev 模式已经下线
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

  /* 新版接口，多人协作模式灰度下走这个接口 */
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
      // 公共空间模版删除时，存在约 5 分钟的缓存，这里需要兜底，防止预览已被删除的流程导致崩溃
      if (spaceId !== PUBLIC_SPACE_ID) {
        throw e;
      }
      return {};
    }
  }

  /** 外部传入属性 */
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
    // 页面当前传入的 projectId 或者 canvas 等接口返回的 projectId
    return (
      this.config.playgroundProps.projectId || this.config.info?.project_id
    );
  }

  /** 是否在 IDE 中 */
  get isInIDE(): boolean {
    return !!this.projectId;
  }

  /**
   * 获取 project 注入的能力，非 project 内返回为 null
   */
  getProjectApi = () => {
    const outGetProjectApi = this.config.playgroundProps.getProjectApi;
    if (outGetProjectApi && isFunction(outGetProjectApi)) {
      return outGetProjectApi();
    }
    return null;
  };
  /**
   * 重新加载
   */
  reload = async () => {
    const workflowJson = await this.load(
      this.config.playgroundProps.workflowId,
      this.config.playgroundProps.spaceId || '',
    );
    return workflowJson;
  };

  /**
   * 画布描述信息
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
   * 流程不可编辑, 如: 试运行中的流程、预览态的流程不可编辑、组件配置 readonly 等
   */
  get readonly(): boolean {
    return this.config.preview || this.isExecuting;
  }

  get isFromExplore(): boolean {
    return this.config.playgroundProps.from === 'explore';
  }

  /**
   * 已发布的 Workflow 发生变更需要展示文案
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
   * 画布是否加载中
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
   * 是否开启协作模式
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

  /** 当前工作流是否绑定抖音分身 */
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

  /* 判断存储模式是否为vcs模式，vcs模式下需要走新接口 */
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
   * @deprecated 待下线
   */
  get isSceneFlow() {
    return this.flowMode === WorkflowMode.SceneFlow;
  }

  /** 存量插件是否存在更新 */
  get inPluginUpdated() {
    return Boolean(this.config.inPluginUpdated);
  }

  /** 设置存量插件是否存在更新值 */
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
      // The community version does not support the mockset yet, for future expansion
      !IS_OPEN_SOURCE
    );
  }

  /** 是否展示添加协作者功能 */
  get canCollaboration() {
    return (
      this.isTeamSpace &&
      this.spaceId !== PUBLIC_SPACE_ID &&
      !this.isSceneFlow &&
      !this.isBindDouyin
    );
  }

  get canTestRunHistory() {
    // 查看历史时，无法获取试运行历史
    if (this.isViewHistory) {
      return false;
    }

    // 作者未开启协作模式时，相当于单人，可以获取历史
    if (!this.isCollaboratorMode && this.info.creator?.self) {
      return true;
    }

    const { vcsData, persistence_model } = this.info;
    // vcs模式下，只有自己的草稿能获取试运行历史
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

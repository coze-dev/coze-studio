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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { set } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import {
  workflowApi,
  WorkflowMode,
  type CopyWorkflowData,
  type WorkFlowTestRunData,
  type GetWorkflowProcessResponse,
  type GetWorkflowProcessRequest,
  type Workflow,
  type ReleasedWorkflow,
  type WorkflowNodeTypeData,
  type WorkflowNodeDebugV2Request,
  VCSCanvasType,
} from '@coze-workflow/base/api';
import { reporter } from '@coze-arch/logger';
import { getFlags } from '@coze-arch/bot-flags';
import { type PublishWorkflowRequest } from '@coze-arch/bot-api/workflow_api';

enum MockTrafficEnabled {
  DISABLE = 0,
  ENABLE = 1,
}

import {
  WorkflowGlobalStateEntity,
  WorkflowDependencyStateEntity,
} from '../entities';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowOperationServiceProvider = Symbol(
  'WorkflowOperationServiceProvider',
);

/**
 * Workflow addition, deletion, modification and other operation interface calls
 * Due to the existence of two different interfaces in multi-person collaboration and non-multiplayer modes, the judgment logic is uniformly converged here to reduce dirty code intrusion
 */
@injectable()
export class WorkflowOperationService {
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowDependencyStateEntity)
  readonly dependencyEntity: WorkflowDependencyStateEntity;

  get spaceId() {
    return this.globalState.spaceId;
  }

  get workflowId() {
    return this.globalState.workflowId;
  }

  get logId() {
    return this.globalState.logId;
  }

  get mocksetFgOption() {
    const options = {
      headers: {
        'rpc-persist-mock-traffic-enable': MockTrafficEnabled.ENABLE,
      },
    };
    return options;
  }

  publish = async (obj: Partial<PublishWorkflowRequest> = {}) => {
    try {
      let published = false;
      this.globalState.updateConfig({ publishing: true });
      const data = await workflowApi.PublishWorkflow({
        workflow_id: this.workflowId,
        space_id: this.spaceId,
        // Abandoned, to be deleted
        has_collaborator: false,
        // Published without testrun verification
        force: true,
        ...obj,
      });
      published = !!data.data?.success;

      reporter.successEvent({
        eventName: 'workflow_publish_success',
        namespace: 'workflow',
      });

      return published;
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_publish_fail',
        namespace: 'workflow',
        error,
      });
      return false;
    } finally {
      this.globalState.updateConfig({ publishing: false });
    }
  };

  copy = async (): Promise<
    Pick<CopyWorkflowData, 'workflow_id'> | undefined
  > => {
    if (this.globalState.info.workflowSourceSpaceId === PUBLIC_SPACE_ID) {
      const resp = await workflowApi.CopyWkTemplateApi(
        {
          target_space_id: this.spaceId,
          workflow_ids: [this.workflowId || ''],
        },
        {
          __disableErrorToast: true,
        },
      );
      return { workflow_id: resp?.data?.[this.workflowId]?.workflow_id ?? '' };
    } else {
      const { data } = await workflowApi.CopyWorkflow({
        space_id: this.spaceId,
        workflow_id: this.workflowId,
      });

      return data;
    }
  };

  save = async (json: WorkflowJSON, ignoreStatusTransfer: boolean) => {
    const FLAGS = getFlags();
    const { vcsData } = this.globalState.info;
    const { saveVersion } = this.dependencyEntity;
    const reqParams = {
      schema: JSON.stringify(json),
      workflow_id: this.workflowId,
      space_id: this.spaceId,
      submit_commit_id: vcsData?.submit_commit_id || '',
      ignore_status_transfer: ignoreStatusTransfer,
    };
    // Required within the project only
    if (
      this.globalState.projectId &&
      FLAGS?.['bot.automation.project_multi_tab']
    ) {
      set(reqParams, 'save_version', saveVersion.toString());
    }
    await workflowApi.SaveWorkflow(reqParams);
    if (this.globalState.projectId) {
      // In order to solve the problem that the canvas interface gets saveVersion and the long-chain push saveVersion are not synchronized, manually update here
      this.dependencyEntity.addSaveVersion();
    }
  };

  testRun = async ({
    baseParam,
    input,
  }): Promise<WorkFlowTestRunData | undefined> => {
    const options = {
      ...this.mocksetFgOption,
    };

    // 1. When the practice runs to view the history, you need to pass in the commitId. 2. When the practice runs in non-draft mode in cooperation mode, pass in the commitId to prevent the fallback to draft
    const commitId =
      this.globalState.isViewHistory ||
      (this.globalState.isCollaboratorMode &&
        this.globalState.info.vcsData?.type !== VCSCanvasType.Draft)
        ? this.globalState.info.vcsData?.submit_commit_id
        : '';

    const { data } = await workflowApi.WorkFlowTestRun(
      {
        ...baseParam,
        commit_id: commitId,
        input,
      },
      options,
    );

    return data;
  };

  testOneNode = async (params: WorkflowNodeDebugV2Request) =>
    await workflowApi.WorkflowNodeDebugV2(params, this.mocksetFgOption);

  getProcess = async (
    executeId?: string,
    subExecuteId?: string,
  ): Promise<GetWorkflowProcessResponse> => {
    const params: GetWorkflowProcessRequest = {
      workflow_id: this.workflowId,
      space_id: this.spaceId,
      execute_id: executeId,
      sub_execute_id: subExecuteId,
    };

    if (this.logId) {
      params.log_id = this.logId;
    }

    // If it is the log of the subprocess, the asynchronous query will not be done for the time being, and there is a bug in the backend.
    params.need_async = !subExecuteId;

    const executeResult = await workflowApi.GetWorkFlowProcess(params);
    return executeResult;
  };

  queryNodeType = async (): Promise<WorkflowNodeTypeData | undefined> => {
    const params = {
      workflow_id: this.workflowId,
      space_id: this.spaceId,
    };

    const { data } = await workflowApi.QueryWorkflowNodeTypes(params);

    const nodeTypes = data;

    return nodeTypes;
  };

  getSubWorkflowList = async ({
    workflowIds,
    filterType,
    pageParam,
    name,
    size,
  }: any): Promise<ReleasedWorkflow[] | undefined> => {
    const { data } = await workflowApi.GetReleasedWorkflows({
      workflow_ids: workflowIds,
      space_id: this.spaceId,
      type: filterType,
      page: pageParam,
      name,
      size,
      flow_mode: WorkflowMode.All,
    });

    const releasedList = data.workflow_list;

    return releasedList?.filter(item => item.workflow_id !== this.workflowId);
  };

  getReference = async (): Promise<Workflow[]> => {
    const params = {
      workflow_id: this.workflowId,
      space_id: this.spaceId,
    };

    const { data } = await workflowApi.GetWorkflowReferences(params);
    const referenceList = data.workflow_list || [];

    return referenceList;
  };

  validateSchema = async (
    json: any,
    bind?: {
      projectId?: string;
      botId?: string;
    },
  ) => {
    const { botId, projectId } = bind || {};
    const { data } = await workflowApi.ValidateSchema({
      schema: JSON.stringify(json),
      bind_project_id: projectId,
      bind_bot_id: botId,
    });

    return data;
  };
}

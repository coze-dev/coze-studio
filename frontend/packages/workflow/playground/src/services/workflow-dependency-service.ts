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

import { get, debounce } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { Emitter, type Event } from '@flowgram-adapter/common';
import {
  MessageBizType,
  MessageOperateType,
  StandardNodeType,
} from '@coze-workflow/base';
import type { WsMessageProps } from '@coze-project-ide/framework/src/types';
import { getFlags } from '@coze-arch/bot-flags';

import {
  WorkflowGlobalStateEntity,
  WorkflowDependencyStateEntity,
} from '@/entities';
import { DependencySourceType } from '@/constants';

import { WorkflowSaveService } from './workflow-save-service';
import { TestRunState, WorkflowRunService } from './workflow-run-service';
import { WorkflowOperationService } from './workflow-operation-service';
import { WorkflowModelsService } from './workflow-models-service';

export const bizTypeToDependencyTypeMap = {
  [MessageBizType.Workflow]: DependencySourceType.Workflow,
  [MessageBizType.Plugin]: DependencySourceType.Plugin,
  [MessageBizType.Dataset]: DependencySourceType.DataSet,
  [MessageBizType.Database]: DependencySourceType.DataBase,
};

const DEBOUNCE_TIME = 2000;
export interface DependencyStore {
  refreshModalVisible: boolean;
  setRefreshModalVisible: (visible: boolean) => void;
}

interface SubworkflowVersionChangeProps {
  subWorkflowId: string;
}

@injectable()
export class WorkflowDependencyService {
  @inject(WorkflowModelsService) modelsService: WorkflowModelsService;
  @inject(WorkflowDocument) protected workflowDocument: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowSaveService) saveService: WorkflowSaveService;
  @inject(WorkflowOperationService) operationService: WorkflowOperationService;
  @inject(WorkflowRunService) testRunService: WorkflowRunService;
  @inject(WorkflowDependencyStateEntity)
  dependencyEntity: WorkflowDependencyStateEntity;

  onDependencyChangeEmitter = new Emitter<WsMessageProps | undefined>();
  onDependencyChange: Event<WsMessageProps | undefined> =
    this.onDependencyChangeEmitter.event;

  onSubWrokflowVersionChangeEmitter = new Emitter<
    SubworkflowVersionChangeProps | undefined
  >();
  onSubWrokflowVersionChange: Event<SubworkflowVersionChangeProps | undefined> =
    this.onSubWrokflowVersionChangeEmitter.event;

  /**
   * Possible badcases:
   * - The save interface returns slowly, resulting in the refresh pop-up window of the long chain refresh before the version conflict error, but this scenario is relatively limited, and it is necessary to optimize it later.
   * - Canvas interface returns slowly, resulting in a long chain push notification message consistent with the current version, resulting in an additional refresh.
   * Avoid this problem by judging the version number again before refreshing.
   */
  private workflowDocumentReload = debounce(
    (callback, messageVersion?: bigint) => {
      const isVersionNewer =
        messageVersion && this.dependencyEntity.saveVersion > messageVersion;
      if (this.dependencyEntity.refreshModalVisible || isVersionNewer) {
        return;
      }
      callback?.();
    },
    DEBOUNCE_TIME,
  );

  updateDependencySources(props: WsMessageProps, callback?: () => void) {
    const FLAGS = getFlags();
    if (!FLAGS['bot.automation.project_multi_tab']) {
      return;
    }

    const allNodes = this.workflowDocument.getAllNodes();
    const llmNodes = allNodes.filter(
      n => n.flowNodeType === StandardNodeType.LLM,
    );

    // LLM Node Skill Update
    llmNodes?.forEach(node => {
      const formData = node.getData(FlowNodeFormData);
      const formValue = formData.toJSON();
      const llmSkillIdFields = [
        { field: 'fcParam.pluginFCParam.pluginList', key: 'api_id' },
        { field: 'fcParam.knowledgeFCParam.knowledgeList', key: 'id' },
        { field: 'fcParam.workflowFCParam.workflowList', key: 'workflow_id' },
      ];

      const skillNeedRefresh = llmSkillIdFields.some(subSkill => {
        const subSkillList = get(formValue.inputs, subSkill.field) ?? [];
        return subSkillList.find(
          (item: unknown) => get(item, subSkill.key) === props?.resId,
        );
      });

      if (skillNeedRefresh) {
        const nextProps: WsMessageProps = {
          ...props,
          extra: {
            nodeIds: [node.id],
          },
        };
        this.onDependencyChangeEmitter.fire(nextProps);
      }
    });
    const { saveVersion } = this.dependencyEntity;

    const dependencyHandlers: {
      [key in DependencySourceType]: (
        nodes: FlowNodeEntity[],
        source?: WsMessageProps,
      ) => Promise<void> | void;
    } = {
      [DependencySourceType.Workflow]: (_nodes, resource) => {
        // The current workflow is updated on other pages
        if (resource?.resId === this.globalState.workflowId) {
          // If you modify the workflow name or description, saveVersion will not be updated
          const isMetaUpdate =
            resource?.operateType === MessageOperateType.MetaUpdate;
          // Switch workflow type scene needs to be refreshed
          const isFlowModeChange =
            resource?.extra?.flowMode !== undefined &&
            this.globalState.flowMode.toString() !== resource.extra.flowMode;
          const metaUpdateNeedRefresh = isMetaUpdate && isFlowModeChange;
          // No refresh required during practice runs
          const isTestRunning =
            this.testRunService.testRunState === TestRunState.Executing ||
            this.testRunService.testRunState === TestRunState.Paused;
          // The current version is larger than the saved version of other pages and does not need to be refreshed.
          const resourceVersion = BigInt(resource?.saveVersion ?? 0);
          const isCurVersionNewer = saveVersion > resourceVersion;
          if (
            isCurVersionNewer ||
            this.dependencyEntity.refreshModalVisible ||
            isTestRunning
          ) {
            if (metaUpdateNeedRefresh) {
              this.workflowDocumentReload(callback);
            }
            return;
          }
          this.workflowDocumentReload(callback, resourceVersion);
          return;
        }

        const subWorkflowNodes = _nodes.filter(
          n => n.flowNodeType === StandardNodeType.SubWorkflow,
        );
        const needUpdateNodeIds: string[] = [];
        subWorkflowNodes?.forEach(node => {
          const formData = node.getData(FlowNodeFormData);
          const formValue = formData.toJSON();
          const { workflowId } = formValue.inputs;
          // The child workflows within the current workflow are updated
          if (resource?.resId === workflowId) {
            needUpdateNodeIds.push(workflowId);
          }
        });
        if (!needUpdateNodeIds.length) {
          return;
        }
        const nextProps: WsMessageProps = {
          ...props,
          extra: {
            nodeIds: needUpdateNodeIds,
          },
        };
        this.onDependencyChangeEmitter.fire(nextProps);
      },
      [DependencySourceType.Plugin]: (nodes, resource) => {
        const apiNodes = nodes.filter(
          n => n.flowNodeType === StandardNodeType.Api,
        );
        const needUpdateNodeIds: string[] = [];
        apiNodes?.forEach(node => {
          const formData = node.getData(FlowNodeFormData);
          const formValue = formData.toJSON();
          const apiParam = formValue.inputs.apiParam.find(
            param => param.name === 'apiID',
          );
          const apiID = apiParam.input.value.content ?? '';
          if (apiID === resource?.resId) {
            needUpdateNodeIds.push(node.id);
          }
        });
        if (!needUpdateNodeIds.length) {
          return;
        }
        const nextProps: WsMessageProps = {
          ...props,
          extra: {
            nodeIds: needUpdateNodeIds,
          },
        };
        this.onDependencyChangeEmitter.fire(nextProps);
      },
      [DependencySourceType.DataSet]: (_, resource) => {
        // Clear the knowledge base cache
        this.globalState.sharedDataSetStore.clearDataSetInfosMap();
        this.onDependencyChangeEmitter.fire(resource);
      },
      [DependencySourceType.DataBase]: (_, resource) => {
        this.onDependencyChangeEmitter.fire(resource);
      },
      [DependencySourceType.LLM]: (_, resource) => {
        this.onDependencyChangeEmitter.fire(resource);
      },
    };

    if (props?.bizType) {
      // Set the refresh method in the refresh pop-up window
      this.dependencyEntity.setRefreshFunc(() => {
        callback?.();
      });

      const dependencyType = bizTypeToDependencyTypeMap[props.bizType];
      dependencyHandlers[dependencyType](allNodes, props);
    }
  }
}

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
   * 可能的 badcase:
   * - save 接口返回较慢，导致长链刷新先于版本冲突报错的刷新弹窗,但是该场景比较极限，后续有必要再优化
   * - canvas 接口返回较慢，导致长链消息推送了一条和当前版本一致的消息，导致一次额外刷新。
   * 通过刷新前再判断一次版本号，避免该问题。
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

    // LLM 节点技能更新
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
        // 当前工作流在其他页面被更新
        if (resource?.resId === this.globalState.workflowId) {
          // 修改工作流名称或描述的情况 saveVersion 不会更新
          const isMetaUpdate =
            resource?.operateType === MessageOperateType.MetaUpdate;
          // 切换工作流类型场景需要刷新
          const isFlowModeChange =
            resource?.extra?.flowMode !== undefined &&
            this.globalState.flowMode.toString() !== resource.extra.flowMode;
          const metaUpdateNeedRefresh = isMetaUpdate && isFlowModeChange;
          // 试运行过程中不需要刷新
          const isTestRunning =
            this.testRunService.testRunState === TestRunState.Executing ||
            this.testRunService.testRunState === TestRunState.Paused;
          // 当前版本大于其他页面保存版本，不需要刷新
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
          // 当前工作流内子工作流被更新
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
        // 清空知识库缓存
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
      // 设置刷新弹窗中的刷新方法
      this.dependencyEntity.setRefreshFunc(() => {
        callback?.();
      });

      const dependencyType = bizTypeToDependencyTypeMap[props.bizType];
      dependencyHandlers[dependencyType](allNodes, props);
    }
  }
}

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
import { userStoreService } from '@coze-studio/user-store';
import { type ProjectFormValues } from '@coze-studio/project-entity-adapter';
import {
  Emitter,
  type Event,
  ModalService,
  OptionsService,
  ModalType,
  ErrorService,
} from '@coze-project-ide/framework';
import {
  IntelligenceType,
  type IntelligenceBasicInfo,
  type IntelligencePublishInfo,
  type User,
} from '@coze-arch/idl/intelligence_api';
import {
  BehaviorType,
  SpaceResourceType,
} from '@coze-arch/bot-api/playground_api';
import {
  PlaygroundApi,
  PluginDevelopApi,
  intelligenceApi,
} from '@coze-arch/bot-api';

@injectable()
export class ProjectInfoService {
  @inject(OptionsService)
  private optionsService: OptionsService;

  @inject(ModalService)
  private modalService: ModalService;

  @inject(ErrorService)
  private errorService: ErrorService;

  public projectInfo?: {
    projectInfo?: IntelligenceBasicInfo;
    publishInfo?: IntelligencePublishInfo;
    ownerInfo?: User;
  };

  public initialValue: ProjectFormValues;

  private readonly onProjectInfoUpdatedEmitter = new Emitter<void>();
  readonly onProjectInfoUpdated: Event<void> =
    this.onProjectInfoUpdatedEmitter.event;

  init() {
    this.updateProjectInfo().catch(() => {
      // project 信息接口报错跳转到兜底页
      this.errorService.toErrorPage();
    });
    if (!IS_OPEN_SOURCE) {
      this.wakeUpPlugin();
    }
    this.initTaskList();
    this.reportUserBehavior();
  }

  async initTaskList() {
    const res = await intelligenceApi.DraftProjectInnerTaskList({
      project_id: this.optionsService.projectId,
    });
    // 和后端确认，默认 task_list 长度为 1.
    // 如果有长度为 2 没有都住的场景，用户刷新后也可以获取到下一个。
    const { task_list } = res.data || {};
    const taskId = task_list?.[0]?.task_id;
    if (taskId) {
      // 请求轮询接口获取基础信息
      const { task_detail } = await PluginDevelopApi.ResourceCopyDetail({
        task_id: taskId,
      });
      this.modalService.onModalVisibleChangeEmitter.fire({
        type: ModalType.RESOURCE,
        scene: task_detail?.scene,
        resourceName: task_detail?.res_name,
      });
      this.modalService.doPolling(taskId);
    }
  }

  /**
   * 打开 project 页面需要上报，后端才能筛选出最近打开
   */
  reportUserBehavior() {
    PlaygroundApi.ReportUserBehavior({
      space_id: this.optionsService.spaceId,
      behavior_type: BehaviorType.Visit,
      resource_id: this.optionsService.projectId,
      resource_type: SpaceResourceType.Project,
    });
  }

  /**
   * 单向请求接口
   * 提前唤醒 ide 插件，无需消费返回值
   */
  wakeUpPlugin() {
    PluginDevelopApi.WakeupIdePlugin({
      space_id: this.optionsService.spaceId,
      project_id: this.optionsService.projectId,
      dev_id: userStoreService.getUserInfo()?.user_id_str,
    });
  }

  async updateProjectInfo() {
    const res = await intelligenceApi.GetDraftIntelligenceInfo({
      intelligence_id: this.optionsService.projectId,
      intelligence_type: IntelligenceType.Project,
      version: this.optionsService.version || undefined,
    });
    this.projectInfo = {
      projectInfo: res.data?.basic_info,
      publishInfo: res.data?.publish_info,
      ownerInfo: res.data?.owner_info,
    };
    this.initialValue = {
      space_id: this.optionsService?.spaceId,
      project_id: this.optionsService?.projectId,
      name: this.projectInfo?.projectInfo?.name,
      description: this.projectInfo?.projectInfo?.description,
      icon_uri: [
        {
          uid: this.projectInfo?.projectInfo?.icon_uri || '',
          url: this.projectInfo?.projectInfo?.icon_url || '',
        },
      ],
    };
    this.onProjectInfoUpdatedEmitter.fire();
  }
}

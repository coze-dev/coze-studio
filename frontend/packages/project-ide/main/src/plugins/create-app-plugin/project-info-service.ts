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
      // Project information interface error Jump to default page
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
    // And backend confirmation, the default task_list length is 1.
    // If there is a scene with a length of 2 that is not lived, the user can also get the next one after refreshing.
    const { task_list } = res.data || {};
    const taskId = task_list?.[0]?.task_id;
    if (taskId) {
      // Request polling interface to obtain basic information
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
   * To open the project page, you need to report it, and the backend can filter out the most recently opened.
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
   * one-way request interface
   * Wake up the ide plugin in advance, no need to consume the return value
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

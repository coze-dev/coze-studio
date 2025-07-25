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
 
import { useState } from 'react';

import { WorkflowMode } from '@coze-workflow/base';
import { AddWorkflowToStoreEntry } from '@coze-arch/bot-tea';
import { type ResourceInfo, ResType } from '@coze-arch/bot-api/plugin_develop';
import {
  PublishWorkflowModal,
  usePublishWorkflowModal,
} from '@coze-workflow/resources-adapter';

import { type CommonActionProps, type PublishActionReturn } from './type';

export const usePublishAction = ({
  spaceId = '',
  refreshPage,
}: CommonActionProps): PublishActionReturn => {
  const [flowMode, setFlowMode] = useState<WorkflowMode>(WorkflowMode.Workflow);
  const publishWorkflowModalHook = usePublishWorkflowModal({
    onPublishSuccess: () => {
      refreshPage?.();
    },
    fromSpace: true,
    flowMode,
  });

  /**
   * NOTICE: 此函数由商店侧维护, 可联系 @gaoding
   * 发布/更新流程商品
   */
  const onPublishStore = (item: ResourceInfo) => {
    setFlowMode(
      item.res_type === ResType.Imageflow
        ? WorkflowMode.Imageflow
        : WorkflowMode.Workflow,
    );
    // 商店渲染流程需要 spaceId 信息, 在这个场景需要手动设置对应信息
    publishWorkflowModalHook.setSpace(spaceId);
    publishWorkflowModalHook.showModal({
      type: PublishWorkflowModal.WORKFLOW_INFO,
      product: {
        meta_info: {
          entity_id: item.res_id,
          name: item.name,
        },
      },
      source: AddWorkflowToStoreEntry.WORKFLOW_PERSONAL_LIST,
    });
  };
  return {
    actionHandler: onPublishStore,
    publishModal: publishWorkflowModalHook.ModalComponent,
  };
};

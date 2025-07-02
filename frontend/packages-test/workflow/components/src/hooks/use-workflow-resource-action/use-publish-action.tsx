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

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
 
import { useCallback, useEffect } from 'react';

import { debounce } from 'lodash-es';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIModal, UIToast } from '@coze-arch/bot-semi';
import { type SceneResponseType } from '@coze-arch/bot-hooks/src/page-jump';
import {
  usePageJumpResponse,
  PageType,
  SceneType,
  OpenModeType,
} from '@coze-arch/bot-hooks';
import { CustomError } from '@coze-arch/bot-error';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { PluginType } from '@coze-arch/bot-api/developer_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';

/**
 * workflow 发布成功后跳转回 bot 编辑页，弹窗提示是否添加到 bot
 */
export const useWorkflowPublishedModel = ({
  flowMode,
  addedWorkflows,
  onOk,
  skipByExternal,
  title = I18n.t('PublishSuccessConfirm'),
  pageType = PageType.BOT,
}: {
  flowMode?: WorkflowMode;
  /** 已添加的 workflow（若已添加该 workflow 则不弹窗）。为了兼容 single 和 multi 模式，所以由外部传入 */
  addedWorkflows: WorkFlowItemType[];
  /** 点击确认并查询 workflow 对应的 plugin 成功后的回调，也是为了兼容 single 和 multi 两种模式才由外部传入 */
  onOk: (workflow: WorkFlowItemType) => unknown;
  /** 允许业务方额外附带禁止弹窗的条件。主要用于 multi 模式 */
  skipByExternal?: (
    jumpResponse: SceneResponseType<
      | SceneType.WORKFLOW_PUBLISHED__BACK__BOT
      | SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT
      | SceneType.WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE
    >,
  ) => boolean;
  title?: string;
  pageType?: PageType;
}): void => {
  const isImageflow = flowMode === WorkflowMode.Imageflow;
  const jumpResponse = usePageJumpResponse(pageType);

  // 使用 useCallback 缓存防抖函数，避免 UIModal 弹窗出现多次
  const debouncedEffect = useCallback(
    debounce(() => {
      const isNotWorkflowPublishedBackBot =
        jumpResponse?.scene !== SceneType.WORKFLOW_PUBLISHED__BACK__BOT;
      const isNotWorkflowPublishedBackSocialScene =
        jumpResponse?.scene !==
        SceneType.WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE;
      const isOnlyOnceAdd =
        (
          jumpResponse as SceneResponseType<SceneType.WORKFLOW_PUBLISHED__BACK__BOT>
        )?.workflowOpenMode === OpenModeType.OnlyOnceAdd;

      const isNotWorkflowPublishedBackDouyinBot =
        jumpResponse?.scene !== SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT;

      if (
        (isNotWorkflowPublishedBackBot &&
          isNotWorkflowPublishedBackDouyinBot &&
          isNotWorkflowPublishedBackSocialScene) ||
        isOnlyOnceAdd
      ) {
        // 不是发布跳转的场景，或者是仅添加一次，直接不弹窗
        return;
      }

      // 配置了 flowMode 才判断，否则不进行 flowMode 限制（适配 ChatFlow）
      if (
        typeof flowMode !== 'undefined' &&
        (jumpResponse?.flowMode || WorkflowMode.Workflow) !== flowMode
      ) {
        return;
      }

      if (skipByExternal?.(jumpResponse)) {
        return;
      }

      if (
        addedWorkflows.some(
          workflow => workflow.workflow_id === jumpResponse.workflowID,
        )
      ) {
        // 已经添加过该 workflow 了，不弹窗
        return;
      }

      const { workflowID, pluginID } = jumpResponse;
      UIModal.success({
        title,
        cancelText: I18n.t('Cancel'),
        okText: I18n.t('Confirm'),
        onCancel: () => jumpResponse.clearScene(true),
        onOk: async () => {
          try {
            const plugin = (
              await PluginDevelopApi.GetPlaygroundPluginList({
                space_id: useSpaceStore.getState().getSpaceId(),
                page: 1,
                size: 1,
                plugin_ids: [pluginID],
                plugin_types: [
                  isImageflow ? PluginType.IMAGEFLOW : PluginType.WORKFLOW,
                ],
              })
            ).data?.plugin_list?.[0];
            if (!plugin) {
              const msg = I18n.t('AddFailedToast');
              UIToast.error({
                content: withSlardarIdButton(msg),
              });
              throw new CustomError('normal_error', msg);
            }
            const workflow: WorkFlowItemType = {
              workflow_id: workflowID,
              plugin_id: plugin.id || '',
              name: plugin.name || '',
              desc: plugin.desc_for_human || '',
              parameters: plugin.plugin_apis?.at(0)?.parameters ?? [],
              plugin_icon: plugin.plugin_icon || '',
              flow_mode:
                plugin.plugin_type === PluginType.IMAGEFLOW
                  ? WorkflowMode.Imageflow
                  : (jumpResponse?.flowMode ?? WorkflowMode.Workflow),
            };
            const onOkResult = onOk(workflow);
            const res = await Promise.resolve(onOkResult);
            if (res !== false) {
              UIToast.success(
                I18n.t('AddSuccessToast', { name: plugin.name || workflowID }),
              );
              emitEvent(
                isImageflow
                  ? OpenBlockEvent.IMAGEFLOW_BLOCK_OPEN
                  : OpenBlockEvent.WORKFLOW_BLOCK_OPEN,
              );
            }
          } catch (e) {
            reporter.error({
              message: e instanceof Error ? e.message : e?.toString(),
              error: e,
            });
          } finally {
            jumpResponse.clearScene(true);
          }
        },
      });
    }, 1000),
    [], // 空依赖数组
  );

  useEffect(() => {
    debouncedEffect();

    // 清理函数
    return () => {
      debouncedEffect.cancel();
    };
  }, [debouncedEffect]);
};

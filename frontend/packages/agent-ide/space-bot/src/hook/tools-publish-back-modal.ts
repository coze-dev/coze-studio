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
 * After the workflow is successfully published, jump back to the bot editing page, and the pop-up window prompts whether to add it to the bot.
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
  /** The workflow that has been added (if the workflow has been added, the window will not pop up). For compatibility with single and multi modes, it is passed in externally */
  addedWorkflows: WorkFlowItemType[];
  /** Click Confirm and query the callback after the plugin corresponding to the workflow is successful. It is also passed in externally for compatibility with single and multi modes */
  onOk: (workflow: WorkFlowItemType) => unknown;
  /** Allows the business side to attach additional conditions to prohibit pop-ups. Mainly used in multi mode */
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

  // Use useCallback cache stabilization function to avoid multiple UIModal pop-ups
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
        // It is not to publish the jump scene, or to add it only once without popping up.
        return;
      }

      // The flowMode is configured to judge, otherwise the flowMode restriction will not be performed (adapted to ChatFlow)
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
        // The workflow has been added, no pop-up window.
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
                  : jumpResponse?.flowMode ?? WorkflowMode.Workflow,
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
    [], // empty dependent array
  );

  useEffect(() => {
    debouncedEffect();

    // cleanup function
    return () => {
      debouncedEffect.cancel();
    };
  }, [debouncedEffect]);
};

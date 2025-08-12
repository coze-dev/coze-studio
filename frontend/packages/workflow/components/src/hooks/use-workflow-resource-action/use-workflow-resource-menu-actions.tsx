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

import type { ReactNode } from 'react';

import {
  ProductDraftStatus,
  type FrontWorkflowInfo,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Table, type TableActionProps, Toast } from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';
import {
  resource_resource_common,
  type ResourceInfo,
  ResType,
} from '@coze-arch/bot-api/plugin_develop';

import {
  useWorkflowImportExport,
  extractWorkflowIdFromResource,
} from '../use-workflow-import-export';
import {
  parseWorkflowResourceBizExtend,
  transformResourceToWorkflowEditInfo,
} from './utils';
import { useWorkflowPublishEntry } from './use-workflow-publish-entry';
import { usePublishAction } from './use-publish-action';
import { useDeleteAction } from './use-delete-action';
import { useCopyAction } from './use-copy-action';
import { useChatflowSwitch } from './use-chatflow-switch';
import {
  type WorkflowResourceActionProps,
  type WorkflowResourceActionReturn,
} from './type';

const { ActionKey } = resource_resource_common;

type ActionItemProps = NonNullable<TableActionProps['actionList']>[number];

export const useWorkflowResourceMenuActions = (
  props: WorkflowResourceActionProps & {
    userId?: string;
    onEditWorkflowInfo: (partialWorkflowInfo: FrontWorkflowInfo) => void;
  },
): Pick<WorkflowResourceActionReturn, 'renderWorkflowResourceActions'> & {
  modals: ReactNode[];
} => {
  const [FLAGS] = useFlags();
  const { userId, onEditWorkflowInfo, getCommonActions } = props;
  const { actionHandler: deleteAction, deleteModal } = useDeleteAction(props);
  const { actionHandler: copyAction } = useCopyAction(props);
  const { actionHandler: publishAction, publishModal } =
    usePublishAction(props);
  const { switchToChatflow, switchToWorkflow } = useChatflowSwitch({
    spaceId: props.spaceId ?? '',
    refreshPage: props.refreshPage,
  });

  const { exportWorkflow } = useWorkflowImportExport({
    spaceId: props.spaceId ?? '',
    onSuccess: () => {
      Toast.success(
        I18n.t('workflow_export_success') || 'Workflow exported successfully',
      );
    },
    onError: error => {
      Toast.error(
        `${I18n.t('workflow_export_failed') || 'Export failed'}: ${
          error.message
        }`,
      );
    },
  });

  // 导出工作流功能
  const handleExportWorkflow = async (record: ResourceInfo) => {
    try {
      const workflowId = extractWorkflowIdFromResource(record);
      await exportWorkflow({
        workflowIds: [workflowId],
        spaceId: props.spaceId ?? '',
        includeDependencies: true,
        includeVersions: false,
      });
    } catch (error) {
      console.error('Export workflow failed:', error);
    }
  };
  const actionMap = {
    [ActionKey.Copy]: copyAction,
    [ActionKey.Delete]: deleteAction,
    [ActionKey.Edit]: (record: ResourceInfo) => {
      const workflowPartialInfo = transformResourceToWorkflowEditInfo(record);
      onEditWorkflowInfo(workflowPartialInfo as FrontWorkflowInfo);
    },
    [ActionKey.SwitchToFuncflow]: switchToWorkflow,
    [ActionKey.SwitchToChatflow]: switchToChatflow,
  };

  const { enablePublishEntry } = useWorkflowPublishEntry();
  // eslint-disable-next-line complexity -- Complex function for handling workflow resource actions
  const renderWorkflowResourceActions = (record: ResourceInfo): ReactNode => {
    const bizExtend = parseWorkflowResourceBizExtend(record.biz_extend);
    const productDraftStatus = bizExtend?.product_draft_status;
    const isImageFlow = record.res_type === ResType.Imageflow;
    const { actions } = record;
    const deleteActionConfig = actions?.find(
      action => action.key === ActionKey.Delete,
    );
    const copyActionConfig = actions?.find(
      action => action.key === ActionKey.Copy,
    );
    const editConfig = actions?.find(action => action.key === ActionKey.Edit);
    const chatflowConfig = actions?.find(
      action => action.key === ActionKey.SwitchToChatflow,
    );
    const workflowConfig = actions?.find(
      action => action.key === ActionKey.SwitchToFuncflow,
    );

    const isSelfCreator = record.creator_id === userId;
    const extraActions: ActionItemProps[] = [
      {
        hide: !editConfig,
        disabled: editConfig?.enable === false,
        actionKey: 'edit',
        actionText: I18n.t('Edit'),
        handler: () => actionMap?.[ActionKey.Edit]?.(record),
      },
      {
        hide: !chatflowConfig,
        disabled: chatflowConfig?.enable === false,
        actionKey: 'switchChatflow',
        actionText: I18n.t('wf_chatflow_121', {
          flowMode: I18n.t('wf_chatflow_76'),
        }),
        handler: () => actionMap?.[ActionKey.SwitchToChatflow]?.(record),
      },
      {
        hide: !workflowConfig,
        disabled: workflowConfig?.enable === false,
        actionKey: 'switchWorkflow',
        actionText: I18n.t('wf_chatflow_121', { flowMode: I18n.t('Workflow') }),
        handler: () => actionMap?.[ActionKey.SwitchToFuncflow]?.(record),
      },
      {
        hide: false, // 导出功能始终可用
        disabled: false,
        actionKey: 'export',
        actionText: I18n.t('导出') || 'Export',
        handler: () => handleExportWorkflow(record),
      },
      ...(getCommonActions?.(record) ?? []),
      {
        hide:
          !enablePublishEntry || // The entrance on the shelf is white.
          (!FLAGS['bot.community.store_imageflow'] && isImageFlow) || // Imageflow does not support stores
          !isSelfCreator ||
          bizExtend?.plugin_id === '0',
        actionKey: 'publishWorkflowProduct',
        actionText:
          productDraftStatus === ProductDraftStatus.Default
            ? I18n.t('workflowstore_submit')
            : I18n.t('workflowstore_submit_update'),
        handler: () => {
          publishAction?.(record);
        },
      },
    ];
    return (
      <Table.TableAction
        deleteProps={{
          hide: !deleteActionConfig,
          disabled: deleteActionConfig?.enable === false,
          disableConfirm: true,
          handler: () => actionMap[ActionKey.Delete]?.(record),
        }}
        copyProps={{
          hide: !copyActionConfig,
          disabled: copyActionConfig?.enable === false,
          handler: () => actionMap[ActionKey.Copy]?.(record),
        }}
        actionList={extraActions}
      />
    );
  };
  return { renderWorkflowResourceActions, modals: [deleteModal, publishModal] };
};

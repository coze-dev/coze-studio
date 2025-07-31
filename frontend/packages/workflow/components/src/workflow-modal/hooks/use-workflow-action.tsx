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

/* eslint-disable @coze-arch/max-line-per-function */
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';

import { isBoolean } from 'lodash-es';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';
import {
  useCozeProRightsStore,
  getIsCozePro,
} from '@coze-workflow/resources-adapter';
import {
  type DeleteType,
  type Workflow,
  workflowApi,
  WorkflowMode,
} from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { CustomError } from '@coze-arch/bot-error';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { PluginType } from '@coze-arch/bot-api/developer_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { Button, Space, Toast, Typography } from '@coze-arch/coze-design';

import WorkflowModalContext from '../workflow-modal-context';
import { isSelectProjectCategory } from '../utils';
import {
  type BotPluginWorkFlowItem,
  DataSourceType,
  type ProductInfo,
  type WorkflowInfo,
  type WorkflowItemType,
  type WorkFlowModalModeProps,
} from '../type';
import { reporter, wait } from '../../utils';

/**
 * special error code
 * - 788664021: Due to model reasons, replicating workflows in the store is not currently supported
 * - 788664024: The template has not been purchased, please go to the template details page to buy and then copy it.
 */
const copyProductErrorCodes = ['788664021', '788664024'];

const { Text } = Typography;

export interface WorkflowCardProps extends WorkFlowModalModeProps {
  data: WorkflowInfo | ProductInfo;
  workflowNodes?: WorkflowNodeJSON[];
  copyProductHandle: (
    item: ProductInfo,
    targetSpaceId: string,
  ) => Promise<{
    workflowId: string;
    pluginId: string;
  }>;
  /**
   * Workflow delete the handler that is triggered when the button is clicked
   * @param row
   */
  handleDeleteWorkflow?: (row: WorkflowInfo) => Promise<{
    canDelete: boolean;
    deleteType: DeleteType;
    handleDelete:
      | ((params?: { needDeleteBlockwise: boolean }) => Promise<void>)
      | undefined;
  }>;
  /**
   * Is it a special offer for the professional version?
   */
  isProfessionalTemplate?: boolean;
}

interface UseWorkflowActionReturn {
  /** Copy the official process template */
  dupWorkflowTpl: () => Promise<void>;
  /** Copy process product */
  dupProduct: () => Promise<void>;
  /** Add process */
  addWorkflow: () => Promise<boolean>;
  /** removal process */
  removeWorkflow: () => void;
  /**
   * delete process
   */
  deleteWorkflow: () => Promise<void>;
  /** Process item click */
  itemClick: () => void;
}

// eslint-disable-next-line max-lines-per-function
export function useWorkflowAction({
  data,
  workFlowList,
  copyProductHandle,
  onWorkFlowListChange,
  onAdd,
  onRemove,
  onItemClick,
  onDupSuccess,
  onDelete,
  handleDeleteWorkflow,
  isProfessionalTemplate,
}: WorkflowCardProps): UseWorkflowActionReturn {
  const context = useContext(WorkflowModalContext);
  const { bot_id: botId } = useParams<DynamicParams>();

  const navigate = useNavigate();

  const isCozePro = useCozeProRightsStore(state =>
    getIsCozePro(state?.rightsInfo),
  );
  useEffect(() => {
    useCozeProRightsStore.getState().getRights();
  }, []);

  async function getWorkflowItem(config: {
    spaceId?: string;
    workflowId?: string;
    pluginId?: string;
    isImageflow: boolean;
    flowMode?: WorkflowMode;
  }): Promise<BotPluginWorkFlowItem> {
    if (isSelectProjectCategory(context?.modalState)) {
      return getProjectWorkflow(config);
    }
    return getWorkflowItemByPluginId(config);
  }

  async function getProjectWorkflow(config: {
    workflowId?: string;
    spaceId?: string;
  }): Promise<BotPluginWorkFlowItem> {
    if (!config.spaceId || !config.workflowId) {
      throw new CustomError('normal_error', 'getProjectWorkflow: empty id');
    }
    const resp = await workflowApi.GetWorkflowDetail(
      {
        space_id: config.spaceId,
        workflow_ids: [config.workflowId],
      },
      {
        __disableErrorToast: true,
      },
    );

    // Get the workflow information first
    const workflowInfos = resp.data ?? [];
    if (!workflowInfos?.length) {
      Toast.error(I18n.t('workflow_add_list_added_id_empty'));
      throw new CustomError('normal_error', 'project workflow list no item');
    }
    return workflowInfos.at(0) as BotPluginWorkFlowItem;
  }
  /**
   * Construct a new workflowItem by plugin ID
   */
  // eslint-disable-next-line complexity
  async function getWorkflowItemByPluginId(config: {
    spaceId?: string;
    workflowId?: string;
    pluginId?: string;
    isImageflow: boolean;
    flowMode?: WorkflowMode;
  }) {
    if (!config.spaceId || !config.workflowId || !config.pluginId) {
      throw new CustomError(
        'normal_error',
        'getWorkflowItemByPluginId: empty id',
      );
    }
    const resp = await PluginDevelopApi.GetPlaygroundPluginList(
      {
        space_id: config.spaceId,
        page: 1,
        size: 1,
        plugin_ids: [config.pluginId || ''],
        plugin_types: [
          config.isImageflow ? PluginType.IMAGEFLOW : PluginType.WORKFLOW,
        ],
      },
      {
        __disableErrorToast: true,
      },
    );

    // Get the workflow information first
    const pluginInfos = resp.data?.plugin_list ?? [];
    if (!pluginInfos?.length) {
      Toast.error(
        I18n.t(
          config.isImageflow
            ? 'imageflow_add_toast_error'
            : 'workflow_add_list_added_id_empty',
        ),
      );
      throw new CustomError('normal_error', 'plugin_list no item');
    }
    const target = pluginInfos.at(0);
    const newWorkflow: BotPluginWorkFlowItem = {
      workflow_id: config.workflowId || '',
      plugin_id: config.pluginId || '',
      name: target?.name || '',
      desc: target?.desc_for_human || '',
      parameters: target?.plugin_apis?.at(0)?.parameters ?? [],
      plugin_icon: target?.plugin_icon || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      version_name: (target as any)?.version_name,
      flow_mode:
        target?.plugin_type === PluginType.IMAGEFLOW
          ? WorkflowMode.Imageflow
          : config.flowMode ?? WorkflowMode.Workflow,
    };

    return newWorkflow;
  }

  function isTypeWorkflow(
    target: WorkflowInfo | ProductInfo,
  ): target is WorkflowInfo {
    return context?.modalState.dataSourceType === DataSourceType.Workflow;
  }

  /** Open the process details page */
  function openWorkflowDetailPage(workflow: WorkflowInfo | ProductInfo) {
    const flowData = workflow as Workflow;
    const wId = (flowData as WorkflowInfo).workflow_id ?? '';

    const query = new URLSearchParams();
    botId && query.append('bot_id', botId);
    query.append('space_id', context?.spaceId ?? '');
    query.append('workflow_id', wId);
    window.open(`/work_flow?${query.toString()}`, '_blank');
  }

  const dupProduct = async () => {
    if (!context) {
      return;
    }

    if (isTypeWorkflow(data)) {
      return;
    }

    if (isProfessionalTemplate && !isCozePro) {
      // Jump to professional version login
      navigate(
        `/sign/oauth?redirect=${encodeURIComponent(
          '/store/bot',
        )}&platform=volcano&page_from=coze_pro_sign_in`,
      );
      return;
    }

    reporter.info({ message: 'workflow_modal: dupProduct' });

    let newPluginId = '';
    let newWorkflowId = '';
    try {
      const resp = await copyProductHandle(data, context.spaceId);
      newPluginId = resp.pluginId;
      newWorkflowId = resp.workflowId;
    } catch (e) {
      if (copyProductErrorCodes.includes(e?.code)) {
        Toast.error(e.message);
      } else {
        Toast.error(I18n.t('copy_failed'));
        reporter.error({
          message: 'dupProduct: copyProductHandle error',
          error: e,
        });
      }
      return;
    }

    // Delayed refresh list, server level leader/follower delay caused problems
    await wait(100);

    try {
      const newWorkflow = await getWorkflowItemByPluginId({
        spaceId: context.spaceId,
        workflowId: newWorkflowId,
        pluginId: newPluginId,
        isImageflow:
          data?.meta_info?.entity_type ===
          ProductEntityType.ImageflowTemplateV2,
      });

      // Construct a new bound workflow list
      onWorkFlowListChange?.([...(workFlowList ?? []), newWorkflow]);
      onAdd?.(newWorkflow, { isDup: true, spaceId: context.spaceId });

      if (onDupSuccess) {
        onDupSuccess(newWorkflow);
      } else {
        // Copy product successfully
        Toast.success({
          content: (
            <Space spacing={6}>
              <Text>{I18n.t('workflowstore_workflow_copy_successful')}</Text>
              <Button
                color="primary"
                onClick={() => {
                  window.open(
                    `/work_flow?space_id=${context.spaceId}&workflow_id=${newWorkflow.workflow_id}&from=dupSuccess`,
                  );
                }}
              >
                {I18n.t('workflowstore_continue_editing')}
              </Button>
            </Space>
          ),
        });
      }
    } catch (e) {
      Toast.error(I18n.t('workflow_add_list_added_fail'));
      reporter.error({
        message: 'dupProduct: getWorkflowItemByPluginId error',
        error: e,
      });
    }
  };

  const dupWorkflowTpl = async () => {
    if (!context) {
      return;
    }

    if (!isTypeWorkflow(data)) {
      return;
    }

    reporter.info({ message: 'workflow_modal: dupWorkflowTpl' });

    let newPluginId = '';
    let newWorkflowId = '';
    try {
      const resp = await workflowApi.CopyWkTemplateApi(
        {
          workflow_ids: [data.workflow_id || ''],
          target_space_id: context.spaceId,
        },
        {
          __disableErrorToast: true,
        },
      );

      newWorkflowId = resp.data[data.workflow_id ?? '']?.workflow_id || '';
      newPluginId = resp.data[data.workflow_id ?? '']?.plugin_id || '0';
    } catch (e) {
      Toast.error(I18n.t('copy_failed'));
      reporter.error({
        message: 'dupWorkflowTpl: CopyWkTemplateApi error',
        error: e,
      });
      return;
    }

    if (!newWorkflowId || newPluginId === '0') {
      Toast.error(I18n.t('copy_failed'));
      reporter.error({
        message: 'dupWorkflowTpl: CopyWkTemplateApi error',
        error: new CustomError(
          'normal_error',
          `CopyWkTemplateApi: plugin_id is ${newPluginId}, workflow_id is ${newWorkflowId}`,
        ),
      });
      return;
    }

    // Delayed refresh list, server level leader/follower delay caused problems
    await wait(100);

    try {
      const newWorkflow = await getWorkflowItemByPluginId({
        spaceId: context.spaceId,
        workflowId: newWorkflowId,
        pluginId: newPluginId,
        isImageflow: context.flowMode === WorkflowMode.Imageflow,
        flowMode: data.flow_mode,
      });

      const sourceFlowMode = data?.flow_mode ?? context?.flowMode;
      if (typeof sourceFlowMode !== 'undefined') {
        newWorkflow.flow_mode = sourceFlowMode;
      }

      // Construct a new bound workflow list
      onWorkFlowListChange?.([...(workFlowList ?? []), newWorkflow]);
      onAdd?.(newWorkflow, { isDup: true, spaceId: context.spaceId });

      if (onDupSuccess) {
        onDupSuccess(newWorkflow);
      } else {
        Toast.success({
          content: (
            <Space spacing={6}>
              <Text>{I18n.t('workflowstore_workflow_copy_successful')}</Text>
              <Button
                color="primary"
                onClick={() => {
                  window.open(
                    `/work_flow?space_id=${context.spaceId}&workflow_id=${newWorkflow.workflow_id}`,
                  );
                }}
              >
                {I18n.t('workflowstore_continue_editing')}
              </Button>
            </Space>
          ),
        });
      }
    } catch (e) {
      Toast.error(e.message || I18n.t('workflow_add_list_added_fail'));
      reporter.error({
        message: 'dupWorkflowTpl: getWorkflowItemByPluginId error',
        error: e,
      });
    }
  };

  const removeWorkflow = () => {
    if (!workFlowList || !isTypeWorkflow(data)) {
      return;
    }

    reporter.info({ message: 'workflow_modal: removeWorkflow' });

    const target = workFlowList.find(
      item => item.workflow_id === data.workflow_id,
    );

    if (!target) {
      return;
    }

    onRemove?.(target);
    onWorkFlowListChange?.(
      workFlowList.filter(item => item.workflow_id !== data.workflow_id),
    );
  };

  const addWorkflow = async () => {
    if (!context || !isTypeWorkflow(data)) {
      return false;
    }

    reporter.info({ message: 'workflow_modal: addWorkflow' });

    try {
      const newWorkflow = await getWorkflowItem({
        spaceId: context.spaceId,
        workflowId: data.workflow_id,
        pluginId: data.plugin_id,
        isImageflow: data?.flow_mode === WorkflowMode.Imageflow,
        flowMode: data?.flow_mode,
      });

      if (typeof data?.flow_mode !== 'undefined') {
        newWorkflow.flow_mode = data?.flow_mode;
      }

      // Construct a new bound workflow list
      onWorkFlowListChange?.([...(workFlowList ?? []), newWorkflow]);
      const addResult = await onAdd?.(newWorkflow, {
        isDup: false,
        spaceId: context.spaceId,
      });
      /**
       * Allow external business logic to add failure
       */
      if (isBoolean(addResult)) {
        return addResult as unknown as boolean;
      }
      return true;
    } catch (e) {
      Toast.error(e.message || I18n.t('workflow_add_list_added_fail'));
      reporter.error({
        message: 'addWorkflow: getWorkflowItemByPluginId error',
        error: e,
      });
      return false;
    }
  };

  const deleteWorkflow = async () => {
    if (!isTypeWorkflow(data)) {
      return;
    }
    if (!handleDeleteWorkflow) {
      return;
    }
    reporter.info({ message: 'workflow_modal: deleteWorkflow' });
    // delete api
    const deleteConfig = await handleDeleteWorkflow?.(data);
    if (deleteConfig?.canDelete) {
      await deleteConfig?.handleDelete?.();
    }
    if (!workFlowList) {
      return;
    }

    const target = workFlowList.find(
      item => item.workflow_id === data.workflow_id,
    );

    if (!target) {
      return;
    }
    onDelete?.(target);
    onWorkFlowListChange?.(
      workFlowList.filter(item => item.workflow_id !== data.workflow_id),
    );
  };

  const itemClick = () => {
    if (!context) {
      return;
    }

    reporter.info({ message: 'workflow_modal: itemClick' });

    if (onItemClick) {
      // @ts-expect-error meets expectations
      const item: WorkflowItemType = {
        item: data,
        type: context.modalState.dataSourceType,
      };
      const ret = onItemClick(item, context.getModalState(context));
      if (!ret || ret.handled) {
        return;
      }
    }

    if (isTypeWorkflow(data)) {
      openWorkflowDetailPage(data);
    } else {
      window.open(
        `/template/workflow/${data.meta_info.id}?entity_id=${ProductEntityType.WorkflowTemplateV2}`,
        '_blank',
      );
    }
  };

  return {
    dupWorkflowTpl,
    dupProduct,
    addWorkflow,
    removeWorkflow,
    deleteWorkflow,
    itemClick,
  };
}

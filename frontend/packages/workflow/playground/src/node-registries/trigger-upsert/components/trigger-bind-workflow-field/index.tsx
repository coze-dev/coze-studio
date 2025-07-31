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

import { ModalI18nKey } from '@coze-workflow/components/workflow-modal';
import {
  WorkflowModalFrom,
  useOpenWorkflowDetail,
  useWorkflowModal,
  type BotPluginWorkFlowItem,
} from '@coze-workflow/components';
import { WorkflowMode } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';
import { IconNameDescCard } from '@/form-extensions/components/icon-name-desc-card';
import { withField, useField } from '@/form';

interface TriggerBindWorkflowFieldProps {
  selectedWorkflowInfo?: BotPluginWorkFlowItem;
  className?: string;
}

export const TriggerBindWorkflowField =
  withField<TriggerBindWorkflowFieldProps>(
    ({ selectedWorkflowInfo, className }) => {
      const { value, onChange, readonly } = useField();

      const { projectId, workflowId, spaceId, getProjectApi, playgroundProps } =
        useGlobalState();

      const projectApi = getProjectApi();

      const openWorkflowDetail = useOpenWorkflowDetail();

      const sourceTitle = I18n.t('workflow_241119_01');

      const {
        node: workflowModal,
        open: openWorkflow,
        close: closeWorkflow,
      } = useWorkflowModal({
        from: WorkflowModalFrom.ProjectWorkflowAddNode,
        flowMode: WorkflowMode.Workflow,
        onAdd: (item, config) => {
          onChange?.(item.workflow_id);
          closeWorkflow();
        },
        onRemove: item => {
          onChange?.(undefined);
          closeWorkflow();
        },
        onCreateSuccess: val => {
          closeWorkflow();
          playgroundProps?.refetchProjectResourceList?.();
          openWorkflowDetail({
            workflowId: val.workflowId,
            spaceId: val.spaceId,
            projectId,
            ideNavigate: projectApi?.navigate,
          });
        },
        i18nMap: {
          [ModalI18nKey.ListItemRemove]: {
            key: 'scene_workflow_delete_workflow_button',
            options: { source: sourceTitle },
          },
          [ModalI18nKey.ListItemRemoveConfirmTitle]: {
            key: 'scene_workflow_delete_workflow_popup_title',
            options: { source: sourceTitle },
          },
          [ModalI18nKey.ListItemRemoveConfirmDescription]: {
            key: 'scene_workflow_delete_workflow_popup_subtitle',
            options: { source: sourceTitle },
          },
        },
        hiddenLibrary: true,
        projectId,
        excludedWorkflowIds: [workflowId],
        workFlowList: selectedWorkflowInfo ? [selectedWorkflowInfo] : [],
      });

      const isWfInvalid = !selectedWorkflowInfo;
      const isLibraryWf =
        selectedWorkflowInfo && !selectedWorkflowInfo?.project_id;
      return (
        <div className={`${className} relative`}>
          {readonly ? (
            <></>
          ) : (
            <div className="absolute right-[0px] top-[-28px]">
              <IconButton
                onClick={openWorkflow}
                // theme="borderless"
                icon={<IconCozPlus className="text-sm" />}
                color="highlight"
                size="small"
              />
            </div>
          )}
          {value ? (
            <>
              <IconNameDescCard
                readonly={readonly}
                name={
                  isWfInvalid
                    ? I18n.t(
                        'worklfow_trigger_bind_delete',
                        {},
                        '绑定的工作流已失效',
                      )
                    : selectedWorkflowInfo?.name
                }
                description={selectedWorkflowInfo?.desc}
                icon={selectedWorkflowInfo?.icon}
                onRemove={() => {
                  onChange?.(undefined);
                }}
                onClick={() => {
                  if (!isLibraryWf) {
                    projectApi?.navigate(`/workflow/${value}`);
                  } else {
                    window.open(
                      `/work_flow?space_id=${spaceId}&workflow_id=${value}`,
                      '_blank',
                    );
                  }
                }}
              />
              {isLibraryWf ? (
                <div className="mt-[-4px] text-[12px] coz-fg-hglt-red">
                  {I18n.t(
                    'workflow_trigger_bindwf_lib_error',
                    {},
                    '资源库工作流暂不支持，请先复制到项目中使用。',
                  )}
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <div className="text-[12px] coz-fg-secondary">
              {I18n.t(
                'workflow_trigger_user_create_bind_tooltips',
                {},
                '选择一个工作流，当触发器被激活时，将会执行该工作流。',
              )}
            </div>
          )}
          {workflowModal}
        </div>
      );
    },
  );

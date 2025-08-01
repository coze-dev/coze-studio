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

import React, { type FC, useContext, useState } from 'react';

import { WorkflowMode, BindBizType } from '@coze-arch/idl/workflow_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozWorkflow,
  IconCozChat,
  IconCozArrowDown,
} from '@coze-arch/coze-design/icons';
import { Menu, Button } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';

import WorkflowModalContext from '../workflow-modal-context';
import { WorkflowModalFrom, type WorkFlowModalModeProps } from '../type';
import { useI18nText } from '../hooks/use-i18n-text';
import { CreateWorkflowModal } from '../../workflow-edit';
import { wait } from '../../utils';
import { useOpenWorkflowDetail } from '../../hooks/use-open-workflow-detail';
export const CreateWorkflowBtn: FC<
  Pick<
    WorkFlowModalModeProps,
    'onCreateSuccess' | 'nameValidators' | 'from'
  > & {
    className?: string;
  }
> = ({ className, onCreateSuccess, nameValidators, from }) => {
  const context = useContext(WorkflowModalContext);
  const { i18nText, ModalI18nKey } = useI18nText();
  const openWorkflowDetailPage = useOpenWorkflowDetail();

  const [createFlowMode, setCreateFlowMode] = useState(
    context?.flowMode ?? WorkflowMode.Workflow,
  );

  if (!context) {
    return null;
  }
  const { createModalVisible, setCreateModalVisible, bindBizType } = context;

  // If it is a Douyin doppelganger scene, only one [Create Workflow] button will be displayed at this time.
  const showSingleButton =
    bindBizType === BindBizType.DouYinBot ||
    from === WorkflowModalFrom.WorkflowAgent;

  /** Open the process details page */
  const menuConfig = [
    {
      label: I18n.t('workflow_add_navigation_create'),
      handler: () => {
        setCreateFlowMode(WorkflowMode.Workflow);
        setCreateModalVisible(true);
      },
      icon: <IconCozWorkflow />,
    },
    {
      label: I18n.t('wf_chatflow_81'),
      handler: () => {
        setCreateFlowMode(WorkflowMode.ChatFlow);
        setCreateModalVisible(true);
      },
      icon: <IconCozChat />,
    },
  ];

  return (
    <>
      {/* will support soon */}
      {showSingleButton || IS_OPEN_SOURCE ? (
        <Button
          className={className}
          color="hgltplus"
          onClick={() => {
            if (from === WorkflowModalFrom.WorkflowAgent) {
              setCreateFlowMode(WorkflowMode.ChatFlow);
            } else {
              setCreateFlowMode(WorkflowMode.Workflow);
            }
            setCreateModalVisible(true);
          }}
        >
          {from === WorkflowModalFrom.WorkflowAgent
            ? I18n.t('wf_chatflow_81')
            : I18n.t('workflow_add_navigation_create')}
        </Button>
      ) : (
        <Menu
          trigger="click"
          position="bottom"
          render={
            <Menu.SubMenu className={'w-[198px]'} mode="menu">
              {menuConfig.map(item => (
                <Menu.Item
                  key={item.label}
                  onClick={(value, event) => {
                    event.stopPropagation();
                    item.handler();
                  }}
                  icon={item.icon}
                >
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          }
        >
          <Button
            className={className}
            color="hgltplus"
            icon={<IconCozArrowDown />}
            iconPosition="right"
          >
            {context.projectId
              ? I18n.t('wf_chatflow_03')
              : i18nText(ModalI18nKey.NavigationCreate)}
          </Button>
        </Menu>
      )}
      <CreateWorkflowModal
        initConfirmDisabled
        mode="add"
        flowMode={createFlowMode}
        bindBizType={context.bindBizType}
        bindBizId={context.bindBizId}
        projectId={context.projectId}
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={async ({ workflowId, flowMode }) => {
          setCreateModalVisible(false);
          if (!workflowId) {
            throw new CustomError(
              '[Workflow] create failed',
              'create workflow failed, no workflow id',
            );
          }
          // Due to the delay in the synchronization of the main and standby data of the workflow created by the server level, if you jump directly after the creation, the workflowId may not be found, so the front-end delay reduces the probability of the problem triggering
          await wait(500);

          if (onCreateSuccess) {
            onCreateSuccess?.({
              spaceId: context.spaceId,
              workflowId,
              flowMode: flowMode || WorkflowMode.Workflow,
            });
          } else {
            openWorkflowDetailPage({
              workflowId,
              spaceId: context.spaceId ?? '',
            });
          }
        }}
        nameValidators={nameValidators}
      />
    </>
  );
};

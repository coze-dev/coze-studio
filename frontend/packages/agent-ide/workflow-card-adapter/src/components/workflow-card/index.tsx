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

import React, { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  useCreateWorkflowModal,
  type WorkflowModalFrom,
} from '@coze-workflow/components';
import { type WorkflowMode } from '@coze-workflow/base/api';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import {
  type WorkFlowItemType,
  useBotDetailIsReadonly,
} from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { PageType, SceneType } from '@coze-arch/bot-hooks';
import { useBotWorkFlowListModal } from '@coze-agent-ide/workflow-modal';
import { WorkFlowItemCozeDesign } from '@coze-agent-ide/workflow-item';
import { ToolItemActionCopy } from '@coze-agent-ide/tool';
import {
  ToolContentBlock,
  useToolContentBlockDefaultExpand,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { useWorkflowPublishedModel } from '@coze-agent-ide/space-bot/hook';
import { useNavigateWorkflowEditPage } from '@coze-agent-ide/navigate';

import { AddButton } from './add-button';

import s from './index.module.less';

export type IWorkflowCardProps = ToolEntryCommonProps & {
  /**
   * @deprecated
   * Imageflow has been merged with workflow, no longer needs to filter with flowMode, and will affect Chatflow
   */
  flowMode: WorkflowMode;
  from: WorkflowModalFrom;
};

/** Workflow */
export const WorkflowCard: React.FC<IWorkflowCardProps> = ({
  flowMode,
  title,
  from,
}) => {
  const setToolValidData = useToolValidData();
  const { pageFrom } = usePageRuntimeStore(
    useShallow(state => ({
      pageFrom: state.pageFrom,
    })),
  );
  const { spaceID } = useSpaceStore(state => ({
    spaceID: state.space.id,
  }));
  const onNavigate2Edit = useNavigateWorkflowEditPage(
    { spaceID },
    SceneType.BOT__VIEW__WORKFLOW,
  );
  const { workflows, updateSkillWorkflows } = useBotSkillStore(
    useShallow(state => ({
      workflows: state.workflows,
      updateSkillWorkflows: (
        updater: (prev: WorkFlowItemType[]) => WorkFlowItemType[],
      ) => {
        const workflowsInStore = useBotSkillStore.getState().workflows;
        const updated = updater(workflowsInStore);
        return state.updateSkillWorkflows(updated);
      },
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const { node, open } = useBotWorkFlowListModal({
    flowMode,
    from,
  });

  const { createWorkflowModal, openCreateModal } = useCreateWorkflowModal({
    from,
    spaceId: spaceID,
    hiddenTemplateEntry: true,
    onCreateSuccess: ({ workflowId }) => {
      onNavigate2Edit(workflowId);
    },
  });

  useWorkflowPublishedModel({
    title: I18n.t('PublishSuccessConfirm'),
    addedWorkflows: workflows,
    pageType: PageType.BOT,
    onOk: newWorkflow =>
      updateSkillWorkflows(prevWorkflows => [...prevWorkflows, newWorkflow]),
  });

  const defaultExpand = useToolContentBlockDefaultExpand({
    configured: workflows.length > 0,
  });

  useEffect(() => {
    setToolValidData(Boolean(workflows.length));
  }, [workflows.length]);

  return (
    <>
      {createWorkflowModal}
      {node}
      <ToolContentBlock
        blockEventName={OpenBlockEvent.WORKFLOW_BLOCK_OPEN}
        header={title}
        defaultExpand={defaultExpand}
        actionButton={
          isReadonly ? null : (
            <AddButton
              onCreate={() => {
                openCreateModal();
              }}
              onImport={() => {
                open();
              }}
            />
          )
        }
      >
        <div className={s.cardContent}>
          {workflows.length ? (
            <WorkFlowItemCozeDesign
              isReadonly={isReadonly}
              list={workflows as WorkFlowItemType[]}
              removeWorkFlow={index => {
                updateSkillWorkflows(
                  () =>
                    workflows.filter(
                      (_, i) => i !== index,
                    ) as WorkFlowItemType[],
                );
              }}
              pageFrom={pageFrom}
              renderActionSlot={({ handleCopy, name }) => (
                <ToolItemActionCopy
                  tooltips={I18n.t('Copy')}
                  onClick={() => handleCopy(name ?? '')}
                  data-testid={'bot.editor.tool.workflow.copy-button'}
                />
              )}
            />
          ) : (
            <div className={s['default-text']}>
              {I18n.t('bot_edit_workflow_explain')}
            </div>
          )}
        </div>
      </ToolContentBlock>
    </>
  );
};

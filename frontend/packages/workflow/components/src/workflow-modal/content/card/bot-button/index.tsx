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

import React, { type FC, useContext, useMemo, useState } from 'react';

import classNames from 'classnames';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { LoadingButton } from '@coze-arch/coze-design';
import { Popconfirm, Tooltip } from '@coze-arch/bot-semi';
import { CheckType, type CheckResult } from '@coze-arch/bot-api/workflow_api';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import WorkflowModalContext from '../../../workflow-modal-context';
import { isSelectProjectCategory } from '../../../utils';
import { type WorkflowInfo, WorkflowModalFrom } from '../../../type';
import { useI18nText } from '../../../hooks/use-i18n-text';
import { WorkflowAddedButton } from './added-button';

import styles from './index.module.less';

interface WorkflowBotButtonProps {
  data?: WorkflowInfo;
  isAdded?: boolean;
  from?: WorkflowModalFrom;
  loading?: boolean;
  workflowNodes?: WorkflowNodeJSON[];
  onAdd: () => Promise<boolean>;
  onRemove: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const WorkflowBotButton: FC<WorkflowBotButtonProps> = ({
  data,
  style,
  isAdded,
  onAdd,
  onRemove,
  className,
  from,
  workflowNodes,
  loading,
}) => {
  const { plugin_id } = data || {};
  const isPublished = plugin_id !== '0';
  const isFromWorkflow =
    from === WorkflowModalFrom.WorkflowAddNode ||
    from === WorkflowModalFrom.ProjectWorkflowAddNode;
  const context = useContext(WorkflowModalContext);
  const isAddProjectWorkflow = isSelectProjectCategory(context?.modalState);
  const canAdd = isPublished || isAddProjectWorkflow;
  const isFromSocialScene = from === WorkflowModalFrom.SocialSceneHost;
  const [count, setCount] = useState((workflowNodes || []).length);

  const isFromWorkflowAgent = from === WorkflowModalFrom.WorkflowAgent;
  const botAgentCheckResult = useMemo<CheckResult | undefined>(
    () => data?.check_result?.find(check => check.type === CheckType.BotAgent),
    [data],
  );

  const { i18nText, ModalI18nKey } = useI18nText();
  const renderContent = () => {
    if (isFromWorkflowAgent) {
      if (botAgentCheckResult && !botAgentCheckResult.is_pass) {
        return (
          <Tooltip
            position="top"
            className={styles.not_publish_tooltip}
            content={
              <span className={styles.content}>
                {botAgentCheckResult.reason}
              </span>
            }
          >
            <LoadingButton
              disabled
              color="primary"
              className={styles.button}
              data-testid="workflow.modal.add"
            >
              {I18n.t('workflow_add_list_add')}
            </LoadingButton>
          </Tooltip>
        );
      }
    }

    // If added, display the Added button
    if (isAdded) {
      return (
        <Popconfirm
          title={i18nText(ModalI18nKey.ListItemRemoveConfirmTitle)}
          content={i18nText(ModalI18nKey.ListItemRemoveConfirmDescription)}
          okType="danger"
          position="topRight"
          onConfirm={onRemove}
          zIndex={9999}
          okText={I18n.t('neutral_age_gate_confirm', {}, 'Confirm')}
          cancelText={I18n.t('workflow_240218_17', {}, 'Cancel')}
        >
          <div>
            <WorkflowAddedButton />
          </div>
        </Popconfirm>
      );
    }
    // Not added, judge the release status
    // Unpublished, show the button below
    if (!canAdd) {
      let key: I18nKeysNoOptionsType = 'workflow_add_not_allow_before_publish';
      if (isFromWorkflow) {
        key = 'wf_node_add_wf_modal_tip_must_publish_to_add';
      } else if (isFromSocialScene) {
        key = 'scene_workflow_popup_add_forbidden';
      }
      return (
        <Tooltip
          position="top"
          className={styles.not_publish_tooltip}
          content={<span className={styles.content}>{I18n.t(key)}</span>}
        >
          <LoadingButton
            disabled
            color="primary"
            className={styles.button}
            data-testid="workflow.modal.add"
          >
            {I18n.t('workflow_add_list_add')}
          </LoadingButton>
        </Tooltip>
      );
    }
    // Published and not added, show the add button
    if (!isAdded) {
      return (
        <LoadingButton
          onClick={async () => {
            const isSuccess = await onAdd?.();
            if (isSuccess) {
              setCount(prev => prev + 1);
            }
          }}
          color="primary"
          className={styles.button}
          data-testid="workflow.modal.add"
        >
          {I18n.t('workflow_add_list_add')}
          {isFromWorkflow && count !== 0 ? (
            <span className={styles.workflow_count_span}>{count}</span>
          ) : null}
        </LoadingButton>
      );
    }

    return null;
  };

  return (
    <div
      className={classNames(styles.container, className)}
      style={style}
      onClick={e => e.stopPropagation()}
    >
      {renderContent()}
    </div>
  );
};

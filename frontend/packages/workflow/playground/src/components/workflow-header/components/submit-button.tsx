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

import { useCallback, useMemo } from 'react';

import { useClearHistory } from '@coze-workflow/history';
import { WorkflowExecStatus } from '@coze-workflow/base/types';
import {
  workflowApi,
  OperateType,
  WorkFlowDevStatus,
  VCSCanvasType,
} from '@coze-workflow/base/api';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { UIButton } from '@coze-arch/bot-semi';
import { Toast, Tooltip } from '@coze-arch/coze-design';

import { getWorkflowHeaderTestId } from '../utils';
import { useDiffConfirm, useMergeConfirm } from '../hooks';
import { useGlobalState } from '../../../hooks';
import { ForcePushPopover, useForcePush } from './force-push-popover';

export const SubmitButton = () => {
  const globalState = useGlobalState();

  const {
    workflowId,
    spaceId,
    info,
    viewStatus,
    config,
    readonly,
    isCollaboratorMode,
  } = globalState;

  const { saving } = config;

  const { vcsData } = info;

  const { type: vcsDataType } = vcsData || {};

  const { mergeConfirm } = useMergeConfirm();
  const {
    visible: forcePopoverVisible,
    tryPushCheck,
    onCancel: onForcePublishCancel,
    onTestRun,
  } = useForcePush();

  const { clearHistory } = useClearHistory();

  const checkNeedMerge = async () => {
    const { data } = await workflowApi.CheckLatestSubmitVersion({
      space_id: spaceId,
      workflow_id: workflowId,
    });
    return data.need_merge;
  };

  const onSubmit = useCallback(async (val): Promise<boolean> => {
    try {
      const needMerge = await checkNeedMerge();
      if (needMerge) {
        mergeConfirm(true);
        return false;
      }
      const submitResp = await workflowApi.SubmitWorkflow({
        workflow_id: workflowId,
        space_id: spaceId,
        desc: val.desc,
        force: true,
      });

      reporter.successEvent({
        eventName: 'workflow_submit_success',
        namespace: 'workflow',
      });

      const { submit_commit_id } = submitResp.data;

      globalState.setInfo({
        vcsData: {
          ...vcsData,
          submit_commit_id,
        },
      });
      globalState.reload();
      return true;
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_submit_fail',
        namespace: 'workflow',
        error,
      });
      return false;
    }
  }, []);

  const { diffConfirm, modal: diffConfirmModal } = useDiffConfirm({
    submitHandle: onSubmit,
    operateType: OperateType.SubmitOperate,
  });

  const disabled = useMemo(() => {
    if (saving || viewStatus === WorkflowExecStatus.EXECUTING) {
      return true;
    }

    return vcsData?.type !== VCSCanvasType.Draft;
  }, [saving, viewStatus, vcsDataType]);

  // No collaborator does not show, no editing permission does not show
  if (!isCollaboratorMode || readonly) {
    return null;
  }

  // See the submission process:
  const handleSubmit = async () => {
    sendTeaEvent(EVENT_NAMES.workflow_submit, {
      workflow_id: workflowId,
      workspace_id: spaceId,
    });
    if (!(await tryPushCheck())) {
      return;
    }

    const needMerge = await checkNeedMerge();
    if (needMerge) {
      mergeConfirm(true);
      return;
    }

    const confirmed = await diffConfirm();
    if (!confirmed) {
      return;
    }

    clearHistory();
    Toast.success({
      content: I18n.t('workflow_publish_multibranch_submit_success'),
      showClose: false,
    });
    globalState.setInfo({ status: WorkFlowDevStatus.HadSubmit });
  };

  const handleForceSubmit = async () => {
    const needMerge = await checkNeedMerge();
    if (needMerge) {
      onForcePublishCancel();
      mergeConfirm(true);
      return;
    }

    onForcePublishCancel();
    const confirmed = await diffConfirm();
    if (!confirmed) {
      return;
    }

    clearHistory();
    Toast.success({
      content: I18n.t('workflow_publish_multibranch_submit_success'),
      showClose: false,
    });
    globalState.setInfo({ status: WorkFlowDevStatus.HadSubmit });
  };

  return (
    <>
      <ForcePushPopover
        visible={forcePopoverVisible}
        title={I18n.t('workflow_submit_not_testrun_title')}
        description={I18n.t('workflow_submit_not_testrun_content')}
        mainButtonText={I18n.t('workflow_submit_not_testrun_insist')}
        onOpenTestRun={onTestRun}
        onCancel={onForcePublishCancel}
        onForcePush={handleForceSubmit}
      >
        <div>
          {vcsData?.type !== VCSCanvasType.Draft ? (
            <Tooltip
              content={I18n.t(
                'workflow_publish_multibranch_submit_disabled_tooltip_nochange',
              )}
              position="bottom"
            >
              <UIButton
                onClick={handleSubmit}
                disabled={disabled}
                data-testid={getWorkflowHeaderTestId('submit')}
              >
                {I18n.t('workflow_publish_multibranch_submit_comfirm')}
              </UIButton>
            </Tooltip>
          ) : (
            <UIButton
              onClick={handleSubmit}
              disabled={disabled}
              data-testid={getWorkflowHeaderTestId('submit')}
            >
              {I18n.t('workflow_publish_multibranch_submit_comfirm')}
            </UIButton>
          )}
        </div>
      </ForcePushPopover>

      {diffConfirmModal}
    </>
  );
};

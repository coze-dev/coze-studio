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

/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/no-deep-relative-import */
import {
  workflowApi,
  type VersionMetaInfo,
  OperateType,
} from '@coze-workflow/base/api';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast, Modal } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useNavigate } from 'react-router-dom';

import {
  WorkflowSaveService,
  WorkflowRunService,
} from '../../../../../../services';
import { useGlobalState } from '../../../../../../hooks';

const revertConfirm = () =>
  new Promise(resolve => {
    Modal.warning({
      title: I18n.t('workflow_publish_multibranch_revert_confirm_title'),
      content: I18n.t('workflow_publish_multibranch_revert_confirm_content'),
      okText: I18n.t('confirm'),
      cancelText: I18n.t('cancel'),
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

export function useCommitAction() {
  const navigate = useNavigate();
  const globalState = useGlobalState();
  const saveService = useService<WorkflowSaveService>(WorkflowSaveService);
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const showCurrent = async () => {
    await saveService.reloadDocument({});
  };

  const resetToCommit = async (item: VersionMetaInfo) => {
    const confirmed = await revertConfirm();

    if (!confirmed) {
      return;
    }

    sendTeaEvent(EVENT_NAMES.workflow_submit_version_revert, {
      workflow_id: globalState.workflowId,
      workspace_id: globalState.spaceId,
      version_id: item.submit_commit_id || item.commit_id || '',
    });

    try {
      // Priority is given to using the commit ID to operate, and the commit ID is fixed to the OperateType. SubmitOperate type
      await workflowApi.RevertDraft({
        workflow_id: globalState.workflowId,
        space_id: globalState.spaceId,
        commit_id: item.submit_commit_id || item.commit_id || '',
        type:
          (item.submit_commit_id ? OperateType.SubmitOperate : item.type) ??
          OperateType.SubmitOperate,
        env: item.submit_commit_id ? '' : item.env,
      });
      reporter.successEvent({
        eventName: 'workflow_revert_success',
        namespace: 'workflow',
      });

      Toast.success({
        content: I18n.t('workflow_publish_multibranch_revert_success'),
        showClose: false,
      });
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_revert_fail',
        namespace: 'workflow',
        error,
      });
    }

    await showCurrent();

    return true;
  };

  const resetToCommitById = async (commitId: string, type?: OperateType) => {
    const resp = await workflowApi.VersionHistoryList({
      workflow_id: globalState.workflowId,
      space_id: globalState.spaceId,
      type: type ?? OperateType.SubmitOperate,
      commit_ids: [commitId],
      limit: 1,
    });

    const target = resp?.data?.version_list?.[0];

    if (!target) {
      return;
    }

    await resetToCommit(target);
  };

  const viewCommit = async (item: VersionMetaInfo) => {
    if (!item.commit_id || !item.type) {
      return;
    }

    sendTeaEvent(EVENT_NAMES.workflow_submit_version_view, {
      workflow_id: globalState.workflowId,
      workspace_id: globalState.spaceId,
      version_id: item.commit_id,
    });

    if (item.submit_commit_id) {
      await saveService.reloadDocument({
        commitId: item.submit_commit_id,
        type: OperateType.SubmitOperate,
      });
    } else {
      await saveService.reloadDocument({
        commitId: item.commit_id,
        type: item.type,
        env: item.env,
      });
    }
    // You need to dry run results after switching versions
    runService.clearTestRun();
  };

  const viewCommitNewPage = (item: VersionMetaInfo) => {
    const query = new URLSearchParams();
    query.append('space_id', item.space_id || '');
    query.append('workflow_id', item.workflow_id || '');

    if (item.submit_commit_id) {
      query.append('version', item.submit_commit_id || '');
    } else {
      if (item.type) {
        query.append('opt_type', item.type.toString());
      }
      query.append('version', item.commit_id || '');
    }

    const targetUrl = `/work_flow?${query.toString()}`;

    window.open(targetUrl, '_blank');
  };

  const publishPPE = (item: VersionMetaInfo) => {
    navigate(
      `/space/${item.space_id}/workflow/${item.workflow_id}/publish?commit_id=${item.commit_id}&type=${item.type}`,
      { replace: true },
    );
  };

  return {
    resetToCommit,
    viewCommit,
    publishPPE,
    showCurrent,
    resetToCommitById,
    viewCommitNewPage,
  };
}

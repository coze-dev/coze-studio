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
      // 直接调用我们的新接口
      const response = await fetch('/api/workflow_api/revert_draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: globalState.workflowId,
          space_id: globalState.spaceId,
          commit_id: item.submit_commit_id || item.commit_id || '',
          type:
            (item.submit_commit_id ? OperateType.SubmitOperate : item.type) ??
            OperateType.SubmitOperate,
          env: item.submit_commit_id ? '' : item.env,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        reporter.successEvent({
          eventName: 'workflow_revert_success',
          namespace: 'workflow',
        });

        Toast.success({
          content: result.message || I18n.t('workflow_publish_multibranch_revert_success'),
          showClose: false,
        });
      } else {
        throw new Error(result.message || 'Revert failed');
      }
    } catch (error) {
      reporter.errorEvent({
        eventName: 'workflow_revert_fail',
        namespace: 'workflow',
        error,
      });
      Toast.error({
        content: error.message || '版本回滚失败',
        showClose: false,
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

    try {
      // 使用新的版本查看接口
      let commitId: string;
      let operateType: OperateType;
      let env: string | undefined;

      if (item.submit_commit_id) {
        commitId = item.submit_commit_id;
        operateType = OperateType.SubmitOperate;
        env = undefined;
      } else {
        commitId = item.commit_id;
        operateType = item.type as OperateType;
        env = item.env;
      }

      // 调用新的直接版本查看方法
      const workflowJSON = await globalState.loadVersionSchema({
        commit_id: commitId,
        type: operateType,
        env,
      });

      if (workflowJSON) {
        // 使用获取的workflowJSON重新加载文档
        await saveService.reloadDocument({
          customWorkflowJson: workflowJSON,
        });
      }
    } catch (error) {
      console.error('Failed to view commit:', error);
      throw error; // 不再回退到旧方法，直接抛出错误
    }
    
    // You need to dry run results after switching versions
    runService.clearTestRun();
  };

  const viewCommitNewPage = (item: VersionMetaInfo) => {
    const query = new URLSearchParams();
    // 使用globalState中的spaceId和workflowId，而不是item中可能为空的字段
    query.append('space_id', globalState.spaceId || '');
    query.append('workflow_id', globalState.workflowId || '');

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

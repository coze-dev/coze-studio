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

/* eslint-disable @coze-arch/no-deep-relative-import */

import { I18n } from '@coze-arch/i18n';
import { Toast, Typography } from '@coze-arch/coze-design';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { RadioGroup, Radio, UIModal } from '@coze-arch/bot-semi';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { DiffItems } from '../../constants';
import { getWorkflowUrl } from '../../../../utils/get-workflow-url';
import { WorkflowSaveService } from '../../../../services';
import { useGlobalState } from '../../../../hooks';
const { Text } = Typography;
import { useMerge } from './use-merge';
import { MergeProvider } from './merge-context';
import { MergeFooter } from './components';

const ModalContent = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void;
  onOk: () => Promise<void>;
}) => {
  const { spaceId, workflowId, submitDiff, handleRetained } = useMerge();

  const handleViewLatest = () => {
    const versionUrl = getWorkflowUrl({
      space_id: spaceId,
      workflow_id: workflowId,
      version: submitDiff?.schema_dif?.after_commit_id,
    });

    window.open(versionUrl, '_blank');
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="pb-3">
          {I18n.t('wmv_diff_latest_draft')}
          <Text link onClick={handleViewLatest} className="ml-[1px]">
            {I18n.t('wmv_view_latest_version')}
          </Text>
        </div>
        <RadioGroup
          direction="vertical"
          defaultValue="draft"
          onChange={val => {
            handleRetained({ [DiffItems.Schema]: val.target.value });
          }}
        >
          <Radio value="draft">{I18n.t('wmv_draft_version')}</Radio>
          <Radio value="submit">{I18n.t('wmv_latest_version')}</Radio>
        </RadioGroup>
      </div>
      <MergeFooter onOk={onOk} onCancel={onCancel} />
    </>
  );
};

export const useMergeConfirm = () => {
  const { workflowId, spaceId } = useGlobalState();
  const saveService = useService<WorkflowSaveService>(WorkflowSaveService);

  const mergeConfirm = async (needNotice?: boolean): Promise<boolean> => {
    sendTeaEvent(EVENT_NAMES.workflow_merge_page, {
      workflow_id: workflowId,
      workspace_id: spaceId,
    });

    if (needNotice) {
      const confirm = await new Promise(resolve => {
        UIModal.warning({
          title: I18n.t('workflow_publish_multibranch_merge_comfirm'),
          content: I18n.t('workflow_publish_multibranch_merge_comfirm_desc'),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirm) {
        return false;
      }
    }
    return new Promise(resolve => {
      const modal = UIModal.confirm({
        icon: null,
        content: (
          <MergeProvider workflowId={workflowId} spaceId={spaceId}>
            <ModalContent
              onCancel={() => {
                modal.destroy();
                resolve(false);
              }}
              onOk={async () => {
                // Refresh the canvas after merging
                await saveService.reloadDocument({});
                Toast.success(
                  I18n.t('workflow_publish_multibranch_merge_success'),
                );
                modal.destroy();
                resolve(true);
              }}
            />
          </MergeProvider>
        ),
        title: I18n.t('wmv_merge_versions'),
        footer: null,
      });
    });
  };

  return {
    mergeConfirm,
  };
};

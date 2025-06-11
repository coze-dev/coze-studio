/* eslint-disable @coze-arch/no-deep-relative-import */

import { I18n } from '@coze-arch/i18n';
import { Toast, Typography } from '@coze/coze-design';
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
                // merge完后刷新刷新画布
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

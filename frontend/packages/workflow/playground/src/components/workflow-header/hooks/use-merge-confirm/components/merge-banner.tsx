/* eslint-disable @coze-arch/no-deep-relative-import */
import { Banner, Typography } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { useMerge } from '../use-merge';
import { getWorkflowUrl } from '../../../../../utils/get-workflow-url';

const { Text } = Typography;

const MergeBanner = () => {
  const { workflowId, spaceId, hasConflict, submitDiff } = useMerge();

  const submitCommitId = submitDiff?.name_dif?.after_commit_id;

  const handleViewLatest = () => {
    const versionUrl = getWorkflowUrl({
      space_id: spaceId,
      workflow_id: workflowId,
      version: submitCommitId,
    });

    window.open(versionUrl, '_blank');
  };

  return submitCommitId ? (
    <Banner
      type={hasConflict ? 'info' : 'success'}
      icon={null}
      closeIcon={null}
      description={
        <Text>
          {hasConflict
            ? I18n.t('workflow_publish_multibranch_diffNodice')
            : I18n.t('workflow_publish_multibranch_no_diff')}
          <Text link onClick={handleViewLatest} style={{ marginLeft: 8 }}>
            {I18n.t('workflow_publish_multibranch_view_lastest_version')}
          </Text>
        </Text>
      }
    />
  ) : null;
};

export default MergeBanner;

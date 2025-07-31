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

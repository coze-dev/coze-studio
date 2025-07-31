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

import { I18n } from '@coze-arch/i18n';
import { Banner } from '@coze-arch/coze-design';
import { Typography } from '@coze-arch/bot-semi';

import { useRetrieve } from './use-retrieve';

const { Text } = Typography;

const RetrieveBanner = () => {
  const { showRetrieve, author, handleRetrieve } = useRetrieve();

  if (!showRetrieve || IS_BOT_OP) {
    return null;
  }

  return (
    <Banner
      type="info"
      icon={null}
      closeIcon={null}
      description={
        <Text>
          {I18n.t('workflow_publish_multibranch_merge_comfirm_desc', {
            user_name: author,
          })}
          <Text link onClick={handleRetrieve} style={{ marginLeft: 8 }}>
            {I18n.t('workflow_publish_multibranch_merge_retrieve')}
          </Text>
        </Text>
      }
    />
  );
};

export default RetrieveBanner;

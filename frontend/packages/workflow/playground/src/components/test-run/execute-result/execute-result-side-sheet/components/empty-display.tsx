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

import { IconCozPlayCircle } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

const { Title, Text } = Typography;

export const EmptyDisplay = () => (
  <div className="h-full flex flex-col justify-center items-center">
    <div>
      <IconCozPlayCircle fontSize={44} className="coz-fg-dim" />
    </div>
    <div className="w-60 flex flex-col items-center">
      <Title heading={6} weight={500}>
        {I18n.t('workflow_running_results_noresult_title')}
      </Title>
      <Text type="quaternary" size="small">
        {I18n.t('workflow_running_results_noresult_content')}
      </Text>
    </div>
  </div>
);

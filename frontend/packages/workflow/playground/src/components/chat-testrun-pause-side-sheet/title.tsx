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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag, Typography } from '@coze-arch/coze-design';

export const Title: FC<{
  icon: string;
}> = props => {
  const { icon } = props;
  return (
    <div className="flex items-center gap-2 mb-3">
      <img src={icon} width={16} height={16} />
      <Typography.Title heading={6}>
        {I18n.t('scene_workflow_chat_node_name', {}, 'Role scheduling')}
      </Typography.Title>
      <Tag color="cyan" loading>
        {I18n.t('scene_workflow_chat_node_test_run_running', {}, 'Running')}
      </Tag>
    </div>
  );
};

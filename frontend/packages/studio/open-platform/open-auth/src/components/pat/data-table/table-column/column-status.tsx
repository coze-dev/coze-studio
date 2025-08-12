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
import { Tag } from '@coze-arch/coze-design';
import { type ColumnProps } from '@coze-arch/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getStatus } from '@/utils/time';

export const columnStatusConf: () => ColumnProps<PersonalAccessToken> = () => ({
  title: I18n.t('api_status_1'),
  dataIndex: 'id',
  width: 80,
  render: (_: string, record: PersonalAccessToken) => {
    const isActive = getStatus(record?.expire_at as number);
    return (
      <Tag size="small" color={isActive ? 'primary' : 'grey'}>
        {I18n.t(isActive ? 'api_status_active_1' : 'api_status_expired_1')}
      </Tag>
    );
  },
});

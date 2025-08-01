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
import { Button, Space } from '@coze-arch/coze-design';

import { PATInstructionWrap } from '@/components/instructions-wrap';

export const TopBody: FC<{
  openAddModal: () => void;
}> = ({ openAddModal }) => (
  <Space vertical spacing={20}>
    <Space className="w-full">
      <h3 className="flex-1 m-0">{I18n.t('auth_tab_pat')}</h3>
      <Button onClick={openAddModal} theme="solid" type="primary">
        {I18n.t('add_new_token_button_1')}
      </Button>
    </Space>
    <div className="w-full">
      <PATInstructionWrap
        onClick={() => {
          window.open(
            IS_OVERSEA
              ? // cp-disable-next-line
                'https://www.coze.com/open/docs/developer_guides/coze_api_overview'
              : // cp-disable-next-line
                'https://www.coze.cn/open/docs/developer_guides/coze_api_overview',
          );
        }}
      />
    </div>
  </Space>
);

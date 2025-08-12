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

import { useState } from 'react';

import { PatBody } from '@coze-studio/open-auth';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';

export const ApiBindButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <UIButton
        theme="borderless"
        onClick={() => {
          setVisible(true);
        }}
      >
        {I18n.t('bot_publish_action_configure')}
      </UIButton>
      <Modal
        size="xl"
        title={I18n.t('settings_api_authorization')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <PatBody size="small" type="primary" />
      </Modal>
    </>
  );
};

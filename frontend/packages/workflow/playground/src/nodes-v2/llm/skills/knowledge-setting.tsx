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

import { type FC, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';

import { type KnowledgeGlobalSetting } from './types';
import { TooltipAction } from './tooltip-action';
import { KnowledgeSettingFormModal } from './knowledge-setting-form-modal';

interface KnowledgeSettingProps {
  setting?: KnowledgeGlobalSetting;
  onChange?: (setting?: KnowledgeGlobalSetting) => void;
}

export const KnowledgeSetting: FC<KnowledgeSettingProps> = props => {
  const { setting, onChange } = props;
  const [visible, setVisible] = useState(false);

  const handleSubmit = (newSetting?: KnowledgeGlobalSetting) => {
    onChange?.(newSetting);
    setVisible(false);
  };

  return (
    <>
      <TooltipAction
        tooltip={I18n.t('plugin_bot_ide_plugin_setting_icon_tip')}
        icon={<IconCozSetting />}
        onClick={() => setVisible(true)}
      />
      <KnowledgeSettingFormModal
        visible={visible}
        setting={setting}
        onSubmit={handleSubmit}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

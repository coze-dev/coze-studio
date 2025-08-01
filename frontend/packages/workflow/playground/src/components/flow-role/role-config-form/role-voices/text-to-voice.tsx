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
import { Typography, Switch } from '@coze-arch/coze-design';

interface TextToVoiceProps {
  value?: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

export const TextToVoice: React.FC<TextToVoiceProps> = ({
  value,
  disabled,
  onChange,
}) => (
  <div className="flex items-center justify-between mb-[8px]">
    <div className="flex items-center gap-[4px]">
      <Typography.Text size="small">
        {I18n.t('workflow_role_config_text_2_voice')}
      </Typography.Text>
    </div>
    <Switch
      size="mini"
      checked={value}
      disabled={disabled}
      onChange={onChange}
    />
  </div>
);

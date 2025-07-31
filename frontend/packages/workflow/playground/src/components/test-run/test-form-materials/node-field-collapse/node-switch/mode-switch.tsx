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

import { useTestRunFormStore } from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';
import { Switch } from '@coze-arch/coze-design';

import css from './mode-switch.module.less';

export const ModeSwitch: React.FC<{
  disabled?: boolean;
}> = ({ disabled }) => {
  const { mode, patch } = useTestRunFormStore(s => ({
    mode: s.mode,
    patch: s.patch,
  }));

  const handleChange = (next: boolean) => {
    patch({ mode: next ? 'json' : 'form' });
  };

  return (
    <div className={css['mode-switch']}>
      {I18n.t('wf_testrun_form_mode_text')}
      <Switch
        size="mini"
        disabled={disabled}
        checked={mode === 'json'}
        onChange={handleChange}
      />
    </div>
  );
};

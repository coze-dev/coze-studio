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

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Switch, Tooltip } from '@coze-arch/coze-design';

import { useField, withField } from '@/form';

export const HistorySwitchField = withField(() => {
  const { name, value, onChange, readonly } = useField<boolean>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <Tooltip content={I18n.t('wf_chatflow_125')} position="right">
      <div className="flex items-center gap-1">
        <div className={'text-[12px]'}>{I18n.t('wf_chatflow_124')}</div>
        <Switch
          size="mini"
          checked={value}
          data-testid={getNodeSetterId(name)}
          onChange={checked => {
            onChange?.(checked);
          }}
          disabled={readonly}
        />
      </div>
    </Tooltip>
  );
});

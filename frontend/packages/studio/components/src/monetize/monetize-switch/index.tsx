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
import { Switch } from '@coze-arch/coze-design';

export function MonetizeSwitch({
  disabled,
  isOn,
  onChange,
}: {
  disabled: boolean;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}) {
  return (
    <div className="flex justify-between">
      <h3 className="m-0 text-[20px] font-medium coz-fg-plus">
        {I18n.t('premium_monetization_config')}
      </h3>
      <Switch
        disabled={disabled}
        className="ml-[5px]"
        size="small"
        checked={isOn}
        onChange={onChange}
      />
    </div>
  );
}

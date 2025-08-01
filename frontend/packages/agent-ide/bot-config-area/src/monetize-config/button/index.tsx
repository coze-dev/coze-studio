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

import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { useMonetizeConfigStore } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozWallet } from '@coze-arch/coze-design/icons';
import { Popover } from '@coze-arch/coze-design';

import { MonetizeConfigPanel } from '../panel';

const itemKey = Symbol.for('MonetizeConfigButton');

export function MonetizeConfigButton() {
  const isOn = useMonetizeConfigStore(store => store.isOn);

  return (
    <Popover
      trigger="click"
      autoAdjustOverflow={true}
      content={<MonetizeConfigPanel />}
    >
      <CollapsibleIconButton
        itemKey={itemKey}
        icon={<IconCozWallet className="text-[16px]" />}
        text={isOn ? I18n.t('monetization_on') : I18n.t('monetization_off')}
        color={isOn ? 'highlight' : 'secondary'}
      />
    </Popover>
  );
}

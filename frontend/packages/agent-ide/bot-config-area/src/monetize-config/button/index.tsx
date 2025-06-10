import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { useMonetizeConfigStore } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozWallet } from '@coze/coze-design/icons';
import { Popover } from '@coze/coze-design';

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

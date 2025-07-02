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

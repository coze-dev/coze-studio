import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Switch, Tooltip } from '@coze/coze-design';

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

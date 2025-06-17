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

import {
  useField,
  observer,
  type ObjectField,
} from '@coze-workflow/test-run/formily';
import { SuggestReplyInfoMode } from '@coze-arch/bot-api/workflow_api';
import { Switch } from '@coze/coze-design';

export const RoleSuggestionSwitch: React.FC = observer(() => {
  const field = useField<ObjectField>();
  const { value, disabled } = field;
  const status = value?.suggest_reply_mode;

  const handleChange = v => {
    const next = v ? SuggestReplyInfoMode.System : SuggestReplyInfoMode.Disable;

    field.setValue({
      suggest_reply_mode: next,
    });
  };

  return (
    <Switch
      size="mini"
      checked={
        status === SuggestReplyInfoMode.System ||
        status === SuggestReplyInfoMode.Custom
      }
      disabled={disabled}
      onChange={handleChange}
    />
  );
});

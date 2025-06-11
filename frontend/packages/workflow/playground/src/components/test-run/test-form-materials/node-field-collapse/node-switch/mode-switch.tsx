import { useTestRunFormStore } from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';
import { Switch } from '@coze/coze-design';

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

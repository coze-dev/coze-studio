import { I18n } from '@coze-arch/i18n';

import styles from './index.module.less';

export const tableEmpty = (useTool: boolean, selected: boolean) => (
  <div className={styles.empty}>
    {useTool
      ? selected
        ? I18n.t('shortcut_modal_skill_has_no_param_tip')
        : I18n.t('shortcut_modal_skill_select_button')
      : I18n.t('shortcut_modal_form_to_be_filled_up_tip')}
  </div>
);

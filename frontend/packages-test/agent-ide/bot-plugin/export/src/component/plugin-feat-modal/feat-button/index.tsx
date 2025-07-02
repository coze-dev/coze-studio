import { type FC } from 'react';

import cs from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';

import { usePluginFeatModal } from '..';

import styles from './index.module.less';

export const PluginFeatButton: FC<{
  className?: string;
}> = ({ className }) => {
  const { modal, open } = usePluginFeatModal();

  return (
    <div className={cs(styles.wrapper, className)}>
      {modal}
      <span className={styles.tip}>{I18n.t('plugin_feedback_entry_tip')}</span>
      <UIButton type="tertiary" onClick={open}>
        {I18n.t('plugin_feedback_entry_button')}
      </UIButton>
    </div>
  );
};

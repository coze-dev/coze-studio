import { I18n } from '@coze-arch/i18n';
import { IconCozeCross } from '@coze-arch/bot-icons';

import { useControlTips } from './use-control';
import { isMacOS } from './is-mac-os';

import styles from './index.module.less';

export const SubCanvasTips = () => {
  const { visible, close, closeForever } = useControlTips();

  if (!visible) {
    return null;
  }
  return (
    <div className={styles['sub-canvas-tips']}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.text}>
            {I18n.t('workflow_subcanvas_pull_out', {
              ctrl: isMacOS ? 'Cmd ⌘' : 'Ctrl',
            })}
          </p>
          <div
            className={styles.space}
            style={{
              width: I18n.language === 'zh-CN' ? 0 : 128,
            }}
          />
        </div>
        <div className={styles.actions}>
          <p className={styles.closeForever} onClick={closeForever}>
            {I18n.t('workflow_subcanvas_never_remind')}
          </p>
          <div className={styles.close} onClick={close}>
            <IconCozeCross color="coz-fg-plus" />
          </div>
        </div>
      </div>
    </div>
  );
};

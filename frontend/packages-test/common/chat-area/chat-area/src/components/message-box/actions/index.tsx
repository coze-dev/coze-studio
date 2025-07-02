import type { CSSProperties, ReactNode } from 'react';

import copy from 'copy-to-clipboard';
import { I18n } from '@coze-arch/i18n';
import { UIIconButton, UIToast } from '@coze-arch/bot-semi';
import { IconCopy } from '@coze-arch/bot-icons';

import { type Message } from '../../../store/types';

import styles from './index.module.less';

interface ActionButtonProps {
  style?: CSSProperties;
  icon: ReactNode;
  onClick: () => void;
}

export const Actions = ({ message }: { message: Message }) => {
  const menuConfigs: ActionButtonProps[] = [
    {
      icon: <IconCopy />,
      onClick: () => {
        const success = copy(message.content);
        if (success) {
          UIToast.success({
            content: I18n.t('card_builder_releaseBtn_releaseApp_copyTip'),
          });
        }
      },
    },
  ];
  // TODO: 加Trigger类型适配
  return (
    <div className={styles.actions}>
      {menuConfigs.map((prop, idx) => (
        <ActionButton key={idx} {...prop} />
      ))}
    </div>
  );
};

const ActionButton = ({ style, icon, onClick }: ActionButtonProps) => (
  <UIIconButton
    style={style}
    icon={icon}
    onClick={onClick}
    className={styles.button}
  />
);

/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  // TODO: Trigger type adaptation
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

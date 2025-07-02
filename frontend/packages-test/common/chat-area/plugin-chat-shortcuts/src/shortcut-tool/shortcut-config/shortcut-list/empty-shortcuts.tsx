import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';

import style from '../index.module.less';

export const EmptyShortcuts: FC = () => (
  <div className={style['shortcut-config-empty']}>
    {I18n.t('bot_ide_shortcut_intro')}
  </div>
);

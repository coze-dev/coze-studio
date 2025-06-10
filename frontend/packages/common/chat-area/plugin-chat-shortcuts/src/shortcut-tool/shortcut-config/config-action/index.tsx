import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Image } from '@coze-arch/bot-semi';

import style from '../index.module.less';
import shortcutTipEn from '../../../assets/shortcut-tip_en.png';
import shortcutTipCn from '../../../assets/shortcut-tip_cn.png';

export const ShortcutTips = () => (
  <div className={style['tip-content']}>
    <div style={{ marginBottom: '8px' }}>
      {I18n.t('bot_ide_shortcut_intro')}
    </div>
    <Image
      preview={false}
      width={416}
      src={IS_OVERSEA ? shortcutTipEn : shortcutTipCn}
    />
  </div>
);

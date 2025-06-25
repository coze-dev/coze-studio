import React, { type FC } from 'react';

import cl from 'classnames';
import { I18n } from '@coze-arch/i18n';

import s from './index.module.less';

export const ItemErrorTip: FC<{ withDescription?: boolean; tip?: string }> = ({
  withDescription = false,
  tip = I18n.t('plugin_empty'),
}) => (
  <div className={s['check-box']}>
    <span
      className={cl(
        'whitespace-nowrap',
        s['form-check-tip'],
        withDescription ? '!top-[16px]' : '!top-0',
        'errorDebugClassTag',
      )}
    >
      {tip}
    </span>
  </div>
);

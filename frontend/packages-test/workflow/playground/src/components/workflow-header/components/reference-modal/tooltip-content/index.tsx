import React from 'react';

import { I18n } from '@coze-arch/i18n';

import s from './styles.module.less';

export const TooltipContent = () => (
  <div className={s['tooltip-container']}>
    <div>{I18n.t('reference_graph_modal_title_info_hover_tip')}</div>
    <div className={s['canvas-container']}>
      <div className={s.cards}>
        <div className={s.a}>A</div>
        <div className={s['arrow-wrapper']}>
          <div className={s['arrow-line']}></div>
          <div className={s['arrow-head']}></div>
        </div>
        <div className={s.b}>B</div>
      </div>
      <div className={s['text-container']}>
        <div>
          {I18n.t('reference_graph_modal_title_info_hover_tip_explain')}
        </div>
      </div>
    </div>
  </div>
);

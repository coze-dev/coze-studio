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

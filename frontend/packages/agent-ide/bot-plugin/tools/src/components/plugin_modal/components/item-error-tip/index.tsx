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

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

import cls from 'classnames';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';

import styles from './page-selector.module.less';

/** There are two types that cannot be selected */
export enum DisabledType {
  /** An unexpected condition caused it not to execute, the result is empty */
  Empty,
  /** Stops beyond the length of the run-time variable itself, expected */
  Stop,
}

export const NavigateItemDisabled: React.FC<
  React.PropsWithChildren<{
    type: DisabledType;
    options?: Record<string, unknown>;
  }>
> = ({ type, options, children }) => (
  <Tooltip
    content={
      type === DisabledType.Stop
        ? I18n.t(
            'workflow_detail_testrun_panel_batch_naviagte_stop' as I18nKeysNoOptionsType,
            options,
          )
        : I18n.t('workflow_detail_testrun_panel_batch_naviagte_empty')
    }
  >
    <div
      className={cls(
        styles['paginate-item-disabled'],
        styles['flow-test-run-log-pagination-item'],
      )}
    >
      {children}
    </div>
  </Tooltip>
);

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

import classNames from 'classnames';
import { type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { I18n } from '@coze-arch/i18n';

import { TitleArea } from './title-area';

import styles from './index.module.less';

export interface SettingItemProps {
  title: string;
  tip?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tipStyle?: Record<string, string | number>;
}

export const SettingItem = ({
  title,
  tip,
  children,
  className,
  tipStyle,
}: SettingItemProps) => (
  <div className={classNames(styles['setting-item-container'], className)}>
    <TitleArea
      title={I18n.t(title as unknown as I18nKeysNoOptionsType)}
      tip={tip || ''}
      tipStyle={tipStyle}
    />
    <div
      className={classNames(
        styles['setting-item'],
        'dataset-setting-content-item',
      )}
    >
      {children}
    </div>
  </div>
);
